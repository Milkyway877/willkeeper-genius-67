
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TrialCountdownProps {
  trialEnd: string;
  onUpgrade: () => void;
}

export const TrialCountdown: React.FC<TrialCountdownProps> = ({ trialEnd, onUpgrade }) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const end = new Date(trialEnd).getTime();
      const difference = end - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [trialEnd]);

  const { days, hours, minutes, seconds } = timeRemaining;
  const isExpiringSoon = days === 0 && hours < 24;
  const hasExpired = days === 0 && hours === 0 && minutes === 0 && seconds === 0;

  if (hasExpired) {
    return (
      <Card className="p-4 border-red-200 bg-red-50">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span className="font-semibold text-red-700">Trial Expired</span>
        </div>
        <p className="text-sm text-red-600 mb-3">
          Your free trial has ended. Subscribe now to continue using premium features.
        </p>
        <Button onClick={onUpgrade} className="w-full bg-red-600 hover:bg-red-700">
          Subscribe Now
        </Button>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${isExpiringSoon ? 'border-amber-200 bg-amber-50' : 'border-willtank-200 bg-willtank-50'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Clock className={`h-5 w-5 ${isExpiringSoon ? 'text-amber-500' : 'text-willtank-500'}`} />
        <Badge variant={isExpiringSoon ? 'destructive' : 'default'}>
          Free Trial Active
        </Badge>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="text-center">
          <div className={`text-lg font-bold ${isExpiringSoon ? 'text-amber-700' : 'text-willtank-700'}`}>
            {days}
          </div>
          <div className="text-xs text-gray-500">Days</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${isExpiringSoon ? 'text-amber-700' : 'text-willtank-700'}`}>
            {hours}
          </div>
          <div className="text-xs text-gray-500">Hours</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${isExpiringSoon ? 'text-amber-700' : 'text-willtank-700'}`}>
            {minutes}
          </div>
          <div className="text-xs text-gray-500">Min</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${isExpiringSoon ? 'text-amber-700' : 'text-willtank-700'}`}>
            {seconds}
          </div>
          <div className="text-xs text-gray-500">Sec</div>
        </div>
      </div>
      
      <p className={`text-sm mb-3 ${isExpiringSoon ? 'text-amber-600' : 'text-willtank-600'}`}>
        {isExpiringSoon 
          ? 'Your trial expires soon! Subscribe now to continue access.'
          : 'Enjoying your trial? Subscribe anytime to continue after trial ends.'
        }
      </p>
      
      <Button 
        onClick={onUpgrade} 
        variant={isExpiringSoon ? 'default' : 'outline'}
        className={`w-full ${isExpiringSoon ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
      >
        {isExpiringSoon ? 'Subscribe Before Trial Ends' : 'Subscribe Now'}
      </Button>
    </Card>
  );
};
