
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/common/Button';
import { FileText, Plus, Users, Shield, Zap, CreditCard } from 'lucide-react';

export default function Dashboard() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Alex</h1>
          <p className="text-gray-600">Here's an overview of your will management activity.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Active Wills</h3>
              <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center">
                <FileText size={20} className="text-willtank-500" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-4">1</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Last updated 2 days ago</span>
              <Button variant="ghost" size="sm">View all</Button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Executors</h3>
              <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center">
                <Users size={20} className="text-willtank-500" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-4">2</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">1 pending verification</span>
              <Button variant="ghost" size="sm">Manage</Button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Security Status</h3>
              <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center">
                <Shield size={20} className="text-willtank-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-500 mb-4">Secure</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">2FA enabled</span>
              <Button variant="ghost" size="sm">Check</Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 mb-6">
              <h3 className="text-xl font-medium mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button 
                  className="flex flex-col items-center justify-center h-auto py-6" 
                  variant="outline"
                  leftIcon={<Plus size={20} />}
                >
                  <span className="mt-2">Create New Will</span>
                </Button>
                <Button 
                  className="flex flex-col items-center justify-center h-auto py-6" 
                  variant="outline"
                  leftIcon={<Users size={20} />}
                >
                  <span className="mt-2">Add Executor</span>
                </Button>
                <Button 
                  className="flex flex-col items-center justify-center h-auto py-6" 
                  variant="outline"
                  leftIcon={<Shield size={20} />}
                >
                  <span className="mt-2">Security Check</span>
                </Button>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100">
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
                    <p className="text-xs text-gray-500 mt-1">You added Jane Smith as an executor.</p>
                    <p className="text-xs text-gray-400 mt-2">5 days ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center flex-shrink-0">
                    <Zap size={18} className="text-willtank-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Account Created</h4>
                    <p className="text-xs text-gray-500 mt-1">You created your WillTank account.</p>
                    <p className="text-xs text-gray-400 mt-2">1 week ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Subscription</h3>
                <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center">
                  <CreditCard size={18} className="text-willtank-500" />
                </div>
              </div>
              
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-willtank-100 px-3 py-1 text-xs font-medium text-willtank-700">
                  <Zap size={12} />
                  <span>Gold Plan</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">Your subscription renews on <span className="font-medium">Oct 15, 2023</span></p>
              
              <Button className="w-full" variant="outline">Upgrade Plan</Button>
            </div>
            
            <div className="bg-willtank-50 p-6 rounded-xl border border-willtank-100">
              <h3 className="font-medium mb-2">Tips & Suggestions</h3>
              <p className="text-sm text-gray-600 mb-4">Improve your estate planning with these personalized suggestions:</p>
              
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg border border-willtank-100 text-sm">
                  Complete your beneficiary details to ensure proper asset distribution.
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-willtank-100 text-sm">
                  Consider adding emergency contacts for better security.
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-willtank-100 text-sm">
                  Enable notifications for important updates and reminders.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
