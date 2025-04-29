
import React from 'react';
import { Sidebar } from './Sidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { Toaster } from '@/components/ui/toaster';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-[var(--sidebar-width)] transition-all duration-200">
          <main className="container mx-auto px-4 py-4">
            {children}
          </main>
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};
