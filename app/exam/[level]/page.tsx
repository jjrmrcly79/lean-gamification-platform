'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import Image from 'next/image';
import { Clock } from 'lucide-react'; // Icono para el cronómetro

// --- (Interfaces y calculateDetailedScores sin cambios) ---
interface QuestionOption {
    id: string;
    text: string;
}
interface Question {
    id:string;
    category:string;
    subcategory:string;
    question_data:{
        prompt:string;
        type:'single_select' | 'multi_select';
        options:QuestionOption[];
        answer_key:{
            correct_option_id:string | string[];
        };
    };
    generated_distractors:string[];
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
        if (!userAnswers[q.id]) return;
        const category = q.category;
        const subcategory = q.subcategory;
        const correctIds = Array.isArray(q.question_data.answer_key.correct_option_id) ? q.question_data.answer_key.correct_option_id : [q.question_data.answer_key.correct_option_id];
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

// --- CRONÓMETRO: Función para formatear el tiempo ---
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};


export default function ExamPage() {
    const router = useRouter();
    const supabase = getSupabaseBrowserClient();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [shuffledOptions, setShuffledOptions] = useState<QuestionOption[]>([]);
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
    const [userAnswers, setUserAnswers] = useState<{ [key: string]: string[] }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [examPhase, setExamPhase] = useState<'answering' | 'reviewing'>('answering');
    const [skippedQuestions, setSkippedQuestions] = useState<number[]>([]);
    const [currentSkippedIndex, setCurrentSkippedIndex] = useState(0);

    // --- CRONÓMETRO: Nuevos estados para el tiempo ---
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // --- CRONÓMETRO: useEffect para manejar el intervalo del tiempo ---
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isTimerRunning) {
            timer = setInterval(() => {
                setElapsedTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isTimerRunning]);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.push('/'); }
        };
        checkSession();
    }, [supabase, router]);

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
            // --- CRONÓMETRO: Iniciar el cronómetro cuando las preguntas cargan ---
            setIsTimerRunning(true);
        };
        fetchExam();
    }, [supabase]);

    useEffect(() => {
        if (questions.length === 0) return;
        let questionToShow;
        if (examPhase === 'answering') {
            questionToShow = questions[currentQuestionIndex];
        } else {
            const skippedQuestionRealIndex = skippedQuestions[currentSkippedIndex];
            questionToShow = questions[skippedQuestionRealIndex];
        }
        if (!questionToShow) return;
        const correctIds = Array.isArray(questionToShow.question_data.answer_key.correct_option_id) ? questionToShow.question_data.answer_key.correct_option_id : [questionToShow.question_data.answer_key.correct_option_id];
        const correctOptions = questionToShow.question_data.options.filter(opt => correctIds.includes(opt.id));
        const distractorOptions = questionToShow.generated_distractors.map((text, index) => ({
            id: `distractor-${questionToShow.id}-${index}`,
            text: text,
        }));
        const allOptions = [...correctOptions, ...distractorOptions];
        allOptions.sort(() => Math.random() - 0.5);
        setShuffledOptions(allOptions);
        setSelectedAnswers([]);
    }, [currentQuestionIndex, questions, examPhase, currentSkippedIndex, skippedQuestions]);

    const handleMultiSelectChange = (checked: boolean, optionId: string) => {
        setSelectedAnswers(prev => {
            if (checked) { return [...prev, optionId]; } 
            else { return prev.filter(id => id !== optionId); }
        });
    };

    // --- CRONÓMETRO: Modificada para aceptar y guardar el tiempo ---
    const finishExam = async (finalAnswers: { [key: string]: string[] }, duration: number) => {
        setIsTimerRunning(false); // Detener el cronómetro
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Necesitas iniciar sesión para guardar tus resultados.");
            return;
        }
        const finalScores = calculateDetailedScores(questions, finalAnswers);
        const { data, error } = await supabase
            .from('attempts')
            .insert({
                score_by_category: finalScores.categories,
                score_by_subcategory: finalScores.subcategories,
                status: 'pending_review',
                duration_seconds: duration // Guardar el tiempo
            })
            .select('id')
            .single();
        if (error) {
            alert("Hubo un error al guardar tus resultados. Por favor, intenta de nuevo.");
            console.error("Error saving attempt:", error);
        } else {
            router.push('/examen-terminado');
        }
    };

    const handleNextQuestion = async () => {
        let currentId;
        if (examPhase === 'answering') {
            currentId = questions[currentQuestionIndex].id;
            const currentAnswer = { [currentId]: selectedAnswers };
            setUserAnswers(prev => ({ ...prev, ...currentAnswer }));
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                if (skippedQuestions.length > 0) {
                    setExamPhase('reviewing');
                } else {
                    await finishExam({ ...userAnswers, ...currentAnswer }, elapsedTime);
                }
            }
        } else {
            const skippedQuestionRealIndex = skippedQuestions[currentSkippedIndex];
            currentId = questions[skippedQuestionRealIndex].id;
            const currentAnswer = { [currentId]: selectedAnswers };
            setUserAnswers(prev => ({ ...prev, ...currentAnswer }));
            if (currentSkippedIndex < skippedQuestions.length - 1) {
                setCurrentSkippedIndex(prev => prev + 1);
            } else {
                await finishExam({ ...userAnswers, ...currentAnswer }, elapsedTime);
            }
        }
    };

    const handleSkipQuestion = async () => {
        if (examPhase !== 'answering') return;
        if (!skippedQuestions.includes(currentQuestionIndex)) {
            setSkippedQuestions(prev => [...prev, currentQuestionIndex]);
        }
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            if (skippedQuestions.length > 0 || !skippedQuestions.includes(currentQuestionIndex)) {
                setExamPhase('reviewing');
            } else {
                await finishExam(userAnswers, elapsedTime);
            }
        }
    };

    if (isLoading) return <div className="flex items-center justify-center h-screen text-lg font-medium text-[#1A237E]">Cargando diagnóstico...</div>;
    if (error) return <div className="flex items-center justify-center h-screen text-lg font-medium text-red-600">{error}</div>;
    if (questions.length === 0) return <div className="flex items-center justify-center h-screen text-lg font-medium text-[#1A237E]">No hay preguntas disponibles.</div>;

    const isReviewing = examPhase === 'reviewing';
    const questionIndexForDisplay = isReviewing ? skippedQuestions[currentSkippedIndex] : currentQuestionIndex;
    const currentQuestion = questions[questionIndexForDisplay];
    let progressValue;
    let progressText;
    if (isReviewing) {
        const answeredInReview = currentSkippedIndex + 1;
        progressValue = (answeredInReview / skippedQuestions.length) * 100;
        progressText = `Revisando ${answeredInReview} de ${skippedQuestions.length}`;
    } else {
        progressValue = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressText = `Pregunta ${currentQuestionIndex + 1} de ${questions.length}`;
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-white p-6 md:p-10">
            <header className="w-full max-w-3xl flex items-center justify-between mb-8">
                <div> <Image src="/logo.png" alt="Logo LeanCert" width={160} height={45} priority /> </div>
                <h1 className="text-3xl font-bold text-[#1A237E]">Diagnóstico Lean</h1>
            </header>
            <Card className="w-full max-w-3xl border-gray-200 shadow-lg">
                <CardHeader className="bg-[#1A237E] text-white p-6 rounded-t-lg">
                    <div className="flex justify-between items-center mb-4">
                        <Progress value={progressValue} className="w-3/4 h-2 bg-white/30 [&>*]:bg-white" />
                        {/* --- CRONÓMETRO: Mostrar el tiempo --- */}
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <Clock className="h-5 w-5" />
                            {formatTime(elapsedTime)}
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">{isReviewing ? 'Revisando Preguntas Pendientes' : progressText}</CardTitle>
                    <div className="flex justify-between items-center">
                      <CardDescription className="text-white text-opacity-80">Categoría: {currentQuestion.category} / {currentQuestion.subcategory}</CardDescription>
                      {/* --- CONTADOR BRINCADAS: Mostrar el conteo --- */}
                      {skippedQuestions.length > 0 && (
                        <div className="text-sm font-semibold bg-yellow-400 text-black px-3 py-1 rounded-full">
                          Brincadas: {skippedQuestions.length}
                        </div>
                      )}
                    </div>
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
                <CardFooter className="flex justify-between items-center p-6 border-t border-gray-100">
                    {examPhase === 'answering' && (
                        <Button onClick={handleSkipQuestion} variant="ghost" className="px-6 py-3 text-lg font-semibold text-gray-600 hover:bg-gray-100"> Saltar </Button>
                    )}
                    <Button onClick={handleNextQuestion} disabled={selectedAnswers.length === 0} className="px-8 py-3 text-lg font-semibold bg-[#1A237E] hover:bg-[#2C388D] text-white rounded-md transition-colors duration-200 ml-auto">
                        {currentQuestionIndex < questions.length - 1 && examPhase === 'answering' ? 'Siguiente' : 'Finalizar Diagnóstico'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}