import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, Check, AlertTriangle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { 
  getDeathVerificationSettings, 
  getLatestCheckin, 
  processCheckin, 
  DeathVerificationCheckin
} from '@/services/deathVerificationService';

export function DeathVerificationWidget() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinEnabled, setCheckinEnabled] = useState(false);
  const [checkin, setCheckin] = useState<DeathVerificationCheckin | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  
  useEffect(() => {
    fetchVerificationStatus();
  }, []);
  
  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      
      const settings = await getDeathVerificationSettings();
      
      if (settings) {
        setCheckinEnabled(settings.check_in_enabled);
        
        if (settings.check_in_enabled) {
          const latestCheckin = await getLatestCheckin();
          
          if (latestCheckin) {
            setCheckin(latestCheckin);
            
            const nextCheckInDate = parseISO(latestCheckin.next_check_in);
            const today = new Date();
            const days = differenceInDays(nextCheckInDate, today);
            setDaysRemaining(days);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCheckin = async () => {
    try {
      setCheckinLoading(true);
      
      const updatedCheckin = await processCheckin('alive');
      
      if (updatedCheckin) {
        setCheckin(updatedCheckin);
        
        const nextCheckInDate = parseISO(updatedCheckin.next_check_in);
        const today = new Date();
        const days = differenceInDays(nextCheckInDate, today);
        setDaysRemaining(days);
        
        toast({
          title: "Check-in Successful",
          description: "You have successfully checked in. Thank you!",
        });
      } else {
        throw new Error("Failed to process check-in");
      }
    } catch (error) {
      console.error('Error processing check-in:', error);
      toast({
        title: "Check-in Failed",
        description: "There was an error processing your check-in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCheckinLoading(false);
    }
  };
  
  const navigateToSettings = () => {
    navigate('/check-ins');
  };
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-willtank-600" />
            Check-ins
          </CardTitle>
          <CardDescription>Loading check-in status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-20 flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-willtank-600 border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!checkinEnabled) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-willtank-600" />
            Check-ins
          </CardTitle>
          <CardDescription>Protect your will with our automated check-in system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-amber-50 rounded-md">
            <h3 className="font-medium text-amber-800 flex items-center mb-2">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Check-in system is disabled
            </h3>
            <p className="text-sm text-amber-700">
              Enable check-ins to ensure your will is only accessible after verified absence confirmation.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={navigateToSettings} className="w-full">Enable Check-ins</Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5 text-willtank-600" />
          Check-ins
        </CardTitle>
        <CardDescription>
          {checkin && daysRemaining !== null 
            ? `Next check-in in ${daysRemaining} days`
            : 'Protect your will with regular check-ins'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {checkin ? (
          <>
            <div className={`p-4 ${daysRemaining && daysRemaining <= 2 ? 'bg-amber-50' : 'bg-green-50'} rounded-md mb-4`}>
              <h3 className={`font-medium flex items-center mb-2 ${daysRemaining && daysRemaining <= 2 ? 'text-amber-800' : 'text-green-800'}`}>
                {daysRemaining && daysRemaining <= 2 ? (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Check-in required soon
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Your status is confirmed
                  </>
                )}
              </h3>
              <p className={`text-sm ${daysRemaining && daysRemaining <= 2 ? 'text-amber-700' : 'text-green-700'}`}>
                {daysRemaining && daysRemaining <= 2 
                  ? `Your next check-in is in ${daysRemaining} days. Please confirm you're alive by clicking the button below.`
                  : `Last check-in: ${format(parseISO(checkin.checked_in_at), 'PPP')}. Your next check-in is on ${format(parseISO(checkin.next_check_in), 'PPP')}.`}
              </p>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 flex items-center">
                <User className="h-4 w-4 mr-1" />
                Status: <span className="font-medium text-green-600 ml-1">Alive & Well</span>
              </div>
              
              <Button
                onClick={handleCheckin}
                disabled={checkinLoading}
                size="sm"
                variant={daysRemaining && daysRemaining <= 2 ? "default" : "outline"}
              >
                {checkinLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </span>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    I'm Alive
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="p-4 bg-amber-50 rounded-md">
            <h3 className="font-medium text-amber-800 flex items-center mb-2">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Initial check-in required
            </h3>
            <p className="text-sm text-amber-700">
              Please confirm your status to activate the death verification system.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="link" onClick={navigateToSettings} className="px-0">
          Check-in Settings
        </Button>
      </CardFooter>
    </Card>
  );
}
