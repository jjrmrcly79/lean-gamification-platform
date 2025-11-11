"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase-client";

type Status = "idle" | "loading" | "success" | "error";

export default function ProUnityLandingV2() {
  const [path, setPath] = useState<"con-sistema" | "sin-sistema" | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [formData, setFormData] = useState({
    nombre: "",
    empresa: "",
    cargo: "",
    telefono: "",
    email: "",
    mensaje: "",
  });

  const formRef = useRef<HTMLDivElement | null>(null);

  const scrollToForm = () =>
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const whatsappCTA = useMemo(
    () =>
      `https://wa.me/52TU_NUMERO?text=${encodeURIComponent(
        "Hola ProUnity, quiero una demo: "
          + (path === "con-sistema"
              ? "Tengo un sistema y quiero agregar la capa inteligente."
              : path === "sin-sistema"
              ? "No tengo sistema, quiero empezar con módulos."
              : "Quiero un diagnóstico.")
      )}`,
    [path]
  );

  const telegramCTA = "https://t.me/TU_BOT_URL";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      // Nota: usamos `as any` para saltar el error de tipos hoy.
      const { error } = await (supabase as any)
        .from("interesados_prounity")
        .insert([{ ...formData, origen: "landing_v2", ruta: path }]);
      if (error) throw error;
      setStatus("success");
      setFormData({
        nombre: "",
        empresa: "",
        cargo: "",
        telefono: "",
        email: "",
        mensaje: "",
      });
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  // Fondo animado
  useEffect(() => {
    const canvas = document.getElementById("particles") as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
    }));

    let raf = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#d4af37";
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-[#0a0f12] text-white overflow-hidden font-[Inter]">
      <canvas id="particles" className="absolute inset-0 opacity-25" />
      {/* HERO */}
      <section className="relative z-10 text-center px-6 pt-12 pb-10">
        <img
          src="/logos/logo-prounity-light.png"
          alt="ProUnity"
          className="h-14 mx-auto mb-6"
        />
        <motion.h1
          className="text-4xl font-bold text-[#d4af37] mb-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Moderniza tu operación en 30 días
        </motion.h1>
        <p className="text-gray-300 max-w-xl mx-auto">
          IA + Lean + Desarrollo humano. Si no hay mejora, no pagas.
        </p>

        {/* Doble CTA: Rutas */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
          <button
            onClick={() => {
              setPath("con-sistema");
              document
                .getElementById("capa-inteligente")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className={`rounded-xl px-5 py-4 border border-[#d4af37]/40 hover:border-[#d4af37] transition ${
              path === "con-sistema" ? "bg-[#101820]" : "bg-[#0e1419]"
            }`}
          >
            💻 Tengo sistema — Quiero agregar IA
          </button>
          <button
            onClick={() => {
              setPath("sin-sistema");
              document
                .getElementById("sistema-modular")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className={`rounded-xl px-5 py-4 border border-[#d4af37]/40 hover:border-[#d4af37] transition ${
              path === "sin-sistema" ? "bg-[#101820]" : "bg-[#0e1419]"
            }`}
          >
            ⚙️ No tengo sistema — Quiero módulos
          </button>
        </div>

        {/* CTA rápidos */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <a
            href={whatsappCTA}
            target="_blank"
            className="bg-[#d4af37] text-black px-5 py-3 rounded-lg font-semibold hover:scale-105 transition-transform"
          >
            Hablar por WhatsApp
          </a>
          <a
            href={telegramCTA}
            target="_blank"
            className="px-5 py-3 rounded-lg border border-[#d4af37]/50 hover:border-[#d4af37] transition"
          >
            Probar Mr. Kaizen
          </a>
        </div>
      </section>

      {/* CAPA INTELIGENTE */}
      <section id="capa-inteligente" className="relative z-10 px-6 py-12 bg-[#101820]">
        <h2 className="text-2xl font-semibold text-[#d4af37] text-center mb-6">
          Capa Inteligente sobre tu sistema actual
        </h2>

        <p className="text-gray-300 text-center max-w-2xl mx-auto mb-8">
          Conectamos sobre tu ERP, CRM, Excel o base de datos. En una semana tienes
          dashboards, alertas y recomendaciones impulsadas por IA.
        </p>

        {/* Demo visual */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          <Card title="Dashboards en tiempo real" subtitle="Producción · Ventas · Compras">
            <div className="h-40 rounded-lg bg-gradient-to-b from-[#0a0f12] to-[#0e1419] p-3">
              <FakeChart />
            </div>
            <p className="text-sm text-gray-400 mt-3">
              OEE, lead time, rotación de inventario y más — con alertas automáticas.
            </p>
          </Card>

          <Card title="Alertas y Sugerencias" subtitle="Detección temprana">
            <ul className="text-sm text-gray-300 space-y-2">
              <li>⚠️ <b>Línea 3</b> bajó OEE a 72% (–8% vs. semana pasada).</li>
              <li>📦 Predicción: sobreinventario de insumo X en 7 días.</li>
              <li>🤖 Automatiza: genera orden de compra cuando el stock llegue a mínimo.</li>
            </ul>
            <div className="mt-4 flex gap-2">
              <a
                href={whatsappCTA}
                target="_blank"
                className="text-xs px-3 py-2 rounded-md bg-[#d4af37] text-black font-semibold"
              >
                Ver demo con mis datos
              </a>
              <button
                onClick={scrollToForm}
                className="text-xs px-3 py-2 rounded-md border border-[#d4af37]/50"
              >
                Agenda diagnóstico
              </button>
            </div>
          </Card>
        </div>
      </section>

      {/* SISTEMA MODULAR */}
      <section id="sistema-modular" className="relative z-10 px-6 py-12 bg-[#0a0f12]">
        <h2 className="text-2xl font-semibold text-[#d4af37] text-center mb-6">
          Sistema Modular Inteligente (si hoy no tienes sistema)
        </h2>
        <p className="text-gray-300 text-center max-w-2xl mx-auto mb-8">
          Empieza pequeño y crece a tu ritmo. Módulos conectados por IA desde el día uno.
        </p>

        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Module title="Producción" bullets={["Órdenes", "Capacidad", "OEE", "Trazabilidad"]} />
          <Module title="Compras" bullets={["Requisiciones", "OC", "ABC", "Stock mínimo"]} />
          <Module title="Mantenimiento" bullets={["Preventivo", "Correctivo", "MTBF/MTTR"]} />
          <Module title="Ventas" bullets={["Cotizaciones", "CRM simple", "Forecast IA"]} />
          <Module title="Talento" bullets={["Roles/turnos", "Skills Matrix", "H&S"]} />
          <Module title="Energía" bullets={["Consumos", "Alertas picos", "Ahorro"]} />
        </div>

        <div className="mt-6 text-center">
          <a
            href={whatsappCTA}
            target="_blank"
            className="inline-block bg-[#d4af37] text-black px-5 py-3 rounded-lg font-semibold hover:scale-105 transition-transform"
          >
            Quiero armar mi sistema
          </a>
        </div>
      </section>

      {/* MR. KAIZEN */}
      <section className="relative z-10 px-6 py-12 bg-[#101820]">
        <h2 className="text-2xl font-semibold text-[#d4af37] text-center mb-6">
          Mr. Kaizen — tu consultor digital 24/7
        </h2>
        <p className="text-gray-300 text-center max-w-2xl mx-auto mb-6">
          Un bot en Telegram/WhatsApp que acompaña tu implementación: responde dudas, crea reportes
          y te recuerda tus compromisos diarios de mejora.
        </p>

        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
          <Card title="Chat de ejemplo" subtitle="Vista móvil">
            <PhoneMock
              messages={[
                { from: "bot", text: "Hola 👋 Soy Mr. Kaizen. ¿Qué área quieres mejorar hoy?" },
                { from: "user", text: "Producción: línea 3." },
                { from: "bot", text: "OEE actual 72% (–8%). Causas: micro-paros y scrap. ¿Genero plan 5W2H?" },
                { from: "user", text: "Sí, y programa recordatorio diario." },
                { from: "bot", text: "Listo ✅ Te escribiré 9:00 am con tu check de acciones." },
              ]}
            />
          </Card>

          <Card title="Acción inmediata" subtitle="Pruébalo ahora">
            <div className="flex flex-col gap-3">
              <a
                href={telegramCTA}
                target="_blank"
                className="bg-[#d4af37] text-black px-4 py-3 rounded-lg font-semibold text-center"
              >
                Abrir en Telegram
              </a>
              <a
                href={whatsappCTA}
                target="_blank"
                className="px-4 py-3 rounded-lg border border-[#d4af37]/50 text-center"
              >
                Escribir por WhatsApp
              </a>
              <button onClick={scrollToForm} className="text-sm underline text-gray-300">
                Prefiero dejar mis datos
              </button>
            </div>
          </Card>
        </div>
      </section>

      {/* FORMULARIO */}
      <section ref={formRef} id="form" className="relative z-10 px-6 py-14 bg-[#0a0f12]">
        <h3 className="text-2xl font-semibold text-center text-[#d4af37] mb-8">
          Agenda tu diagnóstico gratuito
        </h3>

        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto flex flex-col gap-4 text-gray-200"
        >
          {["nombre", "empresa", "cargo", "telefono", "email"].map((field) => (
            <input
              key={field}
              name={field}
              required={field !== "cargo"}
              placeholder={toLabel(field)}
              value={(formData as any)[field]}
              onChange={handleChange}
              className="p-3 rounded-md bg-[#101820] border border-gray-700 focus:border-[#d4af37] outline-none"
            />
          ))}
          <textarea
            name="mensaje"
            placeholder="¿En qué podemos ayudarte?"
            value={formData.mensaje}
            onChange={handleChange}
            className="p-3 rounded-md bg-[#101820] border border-gray-700 focus:border-[#d4af37] outline-none h-28"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-[#d4af37] text-black font-bold py-3 rounded-lg hover:scale-105 transition-transform"
          >
            {status === "loading"
              ? "Enviando..."
              : status === "success"
              ? "✅ Enviado"
              : "Enviar"}
          </button>

          {status === "error" && (
            <p className="text-red-400 text-sm text-center mt-1">
              Ocurrió un error. Intenta de nuevo.
            </p>
          )}
          {status === "success" && (
            <p className="text-emerald-400 text-sm text-center mt-1">
              ¡Gracias! Te contactamos en breve.
            </p>
          )}
        </form>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 text-center py-8 text-gray-500 text-xs">
        © {new Date().getFullYear()} <span className="text-[#d4af37]">ProUnity Consulting</span> ·
        Consultoría que se mide en resultados
      </footer>
    </main>
  );
}

/* ---------- UI Helpers ---------- */

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#d4af37]/35 bg-[#0e1419] p-5 shadow-[0_0_0_1px_rgba(212,175,55,.06)]">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Module({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <div className="rounded-xl border border-[#d4af37]/30 p-4 bg-[#0e1419] hover:border-[#d4af37] transition">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[#d4af37]">▣</span>
        <h4 className="font-semibold">{title}</h4>
      </div>
      <ul className="text-sm text-gray-300 space-y-1">
        {bullets.map((b) => (
          <li key={b}>• {b}</li>
        ))}
      </ul>
    </div>
  );
}

function PhoneMock({
  messages,
}: {
  messages: { from: "bot" | "user"; text: string }[];
}) {
  return (
    <div className="w-full max-w-[320px] mx-auto rounded-3xl border border-[#d4af37]/25 bg-[#0a0f12] p-3">
      <div className="h-6 w-24 bg-[#101820] rounded-full mx-auto mb-3" />
      <div className="h-[360px] overflow-y-auto space-y-2 p-2 bg-[#0e1419] rounded-xl">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] text-sm p-2 rounded-lg ${
              m.from === "bot"
                ? "bg-[#121a20] text-gray-200"
                : "bg-[#d4af37] text-black ml-auto"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <div className="flex-1 bg-[#101820] h-8 rounded-md" />
        <div className="w-10 bg-[#d4af37] h-8 rounded-md" />
      </div>
    </div>
  );
}

function FakeChart() {
  // Simple “skeleton” chart bars
  const bars = [60, 72, 45, 80, 70, 66, 78];
  return (
    <div className="flex items-end gap-2 h-full">
      {bars.map((h, idx) => (
        <div key={idx} className="flex-1 bg-[#121a20] rounded">
          <div
            className="w-full bg-[#d4af37] rounded-t"
            style={{ height: `${h}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function toLabel(k: string) {
  return k.charAt(0).toUpperCase() + k.slice(1).replace("_", " ");
}
