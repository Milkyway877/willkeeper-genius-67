
import React, { useEffect, useRef } from 'react';

interface WillPreviewProps {
  content: string;
}

export function WillPreview({ content }: WillPreviewProps) {
  const prevContentRef = useRef<string>('');
  const contentDivRef = useRef<HTMLDivElement>(null);
  
  // Effect to highlight changes when content updates
  useEffect(() => {
    if (prevContentRef.current !== content && contentDivRef.current) {
      // Find the elements that might have changed
      const newContentLines = content.split('\n');
      const oldContentLines = prevContentRef.current.split('\n');
      
      // Update the reference for next comparison
      prevContentRef.current = content;
      
      // Apply subtle highlight animation to the content div
      if (contentDivRef.current) {
        contentDivRef.current.classList.add('preview-update-flash');
        setTimeout(() => {
          if (contentDivRef.current) {
            contentDivRef.current.classList.remove('preview-update-flash');
          }
        }, 1000);
      }
    }
  }, [content]);

  return (
    <div className="font-serif text-gray-800 p-6 bg-white">
      <style>
        {`
          @keyframes highlight-fade {
            0% { background-color: rgba(252, 211, 77, 0.3); }
            100% { background-color: transparent; }
          }
          .preview-update-flash {
            animation: highlight-fade 1s ease-out;
          }
          .updated-field {
            background-color: rgba(252, 211, 77, 0.1);
            border-bottom: 1px dashed #f59e0b;
            padding-bottom: 2px;
            transition: all 0.5s ease;
          }
          .highlight-section {
            animation: section-highlight 2s ease-out;
          }
          @keyframes section-highlight {
            0% { background-color: rgba(252, 211, 77, 0.3); }
            100% { background-color: transparent; }
          }
        `}
      </style>
    
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
          <p className="text-sm font-mono">{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
        </div>
      </div>
      
      <div ref={contentDivRef} className="whitespace-pre-wrap leading-relaxed">
        {content.split('\n').map((line, index) => {
          // Check if line is a heading (ALL CAPS)
          if (/^[A-Z\s]+:/.test(line) || /^ARTICLE [IVX]+:/.test(line) || /^ARTICLE [IVX]+/.test(line)) {
            return <h3 key={index} className="font-bold text-lg mt-6 mb-3">{line}</h3>;
          }
          // Check if line is empty
          else if (line.trim() === '') {
            return <div key={index} className="h-4"></div>;
          }
          // Check if line contains user information (likely to change)
          else if (line.includes('[') && line.includes(']')) {
            return <p key={index} className="mb-3 text-amber-700">{line}</p>;
          }
          // Check if line has just been updated with real info (no placeholders)
          else if (!/\[.*?\]/.test(line) && (
            line.includes('I, ') || 
            line.includes('married') || 
            line.includes('single') || 
            line.includes('divorced') || 
            line.includes('widowed') || 
            line.includes('children') || 
            line.includes('appoint')
          )) {
            return <p key={index} className="mb-3 font-medium updated-field">{line}</p>;
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
