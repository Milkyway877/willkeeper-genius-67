
import { supabase } from '@/integrations/supabase/client';

export interface WillCheckResult {
  hasWill: boolean;
  willCount: number;
}

export const checkUserHasWill = async (): Promise<WillCheckResult> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { hasWill: false, willCount: 0 };
    }

    const { data: wills, error } = await supabase
      .from('wills')
      .select('id')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error checking user wills:', error);
      return { hasWill: false, willCount: 0 };
    }

    const willCount = wills?.length || 0;
    return { hasWill: willCount > 0, willCount };
  } catch (error) {
    console.error('Error in checkUserHasWill:', error);
    return { hasWill: false, willCount: 0 };
  }
};
