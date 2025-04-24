
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ai_interactions: {
        Row: {
          id: string
          user_id: string
          request_type: string | null
          response: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          request_type?: string | null
          response?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          request_type?: string | null
          response?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          phone_number: string | null
          date_of_birth: string | null
          country: string | null
          activation_complete: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone_number?: string | null
          date_of_birth?: string | null
          country?: string | null
          activation_complete?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone_number?: string | null
          date_of_birth?: string | null
          country?: string | null
          activation_complete?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_security: {
        Row: {
          id: string
          user_id: string
          google_auth_enabled: boolean | null
          google_auth_secret: string | null
          encryption_key: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          google_auth_enabled?: boolean | null
          google_auth_secret?: string | null
          encryption_key?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          google_auth_enabled?: boolean | null
          google_auth_secret?: string | null
          encryption_key?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      wills: {
        Row: {
          id: string
          user_id: string
          title: string | null
          content: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          content?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          content?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      future_messages: {
        Row: {
          id: string
          user_id: string
          title: string | null
          preview: string | null
          content: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          preview?: string | null
          content?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          preview?: string | null
          content?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      legacy_vault: {
        Row: {
          id: string
          user_id: string
          title: string | null
          preview: string | null
          content: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          preview?: string | null
          content?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          preview?: string | null
          content?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          status: string
          stripe_price_id: string | null
          start_date: string | null
          end_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          status: string
          stripe_price_id?: string | null
          start_date?: string | null
          end_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          stripe_price_id?: string | null
          start_date?: string | null
          end_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
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
