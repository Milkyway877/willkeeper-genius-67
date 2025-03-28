
import { supabase } from "@/integrations/supabase/client";

/**
 * Service for handling TanKey operations
 */
export const tanKeyService = {
  /**
   * Store a user's TanKey
   * @param userId The user's ID
   * @param tanKey The TanKey to store
   */
  async storeTanKey(userId: string, tanKey: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('store-tankey', {
        body: { user_id: userId, tan_key: tanKey }
      });

      if (error) {
        console.error('Error storing TanKey:', error);
        return false;
      }

      return data.success;
    } catch (error) {
      console.error('Exception in storeTanKey:', error);
      return false;
    }
  },

  /**
   * Verify a user's TanKey
   * @param userId The user's ID
   * @param tanKey The TanKey to verify
   */
  async verifyTanKey(userId: string, tanKey: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('verify-tankey', {
        body: { user_id: userId, tan_key: tanKey }
      });

      if (error) {
        console.error('Error verifying TanKey:', error);
        return false;
      }

      return data.success;
    } catch (error) {
      console.error('Exception in verifyTanKey:', error);
      return false;
    }
  },

  /**
   * Delete a user's TanKey
   * @param userId The user's ID
   */
  async deleteTanKey(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('delete-tankey', {
        body: { user_id: userId }
      });

      if (error) {
        console.error('Error deleting TanKey:', error);
        return false;
      }

      return data.success;
    } catch (error) {
      console.error('Exception in deleteTanKey:', error);
      return false;
    }
  }
};
