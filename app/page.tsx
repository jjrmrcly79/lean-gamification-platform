// app/page.tsx
'use client';

import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Error al iniciar sesión: ' + error.message);
    } else {
      // Si el login es exitoso, redirige al dashboard
      router.push('/dashboard');
      router.refresh(); // Refresca la página para asegurar que el estado de la sesión se actualice
    }
  };

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
      </div>
    </div>
  );
}