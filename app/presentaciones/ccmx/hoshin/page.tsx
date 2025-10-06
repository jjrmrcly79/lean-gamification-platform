"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/**
 * CCMX Hoshin Kanri – Presentación Interactiva
 * - Navegación por flechas y botones
 * - TOC con buscador (Ctrl/Cmd+K)
 * - Toggle light/dark (tecla D)
 * - Imprimir (tecla P)
 * - Matriz X interactiva + export JSON
 *
 * Integración recomendada:
 * - Crear ruta /presentaciones/ccmx y renderizar <CcmxHoshinPresentation />
 * - Tailwind + shadcn/ui ya integrados en el proyecto
 */

export default function CcmxHoshinPresentation() {
  // Tema local (respeta tema global si existe)
  const [isLight, setIsLight] = useState(false);

  const slides = useMemo<Slide[]>(
    () => [
      {
        id: "portada",
        title: "Portada",
        content: (
          <Card className="max-w-5xl w-[92vw]">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-teal-500" />
                Centro de Competitividad de México
              </div>
              <CardTitle className="text-3xl md:text-4xl leading-tight">
                Uso de la metodología <em>Hoshin Kanri</em> para la Planeación y Gestión Estratégica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-lg">
                Diplomado en estrategia, planeación e innovación. Material adaptado a formato interactivo para CCMX.
              </p>
              <div className="mt-4">
                <Badge variant="outline">Versión React · Interactiva</Badge>
              </div>
            </CardContent>
          </Card>
        ),
      },
      {
        id: "objetivo",
        title: "Objetivo General",
        content: (
          <Card className="max-w-5xl w-[92vw]">
            <CardHeader>
              <CardTitle>Objetivo general</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-lg">
                Que el participante se forme una idea inicial de cómo usar la metodología <strong>Hoshin Kanri</strong> para beneficio de su negocio.
              </p>
              <div className="grid md:grid-cols-2 gap-3 mt-4">
                <div className="rounded-xl border bg-background/40 p-3">
                  <div className="text-sm font-semibold">Entregable</div>
                  <div className="text-sm text-muted-foreground">Mapa X (borrador) + 3 iniciativas tácticas</div>
                </div>
                <div className="rounded-xl border bg-background/40 p-3">
                  <div className="text-sm font-semibold">Tiempo estimado</div>
                  <div className="text-sm text-muted-foreground">90–120 min (taller)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ),
      },
      {
        id: "estrategia",
        title: "¿En qué consiste la estrategia?",
        content: (
          <Card className="max-w-5xl w-[92vw]">
            <CardHeader>
              <CardTitle>¿En qué consiste la estrategia?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <em>“…tomar decisiones para <strong>ganar</strong> en el mercado.”</em> — Michael Porter
                </li>
                <li>
                  <em>“La estrategia evoluciona”</em>: decisiones incrementales de todos los días.
                </li>
                <li>
                  <em>Creatividad</em>: pensamiento que cambia el juego.
                </li>
              </ul>
              <p className="mt-3 text-muted-foreground">
                Objetivo: diferenciarse, aportar valor percibido superior y ajustar según el entorno.
              </p>
            </CardContent>
          </Card>
        ),
      },
      {
        id: "gestion",
        title: "Gestión estratégica",
        content: (
          <Card className="max-w-5xl w-[92vw]">
            <CardHeader>
              <CardTitle>¿Qué es la gestión estratégica?</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Desarrollar, comunicar, liderar y dar seguimiento a tácticas, acciones y resultados derivados de una estrategia.
              </p>
              <div className="grid md:grid-cols-3 gap-3 mt-4">
                {[
                  ["Largo plazo", "Ventaja competitiva"],
                  ["Corto plazo", "Planes + ejecución"],
                  ["Mejora", "Integración continua"],
                ].map(([t, s]) => (
                  <div key={t} className="rounded-xl border bg-background/40 p-3">
                    <div className="text-sm font-semibold">{t}</div>
                    <div className="text-sm text-muted-foreground">{s}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ),
      },
      {
        id: "beneficios",
        title: "Beneficios de la gestión estratégica",
        content: (
          <Card className="max-w-5xl w-[92vw]">
            <CardHeader>
              <CardTitle>Beneficios de la gestión estratégica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  ["Dirección", "Sentido claro"],
                  ["Priorización", "Menos ruido"],
                  ["Desempeño", "Mejora medible"],
                  ["Coordinación", "Mejor alineación"],
                  ["Riesgo", "Menos incertidumbre"],
                  ["Cambio", "Menor resistencia"],
                ].map(([t, s]) => (
                  <div key={t} className="rounded-xl border bg-background/40 p-3">
                    <div className="text-sm font-semibold">{t}</div>
                    <div className="text-sm text-muted-foreground">{s}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ),
      },
      {
        id: "jerarquia",
        title: "Jerarquía estratégica",
        content: (
          <Card className="max-w-5xl w-[92vw]">
            <CardHeader>
              <CardTitle>Jerarquía estratégica</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Corporativa</strong> → ADN estratégico (visión, misión, expectativas).
                </li>
                <li>
                  <strong>Negocio</strong> → estrategias e indicadores por unidad.
                </li>
                <li>
                  <strong>Funcional</strong> → áreas habilitan metas de negocio.
                </li>
                <li>
                  <strong>Operativa</strong> → operación diaria y core.
                </li>
              </ul>
            </CardContent>
          </Card>
        ),
      },
      {
        id: "modelos",
        title: "Modelos: Cascade / Hoshin / OKR",
        content: (
          <Card className="max-w-5xl w-[92vw]">
            <CardHeader>
              <CardTitle>Modelos estratégicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  ["Cascade", "Jerárquico"],
                  ["Hoshin Kanri", "Matriz X"],
                  ["OKR", "Objetivos & resultados"],
                ].map(([t, s]) => (
                  <div key={t} className="rounded-xl border bg-background/40 p-3">
                    <div className="text-sm font-semibold">{t}</div>
                    <div className="text-sm text-muted-foreground">{s}</div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-muted-foreground">En esta sesión usamos Hoshin Kanri (Matriz X).</p>
            </CardContent>
          </Card>
        ),
      },
      {
        id: "adn",
        title: "ADN estratégico",
        content: (
          <Card className="max-w-5xl w-[92vw]">
            <CardHeader>
              <CardTitle>ADN estratégico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  ["Visión", "¿Hacia dónde vamos?"],
                  ["Misión", "¿Quiénes somos?"],
                  ["Valores", "¿Cómo actuamos?"],
                ].map(([t, s]) => (
                  <div key={t} className="rounded-xl border bg-background/40 p-3">
                    <div className="text-sm font-semibold">{t}</div>
                    <div className="text-sm text-muted-foreground">{s}</div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-muted-foreground">Define áreas de enfoque y objetivos derivados.</p>
            </CardContent>
          </Card>
        ),
      },
      {
        id: "simplificacion",
        title: "Estrategia simplificada",
        content: (
          <Card className="max-w-5xl w-[92vw]">
            <CardHeader>
              <CardTitle>Una sobre-simplificación de la estrategia</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                <li>Subir precio (si el valor lo permite)</li>
                <li>Bajar costo (eficiencia)</li>
                <li>Ambas (valor ↑ + costo ↓)</li>
              </ul>
            </CardContent>
          </Card>
        ),
      },
      {
        id: "matriz-x",
        title: "Matriz X (interactiva)",
        content: <XMatrixCard />,
      },
      {
        id: "historia",
        title: "Historia & propósito",
        content: (
          <Card className="max-w-5xl w-[92vw]">
            <CardHeader>
              <CardTitle>Historia & propósito</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Deriva del <em>Hoshin Kanri</em> japonés y administración por objetivos (Drucker).
                </li>
                <li>Practicado por Toyota, Bridgestone, GE; paralelo al Balanced Scorecard.</li>
                <li>
                  Propósito: alinear resultados esperados, estrategias, procesos, tácticas y responsables.
                </li>
              </ul>
            </CardContent>
          </Card>
        ),
      },
      {
        id: "proceso-1-4",
        title: "Proceso de construcción (1–4)",
        content: (
          <Card className="max-w-5xl w-[92vw]">
            <CardHeader>
              <CardTitle>Proceso de construcción (1–4)</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  <strong>Resultados</strong> (financieros y no financieros).
                </li>
                <li>
                  <strong>Estrategias</strong> (2–5 apuestas claras: costo, innovación, servicio…).
                </li>
                <li>
                  <strong>Acciones tácticas</strong> (proyectos clave: Lean, Seis Sigma, SMED, QFD…).
                </li>
                <li>
                  <strong>Desempeño de procesos</strong> (metas medibles con fecha).
                </li>
              </ol>
            </CardContent>
          </Card>
        ),
      },
      {
        id: "proceso-5-7",
        title: "Proceso de construcción (5–7)",
        content: (
          <Card className="max-w-5xl w-[92vw]">
            <CardHeader>
              <CardTitle>Proceso de construcción (5–7)</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-6 space-y-2" start={5}>
                <li>
                  <strong>Correlaciones</strong> (0–3: apoyo→impacto mayor).
                </li>
                <li>
                  <strong>Personas</strong> (líder, equipo, contribuyentes, invitados, no involucrados).
                </li>
                <li>
                  <strong>Despliegue</strong> (comunicación bidireccional, revisión mensual, cierre).
                </li>
              </ol>
            </CardContent>
          </Card>
        ),
      },
      {
        id: "taller",
        title: "Taller rápido",
        content: (
          <Card className="max-w-5xl w-[92vw]">
            <CardHeader>
              <CardTitle>Mini taller: llena tu X</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Escribe 2–3 <strong>resultados</strong> para 12 meses.</li>
                <li>Define 2–4 <strong>estrategias</strong>.</li>
                <li>Lista 3–6 <strong>tácticas</strong> (proyectos).</li>
                <li>Fija 3–5 <strong>KPIs de proceso</strong> (con fecha).</li>
                <li>Marca correlaciones en la cuadricula de arriba.</li>
              </ol>
            </CardContent>
          </Card>
        ),
      },
      {
        id: "cierre",
        title: "Cierre",
        content: (
          <Card className="max-w-5xl w-[92vw]">
            <CardHeader>
              <CardTitle>Cierre</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Hoshin Kanri integra estrategia, ejecución y aprendizaje. La clave es <em>menos pero mejor</em>,
                disciplina en la revisión y comunicación clara.
              </p>
            </CardContent>
          </Card>
        ),
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const pct = ((index + 1) / slides.length) * 100;
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Navegación con teclado
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, slides.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
      if (e.key.toLowerCase() === "p") window.print();
      if (e.key.toLowerCase() === "d") setIsLight((v) => !v);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  const filtered = useMemo(() => slides.map((s) => s.title), [slides]);

  return (
    <div className={cn("min-h-screen", isLight ? "" : "dark")}> {/* toggle local */}
      <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] min-h-screen bg-background text-foreground transition-colors">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col gap-3 border-r p-4">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-teal-500" />
            <span className="font-semibold">CCMX</span>
            <span className="opacity-60">·</span>
            <span>Hoshin</span>
          </div>
          <Input ref={searchRef} placeholder="Buscar sección… (⌘/Ctrl+K)" className="h-9" />
          <ScrollArea className="h-[calc(100vh-140px)] pr-2">
            <div ref={listRef} className="flex flex-col gap-1">
              {filtered.map((t, i) => (
                <Button
                  key={t}
                  variant={i === index ? "secondary" : "ghost"}
                  className="justify-start h-9"
                  onClick={() => setIndex(i)}
                >
                  {t}
                </Button>
              ))}
            </div>
          </ScrollArea>
          <div className="text-xs text-muted-foreground">
            Navega con ← → · tecla <kbd className="px-1 border rounded">D</kbd> (tema) · <kbd className="px-1 border rounded">P</kbd> (imprimir)
          </div>
        </aside>

        {/* Main */}
        <main className="relative">
          {/* Toolbar */}
          <div className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex items-center gap-2 p-2">
              <Button variant="outline" onClick={() => setIndex((i) => Math.max(i - 1, 0))}>
                ← Anterior
              </Button>
              <Button onClick={() => setIndex((i) => Math.min(i + 1, slides.length - 1))}>
                Siguiente →
              </Button>
              <span className="text-sm text-muted-foreground ml-1">
                {index + 1} / {slides.length}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" onClick={() => setIsLight((v) => !v)}>
                  {isLight ? "🌙 Oscuro" : "☀️ Claro"}
                </Button>
                <Button variant="outline" onClick={() => window.print()}>🖨️ Imprimir</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
                    else document.exitFullscreen();
                  }}
                >
                  ⤢ Pantalla completa
                </Button>
              </div>
            </div>
            <div className="px-2 pb-2">
              <Progress value={pct} className="h-1" />
            </div>
          </div>

          {/* Slide viewport */}
          <section className="grid place-items-center px-4 py-8">
            <motion.div
              key={slides[index].id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full flex justify-center"
            >
              {slides[index].content}
            </motion.div>
          </section>
        </main>
      </div>
    </div>
  );
}

// ————————————————————————————————————————
// Tipos
interface Slide {
  id: string;
  title: string;
  content: React.ReactNode;
}

// ————————————————————————————————————————
// Matriz X interactiva
function XMatrixCard() {
  const [resultados, setResultados] = useState<string[]>([
    "Incrementar ganancias +50%",
    "Ventas +10%",
    "Certificación (Industria Limpia)",
  ]);
  const [estrategias, setEstrategias] = useState<string[]>([
    "Bajo costo",
    "Innovación",
    "Servicio excelente",
  ]);
  const [procesos, setProcesos] = useState<string[]>([
    "Satisfacción: ↓ devoluciones 50%",
    "SMED < 10 min",
    "Multihabilidades 100% (Línea B)",
  ]);
  const [acciones, setAcciones] = useState<string[]>([
    "Lean en todas las plantas",
    "DFSS en Ingeniería",
    "Cambio rápido en prensas",
    "QFD nuevo producto",
  ]);

  // 4 correlaciones simplificadas (0–3)
  const labels = [
    "Estrategias → Resultados",
    "Estrategias → Procesos",
    "Procesos → Acciones",
    "Acciones → Resultados",
  ];
  const [niveles, setNiveles] = useState<number[]>([0, 0, 0, 0]);

  function cycle(i: number) {
    setNiveles((prev) => prev.map((v, idx) => (idx === i ? (v + 1) % 4 : v)));
  }

  function exportJSON() {
    const payload = {
      resultados,
      estrategias,
      procesos,
      acciones,
      correlaciones: labels.map((l, i) => ({ rel: l, nivel: niveles[i] })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mapa_x_ccmx.json";
    a.click();
  }

  return (
    <Card className="max-w-5xl w-[92vw]">
      <CardHeader>
        <CardTitle>Matriz Hoshin Kanri (X)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <Box title="Resultados" items={resultados} onChange={setResultados} />
          <Box title="Estrategias" items={estrategias} onChange={setEstrategias} />
          <Box title="Desempeño de procesos" items={procesos} onChange={setProcesos} />
          <Box title="Acciones tácticas" items={acciones} onChange={setAcciones} />
        </div>

        <div className="grid md:grid-cols-4 gap-2">
          {labels.map((lab, i) => (
            <Button
              key={lab}
              variant={niveles[i] > 0 ? "secondary" : "outline"}
              className={cn("justify-between", niveles[i] > 0 && "border-teal-500")}
              onClick={() => cycle(i)}
            >
              <span>{lab}</span>
              <span className="text-muted-foreground">· {niveles[i]}</span>
            </Button>
          ))}
        </div>

        <div className="rounded-lg border p-3 text-sm text-muted-foreground">
          Haz clic en los botones para marcar correlaciones (0/1/2/3). Puedes editar las listas y luego exportar el JSON del mapa.
        </div>

        <div className="flex gap-2">
          <Button onClick={exportJSON}>⬇️ Exportar Mapa X (JSON)</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Box({ title, items, onChange }: { title: string; items: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState("");
  function addItem() {
    const t = text.trim();
    if (!t) return;
    onChange([...
      new Set([...items, t])
    ]);
    setText("");
  }
  function removeItem(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }
  return (
    <div className="rounded-xl border p-3">
      <div className="font-semibold mb-2">{title}</div>
      <div className="flex gap-2 mb-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Añadir ítem…"
          onKeyDown={(e) => e.key === "Enter" && addItem()}
        />
        <Button onClick={addItem}>Agregar</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((it, i) => (
          <Badge key={i} variant="outline" className="group whitespace-normal">
            <span>{it}</span>
            <button
              onClick={() => removeItem(i)}
              className="ml-2 opacity-60 group-hover:opacity-100 hover:text-destructive"
              aria-label="Eliminar"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
