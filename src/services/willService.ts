import { supabase } from "@/integrations/supabase/client";
import { createSystemNotification } from "./notificationService";

export interface Will {
  id: string;
  title: string;
  status: string;
  document_url: string;
  created_at: string;
  updated_at: string;
  template_type?: string;
  ai_generated?: boolean;
  content?: string;
  signature?: string; // Added signature property
}

export interface WillExecutor {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
  will_id?: string;
}

export interface WillBeneficiary {
  id: string;
  name: string;
  relationship: string;
  percentage?: number;
  created_at: string;
  will_id?: string;
}

export interface WillDocument {
  id: string;
  will_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
  updated_at?: string;
}

// Track in-progress operations to prevent duplicates
const inProgressOperations = {
  creatingDraft: false,
  lastDraftTime: 0,
};

export const getWills = async (): Promise<Will[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return [];
    }

    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching wills:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getWills:', error);
    return [];
  }
};

export const getWill = async (id: string): Promise<Will | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();
      
    if (error) {
      console.error('Error fetching will:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getWill:', error);
    return null;
  }
};

export const createWill = async (will: Omit<Will, 'id' | 'created_at' | 'updated_at'>): Promise<Will | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      throw new Error('You must be logged in to create a will');
    }
    
    // Check if we're already processing a draft creation request
    // Include a time-based check to avoid long-term lockouts
    const now = Date.now();
    const THROTTLE_TIME = 3000; // 3 seconds
    
    if (will.status === 'draft') {
      if (inProgressOperations.creatingDraft && 
         (now - inProgressOperations.lastDraftTime < THROTTLE_TIME)) {
        console.log('Draft creation in progress, skipping duplicate request');
        return null;
      }
      
      // Set flag to prevent duplicate operations
      inProgressOperations.creatingDraft = true;
      inProgressOperations.lastDraftTime = now;
      
      // Check if there's an existing draft we can use
      const { data: existingDrafts } = await supabase
        .from('wills')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'draft')
        .eq('template_type', will.template_type || '')
        .order('created_at', { ascending: false })
        .limit(1);
      
      // Update existing draft of the same template type if it exists
      if (existingDrafts && existingDrafts.length > 0) {
        const latestDraft = existingDrafts[0];
        const updatedWill = await updateWill(latestDraft.id, {
          ...will,
          status: 'draft',
          updated_at: new Date().toISOString()
        });
        
        inProgressOperations.creatingDraft = false;
        return updatedWill;
      }
    }

    const willToCreate = {
      ...will,
      user_id: session.user.id,
      document_url: will.document_url || '',
      status: will.status || 'draft',
      signature: will.signature || null, // Include signature in the will creation
    };
    
    console.log('Creating will with data:', willToCreate);
    
    const { data, error } = await supabase
      .from('wills')
      .insert(willToCreate)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating will:', error);
      inProgressOperations.creatingDraft = false;
      return null;
    }
    
    if (will.status === 'active') {
      try {
        await createSystemNotification('will_created', {
          title: 'Will Created',
          description: `Your will "${will.title}" has been finalized successfully.`
        });
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }
    }
    
    // Reset the in-progress flag after operation completes
    if (will.status === 'draft') {
      inProgressOperations.creatingDraft = false;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createWill:', error);
    inProgressOperations.creatingDraft = false;
    return null;
  }
};

export const updateWill = async (id: string, updates: Partial<Will>): Promise<Will | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return null;
    }

    const updatedWill = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('wills')
      .update(updatedWill)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating will:', error);
      return null;
    }
    
    await createSystemNotification('will_updated', {
      title: 'Will Updated',
      description: `Your will "${data.title}" has been updated successfully.`
    });
    
    return data;
  } catch (error) {
    console.error('Error in updateWill:', error);
    return null;
  }
};

export const deleteWill = async (id: string): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return false;
    }

    const { data: willToDelete } = await supabase
      .from('wills')
      .select('title')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();
    
    const { error } = await supabase
      .from('wills')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);
      
    if (error) {
      console.error('Error deleting will:', error);
      return false;
    }
    
    if (willToDelete) {
      await createSystemNotification('will_deleted', {
        title: 'Will Deleted',
        description: `Your will "${willToDelete.title}" has been deleted.`
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteWill:', error);
    return false;
  }
};

export const getWillExecutors = async (willId?: string): Promise<WillExecutor[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return [];
    }

    let query = supabase
      .from('will_executors')
      .select('*');
      
    if (willId) {
      query = query.eq('will_id', willId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching executors:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getWillExecutors:', error);
    return [];
  }
};

export const createWillExecutor = async (executor: Omit<WillExecutor, 'id' | 'created_at'>): Promise<WillExecutor | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return null;
    }
    
    const { data, error } = await supabase
      .from('will_executors')
      .insert(executor)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating executor:', error);
      return null;
    }
    
    await createSystemNotification('executor_added', {
      title: 'Executor Added',
      description: `${executor.name} has been added as an executor to your will.`
    });
    
    return data;
  } catch (error) {
    console.error('Error in createWillExecutor:', error);
    return null;
  }
};

export const getWillBeneficiaries = async (willId?: string): Promise<WillBeneficiary[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return [];
    }

    let query = supabase
      .from('will_beneficiaries')
      .select('*');
      
    if (willId) {
      query = query.eq('will_id', willId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching beneficiaries:', error);
      return [];
    }
    
    return (data || []).map(item => ({
      id: item.id,
      name: item.beneficiary_name,
      relationship: item.relationship,
      percentage: item.percentage,
      created_at: item.created_at,
      will_id: item.will_id
    }));
  } catch (error) {
    console.error('Error in getWillBeneficiaries:', error);
    return [];
  }
};

export const createWillBeneficiary = async (beneficiary: Omit<WillBeneficiary, 'id' | 'created_at'>): Promise<WillBeneficiary | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return null;
    }
    
    const dbBeneficiary = {
      beneficiary_name: beneficiary.name,
      relationship: beneficiary.relationship,
      percentage: beneficiary.percentage,
      will_id: beneficiary.will_id
    };
    
    const { data, error } = await supabase
      .from('will_beneficiaries')
      .insert(dbBeneficiary)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating beneficiary:', error);
      return null;
    }
    
    await createSystemNotification('beneficiary_added', {
      title: 'Beneficiary Added',
      description: `${beneficiary.name} has been added as a beneficiary to your will.`
    });
    
    return {
      id: data.id,
      name: data.beneficiary_name,
      relationship: data.relationship,
      percentage: data.percentage,
      created_at: data.created_at,
      will_id: data.will_id
    };
  } catch (error) {
    console.error('Error in createWillBeneficiary:', error);
    return null;
  }
};

export const getWillDocuments = async (willId: string): Promise<WillDocument[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return [];
    }

    // We store documents in a custom table format
    console.log(`Fetching documents for will_id: ${willId} and user_id: ${session.user.id}`);
    
    // Query the future_documents table with a specific prefix for will documents
    const { data, error } = await supabase
      .from('future_messages')
      .select('*')
      .eq('message_type', 'document')
      .eq('user_id', session.user.id)
      .ilike('message_url', `will_docs/${willId}/%`)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching will documents:', error);
      return [];
    }
    
    // Map the future_messages data to our WillDocument format
    const documents: WillDocument[] = data?.map(message => {
      // Extract filename from the message_url path
      const fileName = message.message_url?.split('/').pop() || 'Unknown';
      // Get file extension for type
      const fileType = fileName.includes('.') ? 
        `application/${fileName.split('.').pop()}` : 'application/octet-stream';
      
      return {
        id: message.id,
        will_id: willId,
        user_id: message.user_id,
        file_name: message.title || fileName,
        file_path: message.message_url || '',
        file_size: message.content ? parseInt(message.content) : 0, // Store file size in content field
        file_type: fileType,
        created_at: message.created_at || new Date().toISOString(),
        updated_at: message.updated_at
      };
    }) || [];
    
    console.log('Documents retrieved:', documents);
    return documents;
  } catch (error) {
    console.error('Error in getWillDocuments:', error);
    return [];
  }
};

// Type definition for progress callback
type ProgressCallback = (progress: number) => void;

export const uploadWillDocument = async (
  willId: string, 
  file: File, 
  onProgress?: ProgressCallback
): Promise<WillDocument | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return null;
    }
    
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    // Use will_docs prefix to organize documents by will
    const filePath = `will_docs/${willId}/${fileName}`;
    
    console.log(`Starting upload of ${file.name} (${file.size} bytes) to future-documents bucket with path: ${filePath}`);
    
    // Upload to Supabase Storage - using the existing future-documents bucket
    const uploadOptions = {
      cacheControl: '3600',
      upsert: true
    };
    
    // Upload the file to storage
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('future-documents')
      .upload(filePath, file, uploadOptions);
      
    if (uploadError) {
      console.error('Error uploading will document to storage:', uploadError);
      return null;
    }
    
    console.log('File uploaded to storage successfully:', uploadData);
    
    // Save document metadata in future_messages table
    const documentData = {
      user_id: session.user.id,
      title: file.name,
      recipient_name: 'Will Document',
      recipient_email: '',
      message_type: 'document',
      content: file.size.toString(), // Store file size in content field
      message_url: filePath,
      preview: `Document for will: ${willId}`,
      status: 'scheduled' as const,
      delivery_type: 'posthumous' as const,
      delivery_date: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 100 years in future
      category: 'document' as const
    };
    
    console.log('Saving document metadata to future_messages:', documentData);
    
    const { data, error } = await supabase
      .from('future_messages')
      .insert(documentData)
      .select()
      .single();
      
    if (error) {
      console.error('Error saving will document metadata to database:', error);
      
      // Try to clean up the uploaded file on error
      console.log('Attempting to clean up uploaded file after database error');
      await supabase.storage
        .from('future-documents')
        .remove([filePath]);
        
      return null;
    }
    
    console.log('Document metadata saved to future_messages successfully:', data);
    
    // Create notification after successful upload
    try {
      await createSystemNotification('success', {
        title: 'Document Added',
        description: `Document ${file.name} has been added to your will.`
      });
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue even if notification fails
    }
    
    // Update progress to 100% after successful upload
    if (onProgress) {
      onProgress(100);
    }
    
    // Convert from future_message format to WillDocument format
    const willDocument: WillDocument = {
      id: data.id,
      will_id: willId,
      user_id: data.user_id,
      file_name: data.title || file.name,
      file_path: data.message_url,
      file_size: file.size,
      file_type: file.type,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at
    };
    
    return willDocument;
  } catch (error) {
    console.error('Error in uploadWillDocument:', error);
    
    // Update progress to show failure
    if (onProgress) {
      onProgress(0);
    }
    
    return null;
  }
};

export const deleteWillDocument = async (document: WillDocument): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return false;
    }

    console.log(`Attempting to delete document: ${document.id}, file path: ${document.file_path}`);
    
    // Delete the file from storage - using future-documents bucket
    const { error: storageError } = await supabase.storage
      .from('future-documents')
      .remove([document.file_path]);
      
    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue anyway to try to clean up the database entry
    } else {
      console.log('File deleted from storage successfully');
    }
    
    // Delete the document metadata from future_messages table
    const { error } = await supabase
      .from('future_messages')
      .delete()
      .eq('id', document.id)
      .eq('user_id', session.user.id);
      
    if (error) {
      console.error('Error deleting document metadata from database:', error);
      return false;
    }
    
    console.log('Document metadata deleted from database successfully');
    
    // Create notification after successful deletion
    try {
      await createSystemNotification('info', {
        title: 'Document Removed',
        description: `Document ${document.file_name} has been removed from your will.`
      });
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue even if notification fails
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteWillDocument:', error);
    return false;
  }
};

export const getDocumentUrl = async (document: WillDocument): Promise<string | null> => {
  try {
    console.log(`Getting signed URL for document: ${document.file_path}`);
    
    const { data, error } = await supabase.storage
      .from('future-documents')
      .createSignedUrl(document.file_path, 60); // URL valid for 60 seconds
      
    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }
    
    console.log('Signed URL created successfully');
    return data.signedUrl;
  } catch (error) {
    console.error('Error in getDocumentUrl:', error);
    return null;
  }
};

// Add function to link videos and documents to a will
export const linkAttachmentToWill = async (willId: string, attachmentId: string, attachmentType: 'video' | 'document'): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return false;
    }

    // Update the future_messages table to link the attachment to the will
    const { error } = await supabase
      .from('future_messages')
      .update({ 
        preview: `${attachmentType} attachment for will: ${willId}`,
        category: `will_${attachmentType}` 
      })
      .eq('id', attachmentId)
      .eq('user_id', session.user.id);
      
    if (error) {
      console.error('Error linking attachment to will:', error);
      return false;
    }
    
    console.log(`Successfully linked ${attachmentType} ${attachmentId} to will ${willId}`);
    return true;
  } catch (error) {
    console.error('Error in linkAttachmentToWill:', error);
    return false;
  }
};

// Add function to get attachments for a specific will
export const getWillAttachments = async (willId: string): Promise<{videos: any[], documents: WillDocument[]}> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return { videos: [], documents: [] };
    }

    // Get videos linked to this will
    const { data: videos, error: videoError } = await supabase
      .from('future_messages')
      .select('*')
      .eq('message_type', 'video')
      .eq('user_id', session.user.id)
      .like('preview', `%will: ${willId}%`)
      .order('created_at', { ascending: false });
      
    if (videoError) {
      console.error('Error fetching will videos:', videoError);
    }

    // Get documents using the existing function
    const documents = await getWillDocuments(willId);
    
    return {
      videos: videos || [],
      documents: documents || []
    };
  } catch (error) {
    console.error('Error in getWillAttachments:', error);
    return { videos: [], documents: [] };
  }
};
