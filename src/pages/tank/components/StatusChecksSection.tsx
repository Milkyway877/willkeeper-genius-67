
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DeathVerificationWidget } from '@/components/death-verification/DeathVerificationWidget';
import { VerificationStatusMonitor } from '@/components/death-verification/VerificationStatusMonitor';
import { Shield, AlertTriangle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StatusChecksSection = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleStatusChange = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h2 className="text-xl font-semibold">Status Checks</h2>
          <p className="text-muted-foreground text-sm">
            Monitor and manage your check-in status and verification process
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <DeathVerificationWidget key={refreshKey} />
          <VerificationStatusMonitor />
        </div>
        
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-willtank-600" />
                10-Way Protection System
              </CardTitle>
              <CardDescription>
                How our automated verification protects your will
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="default" className="bg-willtank-50 border-willtank-200">
                <Info className="h-4 w-4" />
                <AlertTitle>Regular Check-ins</AlertTitle>
                <AlertDescription className="text-sm">
                  Periodically confirm your status to keep your will secure.
                </AlertDescription>
              </Alert>
              
              <Alert variant="default" className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Automated Protection</AlertTitle>
                <AlertDescription className="text-sm">
                  If check-ins are missed, trusted contacts are alerted, then PIN codes are distributed to unlock your will.
                </AlertDescription>
              </Alert>
              
              <Link to="/check-ins">
                <Button variant="outline" className="w-full">
                  Advanced Check-in Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
