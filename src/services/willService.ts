
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/database';
import { getCurrentUserId } from '@/utils/authUtils';

export interface Will {
  id: string;
  user_id: string;
  title: string | null;
  content: string | null;
  created_at: string | null;
  updated_at: string | null;
  status: 'active' | 'draft' | 'completed';
  template_type?: string;
  ai_generated?: boolean;
  document_url?: string;
  signature?: string;
}

export interface WillDocument {
  id: string;
  will_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string | null;
  updated_at: string | null;
}

// Fetch all wills for the current user
export const getWills = async (): Promise<Will[]> => {
  try {
    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching wills:', error);
    return [];
  }
};

// Fetch a single will by ID
export const getWill = async (id: string): Promise<Will | null> => {
  try {
    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching will:', error);
    return null;
  }
};

// Create a new will
export const createWill = async (will: Partial<Omit<Will, 'id' | 'created_at' | 'updated_at' | 'user_id'>>): Promise<Will> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User must be authenticated to create a will");
    }
    
    // Ensure status is one of the allowed values
    let status: 'active' | 'draft' | 'completed' = 'draft';
    if (will.status === 'active' || will.status === 'completed') {
      status = will.status;
    }
    
    const willWithUserId = {
      ...will,
      user_id: user.id,
      status
    };
    
    const { data, error } = await supabase
      .from('wills')
      .insert(willWithUserId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating will:', error);
    throw error;
  }
};

// Update an existing will
export const updateWill = async (willId: string, willData: Partial<Omit<Will, 'id' | 'created_at' | 'updated_at' | 'user_id'>>): Promise<Will> => {
  try {
    // Ensure status is one of the allowed values if provided
    let updatedData = { ...willData };
    
    if (updatedData.status && 
        updatedData.status !== 'active' && 
        updatedData.status !== 'draft' && 
        updatedData.status !== 'completed') {
      updatedData.status = 'draft'; // Default to draft if invalid status
    }
    
    const { data, error } = await supabase
      .from('wills')
      .update(updatedData)
      .eq('id', willId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating will:', error);
    throw error;
  }
};

// Delete a will
export const deleteWill = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('wills')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting will:', error);
    return false;
  }
};

// Check if a will has attached videos
export const willHasVideos = async (willId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('future_messages')
      .select('id')
      .eq('message_type', 'metadata')
      .like('content', `%"will_id":"${willId}"%`)
      .like('content', '%"video_path"%')
      .limit(1);
      
    if (error) throw error;
    return data !== null && data.length > 0;
  } catch (error) {
    console.error('Error checking for will videos:', error);
    return false;
  }
};

// Check if a will has attached documents
export const willHasDocuments = async (willId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('future_messages')
      .select('id')
      .eq('message_type', 'metadata')
      .like('content', `%"will_id":"${willId}"%`)
      .like('content', '%"doc_path"%')
      .limit(1);
      
    if (error) throw error;
    return data !== null && data.length > 0;
  } catch (error) {
    console.error('Error checking for will documents:', error);
    return false;
  }
};

// Upload a document for a will
export const uploadWillDocument = async (
  willId: string,
  file: File,
  onUploadProgress?: (progress: number) => void
): Promise<WillDocument | null> => {
  try {
    // Create a unique file name
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `wills/${willId}/${fileName}`;

    // Upload the file - create options object conditionally
    let uploadOptions: Record<string, any> = {
      cacheControl: '3600',
      upsert: false
    };
    
    // Only add onUploadProgress if it's provided
    if (onUploadProgress) {
      uploadOptions.onUploadProgress = (event: any) => {
        const progress = Math.round((event.loaded / event.total) * 100);
        onUploadProgress(progress);
      };
    }

    const { data, error } = await supabase.storage
      .from('will_documents')
      .upload(filePath, file, uploadOptions);

    if (error) {
      throw error;
    }

    // Get the file size
    const fileSize = file.size;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User must be authenticated to upload a document");
    }

    // Current timestamp for both created_at and updated_at
    const timestamp = new Date().toISOString();

    // Create a new will document record
    const { data: willDocument, error: willDocumentError } = await supabase
      .from('will_documents')
      .insert({
        will_id: willId,
        user_id: user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: fileSize,
        file_type: file.type,
        created_at: timestamp,
        updated_at: timestamp
      })
      .select()
      .single();

    if (willDocumentError) {
      throw willDocumentError;
    }

    return willDocument;
  } catch (error) {
    console.error('Error uploading will document:', error);
    return null;
  }
};

// Get all documents for a will
export const getWillDocuments = async (willId: string): Promise<WillDocument[]> => {
  try {
    const { data, error } = await supabase
      .from('will_documents')
      .select('*')
      .eq('will_id', willId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching will documents:', error);
    return [];
  }
};

// Delete a document for a will
export const deleteWillDocument = async (document: WillDocument): Promise<boolean> => {
  try {
    // Delete the file from storage
    const { error: storageError } = await supabase.storage
      .from('will_documents')
      .remove([document.file_path]);

    if (storageError) {
      throw storageError;
    }

    // Delete the will document record
    const { error: willDocumentError } = await supabase
      .from('will_documents')
      .delete()
      .eq('id', document.id);

    if (willDocumentError) {
      throw willDocumentError;
    }

    return true;
  } catch (error) {
    console.error('Error deleting will document:', error);
    return false;
  }
};

// Get the URL for a document
export const getDocumentUrl = async (document: WillDocument): Promise<string | null> => {
  try {
    const { data } = supabase.storage
      .from('will_documents')
      .getPublicUrl(document.file_path);

    return data?.publicUrl || null;
  } catch (error) {
    console.error('Error getting document URL:', error);
    return null;
  }
};
