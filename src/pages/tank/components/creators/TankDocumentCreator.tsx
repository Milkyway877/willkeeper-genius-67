
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Upload, 
  FileSymlink, 
  X, 
  Check, 
  FilePlus,
  File,
  FileHeart,
  MessageSquare,
  Sparkles,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';

type TankDocumentCreatorProps = {
  onComplete: (documentContent: any) => void;
  isAiEnhanced: boolean;
};

export function TankDocumentCreator({ onComplete, isAiEnhanced }: TankDocumentCreatorProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [showAIPanel, setShowAIPanel] = useState(false);
  
  const aiSuggestions = [
    "Add a personal will and testament",
    "Include family photographs with descriptions",
    "Share important financial documents",
    "Provide access instructions for digital assets"
  ];
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      setFiles(prev => [...prev, ...newFiles]);
      
      toast({
        title: "Files uploaded",
        description: `${newFiles.length} file(s) added successfully`,
      });
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleAISuggestion = (suggestion: string) => {
    toast({
      title: "Suggestion applied",
      description: suggestion,
    });
    setShowAIPanel(false);
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <FileHeart className="h-6 w-6 text-purple-500" />;
    } else if (fileType.startsWith('application/pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (fileType.startsWith('text/')) {
      return <FileText className="h-6 w-6 text-blue-500" />;
    } else {
      return <File className="h-6 w-6 text-gray-500" />;
    }
  };
  
  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your document collection",
        variant: "destructive"
      });
      return;
    }
    
    if (files.length === 0) {
      toast({
        title: "Files required",
        description: "Please upload at least one file",
        variant: "destructive"
      });
      return;
    }
    
    onComplete({
      type: 'document',
      title,
      description,
      files
    });
  };
  
  // Format file size in KB or MB
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-medium">Document Collection</h3>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <Label htmlFor="document-title" className="block mb-2">Collection Title</Label>
              <Input 
                id="document-title" 
                placeholder="e.g., Family History Documents" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="mb-6">
              <Label htmlFor="document-description" className="block mb-2">Description</Label>
              <Textarea 
                id="document-description" 
                placeholder="Describe the purpose and content of these documents..." 
                className="resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 mb-6 text-center">
              <FilePlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium mb-2">Upload Documents</h3>
              <p className="text-gray-500 text-sm mb-4">
                Drag and drop files here, or click the button below
              </p>
              <div className="relative">
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Select Files
                </Button>
                <input
                  type="file"
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
            
            {files.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium mb-3">Uploaded Files ({files.length})</h4>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center">
                        <div className="p-2 bg-white rounded-md mr-3 shadow-sm">
                          {getFileIcon(file.type)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-gray-500 text-xs">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {isAiEnhanced && (
              <div className="flex justify-center mb-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAIPanel(!showAIPanel)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {showAIPanel ? 'Hide AI Suggestions' : 'AI Document Suggestions'}
                </Button>
              </div>
            )}
            
            {showAIPanel && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="border border-willtank-100 rounded-lg bg-willtank-50 p-4 mb-6"
              >
                <h4 className="text-sm font-medium text-willtank-700 mb-3 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Document Suggestions
                </h4>
                
                <div className="space-y-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      className="bg-white rounded-md p-3 border border-willtank-100 hover:border-willtank-300 cursor-pointer transition-colors flex items-start"
                      onClick={() => handleAISuggestion(suggestion)}
                    >
                      <FileText className="h-4 w-4 text-willtank-500 mr-2 mt-0.5" />
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            
            <div className="text-center">
              <Button onClick={handleSubmit} disabled={files.length === 0} className="min-w-[200px]">
                <Check className="h-4 w-4 mr-2" />
                Continue to Delivery Options
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-medium">Document Tips</h3>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h4 className="font-medium mb-3 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-willtank-500" />
                Document Suggestions
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Include important legal documents (wills, insurance policies, etc.)</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Add family photos with captions to identify people and dates</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Share personal writing, journals, or family history documents</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Include details about digital assets and accounts</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Add an inventory of valuable possessions with their history</span>
                </li>
              </ul>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium mb-3 flex items-center">
                <Eye className="h-4 w-4 mr-2 text-willtank-500" />
                Supported File Types
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span><strong>Documents:</strong> PDF, DOC, DOCX, TXT, RTF</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span><strong>Images:</strong> JPG, PNG, GIF, TIFF</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span><strong>Spreadsheets:</strong> XLS, XLSX, CSV</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span><strong>Other:</strong> ZIP (for multiple files)</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 bg-willtank-50 rounded-lg border border-willtank-100">
              <p className="text-sm text-willtank-700">
                <strong>Security Note:</strong> All documents are encrypted and stored 
                securely. Only the intended recipients will be able to access them according 
                to your delivery settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
