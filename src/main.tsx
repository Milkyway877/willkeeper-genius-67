
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';

// Handle redirects from 404.html
const maybeRedirect = () => {
  const redirectPath = sessionStorage.getItem('redirect_path');
  if (redirectPath) {
    sessionStorage.removeItem('redirect_path');
    window.history.replaceState(null, '', redirectPath);
  }
};

// Try to handle redirect before rendering
maybeRedirect();

// Mount the React application
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
