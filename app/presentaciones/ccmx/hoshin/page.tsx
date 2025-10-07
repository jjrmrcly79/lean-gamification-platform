// ===== CÓDIGO COMPLETO Y DEFINITIVO - page.tsx =====
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// Imports para Pop-ups (Dialog)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
type MatrixSuggestion = { id: string; kind: "resultado" | "estrategia" | "proceso" | "accion"; text: string; at: number; from?: string; };
type PollPayload = { slideId: string; choiceIndex: number; isCorrect: boolean; };
type BroadcastEnvelope<T> = { event: string; type: "broadcast"; payload: T };


// =================================================
// Componente Principal
// =================================================
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

    channel.on("broadcast", { event: "nav" }, (env: BroadcastEnvelope<NavPayload>) => { if (isAudience) setIndex(env.payload?.i ?? 0); });
    channel.on("broadcast", { event: "note" }, (env: BroadcastEnvelope<NotePayload>) => { setWall((prev) => [env.payload, ...prev].slice(0, 200)); });
    channel.on("broadcast", { event: "matrix_suggest" }, (env: BroadcastEnvelope<MatrixSuggestion>) => { window.dispatchEvent(new CustomEvent<MatrixSuggestion>("matrix_suggest", { detail: env.payload })); });
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
        <div className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center gap-2 p-2">
            <div className="flex items-center gap-2 mr-2">
              <Image src={LOGO_SRC} alt="Logo" width={20} height={20} className="rounded" />
              <span className="font-semibold">CCMX Hoshin</span>
            </div>
            {!isAudience && (<><Button variant="outline" onClick={() => setIndex((i) => Math.max(i - 1, 0))}>←</Button><Button onClick={() => setIndex((i) => Math.min(i + 1, slides.length - 1))}>→</Button></>)}
            <span className="text-sm text-muted-foreground ml-1">{index + 1} / {slides.length}</span>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsLight((v) => !v)}>{isLight ? "🌙 Oscuro" : "☀️ Claro"}</Button>
              <Button variant="outline" onClick={() => setShowTOC((v) => !v)}>☰ Índice</Button>
              <Button variant="outline" className="md-hidden" onClick={() => setShowPanel(true)}>💬</Button>
            </div>
          </div>
          <div className="px-2 pb-2"><Progress value={pct} className="h-1" /></div>
        </div>

        <main className="relative">
          <section className="grid md:grid-cols-[minmax(0,1fr),380px] gap-0">
            <div className="min-h-[calc(100vh-70px)] grid place-items-center p-4">
              <motion.div key={slides[index].id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="w-full flex justify-center">
                <div className="w-full">{slides[index].content}</div>
              </motion.div>
            </div>
            <aside className="border-l p-3 hidden md:block">
              {!isAudience ? (<PresenterPanel roomId={roomId} joinUrl={joinUrl} wall={wall} setIndex={setIndex} slides={slides} index={index} pollResults={pollResults} />) : (<AudiencePanel roomId={roomId} joinUrl={joinUrl} audienceMsg={audienceMsg} setAudienceMsg={setAudienceMsg} />)}
            </aside>
          </section>

          {showTOC && (<div className="fixed inset-0 z-30 bg-black/50" onClick={() => setShowTOC(false)}><div className="absolute left-0 top-0 h-full w-[320px] bg-background border-r p-3" onClick={(e) => e.stopPropagation()}><div className="flex items-center gap-2 mb-2"><Image src={LOGO_SRC} alt="Logo" width={18} height={18} className="rounded" /><span className="font-semibold">Índice</span></div><ScrollArea className="h-[calc(100vh-100px)] pr-2"><div className="flex flex-col gap-1">{slides.map((s, i) => (<Button key={s.id} variant={i === index ? "secondary" : "ghost"} className="justify-start h-9" onClick={() => { setIndex(i); setShowTOC(false); }}>{i + 1}. {s.title}</Button>))}</div></ScrollArea></div></div>)}
          {showPanel && (<div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setShowPanel(false)}><div className="absolute bottom-0 left-0 right-0 h-[70vh] bg-background border-t p-3 rounded-t-2xl" onClick={(e) => e.stopPropagation()}>{!isAudience ? (<PresenterPanel roomId={roomId} joinUrl={joinUrl} wall={wall} setIndex={setIndex} slides={slides} index={index} pollResults={pollResults} />) : (<AudiencePanel roomId={roomId} joinUrl={joinUrl} audienceMsg={audienceMsg} setAudienceMsg={setAudienceMsg} />)}</div></div>)}
        </main>
      </div>
    </div>
  );
}

// =================================================
// Componentes Adicionales (Paneles, Sondeos, etc.)
// =================================================
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
  function suggestToMatrix(kind: MatrixSuggestion["kind"]) { const text = audienceMsg.trim(); if (!text) return; supabase.channel(`ccmx_room_${roomId}`).send({ type: "broadcast", event: "matrix_suggest", payload: { id: crypto.randomUUID(), kind, text, at: Date.now() } }); setAudienceMsg(""); }
  return (<div className="space-y-3"><Card><CardHeader className="pb-2"><CardTitle className="text-base">Estás en la sala</CardTitle></CardHeader><CardContent className="space-y-2"><Input readOnly value={joinUrl} className="text-xs" /><div className="text-xs text-muted-foreground">Sala: <Badge variant="outline">{roomId}</Badge></div></CardContent></Card><Card><CardHeader className="pb-2"><CardTitle className="text-base">Participa</CardTitle></CardHeader><CardContent className="space-y-2"><Input value={audienceMsg} onChange={(e) => setAudienceMsg(e.target.value)} placeholder="Tu comentario o propuesta…" onKeyDown={(e) => e.key === "Enter" && sendNote()}/><div className="flex gap-2"><Button onClick={sendNote}>Enviar al Muro</Button></div><div className="text-xs text-muted-foreground pt-2">O proponer para la Matriz X:</div><div className="grid grid-cols-2 gap-2"><Button variant="outline" size="sm" onClick={() => suggestToMatrix("resultado")}>Resultado</Button><Button variant="outline" size="sm" onClick={() => suggestToMatrix("estrategia")}>Estrategia</Button><Button variant="outline" size="sm" onClick={() => suggestToMatrix("proceso")}>Proceso</Button><Button variant="outline" size="sm" onClick={() => suggestToMatrix("accion")}>Acción</Button></div></CardContent></Card></div>);
}

function PollComponent({ question, options, correctAnswerIndex, slideId, roomId }: { question: string; options: string[]; correctAnswerIndex: number; slideId: string; roomId: string; }) {
  const supabase = useMemo(() => createClient(), []);
  const [votedIndex, setVotedIndex] = useState<number | null>(null);
  const handleVote = (index: number) => { if (votedIndex !== null) return; setVotedIndex(index); supabase.channel(`ccmx_room_${roomId}`).send({ type: "broadcast", event: "poll_vote", payload: { slideId, choiceIndex: index, isCorrect: index === correctAnswerIndex } }); };
  return (<Card><CardHeader><CardTitle>{question}</CardTitle></CardHeader><CardContent className="space-y-2">{options.map((option, index) => (<Button key={index} variant={votedIndex === index ? (index === correctAnswerIndex ? "default" : "destructive") : "outline"} className="w-full justify-start text-left h-auto py-2 whitespace-normal" onClick={() => handleVote(index)} disabled={votedIndex !== null}><div className="flex items-center w-full"><span>{option}</span>{votedIndex !== null && (<span className="ml-auto text-lg">{index === correctAnswerIndex ? '✅' : '❌'}</span>)}</div></Button>))}{votedIndex !== null && (<p className="text-sm text-muted-foreground pt-2">¡Gracias por tu respuesta!</p>)}</CardContent></Card>);
}

function DownloadFormDialog({ onExport }: { onExport: (details: { name: string; email: string; company: string; phone: string; }) => void; }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = () => {
    if (name && email && company && phone) {
      onExport({ name, email, company, phone });
      setIsOpen(false);
    } else {
      alert("Por favor, completa todos los campos.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild><Button>⬇️ Descargar Mapa X</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Completa tus datos para descargar</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <Input placeholder="Nombre Completo" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Correo Electrónico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Empresa" value={company} onChange={(e) => setCompany(e.target.value)} />
          <Input placeholder="Teléfono" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button onClick={handleDownload} className="w-full">Descargar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =======================================================================
// COMPONENTES AVANZADOS PARA LA MATRIZ HOSHIN KANRI
// Reemplaza tus componentes XMatrixCard y Box existentes con todo este bloque.
// =======================================================================

// --- Componente 1 (Nuevo): Cuadrícula de Correlaciones ---
function CorrelationGrid({
  rows,
  cols,
  correlations,
  setCorrelations,
}: {
  rows: { id: string, text: string }[];
  cols: { id: string, text: string }[];
  correlations: Record<string, Record<string, number>>;
  setCorrelations: React.Dispatch<React.SetStateAction<Record<string, Record<string, number>>>>;
}) {
  const handleCorrelationChange = (rowId: string, colId: string) => {
    setCorrelations(prev => {
      const newCorrelations = JSON.parse(JSON.stringify(prev)); // Deep copy
      const currentCorrelation = newCorrelations[rowId]?.[colId] || 0;
      const nextCorrelation = (currentCorrelation + 1) % 3; // Cycles 0 -> 1 -> 2 -> 0
      
      if (!newCorrelations[rowId]) {
        newCorrelations[rowId] = {};
      }
      newCorrelations[rowId][colId] = nextCorrelation;
      return newCorrelations;
    });
  };

  return (
    <div className="overflow-x-auto p-2 border rounded-lg bg-background">
      <table className="w-full text-xs text-center border-collapse">
        <thead>
          <tr>
            <th className="border p-1 w-1/4"></th>
            {cols.map(col => (
              <th key={col.id} className="border p-1" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                <span className="transform -rotate-180">{col.text.substring(0, 15)}...</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              <td className="border p-1 text-left font-semibold">{row.text}</td>
              {cols.map(col => (
                <td key={col.id} className="border p-1">
                  <button onClick={() => handleCorrelationChange(row.id, col.id)} className="w-6 h-6 rounded-full flex items-center justify-center m-auto">
                    {correlations[row.id]?.[col.id] === 2 ? '⚫' : correlations[row.id]?.[col.id] === 1 ? '⚪' : ''}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Componente 2 (Nuevo): Matriz de Responsabilidades ---
function ResponsibilityMatrix({
  actions,
  people,
  responsibilities,
  setResponsabilidades, // Corregido a español
}: {
  actions: { id: string, text: string }[];
  people: { id: string, text: string }[];
  responsibilities: Record<string, Record<string, 'L' | 'M'>>;
  setResponsabilidades: React.Dispatch<React.SetStateAction<Record<string, Record<string, 'L' | 'M'>>>>; // Corregido a español
}) {
    const roles = ['', 'L', 'M']; // Vacío, Líder, Miembro
    
    const handleResponsibilityChange = (actionId: string, personId: string) => {
        // Corregido a español
        setResponsabilidades(prev => {
            const newResp = JSON.parse(JSON.stringify(prev));
            const currentRole = newResp[actionId]?.[personId] || '';
            const nextRoleIndex = (roles.indexOf(currentRole) + 1) % roles.length;
            const nextRole = roles[nextRoleIndex];

            if (!newResp[actionId]) {
                newResp[actionId] = {};
            }
            if (nextRole) {
                newResp[actionId][personId] = nextRole as 'L' | 'M';
            } else {
                delete newResp[actionId][personId];
            }
            return newResp;
        });
    };

    return (
        <div className="overflow-x-auto p-2 border rounded-lg bg-background">
            <table className="w-full text-xs text-center border-collapse">
                <thead>
                    <tr>
                        <th className="border p-1 w-1/4"></th>
                        {people.map(p => (
                            <th key={p.id} className="border p-1" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                                <span className="transform -rotate-180">{p.text}</span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {actions.map(action => (
                        <tr key={action.id}>
                            <td className="border p-1 text-left font-semibold">{action.text}</td>
                            {people.map(person => (
                                <td key={person.id} className="border p-1">
                                    <button onClick={() => handleResponsibilityChange(action.id, person.id)} className="w-6 h-6 rounded-sm flex items-center justify-center m-auto font-bold">
                                        {responsibilities[action.id]?.[person.id] || ''}
                                    </button>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// --- Componente 3 (Actualizado): Contenedor de Items ---
function Box({ title, items, setItems }: { title: string; items: { id: string, text: string }[]; setItems: (items: { id: string, text: string }[]) => void; }) {
  const [text, setText] = useState("");
  const addItem = () => {
    const t = text.trim(); if (!t) return;
    setItems([...items, { id: crypto.randomUUID(), text: t }]);
    setText("");
  };
  const removeItem = (idToRemove: string) => {
    setItems(items.filter(item => item.id !== idToRemove));
  };
  return (
    <div className="rounded-xl border p-3 h-full flex flex-col"><div className="font-semibold mb-2">{title}</div><div className="flex gap-2 mb-2"><Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Añadir ítem…" onKeyDown={(e) => e.key === "Enter" && addItem()} /><Button onClick={addItem}>+</Button></div><div className="flex flex-col gap-2 overflow-y-auto"><ScrollArea className="h-32 pr-4">{items.map((it) => (<Badge key={it.id} variant="outline" className="group whitespace-normal w-full justify-between"><span>{it.text}</span><button onClick={() => removeItem(it.id)} className="ml-2 opacity-60 group-hover:opacity-100 hover:text-destructive" aria-label="Eliminar">×</button></Badge>))}</ScrollArea></div></div>
  );
}

// --- Componente 4 (Re-diseñado y CORREGIDO): La Matriz X Completa ---
function XMatrixCard() {
  // State for the main lists
  const [estrategias, setEstrategias] = useState<{ id: string, text: string }[]>([{ id: 's1', text: 'Bajo costo' }]);
  const [acciones, setAcciones] = useState<{ id: string, text: string }[]>([{ id: 'a1', text: 'Lean en plantas' }]);
  const [procesos, setProcesos] = useState<{ id: string, text: string }[]>([{ id: 'p1', text: 'SMED < 10 min' }]);
  const [resultados, setResultados] = useState<{ id: string, text: string }[]>([{ id: 'r1', text: 'Ganancias +50%' }]);
  const [personas, setPersonas] = useState<{ id: string, text: string }[]>([{ id: 'pe1', text: 'J. García' }]);

  // State for correlations
  const [estrategiasVsResultados, setEstrategiasVsResultados] = useState<Record<string, Record<string, number>>>({});
  const [accionesVsEstrategias, setAccionesVsEstrategias] = useState<Record<string, Record<string, number>>>({});
  const [procesosVsAcciones, setProcesosVsAcciones] = useState<Record<string, Record<string, number>>>({});
  
  // State for responsibilities
  const [responsabilidades, setResponsabilidades] = useState<Record<string, Record<string, 'L' | 'M'>>>({});

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Matriz Hoshin Kanri (X)</CardTitle>
        <p className="text-muted-foreground">Define los elementos y conecta las relaciones para alinear la estrategia de tu organización.</p>
      </CardHeader>
      <CardContent>
        {/* --- CAMBIO: La cuadrícula ahora tiene 4 columnas para separar la sección de Responsabilidades --- */}
        <div className="grid grid-cols-[3fr_1fr_3fr_3fr] grid-rows-[3fr_1fr_3fr] gap-4" style={{ minHeight: '700px' }}>
          
          {/* --- Columna 1 --- */}
          <div className="col-start-1 row-start-1"><CorrelationGrid rows={acciones} cols={estrategias} correlations={accionesVsEstrategias} setCorrelations={setAccionesVsEstrategias} /></div>
          <div className="col-start-1 row-start-2"><Box title="Estrategias (Oeste)" items={estrategias} setItems={setEstrategias} /></div>
          <div className="col-start-1 row-start-3"><CorrelationGrid rows={estrategias} cols={resultados} correlations={estrategiasVsResultados} setCorrelations={setEstrategiasVsResultados} /></div>
          
          {/* --- Columna 2 --- */}
          <div className="col-start-2 row-start-1"><Box title="Acciones Tácticas (Norte)" items={acciones} setItems={setAcciones} /></div>
          <div className="col-start-2 row-start-2 flex items-center justify-center text-center p-2 border rounded-lg">
            <h3 className="font-bold text-lg text-primary">Hoshin Kanri</h3>
          </div>
          <div className="col-start-2 row-start-3"><Box title="Resultados (Sur)" items={resultados} setItems={setResultados} /></div>
          
          {/* --- Columna 3 --- */}
          <div className="col-start-3 row-start-1"><CorrelationGrid rows={procesos} cols={acciones} correlations={procesosVsAcciones} setCorrelations={setProcesosVsAcciones} /></div>
          <div className="col-start-3 row-start-2"><Box title="Métricas (Este)" items={procesos} setItems={setProcesos} /></div>
          {/* La esquina inferior derecha se deja vacía intencionalmente */}

          {/* --- CAMBIO: Columna 4 dedicada a Personas y Responsabilidades --- */}
          <div className="col-start-4 row-start-1"><ResponsibilityMatrix actions={acciones} people={personas} responsibilities={responsabilidades} setResponsabilidades={setResponsabilidades}/></div>
          <div className="col-start-4 row-start-2"><Box title="Personas" items={personas} setItems={setPersonas} /></div>
          <div className="col-start-4 row-start-3 flex flex-col justify-start p-2 border rounded-lg bg-muted/50">
             <Card className="p-3 text-xs">
                <p className="font-bold">Correlaciones:</p>
                <p>⚫ = Fuerte | ⚪ = Apoyo</p>
                <p className="mt-2 font-bold">Responsables:</p>
                <p>L = Líder | M = Miembro</p>
             </Card>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}


// =================================================
// Contenido de las Diapositivas (VERSIÓN CON CORRECCIONES DE LINTING)
// =================================================
function buildSlides(logoSrc: string, roomId: string): Slide[] {
  return [
    // --- Módulo 1: Fundamentos de Estrategia ---
    { id: "portada", title: "Portada", content: (<Card><CardHeader><div className="flex items-center gap-2 text-sm text-muted-foreground"><Image src={logoSrc} alt="Logo" width={20} height={20} className="rounded" /><span>CCMX</span></div><CardTitle className="text-3xl md:text-4xl leading-tight">Uso de <em>Hoshin Kanri</em> para la Planeación Estratégica</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-lg">Diplomado en estrategia, planeación e innovación.</p></CardContent></Card>),},
    { id: "objetivo", title: "Objetivo General", content: (<Card><CardHeader><CardTitle>Objetivo General</CardTitle></CardHeader><CardContent><p className="text-lg">Que el participante se forme una idea inicial de cómo usar la metodología Hoshin Kanri para beneficio de su negocio.</p></CardContent></Card>),},
    { 
      id: "que-es-estrategia", 
      title: "¿Qué es la estrategia?", 
      content: (
        <Card>
          <CardHeader><CardTitle>¿En qué consiste la estrategia?</CardTitle></CardHeader>
          <CardContent>
            {/* CORRECCIÓN: Se reemplazaron " por &ldquo; y &rdquo; */}
            <blockquote className="text-xl border-l-2 pl-6 italic">&ldquo;...en tomar decisiones para ganar en el mercado.&rdquo;</blockquote>
            <p className="text-right text-muted-foreground">- Michael Porter</p>
          </CardContent>
        </Card>
      ),
    },
    { id: "poll-estrategia", title: "Pregunta: ¿Qué es la estrategia?", cognitiveLevel: "Recordar", knowledgeType: "Fáctico", content: (<PollComponent slideId="poll-estrategia" roomId={roomId} question="Según la definición de Porter, la estrategia es tomar decisiones para..." options={["Reducir costos", "Ganar en el mercado", "Innovar productos"]} correctAnswerIndex={1} />),},
    { id: "formula-exito", title: "Fórmula para el Éxito", cognitiveLevel: "Comprender", knowledgeType: "Conceptual", content: (<Card><CardHeader><CardTitle>Fórmula para Gestionar Hacia el Éxito</CardTitle></CardHeader><CardContent className="text-center"><p className="text-2xl font-semibold bg-muted p-4 rounded-lg">P.C. + P.C. = R.P.R.</p><div className="grid md:grid-cols-2 gap-4 mt-4 text-left"><div className="p-3 rounded-lg border"><strong>Personas Capaces:</strong> Cuenta con las competencias necesarias para realizar el trabajo asignado en este momento.</div><div className="p-3 rounded-lg border"><strong>Procesos Capaces:</strong> Al ser operado correctamente produce resultados que permanecen dentro de los límites definidos por las necesidades o expectativas del cliente.</div></div><p className="mt-4 text-lg">El resultado son <strong>Resultados Predecibles y Repetibles</strong>.</p></CardContent></Card>),},
    { id: "poll-formula", title: "Pregunta: Fórmula del Éxito", cognitiveLevel: "Comprender", knowledgeType: "Conceptual", content: (<PollComponent slideId="poll-formula" roomId={roomId} question="En la fórmula P.C. + P.C. = R.P.R., ¿qué significa la primera 'P.C.'?" options={["Procesos Capaces", "Personas Clave", "Personas Capaces", "Planes Concretos"]} correctAnswerIndex={2} />),},
    
    // --- Módulo 2: Contexto Empresarial ---
    // ===== CÓDIGO COMPLETO PARA EL SLIDE "ETAPAS EN LA EMPRESA" =====

{
  id: "etapas-empresa",
  title: "Etapas en la Empresa",
  cognitiveLevel: "Recordar",
  knowledgeType: "Conceptual",
  content: (
    <Card>
      <CardHeader>
        <CardTitle>Etapas en la Vida de una Empresa</CardTitle>
        <p className="text-muted-foreground">
          Cada etapa presenta retos y objetivos distintos. Haz clic en cada una para ver el detalle.
        </p>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {/* ETAPA 1 */}
          <AccordionItem value="item-1">
            <AccordionTrigger>1. Conceptualización o Inicio</AccordionTrigger>
            <AccordionContent>
              <p>Es la etapa en la que se genera la idea del negocio, se realiza la planificación, investigación de mercado y se establecen los fundamentos de la empresa.</p>
              <div className="mt-3 border-t pt-3 space-y-2 text-sm">
                <div className="flex items-center gap-2"><Badge variant="destructive">Reto</Badge> <span>Incertidumbre: Análisis y Solución de problemas</span></div>
                <div className="flex items-center gap-2"><Badge variant="secondary">Meta</Badge> <span>Certeza: Lanzamiento</span></div>
              </div>
            </AccordionContent>
          </AccordionItem>
          {/* ETAPA 2 */}
          <AccordionItem value="item-2">
            <AccordionTrigger>2. Lanzamiento</AccordionTrigger>
            <AccordionContent>
              <p>La empresa comienza sus operaciones oficialmente, con la puesta en marcha de productos o servicios y la introducción al mercado.</p>
               <div className="mt-3 border-t pt-3 space-y-2 text-sm">
                <div className="flex items-center gap-2"><Badge variant="destructive">Reto</Badge> <span>Inestabilidad: Estabilización</span></div>
                <div className="flex items-center gap-2"><Badge variant="secondary">Meta</Badge> <span>Estabilidad: Mejora y Crecimiento</span></div>
              </div>
            </AccordionContent>
          </AccordionItem>
          {/* ETAPA 3 */}
          <AccordionItem value="item-3">
            <AccordionTrigger>3. Crecimiento</AccordionTrigger>
            <AccordionContent>
              <p>La empresa experimenta aumento en ventas, expansión de mercado y fortalecimiento de su estructura y operaciones.</p>
               <div className="mt-3 border-t pt-3 space-y-2 text-sm">
                <div className="flex items-center gap-2"><Badge variant="destructive">Reto</Badge> <span>Inestabilidad: Estabilización</span></div>
                <div className="flex items-center gap-2"><Badge variant="secondary">Meta</Badge> <span>Estabilidad: Mejora y Consolidación</span></div>
              </div>
            </AccordionContent>
          </AccordionItem>
          {/* ETAPA 4 */}
          <AccordionItem value="item-4">
            <AccordionTrigger>4. Consolidación</AccordionTrigger>
            <AccordionContent>
              <p>La empresa alcanza su máximo nivel de crecimiento, consolidando su presencia en el mercado y optimiza sus procesos para mantener la eficiencia.</p>
            </AccordionContent>
          </AccordionItem>
          {/* ETAPA 5 */}
          <AccordionItem value="item-5">
            <AccordionTrigger>5. Declive</AccordionTrigger>
            <AccordionContent>
              <p>Sucede una disminución en ventas o en participación de mercado, a menudo debido a cambios en el mercado, competencia o tecnología obsoleta.</p>
            </AccordionContent>
          </AccordionItem>
          {/* ETAPA 6 */}
          <AccordionItem value="item-6">
            <AccordionTrigger>6. Reinvención o Reinversión</AccordionTrigger>
            <AccordionContent>
              <p>La empresa busca activamente modernizarse, diversificar sus productos o servicios, o invertir en nuevas tecnologías para mantener su competitividad y comenzar un nuevo ciclo de crecimiento.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  ),
},
    { id: "poll-etapas", title: "Pregunta: Etapas", cognitiveLevel: "Comprender", knowledgeType: "Conceptual", content: (<PollComponent slideId="poll-etapas" roomId={roomId} question="¿Cuál es el principal reto a superar en la etapa de 'Lanzamiento'?" options={["De la incertidumbre a la certeza", "De la inestabilidad a la estabilidad", "Del crecimiento a la consolidación"]} correctAnswerIndex={1} />),},
    { id: "estructuras-gestion", title: "Estructuras de Gestión", cognitiveLevel: "Recordar", knowledgeType: "Conceptual", content: (<Card><CardHeader><CardTitle>Estructuras de Gestión</CardTitle></CardHeader><CardContent><div className="grid md:grid-cols-2 gap-4"><div className="p-3 rounded-lg border"><strong>Gestión Estratégica:</strong> Enfoque en el largo plazo para alcanzar una ventaja competitiva.</div><div className="p-3 rounded-lg border"><strong>Gestión Operativa:</strong> Enfoque en los planes e implementaciones del corto plazo.</div><div className="p-3 rounded-lg border"><strong>Gestión Financiera/Admin:</strong> Enfoque en el control de los recursos en todos los procesos de la compañía.</div><div className="p-3 rounded-lg border bg-primary/10"><strong>Gestión de la Mejora:</strong> Enfoque en uso eficiente de los recursos durante el proceso productivo, integrando y mejorando las otras tres gestiones.</div></div></CardContent></Card>),},
    
    // --- Módulo 3: Hoshin Kanri en Profundidad ---
    { id: "jerarquia", title: "Jerarquía Estratégica", cognitiveLevel: "Recordar", knowledgeType: "Conceptual", content: (<Card><CardHeader><CardTitle>Jerarquía Estratégica</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between p-3 rounded-lg border"><div><strong className="text-lg">1. Corporativa</strong><p className="text-sm text-muted-foreground">Define el ADN estratégico a nivel corporativo.</p></div><Dialog><DialogTrigger asChild><Button variant="outline">Ver más</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Nivel Corporativo</DialogTitle></DialogHeader><p>Inicia el proceso definiendo el ADN estratégico a nivel corporativo. Se enfoca en las expectativas de crecimiento, impacto, reconocimiento, etc.</p></DialogContent></Dialog></div><div className="flex items-center justify-between p-3 rounded-lg border"><div><strong className="text-lg">2. De Negocio</strong><p className="text-sm text-muted-foreground">Define estrategias por unidad de negocio.</p></div><Dialog><DialogTrigger asChild><Button variant="outline">Ver más</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Nivel de Negocio</DialogTitle></DialogHeader><p>Los líderes de la planeación por negocio definen las estrategias, indicadores o acciones a tomar para contribuir a las metas corporativas.</p></DialogContent></Dialog></div><div className="flex items-center justify-between p-3 rounded-lg border"><div><strong className="text-lg">3. Funcional</strong><p className="text-sm text-muted-foreground">Áreas (Finanzas, MKT) que habilitan las metas.</p></div><Dialog><DialogTrigger asChild><Button variant="outline">Ver más</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Nivel Funcional</DialogTitle></DialogHeader><p>Según las áreas funcionales que tenga la organización, cada una se suma en su área de dominio para asegurar que los negocios logren sus objetivos.</p></DialogContent></Dialog></div><div className="flex items-center justify-between p-3 rounded-lg border"><div><strong className="text-lg">4. Operativa</strong><p className="text-sm text-muted-foreground">Asegura la correcta operación del core business.</p></div><Dialog><DialogTrigger asChild><Button variant="outline">Ver más</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Nivel Operativo</DialogTitle></DialogHeader><p>En ciertas ocasiones las empresas son tan grandes que requieren un cuarto nivel, el cual asegura una correcta operación dentro del core business o de una gran área funcional.</p></DialogContent></Dialog></div></CardContent></Card>),},
    { id: "poll-jerarquia", title: "Pregunta: Jerarquía", cognitiveLevel: "Comprender", knowledgeType: "Conceptual", content: (<PollComponent slideId="poll-jerarquia" roomId={roomId} question="¿Qué nivel de la jerarquía se enfoca en cómo un área (ej. Finanzas) apoya las metas?" options={["Corporativa", "De Negocio", "Funcional"]} correctAnswerIndex={2} />),},
    { id: "adn", title: "ADN Estratégico", cognitiveLevel: "Recordar", knowledgeType: "Conceptual", content: (<Card><CardHeader><CardTitle>ADN Estratégico</CardTitle></CardHeader><CardContent className="grid md:grid-cols-3 gap-4"><div className="p-3 rounded-lg border text-center"><strong className="text-lg">Visión</strong><p className="text-sm text-muted-foreground h-12">¿Hacia dónde vamos?</p><Dialog><DialogTrigger asChild><Button variant="outline" size="sm">Definición</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Visión</DialogTitle></DialogHeader><p>Define qué queremos llegar a ser y hacia dónde vamos. Es donde aspiras estar y sirve de inspiración y orientación.</p></DialogContent></Dialog></div><div className="p-3 rounded-lg border text-center"><strong className="text-lg">Misión</strong><p className="text-sm text-muted-foreground h-12">¿Quiénes somos y qué hacemos?</p><Dialog><DialogTrigger asChild><Button variant="outline" size="sm">Definición</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Misión</DialogTitle></DialogHeader><p>Define cuál es nuestro negocio, quiénes somos y qué hacemos. Te impulsa y es un elemento clave para la construcción del futuro.</p></DialogContent></Dialog></div><div className="p-3 rounded-lg border text-center"><strong className="text-lg">Valores</strong><p className="text-sm text-muted-foreground h-12">¿Cómo actuamos?</p><Dialog><DialogTrigger asChild><Button variant="outline" size="sm">Definición</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Valores</DialogTitle></DialogHeader><p>Definen cómo queremos que actúen y piensen los colaboradores. Te orientan y son principios rectores de la cultura organizacional.</p></DialogContent></Dialog></div></CardContent></Card>),},
    { id: "poll-adn", title: "Pregunta: ADN", cognitiveLevel: "Comprender", knowledgeType: "Conceptual", content: (<PollComponent slideId="poll-adn" roomId={roomId} question="La pregunta '¿Quiénes somos?' corresponde a la..." options={["Visión", "Misión", "Valores"]} correctAnswerIndex={1} />),},

    // --- Módulo 4: Taller Matriz X ---
    { id: "proceso-intro", title: "Proceso de Construcción Matriz X", content: (<Card><CardHeader><CardTitle>Proceso de Construcción de la Matriz X</CardTitle></CardHeader><CardContent><p className="text-lg">Ahora, vamos a detallar cada sección de la matriz antes de que construyas la tuya.</p></CardContent></Card>),},
    { id: "proceso-resultados", title: "Paso 1: Resultados", content: (<Card><CardHeader><CardTitle>Paso 1: Resultados (¿Qué lograremos?)</CardTitle></CardHeader><CardContent><p>Son las metas financieras y no financieras más importantes de la compañía. Generalmente son determinadas por la dirección.</p><p className="mt-2 font-semibold">Ejemplos:</p><ul className="list-disc pl-5 mt-1"><li>Incrementar las ganancias en un 50%</li><li>Obtener la certificación de Industria Limpia</li></ul></CardContent></Card>),},
    { id: "proceso-estrategias", title: "Paso 2: Estrategias", content: (<Card><CardHeader><CardTitle>Paso 2: Estrategias (¿Cómo lo lograremos?)</CardTitle></CardHeader><CardContent><p>Son entre 2 y 5 apuestas claras que definen cómo se competirá. Mencionan el costo, funcionalidad y calidad del producto o servicio.</p><p className="mt-2 font-semibold">Ejemplos:</p><ul className="list-disc pl-5 mt-1"><li>Convertirse en el productor de más bajo costo</li><li>Ser la compañía más innovadora</li></ul></CardContent></Card>),},
    { id: "poll-proceso-1", title: "Pregunta: Proceso", cognitiveLevel: "Comprender", knowledgeType: "Conceptual", content: (<PollComponent slideId="poll-proceso-1" roomId={roomId} question="Inmediatamente después de definir los 'Resultados', ¿qué elemento se debe establecer en la Matriz X?" options={["Las Acciones Tácticas", "Las Personas", "Las Estrategias"]} correctAnswerIndex={2} />),},
    { id: "proceso-acciones", title: "Paso 3: Acciones Tácticas", content: (<Card><CardHeader><CardTitle>Paso 3: Acciones Tácticas (¿Qué proyectos haremos?)</CardTitle></CardHeader><CardContent><p>Son las iniciativas o proyectos de mejora más importantes. Frecuentemente involucran la introducción de nuevas tecnologías o metodologías.</p><p className="mt-2 font-semibold">Ejemplos:</p><ul className="list-disc pl-5 mt-1"><li>Implementar producción esbelta en todas las plantas de manufactura</li><li>Aplicar QFD en el lanzamiento del nuevo producto</li></ul></CardContent></Card>),},
    { id: "matriz-x-interactiva", title: "Taller: Matriz X", content: <XMatrixCard /> },
    { 
      id: "cierre", 
      title: "Cierre", 
      content: (
        <Card>
          <CardHeader><CardTitle>Cierre y Próximos Pasos</CardTitle></CardHeader>
          <CardContent>
             {/* CORRECCIÓN: Se reemplazaron ' por &apos; */}
            <p className="text-lg">Hoshin Kanri integra <strong>estrategia, ejecución y aprendizaje</strong>. La clave es el enfoque (&apos;menos pero mejor&apos;) y la revisión disciplinada.</p>
          </CardContent>
        </Card>
      ),
    },
  ];
}