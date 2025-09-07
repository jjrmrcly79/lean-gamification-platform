// app/consultor/evaluaciones/[attemptId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

interface ScoreData {
  score: number;
  correct: number;
  total: number;
}

interface Attempt {
  id: string;
  created_at: string;
  status: string; // <-- Usaremos este campo
  profiles: { email: string } | null;
  score_by_category: Record<string, ScoreData>;
  score_by_subcategory: Record<string, ScoreData>;
  perfil_score: number | null;
  kaizen_score: number | null;
  herramientas_score: number | null;
  involucramiento_score: number | null;
  sostenimiento_score: number | null;
}

export default function EvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;
  const supabase = createClient();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- NUEVO: Estado para controlar si el formulario es de solo lectura ---
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [perfilScore, setPerfilScore] = useState(0);
  const [kaizenScore, setKaizenScore] = useState(0);
  const [herramientasScore, setHerramientasScore] = useState(0);
  const [involucramientoScore, setInvolucramientoScore] = useState(0);
  const [sostenimientoScore, setSostenimientoScore] = useState(0);
  
  useEffect(() => {
    if (!attemptId) return;
    const fetchAttempt = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('attempts')
        .select(`*, profiles(email)`)
        .eq('id', attemptId)
        .single();

      if (error) {
        setError("No se pudo encontrar la evaluación.");
      } else if (data) {
        setAttempt(data as Attempt);
        
        // --- LÓGICA DE SOLO LECTURA ---
        if (data.status === 'completed') {
          setIsReadOnly(true); // Si ya está completado, activamos el modo solo lectura
        }

        setPerfilScore(data.perfil_score || 0);
        setKaizenScore(data.kaizen_score || 0);
        setHerramientasScore(data.herramientas_score || 0);
        setInvolucramientoScore(data.involucramiento_score || 0);
        setSostenimientoScore(data.sostenimiento_score || 0);
      }
      setIsLoading(false);
    };
    fetchAttempt();
  }, [attemptId]);

  const handleSubmitEvaluation = async () => {
    // ... (la lógica de cálculo se mantiene igual)
    if (!attempt) return;
    const categoryScores = Object.values(attempt.score_by_category).map(c => c.score);
    const examenAvg = categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length;
    const pisoAvg = (kaizenScore + herramientasScore + involucramientoScore + sostenimientoScore) / 4;
    const finalScore = (examenAvg * 0.40) + (perfilScore * 0.10) + (pisoAvg * 0.50);

    const { error } = await supabase
      .from('attempts')
      .update({
        perfil_score: perfilScore,
        kaizen_score: kaizenScore,
        herramientas_score: herramientasScore,
        involucramiento_score: involucramientoScore,
        sostenimiento_score: sostenimientoScore,
        final_score: finalScore,
        status: 'completed'
      })
      .eq('id', attemptId);

    if (error) {
      alert("Error al guardar la evaluación.");
    } else {
      alert("Evaluación finalizada y guardada con éxito.");
      router.push('/consultor/evaluaciones');
    }
  };
  
  const categoryRadarData = attempt ? Object.entries(attempt.score_by_category).map(([name, data]) => ({ subject: name, score: parseFloat(data.score.toFixed(1)), fullMark: 100 })) : [];
  const subcategoryRadarData = attempt ? Object.entries(attempt.score_by_subcategory).map(([name, data]) => ({ subject: name, score: parseFloat(data.score.toFixed(1)), fullMark: 100 })) : [];

  if (isLoading) return <div className="p-8">Cargando evaluación...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Evaluación de: {attempt?.profiles?.email}</CardTitle>
          <CardDescription>
            {isReadOnly 
              ? "Detalles de una evaluación ya completada." 
              : "Resultados del examen teórico y formulario para la evaluación práctica."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Evaluación Práctica (Puntajes 0-100)</h3>
            <div>
              <Label htmlFor="perfil">10% - Apego a Perfil</Label>
              <Input id="perfil" type="number" value={perfilScore} onChange={(e) => setPerfilScore(Number(e.target.value))} disabled={isReadOnly} />
            </div>
            <div>
              <Label>50% - Aplicación en Piso</Label>
              <div className="grid grid-cols-2 gap-4 mt-2 p-4 border rounded-md">
                <div>
                  <Label htmlFor="kaizen" className="text-sm">Kaizen</Label>
                  <Input id="kaizen" type="number" value={kaizenScore} onChange={(e) => setKaizenScore(Number(e.target.value))} disabled={isReadOnly} />
                </div>
                <div>
                  <Label htmlFor="herramientas" className="text-sm">Herramientas</Label>
                  <Input id="herramientas" type="number" value={herramientasScore} onChange={(e) => setHerramientasScore(Number(e.target.value))} disabled={isReadOnly} />
                </div>
                <div>
                  <Label htmlFor="involucramiento" className="text-sm">Involucramiento</Label>
                  <Input id="involucramiento" type="number" value={involucramientoScore} onChange={(e) => setInvolucramientoScore(Number(e.target.value))} disabled={isReadOnly} />
                </div>
                <div>
                  <Label htmlFor="sostenimiento" className="text-sm">Sostenimiento</Label>
                  <Input id="sostenimiento" type="number" value={sostenimientoScore} onChange={(e) => setSostenimientoScore(Number(e.target.value))} disabled={isReadOnly} />
                </div>
              </div>
            </div>
            <Button onClick={handleSubmitEvaluation} className="w-full" disabled={isReadOnly}>
              {isReadOnly ? "Evaluación Completada" : "Calcular y Guardar Evaluación"}
            </Button>
          </div>
        </CardContent>
      </Card>
          
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle className="text-center">Desglose por Categoría</CardTitle></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={300}><RadarChart data={categoryRadarData}><PolarGrid /><PolarAngleAxis dataKey="subject" /><PolarRadiusAxis angle={30} domain={[0, 100]} /><Radar name="Puntaje" dataKey="score" stroke="#1A237E" fill="#1A237E" fillOpacity={0.6} /></RadarChart></ResponsiveContainer></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-center">Desglose por Subcategoría</CardTitle></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={300}><RadarChart data={subcategoryRadarData}><PolarGrid /><PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} /><PolarRadiusAxis angle={30} domain={[0, 100]} /><Radar name="Puntaje" dataKey="score" stroke="#DC2626" fill="#DC2626" fillOpacity={0.6} /></RadarChart></ResponsiveContainer></CardContent>
        </Card>
      </div>
    </div>
  );
}