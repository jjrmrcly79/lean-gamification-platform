// app/presentaciones/ccmx/page.tsx - VERSIÓN ACTUALIZADA

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PresentationPage() {
  return (
    <main className="flex flex-col">
      {/* ======================================================================= */}
      {/* PANTALLA 1: EL GANCHO (HERO SECTION)                                    */}
      {/* ======================================================================= */}
      <section className="flex flex-col items-center justify-center text-center p-4 min-h-screen bg-background">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          No Creamos Índices, Construimos
          <br />
          <span className="text-primary">Arquitecturas del Conocimiento</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground">
          Un temario tradicional te dice <span className="font-semibold text-foreground">qué</span> aprender. Una arquitectura del conocimiento te muestra <span className="font-semibold text-foreground">cómo se conectan las ideas</span>.
        </p>
        <div className="mt-8">
          {/* 👇 CAMBIO 1: El botón ahora es un enlace que apunta al id 'framework' */}
          <Button size="lg" asChild>
            <a href="#framework">Descubre Cómo Funciona</a>
          </Button>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* PANTALLA 2: LA BASE (FRAMEWORK VALIDADO)                                */}
      {/* ======================================================================= */}
      {/* 👇 CAMBIO 2: Añadimos un id a la sección para que el botón pueda encontrarla */}
      <section id="framework" className="flex flex-col items-center justify-center p-8 md:p-12 min-h-screen bg-secondary">
        <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold">
                Midiendo el Conocimiento con Rigor Científico
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                Usamos la taxonomía de Anderson & Krathwohl (revisión de Bloom), el estándar de oro en diseño educativo. La clave es su <span className="font-semibold text-foreground">matriz bidimensional</span>.
            </p>
        </div>
        
        <div className="mt-10 grid md:grid-cols-2 gap-8 w-full max-w-4xl">
            <Card className="bg-background">
                <CardHeader>
                    <CardTitle>Antes: La Escalera Lineal</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        El modelo original de Bloom organizaba el conocimiento en 6 niveles secuenciales.
                    </p>
                    {/* 👇 CAMBIO 3: Lista completada */}
                    <ul className="mt-4 space-y-2 text-left font-medium">
                        <li>1. Conocimiento</li>
                        <li>2. Comprensión</li>
                        <li>3. Aplicación</li>
                        <li>4. Análisis</li>
                        <li>5. Síntesis</li>
                        <li>6. Evaluación</li>
                    </ul>
                </CardContent>
            </Card>

            <Card className="border-primary border-2">
                <CardHeader>
                    <CardTitle>Ahora: La Matriz Dinámica</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        El modelo revisado usa verbos de acción y separa el <span className="font-semibold text-primary">proceso</span> del <span className="font-semibold text-primary">conocimiento</span>.
                    </p>
                    {/* 👇 CAMBIO 4: Lista completada y paralela */}
                    <ul className="mt-4 space-y-2 text-left font-medium">
                        <li>1. Recordar</li>
                        <li>2. Comprender</li>
                        <li>3. Aplicar</li>
                        <li>4. Analizar</li>
                        <li>5. Evaluar</li>
                        <li className="text-primary">6. Crear</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
      </section>
    </main>
  );
}