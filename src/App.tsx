
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import VerifyEmailBanner from './pages/auth/VerifyEmailBanner';
import { useToast } from './hooks/use-toast';
import { Toaster } from './components/ui/toaster';

function App() {
  const { toast } = useToast();
  
  return (
    <div className="app">
      <VerifyEmailBanner />
      <Outlet />
      <Toaster />
    </div>
  );
}

export default App;
