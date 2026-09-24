export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_modules: {
        Row: {
          advanced_qualification_enabled: boolean
          buying_enabled: boolean
          created_at: string
          selling_enabled: boolean
          supplier_invites_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          advanced_qualification_enabled?: boolean
          buying_enabled?: boolean
          created_at?: string
          selling_enabled?: boolean
          supplier_invites_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          advanced_qualification_enabled?: boolean
          buying_enabled?: boolean
          created_at?: string
          selling_enabled?: boolean
          supplier_invites_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          certifications: string[]
          city: string | null
          completed_projects: number
          created_at: string
          description: string
          district: string | null
          email: string | null
          employees: string | null
          entity_type: string | null
          experience_summary: string | null
          founded_year: number | null
          id: string
          name: string
          nuit: string | null
          owner_id: string
          phone: string | null
          province: string
          sector: string
          served_provinces: string[]
          services: string[]
          slug: string | null
          trade_name: string | null
          updated_at: string
          verification_notes: string | null
          verification_reviewed_at: string | null
          verification_reviewed_by: string | null
          verification_status: string
          verification_submitted_at: string | null
          verified: boolean
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          certifications?: string[]
          city?: string | null
          completed_projects?: number
          created_at?: string
          description: string
          district?: string | null
          email?: string | null
          employees?: string | null
          entity_type?: string | null
          experience_summary?: string | null
          founded_year?: number | null
          id?: string
          name: string
          nuit?: string | null
          owner_id: string
          phone?: string | null
          province: string
          sector: string
          served_provinces?: string[]
          services?: string[]
          slug?: string | null
          trade_name?: string | null
          updated_at?: string
          verification_notes?: string | null
          verification_reviewed_at?: string | null
          verification_reviewed_by?: string | null
          verification_status?: string
          verification_submitted_at?: string | null
          verified?: boolean
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          certifications?: string[]
          city?: string | null
          completed_projects?: number
          created_at?: string
          description?: string
          district?: string | null
          email?: string | null
          employees?: string | null
          entity_type?: string | null
          experience_summary?: string | null
          founded_year?: number | null
          id?: string
          name?: string
          nuit?: string | null
          owner_id?: string
          phone?: string | null
          province?: string
          sector?: string
          served_provinces?: string[]
          services?: string[]
          slug?: string | null
          trade_name?: string | null
          updated_at?: string
          verification_notes?: string | null
          verification_reviewed_at?: string | null
          verification_reviewed_by?: string | null
          verification_status?: string
          verification_submitted_at?: string | null
          verified?: boolean
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      company_verification_documents: {
        Row: {
          company_id: string
          document_type: string
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          storage_path: string
          submitted_at: string
        }
        Insert: {
          company_id: string
          document_type: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_path: string
          submitted_at?: string
        }
        Update: {
          company_id?: string
          document_type?: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_path?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_verification_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_verifications: {
        Row: {
          company_id: string
          created_at: string
          document_count: number
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          document_count?: number
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status: string
          submitted_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          document_count?: number
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_verifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          preferred_language: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_language?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string
          updated_at?: string
        }
        Relationships: []
      }
      proposal_invitations: {
        Row: {
          created_at: string
          id: string
          request_id: string
          status: string
          supplier_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          request_id: string
          status?: string
          supplier_id: string
        }
        Update: {
          created_at?: string
          id?: string
          request_id?: string
          status?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_invitations_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_invitations_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          amount: number | null
          created_at: string
          currency: string
          delivery_days: number | null
          id: string
          notes: string | null
          request_id: string
          status: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string
          delivery_days?: number | null
          id?: string
          notes?: string | null
          request_id: string
          status?: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string
          delivery_days?: number | null
          id?: string
          notes?: string | null
          request_id?: string
          status?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      request_document_access: {
        Row: {
          created_at: string
          document_id: string
          id: string
          monitor_flag: boolean
          monitor_note: string | null
          participant_id: string
          payment_proof_file_name: string | null
          payment_proof_path: string | null
          payment_submitted_at: string | null
          request_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          monitor_flag?: boolean
          monitor_note?: string | null
          participant_id: string
          payment_proof_file_name?: string | null
          payment_proof_path?: string | null
          payment_submitted_at?: string | null
          request_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          monitor_flag?: boolean
          monitor_note?: string | null
          participant_id?: string
          payment_proof_file_name?: string | null
          payment_proof_path?: string | null
          payment_submitted_at?: string | null
          request_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_document_access_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "request_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_document_access_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_documents: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          id: string
          is_public: boolean
          mime_type: string | null
          owner_id: string
          request_id: string
          storage_path: string
          version: number
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          id?: string
          is_public?: boolean
          mime_type?: string | null
          owner_id: string
          request_id: string
          storage_path: string
          version?: number
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          id?: string
          is_public?: boolean
          mime_type?: string | null
          owner_id?: string
          request_id?: string
          storage_path?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "request_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_interests: {
        Row: {
          created_at: string
          id: string
          request_id: string
          status: string
          supplier_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          request_id: string
          status?: string
          supplier_id: string
        }
        Update: {
          created_at?: string
          id?: string
          request_id?: string
          status?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_interests_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_interests_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      request_monitor_flags: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string | null
          request_id: string
          resolved_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_id?: string | null
          request_id: string
          resolved_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string | null
          request_id?: string
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_monitor_flags_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          budget: string | null
          created_at: string
          description: string
          document_access: string
          document_currency: string | null
          document_price: number | null
          id: string
          min_completed_projects: number | null
          min_years_in_market: number | null
          owner_id: string
          participation_mode: string
          payment_instructions: string | null
          province: string
          qualification_note: string | null
          require_verified: boolean
          required_certifications: string[]
          required_experience: string | null
          sector: string
          status: string
          tender_summary: string | null
          terms_content: string | null
          title: string
          updated_at: string
        }
        Insert: {
          budget?: string | null
          created_at?: string
          description: string
          document_access?: string
          document_currency?: string | null
          document_price?: number | null
          id?: string
          min_completed_projects?: number | null
          min_years_in_market?: number | null
          owner_id: string
          participation_mode?: string
          payment_instructions?: string | null
          province: string
          qualification_note?: string | null
          require_verified?: boolean
          required_certifications?: string[]
          required_experience?: string | null
          sector: string
          status?: string
          tender_summary?: string | null
          terms_content?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          budget?: string | null
          created_at?: string
          description?: string
          document_access?: string
          document_currency?: string | null
          document_price?: number | null
          id?: string
          min_completed_projects?: number | null
          min_years_in_market?: number | null
          owner_id?: string
          participation_mode?: string
          payment_instructions?: string | null
          province?: string
          qualification_note?: string | null
          require_verified?: boolean
          required_certifications?: string[]
          required_experience?: string | null
          sector?: string
          status?: string
          tender_summary?: string | null
          terms_content?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      company_qualifies_for_request: {
        Args: { p_company_id: string; p_request_id: string }
        Returns: boolean
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
