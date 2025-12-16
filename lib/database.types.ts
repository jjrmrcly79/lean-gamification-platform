export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            attempt_answers: {
                Row: {
                    attempt_id: string | null
                    created_at: string | null
                    duration_seconds: number | null
                    id: string
                    is_correct: boolean | null
                    question_id: string | null
                    selected_option: string | null
                }
                Insert: {
                    attempt_id?: string | null
                    created_at?: string | null
                    duration_seconds?: number | null
                    id?: string
                    is_correct?: boolean | null
                    question_id?: string | null
                    selected_option?: string | null
                }
                Update: {
                    attempt_id?: string | null
                    created_at?: string | null
                    duration_seconds?: number | null
                    id?: string
                    is_correct?: boolean | null
                    question_id?: string | null
                    selected_option?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "attempt_answers_attempt_id_fkey"
                        columns: ["attempt_id"]
                        isOneToOne: false
                        referencedRelation: "attempts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "attempt_answers_question_id_fkey"
                        columns: ["question_id"]
                        isOneToOne: false
                        referencedRelation: "master_questions"
                        referencedColumns: ["id"]
                    },
                ]
            }
            attempts: {
                Row: {
                    created_at: string | null
                    duration_seconds: number | null
                    final_score: number | null
                    herramientas_score: number | null
                    id: string
                    introduccion_score: number | null
                    kanban_score: number | null
                    user_id: string | null
                    perfil_score: number | null
                    kaizen_score: number | null
                    involucramiento_score: number | null
                    sostenimiento_score: number | null
                    status: string | null
                    score_by_category: Json | null
                    score_by_subcategory: Json | null
                    questions_data: Json | null
                }
                Insert: {
                    created_at?: string | null
                    duration_seconds?: number | null
                    final_score?: number | null
                    herramientas_score?: number | null
                    id?: string
                    introduccion_score?: number | null
                    kanban_score?: number | null
                    user_id?: string | null
                    perfil_score?: number | null
                    kaizen_score?: number | null
                    involucramiento_score?: number | null
                    sostenimiento_score?: number | null
                    status?: string | null
                    score_by_category?: Json | null
                    score_by_subcategory?: Json | null
                    questions_data?: Json | null
                }
                Update: {
                    created_at?: string | null
                    duration_seconds?: number | null
                    final_score?: number | null
                    herramientas_score?: number | null
                    id?: string
                    introduccion_score?: number | null
                    kanban_score?: number | null
                    user_id?: string | null
                    perfil_score?: number | null
                    kaizen_score?: number | null
                    involucramiento_score?: number | null
                    sostenimiento_score?: number | null
                    status?: string | null
                    score_by_category?: Json | null
                    score_by_subcategory?: Json | null
                    questions_data?: Json | null
                }
                Relationships: [
                    {
                        foreignKeyName: "attempts_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            columns: {
                Row: {
                    created_at: string
                    id: string
                    order: number
                    title: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    order: number
                    title: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    order?: number
                    title?: string
                }
                Relationships: []
            }
            domains: {
                Row: {
                    created_at: string | null
                    description: string | null
                    id: string
                    name: string
                    source_doc_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    name: string
                    source_doc_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    name?: string
                    source_doc_id?: string | null
                }
                Relationships: []
            }
            consultor_files: {
                Row: {
                    analysis_results: Json | null
                    created_at: string | null
                    file_url: string
                    filename: string
                    id: string
                    processed: boolean | null
                    user_id: string | null
                }
                Insert: {
                    analysis_results?: Json | null
                    created_at?: string | null
                    file_url: string
                    filename: string
                    id?: string
                    processed?: boolean | null
                    user_id?: string | null
                }
                Update: {
                    analysis_results?: Json | null
                    created_at?: string | null
                    file_url?: string
                    filename?: string
                    id?: string
                    processed?: boolean | null
                    user_id?: string | null
                }
                Relationships: []
            }
            master_questions: {
                Row: {
                    cognitive_level: Database["public"]["Enums"]["cognitive_level"] | null
                    correct_option: string
                    created_at: string | null
                    domain: string | null
                    explanation: string | null
                    id: string
                    knowledge_type: Database["public"]["Enums"]["knowledge_type"] | null
                    options: Json
                    question: string
                    topic: string | null
                }
                Insert: {
                    cognitive_level?: Database["public"]["Enums"]["cognitive_level"] | null
                    correct_option: string
                    created_at?: string | null
                    domain?: string | null
                    explanation?: string | null
                    id?: string
                    knowledge_type?: Database["public"]["Enums"]["knowledge_type"] | null
                    options: Json
                    question: string
                    topic?: string | null
                }
                Update: {
                    cognitive_level?: Database["public"]["Enums"]["cognitive_level"] | null
                    correct_option?: string
                    created_at?: string | null
                    domain?: string | null
                    explanation?: string | null
                    id?: string
                    knowledge_type?: Database["public"]["Enums"]["knowledge_type"] | null
                    options?: Json
                    question?: string
                    topic?: string | null
                }
                Relationships: []
            }
            posts: {
                Row: {
                    approved: boolean | null
                    caption: string | null
                    created_at: string
                    date: string
                    id: string
                    imageUrl: string | null
                    platform: string
                    status: string | null
                    title: string
                    type: string
                }
                Insert: {
                    approved?: boolean | null
                    caption?: string | null
                    created_at?: string
                    date: string
                    id?: string
                    imageUrl?: string | null
                    platform: string
                    status?: string | null
                    title: string
                    type: string
                }
                Update: {
                    approved?: boolean | null
                    caption?: string | null
                    created_at?: string
                    date?: string
                    id?: string
                    imageUrl?: string | null
                    platform?: string
                    status?: string | null
                    title?: string
                    type?: string
                }
                Relationships: []
            }
            tasks: {
                Row: {
                    assignee: string | null
                    color: string | null
                    column_id: string
                    created_at: string
                    description: string | null
                    due_date: string | null
                    id: string
                    order: number
                    priority: string | null
                    tags: string[] | null
                    title: string
                }
                Insert: {
                    assignee?: string | null
                    color?: string | null
                    column_id: string
                    created_at?: string
                    description?: string | null
                    due_date?: string | null
                    id?: string
                    order: number
                    priority?: string | null
                    tags?: string[] | null
                    title: string
                }
                Update: {
                    assignee?: string | null
                    color?: string | null
                    column_id?: string
                    created_at?: string
                    description?: string | null
                    due_date?: string | null
                    id?: string
                    order?: number
                    priority?: string | null
                    tags?: string[] | null
                    title?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "tasks_column_id_fkey"
                        columns: ["column_id"]
                        isOneToOne: false
                        referencedRelation: "columns"
                        referencedColumns: ["id"]
                    },
                ]
            }
            user_feedback: {
                Row: {
                    created_at: string | null
                    details: string | null
                    feedback_type: string
                    id: string
                    user_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    details?: string | null
                    feedback_type: string
                    id?: string
                    user_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    details?: string | null
                    feedback_type?: string
                    id?: string
                    user_id?: string | null
                }
                Relationships: []
            }
            user_progress: {
                Row: {
                    completed_at: string | null
                    id: string
                    is_completed: boolean | null
                    last_accessed: string | null
                    module_id: string
                    started_at: string | null
                    user_id: string
                }
                Insert: {
                    completed_at?: string | null
                    id?: string
                    is_completed?: boolean | null
                    last_accessed?: string | null
                    module_id: string
                    started_at?: string | null
                    user_id: string
                }
                Update: {
                    completed_at?: string | null
                    id?: string
                    is_completed?: boolean | null
                    last_accessed?: string | null
                    module_id?: string
                    started_at?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            users: {
                Row: {
                    created_at: string
                    email: string
                    id: string
                    name: string | null
                    onboarding_completed: boolean | null
                    role: string | null
                }
                Insert: {
                    created_at?: string
                    email: string
                    id?: string
                    name?: string | null
                    onboarding_completed?: boolean | null
                    role?: string | null
                }
                Update: {
                    created_at?: string
                    email?: string
                    id?: string
                    name?: string | null
                    onboarding_completed?: boolean | null
                    role?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            cognitive_level:
            | "remember"
            | "understand"
            | "apply"
            | "analyze"
            | "evaluate"
            | "create"
            knowledge_type:
            | "factual"
            | "conceptual"
            | "procedural"
            | "metacognitive"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never