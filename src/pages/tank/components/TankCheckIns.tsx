import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, AlertTriangle, Check, Clock, Info, Share2, UserPlus, Plus } from 'lucide-react';
import { FrequencyInterval, Message } from '../types';
import { Link } from 'react-router-dom';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { respondToCheckIn, sendStatusChecks } from '@/services/tankService';
import { useToast } from '@/hooks/use-toast';

interface TankCheckInsProps {
  checkIns: Message[];
  onRefresh: () => void;
}

export const TankCheckIns = ({ checkIns, onRefresh }: TankCheckInsProps) => {
  const { toast } = useToast();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingStatusChecks, setSendingStatusChecks] = useState(false);
  
  // Filter messages that are check-ins
  const checkInMessages = checkIns.filter(msg => msg.message_type === 'check-in');
  
  const handleConfirmCheckIn = async (id: string) => {
    setLoading(true);
    setConfirmingId(id);
    
    try {
      const success = await respondToCheckIn(id);
      if (success) {
        toast({
          title: "Check-in Confirmed",
          description: "You've successfully responded to this check-in.",
        });
        onRefresh();
      } else {
        toast({
          title: "Error",
          description: "Failed to confirm check-in. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error confirming check-in:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setConfirmingId(null);
    }
  };
  
  const handleSendStatusChecks = async () => {
    setSendingStatusChecks(true);
    try {
      const success = await sendStatusChecks();
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to send status checks. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending status checks:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setSendingStatusChecks(false);
    }
  };

  const formatFrequency = (frequency: FrequencyInterval | undefined) => {
    if (!frequency) return 'One-time';
    
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Every 3 months';
      case 'yearly': return 'Yearly';
      default: return frequency;
    }
  };

  const getLastResponseDate = (message: Message) => {
    if (!message.message_url) return null;
    
    try {
      const date = parseISO(message.message_url);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return message.message_url;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center">
            <Bell className="mr-2 h-5 w-5 text-willtank-600" />
            Check-ins
          </h2>
          <p className="text-sm text-gray-500">
            Manage your recurring check-ins and respond to verification requests
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleSendStatusChecks}
            disabled={sendingStatusChecks}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Send Status Checks
          </Button>
          <Link to="/tank/creation?type=check-in">
            <Button variant="default">
              <Plus className="h-4 w-4 mr-2" />
              New Check-in
            </Button>
          </Link>
        </div>
      </div>
      
      {checkInMessages.length === 0 ? (
        <Card>
          <CardContent className="py-6">
            <div className="text-center">
              <Bell className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-1">No Check-ins Yet</h3>
              <p className="text-gray-500 mb-4">
                Create a check-in message that will be sent to you regularly
              </p>
              <Link to="/tank/creation?type=check-in">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Check-in
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checkInMessages.map(message => (
            <Card key={message.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-medium">{message.title}</CardTitle>
                  <Badge>{formatFrequency(message.frequency as FrequencyInterval)}</Badge>
                </div>
                <CardDescription className="line-clamp-1">
                  {message.preview}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-3 text-sm">
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className="font-medium">
                      {message.status === 'delivered' ? 'Active' : message.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last response:</span>
                    <span className="font-medium">
                      {getLastResponseDate(message) || 'Never'}
                    </span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => handleConfirmCheckIn(message.id)}
                  disabled={loading && confirmingId === message.id}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {loading && confirmingId === message.id 
                    ? 'Confirming...' 
                    : 'Confirm Well-Being'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <Link to="/tank/trusted-contacts">
        <Card className="bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center">
              <UserPlus className="h-5 w-5 text-willtank-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium">Manage Trusted Contacts</h3>
                <p className="text-xs text-gray-500">
                  Add or edit trusted contacts who can verify your status
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              Manage
            </Button>
          </CardContent>
        </Card>
      </Link>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Check-ins help ensure your future messages are only delivered when intended.
          Regular responses confirm your well-being to the system.
        </AlertDescription>
      </Alert>
    </div>
  );
};
