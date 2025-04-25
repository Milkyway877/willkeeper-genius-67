
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Trash2, Upload, File, FileText, Plus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Document {
  id: string;
  name: string;
  description: string;
  type: string;
  file: File | null;
  relatedContact?: string;
  uploadProgress: number;
  status: 'uploading' | 'complete' | 'error' | 'ready';
}

interface DocumentsUploaderProps {
  contacts: any[];
  responses: Record<string, any>;
  onComplete: (documents: Document[]) => void;
}

export function DocumentsUploader({ contacts, responses, onComplete }: DocumentsUploaderProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Suggested document types based on the will template and AI conversation
  const suggestedDocuments = getSuggestedDocuments(responses);

  // Initialize with suggested documents if empty
  React.useEffect(() => {
    if (documents.length === 0 && suggestedDocuments.length > 0) {
      setDocuments(suggestedDocuments);
    }
  }, []);

  const handleAddDocument = () => {
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      name: '',
      description: '',
      type: 'identification',
      file: null,
      uploadProgress: 0,
      status: 'ready'
    };
    
    setCurrentDocument(newDoc);
  };

  const handleEditDocument = (doc: Document) => {
    setCurrentDocument({ ...doc });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentDocument) return;
    
    setCurrentDocument({
      ...currentDocument,
      file,
      name: currentDocument.name || file.name,
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(docs => docs.filter(d => d.id !== id));
    
    toast({
      title: "Document Removed",
      description: "The document has been removed from the upload list."
    });
  };

  const handleSaveDocument = () => {
    if (!currentDocument) return;
    
    if (!currentDocument.name.trim()) {
      toast({
        title: "Document Name Required",
        description: "Please enter a name for this document.",
        variant: "destructive"
      });
      return;
    }
    
    if (!currentDocument.file) {
      toast({
        title: "File Required",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    // For an existing document
    if (documents.some(d => d.id === currentDocument.id)) {
      setDocuments(docs => 
        docs.map(d => d.id === currentDocument.id ? currentDocument : d)
      );
    } 
    // For a new document
    else {
      setDocuments([...documents, currentDocument]);
    }
    
    setCurrentDocument(null);
    
    toast({
      title: "Document Saved",
      description: `${currentDocument.name} has been added to your will documents.`
    });
  };

  const handleUploadAll = () => {
    // In a real implementation, we would actually upload the files
    // For now, we simulate the upload with a progress bar
    
    const docsToUpload = documents.filter(d => d.file && d.status !== 'complete');
    
    if (docsToUpload.length === 0) {
      onComplete(documents);
      return;
    }
    
    // Simulate uploading each document
    const updatedDocs = [...documents];
    
    docsToUpload.forEach(doc => {
      const index = updatedDocs.findIndex(d => d.id === doc.id);
      if (index !== -1) {
        updatedDocs[index] = { ...doc, status: 'uploading', uploadProgress: 0 };
      }
    });
    
    setDocuments(updatedDocs);
    
    // Simulate upload progress for each document
    docsToUpload.forEach(doc => {
      let progress = 0;
      
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          setDocuments(currentDocs => 
            currentDocs.map(d => 
              d.id === doc.id 
                ? { ...d, status: 'complete', uploadProgress: 100 } 
                : d
            )
          );
          
          // Check if all uploads are complete
          const allComplete = documents.every(d => 
            d.status === 'complete' || !d.file
          );
          
          if (allComplete) {
            setTimeout(() => {
              onComplete(documents);
            }, 500);
          }
        } else {
          setDocuments(currentDocs => 
            currentDocs.map(d => 
              d.id === doc.id 
                ? { ...d, uploadProgress: Math.round(progress) } 
                : d
            )
          );
        }
      }, 200);
    });
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'identification':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'property':
        return <File className="h-4 w-4 text-green-500" />;
      case 'financial':
        return <File className="h-4 w-4 text-yellow-500" />;
      case 'medical':
        return <File className="h-4 w-4 text-red-500" />;
      case 'other':
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Function to generate suggested documents based on the AI conversation
  function getSuggestedDocuments(responses: Record<string, any>): Document[] {
    const suggestedDocs: Document[] = [];
    
    // Identification documents
    suggestedDocs.push({
      id: `doc-id-${Date.now()}`,
      name: "Personal Identification",
      description: "Government-issued ID such as passport or driver's license",
      type: "identification",
      file: null,
      uploadProgress: 0,
      status: "ready"
    });
    
    // Property documents if mentioned in conversation
    if (responses.residualEstate && responses.residualEstate.toLowerCase().includes("house") || 
        responses.residualEstate && responses.residualEstate.toLowerCase().includes("property")) {
      suggestedDocs.push({
        id: `doc-property-${Date.now()}`,
        name: "Property Deed/Title",
        description: "Documentation for real estate mentioned in your will",
        type: "property",
        file: null,
        uploadProgress: 0,
        status: "ready"
      });
    }
    
    // Financial documents if digital assets are mentioned
    if (responses.digitalAssets) {
      suggestedDocs.push({
        id: `doc-financial-${Date.now()}`,
        name: "Digital Asset Information",
        description: "Documentation of cryptocurrency or other digital holdings",
        type: "financial",
        file: null,
        uploadProgress: 0,
        status: "ready"
      });
    }
    
    return suggestedDocs;
  }

  // Group documents by type
  const documentsByType = documents.reduce((acc, doc) => {
    if (!acc[doc.type]) {
      acc[doc.type] = [];
    }
    acc[doc.type].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <div className="space-y-6">
      <div className="bg-willtank-50 p-4 rounded-lg mb-6 border border-willtank-100">
        <h3 className="font-medium text-willtank-700 mb-2">Supporting Documents</h3>
        <p className="text-sm text-gray-600">
          Upload important documents that support your will, such as property deeds, financial statements,
          or identification documents. These will be securely stored and accessible to your executors when needed.
        </p>
      </div>
      
      {/* Document list */}
      {documents.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-gray-500">No documents added yet. Add documents using the button below.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(documentsByType).map(([type, docs]) => (
            <div key={type} className="space-y-3">
              <h3 className="font-medium text-gray-700 capitalize">
                {type} Documents ({docs.length})
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {docs.map((doc) => (
                  <motion.div 
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:border-willtank-300 transition-all duration-200"
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        {getDocumentTypeIcon(doc.type)}
                        <div className="ml-2">
                          <h3 className="font-medium">{doc.name}</h3>
                          <p className="text-sm text-gray-500">{doc.file?.name || 'No file selected'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {doc.status !== 'uploading' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleEditDocument(doc)}
                              disabled={doc.status === 'complete'}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-red-500 hover:text-red-700" 
                              onClick={() => handleDeleteDocument(doc.id)}
                              disabled={doc.status === 'complete'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {doc.description && (
                      <p className="text-sm text-gray-600 mt-2">{doc.description}</p>
                    )}
                    
                    {doc.relatedContact && (
                      <div className="mt-2">
                        <span className="text-xs bg-willtank-50 text-willtank-700 px-2 py-1 rounded">
                          Related to: {contacts.find(c => c.id === doc.relatedContact)?.name || doc.relatedContact}
                        </span>
                      </div>
                    )}
                    
                    {doc.status === 'uploading' && (
                      <div className="mt-3">
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-willtank-500 rounded-full transition-all" 
                            style={{ width: `${doc.uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Uploading: {doc.uploadProgress}%
                        </p>
                      </div>
                    )}
                    
                    {doc.status === 'complete' && (
                      <div className="flex items-center text-green-600 text-sm mt-2">
                        <Check className="h-4 w-4 mr-1" />
                        Upload complete
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add document button */}
      {!currentDocument && (
        <Button 
          variant="outline" 
          onClick={handleAddDocument}
          disabled={documents.some(d => d.status === 'uploading')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Document
        </Button>
      )}
      
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
      
      {/* Edit document form */}
      {currentDocument && (
        <Card>
          <CardHeader>
            <CardTitle>
              {documents.some(d => d.id === currentDocument.id) 
                ? "Edit Document" 
                : "Add Document"}
            </CardTitle>
            <CardDescription>
              Add supporting documentation for your will. These documents will be securely stored.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doc-name">Document Name</Label>
              <Input 
                id="doc-name" 
                value={currentDocument.name} 
                onChange={e => setCurrentDocument({...currentDocument, name: e.target.value})}
                placeholder="e.g., Property Deed, Bank Statement"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="doc-type">Document Type</Label>
              <Select 
                value={currentDocument.type} 
                onValueChange={value => setCurrentDocument({...currentDocument, type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="identification">Identification</SelectItem>
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="doc-description">Description (Optional)</Label>
              <Textarea 
                id="doc-description" 
                value={currentDocument.description} 
                onChange={e => setCurrentDocument({...currentDocument, description: e.target.value})}
                placeholder="Brief description of this document"
              />
            </div>
            
            {contacts.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="doc-related">Related Contact (Optional)</Label>
                <Select 
                  value={currentDocument.relatedContact} 
                  onValueChange={value => setCurrentDocument({...currentDocument, relatedContact: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select related contact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {contacts.map(contact => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name} ({contact.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>File</Label>
              <div 
                onClick={triggerFileInput}
                className="border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-gray-50 text-center transition-colors"
              >
                {currentDocument.file ? (
                  <div>
                    <div className="flex items-center justify-center mb-2 text-willtank-600">
                      <FileText className="h-8 w-8" />
                    </div>
                    <p className="font-medium text-sm">{currentDocument.file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(currentDocument.file.size / 1024 / 1024).toFixed(2)} MB • 
                      Click to replace
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-center mb-2 text-gray-400">
                      <Upload className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-medium">Click to upload a file</p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOCX, JPG or PNG, max 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardContent className="flex justify-between pt-6">
            <Button 
              variant="outline" 
              onClick={() => setCurrentDocument(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveDocument}>
              <Check className="h-4 w-4 mr-2" />
              Save Document
            </Button>
          </CardContent>
        </Card>
      )}
      
      {!currentDocument && documents.length > 0 && (
        <div className="mt-8">
          {documents.some(d => d.status === 'uploading') ? (
            <Button 
              className="w-full"
              size="lg"
              disabled
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading Documents...
            </Button>
          ) : (
            <Button 
              className="w-full"
              size="lg"
              onClick={handleUploadAll}
              disabled={documents.filter(d => d.file && d.status !== 'complete').length === 0 && documents.some(d => d.file && d.status === 'complete')}
            >
              {documents.some(d => d.status === 'complete') ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Continue to Next Step
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Documents & Continue
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
