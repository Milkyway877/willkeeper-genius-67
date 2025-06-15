
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Timer, Crown, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Add source to props
interface CountdownBannerProps {
  timeRemaining: number;
  formattedTimeRemaining: string;
  urgencyLevel: 'normal' | 'high' | 'critical';
  triggerSource?: "will" | "tank-message";
}

export function CountdownBanner({ 
  timeRemaining, 
  formattedTimeRemaining, 
  urgencyLevel,
  triggerSource
}: CountdownBannerProps) {
  const navigate = useNavigate();

  const getBannerStyle = () => {
    switch (urgencyLevel) {
      case 'critical':
        return {
          bgColor: 'bg-red-600',
          textColor: 'text-white',
          borderColor: 'border-red-700',
          buttonColor: 'bg-white text-red-600 hover:bg-gray-100',
          animate: 'animate-pulse'
        };
      case 'high':
        return {
          bgColor: 'bg-orange-500',
          textColor: 'text-white',
          borderColor: 'border-orange-600',
          buttonColor: 'bg-white text-orange-600 hover:bg-gray-100',
          animate: ''
        };
      default:
        return {
          bgColor: 'bg-amber-500',
          textColor: 'text-white',
          borderColor: 'border-amber-600',
          buttonColor: 'bg-white text-amber-600 hover:bg-gray-100',
          animate: ''
        };
    }
  };

  const getBannerText = () => {
    if (triggerSource === "tank-message") {
      return (
        <>
          {urgencyLevel === 'critical' ? '🚨 URGENT:' : '⏰'} 
          {" "}
          You have created a Tank message. Upgrade to keep your messages securely stored. 
          <span className="font-mono font-bold text-lg bg-black bg-opacity-20 px-2 py-1 rounded mx-2">{formattedTimeRemaining}</span>
          left before they are deleted.
        </>
      );
    }
    // default is will
    return (
      <>
        {urgencyLevel === 'critical' ? '🚨 URGENT:' : '⏰'} 
        {" "}
        You have created a Will. Upgrade to keep your will document securely stored. 
        <span className="font-mono font-bold text-lg bg-black bg-opacity-20 px-2 py-1 rounded mx-2">{formattedTimeRemaining}</span>
        left before it is deleted.
      </>
    );
  };

  const style = getBannerStyle();

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  return (
    <div className={`${style.bgColor} ${style.textColor} border-b ${style.borderColor} ${style.animate}`}>
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {urgencyLevel === 'critical' ? (
              <AlertTriangle className="h-5 w-5 animate-bounce" />
            ) : (
              <Timer className="h-5 w-5" />
            )}
            <div className="flex items-center gap-2">
              {getBannerText()}
            </div>
            <span className="text-sm opacity-90">
              Upgrade to WillTank to keep it safe forever
            </span>
          </div>
          
          <Button 
            size="sm" 
            onClick={handleUpgrade}
            className={`${style.buttonColor} font-medium`}
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  );
}
