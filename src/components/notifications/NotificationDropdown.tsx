
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from './NotificationBell';
import { NotificationItem } from './NotificationItem';
import { useSimpleNotifications } from '@/hooks/useSimpleNotifications';
import { Bell } from 'lucide-react';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, loading, markAsRead } = useSimpleNotifications();

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div>
          <NotificationBell />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          <Link 
            to="/notifications" 
            className="text-sm text-willtank-600 hover:underline" 
            onClick={() => setIsOpen(false)}
          >
            View all
          </Link>
        </div>
        
        {loading ? (
          <div className="p-4 text-center">
            <Bell className="h-8 w-8 mx-auto text-gray-300 animate-pulse" />
            <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="max-h-80 overflow-y-auto">
            {notifications.slice(0, 5).map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No notifications yet</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
