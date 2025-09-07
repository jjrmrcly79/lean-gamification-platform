'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";


// 1. INTERFAZ ACTUALIZADA para incluir subcategorías
interface Attempt {
  id: string;
  final_score: number | null;
  status: string;
  created_at: string;
  score_by_category: Record<string, { score: number }>;
  score_by_subcategory: Record<string, { score: number }>; // <-- Añadido
  // Añadimos también los puntajes prácticos para mostrarlos
  perfil_score: number | null;
  kaizen_score: number | null;
  herramientas_score: number | null;
  involucramiento_score: number | null;
  sostenimiento_score: number | null;
}

export default function ResultsPage() {
  const supabase = createClient();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 2. CONSULTA ACTUALIZADA para traer todos los datos
        const { data, error } = await supabase
          .from('attempts')
          .select('*') // Pedimos todas las columnas
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching completed attempts:", error);
        } else if (data) {
          setAttempts(data as Attempt[]);
        }
      }
      setLoading(false);
    };
    fetchAttempts();
  }, []);

  const latestAttempt = attempts?.[0];

  const categoryRadarData = latestAttempt ? Object.entries(latestAttempt.score_by_category).map(([name, data]) => ({
    subject: name,
    score: data.score,
    fullMark: 100
  })) : [];

  // 3. PREPARACIÓN DE DATOS para el nuevo gráfico de subcategorías
  const subcategoryRadarData = latestAttempt ? Object.entries(latestAttempt.score_by_subcategory).map(([name, data]) => ({
    subject: name,
    score: data.score,
    fullMark: 100
  })) : [];

  const passingScore = 70; 
  const didPass = latestAttempt && latestAttempt.final_score ? latestAttempt.final_score >= passingScore : false;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 p-8">
        {loading ? (
          <p>Cargando resultados...</p>
        ) : latestAttempt ? (
          <div className="w-full max-w-5xl mx-auto space-y-8">
            {/* Tarjeta de Resumen Principal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl text-dark-blue">Informe Final de Diagnóstico</CardTitle>
                <CardDescription>Este es el resumen de tu desempeño.</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg text-gray-600">Puntaje Final Ponderado</p>
                <p className="text-7xl font-bold text-dark-blue my-2">{latestAttempt.final_score?.toFixed(1)}</p>
                {didPass ? (
                  <p className="text-2xl font-semibold text-green-600">¡Aprobado!</p>
                ) : (
                  <p className="text-2xl font-semibold text-red-600">No Aprobado</p>
                )}
              </CardContent>
            </Card>

            {/* Grid para los detalles */}
            <div className="grid gap-8 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Desglose del Examen Teórico (40%)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={categoryRadarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Puntaje" dataKey="score" stroke="#1A237E" fill="#1A237E" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Desglose de Evaluación Práctica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div>
                        <Label>Apego a Perfil (10%)</Label>
                        <Progress value={latestAttempt.perfil_score} className="mt-1" />
                    </div>
                    <div>
                        <Label>Aplicación en Piso (50%)</Label>
                        <div className="pl-4 mt-2 space-y-2 text-sm">
                            <p>Kaizen: {latestAttempt.kaizen_score?.toFixed(1)}%</p>
                            <p>Herramientas: {latestAttempt.herramientas_score?.toFixed(1)}%</p>
                            <p>Involucramiento: {latestAttempt.involucramiento_score?.toFixed(1)}%</p>
                            <p>Sostenimiento: {latestAttempt.sostenimiento_score?.toFixed(1)}%</p>
                        </div>
                    </div>
                </CardContent>
              </Card>
            </div>
            
            {/* 4. NUEVA TARJETA para el gráfico de subcategorías */}
            <Card>
              <CardHeader>
                <CardTitle>Desglose por Subcategoría</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={subcategoryRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Puntaje" dataKey="score" stroke="#DC2626" fill="#DC2626" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center mt-16">
            <h2 className="text-2xl font-semibold">No tienes evaluaciones completadas.</h2>
            <p className="text-gray-600 mt-2">Una vez que completes un diagnóstico y sea evaluado por un consultor, tus resultados aparecerán aquí.</p>
          </div>
        )}
      </main>
    </div>
  );
}