
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Clipboard } from 'lucide-react';
import { WillPreview } from './WillPreview';

interface WillReviewStepProps {
  editableContent: string;
  splitView: boolean;
  setSplitView: (split: boolean) => void;
  handleContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleCopyToClipboard: () => void;
  responses: Record<string, any>;
  contacts: any[];
  documents: any[];
  videoBlob: Blob | null;
  selectedTemplate: {
    id: string;
    name: string;
  };
  isCreatingWill: boolean;
  progress: number;
  handleFinalizeWill: () => void;
  lastUpdatedField?: string | null;
}

export function WillReviewStep({
  editableContent,
  splitView,
  setSplitView,
  handleContentChange,
  handleCopyToClipboard,
  responses,
  contacts,
  documents,
  videoBlob,
  selectedTemplate,
  isCreatingWill,
  progress,
  handleFinalizeWill,
  lastUpdatedField
}: WillReviewStepProps) {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Review Your Will</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSplitView(!splitView)}
          >
            {splitView ? "Single View" : "Split View"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyToClipboard}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>
      </div>

      <div className={splitView ? "flex flex-col md:flex-row gap-6" : "space-y-6"}>
        <div className={splitView ? "w-full md:w-1/2 border rounded-lg overflow-auto" : "border rounded-lg"} style={{maxHeight: '800px'}}>
          <div className="p-2 bg-slate-50 border-b">
            <h3 className="font-medium">Document Preview</h3>
          </div>
          <div className="p-4">
            <WillPreview 
              content={editableContent} 
              showHighlights={true}
              lastUpdatedField={lastUpdatedField}
            />
          </div>
        </div>

        {splitView && (
          <div className="w-full md:w-1/2 border rounded-lg">
            <div className="p-2 bg-slate-50 border-b">
              <h3 className="font-medium">Edit Document</h3>
            </div>
            <div className="p-4">
              <textarea
                value={editableContent}
                onChange={handleContentChange}
                className="w-full min-h-[600px] p-4 border rounded-lg font-mono text-sm"
              ></textarea>
            </div>
          </div>
        )}
      </div>

      {responses && Object.keys(responses).length > 0 && (
        <div className="border rounded-lg">
          <div className="p-2 bg-slate-50 border-b">
            <h3 className="font-medium">Extracted Information</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(responses)
                .filter(([key, value]) => key !== 'updatedFields' && key !== 'lastUpdatedField')
                .map(([key, value]) => (
                  <div key={key} className="border rounded p-3">
                    <div className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div className="font-medium">
                      {Array.isArray(value)
                        ? value.join(', ')
                        : typeof value === 'object'
                          ? JSON.stringify(value)
                          : String(value)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {documents && documents.length > 0 && (
        <div className="border rounded-lg">
          <div className="p-2 bg-slate-50 border-b">
            <h3 className="font-medium">Supporting Documents</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {documents.map((doc, index) => (
                <div key={index} className="border rounded p-3 flex items-center">
                  <Clipboard className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <div className="font-medium truncate">{doc.name}</div>
                    <div className="text-xs text-gray-500">{doc.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {contacts && contacts.length > 0 && (
        <div className="border rounded-lg">
          <div className="p-2 bg-slate-50 border-b">
            <h3 className="font-medium">Will Contacts</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {contacts.map((contact, index) => (
                <div key={index} className="border rounded p-3">
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-sm">{contact.role}</div>
                  {contact.email && (
                    <div className="text-sm text-gray-500">{contact.email}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {videoBlob && (
        <div className="border rounded-lg">
          <div className="p-2 bg-slate-50 border-b">
            <h3 className="font-medium">Video Testament</h3>
          </div>
          <div className="p-4">
            <video
              src={URL.createObjectURL(videoBlob)}
              controls
              className="w-full rounded"
              style={{maxHeight: "300px"}}
            />
          </div>
        </div>
      )}
    </div>
  );
}
