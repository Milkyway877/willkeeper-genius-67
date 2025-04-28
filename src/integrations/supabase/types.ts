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
      ai_interactions: {
        Row: {
          created_at: string | null
          id: string
          request_type: string | null
          response: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          request_type?: string | null
          response?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          request_type?: string | null
          response?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      death_verification_logs: {
        Row: {
          action: string
          details: Json | null
          id: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          id?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          id?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_notifications: {
        Row: {
          content: string
          error: string | null
          id: string
          message_id: string | null
          recipient_email: string
          sent_at: string | null
          status: string
          subject: string
          user_id: string | null
        }
        Insert: {
          content: string
          error?: string | null
          id?: string
          message_id?: string | null
          recipient_email: string
          sent_at?: string | null
          status?: string
          subject: string
          user_id?: string | null
        }
        Update: {
          content?: string
          error?: string | null
          id?: string
          message_id?: string | null
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_notifications_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "future_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      email_verification_codes: {
        Row: {
          code: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          type: string
          used: boolean | null
          user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          type: string
          used?: boolean | null
          user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          type?: string
          used?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_verifications: {
        Row: {
          code: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          is_used: boolean | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          is_used?: boolean | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          is_used?: boolean | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      future_messages: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          delivery_date: string | null
          delivery_event: string | null
          delivery_type: string | null
          id: string
          is_encrypted: boolean | null
          message_type: string | null
          message_url: string | null
          preview: string | null
          recipient_email: string | null
          recipient_name: string | null
          status: Database["public"]["Enums"]["future_message_status"] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          delivery_date?: string | null
          delivery_event?: string | null
          delivery_type?: string | null
          id?: string
          is_encrypted?: boolean | null
          message_type?: string | null
          message_url?: string | null
          preview?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          status?: Database["public"]["Enums"]["future_message_status"] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          delivery_date?: string | null
          delivery_event?: string | null
          delivery_type?: string | null
          id?: string
          is_encrypted?: boolean | null
          message_type?: string | null
          message_url?: string | null
          preview?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          status?: Database["public"]["Enums"]["future_message_status"] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      legacy_vault: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          document_url: string | null
          id: string
          is_encrypted: boolean | null
          preview: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          document_url?: string | null
          id?: string
          is_encrypted?: boolean | null
          preview?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          document_url?: string | null
          id?: string
          is_encrypted?: boolean | null
          preview?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      legacy_vault_ai_suggestions: {
        Row: {
          created_at: string | null
          id: string
          item_type: string
          prompt: string
          suggestion: string
          used: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_type: string
          prompt: string
          suggestion: string
          used?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_type?: string
          prompt?: string
          suggestion?: string
          used?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          description: string
          id: string
          read: boolean | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          read?: boolean | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          read?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_period: string | null
          created_at: string | null
          end_date: string | null
          id: string
          plan: string | null
          product_id: string | null
          start_date: string | null
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_period?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan?: string | null
          product_id?: string | null
          start_date?: string | null
          status: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_period?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan?: string | null
          product_id?: string | null
          start_date?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_type: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          notification_settings: Json | null
          privacy_settings: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notification_settings?: Json | null
          privacy_settings?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notification_settings?: Json | null
          privacy_settings?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          activation_complete: boolean | null
          avatar_url: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean | null
          phone_number: string | null
          updated_at: string | null
          verification_status: string | null
        }
        Insert: {
          activation_complete?: boolean | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Update: {
          activation_complete?: boolean | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      user_recovery_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          used: boolean | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          used?: boolean | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          used?: boolean | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_security: {
        Row: {
          created_at: string | null
          encryption_key: string | null
          google_auth_enabled: boolean | null
          google_auth_secret: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          encryption_key?: string | null
          google_auth_enabled?: boolean | null
          google_auth_secret?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          encryption_key?: string | null
          google_auth_enabled?: boolean | null
          google_auth_secret?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      will_ai_conversations: {
        Row: {
          conversation_data: Json
          created_at: string | null
          extracted_entities: Json | null
          id: string
          updated_at: string | null
          will_id: string
        }
        Insert: {
          conversation_data: Json
          created_at?: string | null
          extracted_entities?: Json | null
          id?: string
          updated_at?: string | null
          will_id: string
        }
        Update: {
          conversation_data?: Json
          created_at?: string | null
          extracted_entities?: Json | null
          id?: string
          updated_at?: string | null
          will_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "will_ai_conversations_will_id_fkey"
            columns: ["will_id"]
            isOneToOne: false
            referencedRelation: "wills"
            referencedColumns: ["id"]
          },
        ]
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
      will_contacts: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          role: string
          updated_at: string | null
          will_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          role: string
          updated_at?: string | null
          will_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
          will_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "will_contacts_will_id_fkey"
            columns: ["will_id"]
            isOneToOne: false
            referencedRelation: "wills"
            referencedColumns: ["id"]
          },
        ]
      }
      will_documents: {
        Row: {
          content_type: string | null
          created_at: string | null
          description: string | null
          document_type: string
          file_path: string
          file_size: number | null
          id: string
          name: string
          related_contact_id: string | null
          updated_at: string | null
          will_id: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          document_type: string
          file_path: string
          file_size?: number | null
          id?: string
          name: string
          related_contact_id?: string | null
          updated_at?: string | null
          will_id: string
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          document_type?: string
          file_path?: string
          file_size?: number | null
          id?: string
          name?: string
          related_contact_id?: string | null
          updated_at?: string | null
          will_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "will_documents_related_contact_id_fkey"
            columns: ["related_contact_id"]
            isOneToOne: false
            referencedRelation: "will_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "will_documents_will_id_fkey"
            columns: ["will_id"]
            isOneToOne: false
            referencedRelation: "wills"
            referencedColumns: ["id"]
          },
        ]
      }
      will_executors: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          status: string | null
          will_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          status?: string | null
          will_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          status?: string | null
          will_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "will_executors_will_id_fkey"
            columns: ["will_id"]
            isOneToOne: false
            referencedRelation: "wills"
            referencedColumns: ["id"]
          },
        ]
      }
      will_videos: {
        Row: {
          created_at: string | null
          duration: number | null
          file_path: string
          id: string
          thumbnail_path: string | null
          transcript: string | null
          updated_at: string | null
          will_id: string
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          file_path: string
          id?: string
          thumbnail_path?: string | null
          transcript?: string | null
          updated_at?: string | null
          will_id: string
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          file_path?: string
          id?: string
          thumbnail_path?: string | null
          transcript?: string | null
          updated_at?: string | null
          will_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "will_videos_will_id_fkey"
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
          content: string | null
          created_at: string | null
          document_url: string | null
          id: string
          status: string | null
          template_type: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          content?: string | null
          created_at?: string | null
          document_url?: string | null
          id?: string
          status?: string | null
          template_type?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          content?: string | null
          created_at?: string | null
          document_url?: string | null
          id?: string
          status?: string | null
          template_type?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_enum_values: {
        Args: { table_name: string; column_name: string }
        Returns: string[]
      }
    }
    Enums: {
      future_message_status:
        | "draft"
        | "scheduled"
        | "processing"
        | "delivered"
        | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      future_message_status: [
        "draft",
        "scheduled",
        "processing",
        "delivered",
        "failed",
      ],
    },
  },
} as const
