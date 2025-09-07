// app/registro/page.tsx
'use client';

import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function SignUpPage() {
  const supabase = createClient();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null); // Limpia mensajes anteriores
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage('Error al registrarse: ' + error.message);
    } else {
      setMessage('¡Registro exitoso! Por favor, revisa tu correo para confirmar tu cuenta.');
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
            Crea tu cuenta
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>
          </div>
          <div>
            <Button type="submit" className="w-full">
              Registrarse
            </Button>
          </div>
        </form>
        {message && <p className="text-center text-sm text-gray-600 mt-4">{message}</p>}
        <div className="text-center text-sm">
          <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
            ¿Ya tienes una cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}