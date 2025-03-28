
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Shield, RefreshCw, Smartphone, Key, Fingerprint, Check, User, Scan } from 'lucide-react';
import { motion } from 'framer-motion';

export default function IDSecurity() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Identity & Security</h1>
            <p className="text-gray-600">Manage your identity verification and account security settings.</p>
          </div>
          
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Verify Identity
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Identity Status</h3>
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <User size={20} className="text-green-600" />
              </div>
            </div>
            
            <div className="flex items-center mb-4">
              <div className="h-4 w-4 rounded-full bg-green-500 mr-2 flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
              <p className="text-green-700 font-medium">Verified</p>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">Last verified: June 10, 2023</p>
            <p className="text-sm text-gray-600">Verification valid until: June 10, 2024</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">2FA Status</h3>
              <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center">
                <Smartphone size={20} className="text-willtank-600" />
              </div>
            </div>
            
            <div className="flex items-center mb-4">
              <div className="h-4 w-4 rounded-full bg-willtank-500 mr-2 flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
              <p className="text-willtank-700 font-medium">Enabled</p>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">Method: Authenticator App</p>
            <p className="text-sm text-gray-600">Last used: 2 days ago</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Recovery Status</h3>
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Key size={20} className="text-blue-600" />
              </div>
            </div>
            
            <div className="flex items-center mb-4">
              <div className="h-4 w-4 rounded-full bg-blue-500 mr-2 flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
              <p className="text-blue-700 font-medium">Available</p>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">Recovery methods: 3</p>
            <p className="text-sm text-gray-600">Last updated: 1 month ago</p>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-medium">ID Documents</h3>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Government ID</h4>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Verified</span>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-4">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Scan size={24} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Driver's License</p>
                    <p className="text-xs text-gray-500">Uploaded on Jun 10, 2023</p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto">
                    Update
                  </Button>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Proof of Address</h4>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Verified</span>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-4">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Scan size={24} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Utility Bill</p>
                    <p className="text-xs text-gray-500">Uploaded on Jun 10, 2023</p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto">
                    Update
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-medium">Security Settings</h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-1">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Secure your account with 2FA</p>
                  </div>
                  <div className="h-6 w-11 bg-willtank-500 rounded-full p-1 flex justify-end">
                    <div className="h-4 w-4 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-1">Biometric Login</p>
                    <p className="text-sm text-gray-500">Use fingerprint or face recognition</p>
                  </div>
                  <div className="h-6 w-11 bg-willtank-500 rounded-full p-1 flex justify-end">
                    <div className="h-4 w-4 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-1">Login Notifications</p>
                    <p className="text-sm text-gray-500">Get alerts for new logins</p>
                  </div>
                  <div className="h-6 w-11 bg-willtank-500 rounded-full p-1 flex justify-end">
                    <div className="h-4 w-4 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-1">Session Timeout</p>
                    <p className="text-sm text-gray-500">Automatically logout after inactivity</p>
                  </div>
                  <div className="h-6 w-11 bg-willtank-500 rounded-full p-1 flex justify-end">
                    <div className="h-4 w-4 bg-white rounded-full"></div>
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
