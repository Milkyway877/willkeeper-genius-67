
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, File, FileUp, Upload, Check, Trash, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  category: string;
  url?: string;
  file?: File;
}

interface DocumentsUploaderProps {
  contacts: any[];
  responses: Record<string, any>;
  onComplete: (documents: Document[]) => void;
}

export function DocumentsUploader({ contacts, responses, onComplete }: DocumentsUploaderProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('property');
  const [documentName, setDocumentName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setUploading(true);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate preview URL
      const url = URL.createObjectURL(file);
      
      // Format file size
      const fileSize = formatFileSize(file.size);
      
      // Generate document name if not provided
      const name = documentName || file.name;
      
      // Clear progress and intervals
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Add to documents list
      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        name,
        type: file.type,
        size: fileSize,
        category: selectedCategory,
        url,
        file
      };
      
      setDocuments(prev => [...prev, newDocument]);
      
      // Reset form
      setDocumentName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      toast({
        title: "Document uploaded",
        description: `${name} has been successfully uploaded.`
      });
      
    } catch (error) {
      console.error("Error handling file upload:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your document.",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeDocument = (id: string) => {
    const documentToRemove = documents.find(doc => doc.id === id);
    
    if (documentToRemove?.url) {
      URL.revokeObjectURL(documentToRemove.url);
    }
    
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    
    toast({
      title: "Document removed",
      description: `${documentToRemove?.name || 'Document'} has been removed.`
    });
  };

  const handleComplete = () => {
    if (documents.length === 0) {
      toast({
        title: "No documents uploaded",
        description: "Please upload at least one supporting document.",
        variant: "destructive"
      });
      return;
    }
    
    onComplete(documents);
    toast({
      title: "Documents saved",
      description: `${documents.length} documents have been saved successfully.`
    });
  };

  // Generate suggested document categories based on user responses
  const generateSuggestedDocuments = () => {
    const suggestions = [];
    
    // If they mentioned real estate
    if (responses.residualEstate && responses.residualEstate.toLowerCase().includes('house') || 
        responses.residualEstate && responses.residualEstate.toLowerCase().includes('property')) {
      suggestions.push({
        category: 'property',
        name: 'Property deed or title',
        description: 'Upload documentation for your property'
      });
    }
    
    // If they mentioned vehicles
    if (responses.residualEstate && responses.residualEstate.toLowerCase().includes('car') ||
        responses.residualEstate && responses.residualEstate.toLowerCase().includes('vehicle')) {
      suggestions.push({
        category: 'vehicle',
        name: 'Vehicle title/registration',
        description: 'Upload documentation for your vehicles'
      });
    }
    
    // If they mentioned investments
    if (responses.residualEstate && responses.residualEstate.toLowerCase().includes('invest') || 
        responses.residualEstate && responses.residualEstate.toLowerCase().includes('stock')) {
      suggestions.push({
        category: 'financial',
        name: 'Investment statements',
        description: 'Upload documentation for your investments'
      });
    }
    
    // Always suggest personal identification
    suggestions.push({
      category: 'identification',
      name: 'Personal identification',
      description: 'Upload identification documents like passport or driver\'s license'
    });
    
    return suggestions;
  };
  
  const suggestedDocuments = generateSuggestedDocuments();

  const categories = [
    { value: 'property', label: 'Real Estate' },
    { value: 'vehicle', label: 'Vehicles' },
    { value: 'financial', label: 'Financial Assets' },
    { value: 'insurance', label: 'Insurance Policies' },
    { value: 'identification', label: 'Identification' },
    { value: 'medical', label: 'Medical Records' },
    { value: 'business', label: 'Business Documents' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supporting Documents</CardTitle>
          <CardDescription>
            Upload important documents to support your will. These will be stored securely and attached to your will.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Suggested documents */}
            {suggestedDocuments.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-md font-medium">Recommended Documents</h3>
                <p className="text-sm text-gray-500">
                  Based on your will details, we recommend uploading these documents:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestedDocuments.map((doc, index) => (
                    <Card key={index} className="flex items-stretch">
                      <Button
                        className="w-full h-full flex flex-col items-center justify-center p-6 gap-3"
                        variant="ghost"
                        type="button"
                        onClick={() => {
                          setSelectedCategory(doc.category);
                          setDocumentName(doc.name);
                          if (fileInputRef.current) fileInputRef.current.click();
                        }}
                      >
                        <div className="bg-gray-100 rounded-full p-3">
                          <FileUp className="h-6 w-6 text-willtank-600" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.description}</p>
                        </div>
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Upload form */}
            <div className="border rounded-md p-4 bg-gray-50">
              <h3 className="text-md font-medium mb-4">Upload Document</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="documentName">Document Name</Label>
                    <input
                      id="documentName"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      placeholder="Property deed, Vehicle title, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="documentCategory">Category</Label>
                    <select
                      id="documentCategory"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                  />
                  
                  {uploading ? (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="h-2" />
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Uploading document...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Select File to Upload (PDF, DOC, images)
                    </Button>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Maximum file size: 10MB. Supported formats: PDF, DOC, JPG, PNG
                  </p>
                </div>
              </div>
            </div>
            
            {/* Document list */}
            {documents.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-md font-medium">Uploaded Documents ({documents.length})</h3>
                
                <div className="grid grid-cols-1 gap-3">
                  {documents.map((document) => (
                    <div key={document.id} className="border rounded-md p-3 bg-white flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="bg-gray-100 rounded p-2">
                          <File className="h-6 w-6 text-willtank-600" />
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{document.name}</span>
                            <Badge variant="outline">
                              {categories.find(c => c.value === document.category)?.label || document.category}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-500 mt-1">
                            <div>{document.size}</div>
                            <div>{document.type.split('/')[1]?.toUpperCase() || document.type}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          type="button"
                          onClick={() => document.url && window.open(document.url, '_blank')}
                          disabled={!document.url}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeDocument(document.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed rounded-md">
                <FileUp className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No documents uploaded yet</p>
                <p className="text-sm text-gray-400">Upload supporting documents for your will</p>
              </div>
            )}
            
            {/* Completion */}
            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {documents.length > 0 ? (
                    <div className="flex items-center text-green-600">
                      <Check className="h-5 w-5 mr-1" />
                      <span>{documents.length} documents uploaded</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <AlertCircle className="h-5 w-5 mr-1" />
                      <span>No documents uploaded yet</span>
                    </div>
                  )}
                </div>
                
                <Button onClick={handleComplete} type="button">
                  Save & Continue
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
