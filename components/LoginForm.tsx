// Añadimos 'use client' para que el componente sea interactivo en el navegador
'use client'; 

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react"; // Importamos 'useState' para guardar lo que el usuario escribe
import { createClient } from "@/lib/supabase-client"; // Importamos nuestro conector de Supabase

export function LoginForm() {
  // Creamos "cajas" (estados) para guardar el email y la contraseña
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const supabase = createClient();

  // Esta es la función que se ejecutará cuando se haga clic en el botón
  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert("Error: " + error.message); // Mostramos una alerta simple si hay un error
    } else {
      alert("¡Inicio de sesión exitoso!"); // Mostramos una alerta si todo va bien
      // Aquí es donde más adelante redirigiremos al usuario al examen
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Image
            src="/logo.png"
            alt="Logo Britto & Co"
            width={80}
            height={80}
          />
          <CardTitle className="text-2xl text-brand-blue">LeanCert Game</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            {/* Conectamos el campo de email a nuestra "caja" para guardarlo */}
            <Input 
              id="email" 
              type="email" 
              placeholder="nombre@ejemplo.com" 
              required 
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            {/* Conectamos el campo de contraseña a nuestra "caja" */}
            <Input 
              id="password" 
              type="password" 
              required 
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>
        </CardContent>
        <CardFooter>
          {/* Conectamos nuestro botón a la función handleLogin */}
          <Button className="w-full bg-brand-blue hover:bg-brand-red text-white" onClick={handleLogin}>
            Acceder
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}