
import React, { useEffect, useRef, useState } from 'react';

interface WillPreviewProps {
  content: string;
}

export function WillPreview({ content }: WillPreviewProps) {
  const prevContentRef = useRef<string>('');
  const contentDivRef = useRef<HTMLDivElement>(null);
  const [lastUpdatedField, setLastUpdatedField] = useState<string | null>(null);
  const fieldRefs = useRef<Map<string, HTMLElement>>(new Map());
  
  // Log when content changes to help with debugging
  useEffect(() => {
    console.log("[WillPreview] Content updated:", content ? content.substring(0, 50) + "..." : "empty");
  }, [content]);
  
  // Effect to highlight changes and scroll when content updates
  useEffect(() => {
    if (prevContentRef.current !== content && contentDivRef.current) {
      console.log("[WillPreview] Content changed, applying highlight");
      
      // Find the elements that might have changed
      const newContentLines = content.split('\n');
      const oldContentLines = prevContentRef.current.split('\n');
      
      // Find which section was updated
      let updatedSection: string | null = null;
      
      // Check for changes in sections
      for (let i = 0; i < newContentLines.length; i++) {
        const newLine = newContentLines[i];
        const oldLine = i < oldContentLines.length ? oldContentLines[i] : '';
        
        if (newLine !== oldLine) {
          // Check if this line is a heading
          if (/^[A-Z\s]+:/.test(newLine) || /^ARTICLE [IVX]+:/.test(newLine) || /^ARTICLE [IVX]+/.test(newLine)) {
            updatedSection = newLine.replace(/:/g, '').trim();
          } 
          // If it's not a heading but it changed, look for the nearest heading above
          else {
            for (let j = i; j >= 0; j--) {
              const possibleHeading = newContentLines[j];
              if (/^[A-Z\s]+:/.test(possibleHeading) || /^ARTICLE [IVX]+:/.test(possibleHeading) || /^ARTICLE [IVX]+/.test(possibleHeading)) {
                updatedSection = possibleHeading.replace(/:/g, '').trim();
                break;
              }
            }
          }
        }
        
        // Once we find an updated section, no need to continue
        if (updatedSection) break;
      }
      
      if (updatedSection) {
        setLastUpdatedField(updatedSection);
      }
      
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
  
  // Effect to scroll to the last updated field
  useEffect(() => {
    if (lastUpdatedField && fieldRefs.current.has(lastUpdatedField)) {
      const element = fieldRefs.current.get(lastUpdatedField);
      if (element) {
        // Add highlight-section class to the element
        element.classList.add('highlight-section');
        
        // Scroll the element into view
        setTimeout(() => {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          
          // Remove highlight after animation completes
          setTimeout(() => {
            element.classList.remove('highlight-section');
          }, 2000);
        }, 100);
      }
    }
  }, [lastUpdatedField]);

  // Function to add a ref to a field element
  const addFieldRef = (id: string, element: HTMLHeadingElement | HTMLParagraphElement | null) => {
    if (element) {
      fieldRefs.current.set(id, element);
    }
  };
  
  // Process the will content to identify each field and section
  const processWillContent = () => {
    if (!content) return null;
    
    const lines = content.split('\n');
    let currentSection: string | null = null;
    
    return lines.map((line, index) => {
      // Check if line is a heading (ALL CAPS)
      if (/^[A-Z\s]+:/.test(line) || /^ARTICLE [IVX]+:/.test(line) || /^ARTICLE [IVX]+/.test(line)) {
        currentSection = line.replace(/:/g, '').trim();
        const isHighlighted = currentSection === lastUpdatedField;
        
        return (
          <h3 
            key={`section-${index}`} 
            ref={(el) => addFieldRef(currentSection || `section-${index}`, el)}
            className={`font-bold text-lg mt-6 mb-3 ${isHighlighted ? 'highlight-section' : ''}`}
            id={`section-${currentSection?.replace(/\s+/g, '-').toLowerCase() || index}`}
          >
            {line}
            {isHighlighted && (
              <span className="ml-2 text-amber-500 animate-pulse">•</span>
            )}
          </h3>
        );
      }
      // Check if line is empty
      else if (line.trim() === '') {
        return <div key={`empty-${index}`} className="h-4"></div>;
      }
      // Check if line contains placeholder information (likely to change)
      else if (line.includes('[') && line.includes(']')) {
        return (
          <p 
            key={`placeholder-${index}`}
            className="mb-3 text-amber-700"
          >
            {line}
          </p>
        );
      }
      // Check if line has real user information (no placeholders)
      else if (!/\[.*?\]/.test(line) && (
        line.includes('I, ') || 
        line.includes('married') || 
        line.includes('single') || 
        line.includes('divorced') || 
        line.includes('widowed') || 
        line.includes('children') || 
        line.includes('appoint')
      )) {
        const isUpdated = currentSection === lastUpdatedField;
        
        return (
          <p 
            key={`info-${index}`}
            ref={(el) => addFieldRef(`info-${currentSection || index}`, el)}
            className={`mb-3 font-medium updated-field ${isUpdated ? 'newly-updated' : ''}`}
            id={`field-${index}`}
          >
            {line}
            {isUpdated && (
              <span className="ml-2 text-amber-500 animate-pulse text-xs">• Updated</span>
            )}
          </p>
        );
      }
      // Regular line
      else {
        return <p key={`line-${index}`} className="mb-3">{line}</p>;
      }
    });
  };

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
          .newly-updated {
            background-color: rgba(252, 211, 77, 0.3);
            border-left: 3px solid #f59e0b;
            padding-left: 8px;
          }
          .highlight-section {
            animation: section-highlight 2s ease-out;
          }
          @keyframes section-highlight {
            0% { background-color: rgba(252, 211, 77, 0.3); }
            100% { background-color: transparent; }
          }
          .field-updated-indicator {
            position: absolute;
            right: 12px;
            color: #f59e0b;
            font-size: 14px;
          }
          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }
          .animate-pulse {
            animation: pulse 1.5s infinite;
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
      
      <div ref={contentDivRef} className="whitespace-pre-wrap leading-relaxed relative">
        {content && content.length > 0 ? (
          processWillContent()
        ) : (
          <p className="text-center text-gray-500 my-12">Creating your will document...</p>
        )}
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
