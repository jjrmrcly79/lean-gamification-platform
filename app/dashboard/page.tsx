// app/dashboard/page.tsx
'use client'; 

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const router = useRouter(); 
  const supabase = createClient(); 

  const handleLogout = async () => {
    await supabase.auth.signOut(); 
    router.push('/'); 
    router.refresh();
  };
  
  // YA NO NECESITAMOS EL useEffect DE REDIRECCIÓN AQUÍ

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="flex items-center justify-between w-full px-6 py-3 bg-white border-b">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={120} height={35} />
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
            <DropdownMenuItem asChild><Link href="/dashboard/results">Mis Resultados</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={handleLogout}>
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
            <CardFooter>
              <Link href="/exam/diagnostico" className="w-full">
                <Button className="w-full bg-dark-blue hover:bg-hover-blue text-white">
                  Iniciar Diagnóstico
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}