'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

// Definimos cómo se verá un objeto de pregunta
interface Question {
  prompt: string;
  options: { id: string; text: string }[];
  generated_distractors?: string[];
}

// Definimos cómo se verá un objeto de opción unificada
interface ShuffledOption {
  id: string;
  text: string;
}

export default function ExamPage() {
  const params = useParams();
  const level = params.level;
  const supabase = createClient();

  const [question, setQuestion] = useState<Question | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<ShuffledOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: invokeError } = await supabase.functions.invoke('jiribilla-engine', {
        body: { master_question_id: '162' }, // Asegúrate de que este ID existe
      });

      if (invokeError) {
        setError('Error al invocar la función: ' + invokeError.message);
        setIsLoading(false);
        return;
      }

      if (!data) {
        setError("La función no devolvió datos. Revisa los logs de la función en Supabase.");
        setIsLoading(false);
        return;
      }

      setQuestion(data);

      // --- LÓGICA CORREGIDA PARA COMBINAR OPCIONES ---
      let allOptions: ShuffledOption[] = [];

      // 1. Añade la respuesta correcta (si existe)
      if (data.options && data.options.length > 0) {
        allOptions.push(data.options[0]);
      }

      // 2. Añade los distractores generados por la IA
      if (data.generated_distractors && data.generated_distractors.length > 0) {
        const distractors = data.generated_distractors.map((text: string, index: number) => ({
          id: `distractor-${index}`,
          text: text,
        }));
        allOptions = [...allOptions, ...distractors];
      }

      // 3. Barajamos la lista final
      allOptions.sort(() => Math.random() - 0.5);
      setShuffledOptions(allOptions);
      setIsLoading(false);
    };

    fetchQuestion();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Cargando examen...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4">
      {question && (
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Progress value={2.5} className="mb-4" /> {/* 1 de 40 preguntas es 2.5% */}
            <CardTitle>Pregunta 1 de 40</CardTitle>
            <CardDescription>Nivel: {level}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold mb-6">{question.prompt}</p>

            <RadioGroup onValueChange={setSelectedAnswer} className="gap-4">
              {shuffledOptions.map((option) => (
                <div key={option.id}>
                  <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
                  <Label 
                    htmlFor={option.id} 
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>

          </CardContent>
          <CardFooter className="flex justify-end">
            <Button disabled={!selectedAnswer}>
              Siguiente
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}