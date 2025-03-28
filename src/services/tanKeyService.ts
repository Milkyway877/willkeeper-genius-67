
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
      
      if (!userId) {
        console.error("TanKeyService: Missing userId");
        return false;
      }
      
      if (!tanKey) {
        console.error("TanKeyService: Missing tanKey");
        return false;
      }
      
      // Verify current authentication state first
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error("TanKeyService: No active session found");
        // Try to refresh the session
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (!refreshData.session) {
          console.error("TanKeyService: Failed to refresh session");
          return false;
        }
        console.log("TanKeyService: Session refreshed successfully");
      }
      
      // First ensure the user profile exists in our users table
      try {
        const { error: profileError } = await supabase.functions.invoke('store-user-profile', {
          body: {
            user_id: userId,
            email: sessionData.session?.user.email || 'unknown@email.com',
            first_name: sessionData.session?.user.user_metadata?.first_name || "User",
            last_name: sessionData.session?.user.user_metadata?.last_name || "Account"
          }
        });
        
        if (profileError) {
          console.error("TanKeyService: Error ensuring user profile exists:", profileError);
          // Continue anyway as the profile might still exist or the error might be due to a race condition
        } else {
          console.log("TanKeyService: User profile confirmed/created");
        }
      } catch (profileError) {
        console.error("TanKeyService: Exception in profile creation:", profileError);
        // Continue anyway, the store-tankey function will attempt to create a profile if needed
      }
      
      // Short delay to ensure the profile is created before storing the TanKey
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Then store the TanKey
      try {
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
        
        // As a fallback, also try to update the users table directly through the client
        try {
          const { error: updateError } = await supabase
            .from("users")
            .update({ passkey: tanKey })
            .eq("id", userId);
            
          if (updateError) {
            console.warn("TanKeyService: Failed direct user passkey update:", updateError);
            // Non-fatal error, continue anyway
          } else {
            console.log("TanKeyService: User passkey updated directly");
          }
        } catch (directUpdateError) {
          console.warn("TanKeyService: Exception in direct passkey update:", directUpdateError);
        }
        
        return true;
      } catch (tanKeyError) {
        console.error('TanKeyService: Exception in store-tankey function call:', tanKeyError);
        return false;
      }
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
      
      if (!userId || !tanKey) {
        console.error("TanKeyService: Missing userId or tanKey");
        return false;
      }
      
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
      
      if (!userId) {
        console.error("TanKeyService: Missing userId");
        return false;
      }
      
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
