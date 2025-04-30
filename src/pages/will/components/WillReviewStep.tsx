
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Copy, Loader2, Check } from 'lucide-react';
import { WillPreview } from './WillPreview';

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
            Review your will document before finalizing it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`${splitView ? 'flex flex-col md:flex-row gap-6' : 'space-y-6'}`}>
            <div className={`${splitView ? 'w-full md:w-1/2' : ''} border rounded-md p-6 bg-gray-50`}>
              <h3 className="font-medium mb-4">Document Preview</h3>
              <div className="max-h-[50vh] overflow-y-auto">
                <WillPreview content={editableContent} />
              </div>
            </div>
            
            {splitView && (
              <div className="w-full md:w-1/2 border rounded-md p-6">
                <h3 className="font-medium mb-4">Edit Document</h3>
                <textarea
                  value={editableContent}
                  onChange={handleContentChange}
                  className="w-full min-h-[50vh] p-4 border rounded-md text-sm font-mono"
                ></textarea>
              </div>
            )}
          </div>
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
        >
          <Check className="mr-2 h-4 w-4" />
          Finalize and Save Will
        </Button>
      )}
    </div>
  );
};
