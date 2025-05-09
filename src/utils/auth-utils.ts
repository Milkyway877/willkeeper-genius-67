
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

/**
 * Creates a set of policy functions for use with Supabase RLS
 * @param supabase An authenticated Supabase client
 * @param userId The current user's Clerk ID
 * @returns An object with utility functions for data access
 */
export const createDataAccess = (
  supabase: SupabaseClient<Database>,
  userId: string | null | undefined
) => {
  return {
    /**
     * Check if a user has ownership of a record in a table
     */
    checkOwnership: async <T extends keyof Database['public']['Tables']>(
      table: T,
      recordId: string | number,
      ownerField: string = 'user_id'
    ): Promise<boolean> => {
      if (!userId) return false;
      
      const { data, error } = await supabase
        .from(table as string)
        .select('id')
        .eq(ownerField, userId)
        .eq('id', recordId)
        .single();
        
      return !!data && !error;
    },
    
    /**
     * Get all records owned by the current user
     */
    getUserRecords: <T extends keyof Database['public']['Tables']>(
      table: T,
      ownerField: string = 'user_id'
    ) => {
      if (!userId) {
        // Return an empty query if no user
        return {
          data: [] as any[],
          error: null
        };
      }
      
      return supabase
        .from(table as string)
        .select('*')
        .eq(ownerField, userId);
    },
    
    /**
     * Insert a record with the current user's ID
     */
    insertUserRecord: <T extends keyof Database['public']['Tables']>(
      table: T,
      data: any,
      ownerField: string = 'user_id'
    ) => {
      if (!userId) {
        throw new Error('No authenticated user');
      }
      
      return supabase
        .from(table as string)
        .insert({
          ...data,
          [ownerField]: userId
        })
        .select();
    }
  };
};
