// app/exam/loading/[attemptId]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import Lottie from 'lottie-react';

// --- Hook de polling ---
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<(() => void) | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default function LoadingExamPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = getSupabaseBrowserClient();

  const attemptParam = Array.isArray(params.attemptId)
    ? params.attemptId[0]
    : (params.attemptId as string | undefined);

  // normalizamos a string (si no viene, queda vacío y simplemente no poll)
  const attemptId = attemptParam ?? '';

  const [userName, setUserName] = useState('participante');

  // Estado de animación (se carga desde /public por fetch)
  type AnimationJSON = Record<string, unknown>;
  const [animationData, setAnimationData] = useState<AnimationJSON | null>(null);
  const [isAnimationVisible, setIsAnimationVisible] = useState(false);

  // Estado de página
  const [isPolling, setIsPolling] = useState(true);
  const [pageState, setPageState] = useState<'generating' | 'ready'>('generating');

  // Cargar animación desde /public (NO import directo)
  useEffect(() => {
    let alive = true;
    // pequeño delay para no bloquear el primer render
    const t = setTimeout(() => setIsAnimationVisible(true), 100);

    fetch('/animation.json')
      .then((r) => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((json) => { if (alive) setAnimationData(json); })
      .catch((e) => console.error('Lottie load error', e));

    return () => { alive = false; clearTimeout(t); };
  }, []);

  // Obtener nombre de usuario
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', user.id)
        .single();
      setUserName(profile?.name || profile?.email || 'participante');
    })();
  }, [supabase]);

  // Polling del estado del intento
  useInterval(async () => {
    if (!attemptId) return;

    const { data, error } = await supabase
      .from('attempts')
      .select('status')
      .eq('id', attemptId)
      .single();

    if (error) {
      console.error('Error al verificar el estado:', error);
      setIsPolling(false);
      return;
    }

    if (data?.status === 'ready_to_start') {
      setIsPolling(false);
      setPageState('ready');
    }
  }, isPolling ? 5000 : null);

  const handleStartExam = () => {
    if (attemptId) {
      router.push(`/exam/diagnostico/${attemptId}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-center p-6">
      {pageState === 'generating' ? (
        <>
          {/* Solo renderiza Lottie cuando está visible y ya cargó el JSON */}
          {isAnimationVisible && animationData ? (
            <Lottie
              animationData={animationData as object}
              loop
              autoplay
              style={{ width: 250, height: 250 }}
              className="mb-8"
            />
          ) : (
            <div className="mb-8 h-[250px] w-[250px] flex items-center justify-center text-gray-400">
              Cargando…
            </div>
          )}

          <h1 className="text-3xl font-bold text-[#1A237E] mb-2">
            ¡Hola, {userName}!
          </h1>
          <p className="text-xl text-gray-600 animate-pulse">
            Estamos construyendo tu diagnóstico personalizado...
          </p>
        </>
      ) : (
        <>
          <div className="mb-8">
            <svg
              className="mx-auto h-24 w-24 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#1A237E] mb-2">
            ¡Tu diagnóstico está listo!
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Espera la indicación del consultor para comenzar.
          </p>
          <Button
            onClick={handleStartExam}
            className="px-12 py-6 text-xl font-bold bg-[#1A237E] hover:bg-[#2C388D] text-white rounded-lg"
          >
            Iniciar Diagnóstico
          </Button>
        </>
      )}
    </div>
  );
}
