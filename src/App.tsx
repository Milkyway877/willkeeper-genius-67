
import React from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { FloatingAssistant } from '@/components/ui/FloatingAssistant';
import { Outlet } from 'react-router-dom';

// Add global mobile responsive styles
import './MobileStyles.css';

export default function App() {
  return (
    <>
      {/* Add Google Fonts for professional will document */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" />
      
      {/* Add styles for professional will preview and field highlighting */}
      <style type="text/css">
        {`
          .professional-will-preview {
            font-family: 'Times New Roman', serif;
            color: #333;
            line-height: 1.5;
            max-width: 100%;
            position: relative;
          }
          .professional-will-preview h1,
          .professional-will-preview h2 {
            font-family: 'Playfair Display', serif;
            color: #333;
          }
          
          /* Logo and watermark base64 fallback styles for when images can't load */
          .willtank-logo-fallback {
            display: inline-block;
            background: #8B5CF6;
            color: white;
            font-family: 'Playfair Display', serif;
            font-weight: bold;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
          }
          
          /* Will editing field styles */
          .editable-field {
            background-color: #FEF7CD;
            border-bottom: 2px dashed #F59E0B;
            padding: 0.2rem 0.4rem;
            border-radius: 0.25rem;
            position: relative;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .editable-field:hover {
            background-color: #FEF3B4;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          }
          
          .editable-field::after {
            content: "✏️";
            position: absolute;
            top: -0.75rem;
            right: -0.5rem;
            font-size: 0.75rem;
            opacity: 0;
            transition: opacity 0.2s ease;
          }
          
          .editable-field:hover::after {
            opacity: 1;
          }
          
          .empty-field {
            background-color: #FECACA;
            border: 1px dashed #EF4444;
          }
          
          /* Field focus styling */
          input:focus, textarea:focus {
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
          }
          
          /* Enhanced input field styling */
          .focus\:shadow-input:focus {
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          /* Highlight fields in the document */
          [class*="will-field-"] {
            background-color: #FFFBEB;
            border: 1px dotted #F59E0B;
            padding: 2px 4px;
            border-radius: 3px;
            cursor: pointer;
            position: relative;
          }
          
          [class*="will-field-"]:hover {
            background-color: #FEF3C7;
          }
          
          [class*="will-field-"]::before {
            content: "Click to edit";
            position: absolute;
            top: -20px;
            left: 0;
            background: #FBBF24;
            color: #78350F;
            font-size: 10px;
            padding: 2px 4px;
            border-radius: 3px;
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
          }
          
          [class*="will-field-"]:hover::before {
            opacity: 1;
          }
          
          /* Empty required field styling */
          .empty-required {
            background-color: #FEE2E2;
            border-color: #EF4444;
          }
          
          .empty-required::after {
            content: "*";
            color: #EF4444;
            font-weight: bold;
            margin-left: 2px;
          }
        `}
      </style>
      
      <Outlet />
      <Toaster />
      <FloatingAssistant />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
