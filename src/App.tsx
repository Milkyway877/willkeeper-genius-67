
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
          }
          .professional-will-preview h1,
          .professional-will-preview h2 {
            font-family: 'Playfair Display', serif;
            color: #333;
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
