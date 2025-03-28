
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface AccountActivationBarProps {
  onActivateClick: () => void;
}

export function AccountActivationBar({ onActivateClick }: AccountActivationBarProps) {
  return (
    <div className="w-full bg-[#ea384c] border-b border-red-700 py-3 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 text-white mr-2 flex-shrink-0" />
        <p className="text-white font-medium">
          Your account is not active. No real data will be saved —
          <span className="font-bold"> ACTIVATE YOUR ACCOUNT NOW</span>
        </p>
      </div>
      <Button 
        variant="outline"
        size="sm"
        onClick={onActivateClick}
        className="whitespace-nowrap ml-4 bg-white text-red-600 hover:bg-gray-100 hover:text-red-700 border-white"
      >
        Activate Account
      </Button>
    </div>
  );
}
