// leancert-frontend/app/consultor/analizador/page.tsx

'use client';

import dynamic from 'next/dynamic';

// Cargamos nuestro nuevo componente de forma dinámica, deshabilitando SSR
const PDFUploader = dynamic(() => import('./PDFUploader'), {
  ssr: false,
  loading: () => <p>Cargando herramienta...</p> // Un mensaje de carga opcional
});

export default function AnalizadorPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <PDFUploader />
    </div>
  );
}