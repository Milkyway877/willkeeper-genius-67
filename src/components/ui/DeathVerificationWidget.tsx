
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckInStatusDialog } from '@/components/ui/CheckInStatusDialog';
import { CheckCircle, Calendar, AlertTriangle, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { getDeathVerificationSettings } from '@/services/deathVerificationService';
import { useUserProfile } from '@/contexts/UserProfileContext';

export function DeathVerificationWidget() {
  const [loading, setLoading] = useState(true);
  const [deathVerificationEnabled, setDeathVerificationEnabled] = useState(false);
  const [checkInNeeded, setCheckInNeeded] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [nextCheckIn, setNextCheckIn] = useState<string | null>(null);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const { user } = useUserProfile();

  useEffect(() => {
    if (user) {
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      
      // Check if death verification is enabled
      const settings = await getDeathVerificationSettings();
      if (!settings) {
        setDeathVerificationEnabled(false);
        setLoading(false);
        return;
      }
      
      setDeathVerificationEnabled(settings.checkInEnabled);
      
      if (!settings.checkInEnabled) {
        setLoading(false);
        return;
      }
      
      // Get last check-in info
      const { data: checkInData, error: checkInError } = await supabase
        .from('death_verification_checkins')
        .select('*')
        .eq('user_id', user?.id)
        .order('checked_in_at', { ascending: false })
        .limit(1)
        .single();
        
      if (checkInError && checkInError.code !== 'PGRST116') {
        console.error('Error fetching check-in data:', checkInError);
      }
      
      if (checkInData) {
        setLastCheckIn(checkInData.checked_in_at);
        setNextCheckIn(checkInData.next_check_in);
        
        // Check if next check-in date has passed
        if (new Date(checkInData.next_check_in) <= new Date()) {
          setCheckInNeeded(true);
        } else {
          setCheckInNeeded(false);
        }
      } else {
        // No check-in record found, user needs to check in
        setCheckInNeeded(true);
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilNextCheckIn = (nextCheckInDate: string) => {
    const now = new Date();
    const next = new Date(nextCheckInDate);
    const diffTime = next.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40 mb-1" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!deathVerificationEnabled) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            Death Verification Disabled
          </CardTitle>
          <CardDescription>
            Your will is not protected by death verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Enable death verification to ensure your will is only accessible after your passing is confirmed.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/settings/death-verification'}
          >
            <Settings className="h-4 w-4 mr-2" />
            Enable Death Verification
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={checkInNeeded ? "border-amber-300 bg-amber-50" : ""}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            {checkInNeeded ? (
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            ) : (
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            )}
            Death Verification Status
          </CardTitle>
          <CardDescription>
            {checkInNeeded ? 
              "Action required: Please check in" : 
              "Your will is protected by death verification"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {checkInNeeded ? (
            <div className="space-y-4">
              <div className="bg-amber-100 p-3 rounded border border-amber-200">
                <p className="text-sm text-amber-800 font-medium">
                  {lastCheckIn ? 
                    "Your check-in period has expired" : 
                    "Initial check-in required"}
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Please confirm you're still alive to maintain control of your will
                </p>
              </div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  onClick={() => setCheckInDialogOpen(true)}
                >
                  Check In Now
                </Button>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Last check-in:</div>
                <div className="font-medium text-sm">{lastCheckIn ? formatDate(lastCheckIn) : "Never"}</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Next check-in:</div>
                <div className="font-medium text-sm">{nextCheckIn ? formatDate(nextCheckIn) : "Required now"}</div>
              </div>
              
              {nextCheckIn && (
                <div className="bg-green-50 p-3 rounded border border-green-200 mt-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-green-600 mr-2" />
                    <p className="text-sm text-green-700">
                      {getDaysUntilNextCheckIn(nextCheckIn)} days until next required check-in
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/settings/death-verification'}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                
                <Button 
                  size="sm"
                  onClick={() => setCheckInDialogOpen(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Check In Now
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <CheckInStatusDialog 
        open={checkInDialogOpen} 
        onOpenChange={(open) => {
          setCheckInDialogOpen(open);
          if (!open) {
            // Refresh data when dialog closes
            fetchVerificationStatus();
          }
        }}
      />
    </>
  );
}
