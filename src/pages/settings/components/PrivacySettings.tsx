
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";
import { Lock } from 'lucide-react';

export function PrivacySettings() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
          <Lock className="text-willtank-700 mr-2" size={18} />
          <h3 className="font-medium">Privacy Settings</h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-4">Data Sharing</h4>
              <p className="text-sm text-gray-600 mb-4">
                Control how your information is used and shared with our services.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium">Analytics Tracking</h5>
                    <p className="text-xs text-gray-500">
                      Allow anonymous usage data to help us improve our service
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium">Personalized Recommendations</h5>
                    <p className="text-xs text-gray-500">
                      Receive suggestions based on your will creation history
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium">Third-Party Sharing</h5>
                    <p className="text-xs text-gray-500">
                      Allow sharing of anonymized data with trusted partners
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Document Privacy</h4>
              <p className="text-sm text-gray-600 mb-4">
                Control who can access your documents and when.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium">Restrict Executor Access</h5>
                    <p className="text-xs text-gray-500">
                      Only allow executors to access documents after verification
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium">Two-Factor Authentication for Documents</h5>
                    <p className="text-xs text-gray-500">
                      Require additional verification for sensitive documents
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6"
      >
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-medium">Privacy Documentation</h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Privacy Policy</h4>
              <p className="text-sm text-gray-600 mt-1 mb-2">
                Review our privacy policy to understand how we handle your data.
              </p>
              <Button variant="outline" size="sm" onClick={() => window.open('/privacy', '_blank')}>
                View Privacy Policy
              </Button>
            </div>
            
            <div>
              <h4 className="font-medium">Data Request</h4>
              <p className="text-sm text-gray-600 mt-1 mb-2">
                Request a copy of all the data we have stored about you.
              </p>
              <Button variant="outline" size="sm">
                Request My Data
              </Button>
            </div>
            
            <div>
              <h4 className="font-medium">Data Deletion</h4>
              <p className="text-sm text-gray-600 mt-1 mb-2">
                Request deletion of specific data we have stored about you.
              </p>
              <Button variant="outline" size="sm">
                Request Data Deletion
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
