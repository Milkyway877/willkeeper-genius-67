
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  File,
  FileUp, 
  Trash2, 
  Eye, 
  Shield, 
  Lock, 
  Key, 
  Save,
  AlertTriangle,
  FileText,
  User,
  Tag
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { MessageCategory } from '../../types';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

interface TankDocumentCreatorProps {
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  onRecipientChange: (recipient: string) => void;
  onCategoryChange: (category: MessageCategory) => void;
}

export const TankDocumentCreator: React.FC<TankDocumentCreatorProps> = ({ 
  onContentChange, 
  onTitleChange,
  onRecipientChange,
  onCategoryChange
}) => {
  const { toast } = useToast();
  const [title, setTitle] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
  
  // Default category setting
  useEffect(() => {
    onCategoryChange('story');
  }, [onCategoryChange]);
  
  useEffect(() => {
    onTitleChange(title);
  }, [title, onTitleChange]);
  
  useEffect(() => {
    onRecipientChange(recipient);
  }, [recipient, onRecipientChange]);
  
  useEffect(() => {
    if (files.length > 0) {
      const fileNames = files.map(file => file.name).join(", ");
      onContentChange(`Document upload: ${fileNames}`);
    } else {
      onContentChange('');
    }
  }, [files, onContentChange]);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipient(e.target.value);
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };
  
  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTag(e.target.value);
  };
  
  const addTag = () => {
    if (newTag.trim() !== '' && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          setTimeout(() => {
            const newFiles: FileItem[] = [];
            
            for (let i = 0; i < fileList.length; i++) {
              const file = fileList[i];
              newFiles.push({
                id: Date.now().toString() + i,
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
              });
            }
            
            setFiles(prev => [...prev, ...newFiles]);
            setIsUploading(false);
            
            toast({
              title: "Files Uploaded",
              description: `${fileList.length} file(s) have been uploaded successfully.`
            });
            
            // After upload, simulate encryption
            simulateEncryption();
          }, 500);
          
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };
  
  const removeFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
    
    toast({
      title: "File Removed",
      description: "The file has been removed from your document package."
    });
  };
  
  const simulateEncryption = () => {
    setIsEncrypting(true);
    
    setTimeout(() => {
      setIsEncrypting(false);
      
      toast({
        title: "Files Encrypted",
        description: "Your documents have been securely encrypted for future delivery."
      });
    }, 2000);
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <File className="text-blue-500" />;
    } else if (type.startsWith('application/pdf')) {
      return <FileText className="text-red-500" />;
    } else if (type.startsWith('application/')) {
      return <FileText className="text-amber-500" />;
    } else {
      return <File className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="documentTitle" className="block text-sm font-medium text-gray-700 mb-1">Document Package Title</label>
          <div className="relative">
            <File className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              id="documentTitle"
              placeholder="e.g. Family History Documents" 
              className="pl-10"
              value={title}
              onChange={handleTitleChange}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="documentRecipient" className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              id="documentRecipient"
              placeholder="e.g. James Anderson" 
              className="pl-10"
              value={recipient}
              onChange={handleRecipientChange}
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <FileUp className="mr-2 h-5 w-5 text-green-500" />
                Upload Documents
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {isUploading ? (
                <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <FileUp className="h-8 w-8 text-gray-400 mx-auto mb-3 animate-bounce" />
                  <p className="text-gray-600 mb-3">Uploading files...</p>
                  <Progress value={uploadProgress} className="h-2 mb-2" />
                  <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
                </div>
              ) : files.length === 0 ? (
                <label className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center block cursor-pointer hover:bg-gray-50 transition-colors">
                  <FileUp className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">Drag and drop documents here or click to browse</p>
                  <p className="text-sm text-gray-500 mb-4">Support for PDF, Word, Excel, JPG, PNG files</p>
                  <Button variant="outline">Browse Files</Button>
                  <input 
                    type="file" 
                    className="hidden" 
                    multiple 
                    onChange={handleFileUpload}
                  />
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)} • {new Date(file.lastModified).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex ml-2 gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-500 hover:text-gray-700"
                            onClick={() => toast({
                              title: "Preview Unavailable",
                              description: "File preview is only available for subscribed users."
                            })}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-500 hover:text-red-500"
                            onClick={() => removeFile(file.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <Button asChild variant="outline" className="w-full">
                      <label className="cursor-pointer">
                        <FileUp className="mr-2 h-4 w-4" />
                        Add More Files
                        <input 
                          type="file" 
                          className="hidden" 
                          multiple 
                          onChange={handleFileUpload}
                        />
                      </label>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <FileText className="mr-2 h-5 w-5 text-green-500" />
                Document Description
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <Textarea 
                placeholder="Add a description explaining the documents you're sharing and any special instructions for the recipient..." 
                className="min-h-[120px] resize-none"
                value={description}
                onChange={handleDescriptionChange}
              />
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  Tags
                </label>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1 bg-gray-50">
                      {tag}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 p-0 text-gray-500 hover:text-red-500"
                        onClick={() => removeTag(tag)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </Badge>
                  ))}
                  
                  {tags.length === 0 && (
                    <p className="text-sm text-gray-500">No tags added yet</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add a tag (e.g. Financial, Family, Legacy)"
                    value={newTag}
                    onChange={handleTagChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-grow"
                  />
                  <Button variant="outline" onClick={addTag}>Add</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Shield className="mr-2 h-5 w-5 text-green-500" />
                Security & Access
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <div className="flex items-start">
                  <Lock className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-green-700 mb-1">End-to-End Encryption</h3>
                    <p className="text-sm text-green-700 mb-2">
                      Your documents are protected with 256-bit AES encryption, ensuring only the intended recipient can access them.
                    </p>
                    
                    {isEncrypting ? (
                      <div className="flex items-center text-sm">
                        <Shield className="h-4 w-4 mr-1 text-green-600 animate-pulse" />
                        <span className="text-green-600">Encrypting documents...</span>
                      </div>
                    ) : files.length > 0 ? (
                      <div className="flex items-center text-sm">
                        <Shield className="h-4 w-4 mr-1 text-green-600" />
                        <span className="text-green-600">Documents encrypted</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-sm">
                        <AlertTriangle className="h-4 w-4 mr-1 text-amber-600" />
                        <span className="text-amber-600">No documents uploaded yet</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2 flex items-center">
                  <Key className="h-4 w-4 mr-1 text-gray-700" />
                  Access Controls
                </h3>
                
                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Require identity verification</span>
                    <Badge variant="outline" className="bg-willtank-50 text-willtank-700">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Allow document downloads</span>
                    <Badge variant="outline" className="bg-willtank-50 text-willtank-700">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Watermark documents</span>
                    <Badge variant="outline" className="bg-gray-100 text-gray-500">Optional</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Access expiration</span>
                    <Badge variant="outline" className="bg-gray-100 text-gray-500">None</Badge>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-3 flex items-center">
                  <Shield className="h-4 w-4 mr-1 text-gray-700" />
                  Document Status
                </h3>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Documents</span>
                    <span className="text-sm font-medium">{files.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Encryption</span>
                    <span className="text-sm font-medium text-green-600">256-bit AES</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Verification</span>
                    <span className="text-sm font-medium">2-factor</span>
                  </div>
                </div>
                
                <Button className="w-full mt-4" disabled={files.length === 0}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Document Package
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
