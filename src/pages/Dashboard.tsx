
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Shield, Zap, CreditCard, Key, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getDashboardSummary } from '@/services/dashboardService';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { AccountActivationBar } from '@/components/auth/AccountActivationBar';

export default function Dashboard() {
  const { toast } = useToast();
  const { profile } = useUserProfile();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    securityStatus: 'Good'
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const summaryData = await getDashboardSummary();
        setSummary(summaryData);
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

  const handleActivateAccount = () => {
    window.location.href = '/auth/activate';
  };

  return (
    <Layout>
      {profile && !profile.is_activated && (
        <AccountActivationBar onActivateClick={handleActivateAccount} />
      )}
      
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Welcome{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-gray-600">
            Here's an overview of your account activity.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >          
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
              <span className="text-sm text-gray-500">Your account is secure</span>
              <Link to="/pages/security/IDSecurity">
                <button className="text-sm text-willtank-600 hover:text-willtank-700">Check</button>
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Account Status</h3>
              <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center">
                <Key size={20} className="text-willtank-500" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-4">Active</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Account in good standing</span>
              <Link to="/settings">
                <button className="text-sm text-willtank-600 hover:text-willtank-700">Manage</button>
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Subscription</h3>
              <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center">
                <CreditCard size={20} className="text-willtank-500" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-4">Free</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Basic plan features</span>
              <Link to="/settings/billing">
                <button className="text-sm text-willtank-600 hover:text-willtank-700">Upgrade</button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
