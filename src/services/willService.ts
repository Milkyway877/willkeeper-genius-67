import { supabase } from '@/integrations/supabase/client';

export interface Will {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
  user_id: string;
  document_url?: string;
  template_type?: string;
  ai_generated?: boolean;
  metadata?: any;
}

export interface CreateWillData {
  title: string;
  content: string;
  status: 'draft' | 'active' | 'archived';
  document_url?: string;
  template_type?: string;
  ai_generated?: boolean;
  metadata?: any;
}

// Add missing exports for compatibility
export const getUserWills = async (): Promise<Will[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('willService: Error fetching user wills:', error);
      throw error;
    }

    console.log('willService: User wills fetched:', data.length);
    return data || [];
  } catch (error) {
    console.error('willService: Error in getUserWills:', error);
    return [];
  }
};

// Alias for compatibility
export const getWills = getUserWills;

// Document-related placeholder exports (these would need proper implementation)
export interface WillDocument {
  id: string;
  will_id: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export const getWillDocuments = async (willId: string): Promise<WillDocument[]> => {
  // Placeholder implementation
  console.log('getWillDocuments not fully implemented for will:', willId);
  return [];
};

export const deleteWillDocument = async (documentId: string): Promise<boolean> => {
  // Placeholder implementation
  console.log('deleteWillDocument not fully implemented for document:', documentId);
  return false;
};

export const getDocumentUrl = async (documentPath: string): Promise<string | null> => {
  // Placeholder implementation
  console.log('getDocumentUrl not fully implemented for path:', documentPath);
  return null;
};

export const uploadWillDocument = async (willId: string, file: File): Promise<WillDocument | null> => {
  // Placeholder implementation
  console.log('uploadWillDocument not fully implemented for will:', willId, 'file:', file.name);
  return null;
};

export const createWill = async (willData: CreateWillData): Promise<Will | null> => {
  try {
    console.log('willService: Creating will with data:', {
      title: willData.title,
      contentLength: willData.content?.length,
      status: willData.status,
      template_type: willData.template_type,
      hasMetadata: !!willData.metadata
    });

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('wills')
      .insert([
        {
          title: willData.title,
          content: willData.content,
          status: willData.status,
          user_id: user.id,
          document_url: willData.document_url || '',
          template_type: willData.template_type || 'custom',
          ai_generated: willData.ai_generated || false,
          metadata: willData.metadata || null
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('willService: Error creating will:', error);
      throw error;
    }

    console.log('willService: Will created successfully:', {
      id: data.id,
      title: data.title,
      contentPreview: data.content?.substring(0, 100),
      status: data.status
    });

    return data;
  } catch (error) {
    console.error('willService: Error in createWill:', error);
    return null;
  }
};

export const updateWill = async (id: string, willData: Partial<CreateWillData>): Promise<Will | null> => {
  try {
    console.log('willService: Updating will:', { id, hasContent: !!willData.content });

    const { data, error } = await supabase
      .from('wills')
      .update({
        ...willData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('willService: Error updating will:', error);
      throw error;
    }

    console.log('willService: Will updated successfully:', data.id);
    return data;
  } catch (error) {
    console.error('willService: Error in updateWill:', error);
    return null;
  }
};

export const getWill = async (id: string): Promise<Will | null> => {
  try {
    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('willService: Error fetching will:', error);
      throw error;
    }

    console.log('willService: Will fetched successfully:', {
      id: data.id,
      title: data.title,
      contentLength: data.content?.length,
      hasMetadata: !!data.metadata
    });

    return data;
  } catch (error) {
    console.error('willService: Error in getWill:', error);
    return null;
  }
};

export const deleteWill = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('wills')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('willService: Error deleting will:', error);
      throw error;
    }

    console.log('willService: Will deleted successfully:', id);
    return true;
  } catch (error) {
    console.error('willService: Error in deleteWill:', error);
    return false;
  }
};
