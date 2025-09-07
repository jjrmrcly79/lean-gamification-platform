// app/examen-terminado/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react'; // Un ícono para darle un toque visual
import Image from 'next/image';

export default function ExamFinishedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
      <Card className="w-full max-w-2xl text-center shadow-lg">
        <CardHeader className="p-8">
          <div className="mb-6 mx-auto"> 
            <Image
              src="/logo.png" // Asegúrate que esta ruta sea correcta (debe estar en /public)
              alt="Brito & Co Consulting Group Logo"
              width={200} // Ajusta el ancho según lo necesites
              height={50} // Ajusta la altura para mantener la proporción
              priority
            />
          </div>
          
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="mt-4 text-3xl font-bold text-dark-blue">
            ¡Felicidades, terminaste el Diagnóstico Teórico!
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 mt-2">
            Has completado la primera fase de tu evaluación.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
  <div className="text-left p-6 bg-blue-50/50 border border-blue-200 rounded-lg">
    <h3 className="font-semibold text-dark-blue text-lg mb-2">Siguientes Pasos: Evaluación Práctica</h3>
    <p className="text-gray-700">
      Un consultor evaluará tu aplicación en piso. Tus resultados finales estarán disponibles una vez que este proceso concluya.
    </p>
  </div>
</CardContent>     </Card>
    </div>
  );
}