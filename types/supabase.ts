export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
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
          questions_data: JSON | null
          score_by_category: JSON | null
          score_by_subcategory: JSON | null
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
          questions_data?: JSON | null
          score_by_category?: JSON | null
          score_by_subcategory?: JSON | null
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
          questions_data?: JSON | null
          score_by_category?: JSON | null
          score_by_subcategory?: JSON | null
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
      doc_ai_jobs: {
        Row: {
          created_at: string
          id: number
          operation_name: string
          result_topics: JSON | null
          source_document_name: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          operation_name: string
          result_topics?: JSON | null
          source_document_name?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          operation_name?: string
          result_topics?: JSON | null
          source_document_name?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      jiribilla_catalog: {
        Row: {
          created_at: string
          description: string | null
          example: JSON | null
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          example?: JSON | null
          id: string
          name?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          example?: JSON | null
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
          question_data: JSON | null
          subcategory: string | null
          type: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id: string
          prompt?: string | null
          question_data?: JSON | null
          subcategory?: string | null
          type?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          prompt?: string | null
          question_data?: JSON | null
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
          temas: JSON | null
          user_id: string
        }
        Insert: {
          created_at?: string
          documento_origen?: string | null
          id?: string
          temas?: JSON | null
          user_id?: string
        }
        Update: {
          created_at?: string
          documento_origen?: string | null
          id?: string
          temas?: JSON | null
          user_id?: string
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
      interesados_prounity: {
  Row: {
    id: string;
    nombre: string | null;
    empresa: string | null;
    cargo: string | null;
    telefono: string | null;
    email: string | null;
    mensaje: string | null;
    created_at: string | null;
  };
  Insert: {
    nombre?: string | null;
    empresa?: string | null;
    cargo?: string | null;
    telefono?: string | null;
    email?: string | null;
    mensaje?: string | null;
  };
  Update: {
    nombre?: string | null;
    empresa?: string | null;
    cargo?: string | null;
    telefono?: string | null;
    email?: string | null;
    mensaje?: string | null;
  };
};

      user_roles: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
