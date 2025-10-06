"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// Usa tus componentes shadcn/ui o los wrappers mínimos
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase-client";

// ---------- Tipos Realtime (sin any) ----------
type NavPayload = { i: number };
type NotePayload = { id: string; text: string; at: number; from?: string };
type MatrixSuggestion = {
  id: string;
  kind: "resultado" | "estrategia" | "proceso" | "accion";
  text: string;
  at: number;
  from?: string;
};
type BroadcastEnvelope<T> = { event: string; type: "broadcast"; payload: T };

interface Slide {
  id: string;
  title: string;
  content: React.ReactNode;
}

// =================================================
// Componente principal
// =================================================
export default function CcmxHoshinPresentation() {
  const supabase = useMemo(() => createClient(), []);

  // ===== Branding =====
  const LOGO_SRC = "/logo.svg"; // cambia si tu logo vive en otro path

  // Rol y sala (query params)
  const params = useMemo(
    () =>
      new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : ""
      ),
    []
  );
  const roleParam = params.get("role");
  const isAudience = roleParam === "aud" || roleParam === "audience";

  const roomId = useMemo<string>(() => {
    const q = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );
    return q.get("room") || Math.random().toString(36).slice(2, 8);
  }, []);

  // UI state
  const [showTOC, setShowTOC] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [index, setIndex] = useState(0);
  const [audienceMsg, setAudienceMsg] = useState("");
  const [wall, setWall] = useState<Array<NotePayload>>([]);
  const [showPanel, setShowPanel] = useState(false); // drawer móvil

  const slides = useMemo<Slide[]>(() => buildSlides(LOGO_SRC), [LOGO_SRC]);
  const pct = ((index + 1) / slides.length) * 100;

  // ===== Realtime: suscripción (recibir eventos) =====
  useEffect(() => {
    const channel = supabase.channel(`ccmx_room_${roomId}`);

    channel.on(
      "broadcast",
      { event: "nav" },
      (env: BroadcastEnvelope<NavPayload>) => {
        if (isAudience) setIndex(env.payload?.i ?? 0);
      }
    );

    channel.on(
      "broadcast",
      { event: "note" },
      (env: BroadcastEnvelope<NotePayload>) => {
        const item = env.payload;
        setWall((prev) => [item, ...prev].slice(0, 200));
      }
    );

    channel.on(
      "broadcast",
      { event: "matrix_suggest" },
      (env: BroadcastEnvelope<MatrixSuggestion>) => {
        const s = env.payload;
        window.dispatchEvent(
          new CustomEvent<MatrixSuggestion>("matrix_suggest", { detail: s })
        );
      }
    );

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, supabase, isAudience]);

  // ===== Realtime: broadcast de navegación (solo presentador) =====
  useEffect(() => {
    if (isAudience) return;
    const channel = supabase.channel(`ccmx_room_${roomId}`);
    channel.send({ type: "broadcast", event: "nav", payload: { i: index } });
  }, [index, isAudience, roomId, supabase]);

  // ===== Teclado =====
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight")
        setIndex((i) => Math.min(i + 1, slides.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
      if (e.key.toLowerCase() === "p") window.print();
      if (e.key.toLowerCase() === "d") setIsLight((v) => !v);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowTOC(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  const joinUrl = useMemo(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    return `${base}/presentaciones/ccmx/hoshin?role=aud&room=${roomId}`;
  }, [roomId]);

  return (
    <div className={cn("min-h-screen", isLight ? "" : "dark")}>
      <div className="grid grid-cols-1 md:grid-cols-[1fr] min-h-screen bg-background text-foreground">
        {/* Toolbar superior */}
        <div className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center gap-2 p-2">
            <div className="flex items-center gap-2 mr-2">
              <Image
                src={LOGO_SRC}
                alt="Logo"
                width={20}
                height={20}
                className="rounded"
              />
              <span className="font-semibold">CCMX</span>
              <span className="opacity-60">·</span>
              <span>Hoshin</span>
            </div>
            {!isAudience && (
              <Button
                variant="outline"
                onClick={() => setIndex((i) => Math.max(i - 1, 0))}
              >
                ← Anterior
              </Button>
            )}
            {!isAudience && (
              <Button
                onClick={() =>
                  setIndex((i) => Math.min(i + 1, slides.length - 1))
                }
              >
                Siguiente →
              </Button>
            )}
            <span className="text-sm text-muted-foreground ml-1">
              {index + 1} / {slides.length}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsLight((v) => !v)}>
                {isLight ? "🌙 Oscuro" : "☀️ Claro"}
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                🖨️ Imprimir
              </Button>
              <Button variant="outline" onClick={() => setShowTOC((v) => !v)}>
                {showTOC ? "▢ Ocultar índice" : "☰ Índice"}
              </Button>
              <Button
                variant="outline"
                className="md:hidden"
                onClick={() => setShowPanel(true)}
              >
                💬 Interacción
              </Button>
              {!isAudience && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!document.fullscreenElement)
                      document.documentElement.requestFullscreen();
                    else document.exitFullscreen();
                  }}
                >
                  ⤢ Pantalla completa
                </Button>
              )}
            </div>
          </div>
          <div className="px-2 pb-2">
            <Progress value={pct} className="h-1" />
          </div>
        </div>

        {/* Vista principal */}
        <main className="relative">
          <section className="grid md:grid-cols-[minmax(0,1fr),380px] gap-0">
            {/* Slide */}
            <div className="min-h-[calc(100vh-70px)] grid place-items-center p-4">
              <motion.div
                key={slides[index].id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full flex justify-center"
              >
                <div className="w-full max-w-5xl">{slides[index].content}</div>
              </motion.div>
            </div>

            {/* Panel lateral (desktop) */}
            <aside className="border-l p-3 hidden md:block">
              {!isAudience ? (
                <PresenterPanel
                  roomId={roomId}
                  joinUrl={joinUrl}
                  wall={wall}
                  setIndex={setIndex}
                  slides={slides}
                />
              ) : (
                <AudiencePanel
                  roomId={roomId}
                  joinUrl={joinUrl}
                  audienceMsg={audienceMsg}
                  setAudienceMsg={setAudienceMsg}
                />
              )}
            </aside>
          </section>

          {/* Drawer TOC */}
          {showTOC && (
            <div
              className="fixed inset-0 z-30 bg-black/50"
              onClick={() => setShowTOC(false)}
            >
              <div
                className="absolute left-0 top-0 h-full w-[320px] bg-background border-r p-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Image
                    src={LOGO_SRC}
                    alt="Logo"
                    width={18}
                    height={18}
                    className="rounded"
                  />
                  <span className="font-semibold">Índice</span>
                </div>
                <ScrollArea className="h-[calc(100vh-100px)] pr-2">
                  <div className="flex flex-col gap-1">
                    {slides.map((s, i) => (
                      <Button
                        key={s.id}
                        variant={i === index ? "secondary" : "ghost"}
                        className="justify-start h-9"
                        onClick={() => {
                          setIndex(i);
                          setShowTOC(false);
                        }}
                      >
                        {i + 1}. {s.title}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
                <div className="text-xs text-muted-foreground mt-2">
                  Tip: ⌘/Ctrl+K para abrir rápido.
                </div>
              </div>
            </div>
          )}

          {/* Drawer Interacción (móvil) */}
          {showPanel && (
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setShowPanel(false)}
            >
              <div
                className="absolute bottom-0 left-0 right-0 h-[70vh] bg-background border-t p-3 rounded-t-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {!isAudience ? (
                  <PresenterPanel
                    roomId={roomId}
                    joinUrl={joinUrl}
                    wall={wall}
                    setIndex={setIndex}
                    slides={slides}
                  />
                ) : (
                  <AudiencePanel
                    roomId={roomId}
                    joinUrl={joinUrl}
                    audienceMsg={audienceMsg}
                    setAudienceMsg={setAudienceMsg}
                  />
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// =================================================
// Panel del presentador
// =================================================
function PresenterPanel({
  roomId,
  joinUrl,
  wall,
  setIndex,
  slides,
}: {
  roomId: string;
  joinUrl: string;
  wall: Array<NotePayload>;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  slides: Slide[];
}) {
  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Audiencia: únanse con QR</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid place-items-center">
            <Image
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                joinUrl
              )}`}
              alt="QR para unirse"
              width={180}
              height={180}
              className="rounded"
            />
          </div>
          <Input readOnly value={joinUrl} className="text-xs" />
          <div className="text-xs text-muted-foreground">
            Sala: <Badge variant="outline">{roomId}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ir a slide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-1">
            {slides.map((s, i) => (
              <Button
                key={s.id}
                variant="outline"
                className="h-8 text-xs"
                onClick={() => setIndex(i)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Muro (mensajes entrantes)</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[240px] pr-2">
            <div className="space-y-2">
              {wall.length === 0 && (
                <div className="text-xs text-muted-foreground">
                  Aún no hay mensajes.
                </div>
              )}
              {wall.map((m) => (
                <div key={m.id} className="rounded-lg border p-2 text-sm">
                  <div className="text-xs text-muted-foreground">
                    {new Date(m.at).toLocaleTimeString()}{" "}
                    {m.from ? `· ${m.from}` : ""}
                  </div>
                  <div>{m.text}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// =================================================
// Panel de la audiencia
// =================================================
function AudiencePanel({
  roomId,
  joinUrl,
  audienceMsg,
  setAudienceMsg,
}: {
  roomId: string;
  joinUrl: string;
  audienceMsg: string;
  setAudienceMsg: (v: string) => void;
}) {
  const supabase = useMemo(() => createClient(), []);

  function sendNote(): void {
    const text = audienceMsg.trim();
    if (!text) return;
    const payload: NotePayload = { id: crypto.randomUUID(), text, at: Date.now() };
    const channel = supabase.channel(`ccmx_room_${roomId}`);
    channel.send({ type: "broadcast", event: "note", payload });
    setAudienceMsg("");
  }

  function suggestToMatrix(kind: MatrixSuggestion["kind"]): void {
    const text = audienceMsg.trim();
    if (!text) return;
    const payload: MatrixSuggestion = {
      id: crypto.randomUUID(),
      kind,
      text,
      at: Date.now(),
    };
    const channel = supabase.channel(`ccmx_room_${roomId}`);
    channel.send({ type: "broadcast", event: "matrix_suggest", payload });
    setAudienceMsg("");
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Estás en la sala</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input readOnly value={joinUrl} className="text-xs" />
          <div className="text-xs text-muted-foreground">
            Sala: <Badge variant="outline">{roomId}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Escribe al muro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            value={audienceMsg}
            onChange={(e) => setAudienceMsg(e.target.value)}
            placeholder="Tu comentario o pregunta…"
            onKeyDown={(e) => e.key === "Enter" && sendNote()}
          />
          <div className="flex gap-2">
            <Button onClick={sendNote}>Enviar</Button>
            <Button variant="outline" onClick={() => suggestToMatrix("resultado")}>
              Proponer Resultado
            </Button>
            <Button variant="outline" onClick={() => suggestToMatrix("estrategia")}>
              Proponer Estrategia
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => suggestToMatrix("proceso")}>
              Proponer Proceso
            </Button>
            <Button variant="outline" onClick={() => suggestToMatrix("accion")}>
              Proponer Acción
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =================================================
// Slides (14 secciones incluidas) – usa tu logo en portada
// =================================================
function buildSlides(logoSrc: string): Slide[] {
  return [
    {
      id: "portada",
      title: "Portada",
      content: (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Image src={logoSrc} alt="Logo" width={20} height={20} className="rounded" />
              <span>Centro de Competitividad de México</span>
            </div>
            <CardTitle className="text-3xl md:text-4xl leading-tight">
              Uso de la metodología <em>Hoshin Kanri</em> para la Planeación y Gestión Estratégica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-lg">
              Diplomado en estrategia, planeación e innovación. Versión React sincronizable con audiencia.
            </p>
            <div className="mt-4">
              <Badge variant="outline">Presentador / Audiencia</Badge>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "objetivo",
      title: "Objetivo General",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Objetivo general</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-lg">
              Formar una idea inicial de cómo usar <strong>Hoshin Kanri</strong> en su negocio.
            </p>
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <div className="rounded-xl border bg-background/40 p-3">
                <div className="text-sm font-semibold">Entregable</div>
                <div className="text-sm text-muted-foreground">Mapa X (borrador) + 3 iniciativas</div>
              </div>
              <div className="rounded-xl border bg-background/40 p-3">
                <div className="text-sm font-semibold">Tiempo</div>
                <div className="text-sm text-muted-foreground">90–120 min</div>
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
        <Card>
          <CardHeader>
            <CardTitle>¿En qué consiste la estrategia?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <em>“…tomar decisiones para <strong>ganar</strong> en el mercado.”</em> — Michael Porter
              </li>
              <li>
                <em>La estrategia evoluciona</em>: decisiones incrementales de todos los días.
              </li>
              <li>
                <em>Creatividad</em>: pensamiento que cambia el juego.
              </li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              Objetivo: diferenciarse, aportar valor superior y ajustar al entorno.
            </p>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "gestion",
      title: "Gestión estratégica",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>¿Qué es la gestión estratégica?</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Desarrollar, comunicar, liderar y dar seguimiento a tácticas, acciones y resultados derivados de una
              estrategia.
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
      title: "Beneficios de la gestión",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Beneficios de la gestión estratégica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-3">
              {["Dirección", "Priorización", "Desempeño", "Coordinación", "Riesgo", "Cambio"].map((t, i) => (
                <div key={t} className="rounded-xl border bg-background/40 p-3">
                  <div className="text-sm font-semibold">{t}</div>
                  <div className="text-sm text-muted-foreground">
                    {["Sentido claro", "Menos ruido", "Mejora medible", "Mejor alineación", "Menos incertidumbre", "Menor resistencia"][i]}
                  </div>
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
        <Card>
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
        <Card>
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
        <Card>
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
        <Card>
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
    { id: "matriz-x", title: "Matriz X (interactiva)", content: <XMatrixCard /> },
    {
      id: "historia",
      title: "Historia & propósito",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Historia & propósito</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Deriva del <em>Hoshin Kanri</em> japonés y administración por objetivos (Drucker).
              </li>
              <li>Practicado por Toyota, Bridgestone, GE; paralelo al Balanced Scorecard.</li>
              <li>Propósito: alinear resultados, estrategias, procesos, tácticas y responsables.</li>
            </ul>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "proceso-1-4",
      title: "Proceso de construcción (1–4)",
      content: (
        <Card>
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
        <Card>
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
        <Card>
          <CardHeader>
            <CardTitle>Mini taller: llena tu X</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Escribe 2–3 <strong>resultados</strong> (12 meses).</li>
              <li>Define 2–4 <strong>estrategias</strong>.</li>
              <li>Lista 3–6 <strong>tácticas</strong>.</li>
              <li>Fija 3–5 <strong>KPIs de proceso</strong> (con fecha).</li>
              <li>Marca correlaciones en la cuadricula.</li>
            </ol>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "cierre",
      title: "Cierre",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Cierre</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Hoshin Kanri integra estrategia, ejecución y aprendizaje. La clave es <em>menos pero mejor</em> y revisión
              disciplinada.
            </p>
          </CardContent>
        </Card>
      ),
    },
  ];
}

// =================================================
// Matriz X (presentador editable)
// =================================================
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

  const [niveles, setNiveles] = useState<number[]>([0, 0, 0, 0]);

  // recibir sugerencias desde la audiencia
  useEffect(() => {
    function onSuggest(e: Event) {
      const detail = (e as CustomEvent<MatrixSuggestion>).detail;
      if (!detail) return;
      if (detail.kind === "resultado")
        setResultados((p) => [...new Set([...p, detail.text])]);
      if (detail.kind === "estrategia")
        setEstrategias((p) => [...new Set([...p, detail.text])]);
      if (detail.kind === "proceso")
        setProcesos((p) => [...new Set([...p, detail.text])]);
      if (detail.kind === "accion")
        setAcciones((p) => [...new Set([...p, detail.text])]);
    }
    window.addEventListener("matrix_suggest", onSuggest as EventListener);
    return () =>
      window.removeEventListener("matrix_suggest", onSuggest as EventListener);
  }, []);

  function cycle(i: number) {
    setNiveles((prev) => prev.map((v, idx) => (idx === i ? (v + 1) % 4 : v)));
  }

  function exportJSON() {
    const payload = {
      resultados,
      estrategias,
      procesos,
      acciones,
      correlaciones: [
        { rel: "Estrategias → Resultados", nivel: niveles[0] },
        { rel: "Estrategias → Procesos", nivel: niveles[1] },
        { rel: "Procesos → Acciones", nivel: niveles[2] },
        { rel: "Acciones → Resultados", nivel: niveles[3] },
      ],
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mapa_x_ccmx.json";
    a.click();
  }

  return (
    <Card>
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
          {[
            "Estrategias → Resultados",
            "Estrategias → Procesos",
            "Procesos → Acciones",
            "Acciones → Resultados",
          ].map((lab, i) => (
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
          La audiencia puede proponer elementos; aquí se agregan automáticamente por tipo.
        </div>

        <div className="flex gap-2">
          <Button onClick={exportJSON}>⬇️ Exportar Mapa X (JSON)</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Box({
  title,
  items,
  onChange,
}: {
  title: string;
  items: string[];
  onChange: (v: string[]) => void;
}) {
  const [text, setText] = useState("");
  function addItem() {
    const t = text.trim();
    if (!t) return;
    onChange([...new Set([...items, t])]);
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
