// app/exam/loading/[attemptId]/page.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import Image from 'next/image'; // Asegúrate de que Image esté importado
import Lottie from "lottie-react";
import animationData from "../../../../public/animation.json"; // Importamos el archivo de la animación


// Hook personalizado para el polling (comprobar el estado cada X segundos)
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
  const { attemptId } = params;

  const [userName, setUserName] = useState('');
  const [isPolling, setIsPolling] = useState(true);

  // 1. Obtener el nombre del usuario para el mensaje personalizado
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

  // 2. Lógica de Polling: Verificar el estado del examen cada 5 segundos
  useInterval(async () => {
    if (!attemptId) return;

    const { data, error } = await supabase
      .from('attempts')
      .select('status')
      .eq('id', attemptId as string)
      .single();

    if (error) {
      console.error("Error al verificar el estado:", error);
      setIsPolling(false);
      return;
    }

    if (data?.status === 'ready_to_start') {
      setIsPolling(false);
      router.push(`/exam/diagnostico/${attemptId}`);
    }
  }, isPolling ? 5000 : null);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-center p-6">
      
       {/* --- AQUÍ ESTÁ EL CÓDIGO PARA LOTTIE --- */}
      <Lottie 
        animationData={animationData} 
        loop={true} 
        style={{ width: 250, height: 250 }} // Ajusta el tamaño como necesites
        className="mb-8"
      />
      
      <h1 className="text-3xl font-bold text-[#1A237E] mb-2">
        ¡Hola, {userName}!
      </h1>
      <p className="text-xl text-gray-600 animate-pulse">
        Estamos construyendo tu diagnóstico personalizado...
      </p>
    </div>
  );
}