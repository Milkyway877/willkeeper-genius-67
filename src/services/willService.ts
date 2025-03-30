
import { supabase } from '@/integrations/supabase/client';
import { notifyWillCreated, notifyWillUpdated } from '@/services/notificationService';
import { createLegacyVaultItem } from '@/services/tankService';

export type Will = {
  id: string;
  title: string;
  document_url: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  template_type?: string;
  ai_generated?: boolean;
  user_id?: string;
};

// Get will by ID
export const getWill = async (willId: string): Promise<Will | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .eq('id', willId)
      .eq('user_id', user.user.id)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching will:', error);
    return null;
  }
};

// Get all wills for the current user
export const getUserWills = async (): Promise<Will[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching wills:', error);
    return [];
  }
};

// Create a new will
export const createWill = async (will: Omit<Will, 'id'>) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('wills')
      .insert({
        ...will,
        user_id: user.user.id
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Create a notification for the new will
    await notifyWillCreated(data.title);
    
    // Add will to legacy vault for unified access
    await createLegacyVaultItem({
      title: data.title,
      type: 'will',
      preview: `Will document: ${data.title} (${data.status})`,
      document_url: data.document_url,
      encryptionStatus: false
    });
    
    return data;
  } catch (error) {
    console.error('Error creating will:', error);
    return null;
  }
};

// Update an existing will
export const updateWill = async (willId: string, updates: Partial<Will>) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('wills')
      .update(updates)
      .eq('id', willId)
      .eq('user_id', user.user.id)
      .select()
      .single();
      
    if (error) throw error;
    
    // Create a notification for the updated will
    await notifyWillUpdated(data.title);
    
    // Update the item in legacy vault if title or status changed
    if (updates.title || updates.status) {
      // First check if this will already exists in the vault
      const { data: vaultItems } = await supabase
        .from('legacy_vault')
        .select('*')
        .eq('user_id', user.user.id)
        .ilike('preview', `Will document: ${data.title}%`);
        
      if (vaultItems && vaultItems.length > 0) {
        // Update existing entry
        await supabase
          .from('legacy_vault')
          .update({
            title: data.title,
            preview: `Will document: ${data.title} (${data.status})`,
          })
          .eq('id', vaultItems[0].id);
      } else {
        // Create new entry if somehow it doesn't exist
        await createLegacyVaultItem({
          title: data.title,
          type: 'will',
          preview: `Will document: ${data.title} (${data.status})`,
          document_url: data.document_url,
          encryptionStatus: false
        });
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error updating will:', error);
    return null;
  }
};

// Delete a will
export const deleteWill = async (willId: string) => {
  try {
    // Get the will details before deleting
    const will = await getWill(willId);
    
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('wills')
      .delete()
      .eq('id', willId)
      .eq('user_id', user.user.id);
      
    if (error) throw error;
    
    // Also delete from legacy vault if it exists
    if (will) {
      const { data: vaultItems } = await supabase
        .from('legacy_vault')
        .select('*')
        .eq('user_id', user.user.id)
        .ilike('preview', `Will document: ${will.title}%`);
        
      if (vaultItems && vaultItems.length > 0) {
        await supabase
          .from('legacy_vault')
          .delete()
          .eq('id', vaultItems[0].id);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting will:', error);
    return false;
  }
};

// Save will content to a storage solution
// In a real application, this would likely save to a file storage system
export const saveWillContent = async (willId: string, content: string) => {
  try {
    // For demonstration purposes, we'll just log the content
    // In a real app, you might upload this to storage
    console.log(`Saving content for will ${willId}:`, content.substring(0, 100) + '...');
    
    // Update the 'updated_at' field of the will to reflect changes
    const result = await updateWill(willId, {
      updated_at: new Date().toISOString()
    });
    
    return !!result;
  } catch (error) {
    console.error('Error saving will content:', error);
    return false;
  }
};

// Get will content from storage
// In a real application, this would fetch from a file storage system
export const getWillContent = async (willId: string) => {
  try {
    // For demonstration, we'll return a placeholder
    // In a real app, you would fetch the actual content
    console.log(`Fetching content for will ${willId}`);
    
    // This is just placeholder content - in reality, you'd fetch from storage
    return "This is a placeholder for the will content that would typically be fetched from storage.";
  } catch (error) {
    console.error('Error getting will content:', error);
    return null;
  }
};

// Alias for getUserWills to match the import in the components
export const getWills = getUserWills;
