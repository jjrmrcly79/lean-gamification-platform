"use client";

import React, { useEffect, useRef } from "react";
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  BubbleController,
  CategoryScale,
  LinearScale,
  Title,
} from "chart.js";
import type { TooltipItem } from "chart.js"
// Registros necesarios de Chart.js
Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  BubbleController,
  CategoryScale,
  LinearScale,
  Title
);

export default function Page() {
  const importRef = useRef<HTMLCanvasElement | null>(null);
  const riskRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const chartColors = {
      primary: "#D4AF37",
      accent1: "#C8553D",
      accent2: "#A93226",
      success: "#7C986C",
      successDark: "#5A7D4A",
      dark: "#2E2E2E",
      light: "#F8F9FA",
    };

    // --- Donut: Foco de Integración (Vector 1)
    const longLabels = [
      ["Excel: Catálogo", "de Conceptos (V1)"],
      ["Excel: Generadores", "y Estimaciones (V1)"],
      ["Exportación Manual", "(V2)"],
      ["Otros (MS Project,", "SAP, AutoCAD)"],
    ];
    const tooltipTitleCallbackLong = (items: any[]) => {
      const idx = items[0].dataIndex;
      const label = longLabels[idx];
      return Array.isArray(label) ? label.join(" ") : label;
    };

    let importChart: Chart | undefined;
    if (importRef.current) {
      importChart = new Chart(importRef.current, {
        type: "doughnut",
        data: {
          labels: ["Catálogo (V1)", "Generadores (V1)", "Manual (V2)", "Otros"],
          datasets: [
            {
              label: "Foco de Integración",
              data: [35, 30, 15, 20],
              backgroundColor: [
                chartColors.success,
                chartColors.successDark,
                chartColors.primary,
                "#A0AEC0",
              ],
              borderColor: chartColors.light,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: chartColors.dark,
                padding: 20,
                font: { family: "Inter", size: 12 },
              },
            },
            tooltip: { callbacks: { title: tooltipTitleCallbackLong as any } },
          },
        },
      });
    }

    // --- Bubble: Riesgo vs Viabilidad
    const riskLabels = [
      ["V2: Exportación", "Manual"],
      ["V1: Importación", "Excel"],
      ["V3: SQL", "Read-Only"],
      ["V4: SQL Write", "(Peligro)"],
    ];
    const tooltipTitleCallback = (items: any[]) => {
      const idx = items[0].dataIndex;
      const label = riskLabels[idx];
      return Array.isArray(label) ? label.join(" ") : label;
    };

    let riskChart: Chart | undefined;
    if (riskRef.current) {
      riskChart = new Chart(riskRef.current, {
        type: "bubble",
        data: {
          labels: riskLabels as any,
          datasets: [
            {
              label: "Vectores de Integración",
              data: [
                { x: 1.5, y: 1, r: 15 }, // V2
                { x: 3, y: 1, r: 25 }, // V1
                { x: 3, y: 2, r: 25 }, // V3
                { x: 3, y: 3, r: 35 }, // V4
              ],
              backgroundColor: [
                chartColors.primary,
                chartColors.success,
                chartColors.success,
                chartColors.accent2,
              ],
              borderColor: [chartColors.dark, chartColors.dark, chartColors.dark, chartColors.dark],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: "Viabilidad de Implementación",
                color: chartColors.dark,
                font: { size: 14, family: "Inter", weight: "bold" },
              },
              min: 0,
              max: 4,
              ticks: {
                color: chartColors.dark,
                stepSize: 1,
                callback: (value: any) => ["", "Baja", "Media", "Alta", ""][value] as any,
              },
              grid: { color: "#E2E8F0" },
            },
            y: {
              title: {
                display: true,
                text: "Nivel de Riesgo",
                color: chartColors.dark,
                font: { size: 14, family: "Inter", weight: "bold" },
              },
              min: 0,
              max: 4,
              ticks: {
                color: chartColors.dark,
                stepSize: 1,
                callback: (value: any) => ["", "Bajo", "Medio", "Catastrófico", ""][value] as any,
              },
              grid: { color: "#E2E8F0" },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: tooltipTitleCallback as any,
                label: (ctx) => riskLabels[ctx.dataIndex].join(" "),
              },
            },
          },
        },
      });
    }

    return () => {
      importChart?.destroy();
      riskChart?.destroy();
    };
  }, []);

  return (
    <div className="leading-relaxed">
      {/* Encabezado */}
      <header
        className="w-full text-center p-8 md:p-12"
        style={{ backgroundColor: "var(--bg-dark)", color: "var(--text-light)" }}
      >
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
          Análisis de Integración: Neodata Suite
        </h1>
        <div
          className="inline-block px-6 py-2 rounded-full"
          style={{
            backgroundColor: "rgba(212, 175, 55, 0.2)",
            border: "1px solid var(--primary)",
          }}
        >
          <p className="text-lg md:text-xl font-semibold" style={{ color: "var(--primary)" }}>
            Estrategia para "Periféricos" (PUWIN+ y ERP 2021)
          </p>
        </div>
      </header>

      <main className="container mx-auto p-6 md:p-10">
        {/* Hook */}
        <section id="hook" className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-8" style={{ color: "var(--bg-dark)" }}>
            El Desafío: Simplificar lo Complejo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4" style={{ borderColor: "var(--success)" }}>
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--success)" }}>
                Objetivo
              </h3>
              <p>
                Desarrollar "periféricos" (aplicaciones web/móviles) que simplifiquen la captura de datos y el uso de la
                suite Neodata (ERP y PUWIN+).
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4" style={{ borderColor: "var(--accent-1)" }}>
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--accent-1)" }}>
                Problema
              </h3>
              <p>
                Neodata Suite no ofrece una API pública (REST/SOAP) documentada, lo que dificulta la integración de
                aplicaciones de terceros.
              </p>
            </div>
          </div>
        </section>

        {/* Falsos positivos */}
        <section id="false-positives" className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: "var(--bg-dark)" }}>
            La Investigación: El Mito de la API
          </h2>
          <p className="text-center max-w-3xl mx-auto mb-10">
            Una búsqueda de "API de Neodata" genera numerosos falsos positivos. Es crucial identificar que nuestro
            objetivo, <strong>neodata.mx (Software de Construcción)</strong>, no está relacionado con estas otras
            empresas.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div
              className="md:col-span-2 lg:col-span-1 lg:row-span-2 flex items-center justify-center p-8 bg-white rounded-lg shadow-xl"
              style={{ border: "2px solid var(--success)" }}
            >
              <div className="text-center">
                <span className="text-6xl mb-4 block">✅</span>
                <h3 className="text-2xl font-bold" style={{ color: "var(--success)" }}>
                  Objetivo Real
                </h3>
                <p className="text-lg font-semibold">Neodata.mx</p>
                <p>(Software ERP de Construcción en México)</p>
              </div>
            </div>

            {[
              { t: "Falso Positivo #1", n: "Netdata.cloud", d: "Sistema de monitoreo de infraestructura. Sí tiene API REST, pero no está relacionado." },
              { t: "Falso Positivo #2", n: "Neodata Group (Italia)", d: "Empresa Europea de Big Data, IA y Ad-Tech. No relacionada." },
              { t: "Falso Positivo #3", n: "NeoData (Isoprime)", d: "Software médico (NICU) de EE. UU. Utiliza interfaces HL7. No relacionado." },
              { t: "Falso Positivo #4", n: "NeoData (GT Software)", d: "Herramienta de migración de mainframe (COBOL a SQL). No relacionada." },
            ].map((x, i) => (
              <div key={i} className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold" style={{ color: "var(--bg-dark)" }}>
                  {x.t}
                </h3>
                <p className="text-lg font-semibold" style={{ color: "var(--accent-1)" }}>
                  {x.n}
                </p>
                <p className="text-sm text-gray-600">{x.d}</p>
                <div className="false-positive-line" />
              </div>
            ))}
          </div>

          <p
            className="text-center text-xl font-bold mt-8 p-4 rounded-lg max-w-4xl mx-auto"
            style={{ backgroundColor: "var(--bg-dark)", color: "var(--primary)" }}
          >
            Conclusión: Debemos usar los mecanismos de interoperabilidad nativos.
          </p>
        </section>

        {/* Vectores */}
        <section id="vectors" className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: "var(--bg-dark)" }}>
            Los 4 Vectores de Integración
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CardVector icon="📥" title="Vector 1: Escritura Segura" bar="var(--success)" pillBg="#F1F8E9" pillText="var(--success)">
              <>
                <p className="font-semibold mb-2" style={{ color: "var(--success)" }}>
                  Importación vía Excel
                </p>
                <p className="text-sm text-gray-700">
                  El periférico genera un Excel con formato estricto. El usuario usa "Pegar desde Portapapeles" en
                  Neodata. Respeta la lógica de negocio.
                </p>
                <Pill text="Recomendado (Escritura)" bg="#F1F8E9" color="var(--success)" />
              </>
            </CardVector>

            <CardVector icon="📤" title="Vector 2: Lectura Baja" bar="var(--primary)" pillBg="#FFFBEB" pillText="var(--primary)">
              <>
                <p className="font-semibold mb-2" style={{ color: "var(--primary)" }}>
                  Exportación Manual
                </p>
                <p className="text-sm text-gray-700">
                  El usuario exporta reportes manualmente a Excel. El periférico podría procesarlos, pero carece de
                  datos en tiempo real.
                </p>
                <Pill text="Manual / Lento" bg="#FFFBEB" color="var(--primary)" />
              </>
            </CardVector>

            <CardVector icon="💾" title="Vector 3: Lectura Alta" bar="var(--success)" pillBg="#F1F8E9" pillText="var(--success)">
              <>
                <p className="font-semibold mb-2" style={{ color: "var(--success)" }}>
                  Acceso SQL (Read-Only)
                </p>
                <p className="text-sm text-gray-700">
                  Conexión directa a la BD de MS SQL (.mdf) con credenciales de solo lectura para consultas en vivo (si
                  es on-premise).
                </p>
                <Pill text="Recomendado (Lectura)" bg="#F1F8E9" color="var(--success)" />
              </>
            </CardVector>

            <CardVector icon="☠️" title="Vector 4: Riesgo Alto" bar="var(--accent-2)" pillBg="#FEE2E2" pillText="var(--accent-2)">
              <>
                <p className="font-semibold mb-2" style={{ color: "var(--accent-2)" }}>
                  Manipulación SQL
                </p>
                <p className="text-sm text-gray-700">
                  Escribir (INSERT/UPDATE) directamente en la BD omite la lógica de negocio y corrompe los datos de
                  forma catastrófica.
                </p>
                <Pill text="Estrictamente Prohibido" bg="#FEE2E2" color="var(--accent-2)" />
              </>
            </CardVector>
          </div>
        </section>

        {/* Arquitectura */}
        <section id="flow" className="mb-16 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: "var(--bg-dark)" }}>
            Arquitectura Híbrida Segura Recomendada
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center">
            <FlowBox icon="💾" title="1. BD Neodata (SQL)" note="Consulta en" strong="Solo Lectura (V3)" />
            <span className="flow-arrow">→</span>
            <div className="text-center p-6 m-4 rounded-xl shadow-md" style={{ backgroundColor: "var(--bg-dark)", color: "var(--primary)" }}>
              <span className="text-5xl block mb-2">📱</span>
              <h3 className="text-lg font-bold">2. Periférico (App)</h3>
              <p className="text-sm text-gray-300">Lectura en vivo +<br />Captura de datos</p>
            </div>
            <span className="flow-arrow">→</span>
            <FlowBox icon="📄" title="3. Archivo Excel" note="Generación de" strong="Layout Exacto (V1)" />
            <span className="flow-arrow">→</span>
            <FlowBox icon="📥" title="4. Neodata ERP" note='Importación oficial' strong='"Pegar desde Portapapeles"' />
          </div>
        </section>

        {/* Gráficas */}
        <section id="charts" className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "var(--bg-dark)" }}>
            Análisis Visual de Vectores
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="text-2xl font-bold mb-4" style={{ color: "var(--bg-dark)" }}>
                Foco de Integración (Vector 1)
              </h3>
              <p className="text-gray-700">
                El Vector 1 (Importación Excel) es el método de escritura principal. El trabajo del periférico será
                generar correctamente los layouts para los diferentes módulos de Neodata. Este gráfico muestra las
                principales áreas de enfoque.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-xl border-t-4" style={{ borderColor: "var(--primary)" }}>
              <div className="chart-container">
                <canvas ref={importRef} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="p-6 bg-gray-50 rounded-xl md:order-2">
              <h3 className="text-2xl font-bold mb-4" style={{ color: "var(--bg-dark)" }}>
                Matriz de Riesgo vs. Viabilidad
              </h3>
              <p className="text-gray-700">
                Comparamos los 4 vectores en función de su viabilidad y el riesgo para la integridad de los datos. La
                estrategia híbrida (V1 + V3) maximiza la viabilidad y minimiza el riesgo operativo.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-xl md:order-1 border-t-4" style={{ borderColor: "var(--accent-2)" }}>
              <div className="chart-container">
                <canvas ref={riskRef} />
              </div>
            </div>
          </div>
        </section>

        {/* Plan */}
        <section id="plan" className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: "var(--bg-dark)" }}>
            Siguientes Pasos: Cuestionario Estratégico
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg border-l-8" style={{ borderColor: "var(--primary)" }}>
            <p className="text-lg mb-6 font-semibold" style={{ color: "var(--bg-dark)" }}>
              Para validar la Arquitectura Híbrida Segura, debemos confirmar:
            </p>
            <ul className="space-y-6">
              {[
                {
                  n: "1",
                  t: "¿Instalación Local vs. Nube?",
                  d: 'Si es "Nube+", el V3 (SQL) es imposible y dependeremos solo de V1 y V2.',
                },
                {
                  n: "2",
                  t: "¿Credenciales Read-Only?",
                  d: "Si es local, ¿podemos obtener acceso de solo lectura a la BD SQL Server?",
                },
                {
                  n: "3",
                  t: "¿Entorno de Pruebas?",
                  d: "¿Existe un entorno de Staging/QA o una copia de respaldo para desarrollo?",
                },
                {
                  n: "4",
                  t: "¿Layouts Exactos?",
                  d: "Necesitamos las plantillas Excel (V1) actuales para Catálogos y Generadores.",
                },
              ].map((i) => (
                <li key={i.n} className="flex items-start">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-4"
                    style={{ backgroundColor: "var(--bg-dark)" }}
                  >
                    {i.n}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: "var(--bg-dark)" }}>
                      {i.t}
                    </h3>
                    <p className="text-gray-600">{i.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="text-center p-8 mt-12" style={{ backgroundColor: "var(--bg-dark)", color: "var(--text-light)" }}>
        <p className="opacity-80">
          Este análisis se basa en la investigación de mecanismos de interoperabilidad documentados y no oficiales.
        </p>
      </footer>
    </div>
  );
}

/** ---------- Componentes pequeños ---------- */

function CardVector({
  icon,
  title,
  bar,
  pillBg,
  pillText,
  children,
}: {
  icon: string;
  title: string;
  bar: string;
  pillBg: string;
  pillText: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-t-8" style={{ borderColor: bar }}>
      <span className="text-5xl block mb-4">{icon}</span>
      <h3 className="text-xl font-bold mb-2" style={{ color: "var(--bg-dark)" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Pill({ text, bg, color }: { text: string; bg: string; color: string }) {
  return (
    <div
      className="mt-4 text-xs font-bold p-2 rounded text-center uppercase tracking-wider"
      style={{ backgroundColor: bg, color }}
    >
      {text}
    </div>
  );
}

function FlowBox({ icon, title, note, strong }: { icon: string; title: string; note: string; strong: string }) {
  return (
    <div className="text-center p-4 m-2 bg-gray-50 rounded-lg">
      <span className="text-4xl block mb-2">{icon}</span>
      <h3 className="text-md font-bold" style={{ color: "var(--bg-dark)" }}>
        {title}
      </h3>
      <p className="text-xs text-gray-600">
        {note}
        <br />
        <strong style={{ color: "var(--success)" }}>{strong}</strong>
      </p>
    </div>
  );
}
