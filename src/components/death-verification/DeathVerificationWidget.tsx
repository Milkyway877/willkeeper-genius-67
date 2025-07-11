import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format, formatDistanceToNow, addDays, isValid } from 'date-fns';
import { parseISO } from 'date-fns';
import { Shield, CheckSquare, AlertTriangle, AlertCircle, Clock, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  getDeathVerificationSettings,
  getLatestCheckin,
  performCheckin,
  DeathVerificationCheckin,
  DeathVerificationSettings
} from '@/services/deathVerificationService';
import { useNotificationTriggers } from '@/hooks/use-notification-triggers';

export function DeathVerificationWidget() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { triggerDeathVerificationCheckIn } = useNotificationTriggers();
  
  const [checkin, setCheckin] = useState<DeathVerificationCheckin | null>(null);
  const [settings, setSettings] = useState<DeathVerificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('DeathVerificationWidget: Fetching data...');
      
      const fetchedSettings = await getDeathVerificationSettings();
      const latestCheckin = await getLatestCheckin();
      
      console.log('DeathVerificationWidget: Settings:', fetchedSettings);
      console.log('DeathVerificationWidget: Latest checkin:', latestCheckin);
      
      setSettings(fetchedSettings);
      setCheckin(latestCheckin);
    } catch (error) {
      console.error('DeathVerificationWidget: Error fetching verification data:', error);
      toast({
        title: "Error",
        description: "Failed to load check-in information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCheckin = async () => {
    try {
      setCheckingIn(true);
      console.log('DeathVerificationWidget: Performing check-in...');
      
      const newCheckin = await performCheckin();
      
      if (newCheckin) {
        console.log('DeathVerificationWidget: Check-in successful:', newCheckin);
        setCheckin(newCheckin);
        await triggerDeathVerificationCheckIn();
        
        toast({
          title: "Check-in Successful",
          description: "Your check-in has been recorded successfully.",
          variant: "default"
        });
      } else {
        throw new Error("Failed to perform check-in");
      }
    } catch (error) {
      console.error('DeathVerificationWidget: Error during check-in:', error);
      toast({
        title: "Check-in Failed",
        description: "There was an error recording your check-in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCheckingIn(false);
    }
  };
  
  const handleConfigureSettings = () => {
    console.log('DeathVerificationWidget: Navigating to check-ins settings...');
    // Navigate to check-ins page with settings tab active
    navigate('/check-ins', { 
      state: { activeTab: 'settings' },
      replace: false // Don't replace current history entry
    });
  };
  
  // Get status based on next check-in date
  const getStatus = () => {
    if (!checkin || !settings) return 'unknown';
    
    try {
      const now = new Date();
      const nextCheckIn = checkin.next_check_in ? parseISO(checkin.next_check_in) : null;
      
      if (!nextCheckIn || !isValid(nextCheckIn)) return 'unknown';
      
      const gracePeriodEnd = addDays(nextCheckIn, settings.grace_period);
      
      if (now > gracePeriodEnd) {
        return 'overdue';
      } else if (now > nextCheckIn) {
        return 'grace-period';
      }
      return 'active';
    } catch (error) {
      console.error('Error determining status:', error);
      return 'unknown';
    }
  };
  
  const status = checkin && settings ? getStatus() : 'unknown';
  
  // Helper function to safely format dates
  const safeFormatDate = (dateString: string | undefined | null, formatStr: string): string => {
    if (!dateString) return 'Not set';
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Invalid date';
      return format(date, formatStr);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  // Helper function to safely calculate time distance
  const safeFormatDistance = (dateString: string | undefined | null): string => {
    if (!dateString) return '';
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return '';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error calculating time distance:', error);
      return '';
    }
  };

  // Safe function to calculate grace period end date
  const safeCalculateGracePeriod = (nextCheckInDate: string | undefined | null, gracePeriod: number | undefined): string => {
    if (!nextCheckInDate || !gracePeriod) return 'Not set';
    try {
      const date = parseISO(nextCheckInDate);
      if (!isValid(date)) return 'Invalid date';
      
      const endDate = addDays(date, gracePeriod);
      if (!isValid(endDate)) return 'Invalid date';
      
      return format(endDate, 'PPP');
    } catch (error) {
      console.error('Error calculating grace period:', error);
      return 'Not set';
    }
  };

  // If no settings or not enabled, show setup required
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-7 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-12 w-full bg-gray-200 rounded mb-4"></div>
          <div className="h-20 w-full bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }
  
  // If death verification is not enabled
  if (!settings?.check_in_enabled) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-amber-600">
            <Shield className="h-5 w-5 mr-2" />
            Check-In System Disabled
          </CardTitle>
          <CardDescription>
            Enable the Check-In System to protect your will and digital legacy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-amber-50 text-amber-800 border-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Not Protected</AlertTitle>
            <AlertDescription>
              Your will is not protected by our check-in verification system. Enable check-ins in the settings tab below to ensure your will is only accessible upon verified absence.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={handleConfigureSettings} 
            className="w-full"
          >
            Configure Check-In Settings
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center ${
          status === 'active' ? 'text-green-600' : 
          status === 'grace-period' ? 'text-amber-600' : 
          'text-red-600'
        }`}>
          <Shield className="h-5 w-5 mr-2" />
          {status === 'active' 
            ? 'Check-In System Active' 
            : status === 'grace-period' 
              ? 'Check-In Required' 
              : 'Check-In Overdue'}
          <Bot className="h-4 w-4 ml-2 text-willtank-600" />
        </CardTitle>
        <CardDescription>
          {checkin 
            ? `Last checked in ${safeFormatDistance(checkin.checked_in_at)} • GODMODE automation active`
            : 'No previous check-ins found • GODMODE automation ready'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        {status === 'active' && (
          <Alert className="bg-green-50 text-green-800 border-green-200 mb-4">
            <CheckSquare className="h-4 w-4" />
            <AlertTitle>Status: Protected by GODMODE</AlertTitle>
            <AlertDescription>
              Your will is protected by our automated check-in system. Next check-in due {checkin ? safeFormatDistance(checkin.next_check_in) : 'soon'}. 
              GODMODE will automatically notify your contacts if you miss check-ins.
            </AlertDescription>
          </Alert>
        )}
        
        {status === 'grace-period' && (
          <Alert className="bg-amber-50 text-amber-800 border-amber-200 mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Check-In Needed - GODMODE Monitoring</AlertTitle>
            <AlertDescription>
              Your check-in is {checkin && checkin.next_check_in ? safeFormatDistance(checkin.next_check_in) : ''} overdue. 
              GODMODE automation will begin notifying your contacts soon. Please check in to prevent notifications.
            </AlertDescription>
          </Alert>
        )}
        
        {status === 'overdue' && (
          <Alert className="bg-red-50 text-red-800 border-red-200 mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>🚨 GODMODE Activated</AlertTitle>
            <AlertDescription>
              Your check-in is critically overdue. GODMODE automation has likely notified your contacts. 
              Please check in immediately to stop the verification process.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-400" />
                Next check-in due
              </span>
              <span className={`font-medium ${
                status === 'active' ? 'text-green-600' : 
                status === 'grace-period' ? 'text-amber-600' : 
                'text-red-600'
              }`}>
                {checkin ? safeFormatDate(checkin.next_check_in, 'PPP') : 'Not set'}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Grace period ends</span>
              <span className="font-medium">
                {safeCalculateGracePeriod(checkin?.next_check_in, settings?.grace_period)}
              </span>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Check-in frequency</span>
            <span>{settings?.check_in_frequency} days</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Grace period</span>
            <span>{settings?.grace_period} days</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4">
        <Button 
          onClick={handleCheckin} 
          disabled={checkingIn}
          className="w-full"
          variant={status === 'active' ? 'outline' : 'default'}
        >
          {checkingIn ? (
            <>
              <span className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></span>
              Checking In...
            </>
          ) : (
            'Check In Now'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
