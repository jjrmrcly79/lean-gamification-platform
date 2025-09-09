'use client'; 

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const router = useRouter(); 
  const supabase = getSupabaseBrowserClient(); 
  const [isLoading, setIsLoading] = useState(true);
  // --- NUEVO: Estado para saber si el usuario ya ha realizado un intento ---
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 1. Verificar el rol del usuario (lógica existente)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'consultant') {
          router.push('/consultor');
          return; // Salimos temprano si es consultor
        }

        // --- NUEVO: 2. Verificar si el usuario ya tiene un intento ---
        const { data: attempt, error: attemptError } = await supabase
          .from('attempts')
          .select('id') // Solo necesitamos saber si existe, con el 'id' es suficiente
          .eq('user_id', user.id)
          .limit(1) // Optimización: solo nos interesa si hay al menos uno
          .single(); // .single() es útil aquí, devolverá data o null

        if (attemptError && attemptError.code !== 'PGRST116') {
            // Ignoramos el error 'PGRST116' que significa "0 filas encontradas"
            console.error('Error checking for existing attempts:', attemptError);
        }
        
        // Si 'attempt' no es nulo, significa que se encontró un registro
        if (attempt) {
            setHasAttempted(true);
        }

        setIsLoading(false);

      } else {
        router.push('/'); // Si no hay usuario, va al login
      }
    };

    checkUserStatus();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut(); 
    router.push('/'); 
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Cargando...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="flex items-center justify-between w-full px-6 py-3 bg-white border-b">
        {/* ... (Tu código del header no cambia) ... */}
         <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
          <h1 className="text-xl font-bold text-brand-blue">Diagnóstico Lean</h1>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>JG</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-500 cursor-pointer"
              onClick={handleLogout} 
            >
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="flex-1 p-8">
        <h2 className="text-3xl font-semibold text-gray-800">
          Mis Certificaciones
        </h2>
        <p className="mt-2 text-gray-600">
          Selecciona una certificación para comenzar tu evaluación.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico Lean</CardTitle>
              <CardDescription>Evalúa tus conocimientos en los fundamentos y herramientas de Lean Manufacturing.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">80 Preguntas</p>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-4">
              <Link href="/dashboard/results" className="w-full">
                <Button variant="outline" className="w-full">
                  Ver Resultados
                </Button>
              </Link>
              
              {/* --- NUEVO: Lógica condicional para el botón de iniciar diagnóstico --- */}
              {hasAttempted ? (
                <Button disabled className="w-full">
                  Diagnóstico Realizado
                </Button>
              ) : (
                <Link href="/exam/diagnostico" className="w-full">
                  <Button className="w-full bg-primary text-primary-foreground">
                    Iniciar Diagnóstico
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}