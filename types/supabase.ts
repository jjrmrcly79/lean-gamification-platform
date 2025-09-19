export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: s
ring]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attempts: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          final_score: number | null
          herramientas_score: number | null
          id: string
          involucramiento_score: number | null
          kaizen_score: number | null
          perfil_score: number | null
          questions_data: Json | null
          score_by_category: Json | null
          score_by_subcategory: Json | null
          sostenimiento_score: number | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          final_score?: number | null
          herramientas_score?: number | null
          id?: string
          involucramiento_score?: number | null
          kaizen_score?: number | null
          perfil_score?: number | null
          questions_data?: Json | null
          score_by_category?: Json | null
          score_by_subcategory?: Json | null
          sostenimiento_score?: number | null
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          final_score?: number | null
          herramientas_score?: number | null
          id?: string
          involucramiento_score?: number | null
          kaizen_score?: number | null
          perfil_score?: number | null
          questions_data?: Json | null
          score_by_category?: Json | null
          score_by_subcategory?: Json | null
          sostenimiento_score?: number | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jiribilla_catalog: {
        Row: {
          created_at: string
          description: string | null
          example: Json | null
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          example?: Json | null
          id: string
          name?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          example?: Json | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      master_questions: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          prompt: string | null
          question_data: Json | null
          subcategory: string | null
          type: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id: string
          prompt?: string | null
          question_data?: Json | null
          subcategory?: string | null
          type?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          prompt?: string | null
          question_data?: Json | null
          subcategory?: string | null
          type?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          email: string | null
          full_name: string | null
          id: string
          role: string | null
        }
        Insert: {
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
        }
        Update: {
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      temas_generados: {
        Row: {
          created_at: string
          documento_origen: string | null
          id: string
          temas: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          documento_origen?: string | null
          id?: string
          temas?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          documento_origen?: string | null
          id?: string
          temas?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "temas_generados_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}