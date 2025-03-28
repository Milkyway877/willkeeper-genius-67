import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Users, Shield, Zap, CreditCard, Key, Bell, HelpCircle, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getDashboardSummary, getUserNotifications, getUserWills, getUserExecutors, getUserSubscription } from '@/services/dashboardService';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    willCount: 0,
    executorCount: 0,
    notificationCount: 0,
    securityStatus: 'Checking...'
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [userFirstName, setUserFirstName] = useState('User');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Get user session to extract first name
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.user_metadata?.first_name) {
          setUserFirstName(session.user.user_metadata.first_name);
        }
        
        // Load dashboard summary
        const summaryData = await getDashboardSummary();
        setSummary(summaryData);
        
        // Load recent activities
        const notifications = await getUserNotifications();
        const wills = await getUserWills();
        const subscription = await getUserSubscription();
        
        setSubscription(subscription);
        
        // Create activities from different data sources
        const recentActivities = [
          ...(wills.slice(0, 1).map(will => ({
            id: `will-${will.id}`,
            title: 'Will Updated',
            description: `You updated your ${will.title || 'primary will'} document.`,
            date: new Date(will.updated_at).toLocaleDateString(),
            icon: <FileText size={18} className="text-willtank-700" />
          }))),
          ...(notifications.slice(0, 2).map(notification => ({
            id: `notification-${notification.id}`,
            title: notification.title,
            description: notification.description,
            date: new Date(notification.date).toLocaleDateString(),
            icon: <Bell size={18} className="text-willtank-700" />
          })))
        ];
        
        if (recentActivities.length === 0) {
          // Fallback activities if no real data
          recentActivities.push(
            {
              id: 'activity-1',
              title: 'Welcome to WillTank',
              description: 'Create your first will to get started with estate planning.',
              date: 'Today',
              icon: <FileText size={18} className="text-willtank-700" />
            }
          );
        }
        
        setActivities(recentActivities);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: "Error loading dashboard",
          description: "Could not load some dashboard data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [toast]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userFirstName}</h1>
          <p className="text-gray-600">Here's an overview of your will management activity.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Active Wills</h3>
              <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center">
                <FileText size={20} className="text-willtank-500" />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-4" />
            ) : (
              <p className="text-3xl font-bold mb-4">{summary.willCount}</p>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Last updated recently</span>
              <Link to="/will">
                <Button variant="ghost" size="sm">View</Button>
              </Link>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Executors</h3>
              <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center">
                <Users size={20} className="text-willtank-500" />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-4" />
            ) : (
              <p className="text-3xl font-bold mb-4">{summary.executorCount}</p>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{summary.executorCount > 0 ? `${summary.executorCount - 1} pending verification` : 'None added yet'}</span>
              <Link to="/executors">
                <Button variant="ghost" size="sm">Manage</Button>
              </Link>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Security Status</h3>
              <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center">
                <Shield size={20} className="text-willtank-500" />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mb-4" />
            ) : (
              <p className="text-3xl font-bold text-green-500 mb-4">{summary.securityStatus}</p>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">2FA enabled</span>
              <Link to="/security">
                <Button variant="ghost" size="sm">Check</Button>
              </Link>
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <h3 className="text-xl font-medium mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Link to="/will/create">
                  <Button 
                    className="flex flex-col items-center justify-center h-auto py-6 w-full" 
                    variant="outline"
                  >
                    <Plus size={20} />
                    <span className="mt-2">Create New Will</span>
                  </Button>
                </Link>
                <Link to="/executors">
                  <Button 
                    className="flex flex-col items-center justify-center h-auto py-6 w-full" 
                    variant="outline"
                  >
                    <Users size={20} />
                    <span className="mt-2">Add Executor</span>
                  </Button>
                </Link>
                <Link to="/security">
                  <Button 
                    className="flex flex-col items-center justify-center h-auto py-6 w-full" 
                    variant="outline"
                  >
                    <Shield size={20} />
                    <span className="mt-2">Security Check</span>
                  </Button>
                </Link>
                <Link to="/encryption">
                  <Button 
                    className="flex flex-col items-center justify-center h-auto py-6 w-full" 
                    variant="outline"
                  >
                    <Key size={20} />
                    <span className="mt-2">Manage Keys</span>
                  </Button>
                </Link>
                <Link to="/notifications">
                  <Button 
                    className="flex flex-col items-center justify-center h-auto py-6 w-full" 
                    variant="outline"
                  >
                    <Bell size={20} />
                    <span className="mt-2">Notifications</span>
                  </Button>
                </Link>
                <Link to="/help">
                  <Button 
                    className="flex flex-col items-center justify-center h-auto py-6 w-full" 
                    variant="outline"
                  >
                    <HelpCircle size={20} />
                    <span className="mt-2">Get Help</span>
                  </Button>
                </Link>
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium">Recent Activity</h3>
                <Button variant="ghost" size="sm">View all</Button>
              </div>
              
              <div className="space-y-4">
                {isLoading ? (
                  Array(3).fill(0).map((_, index) => (
                    <div key={index} className="flex items-start gap-4 p-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))
                ) : activities.length > 0 ? (
                  activities.map((activity, index) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center flex-shrink-0">
                        {activity.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{activity.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-2">{activity.date}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Subscription</h3>
                <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center">
                  <CreditCard size={18} className="text-willtank-500" />
                </div>
              </div>
              
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-8 w-full mt-4" />
                </div>
              ) : subscription ? (
                <>
                  <div className="mb-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-willtank-100 px-3 py-1 text-xs font-medium text-willtank-700">
                      <Zap size={12} />
                      <span>{subscription.plan} Plan</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Your subscription renews on{' '}
                    <span className="font-medium">
                      {new Date(subscription.end_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </p>
                  
                  <Link to="/billing">
                    <Button className="w-full" variant="outline">Manage Plan</Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      <span>No Active Plan</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Subscribe to unlock premium features and secure your legacy.
                  </p>
                  
                  <Link to="/billing">
                    <Button className="w-full">Choose a Plan</Button>
                  </Link>
                </>
              )}
            </div>
            
            <div className="bg-willtank-50 p-6 rounded-xl border border-willtank-100">
              <h3 className="font-medium mb-4">AI Suggestions</h3>
              
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg border border-willtank-100 text-sm">
                  <p className="text-willtank-800 font-medium mb-1">Update your beneficiary details</p>
                  <p className="text-gray-600">Ensure proper asset distribution by completing all beneficiary information.</p>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-willtank-100 text-sm">
                  <p className="text-willtank-800 font-medium mb-1">Add emergency contacts</p>
                  <p className="text-gray-600">Improve security by adding emergency contacts to your account.</p>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-willtank-100 text-sm">
                  <p className="text-willtank-800 font-medium mb-1">Enable notifications</p>
                  <p className="text-gray-600">Stay updated about important changes to your will and documents.</p>
                </div>
              </div>
              
              <div className="mt-4">
                <Link to="/ai-assistance">
                  <Button variant="outline" className="w-full" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Ask AI Assistant
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
