
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
    const { text, docId } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'No text provided' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert instructional designer based on the Anderson & Krathwohl taxonomy.
          Analyze the following educational content and identify the "Thematic Domains" (Categories).
          Your output must be a JSON array of objects with "name" and "description".
          Focus on high-level categories (5-15 domains) that cover the entire content.
          Example: [{"name": "Financial Risk Management", "description": "Covers interest rates..."}]`
        },
        {
          role: "user",
          content: text.substring(0, 50000) // Truncate to avoid token limits for now, ideally chunking
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const result = JSON.parse(completion.choices[0].message.content || '{"domains": []}');
    const domains = result.domains || result; 
    
    // Save to DB
    const insertedDomains = [];
    if (Array.isArray(domains)) {
        for (const d of domains) {
            const { data, error } = await supabase.from('domains').insert({
                name: d.name,
                description: d.description,
                source_doc_id: docId
            }).select().single();
            
            if (!error && data) insertedDomains.push(data);
        }
    }

    return new Response(JSON.stringify({ domains: insertedDomains }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
