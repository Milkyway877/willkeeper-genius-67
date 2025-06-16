
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

export default App;
