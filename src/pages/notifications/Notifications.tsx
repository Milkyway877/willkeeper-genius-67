
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Bell, Eye, FileText, Shield, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

type Notification = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'success' | 'warning' | 'info' | 'security';
  date: string;
  read: boolean;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Will Updated Successfully",
      description: "Your will document was successfully updated and encrypted.",
      icon: <FileText className="text-green-600" size={20} />,
      type: "success",
      date: "2 hours ago",
      read: false
    },
    {
      id: 2,
      title: "Security Alert: New Login",
      description: "A new login to your account was detected from a new device in Boston.",
      icon: <Shield className="text-amber-600" size={20} />,
      type: "security",
      date: "Yesterday",
      read: false
    },
    {
      id: 3,
      title: "Executor Invitation Accepted",
      description: "Casey Morgan has accepted your invitation to be an executor.",
      icon: <Users className="text-blue-600" size={20} />,
      type: "info",
      date: "2 days ago",
      read: true
    },
    {
      id: 4,
      title: "Legal Update: Trust Law Changes",
      description: "Recent changes to trust laws in your state may affect your estate planning.",
      icon: <AlertTriangle className="text-amber-600" size={20} />,
      type: "warning",
      date: "1 week ago",
      read: true
    },
    {
      id: 5,
      title: "ID Verification Completed",
      description: "Your identity verification has been successfully completed.",
      icon: <CheckCircle className="text-green-600" size={20} />,
      type: "success",
      date: "2 weeks ago",
      read: true
    }
  ]);

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-100';
      case 'warning': return 'bg-amber-50 border-amber-100';
      case 'info': return 'bg-blue-50 border-blue-100';
      case 'security': return 'bg-red-50 border-red-100';
      default: return 'bg-gray-50 border-gray-100';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications & Updates</h1>
            <p className="text-gray-600">Stay informed about your account, security, and legal updates.</p>
          </div>
          
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                Mark All as Read
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {notifications.map((notification, index) => (
            <motion.div 
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`p-6 rounded-xl border ${notification.read ? 'bg-white border-gray-200' : `${getTypeStyles(notification.type)} shadow-sm`} flex`}
            >
              <div className={`h-12 w-12 rounded-full flex items-center justify-center mr-4 ${
                notification.read ? 'bg-gray-100' : getTypeStyles(notification.type)
              }`}>
                {notification.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium">{notification.title}</h3>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-3">
                      {notification.date}
                    </span>
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Eye size={16} />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{notification.description}</p>
                
                {!notification.read && (
                  <div className="mt-4">
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {notifications.length === 0 && (
            <div className="bg-white p-8 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center">
              <Bell size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No notifications</h3>
              <p className="text-gray-500">You don't have any notifications at the moment.</p>
            </div>
          )}
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium mb-1">Security Alerts</p>
                  <p className="text-sm text-gray-500">Get notified about login attempts and security issues</p>
                </div>
                <div className="h-6 w-11 bg-willtank-500 rounded-full p-1 flex justify-end">
                  <div className="h-4 w-4 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium mb-1">Document Updates</p>
                  <p className="text-sm text-gray-500">Notifications when your will or documents are updated</p>
                </div>
                <div className="h-6 w-11 bg-willtank-500 rounded-full p-1 flex justify-end">
                  <div className="h-4 w-4 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium mb-1">Legal Changes</p>
                  <p className="text-sm text-gray-500">Updates about legal changes that may affect your will</p>
                </div>
                <div className="h-6 w-11 bg-willtank-500 rounded-full p-1 flex justify-end">
                  <div className="h-4 w-4 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium mb-1">Executor Activities</p>
                  <p className="text-sm text-gray-500">Notifications about executor verification and actions</p>
                </div>
                <div className="h-6 w-11 bg-willtank-500 rounded-full p-1 flex justify-end">
                  <div className="h-4 w-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
