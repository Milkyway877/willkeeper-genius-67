
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardActions } from '@/components/dashboard/DashboardActions';
import { DashboardRecentActivity } from '@/components/dashboard/DashboardRecentActivity';
import { NotificationTester } from '@/components/debug/NotificationTester';
import { Button } from '@/components/ui/button';
import { Bug } from 'lucide-react';

export default function Dashboard() {
  const [showDebug, setShowDebug] = useState(false);
  
  // Always show debug tools in development/testing environments
  const isDev = () => {
    const hostname = window.location.hostname;
    const href = window.location.href;
    
    console.log('Current hostname:', hostname);
    console.log('Current href:', href);
    
    // More comprehensive detection for Lovable and development environments
    const isDevEnvironment = (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.includes('lovable') ||
      hostname.includes('lovableproject') ||
      href.includes('lovable') ||
      href.includes('preview') ||
      process.env.NODE_ENV === 'development' ||
      // Always show in non-production environments
      !hostname.includes('www.') // Most production sites use www
    );
    
    console.log('Is development environment:', isDevEnvironment);
    return isDevEnvironment;
  };
  
  // Show debug tools in development
  useEffect(() => {
    if (isDev()) {
      console.log('Development mode detected - debug tools available');
    }
  }, []);

  const showDebugTools = isDev();
  
  // Force show debug tools for now to ensure functionality
  const forceShowDebug = true;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <DashboardHeader />
          {(showDebugTools || forceShowDebug) && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDebug(!showDebug)}
              className="ml-4"
            >
              <Bug className="h-4 w-4 mr-1" />
              Debug Tools
            </Button>
          )}
        </div>
        
        {showDebug && (showDebugTools || forceShowDebug) && (
          <div className="mb-6">
            <NotificationTester />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <DashboardStats />
            <DashboardActions />
          </div>
          <div>
            <DashboardRecentActivity />
          </div>
        </div>
      </div>
    </Layout>
  );
}
