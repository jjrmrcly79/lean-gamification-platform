// leancert-frontend/app/consultor/page.tsx

'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ConsultantHomePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-dark-blue mb-2">
          Bienvenido, Consultor
        </h1>
        <p className="text-gray-600 mb-8">
          Selecciona la acción que deseas realizar.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Opción 1: Evaluar Exámenes */}
          <Card>
            <CardHeader>
              <CardTitle>Evaluar Exámenes</CardTitle>
              <CardDescription className="pt-2">
                Revisa los diagnósticos pendientes, asigna calificaciones y consulta el historial de evaluaciones completadas.
              </CardDescription>
            </CardHeader>
            <div className="p-6 pt-0">
              <Button asChild className="w-full">
                <Link href="/consultor/evaluaciones">
                  Ir a Evaluaciones
                </Link>
              </Button>
            </div>
          </Card>

          {/* Opción 2: Crear Preguntas */}
          <Card>
            <CardHeader>
              <CardTitle>Crear Preguntas desde PDF</CardTitle>
              <CardDescription className="pt-2">
                Usa la IA para analizar un documento PDF, extraer temas clave y generar nuevas preguntas para el banco de diagnósticos.
              </CardDescription>
            </CardHeader>
            <div className="p-6 pt-0">
              <Button asChild className="w-full">
                <Link href="/consultor/analizador">
                  Ir al Analizador de PDF
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}