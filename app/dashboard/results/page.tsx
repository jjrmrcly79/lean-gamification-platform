'use client';

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import type { Database } from '@/lib/database.types'// Make sure the path is correct

type ScoreByCategory = Record<string, { score: number }>;
type ScoreBySubcategory = Record<string, { score: number }>;

type Attempt = Database['public']['Tables']['attempts']['Row'];

export default function ResultsPage() {
  const supabase = getSupabaseBrowserClient();
  const [attempts, setAttempts] = useState<Attempt[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 1. OBTENEMOS EL ROL DEL USUARIO ACTUAL
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          setLoading(false);
          return;
        }

        // 2. CONSTRUIMOS LA CONSULTA BASE
        let query = supabase
          .from('attempts')
          .select('*')
          .eq('status', 'completed');

        // 3. APLICAMOS EL FILTRO DE USUARIO SOLO SI NO ES CONSULTOR
        if (profile?.role !== 'consultant') {
          query = query.eq('user_id', user.id);
        }
        
        // 4. EJECUTAMOS LA CONSULTA FINAL CON EL ORDENAMIENTO
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching completed attempts:", error);
        } else if (data) {
          setAttempts(data);
        }
      }
      setLoading(false);
    };
    fetchAttempts();
  }, [supabase]);

  const latestAttempt = attempts?.[0];

  const categoryRadarData = latestAttempt && latestAttempt.score_by_category ? Object.entries(latestAttempt.score_by_category as unknown as ScoreByCategory).map(([name, data]) => ({
    subject: name,
    score: data.score,
    fullMark: 100
  })) : [];

  const subcategoryRadarData = latestAttempt && latestAttempt.score_by_subcategory ? Object.entries(latestAttempt.score_by_subcategory as unknown as ScoreBySubcategory).map(([name, data]) => ({
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
                        <Progress value={latestAttempt.perfil_score || 0} className="mt-1" />
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