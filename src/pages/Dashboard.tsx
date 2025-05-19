
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Bell, TimerReset } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { getDashboardSummary } from '@/services/dashboardService';
import { DeathVerificationWidget } from '@/components/death-verification/DeathVerificationWidget';

export default function Dashboard() {
  const { data: dashboardSummary, isLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: getDashboardSummary
  });
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Security Status Card */}
          <Card className="border rounded-lg shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Shield className="mr-2 h-5 w-5 text-green-500" />
                <h3 className="font-medium text-lg">Security Status</h3>
              </div>
              
              {isLoading ? (
                <p className="text-gray-600 mb-4">Loading security status...</p>
              ) : (
                <p className="text-gray-600 mb-4">
                  Your account security is: <span className={`font-medium ${
                    dashboardSummary?.securityStatus === 'Good' ? 'text-green-600' : 
                    dashboardSummary?.securityStatus === 'Strong' ? 'text-green-700' :
                    'text-amber-600'
                  }`}>{dashboardSummary?.securityStatus}</span>
                </p>
              )}
              
              <Link to="/settings">
                <Button variant="outline" className="w-full">
                  Security Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Death Verification Widget */}
          <DeathVerificationWidget />
          
          {/* Tank Quick Access Card */}
          <Card className="border rounded-lg shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <TimerReset className="mr-2 h-5 w-5 text-willtank-600" />
                <h3 className="font-medium text-lg">The Tank</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Create and manage future messages, trusted contacts, and automated check-ins all in one place.
              </p>
              <Link to="/tank">
                <Button variant="outline" className="w-full">
                  Go to The Tank
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Death Verification Testing Card */}
          <Card className="border rounded-lg shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                <h3 className="font-medium text-lg">Death Verification Testing</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Test the death verification flow to ensure your will is properly protected and can be accessed when needed.
              </p>
              <Link to="/test-death-verification">
                <Button variant="outline" className="w-full">
                  Test Death Verification Flow
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Check-ins Card */}
          <Card className="border rounded-lg shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Bell className="mr-2 h-5 w-5 text-blue-500" />
                <h3 className="font-medium text-lg">Check-ins</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Set up automatic check-ins that require your response. If you miss them, trusted contacts will be notified.
              </p>
              <Link to="/tank?tab=check-ins">
                <Button variant="outline" className="w-full">
                  Manage Check-ins
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
