"use client";

import { useRef, useCallback } from "react";


type Props = {
  fileName?: string;
};

export default function HoshinMatrixExport({ fileName = "Hoshin-Matrix.pdf" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    const el = ref.current;
    if (!el) return;

    // 1) Activar la "piel PDF"
    const root = document.documentElement;
    root.classList.add("pdf-export");

    const opt = {
  // 👇 tupla explícita de 4 elementos
  margin: [0.4, 0.4, 0.4, 0.4] as [number, number, number, number],
  filename: fileName,
  image: { type: "jpeg" as const, quality: 1 },
  html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
  jsPDF: { unit: "in" as const, format: "a4", orientation: "landscape" as const },
  // Algunos d.ts de DefinitelyTyped no tipan pagebreak; fuerza el tipo del array
  pagebreak: { mode: ["css", "legacy"] as ("css" | "legacy" | "avoid-all")[] },
};


    try {
      const { default: html2pdf } = await import("html2pdf.js");
        // 3) Generar el PDF a partir del contenedor
      await html2pdf().set(opt).from(el).save();
    } finally {
      // 4) Quitar piel PDF
      root.classList.remove("pdf-export");
    }
  }, [fileName]);

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

      {/* CONTENEDOR A EXPORTAR */}
      <div ref={ref} id="hoshin-matrix" className="bg-white p-4">
        {/* Encabezado rojo tipo ejemplo */}
        <div className="hc-border avoid-break">
          <div className="flex items-center justify-between px-4 py-2" style={{ background: "#b30000", color: "#fff" }}>
            <h2 className="text-base font-semibold">HOSHIN PLANNING MATRIX (X-MATRIX)</h2>
            {/* Tu logo (usa una ruta pública o URL absoluta con CORS) */}
            <img src="/logo.svg" alt="Logo" className="h-6" />
          </div>

          {/* Aquí va tu matriz. Ejemplo simplificado de grilla con bordes sólidos */}
          <div className="grid grid-cols-12 hc-border">
            {/* Columna izquierda (3-5 year objectives) */}
            <div className="col-span-3 p-3 hc-cell">
              <h3 className="font-semibold mb-2">3-5 Year Breakthrough Objectives</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Achieve world-class quality (Malcolm Baldrige)</li>
                <li>Reduce process waste by 40%</li>
              </ul>
            </div>

            {/* Centro superior (Top-Level Improvement Priorities) */}
            <div className="col-span-6 p-3 hc-cell">
              <h3 className="font-semibold mb-2">Top-Level Improvement Priorities</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Increase customer engagement in design</li>
                <li>Deploy Performance Excellence methodologies</li>
              </ul>
            </div>

            {/* Columna derecha (Resources) */}
            <div className="col-span-3 p-3 hc-cell">
              <h3 className="font-semibold mb-2">Resources</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Jim Gruber (VP Quality)</li>
                <li>Dave Niles (VP Marketing)</li>
              </ul>
            </div>

            {/* Fila inferior izquierda (Annual Objectives) */}
            <div className="col-span-3 p-3 hc-cell">
              <h3 className="font-semibold mb-2">Annual Objectives</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Grow revenue to $75M</li>
                <li>Reduce lead time by 20%</li>
              </ul>
            </div>

            {/* Centro (Target to Improve) */}
            <div className="col-span-6 p-6 hc-cell flex items-center justify-center">
              <span className="text-sm font-semibold uppercase tracking-wide">Target to Improve</span>
            </div>

            {/* Fila inferior derecha (Correlaciones / leyenda) */}
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
