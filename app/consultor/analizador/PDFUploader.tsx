// leancert-frontend/app/consultor/analizador/PDFUploader.tsx

'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Database } from '@/types/supabase';

type MasterQuestionInsert = Database['public']['Tables']['master_questions']['Insert'];

interface GeneratedQuestion {
  pregunta: string;
  opciones: string[];
  respuesta_correcta: string;
}

export default function PDFUploader() {
  const supabase = getSupabaseBrowserClient();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  const [initialTopics, setInitialTopics] = useState<string[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatusMessage('Archivo seleccionado. Listo para analizar.');
      setInitialTopics([]);
      setGeneratedQuestions([]);
    }
  };
  
  const callPdfAnalyzer = async (mode: 'analyze' | 'generate_questions') => {
    if (!file) {
      alert("Por favor, selecciona un archivo PDF primero.");
      return;
    }
    
    setIsLoading(true);
    setStatusMessage(`Enviando archivo a la IA (${mode})... Esto puede tardar hasta un minuto.`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);

    if (mode === 'generate_questions') {
      formData.append('validated_topics', JSON.stringify(initialTopics));
    }

    try {
      const { data, error } = await supabase.functions.invoke('pdf-analyzer', {
        body: formData,
      });

      if (error) throw error;

      if (mode === 'analyze') {
        setInitialTopics(data.temas);
        setStatusMessage('Temas detectados. Ahora puedes generar preguntas.');
      }
      if (mode === 'generate_questions') {
        setGeneratedQuestions(data.preguntas);
        setStatusMessage('Preguntas generadas. Listas para guardar en Supabase.');
      }
      
    } catch (error) {
      const typedError = error as { message: string };
      console.error('Error al invocar la función:', typedError);
      setStatusMessage(`Error: ${typedError.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveQuestionsToSupabase = async () => {
    if (generatedQuestions.length === 0) return;
    setIsLoading(true);
    setStatusMessage('Guardando preguntas en Supabase...');
    
    const questionsToInsert: MasterQuestionInsert[] = generatedQuestions.map(q => ({
        id: crypto.randomUUID(),
        category: 'PDF Generado',
        subcategory: file?.name.slice(0, 50) || 'desconocido',
        question_data: {
            prompt: q.pregunta,
            options: q.opciones.map((opt: string, index: number) => ({ id: index + 1, text: opt })),
            answer_key: { correct_option_id: q.opciones.findIndex((opt: string) => opt === q.respuesta_correcta) + 1 }
        }
    }));

    const { error } = await supabase.from('master_questions').insert(questionsToInsert);

    if (error) {
        setStatusMessage("Error al guardar las preguntas: " + error.message);
    } else {
        setStatusMessage("¡Éxito! Las preguntas fueron guardadas en la tabla 'master_questions'.");
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analizador de PDF con IA (con OCR)</h1>
      
      {/* --- PASO 1: SUBIR ARCHIVO --- */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Paso 1: Sube cualquier documento PDF</label>
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileChange} 
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* --- Muestra de estado general --- */}
      {(isLoading || statusMessage) && 
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">{statusMessage}</p>
            {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto mt-2"></div>}
          </div>
      }
      
      {/* --- PASO 2: ANALIZAR TEMAS --- */}
      {file && initialTopics.length === 0 && !isLoading && (
        <button 
          onClick={() => callPdfAnalyzer('analyze')}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          Analizar Temas del PDF
        </button>
      )}
      
      {/* --- PASO 3: GENERAR PREGUNTAS --- */}
      {initialTopics.length > 0 && generatedQuestions.length === 0 && !isLoading && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Temas Detectados</h2>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {initialTopics.map(topic => <li key={topic}>{topic}</li>)}
            </ul>
          </div>
          <button 
            onClick={() => callPdfAnalyzer('generate_questions')}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Generar Preguntas de estos Temas
          </button>
        </div>
      )}
      
      {/* --- PASO 4: MOSTRAR Y GUARDAR PREGUNTAS --- */}
      {generatedQuestions.length > 0 && !isLoading && (
         <div className="space-y-4">
          <h2 className="text-xl font-semibold">Preguntas Generadas</h2>
          <div className="space-y-4">
            {generatedQuestions.map((q, index) => (
              <div key={index} className="bg-white p-4 border border-gray-200 rounded-lg">
                <p className="font-bold mb-2 text-gray-800">{index + 1}. {q.pregunta}</p>
                <ul className="space-y-1">
                  {q.opciones.map((opt) => (
                    <li key={opt} className={`pl-4 py-1 rounded text-sm ${opt === q.respuesta_correcta ? 'bg-green-100 text-green-800' : 'text-gray-600'}`}>
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