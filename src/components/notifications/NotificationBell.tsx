
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSimpleNotifications } from '@/hooks/useSimpleNotifications';

interface NotificationBellProps {
  onClick?: () => void;
  className?: string;
}

export function NotificationBell({ onClick, className = "" }: NotificationBellProps) {
  const { unreadCount, notifications, loading } = useSimpleNotifications();

  return (
    <Button 
      variant="ghost" 
      size="icon"
      className={`relative ${className}`}
      onClick={onClick}
      aria-label="Show notifications"
    >
      <Bell className="h-5 w-5" />
      {(unreadCount > 0 && !loading) && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-xs font-bold rounded-full flex items-center justify-center animate-fade-in"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
}

