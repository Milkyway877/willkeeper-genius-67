
import { supabase } from "@/integrations/supabase/client";

export interface UserSecurity {
  user_id: string;
  encryption_key: string;
  google_auth_secret?: string | null;
  google_auth_enabled?: boolean;
  last_login: string;
}

export const getUserSecurity = async (): Promise<UserSecurity | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('user_security')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, create default security record
        return createUserSecurity();
      }
      console.error('Error fetching user security:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserSecurity:', error);
    return null;
  }
};

export const createUserSecurity = async (): Promise<UserSecurity | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No user logged in');
    }
    
    // Generate a random encryption key
    const encryptionKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const securityData = {
      user_id: session.user.id,
      encryption_key: encryptionKey,
      google_auth_enabled: false
    };
    
    const { data, error } = await supabase
      .from('user_security')
      .insert(securityData)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user security:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createUserSecurity:', error);
    return null;
  }
};

export const updateUserSecurity = async (updates: Partial<UserSecurity>): Promise<UserSecurity | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No user logged in');
    }
    
    const { data, error } = await supabase
      .from('user_security')
      .update(updates)
      .eq('user_id', session.user.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating user security:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateUserSecurity:', error);
    return null;
  }
};
