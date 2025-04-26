
import { supabase } from "@/integrations/supabase/client";
import { getUserSecurity, createUserSecurity } from "@/services/encryptionService";

export interface DashboardSummary {
  securityStatus: string;
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No authenticated user');
    }
    
    let securityResult = null;
    
    try {
      securityResult = await getUserSecurity();
    } catch (e) {
      console.error('Error getting user security:', e);
    }
    
    if (!securityResult) {
      try {
        await createUserSecurity();
      } catch (e) {
        console.error('Error creating user security:', e);
      }
    }
    
    let securityStatus = 'Good';
    
    if (!securityResult) {
      securityStatus = 'Needs Setup';
    } else if (!securityResult.encryption_key) {
      securityStatus = 'Incomplete';
    } else if (securityResult.google_auth_enabled) {
      securityStatus = 'Strong';
    }
    
    return {
      securityStatus: securityStatus
    };
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return {
      securityStatus: 'Unknown'
    };
  }
};
