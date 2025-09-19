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
  
  const startAnalysisProcess = async () => {
    if (!file) {
      alert("Por favor, selecciona un archivo PDF primero.");
      return;
    }
    
    setIsLoading(true);
    setStatusMessage('Paso 1/3: Subiendo archivo a Supabase Storage...');

    try {
      // --- LÓGICA NUEVA: SUBIR A STORAGE ---
      const filePath = `public/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documentos-pdf') // El nombre de tu bucket
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setStatusMessage('Paso 2/3: Archivo subido. Enviando a la IA para análisis...');

      // Obtenemos la URL pública del archivo
      const { data: { publicUrl } } = supabase.storage
        .from('documentos-pdf')
        .getPublicUrl(filePath);

      // --- FIN LÓGICA NUEVA ---

      // Invocamos la función con la URL
      const { data, error: invokeError } = await supabase.functions.invoke('pdf-analyzer', {
        body: { fileUrl: publicUrl, mode: 'analyze' },
      });
      
      if (invokeError) throw invokeError;

      setInitialTopics(data.temas);
      setStatusMessage('Paso 3/3: Temas detectados. Ahora puedes generar preguntas.');

    } catch (error) {
      const typedError = error as { message: string };
      console.error('Error en el proceso:', typedError);
      setStatusMessage(`Error: ${typedError.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestionsProcess = async () => {
    if (!file) return;
    setIsLoading(true);
    setStatusMessage('Enviando temas a la IA para generar preguntas...');

    // (La lógica para generar preguntas no necesita el archivo, solo los temas,
    // pero la función backend espera el archivo, así que lo mantenemos simple por ahora
    // y seguimos el mismo flujo)
    // En una futura optimización, podríamos crear un endpoint que solo reciba temas.

    // Re-usamos el flujo de subida para mantener la consistencia
     const filePath = `public/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('documentos-pdf').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('documentos-pdf').getPublicUrl(filePath);

      const { data, error: invokeError } = await supabase.functions.invoke('pdf-analyzer', {
        body: { 
            fileUrl: publicUrl, 
            mode: 'generate_questions',
            validated_topics: JSON.stringify(initialTopics)
        },
      });

      if (invokeError) throw invokeError;
      
      setGeneratedQuestions(data.preguntas);
      setStatusMessage('Preguntas generadas. Listas para guardar en Supabase.');
      setIsLoading(false);
  };


  const saveQuestionsToSupabase = async () => { /* ... esta función no cambia ... */ };

  return (
    <div className="space-y-6">
       {/* El JSX para el botón de analizar temas ahora llama a startAnalysisProcess */}
       {file && initialTopics.length === 0 && !isLoading && (
        <button 
          onClick={startAnalysisProcess}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          Analizar Temas del PDF
        </button>
      )}

      {/* El JSX para generar preguntas ahora llama a generateQuestionsProcess */}
      {initialTopics.length > 0 && generatedQuestions.length === 0 && !isLoading && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Temas Detectados</h2>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {initialTopics.map(topic => <li key={topic}>{topic}</li>)}
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