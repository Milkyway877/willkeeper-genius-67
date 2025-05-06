import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  FileText, 
  Loader2, 
  Download, 
  Trash2, 
  Upload, 
  File,
  ImageIcon,
  FileTextIcon,
  FileSpreadsheet,
  FileX
} from 'lucide-react';
import { 
  Dialog,
  DialogContent, 
  DialogDescription, 
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface WillDocument {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  will_id: string;
  created_at: string;
  updated_at: string;
}

interface WillMetadataDocument {
  id: string;
  content: string;
  created_at: string;
  message_url: string;
  title: string;
}

interface WillAttachedDocumentsSectionProps {
  willId: string;
}

export function WillAttachedDocumentsSection({ willId }: WillAttachedDocumentsSectionProps) {
  const [documents, setDocuments] = useState<WillDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Fetch documents when willId changes or refresh is triggered
  useEffect(() => {
    fetchDocuments();
  }, [willId, refreshTrigger]);
  
  const fetchDocuments = async () => {
    if (!willId) return;
    
    try {
      setIsLoading(true);
      console.log(`Fetching documents for will ID: ${willId}`);
      
      // Query future_messages table for metadata entries that link documents to this will
      const { data: metadataEntries, error } = await supabase
        .from('future_messages')
        .select('id, content, created_at, message_url, title')
        .eq('message_type', 'metadata')
        .like('content', `%"will_id":"${willId}"%`)
        .like('content', '%"doc_path"%')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      if (!metadataEntries || metadataEntries.length === 0) {
        setDocuments([]);
        setIsLoading(false);
        return;
      }
      
      console.log(`Retrieved ${metadataEntries.length} document entries`);
      
      // Transform metadata entries into document format
      const transformedDocs = metadataEntries.map((entry: WillMetadataDocument) => {
        // Parse the content to extract document path
        let parsedContent;
        try {
          parsedContent = JSON.parse(entry.content);
        } catch (e) {
          console.error('Error parsing document metadata content:', e);
          parsedContent = { doc_path: entry.message_url };
        }
        
        const filePath = parsedContent.doc_path;
        const fileName = filePath.split('/').pop() || 'Document';
        const fileExtension = fileName.split('.').pop() || '';
        
        // Determine file type based on extension
        let fileType = 'application/octet-stream';
        if (['pdf'].includes(fileExtension.toLowerCase())) {
          fileType = 'application/pdf';
        } else if (['doc', 'docx'].includes(fileExtension.toLowerCase())) {
          fileType = 'application/msword';
        } else if (['xls', 'xlsx'].includes(fileExtension.toLowerCase())) {
          fileType = 'application/vnd.ms-excel';
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension.toLowerCase())) {
          fileType = `image/${fileExtension.toLowerCase()}`;
        }
        
        return {
          id: entry.id,
          file_name: fileName,
          file_type: fileType,
          file_size: 0, // Size not stored in metadata
          file_path: filePath,
          will_id: willId,
          created_at: entry.created_at,
          updated_at: entry.created_at
        };
      });
      
      setDocuments(transformedDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Could not load attached documents',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle document upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploadError(null);
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      console.log(`Starting upload for file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
      
      // Upload file to storage
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${willId}/${fileName}`;
      
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const increment = Math.floor(Math.random() * 10) + 1;
          return Math.min(prev + increment, 95);
        });
      }, 300);
      
      // Upload the file to storage
      const { data, error: uploadError } = await supabase.storage
        .from('future-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) throw uploadError;
      
      // Create metadata entry in future_messages
      const { data: messageData, error: messageError } = await supabase
        .from('future_messages')
        .insert({
          user_id: (await supabase.auth.getSession()).data.session?.user.id,
          title: `Document for Will: ${willId}`,
          recipient_name: 'Will Document',
          recipient_email: '',
          message_type: 'metadata',
          preview: `Document for Will: ${willId}`,
          content: JSON.stringify({ will_id: willId, doc_path: filePath }),
          message_url: filePath,
          status: 'scheduled' as const,
          delivery_type: 'posthumous' as const,
          delivery_date: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'document' as const
        })
        .select()
        .single();
      
      if (messageError) throw messageError;
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast({
        title: 'Document uploaded',
        description: `${file.name} has been added to your will`
      });
      
      // Refresh document list
      setRefreshTrigger(prev => prev + 1);
      setDialogOpen(false);
      
    } catch (error) {
      console.error('Error uploading document:', error);
      setUploadError('An unexpected error occurred. Please try again.');
      toast({
        title: 'Upload error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Function to handle document deletion
  const handleDeleteDocument = async (document: WillDocument) => {
    try {
      console.log(`Deleting document: ${document.id}, file name: ${document.file_name}`);
      
      // Delete the metadata entry from future_messages table
      const { error: dbError } = await supabase
        .from('future_messages')
        .delete()
        .eq('id', document.id);
        
      if (dbError) throw dbError;
      
      // Then try to delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('future-attachments')
        .remove([document.file_path]);
        
      // We don't throw on storage error since the DB record is the most important
      if (storageError) {
        console.warn('Could not delete document file from storage:', storageError);
      }
      
      toast({
        title: 'Document deleted',
        description: `${document.file_name} has been removed`
      });
      
      // Remove from local state
      setDocuments(prev => prev.filter(doc => doc.id !== document.id));
      
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Delete error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };
  
  // Function to download document
  const handleDownloadDocument = async (document: WillDocument) => {
    try {
      console.log(`Getting download URL for document: ${document.file_name}`);
      
      const { data } = supabase.storage
        .from('future-attachments')
        .getPublicUrl(document.file_path);
      
      if (!data || !data.publicUrl) {
        throw new Error('Could not generate download URL');
      }
      
      // Create a temporary link and trigger download
      const a = window.document.createElement('a');
      a.href = data.publicUrl;
      a.download = document.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      console.log('Download initiated');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Download error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };
  
  // Function to get icon based on file type
  const getFileIcon = (document: WillDocument) => {
    const fileType = document.file_type.toLowerCase();
    const fileName = document.file_name.toLowerCase();
    
    if (fileType.includes('image')) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    } else if (fileType.includes('pdf')) {
      return <FileX className="h-8 w-8 text-red-500" />;
    } else if (fileType.includes('excel') || fileType.includes('sheet') || fileName.endsWith('xlsx') || fileName.endsWith('xls')) {
      return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    } else if (fileType.includes('word') || fileType.includes('document') || fileName.endsWith('docx') || fileName.endsWith('doc')) {
      return <FileTextIcon className="h-8 w-8 text-blue-500" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
    }
  };
  
  // Function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center">
          <FileText className="mr-2 h-5 w-5 text-blue-500" />
          Supporting Documents
        </CardTitle>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Upload className="mr-1 h-4 w-4" />
              Add Document
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Supporting Document</DialogTitle>
              <DialogDescription>
                Upload important documents to support your will.
                These might include property deeds, insurance policies, or any supporting materials.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">Drag and drop files here or click to browse</p>
                <p className="text-xs text-gray-500">
                  Supports PDF, Word, Excel, and image files up to 10MB
                </p>
              </div>
              
              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Uploading document...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                </div>
              )}
              
              {uploadError && (
                <Alert variant="destructive">
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 text-willtank-600 animate-spin" />
            <span className="ml-2">Loading documents...</span>
          </div>
        ) : documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map(document => (
              <div
                key={document.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-white rounded-md border">
                    {getFileIcon(document)}
                  </div>
                  
                  <div>
                    <p className="font-medium">{document.file_name}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{formatFileSize(document.file_size)}</span>
                      <span>
                        {format(new Date(document.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadDocument(document)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteDocument(document)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Alert className="bg-blue-50 border-blue-100">
            <AlertDescription className="text-blue-700">
              No supporting documents have been attached to this will yet. 
              Click "Add Document" to upload important papers related to your will.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
