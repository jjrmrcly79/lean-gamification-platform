'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import Image from 'next/image';

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  category: string;
  subcategory: string;
  question_data: {
    prompt: string;
    type: 'single_select' | 'multi_select';
    options: QuestionOption[];
    answer_key: {
      correct_option_id: string | string[];
    };
  };
  generated_distractors: string[];
}

const calculateDetailedScores = (
  questions: Question[],
  userAnswers: Record<string, string[]>
) => {
  const results = {
    categories: {} as Record<string, { correct: number; total: number; score?: number }>,
    subcategories: {} as Record<string, { correct: number; total: number; score?: number }>
  };

  questions.forEach((q: Question) => {
    const category = q.category;
    const subcategory = q.subcategory;
    const correctIds = Array.isArray(q.question_data.answer_key.correct_option_id)
      ? q.question_data.answer_key.correct_option_id
      : [q.question_data.answer_key.correct_option_id];
    
    const userAns = userAnswers[q.id] || [];

    if (!results.categories[category]) results.categories[category] = { correct: 0, total: 0 };
    if (!results.subcategories[subcategory]) results.subcategories[subcategory] = { correct: 0, total: 0 };

    results.categories[category].total++;
    results.subcategories[subcategory].total++;

    const isCorrect = correctIds.length === userAns.length && correctIds.every(id => userAns.includes(id));

    if (isCorrect) {
      results.categories[category].correct++;
      results.subcategories[subcategory].correct++;
    }
  });

  for (const cat in results.categories) {
    const { correct, total } = results.categories[cat];
    results.categories[cat].score = total > 0 ? (correct / total) * 100 : 0;
  }
  for (const subcat in results.subcategories) {
    const { correct, total } = results.subcategories[subcat];
    results.subcategories[subcat].score = total > 0 ? (correct / total) * 100 : 0;
  }

  return results;
};

export default function ExamPage() {
  const router = useRouter();
  const supabase = createClient();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<QuestionOption[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- AÑADE ESTE BLOQUE DE CÓDIGO ---
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Si no hay sesión, redirige al usuario a la página de inicio/login
        router.push('/');
      }
    };
    checkSession();
  }, [supabase, router]);
  // ------------------------------------

  useEffect(() => {
    const fetchExam = async () => {
      setIsLoading(true);
      setError(null);
      const { data, error: invokeError } = await supabase.functions.invoke('jiribilla-engine', { body: {} });
      if (invokeError) {
        setError('Error al cargar el examen: ' + invokeError.message);
        setIsLoading(false);
        return;
      }
      if (!data || data.length === 0) {
        setError("No se recibieron preguntas.");
        setIsLoading(false);
        return;
      }
      data.sort(() => Math.random() - 0.5); 
      setQuestions(data);
      setIsLoading(false);
    };
    fetchExam();
  }, [supabase]);

  useEffect(() => {
    if (questions.length === 0) return;
    const currentQuestion = questions[currentQuestionIndex];
    const correctIds = Array.isArray(currentQuestion.question_data.answer_key.correct_option_id)
      ? currentQuestion.question_data.answer_key.correct_option_id
      : [currentQuestion.question_data.answer_key.correct_option_id];
    const correctOptions = currentQuestion.question_data.options.filter(opt => correctIds.includes(opt.id));
    const distractorOptions = currentQuestion.generated_distractors.map((text, index) => ({
      id: `distractor-${currentQuestion.id}-${index}`,
      text: text,
    }));
    const allOptions = [...correctOptions, ...distractorOptions];
    allOptions.sort(() => Math.random() - 0.5);
    setShuffledOptions(allOptions);
    setSelectedAnswers([]);
  }, [currentQuestionIndex, questions]);
  
  const handleMultiSelectChange = (checked: boolean, optionId: string) => {
    setSelectedAnswers(prev => {
      if (checked) {
        return [...prev, optionId];
      } else {
        return prev.filter(id => id !== optionId);
      }
    });
  };
  
  const handleNextQuestion = async () => {
    const currentAnswer = { [questions[currentQuestionIndex].id]: selectedAnswers };

    if (currentQuestionIndex < questions.length - 1) {
      setUserAnswers(prev => ({ ...prev, ...currentAnswer }));
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Necesitas iniciar sesión para guardar tus resultados.");
        return; 
      }
      
      const finalUserAnswers = { ...userAnswers, ...currentAnswer };
      const finalScores = calculateDetailedScores(questions, finalUserAnswers);

      const { data, error } = await supabase
        .from('attempts')
        .insert({
          user_id: user.id,
          score_by_category: finalScores.categories,
          score_by_subcategory: finalScores.subcategories,
          status: 'pending_review'
        })
        .select('id')
        .single();

      if (error) {
        alert("Hubo un error al guardar tus resultados. Por favor, intenta de nuevo.");
        console.error("Error saving attempt:", error);
      } else {
        router.push('/examen-terminado');
      }
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen text-lg font-medium text-[#1A237E]">Cargando diagnóstico...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-lg font-medium text-red-600">{error}</div>;
  if (questions.length === 0) return <div className="flex items-center justify-center h-screen text-lg font-medium text-[#1A237E]">No hay preguntas disponibles.</div>;

  const currentQuestion = questions[currentQuestionIndex];
  const progressValue = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col items-center min-h-screen bg-white p-6 md:p-10">
      <header className="w-full max-w-3xl flex items-center justify-between mb-8">
        <div>
          <Image src="/logo.png" alt="Logo LeanCert" width={160} height={45} priority />
        </div>
        <h1 className="text-3xl font-bold text-[#1A237E]">Diagnóstico Lean</h1>
      </header>
      <Card className="w-full max-w-3xl border-gray-200 shadow-lg">
        <CardHeader className="bg-[#1A237E] text-white p-6 rounded-t-lg">
          <Progress value={progressValue} className="mb-4 h-2 bg-white/30 [&>*]:bg-white" />
          <CardTitle className="text-2xl font-bold">Pregunta {currentQuestionIndex + 1} de {questions.length}</CardTitle>
          <CardDescription className="text-white text-opacity-80">Categoría: {currentQuestion.category} / {currentQuestion.subcategory}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-xl font-semibold mb-8 text-[#1A237E] leading-relaxed">{currentQuestion.question_data.prompt}</p>
          {currentQuestion.question_data.type === 'multi_select' ? (
            <div className="flex flex-col gap-5">
              {shuffledOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <Checkbox id={option.id} onCheckedChange={(checked) => handleMultiSelectChange(!!checked, option.id)} checked={selectedAnswers.includes(option.id)} className="h-5 w-5 border-gray-400 data-[state=checked]:bg-[#DC2626] data-[state=checked]:text-white" />
                  <Label htmlFor={option.id} className="font-normal text-lg text-[#333333] cursor-pointer flex-1">{option.text}</Label>
                </div>
              ))}
            </div>
          ) : (
            <RadioGroup className="flex flex-col gap-5" value={selectedAnswers[0] || ''} onValueChange={(value) => setSelectedAnswers([value])}>
              {shuffledOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <RadioGroupItem value={option.id} id={option.id} className="h-5 w-5 border-gray-400 text-[#DC2626] focus:ring-[#DC2626] focus:ring-offset-2" />
                  <Label htmlFor={option.id} className="font-normal text-lg text-[#333333] cursor-pointer flex-1">{option.text}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </CardContent>
        <CardFooter className="flex justify-end p-6 border-t border-gray-100">
          <Button onClick={handleNextQuestion} disabled={selectedAnswers.length === 0} className="px-8 py-3 text-lg font-semibold bg-[#1A237E] hover:bg-[#2C388D] text-white rounded-md transition-colors duration-200">
            {currentQuestionIndex < questions.length - 1 ? 'Siguiente' : 'Finalizar Diagnóstico'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}