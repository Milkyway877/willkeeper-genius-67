
import { supabase } from "@/integrations/supabase/client";

export interface SimpleUserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  is_activated: boolean;
  subscription_plan: string;
  activation_date: string | null;
  email: string | null;
  email_verified: boolean;
  gender?: 'male' | 'female' | null;
}

export const getSimpleUserProfile = async (): Promise<SimpleUserProfile | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (error) {
      console.log('No profile found in database, using session data');
      // Return minimal profile from session data
      return {
        id: session.user.id,
        full_name: session.user.user_metadata?.full_name || null,
        avatar_url: null,
        created_at: session.user.created_at,
        updated_at: session.user.updated_at || session.user.created_at,
        is_activated: false,
        subscription_plan: 'Free Plan',
        activation_date: null,
        email: session.user.email,
        email_verified: session.user.email_confirmed_at !== null,
        gender: null,
      };
    }
    
    // Map database fields to interface
    return {
      id: data.id,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_activated: data.activation_complete || false, // Map activation_complete to is_activated
      subscription_plan: data.subscription_plan || 'Free Plan',
      activation_date: data.activation_date,
      email: session.user.email,
      email_verified: session.user.email_confirmed_at !== null,
      gender: data.gender || null,
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};
