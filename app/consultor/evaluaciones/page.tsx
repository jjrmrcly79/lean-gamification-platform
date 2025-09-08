// app/consultor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Attempt {
  id: string;
  created_at: string;
  status: string;
  final_score: number | null;
  profiles: { email: string } | null;
}

export default function ConsultantDashboard() {
  const supabase = getSupabaseBrowserClient();
  const [pendingAttempts, setPendingAttempts] = useState<Attempt[]>([]);
  const [completedAttempts, setCompletedAttempts] = useState<Attempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('attempts')
        .select(`id, created_at, status, final_score, profiles(email)`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching attempts:", error);
      } else if (data) {
        // Se añade el tipo 'any' para solucionar el error de compilación de Vercel
        const formattedData = data.map((attempt: any) => ({
          ...attempt,
          profiles: Array.isArray(attempt.profiles) ? attempt.profiles[0] : attempt.profiles,
        }));
        
        setPendingAttempts(formattedData.filter(a => a.status === 'pending_review'));
        setCompletedAttempts(formattedData.filter(a => a.status === 'completed'));
      }
      setIsLoading(false);
    };

    fetchAttempts();
  }, [supabase]); // Se añade la dependencia para una buena práctica

  if (isLoading) {
    return <div className="p-8">Cargando evaluaciones...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      <h1 className="text-3xl font-bold text-dark-blue mb-6">Dashboard del Consultor</h1>
      
      <Card>
        <CardHeader><CardTitle>Evaluaciones Pendientes de Revisión</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email del Usuario</TableHead>
                <TableHead>Fecha del Examen</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingAttempts.length > 0 ? (
                pendingAttempts.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell className="font-medium">{attempt.profiles?.email || 'N/A'}</TableCell>
                    <TableCell>{new Date(attempt.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild><Link href={`/consultor/evaluaciones/${attempt.id}`}>Evaluar</Link></Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={3} className="text-center">No hay evaluaciones pendientes.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Historial de Evaluaciones Completadas</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email del Usuario</TableHead>
                <TableHead>Fecha de Evaluación</TableHead>
                <TableHead>Calificación Final</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedAttempts.length > 0 ? (
                completedAttempts.map((attempt) => (
                  <TableRow key={attempt.id} className="bg-gray-50">
                    <TableCell>{attempt.profiles?.email || 'N/A'}</TableCell>
                    <TableCell>{new Date(attempt.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-bold">{attempt.final_score?.toFixed(1) ?? 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline">
                        <Link href={`/consultor/evaluaciones/${attempt.id}`}>Ver Detalles</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="text-center">No hay evaluaciones completadas.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}