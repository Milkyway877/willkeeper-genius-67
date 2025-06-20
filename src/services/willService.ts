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
  signature?: string;
  user_id?: string;
  // Add structured data fields
  metadata?: any;
  personal_info?: any;
  executors?: any[];
  beneficiaries?: any[];
  guardians?: any[];
  assets?: any;
  specific_bequests?: string;
  residual_estate?: string;
  final_arrangements?: string;
  document_text?: string;
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

// Helper function to extract structured data from content
const extractStructuredData = (willData: any) => {
  let structuredData = {
    personal_info: {},
    executors: [],
    beneficiaries: [],
    guardians: [],
    assets: {},
    specific_bequests: '',
    residual_estate: '',
    final_arrangements: '',
    document_text: '',
    signature: null
  };

  // Handle nested willContent structure (old format)
  if (willData.willContent) {
    const { willContent } = willData;
    
    structuredData.personal_info = willContent.personalInfo || {};
    structuredData.executors = willContent.executors || [];
    structuredData.beneficiaries = willContent.beneficiaries || [];
    structuredData.guardians = willContent.guardians || [];
    structuredData.assets = willContent.assets || {};
    structuredData.specific_bequests = willContent.specificBequests || '';
    structuredData.residual_estate = willContent.residualEstate || '';
    structuredData.final_arrangements = willContent.finalArrangements || '';
    structuredData.signature = willData.signature || null;
  }
  // Handle flat structure from TemplateWillEditor/DocumentWillEditor (new format)
  else if (willData.formValues) {
    const { formValues } = willData;
    
    structuredData.personal_info = {
      fullName: formValues.fullName || '',
      dateOfBirth: formValues.dateOfBirth || '',
      address: formValues.homeAddress || '',
      email: formValues.email || '',
      phone: formValues.phoneNumber || ''
    };
    structuredData.executors = formValues.executors || [];
    structuredData.beneficiaries = formValues.beneficiaries || [];
    structuredData.guardians = formValues.guardians || [];
    structuredData.assets = formValues.assets || {};
    structuredData.specific_bequests = formValues.specificBequests || '';
    structuredData.residual_estate = formValues.residualEstate || '';
    structuredData.final_arrangements = [
      formValues.funeralPreferences,
      formValues.memorialService,
      formValues.obituary,
      formValues.charitableDonations,
      formValues.specialInstructions
    ].filter(Boolean).join('\n\n') || '';
    structuredData.document_text = willData.textContent || '';
    structuredData.signature = willData.signature || null;
  }
  // Handle direct flat structure (for backward compatibility)
  else if (willData.fullName || willData.personalInfo || willData.executors || willData.beneficiaries) {
    if (willData.fullName) {
      // Direct flat structure
      structuredData.personal_info = {
        fullName: willData.fullName || '',
        dateOfBirth: willData.dateOfBirth || '',
        address: willData.homeAddress || '',
        email: willData.email || '',
        phone: willData.phoneNumber || ''
      };
      structuredData.executors = willData.executors || [];
      structuredData.beneficiaries = willData.beneficiaries || [];
      structuredData.final_arrangements = [
        willData.funeralPreferences,
        willData.memorialService,
        willData.obituary,
        willData.charitableDonations,
        willData.specialInstructions
      ].filter(Boolean).join('\n\n') || '';
    } else {
      // Old nested structure
      structuredData.personal_info = willData.personalInfo || {};
      structuredData.executors = willData.executors || [];
      structuredData.beneficiaries = willData.beneficiaries || [];
      structuredData.guardians = willData.guardians || [];
      structuredData.assets = willData.assets || {};
      structuredData.specific_bequests = willData.specificBequests || '';
      structuredData.residual_estate = willData.residualEstate || '';
      structuredData.final_arrangements = willData.finalArrangements || '';
      structuredData.signature = willData.signature || null;
    }
  }

  return structuredData;
};

// Helper function to reconstruct data for the frontend
const reconstructWillData = (dbWill: any) => {
  // If we have structured data in the database, use it
  if (dbWill.personal_info || dbWill.executors || dbWill.beneficiaries) {
    return {
      ...dbWill,
      // Reconstruct flat structure for DocumentWillEditor
      fullName: dbWill.personal_info?.fullName || '',
      dateOfBirth: dbWill.personal_info?.dateOfBirth || '',
      homeAddress: dbWill.personal_info?.address || '',
      email: dbWill.personal_info?.email || '',
      phoneNumber: dbWill.personal_info?.phone || '',
      executors: dbWill.executors || [],
      beneficiaries: dbWill.beneficiaries || [],
      guardians: dbWill.guardians || [],
      assets: dbWill.assets || {},
      specificBequests: dbWill.specific_bequests || '',
      residualEstate: dbWill.residual_estate || '',
      funeralPreferences: '',
      memorialService: '',
      obituary: '',
      charitableDonations: '',
      specialInstructions: '',
      signature: dbWill.signature,
      documentText: dbWill.document_text || '',
      // Also reconstruct nested structure for compatibility
      willContent: {
        personalInfo: dbWill.personal_info || {},
        executors: dbWill.executors || [],
        beneficiaries: dbWill.beneficiaries || [],
        guardians: dbWill.guardians || [],
        assets: dbWill.assets || {},
        specificBequests: dbWill.specific_bequests || '',
        residualEstate: dbWill.residual_estate || '',
        finalArrangements: dbWill.final_arrangements || ''
      }
    };
  }
  
  // Fallback to parsing from content field (old format)
  let parsedContent = {};
  if (dbWill.content) {
    try {
      parsedContent = JSON.parse(dbWill.content);
    } catch (e) {
      console.log('Could not parse will content:', e);
    }
  }
  
  // Extract from parsed content if available
  if (parsedContent.formValues) {
    const { formValues } = parsedContent;
    return {
      ...dbWill,
      fullName: formValues.fullName || '',
      dateOfBirth: formValues.dateOfBirth || '',
      homeAddress: formValues.homeAddress || '',
      email: formValues.email || '',
      phoneNumber: formValues.phoneNumber || '',
      executors: formValues.executors || [],
      beneficiaries: formValues.beneficiaries || [],
      funeralPreferences: formValues.funeralPreferences || '',
      memorialService: formValues.memorialService || '',
      obituary: formValues.obituary || '',
      charitableDonations: formValues.charitableDonations || '',
      specialInstructions: formValues.specialInstructions || '',
      signature: parsedContent.signature || null,
      documentText: parsedContent.textContent || '',
      willContent: {
        personalInfo: {
          fullName: formValues.fullName || '',
          dateOfBirth: formValues.dateOfBirth || '',
          address: formValues.homeAddress || '',
          email: formValues.email || '',
          phone: formValues.phoneNumber || ''
        },
        executors: formValues.executors || [],
        beneficiaries: formValues.beneficiaries || [],
        guardians: [],
        assets: {},
        specificBequests: '',
        residualEstate: '',
        finalArrangements: [
          formValues.funeralPreferences,
          formValues.memorialService,
          formValues.obituary,
          formValues.charitableDonations,
          formValues.specialInstructions
        ].filter(Boolean).join('\n\n') || ''
      }
    };
  }
  
  return {
    ...dbWill,
    willContent: {
      personalInfo: {},
      executors: [],
      beneficiaries: [],
      guardians: [],
      assets: {},
      specificBequests: '',
      residualEstate: '',
      finalArrangements: ''
    },
    signature: null,
    documentText: ''
  };
};

// Helper function to initialize countdown for first will
const initializeWillCountdown = async () => {
  const existingCountdown = localStorage.getItem('willCountdownStart');
  if (!existingCountdown) {
    // This is the first will, start the countdown
    const countdownStart = new Date();
    localStorage.setItem('willCountdownStart', countdownStart.toISOString());
    console.log('Started will countdown for first will creation');
  }
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
    
    // Reconstruct data for frontend consumption
    return (data || []).map(reconstructWillData);
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
    
    // Reconstruct data for frontend consumption
    return reconstructWillData(data);
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
    
    // Check if this is the user's first will
    const { data: existingWills } = await supabase
      .from('wills')
      .select('id')
      .eq('user_id', session.user.id)
      .limit(1);

    const isFirstWill = !existingWills || existingWills.length === 0;

    // Parse content to extract structured data
    let contentData = {};
    if (will.content) {
      try {
        contentData = JSON.parse(will.content);
      } catch (e) {
        console.error('Error parsing will content:', e);
      }
    }

    // Extract structured data
    const structuredData = extractStructuredData(contentData);
    
    console.log('Creating will with structured data:', structuredData);

    const willToCreate = {
      title: will.title,
      status: will.status || 'draft',
      template_type: will.template_type || 'custom',
      ai_generated: will.ai_generated || false,
      document_url: will.document_url || '',
      content: will.content || '',
      user_id: session.user.id,
      subscription_required_after: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      // Add structured data columns
      metadata: { created_method: 'editor', version: '2.0' },
      personal_info: structuredData.personal_info,
      executors: structuredData.executors,
      beneficiaries: structuredData.beneficiaries,
      guardians: structuredData.guardians,
      assets: structuredData.assets,
      specific_bequests: structuredData.specific_bequests,
      residual_estate: structuredData.residual_estate,
      final_arrangements: structuredData.final_arrangements,
      document_text: structuredData.document_text,
      signature: structuredData.signature
    };
    
    console.log('Creating will with data:', willToCreate);
    
    const { data, error } = await supabase
      .from('wills')
      .insert(willToCreate)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating will:', error);
      throw new Error(`Failed to create will: ${error.message}`);
    }
    
    // Initialize countdown if this is the first will
    if (isFirstWill && data) {
      await initializeWillCountdown();
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
    
    return reconstructWillData(data);
  } catch (error) {
    console.error('Error in createWill:', error);
    throw error;
  }
};

export const updateWill = async (id: string, updates: Partial<Will>): Promise<Will | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      throw new Error('You must be logged in to update a will');
    }

    // Parse content to extract structured data if content is being updated
    let structuredUpdates = {};
    if (updates.content) {
      try {
        const contentData = JSON.parse(updates.content);
        const structuredData = extractStructuredData(contentData);
        structuredUpdates = {
          personal_info: structuredData.personal_info,
          executors: structuredData.executors,
          beneficiaries: structuredData.beneficiaries,
          guardians: structuredData.guardians,
          assets: structuredData.assets,
          specific_bequests: structuredData.specific_bequests,
          residual_estate: structuredData.residual_estate,
          final_arrangements: structuredData.final_arrangements,
          document_text: structuredData.document_text,
          signature: structuredData.signature
        };
        console.log('Updating will with structured data:', structuredUpdates);
      } catch (e) {
        console.error('Error parsing will content for update:', e);
      }
    }

    const updatedWill = {
      ...updates,
      ...structuredUpdates,
      updated_at: new Date().toISOString()
    };

    console.log('Updating will with data:', updatedWill);

    const { data, error } = await supabase
      .from('wills')
      .update(updatedWill)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating will:', error);
      throw new Error(`Failed to update will: ${error.message}`);
    }
    
    try {
      await createSystemNotification('will_updated', {
        title: 'Will Updated',
        description: `Your will "${data.title}" has been updated successfully.`
      });
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }
    
    return reconstructWillData(data);
  } catch (error) {
    console.error('Error in updateWill:', error);
    throw error;
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

    console.log(`Fetching documents for will_id: ${willId} and user_id: ${session.user.id}`);
    
    // Query the will_documents table directly
    const { data, error } = await supabase
      .from('will_documents')
      .select('*')
      .eq('will_id', willId)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching will documents:', error);
      return [];
    }
    
    console.log('Documents retrieved:', data);
    return data || [];
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
    
    // Save document metadata in will_documents table
    const documentData = {
      will_id: willId,
      user_id: session.user.id,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      file_type: file.type
    };
    
    console.log('Saving document metadata to will_documents:', documentData);
    
    const { data, error } = await supabase
      .from('will_documents')
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
    
    console.log('Document metadata saved to will_documents successfully:', data);
    
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
    
    return data;
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
    
    // Delete the file from storage
    const { error: storageError } = await supabase.storage
      .from('future-documents')
      .remove([document.file_path]);
      
    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue anyway to try to clean up the database entry
    } else {
      console.log('File deleted from storage successfully');
    }
    
    // Delete the document metadata from will_documents table
    const { error } = await supabase
      .from('will_documents')
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

// Helper function to initialize countdown for first will

</edits_to_apply>
