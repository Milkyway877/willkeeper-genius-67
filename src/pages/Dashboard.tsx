
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Users, Shield, Zap, CreditCard, Key, Bell, HelpCircle, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Welcome back, Alex</h1>
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
            <p className="text-3xl font-bold mb-4">1</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Last updated 2 days ago</span>
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
            <p className="text-3xl font-bold mb-4">2</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">1 pending verification</span>
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
            <p className="text-3xl font-bold text-green-500 mb-4">Secure</p>
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
                <Link to="/will">
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
                <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-willtank-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Will Updated</h4>
                    <p className="text-xs text-gray-500 mt-1">You updated your primary will document.</p>
                    <p className="text-xs text-gray-400 mt-2">2 days ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center flex-shrink-0">
                    <Users size={18} className="text-willtank-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Executor Added</h4>
                    <p className="text-xs text-gray-500 mt-1">You added Casey Morgan as an executor.</p>
                    <p className="text-xs text-gray-400 mt-2">5 days ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center flex-shrink-0">
                    <Key size={18} className="text-willtank-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Encryption Key Generated</h4>
                    <p className="text-xs text-gray-500 mt-1">New encryption key generated for document security.</p>
                    <p className="text-xs text-gray-400 mt-2">1 week ago</p>
                  </div>
                </div>
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
              
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-willtank-100 px-3 py-1 text-xs font-medium text-willtank-700">
                  <Zap size={12} />
                  <span>Premium Plan</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">Your subscription renews on <span className="font-medium">July 15, 2023</span></p>
              
              <Link to="/billing">
                <Button className="w-full" variant="outline">Manage Plan</Button>
              </Link>
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
