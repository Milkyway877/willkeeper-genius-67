
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { FileText, Upload, X, Check, File, Image, FileArchive, FileLock2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface DocumentsUploaderProps {
  contacts: any[];
  responses: Record<string, any>;
  onComplete: (documents: any[]) => void;
}

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  file: File | null;
  relatedTo?: string;
  description?: string;
  uploaded: boolean;
  previewUrl?: string;
}

// Document categories based on common will-related documents
const documentCategories = [
  {
    id: 'property',
    name: 'Property Documents',
    description: 'Property deeds, mortgage records, titles',
    icon: <Home className="h-5 w-5 text-blue-600" />
  },
  {
    id: 'financial',
    name: 'Financial Documents',
    description: 'Bank statements, investment records, insurance policies',
    icon: <FileText className="h-5 w-5 text-green-600" />
  },
  {
    id: 'identification',
    name: 'Identification Documents',
    description: 'ID cards, passports, birth certificates',
    icon: <User className="h-5 w-5 text-orange-600" />
  },
  {
    id: 'digital',
    name: 'Digital Assets',
    description: 'Cryptocurrency keys, digital asset information',
    icon: <Key className="h-5 w-5 text-purple-600" />
  },
  {
    id: 'other',
    name: 'Other Documents',
    description: 'Any other supporting documents',
    icon: <File className="h-5 w-5 text-gray-600" />
  }
];

// Document types within categories
const documentTypes: Record<string, string[]> = {
  property: ['Property Deed', 'Mortgage Record', 'Property Title', 'Property Tax Record', 'Lease Agreement'],
  financial: ['Bank Statement', 'Investment Portfolio', 'Insurance Policy', 'Tax Return', 'Business Documents'],
  identification: ['Passport', 'Driver\'s License', 'Birth Certificate', 'Marriage Certificate', 'Social Security Card'],
  digital: ['Cryptocurrency Keys', 'Digital Wallet Information', 'Website Ownership', 'Digital Asset Inventory'],
  other: ['Medical Records', 'Personal Letters', 'Family Photos', 'Other']
};

// Suggested documents based on responses
const getSuggestedDocuments = (responses: Record<string, any>) => {
  const suggestions: Partial<Document>[] = [];
  
  // Property-related documents
  if (responses.residualEstate?.toLowerCase().includes('house') || 
      responses.residualEstate?.toLowerCase().includes('property') ||
      responses.bequestsDetails?.toLowerCase().includes('house')) {
    suggestions.push({
      name: 'Property Deed',
      type: 'Property Deed',
      category: 'property',
      description: 'Proof of ownership for your property'
    });
  }
  
  // Digital asset documents
  if (responses.digitalAssets && responses.digitalAssets === true) {
    suggestions.push({
      name: 'Digital Assets Inventory',
      type: 'Digital Asset Inventory',
      category: 'digital',
      description: 'Inventory of your digital assets and access information'
    });
  }
  
  // Identification
  suggestions.push({
    name: 'Proof of Identity',
    type: 'Passport',
    category: 'identification',
    description: 'Your personal identification document'
  });
  
  return suggestions;
};

// Helper functions
import { Home, Key, User, AlertCircle } from 'lucide-react';

function getFileIcon(fileType: string | undefined) {
  if (!fileType) return <File className="h-10 w-10 text-gray-400" />;
  
  if (fileType.includes('image/')) {
    return <Image className="h-10 w-10 text-blue-400" />;
  } else if (fileType.includes('pdf')) {
    return <FileText className="h-10 w-10 text-red-400" />;
  } else if (fileType.includes('zip') || fileType.includes('archive')) {
    return <FileArchive className="h-10 w-10 text-amber-400" />;
  } else {
    return <File className="h-10 w-10 text-gray-400" />;
  }
}

export function DocumentsUploader({ contacts, responses, onComplete }: DocumentsUploaderProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('property');
  const [isUploading, setIsUploading] = useState(false);
  const [suggestionAdded, setSuggestionAdded] = useState(false);
  const { toast } = useToast();
  
  const suggestedDocs = getSuggestedDocuments(responses);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }
    
    const previewUrl = file.type.startsWith('image/') 
      ? URL.createObjectURL(file) 
      : undefined;
    
    setDocuments(docs => docs.map(doc => 
      doc.id === docId 
        ? { ...doc, file, uploaded: true, previewUrl } 
        : doc
    ));
    
    toast({
      title: "File Selected",
      description: `"${file.name}" has been selected.`
    });
  };
  
  const handleAddDocument = () => {
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      name: '',
      type: documentTypes[currentCategory][0],
      category: currentCategory,
      file: null,
      description: '',
      uploaded: false
    };
    
    setDocuments([...documents, newDoc]);
  };
  
  const handleRemoveDocument = (docId: string) => {
    setDocuments(docs => {
      const docToRemove = docs.find(d => d.id === docId);
      if (docToRemove?.previewUrl) {
        URL.revokeObjectURL(docToRemove.previewUrl);
      }
      return docs.filter(d => d.id !== docId);
    });
  };
  
  const handleCompleteUpload = () => {
    // Filter out any documents that don't have files attached
    const completedDocuments = documents.filter(doc => doc.uploaded && doc.file);
    
    if (completedDocuments.length === 0) {
      toast({
        title: "No Documents",
        description: "Please upload at least one document before continuing.",
        variant: "destructive"
      });
      return;
    }
    
    onComplete(completedDocuments);
  };
  
  const handleAddSuggestion = (suggestion: Partial<Document>) => {
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      name: suggestion.name || '',
      type: suggestion.type || '',
      category: suggestion.category || 'other',
      file: null,
      description: suggestion.description || '',
      uploaded: false
    };
    
    setDocuments([...documents, newDoc]);
    setCurrentCategory(suggestion.category || 'other');
    setSuggestionAdded(true);
  };
  
  return (
    <div className="space-y-8">
      {/* AI suggestion section */}
      {!suggestionAdded && suggestedDocs.length > 0 && (
        <div className="bg-willtank-50 rounded-lg p-5 border border-willtank-100">
          <div className="flex items-start mb-4">
            <div className="mr-4 mt-1">
              <AlertCircle className="h-5 w-5 text-willtank-700" />
            </div>
            <div>
              <h3 className="font-medium text-willtank-700">AI Document Suggestions</h3>
              <p className="text-sm text-gray-600 mt-1">
                Based on your responses, our AI suggests adding the following documents to support your will:
              </p>
            </div>
          </div>
          
          <div className="space-y-3 mt-4">
            {suggestedDocs.map((suggestion, index) => (
              <div 
                key={index}
                className="bg-white rounded-md p-3 border border-gray-200 flex justify-between items-center"
              >
                <div className="flex items-center">
                  {suggestion.category === 'property' && <Home className="h-5 w-5 text-blue-500 mr-3" />}
                  {suggestion.category === 'digital' && <Key className="h-5 w-5 text-purple-500 mr-3" />}
                  {suggestion.category === 'identification' && <User className="h-5 w-5 text-orange-500 mr-3" />}
                  
                  <div>
                    <p className="font-medium">{suggestion.name}</p>
                    <p className="text-xs text-gray-500">{suggestion.description}</p>
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleAddSuggestion(suggestion)}
                >
                  Add Document
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Document category selector */}
      <div className="space-y-4">
        <Label>Document Category</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {documentCategories.map(category => (
            <div
              key={category.id}
              className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 flex flex-col items-center text-center ${
                currentCategory === category.id 
                  ? 'border-willtank-500 bg-willtank-50' 
                  : 'border-gray-200 hover:border-willtank-300'
              }`}
              onClick={() => setCurrentCategory(category.id)}
            >
              <div className="mb-2">
                {category.icon}
              </div>
              <div className="text-sm font-medium">{category.name}</div>
              <div className="text-xs text-gray-500 mt-1">{category.description}</div>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />
      
      {/* Document list */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Your Documents</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddDocument}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </div>
        
        <AnimatePresence>
          {documents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No documents added yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Click "Add Document" to upload supporting documents for your will
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardHeader className="py-3 px-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          {doc.category === 'property' && <Home className="h-5 w-5 text-blue-500 mr-2" />}
                          {doc.category === 'financial' && <FileText className="h-5 w-5 text-green-500 mr-2" />}
                          {doc.category === 'identification' && <User className="h-5 w-5 text-orange-500 mr-2" />}
                          {doc.category === 'digital' && <Key className="h-5 w-5 text-purple-500 mr-2" />}
                          {doc.category === 'other' && <File className="h-5 w-5 text-gray-500 mr-2" />}
                          
                          <Input 
                            value={doc.name}
                            onChange={(e) => setDocuments(docs => docs.map(d => 
                              d.id === doc.id ? { ...d, name: e.target.value } : d
                            ))}
                            placeholder="Document Name"
                            className="h-7 text-sm w-48 md:w-auto"
                          />
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="py-3 px-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="mb-3">
                            <Label htmlFor={`type-${doc.id}`} className="text-sm">Document Type</Label>
                            <Select 
                              value={doc.type} 
                              onValueChange={(value) => setDocuments(docs => docs.map(d => 
                                d.id === doc.id ? { ...d, type: value } : d
                              ))}
                            >
                              <SelectTrigger id={`type-${doc.id}`}>
                                <SelectValue placeholder="Select document type" />
                              </SelectTrigger>
                              <SelectContent>
                                {documentTypes[doc.category].map(type => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {contacts.length > 0 && (
                            <div className="mb-3">
                              <Label htmlFor={`related-${doc.id}`} className="text-sm">Related To</Label>
                              <Select 
                                value={doc.relatedTo || ''} 
                                onValueChange={(value) => setDocuments(docs => docs.map(d => 
                                  d.id === doc.id ? { ...d, relatedTo: value } : d
                                ))}
                              >
                                <SelectTrigger id={`related-${doc.id}`}>
                                  <SelectValue placeholder="Select related person (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">Not related to a specific person</SelectItem>
                                  {contacts.map(contact => (
                                    <SelectItem key={contact.id} value={contact.id}>
                                      {contact.name} ({contact.role})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
                          <div>
                            <Label htmlFor={`description-${doc.id}`} className="text-sm">Description (Optional)</Label>
                            <Input
                              id={`description-${doc.id}`}
                              value={doc.description || ''}
                              onChange={(e) => setDocuments(docs => docs.map(d => 
                                d.id === doc.id ? { ...d, description: e.target.value } : d
                              ))}
                              placeholder="Brief description of this document"
                              className="text-sm"
                            />
                          </div>
                        </div>
                        
                        <div>
                          {doc.uploaded && doc.file ? (
                            <div className="border rounded-lg p-4 h-full flex flex-col items-center justify-center">
                              {doc.previewUrl ? (
                                <img 
                                  src={doc.previewUrl} 
                                  alt="Document preview" 
                                  className="h-32 object-contain mb-2"
                                />
                              ) : (
                                <div className="mb-2">
                                  {getFileIcon(doc.file.type)}
                                </div>
                              )}
                              
                              <div className="text-center">
                                <p className="text-sm font-medium truncate max-w-xs">{doc.file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              
                              <div className="mt-4">
                                <Label htmlFor={`file-${doc.id}`} className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-green-50 text-green-700 cursor-pointer">
                                  <Check className="h-3 w-3 mr-1" />
                                  Change File
                                </Label>
                                <Input 
                                  type="file" 
                                  id={`file-${doc.id}`} 
                                  className="hidden" 
                                  onChange={(e) => handleFileSelect(e, doc.id)}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="border rounded-lg p-4 border-dashed h-full flex flex-col items-center justify-center">
                              <Upload className="h-12 w-12 text-gray-300 mb-2" />
                              <p className="text-sm text-gray-500 mb-4">
                                Drag and drop a file or click to browse
                              </p>
                              
                              <Label htmlFor={`file-${doc.id}`} className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-willtank-50 text-willtank-700 cursor-pointer hover:bg-willtank-100 transition-colors">
                                <Upload className="h-4 w-4 mr-2" />
                                Select File
                              </Label>
                              <Input 
                                type="file" 
                                id={`file-${doc.id}`} 
                                className="hidden" 
                                onChange={(e) => handleFileSelect(e, doc.id)}
                              />
                              <p className="text-xs text-gray-400 mt-2">Max file size: 10MB</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="mt-8 flex justify-between">
        <p className="text-sm text-gray-500">
          {documents.filter(d => d.uploaded).length} of {documents.length} documents uploaded
        </p>
        
        <Button 
          className="min-w-[180px]"
          onClick={handleCompleteUpload}
          disabled={documents.filter(d => d.uploaded).length === 0 || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Complete & Continue
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
