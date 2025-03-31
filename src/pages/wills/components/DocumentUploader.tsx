
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  File, 
  Trash2, 
  Eye, 
  Loader2,
  FileText,
  Home,
  Landmark,
  CreditCard,
  Image,
  HelpCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';

interface Document {
  id: string;
  file: File;
  category: string;
  description: string;
  preview?: string;
  uploadProgress?: number;
  status: 'idle' | 'uploading' | 'uploaded' | 'error';
}

interface DocumentUploaderProps {
  onComplete: (documents: any[]) => void;
}

const documentCategories = [
  { 
    id: 'property', 
    name: 'Property Documents', 
    description: 'Deeds, titles, mortgage documents',
    icon: <Home className="h-5 w-5 text-orange-500" /> 
  },
  { 
    id: 'financial', 
    name: 'Financial Records', 
    description: 'Bank statements, investment portfolios',
    icon: <Landmark className="h-5 w-5 text-green-500" /> 
  },
  { 
    id: 'insurance', 
    name: 'Insurance Policies', 
    description: 'Life, health, home insurance documents',
    icon: <FileText className="h-5 w-5 text-blue-500" /> 
  },
  { 
    id: 'identification', 
    name: 'Identification Documents', 
    description: 'ID cards, passports, certificates',
    icon: <CreditCard className="h-5 w-5 text-purple-500" /> 
  },
  { 
    id: 'photos', 
    name: 'Important Photos', 
    description: 'Photos of valuable items or property',
    icon: <Image className="h-5 w-5 text-pink-500" /> 
  },
  { 
    id: 'other', 
    name: 'Other Documents', 
    description: 'Any other important documents',
    icon: <File className="h-5 w-5 text-gray-500" /> 
  },
];

export default function DocumentUploader({ onComplete }: DocumentUploaderProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('property');
  const [documentDescription, setDocumentDescription] = useState<string>('');
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const fileList = Array.from(e.target.files);
    
    const newDocuments = fileList.map(file => {
      const id = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Create a preview URL for supported file types
      let preview = undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }
      
      return {
        id,
        file,
        category: selectedCategory,
        description: documentDescription || file.name,
        preview,
        uploadProgress: 0,
        status: 'idle' as const,
      };
    });
    
    setDocuments(prev => [...prev, ...newDocuments]);
    setDocumentDescription('');
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast({
      title: "Documents Added",
      description: `${fileList.length} document(s) have been added to the upload queue.`,
    });
  };

  const handleUpload = async () => {
    if (!documents.length || documents.every(doc => doc.status === 'uploaded')) {
      toast({
        title: "No Documents to Upload",
        description: "Please add documents before uploading.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    // Simulate uploading each document
    const docsToUpload = documents.filter(doc => doc.status === 'idle');
    const uploadPromises = docsToUpload.map(async (doc) => {
      // Update status to uploading
      setDocuments(prev => prev.map(d => 
        d.id === doc.id ? { ...d, status: 'uploading' as const } : d
      ));
      
      // Simulate upload progress updates
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setDocuments(prev => prev.map(d => 
          d.id === doc.id ? { ...d, uploadProgress: progress } : d
        ));
      }
      
      // Simulate a brief delay for processing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update status to uploaded
      setDocuments(prev => prev.map(d => 
        d.id === doc.id ? { ...d, status: 'uploaded' as const } : d
      ));
    });
    
    await Promise.all(uploadPromises);
    
    setIsUploading(false);
    
    toast({
      title: "Upload Complete",
      description: `${docsToUpload.length} document(s) have been successfully uploaded.`,
    });
  };

  const handleDelete = (id: string) => {
    const docToDelete = documents.find(doc => doc.id === id);
    
    // Revoke object URL if there's a preview
    if (docToDelete?.preview) {
      URL.revokeObjectURL(docToDelete.preview);
    }
    
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    
    toast({
      title: "Document Removed",
      description: "The document has been removed from the queue.",
    });
  };

  const handlePreview = (document: Document) => {
    setPreviewDocument(document);
  };

  const closePreview = () => {
    setPreviewDocument(null);
  };

  const handleContinue = () => {
    if (!documents.length) {
      toast({
        title: "No Documents",
        description: "Please upload at least one document before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    if (documents.some(doc => doc.status !== 'uploaded')) {
      toast({
        title: "Upload In Progress",
        description: "Please wait for all documents to finish uploading.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate processing delay
    setTimeout(() => {
      const processedDocs = documents.map(doc => ({
        id: doc.id,
        name: doc.file.name,
        category: doc.category,
        description: doc.description,
        type: doc.file.type,
        size: doc.file.size,
      }));
      
      onComplete(processedDocs);
      setIsSubmitting(false);
    }, 1000);
  };

  const getDocumentIcon = (document: Document) => {
    const category = documentCategories.find(cat => cat.id === document.category);
    
    if (document.file.type.startsWith('image/') && document.preview) {
      return (
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={document.preview} 
            alt={document.description}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    
    return (
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        {category?.icon || <File className="h-5 w-5 text-gray-500" />}
      </div>
    );
  };

  const getCategoryName = (categoryId: string) => {
    return documentCategories.find(cat => cat.id === categoryId)?.name || 'Other';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>
                Add supporting documents for your will.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Document Category</Label>
                    <Select 
                      value={selectedCategory} 
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentCategories.map(category => (
                          <SelectItem 
                            key={category.id} 
                            value={category.id}
                          >
                            <div className="flex items-center gap-2">
                              {category.icon}
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Document Description (Optional)</Label>
                    <Input
                      id="description"
                      placeholder="E.g., House deed, Investment portfolio"
                      value={documentDescription}
                      onChange={(e) => setDocumentDescription(e.target.value)}
                    />
                  </div>
                </div>
                
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    multiple
                  />
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-1">Upload Files</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Click to browse or drag and drop your files here
                  </p>
                  <p className="text-xs text-gray-400">
                    Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG
                  </p>
                </div>
                
                {documents.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Document Queue</Label>
                      <Button 
                        size="sm" 
                        onClick={handleUpload}
                        disabled={isUploading || documents.every(doc => doc.status === 'uploaded')}
                      >
                        {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {isUploading ? 'Uploading...' : 'Upload All'}
                      </Button>
                    </div>
                    
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                      <div className="divide-y divide-gray-200">
                        {documents.map(document => (
                          <div 
                            key={document.id} 
                            className="p-4 flex items-center hover:bg-gray-50"
                          >
                            {getDocumentIcon(document)}
                            
                            <div className="ml-4 flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {document.description || document.file.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-normal">
                                  {getCategoryName(document.category)}
                                </Badge>
                                <p className="text-xs text-gray-500">
                                  {(document.file.size / 1024).toFixed(0)} KB
                                </p>
                              </div>
                              
                              {document.status === 'uploading' && (
                                <Progress 
                                  value={document.uploadProgress} 
                                  className="h-1.5 mt-2"
                                />
                              )}
                            </div>
                            
                            <div className="ml-4 flex-shrink-0 flex gap-2">
                              {document.status === 'uploaded' ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-transparent">
                                  Uploaded
                                </Badge>
                              ) : document.status === 'error' ? (
                                <Badge variant="destructive">Error</Badge>
                              ) : document.status === 'uploading' ? (
                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-transparent">
                                  Uploading {document.uploadProgress}%
                                </Badge>
                              ) : (
                                <Badge variant="outline">Ready</Badge>
                              )}
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handlePreview(document)}
                                disabled={document.status === 'uploading'}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDelete(document.id)}
                                disabled={document.status === 'uploading'}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pb-6">
              <Button variant="outline">
                Back
              </Button>
              <Button 
                onClick={handleContinue}
                disabled={
                  documents.length === 0 ||
                  documents.some(doc => doc.status === 'uploading') ||
                  isSubmitting
                }
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Supporting Documents</CardTitle>
              <CardDescription>
                Why you should include these documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {documentCategories.map(category => (
                <div key={category.id} className="flex gap-3">
                  <div className="mt-0.5">
                    {category.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{category.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="h-4 w-4 text-willtank-600" />
                  <h4 className="text-sm font-medium">Why Upload Documents?</h4>
                </div>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Helps your executor locate important assets</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Provides proof of ownership for property and valuables</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Ensures your beneficiaries have all necessary information</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Simplifies the probate process</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Preview Dialog */}
      <Dialog open={!!previewDocument} onOpenChange={closePreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{previewDocument?.description || previewDocument?.file.name}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {previewDocument?.file.type.startsWith('image/') && previewDocument?.preview ? (
              <div className="bg-gray-50 rounded-lg overflow-hidden flex justify-center">
                <img 
                  src={previewDocument.preview} 
                  alt={previewDocument.description}
                  className="max-h-[60vh] object-contain"
                />
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {previewDocument?.file.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {previewDocument?.file.type || 'Unknown file type'}
                </p>
                <p className="text-xs text-gray-400">
                  This file type cannot be previewed directly. You can download it to view its contents.
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={closePreview}>
              Close Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
