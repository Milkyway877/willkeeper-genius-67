
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
  
  // Check if we're in a development or testing environment
  const isDev = () => {
    const hostname = window.location.hostname;
    console.log('Current hostname:', hostname);
    
    // Include more Lovable environments and development scenarios
    const devHosts = [
      'localhost',
      '127.0.0.1',
      'lovableproject.com',
      'lovable.app',
      'lovable.dev'
    ];
    
    // Check if hostname matches any dev patterns
    const isDevEnvironment = devHosts.some(host => 
      hostname === host || 
      hostname.includes(host) || 
      hostname.endsWith('.lovable.app') ||
      hostname.endsWith('.lovableproject.com') ||
      hostname.endsWith('.lovable.dev')
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <DashboardHeader />
          {showDebugTools && (
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
        
        {showDebug && showDebugTools && (
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
