// leancert-frontend/app/consultor/analizador/PDFUploader.tsx
'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';

// --- Funciones de Ayuda (Helpers) ---

function getErrorMessage(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === 'string') return m;
  }
  try { return JSON.stringify(e); } catch { return String(e); }
}

async function getInvokeErrorDetails(err: unknown): Promise<string> {
  type MaybeInvokeError = { message?: unknown; context?: { response?: Response } };
  if (typeof err === 'object' && err !== null) {
    const e = err as MaybeInvokeError;
    const msg = typeof e.message === 'string' ? e.message : undefined;
    const resp = e.context?.response;
    if (resp) {
      try {
        const text = await resp.text();
        return text || msg || 'Edge Function error';
      } catch {
        return msg || 'Edge Function error';
      }
    }
    if (msg) return msg;
  }
  try { return JSON.stringify(err); } catch { return String(err); }
}


// --- Componente Principal ---

export default function PDFUploader() {
  const supabase = getSupabaseBrowserClient();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatusMessage('Archivo seleccionado. Listo para analizar.');
    }
  };

  const handleUploadAndStartBatch = async () => {
    if (!file) {
      alert('Por favor, selecciona un archivo PDF primero.');
      return;
    }
    const { data: s } = await supabase.auth.getSession();
    if (!s.session) {
      setStatusMessage('Debes iniciar sesión para analizar.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Paso 1: Subiendo el documento completo...');

    try {
      const filePath = `batch-uploads/${s.session.user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documentos-pdf')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Error al subir el archivo: ${uploadError.message}`);
      }

      setStatusMessage('Paso 2: Iniciando el procesamiento en segundo plano...');

      const { error: invokeError } = await supabase.functions.invoke('batch-pdf-processor', {
        body: { supabasePath: filePath },
      });

      if (invokeError) {
        const details = await getInvokeErrorDetails(invokeError);
        throw new Error(`Error al invocar la función: ${details}`);
      }
      
      setStatusMessage(`✅ ¡Éxito! El análisis ha comenzado. Este proceso puede tardar varios minutos y se ejecuta en segundo plano. Te notificaremos cuando esté listo.`);

    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      console.error('Error en el proceso de inicio:', error);
      setStatusMessage(`Error: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // El JSX que renderiza el componente
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

      {file && !isLoading && (
        <button 
          onClick={handleUploadAndStartBatch}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          Analizar Documento (Proceso en Lote)
        </button>
      )}

      {/* Los botones para generar y guardar preguntas han sido removidos 
          porque ahora el proceso es asíncrono. Los implementaremos 
          de nuevo cuando tengamos los resultados. */}
    </div>
  );
}