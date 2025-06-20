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
  signature?: string;
}

export interface CreateWillData {
  title: string;
  content: string;
  status: 'draft' | 'active' | 'archived';
  document_url?: string;
  template_type?: string;
  ai_generated?: boolean;
  metadata?: any;
  signature?: string;
  updated_at?: string;
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
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export const getWillDocuments = async (willId: string): Promise<WillDocument[]> => {
  // Placeholder implementation
  console.log('getWillDocuments not fully implemented for will:', willId);
  return [];
};

export const deleteWillDocument = async (document: WillDocument): Promise<boolean> => {
  // Placeholder implementation
  console.log('deleteWillDocument not fully implemented for document:', document.id);
  return false;
};

export const getDocumentUrl = async (document: WillDocument): Promise<string | null> => {
  // Placeholder implementation
  console.log('getDocumentUrl not fully implemented for document:', document.file_name);
  return null;
};

export const uploadWillDocument = async (willId: string, file: File, onProgress?: (progress: number) => void): Promise<WillDocument | null> => {
  // Placeholder implementation
  console.log('uploadWillDocument not fully implemented for will:', willId, 'file:', file.name);
  if (onProgress) onProgress(100);
  return null;
};

export const createWill = async (willData: CreateWillData): Promise<Will | null> => {
  try {
    console.log('willService: Creating will with enhanced data structure:', {
      title: willData.title,
      contentLength: willData.content?.length,
      status: willData.status,
      template_type: willData.template_type,
      hasMetadata: !!willData.metadata,
      hasSignature: !!willData.signature
    });

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Validate content structure
    let parsedContent;
    try {
      parsedContent = JSON.parse(willData.content);
      console.log('willService: Parsed content structure:', Object.keys(parsedContent));
    } catch (parseError) {
      console.warn('willService: Content is not JSON, treating as plain text');
      parsedContent = { documentText: willData.content };
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
          template_type: willData.template_type || 'comprehensive',
          ai_generated: willData.ai_generated || false,
          metadata: willData.metadata || null,
          signature: willData.signature || null
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('willService: Database error during will creation:', error);
      
      // Provide more specific error messages
      if (error.code === '23505') {
        throw new Error('A will with this title already exists. Please choose a different title.');
      } else if (error.code === '42501') {
        throw new Error('Permission denied. Please ensure you are logged in.');
      } else if (error.message?.includes('content')) {
        throw new Error('Invalid content format. Please try again.');
      } else {
        throw new Error(`Database error: ${error.message}`);
      }
    }

    console.log('willService: Will created successfully:', {
      id: data.id,
      title: data.title,
      contentPreview: data.content?.substring(0, 100),
      status: data.status,
      hasSignature: !!data.signature
    });

    return data;
  } catch (error) {
    console.error('willService: Error in createWill:', error);
    
    // Re-throw with better error context
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred while creating your will.');
    }
  }
};

export const updateWill = async (id: string, willData: Partial<CreateWillData>): Promise<Will | null> => {
  try {
    console.log('willService: Updating will with enhanced structure:', { 
      id, 
      hasContent: !!willData.content,
      hasSignature: !!willData.signature,
      status: willData.status
    });

    // Validate content if provided
    if (willData.content) {
      try {
        const parsedContent = JSON.parse(willData.content);
        console.log('willService: Update content structure validated:', Object.keys(parsedContent));
      } catch (parseError) {
        console.warn('willService: Update content is not JSON, treating as plain text');
      }
    }

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
      console.error('willService: Database error during will update:', error);
      
      if (error.code === '42501') {
        throw new Error('Permission denied. You can only update your own wills.');
      } else if (error.code === '23503') {
        throw new Error('Will not found or already deleted.');
      } else {
        throw new Error(`Update error: ${error.message}`);
      }
    }

    console.log('willService: Will updated successfully:', {
      id: data.id,
      title: data.title,
      status: data.status,
      hasSignature: !!data.signature
    });
    
    return data;
  } catch (error) {
    console.error('willService: Error in updateWill:', error);
    
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred while updating your will.');
    }
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
