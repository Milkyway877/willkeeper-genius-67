
import React, { useState, useEffect } from 'react';
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
import { toast } from '@/hooks/use-toast';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [lastFetched, setLastFetched] = useState(0);
  
  const { 
    notifications, 
    markAsRead, 
    unreadCount, 
    fetchNotifications, 
    loading 
  } = useNotifications();
  
  // Refresh notifications when dropdown is opened
  useEffect(() => {
    if (isOpen && fetchNotifications && Date.now() - lastFetched > 30000) {
      fetchNotifications();
      setLastFetched(Date.now());
    }
  }, [isOpen, fetchNotifications, lastFetched]);
  
  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent dropdown from closing
    try {
      const success = await markAsRead(id);
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to mark notification as read",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
        >
          <BellRing className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-willtank-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-willtank-600"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          <Link to="/notifications" className="text-sm text-willtank-600 hover:underline" onClick={() => setIsOpen(false)}>
            View all
          </Link>
        </div>
        
        {loading ? (
          <div className="p-4 text-center">
            <BellRing className="h-8 w-8 mx-auto text-gray-300 animate-pulse" />
            <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
          </div>
        ) : notifications && notifications.length > 0 ? (
          <AnimatePresence>
            {notifications.slice(0, 5).map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <DropdownMenuItem className="p-4 cursor-default">
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">{notification.title}</span>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <Badge variant="outline" className="text-xs bg-willtank-100 text-willtank-800">
                            New
                          </Badge>
                        )}
                        <button
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {notification.read ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{notification.description}</p>
                    <span className="text-xs text-gray-400 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                </DropdownMenuItem>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="p-8 text-center">
            <BellRing className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No notifications yet</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
