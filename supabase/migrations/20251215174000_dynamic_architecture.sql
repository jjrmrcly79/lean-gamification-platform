-- Create Enums for Anderson & Krathwohl Taxonomy
CREATE TYPE knowledge_type AS ENUM ('factual', 'conceptual', 'procedural', 'metacognitive');
CREATE TYPE cognitive_level AS ENUM ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create');

-- Create Domains Table (Thematic Domains)
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT,
  source_doc_id TEXT
);

-- Enhance Master Questions Table
ALTER TABLE master_questions
ADD COLUMN domain_id UUID REFERENCES domains(id),
ADD COLUMN knowledge_type knowledge_type,
ADD COLUMN cognitive_level cognitive_level,
ADD COLUMN explanation TEXT;

-- Create Attempt Answers Table for Granular Tracking
CREATE TABLE IF NOT EXISTS attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  attempt_id UUID REFERENCES attempts(id) ON DELETE CASCADE,
  question_id TEXT REFERENCES master_questions(id),
  selected_option TEXT,
  is_correct BOOLEAN,
  duration_seconds INTEGER
);

-- Add indexes for performance
CREATE INDEX idx_master_questions_domain ON master_questions(domain_id);
CREATE INDEX idx_master_questions_matrix ON master_questions(knowledge_type, cognitive_level);
CREATE INDEX idx_attempt_answers_attempt ON attempt_answers(attempt_id);
