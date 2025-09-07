'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirige automáticamente al dashboard, que a su vez redirigirá al login si no hay sesión
    router.push('/dashboard');
  }, [router]);

  return <div>Redirigiendo...</div>;
}