
import { supabase } from '@/integrations/supabase/client';

/**
 * Generate a UUID v4 string using the Web Crypto API
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

export const uploadWillDocument = async (willId: string, file: File, description?: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${willId}/${generateUUID()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('will_documents')
      .upload(filePath, file);
      
    if (error) throw error;

    const { data: document, error: dbError } = await supabase
      .from('will_documents')
      .insert({
        will_id: willId,
        name: file.name,
        description: description,
        document_type: fileExt,
        file_path: filePath,
        file_size: file.size,
        content_type: file.type
      })
      .select()
      .single();
      
    if (dbError) throw dbError;
    
    return document;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

export const uploadWillVideo = async (willId: string, videoBlob: Blob) => {
  try {
    const filePath = `${willId}/${generateUUID()}.webm`;
    
    const { data, error } = await supabase.storage
      .from('will_videos')
      .upload(filePath, videoBlob, {
        contentType: 'video/webm'
      });
      
    if (error) throw error;

    const { data: video, error: dbError } = await supabase
      .from('will_videos')
      .insert({
        will_id: willId,
        file_path: filePath
      })
      .select()
      .single();
      
    if (dbError) throw dbError;
    
    return video;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};

export const getWillDocuments = async (willId: string) => {
  try {
    const { data, error } = await supabase
      .from('will_documents')
      .select('*')
      .eq('will_id', willId);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
};

export const getWillVideo = async (willId: string) => {
  try {
    const { data, error } = await supabase
      .from('will_videos')
      .select('*')
      .eq('will_id', willId)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error getting video:', error);
    throw error;
  }
};
