
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
      
      {/* Add styles for professional will preview */}
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
        `}
      </style>
      
      <Outlet />
      <Toaster />
      <FloatingAssistant />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
