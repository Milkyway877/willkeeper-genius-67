
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface AccountActivationBarProps {
  onActivateClick: () => void;
}

export function AccountActivationBar({ onActivateClick }: AccountActivationBarProps) {
  return (
    <div className="w-full bg-red-100 border-b border-red-200 py-3 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
        <p className="text-red-700 font-medium">
          Your account is not active. No real data will be saved —
          <span className="font-bold"> ACTIVATE YOUR ACCOUNT NOW</span>
        </p>
      </div>
      <Button 
        variant="destructive"
        size="sm"
        onClick={onActivateClick}
        className="whitespace-nowrap ml-4"
      >
        Activate Account
      </Button>
    </div>
  );
}
