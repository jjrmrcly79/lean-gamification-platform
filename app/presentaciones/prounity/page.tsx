"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client"; // ✅ ya no marcará error

export default function ProUnityLanding() {
  const [formData, setFormData] = useState({
    nombre: "",
    empresa: "",
    cargo: "",
    telefono: "",
    email: "",
    mensaje: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const { error } = await (supabase as any)
  .from("interesados_prounity")
  .insert([formData]);

      if (error) throw error;
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  // Fondo animado IA (canvas)
  useEffect(() => {
    const canvas = document.getElementById("particles") as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
    }));

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
      requestAnimationFrame(animate);
    };
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    animate();
  }, []);

  return (
    <main className="relative min-h-screen bg-[#0a0f12] text-white overflow-hidden font-[Inter]">
      <canvas id="particles" className="absolute inset-0 opacity-30" />

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center text-center py-20 px-6">
        <motion.img
          src="/logos/logo-prounity-light.png"
          alt="ProUnity Logo"
          className="h-16 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.h1
          className="text-4xl font-bold mb-2 text-[#d4af37]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Consultoría que se mide en resultados.
        </motion.h1>
        <motion.p
          className="text-gray-300 text-lg max-w-xl mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          No vendemos teoría. Transformamos operaciones reales con IA, Lean y desarrollo humano.
          Si no generamos valor, no pagas.
        </motion.p>
        <a
          href="#form"
          className="bg-[#d4af37] text-black px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform"
        >
          Agenda tu diagnóstico gratuito
        </a>
      </section>

      {/* DIFERENCIADOR */}
      <section className="z-10 relative px-8 py-16 bg-[#101820] text-center space-y-6">
        <h2 className="text-2xl font-semibold text-[#d4af37]">Nuestro Diferencial</h2>
        <ul className="space-y-4 text-gray-300">
          <li>🚀 No vendemos reportes, entregamos sistemas funcionales.</li>
          <li>🤝 No cobramos por horas, cobramos por valor real.</li>
          <li>🧠 No teoricemos procesos, los optimizamos.</li>
          <li>💼 No observamos al cliente, trabajamos junto a él hasta lograr la transformación.</li>
        </ul>
      </section>

      {/* FORMULARIO */}
      <section id="form" className="relative z-10 px-6 py-16 bg-[#0a0f12]">
        <h3 className="text-2xl font-semibold text-center text-[#d4af37] mb-8">
          Déjanos tus datos
        </h3>
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto flex flex-col gap-4 text-gray-200"
        >
          {["nombre", "empresa", "cargo", "telefono", "email"].map((field) => (
            <input
              key={field}
              name={field}
              required
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
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
            <p className="text-red-400 text-sm text-center mt-2">
              Ocurrió un error. Intenta de nuevo.
            </p>
          )}
        </form>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 text-center py-8 text-gray-500 text-sm">
        © {new Date().getFullYear()} <span className="text-[#d4af37]">ProUnity Consulting</span> ·
        Consultoría que se mide en resultados
      </footer>
    </main>
  );
}
