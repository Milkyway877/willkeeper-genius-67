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
      contact_verifications: {
        Row: {
          contact_id: string
          contact_type: string
          created_at: string | null
          expires_at: string
          id: string
          responded_at: string | null
          response: string | null
          updated_at: string | null
          user_id: string
          verification_token: string
        }
        Insert: {
          contact_id: string
          contact_type: string
          created_at?: string | null
          expires_at: string
          id?: string
          responded_at?: string | null
          response?: string | null
          updated_at?: string | null
          user_id: string
          verification_token: string
        }
        Update: {
          contact_id?: string
          contact_type?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          responded_at?: string | null
          response?: string | null
          updated_at?: string | null
          user_id?: string
          verification_token?: string
        }
        Relationships: []
      }
      death_verification_checkins: {
        Row: {
          checked_in_at: string
          created_at: string | null
          id: string
          next_check_in: string
          notes: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          checked_in_at?: string
          created_at?: string | null
          id?: string
          next_check_in: string
          notes?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          checked_in_at?: string
          created_at?: string | null
          id?: string
          next_check_in?: string
          notes?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      death_verification_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      death_verification_pins: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          pin_hash: string
          recovery_code: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          pin_hash: string
          recovery_code?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          pin_hash?: string
          recovery_code?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      death_verification_requests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          initiated_at: string
          status: string
          updated_at: string | null
          user_id: string
          verification_details: Json | null
          verification_result: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          initiated_at?: string
          status?: string
          updated_at?: string | null
          user_id: string
          verification_details?: Json | null
          verification_result?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          initiated_at?: string
          status?: string
          updated_at?: string | null
          user_id?: string
          verification_details?: Json | null
          verification_result?: string | null
        }
        Relationships: []
      }
      death_verification_settings: {
        Row: {
          beneficiary_verification_interval: number | null
          check_in_enabled: boolean | null
          check_in_frequency: number | null
          created_at: string | null
          executor_override_enabled: boolean | null
          failsafe_enabled: boolean | null
          grace_period: number | null
          id: string
          notification_preferences: Json | null
          pin_system_enabled: boolean | null
          reminder_frequency: number | null
          trusted_contact_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          beneficiary_verification_interval?: number | null
          check_in_enabled?: boolean | null
          check_in_frequency?: number | null
          created_at?: string | null
          executor_override_enabled?: boolean | null
          failsafe_enabled?: boolean | null
          grace_period?: number | null
          id?: string
          notification_preferences?: Json | null
          pin_system_enabled?: boolean | null
          reminder_frequency?: number | null
          trusted_contact_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          beneficiary_verification_interval?: number | null
          check_in_enabled?: boolean | null
          check_in_frequency?: number | null
          created_at?: string | null
          executor_override_enabled?: boolean | null
          failsafe_enabled?: boolean | null
          grace_period?: number | null
          id?: string
          notification_preferences?: Json | null
          pin_system_enabled?: boolean | null
          reminder_frequency?: number | null
          trusted_contact_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      encryption_keys: {
        Row: {
          algorithm: string
          created_at: string | null
          id: string
          key_material: string
          last_used: string | null
          name: string
          status: string
          strength: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          algorithm: string
          created_at?: string | null
          id?: string
          key_material: string
          last_used?: string | null
          name: string
          status?: string
          strength: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          algorithm?: string
          created_at?: string | null
          id?: string
          key_material?: string
          last_used?: string | null
          name?: string
          status?: string
          strength?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      future_messages: {
        Row: {
          content: string
          created_at: string | null
          delivery_condition: string | null
          id: string
          preview: string | null
          recipient_email: string
          recipient_name: string | null
          scheduled_date: string | null
          status: string | null
          subject: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          delivery_condition?: string | null
          id?: string
          preview?: string | null
          recipient_email: string
          recipient_name?: string | null
          scheduled_date?: string | null
          status?: string | null
          subject: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          delivery_condition?: string | null
          id?: string
          preview?: string | null
          recipient_email?: string
          recipient_name?: string | null
          scheduled_date?: string | null
          status?: string | null
          subject?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      legacy_vault: {
        Row: {
          category: string
          content: Json
          created_at: string | null
          encrypted: boolean | null
          id: string
          preview: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          content: Json
          created_at?: string | null
          encrypted?: boolean | null
          id?: string
          preview?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          content?: Json
          created_at?: string | null
          encrypted?: boolean | null
          id?: string
          preview?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          description: string
          id: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          read?: boolean
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
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
      trusted_contacts: {
        Row: {
          created_at: string | null
          email: string
          id: string
          invitation_responded_at: string | null
          invitation_sent_at: string | null
          invitation_status: string | null
          name: string
          phone: string | null
          relation: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          invitation_responded_at?: string | null
          invitation_sent_at?: string | null
          invitation_status?: string | null
          name: string
          phone?: string | null
          relation?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          invitation_responded_at?: string | null
          invitation_sent_at?: string | null
          invitation_status?: string | null
          name?: string
          phone?: string | null
          relation?: string | null
          updated_at?: string | null
          user_id?: string
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
          activation_date: string | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          gender: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean | null
          stripe_customer_id: string | null
          subscription_plan: string | null
          updated_at: string | null
          verification_status: string | null
        }
        Insert: {
          activation_complete?: boolean | null
          activation_date?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          stripe_customer_id?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Update: {
          activation_complete?: boolean | null
          activation_date?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          stripe_customer_id?: string | null
          subscription_plan?: string | null
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
          encryption_key: string
          google_auth_enabled: boolean | null
          google_auth_secret: string | null
          id: string
          last_login: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          encryption_key: string
          google_auth_enabled?: boolean | null
          google_auth_secret?: string | null
          id?: string
          last_login?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          encryption_key?: string
          google_auth_enabled?: boolean | null
          google_auth_secret?: string | null
          id?: string
          last_login?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      will_beneficiaries: {
        Row: {
          allocation_percentage: number | null
          beneficiary_name: string
          created_at: string | null
          email: string | null
          id: string
          notes: string | null
          phone: string | null
          relation: string | null
          specific_assets: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allocation_percentage?: number | null
          beneficiary_name: string
          created_at?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          relation?: string | null
          specific_assets?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allocation_percentage?: number | null
          beneficiary_name?: string
          created_at?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          relation?: string | null
          specific_assets?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      will_documents: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          updated_at: string | null
          user_id: string
          will_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          updated_at?: string | null
          user_id: string
          will_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          updated_at?: string | null
          user_id?: string
          will_id?: string
        }
        Relationships: [
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
          compensation: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          primary_executor: boolean | null
          relation: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          compensation?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          primary_executor?: boolean | null
          relation?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          compensation?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          primary_executor?: boolean | null
          relation?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      will_progress: {
        Row: {
          completedsections: string[] | null
          content: string | null
          conversation_data: Json[] | null
          created_at: string | null
          current_step: string
          id: string
          isfinalized: boolean | null
          lasteditedsection: string | null
          responses: Json | null
          template_id: string
          title: string | null
          updated_at: string | null
          user_id: string
          will_id: string | null
        }
        Insert: {
          completedsections?: string[] | null
          content?: string | null
          conversation_data?: Json[] | null
          created_at?: string | null
          current_step: string
          id?: string
          isfinalized?: boolean | null
          lasteditedsection?: string | null
          responses?: Json | null
          template_id: string
          title?: string | null
          updated_at?: string | null
          user_id: string
          will_id?: string | null
        }
        Update: {
          completedsections?: string[] | null
          content?: string | null
          conversation_data?: Json[] | null
          created_at?: string | null
          current_step?: string
          id?: string
          isfinalized?: boolean | null
          lasteditedsection?: string | null
          responses?: Json | null
          template_id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
          will_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "will_progress_will_id_fkey"
            columns: ["will_id"]
            isOneToOne: false
            referencedRelation: "wills"
            referencedColumns: ["id"]
          },
        ]
      }
      wills: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_finalized: boolean | null
          status: string | null
          template_id: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_finalized?: boolean | null
          status?: string | null
          template_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_finalized?: boolean | null
          status?: string | null
          template_id?: string | null
          title?: string
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
      add_column_if_not_exists: {
        Args: { table_name: string; column_name: string; column_type: string }
        Returns: undefined
      }
      check_column_exists: {
        Args: { table_name: string; column_name: string }
        Returns: boolean
      }
      check_subscription_renewals: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_title: string
          p_description: string
          p_type: string
        }
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
    Enums: {},
  },
} as const
