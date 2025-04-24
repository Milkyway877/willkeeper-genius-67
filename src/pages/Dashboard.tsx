import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Users, Shield, Zap, CreditCard, Key, Bell, HelpCircle, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { getDashboardSummary, getUserNotifications, getUserWills, getUserExecutors, getUserSubscription } from '@/services/dashboardService';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { DeathVerificationWidget } from '@/components/death-verification/DeathVerificationWidget';
import { AccountActivationBar } from '@/components/auth/AccountActivationBar';
import { AccountActivationSuccessBanner } from '@/components/auth/AccountActivationSuccessBanner';

export default function Dashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    willCount: 0,
    executorCount: 0,
    notificationCount: 0,
    securityStatus: 'Good'
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showActivationSuccess, setShowActivationSuccess] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        let summaryData;
        try {
          summaryData = await getDashboardSummary();
        } catch (error) {
          console.error('Error loading dashboard summary:', error);
          summaryData = {
            willCount: 0,
            executorCount: 0,
            notificationCount: 0,
            securityStatus: 'Unknown'
          };
        }
        setSummary(summaryData);
        
        let notifications = [], wills = [], executors = [], subscription = null;
        
        try {
          notifications = await getUserNotifications();
        } catch (error) {
          console.error('Error loading notifications:', error);
          notifications = [];
        }
        
        try {
          wills = await getUserWills();
        } catch (error) {
          console.error('Error loading wills:', error);
          wills = [];
        }
        
        try {
          executors = await getUserExecutors();
        } catch (error) {
          console.error('Error loading executors:', error);
          executors = [];
        }
        
        try {
          subscription = await getUserSubscription();
        } catch (error) {
          console.error('Error loading subscription:', error);
          subscription = null;
        }
        
        setSubscription(subscription);
        
        const recentActivities = [
          ...wills.slice(0, 1).map(will => ({
            id: `will-${will.id}`,
            title: 'Will Updated',
            description: `You updated your ${will.title || 'primary will'} document.`,
            date: new Date(will.updated_at).toLocaleDateString(),
            icon: <FileText size={18} className="text-willtank-700" />
          })),
          ...notifications.slice(0, 2).map(notification => ({
            id: `notification-${notification.id}`,
            title: notification.title,
            description: notification.description,
            date: new Date(notification.created_at).toLocaleDateString(),
            icon: <Bell size={18} className="text-willtank-700" />
          }))
        ];
        
        if (wills.length === 0 && notifications.length === 0 && executors.length === 0) {
          setIsNewUser(true);
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
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('activated') === 'true') {
      setShowActivationSuccess(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleActivateAccount = () => {
    navigate('/auth/activate');
  };

  const NewUserWelcome = () => (
    <div className="bg-willtank-50 p-6 rounded-xl border border-willtank-100 mb-6">
      <h3 className="text-lg font-medium mb-3">Welcome to WillTank</h3>
      <p className="text-gray-600 mb-4">
        This is your personal dashboard where you'll manage your will, digital assets, and future messages.
        Here are some steps to get started:
      </p>
      <ul className="space-y-2 mb-4">
        <li className="flex items-start gap-2">
          <div className="h-5 w-5 rounded-full bg-willtank-100 flex items-center justify-center mt-0.5 flex-shrink-0">
            <span className="text-xs font-medium text-willtank-700">1</span>
          </div>
          <span className="text-gray-700">Create your first will document</span>
        </li>
        <li className="flex items-start gap-2">
          <div className="h-5 w-5 rounded-full bg-willtank-100 flex items-center justify-center mt-0.5 flex-shrink-0">
            <span className="text-xs font-medium text-willtank-700">2</span>
          </div>
          <span className="text-gray-700">Add executors who will handle your estate</span>
        </li>
        <li className="flex items-start gap-2">
          <div className="h-5 w-5 rounded-full bg-willtank-100 flex items-center justify-center mt-0.5 flex-shrink-0">
            <span className="text-xs font-medium text-willtank-700">3</span>
          </div>
          <span className="text-gray-700">Set up your security measures</span>
        </li>
      </ul>
      <Link to="/will/create">
        <Button className="w-full">Get Started</Button>
      </Link>
    </div>
  );

  return (
    <Layout>
      {profile && !profile.is_activated && (
        <AccountActivationBar onActivateClick={handleActivateAccount} />
      )}
      {showActivationSuccess && <AccountActivationSuccessBanner />}
      
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Welcome{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}</h1>
          <p className="text-gray-600">
            {isNewUser 
              ? "Let's help you get started with managing your estate." 
              : "Here's an overview of your will management activity."}
          </p>
        </motion.div>
        
        {isNewUser && <NewUserWelcome />}
        
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
              <span className="text-sm text-gray-500">
                {summary.willCount > 0 
                  ? "Last updated recently" 
                  : "No wills created yet"}
              </span>
              <Link to="/dashboard/will">
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
              <span className="text-sm text-gray-500">
                {summary.executorCount > 0 
                  ? `${summary.executorCount} ${summary.executorCount === 1 ? 'executor' : 'executors'} added` 
                  : "None added yet"}
              </span>
              <Link to="/pages/executors/Executors">
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
              <span className="text-sm text-gray-500">
                {isNewUser ? "Security setup pending" : "Your account is secure"}
              </span>
              <Link to="/pages/security/IDSecurity">
                <Button variant="ghost" size="sm">Check</Button>
              </Link>
            </div>
          </div>
          
          <DeathVerificationWidget />
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
                <Link to="/pages/executors/Executors">
                  <Button 
                    className="flex flex-col items-center justify-center h-auto py-6 w-full" 
                    variant="outline"
                  >
                    <Users size={20} />
                    <span className="mt-2">Add Executor</span>
                  </Button>
                </Link>
                <Link to="/pages/security/IDSecurity">
                  <Button 
                    className="flex flex-col items-center justify-center h-auto py-6 w-full" 
                    variant="outline"
                  >
                    <Shield size={20} />
                    <span className="mt-2">Security Check</span>
                  </Button>
                </Link>
                <Link to="/pages/encryption/Encryption">
                  <Button 
                    className="flex flex-col items-center justify-center h-auto py-6 w-full" 
                    variant="outline"
                  >
                    <Key size={20} />
                    <span className="mt-2">Manage Keys</span>
                  </Button>
                </Link>
                <Link to="/pages/notifications/Notifications">
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
                {activities.length > 0 && (
                  <Button variant="ghost" size="sm">View all</Button>
                )}
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
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <FileText className="h-6 w-6 text-gray-400" />
                    </div>
                    <h4 className="text-gray-600 font-medium mb-1">No activity yet</h4>
                    <p className="text-gray-500 text-sm">Your recent actions will appear here</p>
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
                      <span>Free Plan</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Upgrade to unlock premium features and secure your legacy.
                  </p>
                  
                  <Link to="/billing">
                    <Button className="w-full">Choose a Plan</Button>
                  </Link>
                </>
              )}
            </div>
            
            <div className="bg-willtank-50 p-6 rounded-xl border border-willtank-100">
              <h3 className="font-medium mb-4">AI Assistant</h3>
              
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg border border-willtank-100 text-sm">
                  <p className="text-willtank-800 font-medium mb-1">Need help getting started?</p>
                  <p className="text-gray-600">Our AI assistant can guide you through the process.</p>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-willtank-100 text-sm">
                  <p className="text-willtank-800 font-medium mb-1">Have questions?</p>
                  <p className="text-gray-600">Ask about will creation, executors, or any other topics.</p>
                </div>
              </div>
              
              <div className="mt-4">
                <Link to="/pages/ai/AIAssistance">
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
