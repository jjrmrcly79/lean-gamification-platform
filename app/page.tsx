// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Si hay un usuario, busca su rol
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        // Redirige según el rol
        if (profile?.role === 'consultant') {
          router.push('/consultor/evaluaciones');
        } else {
          router.push('/dashboard'); // Asume que es estudiante
        }
      } else {
        // Si NO hay usuario, deja de cargar y muestra el formulario de login
        setLoading(false);
      }
    };

    checkUserAndRedirect();
  }, [router, supabase]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert('Error al iniciar sesión: ' + error.message);
    } else {
      // Si el login es exitoso, vuelve a cargar la página.
      // El useEffect se encargará de la redirección.
      window.location.reload();
    }
  };

  // Muestra "Cargando..." mientras se verifica la sesión
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Verificando sesión...</div>;
  }

  // Si no está cargando y no hubo redirección, muestra el login
  return (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-lg">
      <div className="text-center">
        <Image
          src="/logo.png"
          alt="Brito & Co Logo"
          width={200}
          height={50}
          className="mx-auto"
        />
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
          Inicia sesión en tu cuenta
        </h2>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleLogin}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" required />
          </div>
        </div>
        <div>
          <Button type="submit" className="w-full">
            Iniciar Sesión
          </Button>
        </div>
      </form>

      {/* El enlace de registro va aquí, después de cerrar el formulario */}
      <div className="text-center text-sm">
        <Link href="/registro" className="font-medium text-blue-600 hover:text-blue-500">
          ¿No tienes una cuenta? Regístrate aquí
        </Link>
      </div>
      
    </div>
  </div>
);
}