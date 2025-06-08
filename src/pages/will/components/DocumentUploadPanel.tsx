import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { 
  File, 
  FileText, 
  Upload, 
  X, 
  RefreshCw, 
  Check,
  AlertCircle,
  Eye,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DocumentUploadPanelProps {
  willId: string;
  onDocumentsUploaded: (filePaths: string[]) => void;
  onFinalize: () => void;
  isProcessing: boolean;
  progress: number;
}

export function DocumentUploadPanel({ 
  willId, 
  onDocumentsUploaded, 
  onFinalize,
  isProcessing,
  progress
}: DocumentUploadPanelProps) {
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{
    id: string;
    name: string;
    path: string;
    size: string;
  }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to upload documents.",
        variant: "destructive"
      });
      return;
    }

    const files = Array.from(e.target.files);
    setIsUploading(true);
    
    try {
      const newDocuments = [];
      
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds the 10MB limit.`,
            variant: "destructive"
          });
          continue;
        }
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        // Use user ID as folder structure for RLS compliance
        const filePath = `${userId}/${fileName}`;
        
        console.log('Uploading to bucket: will_documents, path:', filePath);

        // Upload to will_documents bucket with user ID as folder
        const { error: uploadError } = await supabase.storage
          .from('will_documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) {
          console.error('Error uploading document:', uploadError);
          toast({
            title: "Upload Failed",
            description: `Could not upload ${file.name}. Please try again.`,
            variant: "destructive"
          });
          continue;
        }

        // Save metadata using the edge function
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const response = await fetch(`${supabase.supabaseUrl}/functions/v1/will-media-manager`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session?.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'save_document',
              will_id: willId,
              file_name: file.name,
              file_path: filePath,
              file_size: file.size,
              file_type: file.type
            })
          });

          if (!response.ok) {
            throw new Error('Failed to save document metadata');
          }

          const result = await response.json();
          if (!result.success) {
            throw new Error(result.error || 'Failed to save document metadata');
          }
        } catch (metadataError) {
          console.error('Error saving document metadata:', metadataError);
          // Try to clean up uploaded file
          await supabase.storage.from('will_documents').remove([filePath]);
          toast({
            title: "Metadata Save Failed",
            description: `Could not save metadata for ${file.name}`,
            variant: "destructive"
          });
          continue;
        }
        
        const sizeInKB = file.size / 1024;
        const formattedSize = sizeInKB < 1024 
          ? `${sizeInKB.toFixed(1)} KB`
          : `${(sizeInKB / 1024).toFixed(1)} MB`;
        
        newDocuments.push({
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          path: filePath,
          size: formattedSize
        });
      }
      
      if (newDocuments.length > 0) {
        setUploadedDocuments(prev => [...prev, ...newDocuments]);
        
        toast({
          title: "Documents Uploaded",
          description: `Successfully uploaded ${newDocuments.length} document(s).`
        });
        
        const allDocuments = [...uploadedDocuments, ...newDocuments];
        onDocumentsUploaded(allDocuments.map(doc => doc.path));
      }
    } catch (error) {
      console.error('Error processing documents:', error);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during upload.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveDocument = async (id: string, path: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('will_documents')
        .remove([path]);
        
      if (storageError) {
        console.warn('Could not delete from storage:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('will_documents')
        .delete()
        .eq('file_path', path);

      if (dbError) {
        console.error('Error deleting from database:', dbError);
        toast({
          title: "Delete Failed",
          description: "Could not delete the document. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      setUploadedDocuments(prev => {
        const filtered = prev.filter(doc => doc.id !== id);
        onDocumentsUploaded(filtered.map(doc => doc.path));
        return filtered;
      });
      
      toast({
        title: "Document Removed",
        description: "Document has been removed successfully."
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Delete Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  
  const handlePreviewDocument = async (path: string, name: string) => {
    try {
      const { data } = supabase.storage
        .from('will_documents')
        .getPublicUrl(path);
      
      if (data?.publicUrl) {
        window.open(data.publicUrl, '_blank');
      } else {
        toast({
          title: "Preview Failed",
          description: "Could not generate preview link",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error previewing document:', error);
      toast({
        title: "Preview Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <FileText className="mr-2 h-5 w-5 text-blue-500" />
          Upload Supporting Documents
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Upload important documents that should accompany your will and video testament. 
          These might include property deeds, insurance policies, or any supporting materials.
        </p>
        
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handleBrowseClick}
        >
          <input 
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileInputChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          />
          <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">Drag and drop files here or click to browse</p>
          <p className="text-xs text-gray-500">
            Supports PDF, Word, Excel, and image files up to 10MB
          </p>
        </div>
        
        {isUploading && (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="animate-spin mr-2 h-5 w-5 text-willtank-600" />
            <span>Uploading documents...</span>
          </div>
        )}
        
        {uploadedDocuments.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Uploaded Documents ({uploadedDocuments.length})</h3>
            <div className="space-y-2">
              {uploadedDocuments.map(doc => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200"
                >
                  <div className="flex items-center">
                    <File className="h-4 w-4 text-blue-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.size}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreviewDocument(doc.path, doc.name)}
                    >
                      <Eye className="h-4 w-4 text-gray-500" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(doc.id, doc.path)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {uploadedDocuments.length === 0 && !isUploading && (
          <div className="bg-amber-50 border border-amber-100 rounded-md p-3 text-sm">
            <div className="flex">
              <AlertCircle className="h-4 w-4 text-amber-600 mr-2 mt-0.5" />
              <p className="text-amber-800">
                You haven't uploaded any supporting documents yet. You can proceed without documents, but they can provide valuable additional context to your will.
              </p>
            </div>
          </div>
        )}
        
        {isProcessing ? (
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span>Finalizing your will attachments...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        ) : (
          <div className="mt-6 flex justify-end">
            <Button onClick={onFinalize}>
              {uploadedDocuments.length > 0 ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Finalize Video & Documents
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Skip Documents & Finalize
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
