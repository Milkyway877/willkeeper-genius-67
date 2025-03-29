
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CreditCard, Check, Globe, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';

export function BillingSettings() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast: uiToast } = useToast();

  const handleUpgrade = async (plan: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      // Stripe functionality removed
      toast.info('Payment processing has been disabled');
      
    } catch (error: any) {
      console.error('Error:', error);
      setErrorMessage(error.message || 'This feature is currently unavailable');
      toast.error('Feature disabled', {
        description: 'Payment processing has been disabled.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
          <CreditCard className="text-willtank-700 mr-2" size={18} />
          <h3 className="font-medium">Billing Information</h3>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-willtank-100 px-3 py-1 text-sm font-medium text-willtank-700">
              <Check size={14} />
              <span>Free Plan</span>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium">Subscription Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm text-gray-500">Plan</p>
                  <p className="font-medium">Free</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">Active</p>
                </div>
              </div>
            </div>
          </div>
          
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-800">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{errorMessage}</p>
              </div>
            </div>
          )}
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Payment processing has been disabled.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => navigate('/billing')}>Billing Information</Button>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6"
      >
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
          <Globe className="text-willtank-700 mr-2" size={18} />
          <h3 className="font-medium">Available Plans</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <h4 className="font-medium">Basic Plan</h4>
              <p className="text-2xl font-bold my-2">$99<span className="text-sm font-normal text-gray-500">/year</span>
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  1 will document
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Basic templates
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  1 year of secure storage
                </li>
              </ul>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={() => handleUpgrade('basic')}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Upgrade'}
              </Button>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <h4 className="font-medium">Premium Plan</h4>
              <p className="text-2xl font-bold my-2">$199<span className="text-sm font-normal text-gray-500">/year</span></p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Unlimited will documents
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  All premium templates
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  5 years of secure storage
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Advanced legal analysis
                </li>
              </ul>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={() => handleUpgrade('premium')}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Upgrade'}
              </Button>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <h4 className="font-medium">Lifetime Plan</h4>
              <p className="text-2xl font-bold my-2">$499<span className="text-sm font-normal text-gray-500">/once</span></p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  All Premium features
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Lifetime storage
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Unlimited updates
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Priority support
                </li>
              </ul>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={() => handleUpgrade('lifetime')}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Upgrade'}
              </Button>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Payment processing has been disabled in this version.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
