/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';

// --------- Tipos ----------
type StagingRow = {
  id: string;
  job_id: number;
  source_document_name: string | null;
  topic_tags: unknown | null;
  category: string | null;
  subcategory: string | null;
  question: {
    prompt: string;
    type: 'multiple_choice' | 'true_false' | 'short_answer' | string;
    options?: string[] | null;
    answer?: string | null;
    explanation?: string | null;
    tags?: string[] | null;
  };
  status: 'draft' | 'approved' | 'rejected' | string;
  created_at: string;
};

type StagingUpdate = Partial<Pick<StagingRow, 'category' | 'subcategory' | 'status'>>;

type JobRow = {
  id: number;
  output_prefix: string | null;
  source_document_name: string | null;
  result_topics: { term: string; count: number }[] | null;
};

// nombre de tabla
const STAGING = 'staging_generated_questions' as const;

export default function ReviewPage() {
  const supabase = getSupabaseBrowserClient();
  const params = useParams<{ jobId: string }>();
  const jobId = Number(params.jobId);

  const [rows, setRows] = useState<StagingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<string>('');

  const [job, setJob] = useState<JobRow | null>(null);
  const [genLoading, setGenLoading] = useState(false);

  const approvedCount = useMemo(
    () => rows.filter(r => r.status === 'approved').length,
    [rows]
  );

  // ---- CARGA JOB + STAGING ----
  const loadAll = useCallback(async () => {
    setLoading(true);
    setMessage('');

    // 1) Job
    const { data: jobData, error: jobErr } = await (supabase as any)
      .from('doc_ai_jobs')
      .select('id, output_prefix, source_document_name, result_topics')
      .eq('id', jobId)
      .single();

    if (jobErr) {
      console.error(jobErr);
      setMessage(`Error cargando job: ${jobErr.message}`);
      setLoading(false);
      return;
    }
    setJob(jobData as JobRow);

    // 2) Staging
    const { data, error } = await (supabase as any)
      .from(STAGING)
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(error);
      setMessage(`Error cargando preguntas: ${error.message}`);
    } else {
      setRows(((data ?? []) as unknown) as StagingRow[]);
    }
    setLoading(false);
  }, [jobId, supabase]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await loadAll();
    })();
    return () => { mounted = false; };
  }, [loadAll]);

  // ---- Generar preguntas (si staging está vacío) ----
  const generateQuestions = async () => {
    if (!job) {
      setMessage('Job no cargado.');
      return;
    }
    const outputPrefix = job.output_prefix;
    const sourceDocumentName = job.source_document_name;

    if (!outputPrefix || !sourceDocumentName) {
      setMessage('El job no tiene output_prefix o source_document_name.');
      return;
    }

    setGenLoading(true);
    setMessage('Generando preguntas con IA…');

    const { data, error } = await supabase.functions.invoke(
      'generate-questions-from-output',
      {
        body: {
          jobId,
          outputPrefix,
          sourceDocumentName,
          topics: job.result_topics ?? null, // opcional
        }
      }
    );

    if (error) {
      console.error(error);
      let details = '';
      try {
        const resp = (error as unknown as { context?: { response?: Response } })?.context?.response;
        if (resp && typeof resp.text === 'function') {
          details = await resp.text();
        }
      } catch { /* noop */ }
      setMessage(`Error generando preguntas: ${details || (error as { message?: string }).message || 'Desconocido'}`);
    } else {
      setMessage('Preguntas generadas. Refrescando…');
      // recargar staging
      const { data: refreshed, error: refErr } = await (supabase as any)
        .from(STAGING)
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: true });

      if (refErr) {
        console.error(refErr);
        setMessage(`Error refrescando: ${refErr.message}`);
      } else {
        setRows(((refreshed ?? []) as unknown) as StagingRow[]);
        setMessage(`Listo. Generadas: ${(data as any)?.inserted ?? 'OK'}`);
      }
    }
    setGenLoading(false);
    setTimeout(() => setMessage(''), 2500);
  };

  // ---- Helpers de edición ----
  const setRowLocal = (id: string, patch: Partial<StagingRow>) =>
    setRows(prev => prev.map(r => (r.id === id ? { ...r, ...patch } as StagingRow : r)));

  const saveRow = async (id: string, patch: StagingUpdate) => {
    try {
      setSavingIds(s => ({ ...s, [id]: true }));
      setRowLocal(id, patch); // actualización optimista

      const { error } = await (supabase as any)
        .from(STAGING)
        .update(patch as unknown)
        .eq('id', id);

      if (error) {
        console.error(error);
        setMessage(`Error al guardar: ${error.message}`);
      } else {
        setMessage('Guardado.');
      }
    } finally {
      setSavingIds(s => ({ ...s, [id]: false }));
      setTimeout(() => setMessage(''), 1500);
    }
  };

  const handleStatus = async (id: string, status: StagingRow['status']) =>
    saveRow(id, { status });

  // ---- Promover aprobadas a master ----
  const promoteApproved = async () => {
    setMessage('Promoviendo preguntas aprobadas...');
    const { data, error } = await supabase.functions.invoke(
      'promote-questions-to-master',
      { body: { jobId } }
    );
    if (error) {
      console.error(error);
      let details = '';
      try {
        const resp = (error as unknown as { context?: { response?: Response } })?.context?.response;
        if (resp && typeof resp.text === 'function') {
          details = await resp.text();
        }
      } catch { /* noop */ }
      setMessage(`Error al promover: ${details || (error as { message?: string }).message || 'Desconocido'}`);
    } else {
      setMessage(`Promovidas: ${((data as unknown) as { inserted?: number })?.inserted ?? 'OK'}`);
    }

    // refrescar lista
    const { data: refreshed } = await (supabase as any)
      .from(STAGING)
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true });

    setRows(((refreshed ?? []) as unknown) as StagingRow[]);
  };

  // ---- UI ----
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Revisión de preguntas — Job {jobId}</h1>
        <p className="text-sm text-gray-600">
          Edita <b>categoría</b> y <b>subcategoría</b>, marca como <b>approved</b> y luego
          usa “Promover a master” para insertarlas en <code>master_questions</code>.
        </p>
      </header>

      <section className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm text-gray-700">
          {loading ? 'Cargando…' : `${rows.length} preguntas (aprobadas: ${approvedCount})`}
          {message ? <span className="ml-2 text-gray-500">• {message}</span> : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={promoteApproved}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={approvedCount === 0}
          >
            Promover aprobadas a Master
          </button>

          {/* Botón para generar preguntas si no hay filas */}
          <button
            onClick={generateQuestions}
            className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            disabled={genLoading || loading || !job || rows.length > 0}
            title={rows.length > 0 ? 'Ya hay preguntas en staging' : 'Generar preguntas desde la salida de DocAI'}
          >
            {genLoading ? 'Generando…' : 'Generar preguntas ahora'}
          </button>
        </div>
      </section>

      <div className="space-y-4">
        {rows.map((r, idx) => {
          const saving = !!savingIds[r.id];
          return (
            <div key={r.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">
                    #{idx + 1} • {r.question.type}
                  </div>
                  <div className="font-medium">{r.question.prompt}</div>

                  {Array.isArray(r.question.options) && r.question.options?.length ? (
                    <ul className="list-disc pl-6 mt-2 text-sm">
                      {r.question.options.map((opt, i) => <li key={i}>{opt}</li>)}
                    </ul>
                  ) : null}

                  {r.question.answer ? (
                    <div className="mt-2 text-sm">
                      <span className="font-semibold">Respuesta: </span>{r.question.answer}
                    </div>
                  ) : null}

                  {r.question.explanation ? (
                    <div className="mt-1 text-sm text-gray-600">
                      <span className="font-semibold">Explicación: </span>{r.question.explanation}
                    </div>
                  ) : null}

                  {Array.isArray(r.question.tags) && r.question.tags?.length ? (
                    <div className="mt-2 text-xs text-gray-500">
                      Tags: {r.question.tags.join(', ')}
                    </div>
                  ) : null}
                </div>

                <div className="w-[260px] shrink-0 space-y-2">
                  <label className="block text-sm font-medium">
                    Categoría
                    <input
                      className="mt-1 w-full border rounded-md px-2 py-1 text-sm"
                      value={r.category ?? ''}
                      placeholder="Ej. Aplicación"
                      onChange={(e) => setRowLocal(r.id, { category: e.target.value })}
                      onBlur={(e) => saveRow(r.id, { category: e.target.value })}
                      disabled={saving}
                    />
                  </label>

                  <label className="block text-sm font-medium">
                    Subcategoría
                    <input
                      className="mt-1 w-full border rounded-md px-2 py-1 text-sm"
                      value={r.subcategory ?? ''}
                      placeholder="Ej. Flujo de Materiales"
                      onChange={(e) => setRowLocal(r.id, { subcategory: e.target.value })}
                      onBlur={(e) => saveRow(r.id, { subcategory: e.target.value })}
                      disabled={saving}
                    />
                  </label>

                  <div className="flex items-center gap-2 pt-1">
                    <select
                      className="border rounded-md px-2 py-1 text-sm"
                      value={r.status}
                      onChange={(e) => handleStatus(r.id, e.target.value as StagingRow['status'])}
                      disabled={saving}
                    >
                      <option value="draft">draft</option>
                      <option value="approved">approved</option>
                      <option value="rejected">rejected</option>
                    </select>

                    <button
                      className="px-3 py-1 rounded-md bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
                      onClick={() => handleStatus(r.id, 'approved')}
                      disabled={saving}
                    >
                      Aprobar
                    </button>
                    <button
                      className="px-3 py-1 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
                      onClick={() => handleStatus(r.id, 'rejected')}
                      disabled={saving}
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>Doc: {r.source_document_name ?? '—'}</span>
                <span>ID: {r.id}</span>
              </div>
            </div>
          );
        })}

        {!loading && rows.length === 0 && (
          <div className="text-sm text-gray-600">
            No hay preguntas en staging para este job.
            {job?.output_prefix
              ? ' Puedes generarlas aquí mismo con el botón verde.'
              : ' El job no tiene output_prefix registrado.'}
          </div>
        )}
      </div>
    </div>
  );
}
