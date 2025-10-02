// app/presentaciones/ccmx/page.tsx

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
          <Button size="lg">
            Descubre Cómo Funciona
          </Button>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* PANTALLA 2: LA BASE (FRAMEWORK VALIDADO) - NUEVA SECCIÓN                 */}
      {/* ======================================================================= */}
      {/* He usado un color de fondo 'bg-secondary' de tu tema para crear un      */}
      {/* contraste visual entre las secciones y hacer la transición más clara.  */}
      <section className="flex flex-col items-center justify-center p-8 md:p-12 min-h-screen bg-secondary">
        <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold">
                Midiendo el Conocimiento con Rigor Científico
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                Usamos la taxonomía de Anderson & Krathwohl (revisión de Bloom), el estándar de oro en diseño educativo. La clave es su <span className="font-semibold text-foreground">matriz bidimensional</span>.
            </p>
        </div>

        {/* Contenedor para la comparación visual */}
        <div className="mt-10 grid md:grid-cols-2 gap-8 w-full max-w-4xl">
            {/* Columna 1: El modelo antiguo */}
            <Card className="bg-background">
                <CardHeader>
                    <CardTitle>Antes: La Escalera Lineal</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        El conocimiento se veía como una simple escalera que había que subir paso a paso. Limitado y unidimensional.
                    </p>
                    <ul className="mt-4 space-y-2 text-left">
                        <li>1. Conocer</li>
                        <li>2. Comprender</li>
                        <li>3. Aplicar... etc.</li>
                    </ul>
                </CardContent>
            </Card>

            {/* Columna 2: Nuestro modelo */}
            <Card className="border-primary border-2">
                <CardHeader>
                    <CardTitle>Ahora: La Matriz Dinámica</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Separamos <span className="font-semibold text-primary">cómo piensas</span> de <span className="font-semibold text-primary">sobre qué piensas</span>, permitiendo una evaluación mucho más rica y precisa.
                    </p>
                    <div className="mt-4 text-left">
                        <p><strong>Dimensión 1:</strong> Proceso Cognitivo (Los "escalones")</p>
                        <p><strong>Dimensión 2:</strong> Tipo de Conocimiento (Fáctico, Conceptual...)</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </section>

    </main>
  );
}