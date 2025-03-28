
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, User, Mail, Lock, Bell, Moon, Sun, Globe, UserPlus, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account and preference settings.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit"
          >
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-medium text-sm text-gray-500">Settings Menu</h3>
            </div>
            
            <div className="p-2">
              <div className="bg-willtank-50 text-willtank-800 p-2 rounded-lg font-medium text-sm mb-1 flex items-center">
                <User className="mr-2" size={16} />
                Profile
              </div>
              
              <div className="text-gray-600 hover:bg-gray-50 p-2 rounded-lg text-sm mb-1 flex items-center">
                <Mail className="mr-2" size={16} />
                Email & Notifications
              </div>
              
              <div className="text-gray-600 hover:bg-gray-50 p-2 rounded-lg text-sm mb-1 flex items-center">
                <Lock className="mr-2" size={16} />
                Password & Security
              </div>
              
              <div className="text-gray-600 hover:bg-gray-50 p-2 rounded-lg text-sm mb-1 flex items-center">
                <Bell className="mr-2" size={16} />
                Notifications
              </div>
              
              <div className="text-gray-600 hover:bg-gray-50 p-2 rounded-lg text-sm mb-1 flex items-center">
                <Globe className="mr-2" size={16} />
                Language & Region
              </div>
              
              <div className="text-gray-600 hover:bg-gray-50 p-2 rounded-lg text-sm mb-1 flex items-center">
                <Sun className="mr-2" size={16} />
                Appearance
              </div>
            </div>
          </motion.div>
          
          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="md:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-medium">Profile Settings</h3>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-full md:w-1/3">
                  <div className="bg-gray-100 h-32 w-32 rounded-full mx-auto flex items-center justify-center relative">
                    <User className="text-gray-400" size={48} />
                    <button className="absolute bottom-0 right-0 bg-willtank-500 text-white p-2 rounded-full hover:bg-willtank-600 transition-colors">
                      <UserPlus size={16} />
                    </button>
                  </div>
                  <div className="text-center mt-4">
                    <h4 className="font-medium">Alex Morgan</h4>
                    <p className="text-sm text-gray-500">Premium Member</p>
                  </div>
                </div>
                
                <div className="w-full md:w-2/3 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-willtank-500 focus:border-willtank-500"
                        defaultValue="Alex"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-willtank-500 focus:border-willtank-500"
                        defaultValue="Morgan"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-willtank-500 focus:border-willtank-500"
                      defaultValue="alex.morgan@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-willtank-500 focus:border-willtank-500"
                      defaultValue="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-willtank-500 focus:border-willtank-500 mb-2"
                      defaultValue="123 Main Street"
                    />
                    <input
                      type="text"
                      className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-willtank-500 focus:border-willtank-500"
                      defaultValue="Apt 4B"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-willtank-500 focus:border-willtank-500"
                        defaultValue="Anytown"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                      <input
                        type="text"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-willtank-500 focus:border-willtank-500"
                        defaultValue="12345"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
