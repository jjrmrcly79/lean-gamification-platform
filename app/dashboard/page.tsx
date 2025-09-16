'use client'; 

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const router = useRouter(); 
  const supabase = getSupabaseBrowserClient(); 
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false); // --- NUEVO: Estado para el botón de carga
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role === 'consultant') {
          router.push('/consultor');
          return;
        }
        const { data: attempt, error: attemptError } = await supabase.from('attempts').select('id').eq('user_id', user.id).limit(1).single();
        if (attemptError && attemptError.code !== 'PGRST116') {
          console.error('Error checking for existing attempts:', attemptError);
        }
        if (attempt) {
            setHasAttempted(true);
        }
        setIsLoading(false);
      } else {
        router.push('/');
      }
    };
    checkUserStatus();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut(); 
    router.push('/'); 
  };

  // --- NUEVA FUNCIÓN: Para iniciar la generación del examen ---
  const handleStartGeneration = async () => {
    setIsGenerating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Error de autenticación.");
      setIsGenerating(false);
      return;
    }

    // 1. Creamos una fila en 'attempts' para obtener un ID
    const { data: newAttempt, error: insertError } = await supabase
      .from('attempts')
      .insert({
        user_id: user.id,
        status: 'generating' // Nuevo estado inicial
      })
      .select('id')
      .single();

    if (insertError) {
      console.error("Error al crear el intento:", insertError);
      alert("No se pudo iniciar el diagnóstico. Intenta de nuevo.");
      setIsGenerating(false);
      return;
    }
    
    // 2. Llamamos a la función de Supabase (sin esperar a que termine)
    supabase.functions.invoke('jiribilla-engine', {
      body: { attempt_id: newAttempt.id },
    });

    // 3. Redirigimos al usuario a la nueva pantalla de carga
    router.push(`/exam/loading/${newAttempt.id}`);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="flex items-center justify-between w-full px-6 py-3 bg-white border-b">
         <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
          <h1 className="text-xl font-bold text-brand-blue">Diagnóstico Lean</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Avatar className="cursor-pointer"><AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" /><AvatarFallback>JG</AvatarFallback></Avatar></DropdownMenuTrigger>
          <DropdownMenuContent align="end"><DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem>Perfil</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem className="text-red-500 cursor-pointer" onClick={handleLogout}>Cerrar Sesión</DropdownMenuItem></DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="flex-1 p-8">
        <h2 className="text-3xl font-semibold text-gray-800">Mis Certificaciones</h2>
        <p className="mt-2 text-gray-600">Selecciona una certificación para comenzar tu evaluación.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Diagnóstico Lean</CardTitle><CardDescription>Evalúa tus conocimientos en los fundamentos y herramientas de Lean Manufacturing.</CardDescription></CardHeader>
            <CardContent><p className="text-sm text-gray-500">80 Preguntas</p></CardContent>
            <CardFooter className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full" disabled>Ver Resultados</Button>
              
              {/* --- LÓGICA DEL BOTÓN MODIFICADA --- */}
              {hasAttempted ? (
                <Button disabled className="w-full">Diagnóstico Realizado</Button>
              ) : (
                <Button 
                  onClick={handleStartGeneration}
                  disabled={isGenerating}
                  className="w-full bg-primary text-primary-foreground"
                >
                  {isGenerating ? 'Preparando...' : 'Iniciar Diagnóstico'}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}