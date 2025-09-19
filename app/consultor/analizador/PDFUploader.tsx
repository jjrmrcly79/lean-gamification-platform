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
      // Limpiamos los resultados anteriores
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
    setStatusMessage(`Enviando archivo a la IA (${mode})... Esto puede tardar un poco.`);

    // Creamos un FormData para enviar el archivo
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);

    if (mode === 'generate_questions') {
      formData.append('validated_topics', JSON.stringify(initialTopics));
    }

    try {
      const { data, error } = await supabase.functions.invoke('pdf-analyzer', {
        body: formData, // Enviamos el archivo directamente
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
    // ... (Esta función se queda exactamente igual que antes)
  };

  return (
     <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analizador de PDF con IA (con OCR)</h1>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Paso 1: Sube cualquier documento PDF (texto o escaneado)</label>
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileChange} 
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file-border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      {/* ... (El resto del JSX se queda exactamente igual que antes) ... */}
    </div>
  );
}