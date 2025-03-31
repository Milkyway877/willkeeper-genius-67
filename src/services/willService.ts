
import { supabase } from '@/integrations/supabase/client';
import { notifyWillCreated, notifyWillUpdated } from '@/services/notificationService';
import { createLegacyVaultItem } from '@/services/tankService';
import { VaultItemType } from '@/pages/tank/types';

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
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .eq('id', willId)
      .eq('user_id', userData.user.id)
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
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching wills:', error);
    return [];
  }
};

// Validate template type to ensure it matches the database constraint
export const validateTemplateType = (templateType: string | undefined): string => {
  // Define allowed template types - this must match exactly what's defined in the database constraint
  const validTemplateTypes = ['traditional', 'living-trust', 'digital-assets', 'charitable', 'business', 'pet-care', 'custom'];
  
  // Default to 'custom' if no template type is provided
  if (!templateType) return 'custom';
  
  // Normalize the template type (convert to lowercase, replace spaces with hyphens)
  const normalizedType = templateType.toLowerCase().replace(/\s+/g, '-');
  
  // Map common template types to valid ones in the database
  const templateMap: Record<string, string> = {
    'standard': 'traditional',
    'digital': 'digital-assets',
    'living': 'living-trust',
    'pet': 'pet-care',
  };
  
  // If there's a direct mapping, use it
  if (templateMap[normalizedType]) {
    return templateMap[normalizedType];
  }
  
  // Return the template type if valid, otherwise default to 'custom'
  return validTemplateTypes.includes(normalizedType) ? normalizedType : 'custom';
};

// Create a new will
export const createWill = async (will: Omit<Will, 'id'>) => {
  try {
    console.log("Creating will with data:", will);
    
    // Check authentication
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      console.error("Authentication error: Not authenticated");
      throw new Error('Not authenticated');
    }
    
    // Validate status
    const validStatuses = ['Draft', 'Active', 'Archived'];
    let status = 'Draft'; // Default to Draft
    
    if (will.status && validStatuses.includes(will.status)) {
      status = will.status;
    }
    
    // Validate template_type using the separate validation function
    const templateType = validateTemplateType(will.template_type);
    console.log("Using validated template type:", templateType);
    console.log("User ID:", userData.user.id);
    
    const willData = {
      ...will,
      user_id: userData.user.id,
      status: status,
      template_type: templateType
    };
    
    // Create the will in the database
    const { data, error } = await supabase
      .from('wills')
      .insert([willData])
      .select()
      .single();
      
    if (error) {
      console.error("Supabase error creating will:", error);
      throw error;
    }
    
    if (!data) {
      throw new Error("No data returned from will creation");
    }
    
    try {
      // Create a notification for the new will
      await notifyWillCreated(data.title);
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue even if notification fails
    }
    
    try {
      // Add will to legacy vault for unified access
      await createLegacyVaultItem({
        title: data.title,
        type: VaultItemType.will,
        preview: `Will document: ${data.title} (${data.status})`,
        document_url: data.document_url || '',
        encryptionStatus: false
      });
    } catch (vaultError) {
      console.error('Error adding will to legacy vault:', vaultError);
      // Continue even if vault addition fails
    }
    
    return data;
  } catch (error) {
    console.error('Error creating will:', error);
    throw error; // Re-throw the error so it can be caught by the caller
  }
};

// Update an existing will
export const updateWill = async (willId: string, updates: Partial<Will>) => {
  try {
    console.log("Updating will with ID:", willId, "and updates:", updates);
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) throw new Error('Not authenticated');
    
    // Validate status to ensure it matches the constraints in the database
    if (updates.status) {
      const validStatuses = ['Draft', 'Active', 'Archived'];
      if (!validStatuses.includes(updates.status)) {
        updates.status = 'Draft';
      }
    }
    
    // Validate template_type if it's being updated
    if (updates.template_type) {
      updates.template_type = validateTemplateType(updates.template_type);
    }
    
    const { data, error } = await supabase
      .from('wills')
      .update(updates)
      .eq('id', willId)
      .eq('user_id', userData.user.id)
      .select()
      .single();
      
    if (error) {
      console.error("Supabase error updating will:", error);
      throw error;
    }
    
    try {
      // Create a notification for the updated will
      await notifyWillUpdated(data.title);
    } catch (notificationError) {
      console.error('Error creating update notification:', notificationError);
      // Continue even if notification fails
    }
    
    try {
      // Update the item in legacy vault if title or status changed
      if (updates.title || updates.status) {
        // First check if this will already exists in the vault
        const { data: vaultItems } = await supabase
          .from('legacy_vault')
          .select('*')
          .eq('user_id', userData.user.id)
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
            type: VaultItemType.will,
            preview: `Will document: ${data.title} (${data.status})`,
            document_url: data.document_url || '',
            encryptionStatus: false
          });
        }
      }
    } catch (vaultError) {
      console.error('Error updating legacy vault item:', vaultError);
      // Continue even if vault update fails
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
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('wills')
      .delete()
      .eq('id', willId)
      .eq('user_id', userData.user.id);
      
    if (error) throw error;
    
    // Also delete from legacy vault if it exists
    if (will) {
      try {
        const { data: vaultItems } = await supabase
          .from('legacy_vault')
          .select('*')
          .eq('user_id', userData.user.id)
          .ilike('preview', `Will document: ${will.title}%`);
          
        if (vaultItems && vaultItems.length > 0) {
          await supabase
            .from('legacy_vault')
            .delete()
            .eq('id', vaultItems[0].id);
        }
      } catch (vaultError) {
        console.error('Error deleting legacy vault item:', vaultError);
        // Continue even if vault deletion fails
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
