
import React from 'react';
import { FileText, Save } from 'lucide-react';

interface WillPreviewProps {
  content: string;
  lastSaved: Date | null;
}

export function WillPreview({ content, lastSaved }: WillPreviewProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center">
          <FileText className="text-willtank-700 mr-2" size={18} />
          <h3 className="font-medium">Last Will and Testament</h3>
        </div>
        <div className="text-xs text-gray-500 flex items-center">
          {lastSaved && (
            <>
              <Save size={14} className="mr-1" />
              Last saved at {lastSaved.toLocaleTimeString()}
            </>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
}
