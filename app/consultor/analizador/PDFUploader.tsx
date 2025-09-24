// leancert-frontend/app/consultor/analizador/PDFUploader.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';

// --- Funciones de Ayuda (Helpers) ---
// (Estas funciones se mantienen igual)
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

  // Usamos useRef para el intervalo para evitar problemas con los re-renders
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatusMessage('Archivo seleccionado. Listo para analizar.');
    }
  };
  
  // NUEVA FUNCIÓN: Se encarga de detener el polling
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // NUEVA LÓGICA: useEffect para limpiar el intervalo si el componente se desmonta
  useEffect(() => {
    return () => {
      stopPolling(); // Limpia el intervalo al salir
    };
  }, []);

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

      if (uploadError) throw uploadError;

      setStatusMessage('Paso 2: Iniciando el procesamiento en segundo plano...');

      // Capturamos la respuesta de la función
      const { data, error: invokeError } = await supabase.functions.invoke<{operationName: string}>('batch-pdf-processor', {
        body: { supabasePath: filePath },
      });

      if (invokeError) {
        const details = await getInvokeErrorDetails(invokeError);
        throw new Error(`Error al invocar la función: ${details}`);
      }
      
      const operationName = data?.operationName;
      if (!operationName) {
        throw new Error('La función no devolvió un ID de operación.');
      }
      
      // NUEVA LÓGICA: Guardar el trabajo en nuestra tabla de base de datos
      const { data: jobData, error: jobError } = await supabase
        .from('doc_ai_jobs')
        .insert({
          operation_name: operationName,
          source_document_name: file.name,
        })
        .select('id')
        .single();
        
      if (jobError) throw new Error(`No se pudo registrar el trabajo en la BD: ${jobError.message}`);
      
      const jobId = jobData.id;

      // NUEVA LÓGICA: Iniciar el polling
      setStatusMessage('✅ ¡Éxito! El análisis ha comenzado. Verificando estado...');
      
      // 👇 dentro de handleUploadAndStartBatch(), donde creas el setInterval:
pollingIntervalRef.current = setInterval(async () => {
  try {
    const { data: statusData, error: statusError } =
      await supabase.functions.invoke<{ status: string; outputPrefix?: string }>(
        'check-doc-ai-job',
        {
          // 🔸 pasa también sourceDocumentName para que la edge pueda deducir el prefijo
          body: { operationName, jobId, sourceDocumentName: file.name },
        }
      );

    if (statusError) {
      setStatusMessage(`Error al verificar el estado: ${await getInvokeErrorDetails(statusError)}`);
      stopPolling();
      setIsLoading(false);
      return;
    }

    if (statusData?.status === 'COMPLETADO') {
      setStatusMessage('🎉 ¡Análisis completado! Los resultados han sido guardados.');
      stopPolling();
      setIsLoading(false);

      // 👇 AQUÍ va la ingesta de resultados a tu tabla (temas)
      const outputPrefix = statusData?.outputPrefix; // viene de check-doc-ai-job
      if (outputPrefix) {
        const { data: ingestData, error: ingestError } =
          await supabase.functions.invoke('ingest-doc-ai-output', {
            body: { jobId, outputPrefix },
          });

        if (ingestError) {
          setStatusMessage(`Error al ingerir resultados: ${await getInvokeErrorDetails(ingestError)}`);
        } else {
          setStatusMessage('✅ Resultados ingeridos y temas generados.');
        }
      }

    } else if (statusData?.status === 'FALLIDO') {
      setStatusMessage('❌ El análisis ha fallado durante el procesamiento.');
      stopPolling();
      setIsLoading(false);

    } else {
      setStatusMessage('⏳ El análisis está en progreso. Verificando de nuevo en 20 segundos...');
    }

  } catch (pollError) {
    setStatusMessage(`Error en el polling: ${getErrorMessage(pollError)}`);
    stopPolling();
    setIsLoading(false);
  }
}, 20000);
 // Preguntar cada 20 segundos

    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      console.error('Error en el proceso de inicio:', error);
      setStatusMessage(`Error: ${msg}`);
      setIsLoading(false); // Asegurarse de detener la carga en caso de error inicial
    }
    // No detenemos isLoading aquí, se mantiene activo durante el polling
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
          disabled={isLoading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {(isLoading || statusMessage) && (
        <div className="bg-gray-100 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">{statusMessage}</p>
          {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto mt-2"></div>}
        </div>
      )}

      {file && (
        <button 
          onClick={handleUploadAndStartBatch}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Procesando...' : 'Analizar Documento (Proceso en Lote)'}
        </button>
      )}
    </div>
  );
}