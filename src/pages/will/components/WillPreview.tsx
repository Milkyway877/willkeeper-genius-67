
import React from 'react';

interface WillPreviewProps {
  content: string;
}

export function WillPreview({ content }: WillPreviewProps) {
  // Generate a unique document ID that's consistent for the same content
  const generateDocumentId = () => {
    // Use the first 8 characters of a hash of the content, or fallback to random ID
    const hashCode = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash).toString(36).substring(0, 8).toUpperCase();
    };
    
    return content ? hashCode(content) : Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  return (
    <div className="font-serif text-gray-800 p-6 bg-white">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-12 w-12 bg-willtank-500 rounded-md flex items-center justify-center mr-4">
            <span className="text-white font-bold">W</span>
          </div>
          <div>
            <p className="text-willtank-700 font-bold">WILLTANK</p>
            <p className="text-xs text-gray-500">Legal Document</p>
          </div>
        </div>
        <div className="border-2 border-gray-300 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-400">Document ID</p>
          <p className="text-sm font-mono">{generateDocumentId()}</p>
        </div>
      </div>
      
      <div className="whitespace-pre-wrap leading-relaxed">
        {content.split('\n').map((line, index) => {
          // Check if line is a heading (ALL CAPS)
          if (/^[A-Z\s]+:/.test(line) || /^ARTICLE [IVX]+:/.test(line) || /^ARTICLE [IVX]+/.test(line)) {
            return <h3 key={index} className="font-bold text-lg mt-6 mb-3">{line}</h3>;
          }
          // Check if line is empty
          else if (line.trim() === '') {
            return <div key={index} className="h-4"></div>;
          }
          // Regular line
          else {
            return <p key={index} className="mb-3">{line}</p>;
          }
        })}
      </div>
      
      <div className="mt-10 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-6">
          <div className="border-t-2 border-gray-400 pt-2">
            <p className="font-medium">Testator Signature</p>
            <p className="text-xs text-gray-500">Date: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="border-t-2 border-gray-400 pt-2">
            <p className="font-medium">Witness Signature</p>
            <p className="text-xs text-gray-500">Name: ________________</p>
          </div>
          <div className="border-t-2 border-gray-400 pt-2">
            <p className="font-medium">Witness Signature</p>
            <p className="text-xs text-gray-500">Name: ________________</p>
          </div>
        </div>
      </div>
      
      <div className="mt-10 pt-6 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          This document was created using WillTank's AI-assisted will creation platform.
          Please consult a legal professional before finalizing this document.
        </p>
      </div>
    </div>
  );
}
