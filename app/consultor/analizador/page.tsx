// leancert-frontend/app/consultor/analizador/page.tsx

'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import type { Database } from '@/types/supabase';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// Usamos el tipo Insert directamente de tu archivo supabase.ts
type MasterQuestionInsert = Database['public']['Tables']['master_questions']['Insert'];

export default function PdfAnalyzerPage() {
  const supabase = getSupabaseBrowserClient();
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  const [initialTopics, setInitialTopics] = useState<string[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  
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
  
  const callPdfAnalyzer = async (mode: 'analyze' | 'generate_questions', extra_data = {}) => {
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
    } catch (error: any) {
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveQuestionsToSupabase = async () => {
    if (generatedQuestions.length === 0) return;
    setIsLoading(true);
    setStatusMessage('Guardando preguntas en Supabase...');
    
    // Mapeamos las preguntas al tipo 'Insert' que nos exige el archivo de tipos
    const questionsToInsert: MasterQuestionInsert[] = generatedQuestions.map(q => ({
        // --- LA SOLUCIÓN: Añadimos un ID temporal para satisfacer a TypeScript ---
        id: crypto.randomUUID(), // La base de datos lo reemplazará por el real.
        
        category: 'PDF Generado',
        subcategory: file?.name.slice(0, 50) || 'desconocido',
        question_data: {
            prompt: q.pregunta,
            options: q.opciones.map((opt: string, index: number) => ({ id: index + 1, text: opt })),
            answer_key: { correct_option_id: q.opciones.findIndex((opt: string) => opt === q.respuesta_correcta) + 1 }
        }
    }));

    // Ya no necesitamos 'as any' porque el objeto ahora tiene la forma correcta
    const { error } = await supabase.from('master_questions').insert(questionsToInsert);

    if (error) {
        setStatusMessage("Error al guardar las preguntas: " + error.message);
    } else {
        setStatusMessage("¡Éxito! Las preguntas fueron guardadas en la tabla 'master_questions'.");
    }
    setIsLoading(false);
  };

  // El JSX se mantiene igual
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* ... El mismo JSX que ya tenías ... */}
    </div>
  );
}