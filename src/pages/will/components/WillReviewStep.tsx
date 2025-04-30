
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Copy, Loader2, Check, Save, Edit, FileText, Signature } from 'lucide-react';
import { WillPreview } from './WillPreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WillReviewStepProps {
  editableContent: string;
  splitView: boolean;
  setSplitView: (value: boolean) => void;
  handleContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleCopyToClipboard: () => void;
  responses: Record<string, any>;
  contacts: any[];
  selectedTemplate: any;
  isCreatingWill: boolean;
  progress: number;
  handleFinalizeWill: () => void;
}

export const WillReviewStep = ({
  editableContent,
  splitView,
  setSplitView,
  handleContentChange,
  handleCopyToClipboard,
  responses,
  contacts,
  selectedTemplate,
  isCreatingWill,
  progress,
  handleFinalizeWill,
}: WillReviewStepProps) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sections, setSections] = useState(() => {
    // Split the document into sections based on article headers
    const content = editableContent;
    const sectionRegex = /(ARTICLE [IVX]+:?[^\n]*)/g;
    const matches = [...content.matchAll(sectionRegex)];
    
    const parsedSections: Record<string, {title: string, content: string}> = {};
    
    matches.forEach((match, index) => {
      const sectionTitle = match[1];
      const startPos = match.index;
      const endPos = index < matches.length - 1 ? matches[index + 1].index : content.length;
      
      if (startPos !== undefined) {
        const sectionContent = content.substring(startPos, endPos);
        const sectionKey = `section-${index}`;
        parsedSections[sectionKey] = { title: sectionTitle, content: sectionContent };
      }
    });
    
    return parsedSections;
  });
  
  const [editedSections, setEditedSections] = useState<Record<string, string>>({});
  const [savedSections, setSavedSections] = useState<Set<string>>(new Set());
  const [hasSignature, setHasSignature] = useState(false);
  
  const handleEditSection = (sectionKey: string) => {
    setActiveSection(sectionKey);
    if (!editedSections[sectionKey]) {
      setEditedSections({
        ...editedSections,
        [sectionKey]: sections[sectionKey].content
      });
    }
  };
  
  const handleSaveSection = (sectionKey: string) => {
    const newSections = { ...sections };
    newSections[sectionKey].content = editedSections[sectionKey];
    setSections(newSections);
    setSavedSections(new Set(savedSections.add(sectionKey)));
    setActiveSection(null);
    
    // Update the full content
    const newContent = Object.values(newSections)
      .map(section => section.content)
      .join('\n\n');
      
    // Call the parent's handler with a simulated event
    handleContentChange({ target: { value: newContent } } as React.ChangeEvent<HTMLTextAreaElement>);
  };
  
  const handleSectionChange = (sectionKey: string, value: string) => {
    setEditedSections({
      ...editedSections,
      [sectionKey]: value
    });
  };
  
  const addSignature = () => {
    setHasSignature(true);
    
    // Add the current date to the signature line
    const currentDate = new Date().toLocaleDateString();
    const signatureText = `\n\nSigned on ${currentDate} by ${responses.fullName || 'Testator'}\n[Digital Signature Applied]`;
    
    // Update the content with the signature
    const newContent = editableContent + signatureText;
    handleContentChange({ target: { value: newContent } } as React.ChangeEvent<HTMLTextAreaElement>);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Will Preview</CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSplitView(!splitView)}
              >
                {splitView ? "Single View" : "Split View"}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyToClipboard}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>
          <CardDescription>
            Review your will document before finalizing it. You can edit individual sections if needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="preview">Document Preview</TabsTrigger>
              <TabsTrigger value="edit">Edit Document</TabsTrigger>
              <TabsTrigger value="sections">Edit Sections</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="border rounded-md p-6 bg-gray-50">
              <div className="max-h-[50vh] overflow-y-auto">
                <WillPreview content={editableContent} />
              </div>
            </TabsContent>
            
            <TabsContent value="edit">
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4">Edit Document</h3>
                <textarea
                  value={editableContent}
                  onChange={handleContentChange}
                  className="w-full min-h-[50vh] p-4 border rounded-md text-sm font-mono"
                ></textarea>
              </div>
            </TabsContent>
            
            <TabsContent value="sections">
              <div className="border rounded-md p-6">
                <h3 className="font-medium mb-4">Edit Individual Sections</h3>
                
                <div className="space-y-4">
                  {Object.entries(sections).map(([key, section]) => (
                    <div key={key} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{section.title}</h4>
                        {activeSection === key ? (
                          <div className="space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setActiveSection(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleSaveSection(key)}
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save Section
                            </Button>
                          </div>
                        ) : (
                          <div>
                            {savedSections.has(key) && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 mr-2">
                                <Check className="h-3 w-3 mr-1" />
                                Saved
                              </Badge>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditSection(key)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {activeSection === key ? (
                        <textarea
                          value={editedSections[key]}
                          onChange={(e) => handleSectionChange(key, e.target.value)}
                          className="w-full min-h-[200px] p-4 border rounded-md text-sm font-mono"
                        ></textarea>
                      ) : (
                        <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap text-sm">
                          {section.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Will Details</CardTitle>
          <CardDescription>
            Summary of the information you've provided
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Personal Information</h4>
                <p className="mt-1">{responses.fullName || 'Not specified'}</p>
                <p className="text-sm text-gray-500">
                  {responses.maritalStatus || 'Not specified'}{responses.spouseName ? `, married to ${responses.spouseName}` : ''}
                </p>
              </div>
              
              {contacts.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Key People</h4>
                  <div className="mt-1 space-y-1">
                    {contacts.map((contact, i) => (
                      <div key={i} className="flex items-center">
                        <Badge variant="outline" className="mr-2">{contact.role}</Badge>
                        <span>{contact.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Template</h4>
                <p className="mt-1">{selectedTemplate?.title}</p>
              </div>
              
              <div className="bg-willtank-50 p-4 rounded-md border border-willtank-100">
                <h4 className="text-sm font-medium text-willtank-700 mb-2">Note</h4>
                <p className="text-sm text-gray-600">
                  After finalizing your will, you can add supporting documents and video testimony using the Tank page.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-500 mb-4">Digital Signature</h4>
            
            {hasSignature ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-600">Digital Signature Applied</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Your will has been digitally signed on {new Date().toLocaleDateString()}
                </p>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={addSignature}
                className="w-full"
              >
                <Signature className="h-4 w-4 mr-2" />
                Add Digital Signature
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {isCreatingWill ? (
        <div className="text-center space-y-4">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500">
            {progress < 30 && "Generating your will document..."}
            {progress >= 30 && progress < 60 && "Processing your information..."}
            {progress >= 60 && progress < 90 && "Finalizing document structure..."}
            {progress >= 90 && "Securing and saving your will..."}
          </p>
          <Button disabled className="mx-auto">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleFinalizeWill}
          className="w-full"
          size="lg"
          disabled={!hasSignature}
        >
          <FileText className="mr-2 h-4 w-4" />
          {hasSignature ? "Finalize and Save Will" : "Please Add Signature First"}
        </Button>
      )}
    </div>
  );
};
