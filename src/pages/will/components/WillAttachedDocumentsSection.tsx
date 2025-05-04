
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
import { 
  getWillDocuments, 
  WillDocument, 
  deleteWillDocument, 
  getDocumentUrl,
  uploadWillDocument 
} from '@/services/willService';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Fetch documents when willId changes or refresh is triggered
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!willId) return;
      
      try {
        setIsLoading(true);
        const docs = await getWillDocuments(willId);
        setDocuments(docs);
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
    
    fetchDocuments();
  }, [willId, refreshTrigger, toast]);
  
  // Function to handle document upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
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
      
      const uploadedDoc = await uploadWillDocument(
        willId, 
        file, 
        (progress) => setUploadProgress(progress)
      );
      
      if (uploadedDoc) {
        toast({
          title: 'Document uploaded',
          description: `${file.name} has been added to your will`
        });
        
        // Refresh document list
        setRefreshTrigger(prev => prev + 1);
        setDialogOpen(false);
      } else {
        toast({
          title: 'Upload failed',
          description: 'Could not upload document',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error uploading document:', error);
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
      const success = await deleteWillDocument(document);
      
      if (success) {
        toast({
          title: 'Document deleted',
          description: `${document.file_name} has been removed`
        });
        
        // Remove from local state
        setDocuments(prev => prev.filter(doc => doc.id !== document.id));
      } else {
        toast({
          title: 'Delete failed',
          description: 'Could not delete document',
          variant: 'destructive'
        });
      }
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
      const url = await getDocumentUrl(document);
      
      if (!url) {
        toast({
          title: 'Download failed',
          description: 'Could not generate download link',
          variant: 'destructive'
        });
        return;
      }
      
      // Create a temporary link and trigger download
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
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
