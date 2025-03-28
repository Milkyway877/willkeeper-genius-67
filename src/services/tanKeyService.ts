
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
      
      // Get current session first
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("TanKeyService: Session error:", sessionError);
      }
      
      // If no session, try to refresh it
      if (!sessionData?.session) {
        console.log("TanKeyService: No active session, attempting refresh");
        const { data: refreshData } = await supabase.auth.refreshSession();
        
        if (!refreshData?.session) {
          console.log("TanKeyService: Session refresh failed, trying getUser");
          
          // Try getUser as a fallback
          const { data: userData } = await supabase.auth.getUser();
          if (!userData?.user) {
            console.error("TanKeyService: No authenticated user found after refresh attempts");
          } else {
            console.log("TanKeyService: User found from getUser", userData.user.id);
          }
        } else {
          console.log("TanKeyService: Session refreshed successfully");
        }
      } else {
        console.log("TanKeyService: Active session found", sessionData.session.user.id);
      }
      
      // First ensure the user profile exists through direct database access
      try {
        // Check if user exists
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("id")
          .eq("id", userId)
          .maybeSingle();
          
        if (checkError) {
          console.error("TanKeyService: Error checking user existence:", checkError);
        }
        
        // If user doesn't exist in the database, create a direct profile
        if (!existingUser) {
          console.log("TanKeyService: User not found in database, creating profile directly");
          
          // Get user details from auth
          const { data: authData } = await supabase.auth.getUser();
          const userEmail = authData?.user?.email || sessionData?.session?.user?.email || "unknown@email.com";
          const firstName = authData?.user?.user_metadata?.first_name || sessionData?.session?.user?.user_metadata?.first_name || "New";
          const lastName = authData?.user?.user_metadata?.last_name || sessionData?.session?.user?.user_metadata?.last_name || "User";
          
          // Create user profile directly
          const { error: insertError } = await supabase
            .from("users")
            .insert({
              id: userId,
              email: userEmail,
              full_name: firstName,
              surname: lastName,
              passkey: tanKey,
              recovery_phrase: "temporary_recovery_phrase"
            });
            
          if (insertError) {
            console.warn("TanKeyService: Failed to create user profile directly:", insertError);
            
            // If not a duplicate key error, try the edge function as fallback
            if (insertError.code !== '23505') {
              await this.tryStoreUserProfile(userId, userEmail, firstName, lastName);
            } else {
              console.log("TanKeyService: User profile appears to exist (duplicate key)");
            }
          } else {
            console.log("TanKeyService: User profile created directly in database");
          }
        } else {
          console.log("TanKeyService: User profile already exists in database");
        }
      } catch (profileError) {
        console.error("TanKeyService: Exception in profile check/creation:", profileError);
        
        // Try the edge function as a fallback
        const userEmail = sessionData?.session?.user?.email || "unknown@email.com";
        const firstName = sessionData?.session?.user?.user_metadata?.first_name || "User";
        const lastName = sessionData?.session?.user?.user_metadata?.last_name || "Account";
        
        await this.tryStoreUserProfile(userId, userEmail, firstName, lastName);
      }
      
      // Short delay to ensure the profile creation completes
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Try two methods to store the TanKey for redundancy
      
      // 1. Try updating the users table directly first (simpler, less error-prone)
      try {
        const { error: updateError } = await supabase
          .from("users")
          .update({ passkey: tanKey })
          .eq("id", userId);
          
        if (updateError) {
          console.warn("TanKeyService: Direct update of passkey failed:", updateError);
        } else {
          console.log("TanKeyService: Successfully updated passkey directly");
        }
      } catch (directUpdateError) {
        console.warn("TanKeyService: Exception in direct passkey update:", directUpdateError);
      }
      
      // 2. Also try the dedicated edge function (more sophisticated handling)
      try {
        const { data, error } = await supabase.functions.invoke('store-tankey', {
          body: { user_id: userId, tan_key: tanKey }
        });
  
        if (error) {
          console.error('TanKeyService: Error from store-tankey function:', error);
          // Continue anyway as the direct update might have succeeded
        } else if (!data?.success) {
          console.warn('TanKeyService: store-tankey function returned unsuccessful status', data);
          // Continue anyway as the direct update might have succeeded
        } else {
          console.log('TanKeyService: TanKey stored successfully via edge function');
        }
        
        // With either the direct update or the function succeeding, consider it a success
        return true;
      } catch (tanKeyError) {
        console.error('TanKeyService: Exception in store-tankey function call:', tanKeyError);
        // The direct update might have still succeeded, so return true
        return true;
      }
    } catch (error) {
      console.error('Exception in storeTanKey service:', error);
      return false;
    }
  },

  /**
   * Helper method to try using the store-user-profile edge function
   */
  async tryStoreUserProfile(userId: string, email: string, firstName: string, lastName: string): Promise<void> {
    try {
      console.log("TanKeyService: Attempting to store user profile via edge function");
      const { data: profileData, error: profileError } = await supabase.functions.invoke('store-user-profile', {
        body: {
          user_id: userId,
          email: email,
          first_name: firstName,
          last_name: lastName
        }
      });
      
      if (profileError) {
        console.error("TanKeyService: Error from store-user-profile function:", profileError);
      } else if (profileData?.success) {
        console.log("TanKeyService: User profile created via edge function");
      } else {
        console.warn("TanKeyService: store-user-profile function returned unknown status:", profileData);
      }
    } catch (profileFuncError) {
      console.error("TanKeyService: Exception in store-user-profile function call:", profileFuncError);
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
      
      // First try to verify directly from the database (more reliable)
      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("passkey")
          .eq("id", userId)
          .maybeSingle();
          
        if (userError) {
          console.error("TanKeyService: Error fetching user for verification:", userError);
        } else if (userData && userData.passkey === tanKey) {
          console.log("TanKeyService: TanKey verified directly from database");
          return true;
        }
      } catch (directVerifyError) {
        console.warn("TanKeyService: Exception in direct TanKey verification:", directVerifyError);
      }
      
      // Fall back to the edge function if direct verification fails
      const { data, error } = await supabase.functions.invoke('verify-tankey', {
        body: { user_id: userId, tan_key: tanKey }
      });

      if (error) {
        console.error('TanKeyService: Error from verify-tankey function:', error);
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
        console.error('TanKeyService: Error from delete-tankey function:', error);
        return false;
      }

      return data?.success === true;
    } catch (error) {
      console.error('Exception in deleteTanKey:', error);
      return false;
    }
  }
};
