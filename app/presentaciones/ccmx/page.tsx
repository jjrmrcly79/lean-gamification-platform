// app/presentaciones/ccmx/page.tsx - VERSIÓN CORREGIDA FINAL
'use client'; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import Image from 'next/image';
import { Bar, BarChart, CartesianGrid, Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// --- DATOS DE EJEMPLO PARA LOS GRÁFICOS ---
const radarChartData = [
  { subject: "Recordar", "Operaciones": 85, "Finanzas": 60, "Liderazgo": 75 },
  { subject: "Comprender", "Operaciones": 90, "Finanzas": 70, "Liderazgo": 80 },
  { subject: "Aplicar", "Operaciones": 95, "Finanzas": 85, "Liderazgo": 70 },
  { subject: "Analizar", "Operaciones": 70, "Finanzas": 90, "Liderazgo": 85 },
  { subject: "Evaluar", "Operaciones": 60, "Finanzas": 95, "Liderazgo": 90 },
  { subject: "Crear", "Operaciones": 50, "Finanzas": 75, "Liderazgo": 88 },
];

const barChartData = [
  { name: 'Básico', 'Personal': 4 },
  { name: 'Intermedio', 'Personal': 12 },
  { name: 'Avanzado', 'Personal': 8 },
  { name: 'Experto', 'Personal': 2 },
];

const tableData = [
    { name: 'Ana Torres', level: 'Avanzado', progress: 85 },
    { name: 'Carlos López', level: 'Intermedio', progress: 60 },
    { name: 'Sofía Martin', level: 'Experto', progress: 95 },
    { name: 'David García', level: 'Intermedio', progress: 72 },
    { name: 'Elena Ruiz', level: 'Básico', progress: 40 },
];

export default function PresentationPage() {
  return (
    <div className="relative">
      <header className="fixed top-0 left-0 w-full bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="container mx-auto flex items-center justify-start h-16 px-4">
          <Image src="/logo.png" alt="Logo de la Empresa" width={40} height={40} />
        </div>
      </header>

      <main className="flex flex-col">
        {/* --- PANTALLAS 1-6 (EXISTENTES) --- */}
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
            <div className="flex flex-col items-center justify-center p-6"><Card className="w-full max-w-sm shadow-lg"><CardHeader><CardTitle>Pregunta Ejemplo</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">&quot;Compare el sistema JIT con el modelo EOQ...&quot;</p></CardContent></Card><div className="text-2xl my-4">👇</div><div className="flex flex-wrap justify-center gap-3"><Badge variant="secondary">Dominio: Cadena de Suministro</Badge><Badge variant="secondary">Conocimiento: Conceptual</Badge><Badge variant="destructive">Nivel: Analizar</Badge></div></div>
            <div className="flex flex-col gap-4"><Card><CardHeader><CardTitle>1. Dominio Temático</CardTitle><CardContent className="pt-4"><p>Es el área de contenido principal. Nos dice <span className="font-semibold text-primary">&apos;de qué&apos;</span> trata la pregunta.</p></CardContent></CardHeader></Card><Card><CardHeader><CardTitle>2. Tipo de Conocimiento</CardTitle><CardContent className="pt-4"><p>Clasifica la naturaleza del saber evaluado. Nos dice <span className="font-semibold text-primary">&apos;qué clase&apos;</span> de información es.</p></CardContent></CardHeader></Card><Card><CardHeader><CardTitle>3. Nivel Cognitivo</CardTitle><CardContent className="pt-4"><p>Define la habilidad mental requerida. Nos dice <span className="font-semibold text-primary">&apos;cómo pensar&apos;</span> para responder.</p></CardContent></CardHeader></Card></div>
          </div>
        </section>
        <section id="interactive-example" className="flex flex-col items-center justify-center p-8 md:p-12 min-h-screen bg-secondary">
            <div className="text-center mb-10"><h2 className="text-3xl md:text-5xl font-bold">La Magia en Acción: El Viaje de un Concepto</h2><p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">Explora cómo un único concepto, la gestión de inventarios <span className="font-semibold text-foreground">Just-In-Time (JIT)</span>, se evalúa en todos los niveles de profundidad cognitiva.</p></div>
            <Tabs defaultValue="recordar" className="w-full max-w-2xl"><TabsList className="grid w-full grid-cols-3 sm:grid-cols-6"><TabsTrigger value="recordar">Recordar</TabsTrigger><TabsTrigger value="comprender">Comprender</TabsTrigger><TabsTrigger value="aplicar">Aplicar</TabsTrigger><TabsTrigger value="analizar">Analizar</TabsTrigger><TabsTrigger value="evaluar">Evaluar</TabsTrigger><TabsTrigger value="crear">Crear</TabsTrigger></TabsList><Card className="mt-4 bg-background"><CardContent className="p-6 min-h-[200px]"><TabsContent value="recordar"><p className="text-sm text-muted-foreground">PREGUNTA DE NIVEL 1:</p><p className="text-lg font-medium mt-2">&quot;Defina el concepto de gestión de inventarios Just-In-Time (JIT).&quot;</p></TabsContent><TabsContent value="comprender"><p className="text-sm text-muted-foreground">PREGUNTA DE NIVEL 2:</p><p className="text-lg font-medium mt-2">&quot;Explique con sus propias palabras dos ventajas y dos desventajas de implementar un sistema JIT en una empresa manufacturera.&quot;</p></TabsContent><TabsContent value="aplicar"><p className="text-sm text-muted-foreground">PREGUNTA DE NIVEL 3:</p><p className="text-lg font-medium mt-2">&quot;Una empresa tiene un costo de almacenamiento de 50 € por unidad/mes. Al implementar JIT, reduce su inventario de 1,000 a 150 unidades. ¿Cuál es el ahorro mensual?&quot;</p></TabsContent><TabsContent value="analizar"><p className="text-sm text-muted-foreground">PREGUNTA DE NIVEL 4:</p><p className="text-lg font-medium mt-2">&quot;Compare el sistema JIT con el modelo de Cantidad Económica de Pedido (EOQ), analizando las diferencias en sus supuestos y aplicabilidad.&quot;</p></TabsContent><TabsContent value="evaluar"><p className="text-sm text-muted-foreground">PREGUNTA DE NIVEL 5:</p><p className="text-lg font-medium mt-2">&quot;Argumente a favor o en contra: &apos;La volatilidad de las cadenas de suministro globales ha hecho que el modelo JIT sea obsoleto y demasiado arriesgado&apos;. Justifique su postura.&quot;</p></TabsContent><TabsContent value="crear"><p className="text-sm text-muted-foreground">PREGUNTA DE NIVEL 6:</p><p className="text-lg font-medium mt-2">&quot;Diseñe un plan de implementación de un sistema JIT híbrido para una pequeña empresa de comercio electrónico, incluyendo los KPIs para medir el éxito.&quot;</p></TabsContent></CardContent></Card></Tabs>
        </section>

        {/* ======================================================================= */}
        {/* PANTALLA 7: LA VISIÓN ESTRATÉGICA (LA MATRIZ)                           */}
        {/* ======================================================================= */}
        <section id="competency-matrix" className="flex flex-col items-center justify-center p-8 md:p-12 min-h-screen bg-background">
          <div className="text-center mb-10">
              <h2 className="text-3xl md:text-5xl font-bold">
                  La Visión Estratégica: Matriz de Competencias
              </h2>
              {/* 👇 CORRECCIÓN 1: Se reemplazaron las comillas simples */}
              <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                  Este es nuestro &apos;cuadro de mando&apos;. Cruzamos los <span className="font-semibold text-foreground">Dominios Temáticos</span> con los <span className="font-semibold text-foreground">Niveles Cognitivos</span> para obtener una vista panorámica de todo el banco de preguntas.
              </p>
          </div>

          <Card className="w-full max-w-4xl overflow-x-auto">
            <CardContent className="p-4">
              <table className="w-full text-sm text-left">
                <thead className="border-b">
                  <tr>
                    <th className="p-2 font-semibold">Nivel Cognitivo</th>
                    <th className="p-2 font-semibold text-center">Dominio A: Finanzas</th>
                    <th className="p-2 font-semibold text-center">Dominio B: Operaciones</th>
                    <th className="p-2 font-semibold text-center">Dominio C: Liderazgo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="p-2 font-semibold">6. Crear</td><td className="p-2 text-center"><span className="font-mono text-xs">Total: 2<br />(C:1, P:1)</span></td><td className="p-2 text-center bg-red-100 dark:bg-red-900/30"><span className="font-mono text-xs font-bold text-destructive">Total: 0</span></td><td className="p-2 text-center"><span className="font-mono text-xs">Total: 1<br />(P:1)</span></td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold">5. Evaluar</td><td className="p-2 text-center"><span className="font-mono text-xs">Total: 8<br />(F:1, C:5, P:2)</span></td><td className="p-2 text-center"><span className="font-mono text-xs">Total: 5<br />(C:4, P:1)</span></td><td className="p-2 text-center"><span className="font-mono text-xs">Total: 7<br />(F:2, C:5)</span></td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold">4. Analizar</td><td className="p-2 text-center"><span className="font-mono text-xs">Total: 15<br />(F:4, C:8, P:3)</span></td><td className="p-2 text-center"><span className="font-mono text-xs">Total: 12<br />(F:3, C:7, P:2)</span></td><td className="p-2 text-center"><span className="font-mono text-xs">Total: 11<br />(F:3, C:6, P:2)</span></td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold">3. Aplicar</td><td className="p-2 text-center"><span className="font-mono text-xs">Total: 25<br />(F:8, C:7, P:10)</span></td><td className="p-2 text-center"><span className="font-mono text-xs">Total: 18<br />(F:5, C:5, P:8)</span></td><td className="p-2 text-center"><span className="font-mono text-xs">Total: 22<br />(F:7, C:6, P:9)</span></td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold">2. Comprender</td><td className="p-2 text-center"><span className="font-mono text-xs">Total: 40<br />(F:20, C:18, P:2)</span></td><td className="p-2 text-center"><span className="font-mono text-xs">Total: 35<br />(F:18, C:15, P:2)</span></td><td className="p-2 text-center"><span className="font-mono text-xs">Total: 38<br />(F:19, C:17, P:2)</span></td></tr>
                  <tr><td className="p-2 font-semibold">1. Recordar</td><td className="p-2 text-center"><span className="font-mono text-xs">Total: 50<br />(F:35, C:15)</span></td><td className="p-2 text-center"><span className="font-mono text-xs">Total: 45<br />(F:30, C:15)</span></td><td className="p-2 text-center"><span className="font-mono text-xs">Total: 48<br />(F:32, C:16)</span></td></tr>
                </tbody>
              </table>
              <p className="mt-4 text-xs text-muted-foreground">Nota: F (Fáctico), C (Conceptual), P (Procedimental).</p>
            </CardContent>
          </Card>
          
          {/* 👇 CORRECCIÓN 2: Se reemplazaron las comillas simples en esta sección */}
          <div className="mt-8 w-full max-w-4xl grid md:grid-cols-2 gap-4 text-left">
              <div><h3 className="font-semibold">🎯 Herramienta de Diagnóstico</h3><p className="text-sm text-muted-foreground">La matriz revela instantáneamente los &apos;puntos ciegos cognitivos&apos;. Una celda con Total: 0, como la resaltada, indica una carencia total de preguntas para ese nivel.</p></div>
              <div><h3 className="font-semibold">⚖️ Análisis de Equilibrio</h3><p className="text-sm text-muted-foreground">Permite ver si hay una sobreconcentración en preguntas de memorización (&apos;Recordar&apos;) y una escasez en preguntas de pensamiento crítico (&apos;Evaluar&apos; y &apos;Crear&apos;).</p></div>
          </div>
        </section>
    {/* ======================================================================= */}
        {/* PANTALLA 8: EL DASHBOARD DE RESULTADOS (NUEVA)                          */}
        {/* ======================================================================= */}
        <section id="dashboard" className="flex flex-col items-center justify-center p-4 md:p-8 min-h-screen bg-secondary">
            <div className="text-center mb-10 max-w-4xl">
                <h2 className="text-3xl md:text-5xl font-bold">El Valor Real: Un Dashboard para la Toma de Decisiones</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    Toda la arquitectura se traduce en datos accionables. Visualiza la salud de tu organización, detecta brechas de talento y planifica el desarrollo de competencias a todos los niveles.
                </p>
            </div>

            <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* --- GRÁFICO DE RADAR --- */}
                <Card className="col-span-1 lg:col-span-1 bg-background">
                    <CardHeader>
                        <CardTitle>Vista Organizacional por Competencia</CardTitle>
                        <CardDescription>Comparativo entre departamentos clave.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={radarChartData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <Tooltip />
                                <Legend />
                                <Radar name="Operaciones" dataKey="Operaciones" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                <Radar name="Finanzas" dataKey="Finanzas" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                                <Radar name="Liderazgo" dataKey="Liderazgo" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* --- GRÁFICO DE BARRAS --- */}
                <Card className="col-span-1 lg:col-span-1 bg-background">
                    <CardHeader>
                        <CardTitle>Drill-Down: Departamento de Operaciones</CardTitle>
                        <CardDescription>Distribución del personal por nivel de dominio.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="Personal" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* --- TABLA DE DETALLE --- */}
                <Card className="col-span-1 lg:col-span-2 bg-background">
                    <CardHeader>
                        <CardTitle>Detalle del Personal - Operaciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Nivel General</TableHead>
                                    <TableHead className="text-right">Progreso de Desarrollo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tableData.map((person) => (
                                    <TableRow key={person.name}>
                                        <TableCell className="font-medium">{person.name}</TableCell>
                                        <TableCell>{person.level}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span>{person.progress}%</span>
                                                <Progress value={person.progress} className="w-[100px]" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </section>
      </main>
    </div>
  );
}
      