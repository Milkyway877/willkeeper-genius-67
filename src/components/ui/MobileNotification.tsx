
import React from 'react';
import { X, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNotificationProps {
  onDismiss: () => void;
}

export function MobileNotification({ onDismiss }: MobileNotificationProps) {
  return (
    <div className="bg-willtank-50 border-b border-willtank-100 p-3 text-sm relative">
      <div className="flex items-center justify-center">
        <Monitor className="h-4 w-4 text-willtank-500 mr-2 flex-shrink-0" />
        <p className="text-gray-700">
          Using a mobile device? For the best experience, we recommend using WillTank on your computer.
        </p>
        <button 
          onClick={onDismiss}
          className="ml-2 p-1 text-gray-500 hover:text-gray-700 rounded-full"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
