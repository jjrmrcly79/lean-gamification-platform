"use client";

import { useRef, useCallback } from "react";

// Define los props que el componente puede recibir
type Props = {
  fileName?: string;
};

// --- COMPONENTE PRINCIPAL ---
export default function HoshinMatrixExport({ fileName = "Hoshin-Matrix.pdf" }: Props) {
  // Ref para apuntar al contenedor HTML que se exportará
  const ref = useRef<HTMLDivElement>(null);

  // --- FUNCIÓN PARA DESCARGAR EL PDF ---
  const handleDownload = useCallback(async () => {
    const el = ref.current;
    if (!el) return;

    // Agrega una clase temporal al <html> para aplicar estilos de impresión
    const root = document.documentElement;
    root.classList.add("pdf-export");

    // Opciones de configuración para la librería html2pdf.js
    const opt = {
      margin: [0.4, 0.4, 0.4, 0.4] as [number, number, number, number],
      filename: fileName,
      image: { type: "jpeg" as const, quality: 1 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
      jsPDF: { unit: "in" as const, format: "a4", orientation: "landscape" as const },
      pagebreak: { mode: ["css", "legacy"] as ("css" | "legacy" | "avoid-all")[] },
    };

    try {
      // Importa dinámicamente la librería y genera el PDF
      const { default: html2pdf } = await import("html2pdf.js");
      await html2pdf().set(opt).from(el).save();
    } finally {
      // Quita la clase temporal después de generar el PDF
      root.classList.remove("pdf-export");
    }
  }, [fileName]);

  // --- ESTRUCTURA JSX DEL COMPONENTE ---
  return (
    <div className="w-full">
      {/* Botón de descarga */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleDownload}
          className="px-4 py-2 rounded-md bg-black text-white hover:opacity-90"
        >
          Descargar PDF
        </button>
      </div>

      {/* ==================================================================== */}
      {/* ▼▼▼ ESTE ES EL CONTENEDOR QUE SE CONVIERTE EN PDF ▼▼▼ */}
      {/* Para cambiar el layout del PDF, reorganiza los divs de adentro. */}
      {/* ==================================================================== */}
      <div ref={ref} id="hoshin-matrix" className="bg-white p-4">
        <div className="hc-border avoid-break">
          {/* Encabezado */}
          <div className="flex items-center justify-between px-4 py-2" style={{ background: "#b30000", color: "#fff" }}>
            <h2 className="text-base font-semibold">HOSHIN PLANNING MATRIX (X-MATRIX)</h2>
            <img src="/logo.svg" alt="Logo" className="h-6" />
          </div>

          {/* --- GRILLA PRINCIPAL DE LA MATRIZ --- */}
          {/* Reordena los siguientes bloques para cambiar el diseño del PDF */}
          <div className="grid grid-cols-12 hc-border">
            
            {/* BLOQUE 1: Columna izquierda (Objetivos 3-5 Años) */}
            <div className="col-span-3 p-3 hc-cell">
              <h3 className="font-semibold mb-2">3-5 Year Breakthrough Objectives</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Achieve world-class quality (Malcolm Baldrige)</li>
                <li>Reduce process waste by 40%</li>
              </ul>
            </div>

            {/* BLOQUE 2: Centro superior (Prioridades de Mejora) */}
            <div className="col-span-6 p-3 hc-cell">
              <h3 className="font-semibold mb-2">Top-Level Improvement Priorities</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Increase customer engagement in design</li>
                <li>Deploy Performance Excellence methodologies</li>
              </ul>
            </div>

            {/* BLOQUE 3: Columna derecha (Recursos / Resultados) */}
            <div className="col-span-3 p-3 hc-cell">
              <h3 className="font-semibold mb-2">Resources</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Jim Gruber (VP Quality)</li>
                <li>Dave Niles (VP Marketing)</li>
              </ul>
            </div>

            {/* BLOQUE 4: Fila inferior izquierda (Objetivos Anuales) */}
            <div className="col-span-3 p-3 hc-cell">
              <h3 className="font-semibold mb-2">Annual Objectives</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Grow revenue to $75M</li>
                <li>Reduce lead time by 20%</li>
              </ul>
            </div>

            {/* BLOQUE 5: Centro (Target to Improve) */}
            <div className="col-span-6 p-6 hc-cell flex items-center justify-center">
              <span className="text-sm font-semibold uppercase tracking-wide">Target to Improve</span>
            </div>

            {/* BLOQUE 6: Fila inferior derecha (Leyenda) */}
            <div className="col-span-3 p-3 hc-cell">
              <h3 className="font-semibold mb-2">Legend / Correlations</h3>
              <div className="flex items-center gap-2 text-sm">
                <span>●</span> Strong
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>○</span> Weak
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}