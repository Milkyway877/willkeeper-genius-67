
import React, { useState } from 'react';
import { BellRing, Check, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

// Default notification values when context is not available
const defaultNotificationsState = {
  notifications: [],
  markAsRead: () => Promise.resolve(false),
  unreadCount: 0,
  loading: false,
  error: null
};

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Try to use the notifications context, but gracefully handle cases where it might not be available
  let notificationsState;
  try {
    notificationsState = useNotifications();
  } catch (error) {
    // If NotificationsProvider is not available, use default values
    console.warn("NotificationsContext not available, using default values");
    notificationsState = defaultNotificationsState;
  }
  
  const { notifications, markAsRead, unreadCount } = notificationsState;
  
  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(id);
  };
  
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <BellRing className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-willtank-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-willtank-600"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-medium">Notifications</h3>
          <Link to="/notifications" className="text-sm text-willtank-600 hover:underline">
            View all
          </Link>
        </div>
        
        {notifications && notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            <AnimatePresence>
              {notifications.slice(0, 5).map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DropdownMenuItem className="flex flex-col items-start p-3 cursor-default">
                    <div className="flex justify-between w-full mb-1">
                      <span className="font-medium text-sm">{notification.title}</span>
                      <div className="flex items-center space-x-1">
                        {!notification.read && (
                          <Badge variant="outline" className="text-xs bg-willtank-100 text-willtank-800 border-willtank-200">
                            New
                          </Badge>
                        )}
                        <button
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="ml-1 text-gray-400 hover:text-gray-600"
                        >
                          {notification.read ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{notification.description}</p>
                    <span className="text-xs text-gray-400 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </DropdownMenuItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-6 px-4 text-center">
            <BellRing className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No notifications yet</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
