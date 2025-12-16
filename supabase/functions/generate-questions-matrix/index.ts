
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY'),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
    }

    try {
        const { domain_id, domain_name, context_text } = await req.json();

        if (!domain_id || !domain_name) {
            return new Response(JSON.stringify({ error: 'Domain ID and Name required' }), { status: 400 });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert exam creator using Anderson & Krathwohl's taxonomy.
          For the domain: "${domain_name}", generate specific questions based on the provided text context.
          
          You must generate questions covering the following Cognitive Levels: Remember, Understand, Apply, Analyze, Evaluate, Create.
          And Knowledge Types: Factual, Conceptual, Procedural, Metacognitive.
          
          Generate a JSON object containing an array "questions".
          Each question object must have:
          - question_text
          - options (array of strings, or null if open ended)
          - correct_answer (string)
          - knowledge_type (factual, conceptual, procedural, metacognitive)
          - cognitive_level (remember, understand, apply, analyze, evaluate, create)
          - explanation (why is this the correct answer)
          
          Try to fill different cells of the matrix.`
                },
                {
                    role: "user",
                    content: `Context: ${context_text ? context_text.substring(0, 10000) : "No specific context provided, rely on general knowledge of the domain."}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content || '{"questions": []}');
        const questions = result.questions || [];

        const savedQuestions = [];
        for (const q of questions) {
            const { data, error } = await supabase.from('master_questions').insert({
                domain_id: domain_id,
                knowledge_type: q.knowledge_type.toLowerCase(),
                cognitive_level: q.cognitive_level.toLowerCase(),
                prompt: q.question_text, // Prompt column maps to question_text
                question_data: { options: q.options, correct_answer: q.correct_answer },
                explanation: q.explanation,
                type: q.options ? 'multiple_choice' : 'open',
                category: domain_name
            }).select().single();
            if (!error && data) savedQuestions.push(data);
        }

        return new Response(JSON.stringify({ questions: savedQuestions }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }
});
