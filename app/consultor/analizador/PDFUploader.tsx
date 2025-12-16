
// leancert-frontend/app/consultor/analizador/PDFUploader.tsx
'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function PDFUploader() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [domains, setDomains] = useState<any[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };

  const processDocument = async () => {
    if (!file) return;
    setIsLoading(true);
    setStatusMessage('Compilando texto del documento...');

    try {
      // 1. Extract Text
      const text = await extractTextFromPDF(file);
      setStatusMessage('Analizando estructura y dominios temáticos...');

      // 2. Analyze Structure -> Get Domains
      const { data: domainData, error: domainError } = await supabase.functions.invoke('analyze-structure', {
        body: { text: text, docId: 'temp-' + Date.now() }
      });

      if (domainError) throw new Error(domainError.message);

      const extractedDomains = domainData?.domains || [];
      setDomains(extractedDomains);
      setStatusMessage(`Encontrados ${extractedDomains.length} dominios. Generando Matriz de Conocimiento...`);

      // 3. Generate Matrix for each Domain (Concurrent)
      let processed = 0;
      for (const domain of extractedDomains) {
        setStatusMessage(`Generando preguntas para: ${domain.name} (${processed + 1}/${extractedDomains.length})...`);

        const { error: genError } = await supabase.functions.invoke('generate-questions-matrix', {
          body: {
            domain_id: domain.id,
            domain_name: domain.name,
            context_text: text
          }
        });

        if (genError) console.error("Error generating matrix for domain:", domain.name, genError);
        processed++;
      }

      setStatusMessage('¡Proceso Completado! Redirigiendo a la Matriz...');
      setTimeout(() => {
        // Assuming we have a page to view the matrix. For now, maybe just refresh or show success.
        // router.push('/consultor/matrix'); 
        router.refresh();
        setStatusMessage('Listo.');
      }, 1000);

    } catch (error: any) {
      setStatusMessage(`Error: ${error.message}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Generador de Arquitectura Dinámica</h1>
      <p className="text-gray-600">Sube tu material educativo para generar automáticamente una matriz de competencias basada en la taxonomía de Anderson & Krathwohl.</p>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={isLoading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {(isLoading || statusMessage) && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800 font-medium">{statusMessage}</p>
          {isLoading && <div className="animate-pulse h-2 bg-blue-200 rounded mt-2"></div>}
        </div>
      )}

      {domains.length > 0 && !isLoading && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-bold text-green-800">Dominios Identificados:</h3>
          <ul className="list-disc pl-5 mt-2">
            {domains.map((d: any) => (
              <li key={d.id} className="text-green-700">{d.name}</li>
            ))}
          </ul>
        </div>
      )}

      {file && (
        <button
          onClick={processDocument}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          {isLoading ? 'Procesando...' : 'Iniciar Análisis y Generación'}
        </button>
      )}
    </div>
  );
}