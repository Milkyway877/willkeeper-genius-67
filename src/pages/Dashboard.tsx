
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { FileText, Mail, Shield, Box, Activity, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const [lastLogin, setLastLogin] = useState<string>("Unknown");
  
  useEffect(() => {
    // Simulate fetching last login time
    setLastLogin(new Date().toLocaleDateString() + " at " + new Date().toLocaleTimeString());
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.full_name || 'User'}</h1>
          <p className="text-muted-foreground">
            Here's an overview of your digital legacy planning
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/settings')}>
            Settings
          </Button>
          <Button onClick={() => navigate('/dashboard/wills/create')}>
            Create New Will
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Wills Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2 text-blue-500" />
              <span className="text-2xl font-bold">3</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Last updated 2 days ago</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Future Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-green-500" />
              <span className="text-2xl font-bold">7</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">2 scheduled for delivery</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-green-500" />
              <span className="text-lg font-bold">Protected</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">All systems secure</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Legacy Vault Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Box className="h-4 w-4 mr-2 text-purple-500" />
              <span className="text-2xl font-bold">12</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">4 documents, 8 credentials</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Will Document Updated</p>
                  <p className="text-xs text-muted-foreground">Added digital asset provisions</p>
                  <p className="text-xs text-gray-400">Today at 10:24 AM</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Mail className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Future Message Created</p>
                  <p className="text-xs text-muted-foreground">Added message for spouse</p>
                  <p className="text-xs text-gray-400">Yesterday at 4:52 PM</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Box className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Legacy Vault Updated</p>
                  <p className="text-xs text-muted-foreground">Added insurance policy documents</p>
                  <p className="text-xs text-gray-400">April 23, 2025</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full" size="sm" onClick={() => navigate('/dashboard/activity')}>
                <Activity className="h-4 w-4 mr-2" />
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>Get help with your legacy planning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h4 className="font-medium text-sm flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                  Will Recommendations
                </h4>
                <p className="text-sm mt-1">Your will hasn't been updated in 3 months. Consider reviewing your digital asset allocations.</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => navigate('/dashboard/wills')}>
                  Review Will
                </Button>
              </div>
              
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                <h4 className="font-medium text-sm flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-purple-500" />
                  Security Check Due
                </h4>
                <p className="text-sm mt-1">It's time for your quarterly security review to ensure all your information is up-to-date.</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => navigate('/dashboard/security')}>
                  Run Security Check
                </Button>
              </div>
              
              <Button className="w-full" onClick={() => navigate('/dashboard/ai')}>
                Ask AI Assistant
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you might want to perform</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" onClick={() => navigate('/dashboard/wills/create')}>
            <FileText className="h-5 w-5 mb-2" />
            <span>Create New Will</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" onClick={() => navigate('/dashboard/messages/create')}>
            <Mail className="h-5 w-5 mb-2" />
            <span>New Future Message</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" onClick={() => navigate('/dashboard/vault/create')}>
            <Box className="h-5 w-5 mb-2" />
            <span>Add to Legacy Vault</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" onClick={() => navigate('/dashboard/templates')}>
            <FileText className="h-5 w-5 mb-2" />
            <span>Browse Templates</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
