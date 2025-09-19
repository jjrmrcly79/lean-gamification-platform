// leancert-frontend/app/consultor/analizador/page.tsx

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic'; // --- PASO 1: Importar 'dynamic'
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import type { Database } from '@/types/supabase';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

type MasterQuestionInsert = Database['public']['Tables']['master_questions']['Insert'];

interface GeneratedQuestion {
  pregunta: string;
  opciones: string[];
  respuesta_correcta: string;
}

interface AnalyzerExtraData {
  validated_topics?: string[];
}

function PdfAnalyzerPage() { // Renombramos el componente para usarlo adentro
  const supabase = getSupabaseBrowserClient();
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  const [initialTopics, setInitialTopics] = useState<string[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTextContent('');
      setInitialTopics([]);
      setGeneratedQuestions([]);
      extractTextFromFile(selectedFile);
    }
  };

  const extractTextFromFile = async (fileToProcess: File) => {
    setIsLoading(true);
    setStatusMessage('Extrayendo texto del PDF...');
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);
            const pdf = await pdfjs.getDocument(typedArray).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const text = await page.getTextContent();
                fullText += text.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
            }
            setTextContent(fullText);
            setStatusMessage('Texto extraído con éxito. Listo para analizar.');
        } catch (error) {
            console.error('Error al extraer texto del PDF:', error);
            setStatusMessage('Error al leer el PDF.');
        } finally {
          setIsLoading(false);
        }
    };
    reader.readAsArrayBuffer(fileToProcess);
  };
  
  const callPdfAnalyzer = async (mode: 'analyze' | 'generate_questions', extra_data: AnalyzerExtraData = {}) => {
    if (!textContent) return;
    setIsLoading(true);
    setStatusMessage(`Iniciando modo: ${mode}...`);
    try {
      const { data, error } = await supabase.functions.invoke('pdf-analyzer', {
        body: { mode, text_content: textContent, ...extra_data },
      });
      if (error) throw error;
      if (mode === 'analyze') setInitialTopics(data.temas);
      if (mode === 'generate_questions') setGeneratedQuestions(data.preguntas);
    } catch (error) {
      const typedError = error as { message: string };
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
    <div className="p-8 max-w-4xl mx-auto">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analizador de PDF con IA</h1>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Paso 1: Sube un documento PDF</label>
          <input 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange} 
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        {(isLoading || statusMessage) && 
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p>{statusMessage}</p>
              {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto mt-2"></div>}
            </div>
        }
        {textContent && !isLoading && (
          <div className="space-y-4">
            {initialTopics.length === 0 && (
              <button onClick={() => callPdfAnalyzer('analyze')} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50" disabled={isLoading}>
                Analizar Temas del PDF
              </button>
            )}
            {initialTopics.length > 0 && generatedQuestions.length === 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Temas Detectados</h2>
                <ul className="list-disc list-inside bg-gray-800 p-4 rounded-lg">
                  {initialTopics.map(topic => <li key={topic}>{topic}</li>)}
                </ul>
                <button onClick={() => callPdfAnalyzer('generate_questions', { validated_topics: initialTopics })} className="w-full bg-green-600 text-white px-4 py-2 rounded-lg mt-4 hover:bg-green-700 transition-colors disabled:opacity-50" disabled={isLoading}>
                  Generar Preguntas de estos Temas
                </button>
              </div>
            )}
          </div>
        )}
        {generatedQuestions.length > 0 && (
           <div className="space-y-4">
            <h2 className="text-xl font-semibold">Preguntas Generadas</h2>
            <div className="space-y-4">
              {generatedQuestions.map((q, index) => (
                <div key={index} className="bg-gray-800 p-4 border border-gray-700 rounded-lg">
                  <p className="font-bold mb-2">{index + 1}. {q.pregunta}</p>
                  <ul className="space-y-1">
                    {q.opciones.map((opt) => (
                      <li key={opt} className={`pl-4 py-1 rounded ${opt === q.respuesta_correcta ? 'bg-green-900' : ''}`}>
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <button onClick={saveQuestionsToSupabase} className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50" disabled={isLoading}>
              Guardar Preguntas en Supabase
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- PASO 2: Exportar el componente de forma dinámica y deshabilitar el renderizado en servidor (SSR) ---
export default dynamic(() => Promise.resolve(PdfAnalyzerPage), {
  ssr: false,
});