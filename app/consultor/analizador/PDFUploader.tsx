// leancert-frontend/app/consultor/analizador/PDFUploader.tsx
'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Database } from '@/types/supabase';

type MasterQuestionInsert = Database['public']['Tables']['master_questions']['Insert'];
type TemaGeneradoInsert   = Database['public']['Tables']['temas_generados']['Insert'];

interface GeneratedQuestion {
  pregunta: string;
  opciones: string[];
  respuesta_correcta: string;
}

/** Helper para errores tipados sin any */
function getErrorMessage(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === 'string') return m;
  }
  try { return JSON.stringify(e); } catch { return String(e); }
}

export default function PDFUploader() {
  const supabase = getSupabaseBrowserClient();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);

  const [initialTopics, setInitialTopics] = useState<string[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatusMessage('Archivo seleccionado. Listo para analizar.');
      setInitialTopics([]);
      setGeneratedQuestions([]);
      setUploadedPath(null);
    }
  };

  const saveTopicsToDatabase = async (topics: string[], documentName: string) => {
    if (topics.length === 0) return;

    const { data: s } = await supabase.auth.getSession();
    if (!s.session) {
      setStatusMessage('Debes iniciar sesión para guardar temas.');
      return;
    }

    const newTopicEntry: TemaGeneradoInsert = {
      temas: topics,
      documento_origen: documentName
    };

    const { error } = await supabase.from('temas_generados').insert(newTopicEntry);
    if (error) {
      setStatusMessage(`Error al guardar temas: ${error.message}. Puedes continuar.`);
      console.error('Error saving topics:', error);
    }
  };

  const startAnalysisProcess = async () => {
    if (!file) {
      alert('Por favor, selecciona un archivo PDF primero.');
      return;
    }

    const { data: s } = await supabase.auth.getSession();
    if (!s.session) {
      setStatusMessage('Debes iniciar sesión para analizar y subir el PDF.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Paso 1/3: Subiendo archivo a Supabase Storage...');

    try {
      const filePath = `public/${Date.now()}-${file.name}`;
      setUploadedPath(filePath);

      const { error: uploadError } = await supabase.storage
        .from('documentos-pdf')
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      setStatusMessage('Paso 2/3: Archivo subido. Enviando a la IA para análisis...');

      const { data: pub } = supabase.storage
        .from('documentos-pdf')
        .getPublicUrl(filePath);
      const publicUrl = pub.publicUrl;
      if (!publicUrl) throw new Error('No se pudo obtener la URL pública del PDF.');

      const { data, error: invokeError } = await supabase.functions.invoke('pdf-analyzer', {
        body: { fileUrl: publicUrl, mode: 'analyze' },
      });
      if (invokeError) throw invokeError;

      await saveTopicsToDatabase(data.temas, file.name);
      setInitialTopics(data.temas);
      setStatusMessage('Paso 3/3: Temas detectados y guardados. Ahora puedes generar preguntas.');
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      console.error('Error en el proceso:', error);
      setStatusMessage(`Error: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestionsProcess = async () => {
    if (!file || initialTopics.length === 0) return;

    const { data: s } = await supabase.auth.getSession();
    if (!s.session) {
      setStatusMessage('Debes iniciar sesión para generar preguntas.');
      return;
    }

    if (!uploadedPath) {
      setStatusMessage('No encuentro el archivo subido. Vuelve a analizar el PDF antes de generar preguntas.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Enviando temas a la IA para generar preguntas...');

    try {
      const { data: pub } = supabase.storage
        .from('documentos-pdf')
        .getPublicUrl(uploadedPath);
      const publicUrl = pub.publicUrl;
      if (!publicUrl) throw new Error('No se pudo obtener la URL pública del PDF.');

      const { data, error: invokeError } = await supabase.functions.invoke('pdf-analyzer', {
        body: {
          fileUrl: publicUrl,
          mode: 'generate_questions',
          // Si tu function acepta array, puedes pasar initialTopics directo:
          // validated_topics: initialTopics,
          validated_topics: JSON.stringify(initialTopics),
        },
      });
      if (invokeError) throw invokeError;

      setGeneratedQuestions(data.preguntas ?? []);
      setStatusMessage('Preguntas generadas. Listas para guardar en Supabase.');
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      console.error('Error generando preguntas:', err);
      setStatusMessage(`Error al generar preguntas: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveQuestionsToSupabase = async () => {
    if (generatedQuestions.length === 0) return;

    const { data: s } = await supabase.auth.getSession();
    if (!s.session) {
      setStatusMessage('Debes iniciar sesión para guardar preguntas.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Guardando preguntas en Supabase...');

    try {
      const questionsToInsert: MasterQuestionInsert[] = generatedQuestions.map((q) => ({
        id: crypto.randomUUID(),
        category: 'PDF Generado',
        subcategory: file?.name.slice(0, 50) || 'desconocido',
        question_data: {
          prompt: q.pregunta,
          options: q.opciones.map((opt: string, index: number) => ({ id: index + 1, text: opt })),
          answer_key: { correct_option_id: q.opciones.findIndex((opt) => opt === q.respuesta_correcta) + 1 },
        },
      }));

      const { error } = await supabase.from('master_questions').insert(questionsToInsert);
      if (error) throw error;

      setStatusMessage("¡Éxito! Las preguntas fueron guardadas en la tabla 'master_questions'.");
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setStatusMessage('Error al guardar las preguntas: ' + msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analizador de PDF con IA (con OCR)</h1>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paso 1: Sube cualquier documento PDF
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {(isLoading || statusMessage) && (
        <div className="bg-gray-100 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">{statusMessage}</p>
          {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto mt-2"></div>}
        </div>
      )}

      {file && initialTopics.length === 0 && !isLoading && (
        <button
          onClick={startAnalysisProcess}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          Analizar y Guardar Temas del PDF
        </button>
      )}

      {initialTopics.length > 0 && generatedQuestions.length === 0 && !isLoading && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Temas Detectados y Guardados</h2>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {initialTopics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={generateQuestionsProcess}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Generar Preguntas de estos Temas
          </button>
        </div>
      )}

      {generatedQuestions.length > 0 && !isLoading && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Preguntas Generadas</h2>
          <div className="space-y-4">
            {generatedQuestions.map((q, index) => (
              <div key={index} className="bg-white p-4 border border-gray-200 rounded-lg">
                <p className="font-bold mb-2 text-gray-800">
                  {index + 1}. {q.pregunta}
                </p>
                <ul className="space-y-1">
                  {q.opciones.map((opt) => (
                    <li
                      key={opt}
                      className={`pl-4 py-1 rounded text-sm ${
                        opt === q.respuesta_correcta ? 'bg-green-100 text-green-800' : 'text-gray-600'
                      }`}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <button
            onClick={saveQuestionsToSupabase}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            Guardar Preguntas en Supabase
          </button>
        </div>
      )}
    </div>
  );
}
