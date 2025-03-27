
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Plus, 
  Users, 
  Shield, 
  Zap, 
  CreditCard, 
  Calendar, 
  Bell,
  Check,
  FileCheck,
  Clock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const [progress, setProgress] = useState(65);
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div className="lg:col-span-2" variants={item}>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-1 dark:text-white">Welcome back, Alex</h1>
                <p className="text-gray-600 dark:text-gray-300">Your will is <span className="text-willtank-600 dark:text-willtank-400 font-medium">65% complete</span>. Continue where you left off.</p>
              </div>
              <Button className="mt-4 md:mt-0" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Continue Editing
              </Button>
            </div>
            
            <motion.div 
              className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6"
              variants={item}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium dark:text-white">Will Completion</h2>
                <span className="text-sm font-medium text-willtank-600 dark:text-willtank-400">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 mb-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-green-100 dark:bg-green-900/30 p-1.5 rounded-full text-green-600 dark:text-green-400">
                    <Check size={14} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium dark:text-white">Basic Information</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Personal details complete</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-green-100 dark:bg-green-900/30 p-1.5 rounded-full text-green-600 dark:text-green-400">
                    <Check size={14} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium dark:text-white">Assets</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">3 assets added</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-full text-amber-600 dark:text-amber-400">
                    <Clock size={14} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium dark:text-white">Beneficiaries</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2 out of 4 completed</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <motion.div 
                className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                variants={item}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium dark:text-white">Quick Actions</h2>
                </div>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-willtank-100 dark:bg-willtank-900/50 text-willtank-600 dark:text-willtank-400">
                        <FileText size={16} />
                      </div>
                      <span className="text-sm font-medium dark:text-white">Edit Will Draft</span>
                    </div>
                    <ArrowRight size={16} className="text-gray-400" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-willtank-100 dark:bg-willtank-900/50 text-willtank-600 dark:text-willtank-400">
                        <Users size={16} />
                      </div>
                      <span className="text-sm font-medium dark:text-white">Add Beneficiary</span>
                    </div>
                    <ArrowRight size={16} className="text-gray-400" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-willtank-100 dark:bg-willtank-900/50 text-willtank-600 dark:text-willtank-400">
                        <Shield size={16} />
                      </div>
                      <span className="text-sm font-medium dark:text-white">Security Check</span>
                    </div>
                    <ArrowRight size={16} className="text-gray-400" />
                  </button>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                variants={item}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium dark:text-white">Upcoming Deadlines</h2>
                  <button className="text-xs text-willtank-600 dark:text-willtank-400 hover:underline">View all</button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium dark:text-white">Document Verification</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Due in 3 days</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Verify</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        <FileCheck size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium dark:text-white">Annual Review</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">2 weeks from now</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Schedule</Button>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
              variants={item}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-medium dark:text-white">Recent Activity</h2>
                <button className="text-xs text-willtank-600 dark:text-willtank-400 hover:underline">View all</button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 mt-1 rounded-md bg-willtank-100 dark:bg-willtank-900/50 text-willtank-600 dark:text-willtank-400">
                    <FileText size={16} />
                  </div>
                  <div className="flex-1 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium dark:text-white">Will Draft Updated</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">You modified beneficiary distributions in your will.</p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">1 day ago</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 mt-1 rounded-md bg-willtank-100 dark:bg-willtank-900/50 text-willtank-600 dark:text-willtank-400">
                    <Users size={16} />
                  </div>
                  <div className="flex-1 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium dark:text-white">Executor Added</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">You added Sarah Johnson as an executor.</p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">3 days ago</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 mt-1 rounded-md bg-willtank-100 dark:bg-willtank-900/50 text-willtank-600 dark:text-willtank-400">
                    <Shield size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium dark:text-white">Security Review Completed</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">You completed the quarterly security review.</p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">1 week ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div className="space-y-6" variants={item}>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="font-medium dark:text-white">Document Status</h2>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Secure</span>
              </div>
              
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-willtank-600 dark:text-willtank-400" />
                    <span className="text-sm dark:text-white">Last Will & Testament</span>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">In Progress</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-willtank-600 dark:text-willtank-400" />
                    <span className="text-sm dark:text-white">Living Will</span>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Complete</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-willtank-600 dark:text-willtank-400" />
                    <span className="text-sm dark:text-white">Power of Attorney</span>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400">Not Started</span>
                </div>
              </div>
              
              <Button className="w-full mt-4" variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Document
              </Button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium dark:text-white">Subscription</h2>
                <div className="h-8 w-8 rounded-full bg-willtank-50 dark:bg-willtank-900/50 flex items-center justify-center">
                  <CreditCard size={16} className="text-willtank-600 dark:text-willtank-400" />
                </div>
              </div>
              
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-willtank-100 dark:bg-willtank-900/30 px-3 py-1 text-xs font-medium text-willtank-700 dark:text-willtank-400">
                  <Zap size={12} />
                  <span>Premium Plan</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Your subscription renews on <span className="font-medium dark:text-white">Oct 15, 2023</span></p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Storage</span>
                  <span className="text-xs font-medium dark:text-white">1.2 GB / 5 GB</span>
                </div>
                <Progress value={24} className="h-1.5" />
              </div>
              
              <Button className="w-full" size="sm">Manage Subscription</Button>
            </div>
            
            <div className={cn(
              "p-5 rounded-xl shadow-sm border relative overflow-hidden",
              "bg-gradient-to-br from-willtank-500 to-willtank-700 text-white"
            )}>
              <div className="absolute inset-0 bg-pattern opacity-10"></div>
              <div className="relative z-10">
                <h2 className="font-medium mb-2">Secure Your Legacy</h2>
                <p className="text-sm text-white/90 mb-4">Complete your will setup and secure your digital legacy today.</p>
                
                <Button variant="secondary" className="w-full" size="sm">
                  Continue Setup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="font-medium mb-3 dark:text-white">Learning Resources</h2>
              
              <div className="space-y-3">
                <a href="#" className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium dark:text-white">Estate Planning Basics</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">5 min read</p>
                    </div>
                    <ExternalLink size={14} className="text-gray-400" />
                  </div>
                </a>
                
                <a href="#" className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium dark:text-white">Digital Assets in Your Will</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">8 min read</p>
                    </div>
                    <ExternalLink size={14} className="text-gray-400" />
                  </div>
                </a>
              </div>
              
              <Button variant="link" className="w-full mt-2 text-willtank-600 dark:text-willtank-400" size="sm">
                View Knowledge Base
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}
