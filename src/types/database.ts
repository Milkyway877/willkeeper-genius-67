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
          email: string | null
          google_auth_enabled: boolean | null
          google_auth_secret: string | null
          encryption_key: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          email?: string | null
          google_auth_enabled?: boolean | null
          google_auth_secret?: string | null
          encryption_key?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          email?: string | null
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
      trusted_contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          phone?: string | null;
          relation?: string | null;
          invitation_status?: string | null;
          invitation_sent_at?: string | null;
          invitation_responded_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email: string;
          phone?: string | null;
          relation?: string | null;
          invitation_status?: string | null;
          invitation_sent_at?: string | null;
          invitation_responded_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          relation?: string | null;
          invitation_status?: string | null;
          invitation_sent_at?: string | null;
          invitation_responded_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      contact_verifications: {
        Row: {
          id: string;
          user_id: string;
          contact_id: string;
          contact_type: string;
          verification_token: string;
          expires_at: string;
          responded_at?: string | null;
          response?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          contact_id: string;
          contact_type: string;
          verification_token: string;
          expires_at: string;
          responded_at?: string | null;
          response?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          contact_id?: string;
          contact_type?: string;
          verification_token?: string;
          expires_at?: string;
          responded_at?: string | null;
          response?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      death_verification_settings: {
        Row: {
          id: string;
          user_id: string;
          check_in_enabled: boolean;
          check_in_frequency: number;
          grace_period: number;
          beneficiary_verification_interval: number;
          reminder_frequency: number;
          pin_system_enabled: boolean;
          executor_override_enabled: boolean;
          trusted_contact_enabled: boolean;
          failsafe_enabled: boolean;
          notification_preferences: any;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          check_in_enabled?: boolean;
          check_in_frequency?: number;
          grace_period?: number;
          beneficiary_verification_interval?: number;
          reminder_frequency?: number;
          pin_system_enabled?: boolean;
          executor_override_enabled?: boolean;
          trusted_contact_enabled?: boolean;
          failsafe_enabled?: boolean;
          notification_preferences?: any;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          check_in_enabled?: boolean;
          check_in_frequency?: number;
          grace_period?: number;
          beneficiary_verification_interval?: number;
          reminder_frequency?: number;
          pin_system_enabled?: boolean;
          executor_override_enabled?: boolean;
          trusted_contact_enabled?: boolean;
          failsafe_enabled?: boolean;
          notification_preferences?: any;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      death_verification_checkins: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          checked_in_at: string;
          next_check_in: string;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: string;
          checked_in_at?: string;
          next_check_in: string;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: string;
          checked_in_at?: string;
          next_check_in?: string;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      death_verification_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          details?: any | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          details?: any | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          details?: any | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string | null;
        };
      };
      will_beneficiaries: {
        Row: {
          id: string;
          user_id: string;
          beneficiary_name: string;
          email?: string | null;
          phone?: string | null;
          relation?: string | null;
          allocation_percentage?: number | null;
          specific_assets?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          beneficiary_name: string;
          email?: string | null;
          phone?: string | null;
          relation?: string | null;
          allocation_percentage?: number | null;
          specific_assets?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          beneficiary_name?: string;
          email?: string | null;
          phone?: string | null;
          relation?: string | null;
          allocation_percentage?: number | null;
          specific_assets?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      will_executors: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          relation?: string | null;
          primary_executor?: boolean | null;
          compensation?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          relation?: string | null;
          primary_executor?: boolean | null;
          compensation?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          relation?: string | null;
          primary_executor?: boolean | null;
          compensation?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description?: string | null;
          type?: string | null;
          read?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          type?: string | null;
          read?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          type?: string | null;
          read?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      will_documents: {
        Row: {
          id: string;
          will_id: string;
          user_id: string;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Insert: {
          id?: string;
          will_id: string;
          user_id: string;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          will_id?: string;
          user_id?: string;
          file_name?: string;
          file_path?: string;
          file_size?: number;
          file_type?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
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
