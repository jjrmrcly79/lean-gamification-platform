"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// Componentes de shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase-client";

// ---- Definiciones de Tipos ----

interface Slide {
  id: string;
  title: string;
  content: React.ReactNode;
  cognitiveLevel?: 'Recordar' | 'Comprender' | 'Aplicar' | 'Analizar';
  knowledgeType?: 'Fáctico' | 'Conceptual' | 'Procedimental';
}

type NavPayload = { i: number };
type NotePayload = { id: string; text: string; at: number; from?: string };
type MatrixSuggestion = {
  id: string;
  kind: "resultado" | "estrategia" | "proceso" | "accion";
  text: string;
  at: number;
  from?: string;
};
type PollPayload = {
  slideId: string;
  choiceIndex: number;
  isCorrect: boolean;
};
type BroadcastEnvelope<T> = { event: string; type: "broadcast"; payload: T };

export default function CcmxHoshinPresentation() {
  const supabase = useMemo(() => createClient(), []);
  const LOGO_SRC = "/logo.png";

  const params = useMemo(() => new URLSearchParams(typeof window !== "undefined" ? window.location.search : ""), []);
  const roleParam = params.get("role");
  const isAudience = roleParam === "aud" || roleParam === "audience";

  const roomId = useMemo<string>(() => {
    const q = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    return q.get("room") || Math.random().toString(36).slice(2, 8);
  }, []);

  // ---- Estados del Componente ----
  const [index, setIndex] = useState(0);
  const [showTOC, setShowTOC] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [wall, setWall] = useState<Array<NotePayload>>([]);
  const [audienceMsg, setAudienceMsg] = useState("");
  const [pollResults, setPollResults] = useState<Record<string, { correct: number; incorrect: number }>>({});

  const slides = useMemo<Slide[]>(() => buildSlides(LOGO_SRC, roomId), [LOGO_SRC, roomId]);
  const pct = ((index + 1) / slides.length) * 100;

  const joinUrl = useMemo(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    return `${base}/presentaciones/ccmx/hoshin?role=aud&room=${roomId}`;
  }, [roomId]);

  // ---- Lógica de Efectos (Realtime y Teclado) ----

  useEffect(() => {
    const channel = supabase.channel(`ccmx_room_${roomId}`);

    channel.on("broadcast", { event: "nav" }, (env: BroadcastEnvelope<NavPayload>) => {
      if (isAudience) setIndex(env.payload?.i ?? 0);
    });
    channel.on("broadcast", { event: "note" }, (env: BroadcastEnvelope<NotePayload>) => {
      setWall((prev) => [env.payload, ...prev].slice(0, 200));
    });
    channel.on("broadcast", { event: "matrix_suggest" }, (env: BroadcastEnvelope<MatrixSuggestion>) => {
      window.dispatchEvent(new CustomEvent<MatrixSuggestion>("matrix_suggest", { detail: env.payload }));
    });
    channel.on("broadcast", { event: "poll_vote" }, (env: BroadcastEnvelope<PollPayload>) => {
      const vote = env.payload;
      setPollResults((prev) => {
        const current = prev[vote.slideId] || { correct: 0, incorrect: 0 };
        return { ...prev, [vote.slideId]: { correct: current.correct + (vote.isCorrect ? 1 : 0), incorrect: current.incorrect + (vote.isCorrect ? 0 : 1) } };
      });
    });

    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId, supabase, isAudience]);

  useEffect(() => {
    if (isAudience) return;
    const channel = supabase.channel(`ccmx_room_${roomId}`);
    channel.send({ type: "broadcast", event: "nav", payload: { i: index } });
  }, [index, isAudience, roomId, supabase]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, slides.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  // ---- Estructura Visual (JSX) ----
  return (
    <div className={cn("min-h-screen", isLight ? "" : "dark")}>
      <div className="grid grid-cols-1 md:grid-cols-[1fr] min-h-screen bg-background text-foreground">
        {/* Toolbar superior */}
        <div className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center gap-2 p-2">
            <div className="flex items-center gap-2 mr-2">
              <Image src={LOGO_SRC} alt="Logo" width={20} height={20} className="rounded" />
              <span className="font-semibold">CCMX</span><span className="opacity-60">·</span><span>Hoshin</span>
            </div>
            {!isAudience && (<><Button variant="outline" onClick={() => setIndex((i) => Math.max(i - 1, 0))}>←</Button><Button onClick={() => setIndex((i) => Math.min(i + 1, slides.length - 1))}>→</Button></>)}
            <span className="text-sm text-muted-foreground ml-1">{index + 1} / {slides.length}</span>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowTOC((v) => !v)}>☰ Índice</Button>
              <Button variant="outline" className="md:hidden" onClick={() => setShowPanel(true)}>💬</Button>
            </div>
          </div>
          <div className="px-2 pb-2"><Progress value={pct} className="h-1" /></div>
        </div>

        {/* Vista principal */}
        <main className="relative">
          <section className="grid md:grid-cols-[minmax(0,1fr),380px] gap-0">
            {/* Slide */}
            <div className="min-h-[calc(100vh-70px)] grid place-items-center p-4">
              <motion.div key={slides[index].id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="w-full flex justify-center">
                <div className="w-full max-w-5xl">{slides[index].content}</div>
              </motion.div>
            </div>

            {/* Panel lateral (desktop) */}
            <aside className="border-l p-3 hidden md:block">
              {!isAudience ? (<PresenterPanel roomId={roomId} joinUrl={joinUrl} wall={wall} setIndex={setIndex} slides={slides} index={index} pollResults={pollResults} />) : (<AudiencePanel roomId={roomId} joinUrl={joinUrl} audienceMsg={audienceMsg} setAudienceMsg={setAudienceMsg} />)}
            </aside>
          </section>

          {/* Drawer TOC */}
          {showTOC && (<div className="fixed inset-0 z-30 bg-black/50" onClick={() => setShowTOC(false)}><div className="absolute left-0 top-0 h-full w-[320px] bg-background border-r p-3" onClick={(e) => e.stopPropagation()}><div className="flex items-center gap-2 mb-2"><Image src={LOGO_SRC} alt="Logo" width={18} height={18} className="rounded" /><span className="font-semibold">Índice</span></div><ScrollArea className="h-[calc(100vh-100px)] pr-2"><div className="flex flex-col gap-1">{slides.map((s, i) => (<Button key={s.id} variant={i === index ? "secondary" : "ghost"} className="justify-start h-9" onClick={() => { setIndex(i); setShowTOC(false); }}>{i + 1}. {s.title}</Button>))}</div></ScrollArea></div></div>)}
          
          {/* Drawer Interacción (móvil) */}
          {showPanel && (<div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setShowPanel(false)}><div className="absolute bottom-0 left-0 right-0 h-[70vh] bg-background border-t p-3 rounded-t-2xl" onClick={(e) => e.stopPropagation()}>{!isAudience ? (<PresenterPanel roomId={roomId} joinUrl={joinUrl} wall={wall} setIndex={setIndex} slides={slides} index={index} pollResults={pollResults} />) : (<AudiencePanel roomId={roomId} joinUrl={joinUrl} audienceMsg={audienceMsg} setAudienceMsg={setAudienceMsg} />)}</div></div>)}
        </main>
      </div>
    </div>
  );
}

// ---- Componentes Adicionales ----

function PollResultsGraph({ results }: { results?: { correct: number; incorrect: number } }) {
  if (!results) return <div className="text-xs text-muted-foreground">Esperando respuestas...</div>;
  const total = results.correct + results.incorrect;
  const correctPct = total === 0 ? 0 : (results.correct / total) * 100;
  return (<div className="space-y-2 text-sm"><div className="flex items-center gap-2"><span className="w-[80px]">Correctas</span><div className="w-full bg-muted rounded-full h-4"><div className="bg-green-500 h-4 rounded-full" style={{ width: `${correctPct}%` }}></div></div><span className="w-[40px] text-right">{results.correct}</span></div><div className="flex items-center gap-2"><span className="w-[80px]">Incorrectas</span><div className="w-full bg-muted rounded-full h-4"><div className="bg-destructive h-4 rounded-full" style={{ width: `${100 - correctPct}%` }}></div></div><span className="w-[40px] text-right">{results.incorrect}</span></div><div className="text-xs text-muted-foreground text-right">Total: {total}</div></div>);
}

function PresenterPanel({ roomId, joinUrl, wall, setIndex, slides, index, pollResults }: { roomId: string; joinUrl: string; wall: Array<NotePayload>; setIndex: React.Dispatch<React.SetStateAction<number>>; slides: Slide[]; index: number; pollResults: Record<string, { correct: number; incorrect: number }>; }) {
  const currentResults = pollResults[slides[index]?.id];
  return (<div className="space-y-3"><Card><CardHeader className="pb-2"><CardTitle className="text-base">Unirse con QR</CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid place-items-center"><Image src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(joinUrl)}`} alt="QR" width={180} height={180} className="rounded"/></div><Input readOnly value={joinUrl} className="text-xs" /><div className="text-xs text-muted-foreground">Sala: <Badge variant="outline">{roomId}</Badge></div></CardContent></Card><Card><CardHeader className="pb-2"><CardTitle className="text-base">Ir a slide</CardTitle></CardHeader><CardContent><div className="grid grid-cols-4 gap-1">{slides.map((s, i) => (<Button key={s.id} variant="outline" className="h-8 text-xs" onClick={() => setIndex(i)}>{i + 1}</Button>))}</div></CardContent></Card>{currentResults && (<Card><CardHeader className="pb-2"><CardTitle className="text-base">Resultados Sondeo</CardTitle></CardHeader><CardContent><PollResultsGraph results={currentResults} /></CardContent></Card>)}<Card><CardHeader className="pb-2"><CardTitle className="text-base">Muro</CardTitle></CardHeader><CardContent><ScrollArea className="h-[240px] pr-2"><div className="space-y-2">{wall.length === 0 ? (<div className="text-xs text-muted-foreground">No hay mensajes.</div>) : (wall.map((m) => (<div key={m.id} className="rounded-lg border p-2 text-sm"><div className="text-xs text-muted-foreground">{new Date(m.at).toLocaleTimeString()}</div><div>{m.text}</div></div>)))}</div></ScrollArea></CardContent></Card></div>);
}

function AudiencePanel({ roomId, joinUrl, audienceMsg, setAudienceMsg }: { roomId: string; joinUrl: string; audienceMsg: string; setAudienceMsg: (v: string) => void; }) {
  const supabase = useMemo(() => createClient(), []);
  function sendNote() { const text = audienceMsg.trim(); if (!text) return; supabase.channel(`ccmx_room_${roomId}`).send({ type: "broadcast", event: "note", payload: { id: crypto.randomUUID(), text, at: Date.now() } }); setAudienceMsg(""); }
  return (<div className="space-y-3"><Card><CardHeader className="pb-2"><CardTitle className="text-base">Estás en la sala</CardTitle></CardHeader><CardContent className="space-y-2"><Input readOnly value={joinUrl} className="text-xs" /><div className="text-xs text-muted-foreground">Sala: <Badge variant="outline">{roomId}</Badge></div></CardContent></Card><Card><CardHeader className="pb-2"><CardTitle className="text-base">Escribe al muro</CardTitle></CardHeader><CardContent className="space-y-2"><Input value={audienceMsg} onChange={(e) => setAudienceMsg(e.target.value)} placeholder="Tu comentario…" onKeyDown={(e) => e.key === "Enter" && sendNote()}/><Button onClick={sendNote}>Enviar</Button></CardContent></Card></div>);
}

function PollComponent({ question, options, correctAnswerIndex, slideId, roomId }: { question: string; options: string[]; correctAnswerIndex: number; slideId: string; roomId: string; }) {
  const supabase = useMemo(() => createClient(), []);
  const [votedIndex, setVotedIndex] = useState<number | null>(null);
  const handleVote = (index: number) => { if (votedIndex !== null) return; setVotedIndex(index); supabase.channel(`ccmx_room_${roomId}`).send({ type: "broadcast", event: "poll_vote", payload: { slideId, choiceIndex: index, isCorrect: index === correctAnswerIndex } }); };
  return (<Card><CardHeader><CardTitle>{question}</CardTitle></CardHeader><CardContent className="space-y-2">{options.map((option, index) => (<Button key={index} variant={votedIndex === index ? (index === correctAnswerIndex ? "default" : "destructive") : "outline"} className="w-full justify-start text-left h-auto py-2 whitespace-normal" onClick={() => handleVote(index)} disabled={votedIndex !== null}><div className="flex items-center w-full"><span>{option}</span>{votedIndex !== null && (<span className="ml-auto text-lg">{index === correctAnswerIndex ? '✅' : '❌'}</span>)}</div></Button>))}{votedIndex !== null && (<p className="text-sm text-muted-foreground pt-2">¡Gracias por tu respuesta!</p>)}</CardContent></Card>);
}

function XMatrixCard() { /* ... Contenido del XMatrixCard ... */ return <Card><CardHeader><CardTitle>Matriz X (Interactiva)</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Aquí va el contenido interactivo de la Matriz X.</p></CardContent></Card>; }
function Box({ title, items, onChange }: { title: string; items: string[]; onChange: (v: string[]) => void; }) { /* ... Contenido de Box ... */ return <div>{title}</div>; }

// ---- Contenido de las Diapositivas ----

// ---- Contenido de las Diapositivas ----

function buildSlides(logoSrc: string, roomId: string): Slide[] {
  return [
    { id: "portada", title: "Portada", content: (<Card><CardHeader><div className="flex items-center gap-2 text-sm text-muted-foreground"><Image src={logoSrc} alt="Logo" width={20} height={20} className="rounded" /><span>CCMX</span></div><CardTitle className="text-3xl md:text-4xl leading-tight">Uso de <em>Hoshin Kanri</em> para la Planeación Estratégica</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-lg">Diplomado en estrategia, planeación e innovación.</p></CardContent></Card>),},
    { id: "objetivo", title: "Objetivo General", content: (<Card><CardHeader><CardTitle>Objetivo General</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-lg">Formar una idea inicial de cómo usar <strong>Hoshin Kanri</strong> en su negocio.</p></CardContent></Card>),},
    { id: "estrategia", title: "¿Qué es la estrategia?", cognitiveLevel: "Recordar", knowledgeType: "Conceptual", content: (<Card><CardHeader><CardTitle>¿En qué consiste la estrategia?</CardTitle></CardHeader><CardContent><ul className="list-disc pl-6 space-y-2"><li><em>“…tomar decisiones para <strong>ganar</strong> en el mercado.”</em> — Michael Porter</li><li>Objetivo: diferenciarse, aportar valor superior y ajustar al entorno.</li></ul></CardContent></Card>),},
    { id: "poll-estrategia", title: "Pregunta: Estrategia", cognitiveLevel: "Recordar", knowledgeType: "Fáctico", content: (<PollComponent slideId="poll-estrategia" roomId={roomId} question="Según Porter, la estrategia es tomar decisiones para..." options={["Reducir costos", "Ganar en el mercado", "Innovar productos"]} correctAnswerIndex={1} />),},
    { id: "jerarquia", title: "Jerarquía estratégica", cognitiveLevel: "Recordar", knowledgeType: "Conceptual", content: (<Card><CardHeader><CardTitle>Jerarquía Estratégica</CardTitle></CardHeader><CardContent><ul className="list-disc pl-6 space-y-2"><li><strong>Corporativa</strong> → ADN estratégico (visión, misión).</li><li><strong>De Negocio</strong> → Estrategias por unidad.</li><li><strong>Funcional</strong> → Áreas que habilitan (Finanzas, MKT).</li><li><strong>Operativa</strong> → Operación diaria.</li></ul></CardContent></Card>),},
    { id: "poll-jerarquia", title: "Pregunta: Jerarquía", cognitiveLevel: "Comprender", knowledgeType: "Conceptual", content: (<PollComponent slideId="poll-jerarquia" roomId={roomId} question="¿Qué nivel de la jerarquía se enfoca en cómo un área (ej. Finanzas) apoya las metas?" options={["Corporativa", "De Negocio", "Funcional"]} correctAnswerIndex={2} />),},
    { id: "adn", title: "ADN Estratégico", cognitiveLevel: "Recordar", knowledgeType: "Conceptual", content: (<Card><CardHeader><CardTitle>ADN Estratégico</CardTitle></CardHeader><CardContent><ul className="list-disc pl-6 space-y-2"><li><strong>Visión:</strong> ¿Hacia dónde vamos?</li><li><strong>Misión:</strong> ¿Quiénes somos?</li><li><strong>Valores:</strong> ¿Cómo actuamos?</li></ul></CardContent></Card>),},
    { id: "poll-adn", title: "Pregunta: ADN", cognitiveLevel: "Comprender", knowledgeType: "Conceptual", content: (<PollComponent slideId="poll-adn" roomId={roomId} question="La pregunta '¿Quiénes somos?' corresponde a la..." options={["Visión", "Misión", "Valores"]} correctAnswerIndex={1} />),},
    { id: "matriz-x", title: "Matriz X (interactiva)", content: <XMatrixCard /> },
    { 
      id: "cierre", 
      title: "Cierre", 
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Cierre</CardTitle>
          </CardHeader> 
          <CardContent>
            <p>Hoshin Kanri integra estrategia, ejecución y aprendizaje.</p>
          </CardContent>
        </Card>
      ),
    },
  ];
}