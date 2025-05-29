
import React from 'react';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SimpleNotification } from '@/hooks/useSimpleNotifications';

interface NotificationItemProps {
  notification: SimpleNotification;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-100';
      case 'warning': return 'bg-amber-50 border-amber-100';
      case 'security': return 'bg-red-50 border-red-100';
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className={`p-4 cursor-default ${notification.read ? 'bg-white' : getTypeColor(notification.type)}`}>
      <div className="flex justify-between items-start mb-1">
        <span className="font-medium text-sm">{notification.title}</span>
        <div className="flex items-center space-x-2 ml-2">
          {!notification.read && (
            <Badge variant="outline" className="text-xs bg-willtank-100 text-willtank-800">
              New
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
          >
            {notification.read ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
            )}
          </Button>
        </div>
      </div>
      <p className="text-sm text-gray-600">{notification.description}</p>
      <span className="text-xs text-gray-400 mt-1 block">
        {new Date(notification.created_at).toLocaleDateString()}
      </span>
    </div>
  );
}
