// leancert-frontend/app/consultor/analizador/PDFUploader.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);
  const isCheckingRef = useRef(false);

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFile = event.target.files?.[0];
  if (selectedFile) {
    const isPdfMime = selectedFile.type === 'application/pdf';
    const isPdfExt = /\.pdf$/i.test(selectedFile.name);
    if (!isPdfMime && !isPdfExt) {
      setStatusMessage('Por favor selecciona un archivo PDF (.pdf).');
      return;
    }
    const MAX_MB = 25;
    if (selectedFile.size > MAX_MB * 1024 * 1024) {
      setStatusMessage(`El PDF supera ${MAX_MB} MB.`);
      return;
    }
    stopPolling(); // cortar polling previo
    setFile(selectedFile);
    setStatusMessage('Archivo seleccionado. Listo para analizar.');
  }
};
  

  // NUEVA LÓGICA: useEffect para limpiar el intervalo si el componente se desmonta
  useEffect(() => {
  isMountedRef.current = true;
  return () => {
    stopPolling();
    isMountedRef.current = false;
  };
}, []);

  const handleUploadAndStartBatch = async () => {
    if (!file) {
      alert('Por favor, selecciona un archivo PDF primero.');
      return;
    }
    const isPdfMime = file.type === 'application/pdf';
const isPdfExt = /\.pdf$/i.test(file.name);
if (!isPdfMime && !isPdfExt) {
  setStatusMessage('El archivo seleccionado no es un PDF válido.');
  return;
}

// (opcional) verificación de firma mágica "%PDF-"
try {
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  const header = new TextDecoder().decode(head);
  if (!header.startsWith('%PDF-')) {
    setStatusMessage('El archivo no parece ser un PDF válido (firma inválida).');
    return;
  }
} catch {
  setStatusMessage('No se pudo validar el PDF.');
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

// Evita intervalos duplicados si el usuario da 2 clics por accidente
stopPolling();

pollingIntervalRef.current = setInterval(async () => {
  if (isCheckingRef.current) return;
  isCheckingRef.current = true;

  try {
    const { data: statusData, error: statusError } =
      await supabase.functions.invoke<{ status: string; outputPrefix?: string }>(
        'check-doc-ai-job',
        { body: { operationName, jobId, sourceDocumentName: file.name } }
      );

    if (statusError) {
      if (isMountedRef.current) {
        setStatusMessage(`Error al verificar el estado: ${await getInvokeErrorDetails(statusError)}`);
        setIsLoading(false);
      }
      stopPolling();
      return;
    }

    if (statusData?.status === 'COMPLETADO') {
      if (isMountedRef.current) {
        setStatusMessage('🎉 ¡Análisis completado! Los resultados han sido guardados.');
        setIsLoading(false);
      }
      stopPolling();

      const outputPrefix = statusData?.outputPrefix;
      if (outputPrefix) {
        // 3) Ingesta de tópicos/temas
        const { data: ingestData, error: ingestError } =
  await supabase.functions.invoke('ingest-doc-ai-output', {
    body: { jobId, outputPrefix },
  });

if (ingestError) {
  console.error('INGEST_ERR_OBJECT:', ingestError);                  // 👈 objeto error del SDK
  const details = await getInvokeErrorDetails(ingestError);         // 👈 cuerpo de la Edge (texto/JSON)
  console.error('INGEST_ERR_BODY:', details);                       // 👈 el “porqué” real
  setStatusMessage(`Error al ingerir resultados: ${details}`);
  return;
}

console.log('INGEST_OK:', ingestData);

        if (isMountedRef.current) {
          setStatusMessage('✅ Resultados ingeridos y temas generados.');
        }

        // 4) Generar 20 preguntas
        const { data: jobRow } = await supabase
          .from('doc_ai_jobs')
          .select('result_topics')
          .eq('id', jobId)
          .single();

        const topics = jobRow?.result_topics ?? null;

        const { data: genData, error: genErr } = await supabase.functions.invoke(
  'generate-questions-from-output',
  { body: { jobId, outputPrefix, sourceDocumentName: file.name, topics } }
);

if (genErr) {
  console.error('GEN_ERR_OBJECT:', genErr);                         // 👈 objeto error del SDK
  const details = await getInvokeErrorDetails(genErr);              // 👈 cuerpo devuelto por la Edge
  console.error('GEN_ERR_BODY:', details);
  setStatusMessage(`Preguntas: error al generar – ${details}`);
} else {
  console.log('GEN_OK:', genData);
  setStatusMessage('📝 20 preguntas generadas. Puedes revisarlas y asignar categoría.');
  router.push(`/consultor/analizador/review/${jobId}`);
}

        }
      }

     else if (statusData?.status === 'FALLIDO') {
      if (isMountedRef.current) {
        setStatusMessage('❌ El análisis ha fallado durante el procesamiento.');
        setIsLoading(false);
      }
      stopPolling();

    } else {
      if (isMountedRef.current) {
        setStatusMessage('⏳ El análisis está en progreso. Verificando de nuevo en 20 segundos...');
      }
    }
  } catch (pollError) {
    if (isMountedRef.current) {
      setStatusMessage(`Error en el polling: ${getErrorMessage(pollError)}`);
      setIsLoading(false);
    }
    stopPolling();
  } finally {
    // 🔒 Siempre libera el lock del ciclo, pase lo que pase
    isCheckingRef.current = false;
  }
}, 20000);



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
          accept="application/pdf,.pdf"
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