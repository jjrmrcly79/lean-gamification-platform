// app/consultor/analizador/review/[jobId]/page.tsx
export default function ReviewPage({ params }: { params: { jobId: string } }) {
  return (
    <div style={{ padding: 24 }}>
      <h1>Revisión de preguntas — Job {params.jobId}</h1>
      <p>Aquí listarás staging_generated_questions…</p>
    </div>
  );
}
