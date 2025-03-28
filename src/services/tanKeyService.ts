
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
      console.log("TanKeyService: Storing TanKey for user", userId);
      
      // First, we'll verify the user exists in the users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("id", userId)
        .single();
        
      if (userError) {
        console.error("TanKeyService: User not found in users table", userError);
        
        // If the user doesn't exist in the users table, try to create a placeholder
        if (userError.code === "PGRST116") { // No rows returned
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData.session) {
            console.error("TanKeyService: No active session found");
            return false;
          }
          
          // Try to create a placeholder user record
          const { error: insertError } = await supabase.functions.invoke('store-user-profile', {
            body: {
              user_id: userId,
              email: sessionData.session.user.email || 'unknown@email.com',
              first_name: "User",
              last_name: "Account"
            }
          });
          
          if (insertError) {
            console.error("TanKeyService: Failed to create user profile", insertError);
            return false;
          }
          
          console.log("TanKeyService: Created placeholder user profile");
        } else {
          return false;
        }
      }
      
      // Then store the TanKey
      const { data, error } = await supabase.functions.invoke('store-tankey', {
        body: { user_id: userId, tan_key: tanKey }
      });

      if (error) {
        console.error('TanKeyService: Error storing TanKey:', error);
        return false;
      }

      if (!data?.success) {
        console.error('TanKeyService: Server returned unsuccessful response', data);
        return false;
      }

      console.log('TanKeyService: TanKey stored successfully');
      return true;
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
      console.log("TanKeyService: Verifying TanKey for user", userId);
      
      const { data, error } = await supabase.functions.invoke('verify-tankey', {
        body: { user_id: userId, tan_key: tanKey }
      });

      if (error) {
        console.error('TanKeyService: Error verifying TanKey:', error);
        return false;
      }

      return data?.success === true;
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
      console.log("TanKeyService: Deleting TanKey for user", userId);
      
      const { data, error } = await supabase.functions.invoke('delete-tankey', {
        body: { user_id: userId }
      });

      if (error) {
        console.error('TanKeyService: Error deleting TanKey:', error);
        return false;
      }

      return data?.success === true;
    } catch (error) {
      console.error('Exception in deleteTanKey:', error);
      return false;
    }
  }
};
