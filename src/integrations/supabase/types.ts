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
      activity_logs: {
        Row: {
          action: string
          id: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_interactions: {
        Row: {
          created_at: string | null
          id: string
          request_type: string
          response: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          request_type: string
          response: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          request_type?: string
          response?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      future_messages: {
        Row: {
          created_at: string | null
          delivery_date: string
          id: string
          message_type: string | null
          message_url: string | null
          recipient_email: string
          recipient_name: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_date: string
          id?: string
          message_type?: string | null
          message_url?: string | null
          recipient_email: string
          recipient_name: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_date?: string
          id?: string
          message_type?: string | null
          message_url?: string | null
          recipient_email?: string
          recipient_name?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "future_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_vault: {
        Row: {
          category: string | null
          created_at: string | null
          document_url: string
          id: string
          title: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          document_url: string
          id?: string
          title: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          document_url?: string
          id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legacy_vault_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          plan: string | null
          start_date: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan?: string | null
          start_date?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan?: string | null
          start_date?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_identity_verification: {
        Row: {
          created_at: string | null
          document_type: string | null
          document_url: string
          id: string
          selfie_url: string
          user_id: string | null
          verification_status: string | null
        }
        Insert: {
          created_at?: string | null
          document_type?: string | null
          document_url: string
          id?: string
          selfie_url: string
          user_id?: string | null
          verification_status?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string | null
          document_url?: string
          id?: string
          selfie_url?: string
          user_id?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_identity_verification_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_security: {
        Row: {
          encryption_key: string
          google_auth_enabled: boolean | null
          google_auth_secret: string | null
          last_login: string | null
          user_id: string
        }
        Insert: {
          encryption_key: string
          google_auth_enabled?: boolean | null
          google_auth_secret?: string | null
          last_login?: string | null
          user_id: string
        }
        Update: {
          encryption_key?: string
          google_auth_enabled?: boolean | null
          google_auth_secret?: string | null
          last_login?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_security_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          passkey: string
          profile_picture: string | null
          recovery_phrase: string
          surname: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          passkey: string
          profile_picture?: string | null
          recovery_phrase: string
          surname: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          passkey?: string
          profile_picture?: string | null
          recovery_phrase?: string
          surname?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      will_beneficiaries: {
        Row: {
          beneficiary_name: string
          created_at: string | null
          id: string
          percentage: number | null
          relationship: string
          will_id: string | null
        }
        Insert: {
          beneficiary_name: string
          created_at?: string | null
          id?: string
          percentage?: number | null
          relationship: string
          will_id?: string | null
        }
        Update: {
          beneficiary_name?: string
          created_at?: string | null
          id?: string
          percentage?: number | null
          relationship?: string
          will_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "will_beneficiaries_will_id_fkey"
            columns: ["will_id"]
            isOneToOne: false
            referencedRelation: "wills"
            referencedColumns: ["id"]
          },
        ]
      }
      will_signatures: {
        Row: {
          id: string
          signed_at: string | null
          signer_name: string
          signer_role: string | null
          will_id: string | null
        }
        Insert: {
          id?: string
          signed_at?: string | null
          signer_name: string
          signer_role?: string | null
          will_id?: string | null
        }
        Update: {
          id?: string
          signed_at?: string | null
          signer_name?: string
          signer_role?: string | null
          will_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "will_signatures_will_id_fkey"
            columns: ["will_id"]
            isOneToOne: false
            referencedRelation: "wills"
            referencedColumns: ["id"]
          },
        ]
      }
      wills: {
        Row: {
          ai_generated: boolean | null
          created_at: string | null
          document_url: string
          id: string
          status: string | null
          template_type: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          created_at?: string | null
          document_url: string
          id?: string
          status?: string | null
          template_type?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          created_at?: string | null
          document_url?: string
          id?: string
          status?: string | null
          template_type?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
