// app/presentaciones/ccmx/page.tsx - VERSIÓN CON PANTALLA 6

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Importamos el componente Tabs
import Image from 'next/image';

export default function PresentationPage() {
  return (
    <div className="relative">
      <header className="fixed top-0 left-0 w-full bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="container mx-auto flex items-center justify-start h-16 px-4">
          <Image src="/logo.png" alt="Logo de la Empresa" width={40} height={40} />
        </div>
      </header>

      <main className="flex flex-col">
        {/* --- PANTALLA 1-4 (EXISTENTES) --- */}
        <section className="flex flex-col items-center justify-center text-center p-4 min-h-screen bg-background">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">No Creamos Índices, Construimos<br /><span className="text-primary">Arquitecturas del Conocimiento</span></h1>
          <p className="mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground">Un temario tradicional te dice <span className="font-semibold text-foreground">qué</span> aprender. Una arquitectura del conocimiento te muestra <span className="font-semibold text-foreground">cómo se conectan las ideas</span>.</p>
          <div className="mt-8"><Button size="lg" asChild><a href="#framework">Descubre Cómo Funciona</a></Button></div>
        </section>
        <section id="framework" className="flex flex-col items-center justify-center p-8 md:p-12 min-h-screen bg-secondary">
          <div className="text-center"><h2 className="text-3xl md:text-5xl font-bold">Midiendo el Conocimiento con Rigor Científico</h2><p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">Usamos la taxonomía de Anderson & Krathwohl (revisión de Bloom), el estándar de oro en diseño educativo. La clave es su <span className="font-semibold text-foreground">matriz bidimensional</span>.</p></div>
          <div className="mt-10 grid md:grid-cols-2 gap-8 w-full max-w-4xl">
              <Card className="bg-background"><CardHeader><CardTitle>Antes: La Escalera Lineal</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">El modelo original de Bloom organizaba el conocimiento en 6 niveles secuenciales.</p><ul className="mt-4 space-y-2 text-left font-medium"><li>1. Conocimiento</li><li>2. Comprensión</li><li>3. Aplicación</li><li>4. Análisis</li><li>5. Síntesis</li><li>6. Evaluación</li></ul></CardContent></Card>
              <a href="#cognitive-levels" className="block transition-transform duration-200 hover:scale-[1.02]"><Card className="border-primary border-2 h-full"><CardHeader><CardTitle>Ahora: La Matriz Dinámica</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">El modelo revisado usa verbos de acción y separa el <span className="font-semibold text-primary">proceso</span> del <span className="font-semibold text-primary">conocimiento</span>.</p><ul className="mt-4 space-y-2 text-left font-medium"><li>1. Recordar</li><li>2. Comprender</li><li>3. Aplicar</li><li>4. Analizar</li><li>5. Evaluar</li><li className="text-primary">6. Crear</li></ul></CardContent></Card></a>
          </div>
        </section>
        <section id="cognitive-levels" className="flex flex-col items-center justify-center p-8 md:p-12 min-h-screen bg-background">
          <div className="text-center mb-10"><h2 className="text-3xl md:text-5xl font-bold">Dimensión 1: Los 6 Niveles del Proceso Cognitivo</h2><p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">Cada &apos;escalón&apos; representa una habilidad mental más compleja. Pasa el mouse sobre cada uno para ver su definición y verbos clave.</p></div>
          <div className="stair-container">
              <div className="stair-step"><p className="stair-title">1. Recordar</p><div className="stair-description"><p>Recuperar conocimiento relevante de la memoria a largo plazo.</p><p className="font-semibold mt-2">Verbos: Definir, Listar, Nombrar, Identificar.</p></div></div>
              <div className="stair-step"><p className="stair-title">2. Comprender</p><div className="stair-description"><p>Construir significado a partir de material educativo, como interpretar o resumir.</p><p className="font-semibold mt-2">Verbos: Explicar, Resumir, Clasificar, Comparar.</p></div></div>
              <div className="stair-step"><p className="stair-title">3. Aplicar</p><div className="stair-description"><p>Llevar a cabo o utilizar un procedimiento en una situación determinada.</p><p className="font-semibold mt-2">Verbos: Implementar, Resolver, Demostrar, Usar.</p></div></div>
              <div className="stair-step"><p className="stair-title">4. Analizar</p><div className="stair-description"><p>Descomponer el material en sus partes y determinar cómo se relacionan entre sí.</p><p className="font-semibold mt-2">Verbos: Diferenciar, Organizar, Atribuir, Examinar.</p></div></div>
              <div className="stair-step"><p className="stair-title">5. Evaluar</p><div className="stair-description"><p>Realizar juicios basados en criterios y estándares, comprobando y criticando.</p><p className="font-semibold mt-2">Verbos: Criticar, Justificar, Recomendar, Valorar.</p></div></div>
              <div className="stair-step"><p className="stair-title">6. Crear</p><div className="stair-description"><p>Unir elementos para formar un todo coherente; generar o producir trabajo original.</p><p className="font-semibold mt-2">Verbos: Diseñar, Formular, Proponer, Elaborar.</p></div></div>
          </div>
        </section>
        <section id="knowledge-types" className="flex flex-col items-center justify-center p-8 md:p-12 min-h-screen bg-secondary">
            <div className="text-center mb-10"><h2 className="text-3xl md:text-5xl font-bold">Dimensión 2: Los 4 Tipos de Conocimiento</h2><p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">No solo importa <span className="font-semibold text-foreground">cómo</span> piensas, sino <span className="font-semibold text-foreground">sobre qué</span> estás pensando. Esta dimensión clasifica la naturaleza del contenido.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
                <Card className="bg-background transition-transform duration-200 hover:-translate-y-2"><CardHeader><CardTitle className="text-primary">A. Fáctico</CardTitle></CardHeader><CardContent><p>Los elementos básicos y datos de una disciplina. La materia prima del conocimiento.</p><p className="mt-2 font-semibold text-sm">Ej: Terminología, fechas, detalles específicos.</p></CardContent></Card>
                <Card className="bg-background transition-transform duration-200 hover:-translate-y-2"><CardHeader><CardTitle className="text-primary">B. Conceptual</CardTitle></CardHeader><CardContent><p>Las interrelaciones entre los elementos básicos. El mapa que conecta los datos.</p><p className="mt-2 font-semibold text-sm">Ej: Teorías, modelos, principios, clasificaciones.</p></CardContent></Card>
                <Card className="bg-background transition-transform duration-200 hover:-translate-y-2"><CardHeader><CardTitle className="text-primary">C. Procedimental</CardTitle></CardHeader><CardContent><p>El &quot;cómo&quot; hacer algo. El conocimiento puesto en acción.</p><p className="mt-2 font-semibold text-sm">Ej: Técnicas, métodos, algoritmos, habilidades.</p></CardContent></Card>
                <Card className="bg-background transition-transform duration-200 hover:-translate-y-2"><CardHeader><CardTitle className="text-primary">D. Metacognitivo</CardTitle></CardHeader><CardContent><p>La conciencia sobre el propio proceso de aprendizaje. &quot;Pensar sobre cómo piensas&quot;.</p><p className="mt-2 font-semibold text-sm">Ej: Estrategias de aprendizaje, autoconocimiento.</p></CardContent></Card>
            </div>
        </section>
        <section id="tagging-system" className="flex flex-col items-center justify-center p-8 md:p-12 min-h-screen bg-background">
          <div className="text-center mb-10"><h2 className="text-3xl md:text-5xl font-bold">Nuestro Motor: Cada Pregunta es un Dato Inteligente</h2><p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">Así es como aplicamos la teoría. Cada pregunta en nuestro sistema recibe 3 etiquetas clave que la convierten en una pieza analizable.</p></div>
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="flex flex-col items-center justify-center p-6"><Card className="w-full max-w-sm shadow-lg"><CardHeader><CardTitle>Pregunta Ejemplo</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">&quot;Compare el sistema JIT con el modelo EOQ, analizando las diferencias en sus supuestos...&quot;</p></CardContent></Card><div className="text-2xl my-4">👇</div><div className="flex flex-wrap justify-center gap-3"><Badge variant="secondary">Dominio: Cadena de Suministro</Badge><Badge variant="secondary">Conocimiento: Conceptual</Badge><Badge variant="destructive">Nivel: Analizar</Badge></div></div>
            <div className="flex flex-col gap-4"><Card><CardHeader><CardTitle>1. Dominio Temático</CardTitle><CardContent className="pt-4"><p>Es el área de contenido principal. Nos dice <span className="font-semibold text-primary">&apos;de qué&apos;</span> trata la pregunta.</p><p className="text-sm text-muted-foreground mt-2">Ej: Gestión Financiera, Liderazgo, etc.</p></CardContent></CardHeader></Card><Card><CardHeader><CardTitle>2. Tipo de Conocimiento</CardTitle><CardContent className="pt-4"><p>Clasifica la naturaleza del saber evaluado. Nos dice <span className="font-semibold text-primary">&apos;qué clase&apos;</span> de información es.</p><p className="text-sm text-muted-foreground mt-2">Fáctico, Conceptual, Procedimental o Metacognitivo.</p></CardContent></CardHeader></Card><Card><CardHeader><CardTitle>3. Nivel Cognitivo</CardTitle><CardContent className="pt-4"><p>Define la habilidad mental requerida. Nos dice <span className="font-semibold text-primary">&apos;cómo pensar&apos;</span> para responder.</p><p className="text-sm text-muted-foreground mt-2">Recordar, Aplicar, Analizar, Crear, etc.</p></CardContent></CardHeader></Card></div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* PANTALLA 6: LA MAGIA EN ACCIÓN (EJEMPLO INTERACTIVO) (NUEVA)            */}
        {/* ======================================================================= */}
        <section id="interactive-example" className="flex flex-col items-center justify-center p-8 md:p-12 min-h-screen bg-secondary">
            <div className="text-center mb-10">
                <h2 className="text-3xl md:text-5xl font-bold">La Magia en Acción: El Viaje de un Concepto</h2>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                    Explora cómo un único concepto, la gestión de inventarios <span className="font-semibold text-foreground">Just-In-Time (JIT)</span>, se evalúa en todos los niveles de profundidad cognitiva.
                </p>
            </div>

            <Tabs defaultValue="recordar" className="w-full max-w-2xl">
                <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
                    <TabsTrigger value="recordar">Recordar</TabsTrigger>
                    <TabsTrigger value="comprender">Comprender</TabsTrigger>
                    <TabsTrigger value="aplicar">Aplicar</TabsTrigger>
                    <TabsTrigger value="analizar">Analizar</TabsTrigger>
                    <TabsTrigger value="evaluar">Evaluar</TabsTrigger>
                    <TabsTrigger value="crear">Crear</TabsTrigger>
                </TabsList>
                
                <Card className="mt-4 bg-background">
                  <CardContent className="p-6 min-h-[200px]">
                    <TabsContent value="recordar">
                        <p className="text-sm text-muted-foreground">PREGUNTA DE NIVEL 1:</p>
                        <p className="text-lg font-medium mt-2">&quot;Defina el concepto de gestión de inventarios Just-In-Time (JIT).&quot;</p>
                    </TabsContent>
                    <TabsContent value="comprender">
                        <p className="text-sm text-muted-foreground">PREGUNTA DE NIVEL 2:</p>
                        <p className="text-lg font-medium mt-2">&quot;Explique con sus propias palabras dos ventajas y dos desventajas de implementar un sistema JIT en una empresa manufacturera.&quot;</p>
                    </TabsContent>
                    <TabsContent value="aplicar">
                        <p className="text-sm text-muted-foreground">PREGUNTA DE NIVEL 3:</p>
                        <p className="text-lg font-medium mt-2">&quot;Una empresa tiene un costo de almacenamiento de 50 € por unidad/mes. Al implementar JIT, reduce su inventario de 1,000 a 150 unidades. ¿Cuál es el ahorro mensual?&quot;</p>
                    </TabsContent>
                    <TabsContent value="analizar">
                        <p className="text-sm text-muted-foreground">PREGUNTA DE NIVEL 4:</p>
                        <p className="text-lg font-medium mt-2">&quot;Compare el sistema JIT con el modelo de Cantidad Económica de Pedido (EOQ), analizando las diferencias en sus supuestos y aplicabilidad.&quot;</p>
                    </TabsContent>
                    <TabsContent value="evaluar">
                        <p className="text-sm text-muted-foreground">PREGUNTA DE NIVEL 5:</p>
                        <p className="text-lg font-medium mt-2">&quot;Argumente a favor o en contra: &apos;La volatilidad de las cadenas de suministro globales ha hecho que el modelo JIT sea obsoleto y demasiado arriesgado&apos;. Justifique su postura.&quot;</p>
                    </TabsContent>
                    <TabsContent value="crear">
                        <p className="text-sm text-muted-foreground">PREGUNTA DE NIVEL 6:</p>
                        <p className="text-lg font-medium mt-2">&quot;Diseñe un plan de implementación de un sistema JIT híbrido para una pequeña empresa de comercio electrónico, incluyendo los KPIs para medir el éxito.&quot;</p>
                    </TabsContent>
                  </CardContent>
                </Card>
            </Tabs>
        </section>

      </main>
    </div>
  );
}