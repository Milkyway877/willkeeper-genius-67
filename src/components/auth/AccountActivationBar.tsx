
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface AccountActivationBarProps {
  onActivateClick: () => void;
}

export function AccountActivationBar({ onActivateClick }: AccountActivationBarProps) {
  return (
    <div className="bg-amber-50 border-b border-amber-200 py-2 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
          <span className="text-sm text-amber-800">Your account needs to be activated</span>
        </div>
        <Button size="sm" variant="outline" onClick={onActivateClick}>
          Activate Now
        </Button>
      </div>
    </div>
  );
}
