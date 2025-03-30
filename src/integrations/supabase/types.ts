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
        Relationships: []
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
        Relationships: []
      }
      beneficiaries: {
        Row: {
          confirmation_token: string
          created_at: string | null
          email: string
          id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          confirmation_token: string
          created_at?: string | null
          email: string
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          confirmation_token?: string
          created_at?: string | null
          email?: string
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      death_verification_checkins: {
        Row: {
          checked_in_at: string
          created_at: string
          id: string
          next_check_in: string
          status: string
          user_id: string
        }
        Insert: {
          checked_in_at?: string
          created_at?: string
          id?: string
          next_check_in: string
          status?: string
          user_id: string
        }
        Update: {
          checked_in_at?: string
          created_at?: string
          id?: string
          next_check_in?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      death_verification_logs: {
        Row: {
          action: string
          details: Json | null
          id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          action: string
          details?: Json | null
          id?: string
          timestamp?: string
          user_id: string
        }
        Update: {
          action?: string
          details?: Json | null
          id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      death_verification_pins: {
        Row: {
          created_at: string
          id: string
          person_id: string
          person_type: string
          pin_code: string
          used: boolean
          used_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          person_id: string
          person_type: string
          pin_code: string
          used?: boolean
          used_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          person_id?: string
          person_type?: string
          pin_code?: string
          used?: boolean
          used_at?: string | null
        }
        Relationships: []
      }
      death_verification_requests: {
        Row: {
          expires_at: string
          id: string
          initiated_at: string
          status: string
          user_id: string
        }
        Insert: {
          expires_at: string
          id?: string
          initiated_at?: string
          status?: string
          user_id: string
        }
        Update: {
          expires_at?: string
          id?: string
          initiated_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      death_verification_responses: {
        Row: {
          id: string
          request_id: string
          responded_at: string
          responder_id: string
          response: string
        }
        Insert: {
          id?: string
          request_id: string
          responded_at?: string
          responder_id: string
          response: string
        }
        Update: {
          id?: string
          request_id?: string
          responded_at?: string
          responder_id?: string
          response?: string
        }
        Relationships: [
          {
            foreignKeyName: "death_verification_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "death_verification_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      death_verification_settings: {
        Row: {
          beneficiary_verification_interval: number
          check_in_enabled: boolean
          check_in_frequency: number
          created_at: string
          failsafe_enabled: boolean
          id: string
          notification_preferences: Json
          trusted_contact_email: string | null
          unlock_mode: string
          updated_at: string
          user_id: string
        }
        Insert: {
          beneficiary_verification_interval?: number
          check_in_enabled?: boolean
          check_in_frequency?: number
          created_at?: string
          failsafe_enabled?: boolean
          id?: string
          notification_preferences?: Json
          trusted_contact_email?: string | null
          unlock_mode?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          beneficiary_verification_interval?: number
          check_in_enabled?: boolean
          check_in_frequency?: number
          created_at?: string
          failsafe_enabled?: boolean
          id?: string
          notification_preferences?: Json
          trusted_contact_email?: string | null
          unlock_mode?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      encryption_keys: {
        Row: {
          algorithm: string
          created_at: string
          id: string
          last_used: string | null
          name: string
          status: string
          strength: string | null
          type: string
          user_id: string
          value: string
        }
        Insert: {
          algorithm: string
          created_at?: string
          id?: string
          last_used?: string | null
          name: string
          status?: string
          strength?: string | null
          type: string
          user_id: string
          value: string
        }
        Update: {
          algorithm?: string
          created_at?: string
          id?: string
          last_used?: string | null
          name?: string
          status?: string
          strength?: string | null
          type?: string
          user_id?: string
          value?: string
        }
        Relationships: []
      }
      executors: {
        Row: {
          confirmation_token: string
          created_at: string | null
          email: string
          id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          confirmation_token: string
          created_at?: string | null
          email: string
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          confirmation_token?: string
          created_at?: string | null
          email?: string
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      future_messages: {
        Row: {
          created_at: string | null
          delivery_date: string
          id: string
          message_type: string | null
          message_url: string | null
          preview: string | null
          recipient_email: string
          recipient_name: string
          status: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_date: string
          id?: string
          message_type?: string | null
          message_url?: string | null
          preview?: string | null
          recipient_email: string
          recipient_name: string
          status?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_date?: string
          id?: string
          message_type?: string | null
          message_url?: string | null
          preview?: string | null
          recipient_email?: string
          recipient_name?: string
          status?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      legacy_vault: {
        Row: {
          category: string | null
          created_at: string | null
          document_url: string
          id: string
          is_encrypted: boolean | null
          preview: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          document_url: string
          id?: string
          is_encrypted?: boolean | null
          preview?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          document_url?: string
          id?: string
          is_encrypted?: boolean | null
          preview?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          description: string
          icon: string | null
          id: string
          read: boolean
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          read?: boolean
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      tan_keys: {
        Row: {
          created_at: string | null
          id: string
          last_used: string | null
          tan_key: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_used?: string | null
          tan_key: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_used?: string | null
          tan_key?: string
          user_id?: string
        }
        Relationships: []
      }
      user_checkins: {
        Row: {
          executor_email: string
          id: string
          last_checkin: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          executor_email: string
          id?: string
          last_checkin?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          executor_email?: string
          id?: string
          last_checkin?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
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
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          activation_complete?: boolean | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          activation_complete?: boolean | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_recovery_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          used: boolean
          used_at: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          used?: boolean
          used_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          used?: boolean
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
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
        Relationships: []
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
          address: string | null
          beneficiary_name: string
          created_at: string | null
          email: string | null
          id: string
          notes: string | null
          percentage: number | null
          phone: string | null
          relationship: string
          status: string | null
          user_id: string | null
          will_id: string | null
        }
        Insert: {
          address?: string | null
          beneficiary_name: string
          created_at?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          percentage?: number | null
          phone?: string | null
          relationship: string
          status?: string | null
          user_id?: string | null
          will_id?: string | null
        }
        Update: {
          address?: string | null
          beneficiary_name?: string
          created_at?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          percentage?: number | null
          phone?: string | null
          relationship?: string
          status?: string | null
          user_id?: string | null
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
      will_executors: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          relationship: string | null
          status: string
          user_id: string | null
          will_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          relationship?: string | null
          status?: string
          user_id?: string | null
          will_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          relationship?: string | null
          status?: string
          user_id?: string | null
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
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_column_if_not_exists: {
        Args: {
          p_table_name: string
          p_column_name: string
          p_column_type: string
        }
        Returns: undefined
      }
      check_column_exists: {
        Args: {
          p_table_name: string
          p_column_name: string
        }
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
