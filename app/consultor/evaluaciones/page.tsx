'use client';

import { useState, useEffect } from 'react';
// FIX: Changed alias path to relative path for better resolution.
import { getSupabaseBrowserClient } from '../../../lib/supabase-client';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

// CORRECCIÓN 1: Definir tipos más precisos para los datos de Supabase.
// Esto nos permite eliminar 'any' y tener un código más seguro y predecible.

// Este tipo representa la estructura de los datos tal como vienen de la consulta de Supabase,
// donde 'users' puede ser un objeto, un array de objetos o nulo.
interface AttemptFromDB {
  id: string;
  created_at: string;
  status: 'pending_review' | 'completed';
  final_score: number | null;
  users: { email: string } | null;
}

// Este es el tipo que usaremos en nuestro estado, después de formatear los datos.
// Nos aseguramos de que 'users' sea siempre un objeto o nulo.
interface FormattedAttempt {
  id: string;
  created_at: string;
  status: string;
  final_score: number | null;
  users: { email: string } | null;
}

export default function ConsultantDashboard() {
  const supabase = getSupabaseBrowserClient();
  // Usamos el tipo FormattedAttempt para nuestros estados.
  const [pendingAttempts, setPendingAttempts] = useState<FormattedAttempt[]>([]);
  const [completedAttempts, setCompletedAttempts] = useState<FormattedAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      setIsLoading(true);

      // CORRECCIÓN 2: Tipar la respuesta de la consulta con .returns<T>()
      // Esto le dice a TypeScript qué estructura de datos esperamos, eliminando los errores
      // y dándonos autocompletado para el objeto 'data'.
      const { data, error } = await supabase
        .from('attempts')
        .select(`id, created_at, status, final_score, users(email)`)
        .order('created_at', { ascending: false })
        .returns<AttemptFromDB[]>(); // Le indicamos que esperamos un array de AttemptFromDB

      if (error) {
        console.error("Error fetching attempts:", error);
        setIsLoading(false); // Buena práctica: detener la carga también en caso de error.
        return;
      }

      if (data) {
        // CORRECCIÓN 3: Mapeo de datos sin 'any'.
        // TypeScript ahora sabe que 'attempt' es de tipo AttemptFromDB gracias a .returns()
        const formattedData: FormattedAttempt[] = data.map((attempt) => ({
          ...attempt,
          // Normalizamos el campo 'users' para que siempre sea un objeto o nulo.
          // Nota: Supabase devuelve un objeto si la relación es 1:1 o M:1 y se usa singular en el query
          // Pero si el tipo generado dice que puede ser array, lo manejamos.
          users: Array.isArray(attempt.users) ? attempt.users[0] : attempt.users,
        }));

        setPendingAttempts(formattedData.filter(a => a.status === 'pending_review'));
        setCompletedAttempts(formattedData.filter(a => a.status === 'completed'));
      }
      setIsLoading(false);
    };

    // Buena práctica: asegurarse de que el cliente de Supabase esté listo antes de llamar.
    if (supabase) {
      fetchAttempts();
    }
  }, [supabase]); // La dependencia es correcta.

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
                    <TableCell className="font-medium">{attempt.users?.email || 'N/A'}</TableCell>
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
                <TableHead className="text-right">Acciones</TableHead> {/* <-- Cambiado a "Acciones" (plural) */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedAttempts.length > 0 ? (
                completedAttempts.map((attempt) => (
                  <TableRow key={attempt.id} className="bg-gray-50">
                    <TableCell>{attempt.users?.email || 'N/A'}</TableCell>
                    <TableCell>{new Date(attempt.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-bold">{attempt.final_score?.toFixed(1) ?? 'N/A'}</TableCell>

                    {/* --- INICIO DE LA SECCIÓN MODIFICADA --- */}
                    <TableCell className="text-right space-x-2">
                      <Button asChild variant="secondary">
                        <Link href={`/dashboard/results?attemptId=${attempt.id}`} target="_blank">
                          Ver Resultados
                        </Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href={`/consultor/evaluaciones/${attempt.id}`}>
                          Ver Detalles
                        </Link>
                      </Button>
                    </TableCell>
                    {/* --- FIN DE LA SECCIÓN MODIFICADA --- */}

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