
import React from 'react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Bell, Eye, CheckCircle, AlertTriangle, Shield, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

export function NotificationDropdown() {
  // Use a try-catch to handle cases where the context is not available
  let notificationsContext;
  try {
    notificationsContext = useNotifications();
  } catch (error) {
    // Return a simplified version of the dropdown when context is not available
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative" 
          >
            <Bell size={20} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 z-50 bg-white shadow-md border border-gray-200">
          <DropdownMenuLabel className="flex justify-between items-center">
            <span>Notifications</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="py-6 text-center">
            <Bell className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">Unable to load notifications</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="p-2 cursor-pointer justify-center"
          >
            <span className="text-willtank-600 text-sm font-medium">View all notifications</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  const { notifications, unreadCount, markAsRead } = notificationsContext;
  const navigate = useNavigate();
  
  // Get only unread notifications
  const unreadNotifications = notifications.filter(n => !n.read);

  // Helper functions
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'warning':
        return <AlertTriangle className="text-amber-600" size={16} />;
      case 'security':
        return <Shield className="text-red-600" size={16} />;
      case 'info':
      default:
        return <Info className="text-blue-600" size={16} />;
    }
  };

  const handleViewNotification = (id: string) => {
    markAsRead(id);
    navigate('/notifications');
  };

  const handleViewAllNotifications = () => {
    navigate('/notifications');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative" 
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-willtank-500 text-white text-xs rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 z-50 bg-white shadow-md border border-gray-200">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs bg-willtank-100 text-willtank-700 px-2 py-1 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[300px]">
          <DropdownMenuGroup>
            {unreadNotifications.length > 0 ? (
              unreadNotifications.slice(0, 5).map((notification) => (
                <DropdownMenuItem 
                  key={notification.id} 
                  className="p-3 cursor-pointer"
                  onClick={() => handleViewNotification(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-gray-500 truncate">{notification.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                    >
                      <Eye size={14} />
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="py-6 text-center">
                <Bell className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No unread notifications</p>
              </div>
            )}
            
            {unreadNotifications.length > 5 && (
              <p className="text-xs text-center text-gray-500 py-2">
                {unreadNotifications.length - 5} more unread notifications
              </p>
            )}
          </DropdownMenuGroup>
        </ScrollArea>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="p-2 cursor-pointer justify-center"
          onClick={handleViewAllNotifications}
        >
          <span className="text-willtank-600 text-sm font-medium">View all notifications</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
