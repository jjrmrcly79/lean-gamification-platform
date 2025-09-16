// app/exam/loading/[attemptId]/page.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import Lottie from "lottie-react";
import animationData from "../../../../public/animation.json";

// Hook personalizado para el polling
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<(() => void) | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
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
  const attemptId = Array.isArray(params.attemptId) ? params.attemptId[0] : params.attemptId;

  const [userName, setUserName] = useState('');
  const [isPolling, setIsPolling] = useState(true);
  // --- NUEVO ESTADO: Para controlar la vista ---
  const [pageState, setPageState] = useState<'generating' | 'ready'>('generating');

  // Obtener el nombre del usuario
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single();
        
        setUserName(profile?.full_name || profile?.email || 'participante');
      }
    };
    fetchUserProfile();
  }, [supabase]);

  // Lógica de Polling modificada
  useInterval(async () => {
    if (!attemptId) return;

    const { data, error } = await supabase
      .from('attempts')
      .select('status')
      .eq('id', attemptId)
      .single();

    if (error) {
      console.error("Error al verificar el estado:", error);
      setIsPolling(false); // Detenemos el polling si hay un error
      return;
    }

    // --- CAMBIO PRINCIPAL: En lugar de redirigir, cambiamos el estado de la página ---
    if (data?.status === 'ready_to_start') {
      setIsPolling(false); // Detenemos el polling
      setPageState('ready'); // Cambiamos la vista a "listo"
    }
  }, isPolling ? 5000 : null); // Sigue comprobando cada 5 segundos

  const handleStartExam = () => {
    if (attemptId) {
      router.push(`/exam/diagnostico/${attemptId}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-center p-6">
      {/* --- RENDERIZADO CONDICIONAL: Muestra una vista u otra según el estado --- */}
      {pageState === 'generating' ? (
        <>
          <Lottie 
            animationData={animationData} 
            loop={true} 
            style={{ width: 250, height: 250 }}
            className="mb-8"
          />
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
            {/* Puedes poner un ícono de "check" o "listo" aquí si quieres */}
            <svg className="mx-auto h-24 w-24 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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