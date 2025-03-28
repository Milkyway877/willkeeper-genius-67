
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Key, 
  FileText, 
  Lock, 
  ShieldCheck,
  Plus,
  FileEdit,
  Star,
  Heart,
  Edit,
  Info,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

export function TankVault() {
  const { toast } = useToast();
  const [upgradePromptVisible, setUpgradePromptVisible] = useState(true);
  
  const handleCreateVaultItem = (type: string) => {
    toast({
      title: `Create ${type}`,
      description: "This premium feature requires a subscription upgrade",
    });
  };
  
  const handleUpgrade = () => {
    toast({
      title: "Upgrade",
      description: "Navigate to subscription page to unlock Legacy Vault",
    });
  };

  return (
    <div>
      {upgradePromptVisible && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-willtank-100 to-blue-50 rounded-xl border border-willtank-200 p-6 mb-8"
        >
          <div className="flex items-start">
            <div className="p-3 bg-white bg-opacity-60 rounded-lg mr-4 shadow-sm">
              <Lock className="h-8 w-8 text-willtank-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-willtank-800 mb-2">Unlock Your Legacy Vault</h3>
              <p className="text-willtank-700 mb-4">
                The Legacy Vault is a premium feature that allows you to create a comprehensive 
                legacy including personal stories, life advice, and special wishes for your loved ones.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Button onClick={handleUpgrade} className="w-full sm:w-auto">
                  Upgrade to Unlock
                </Button>
                <Button variant="outline" onClick={() => setUpgradePromptVisible(false)} className="w-full sm:w-auto">
                  Not Now
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="p-3 bg-amber-50 rounded-lg inline-block mb-4">
            <BookOpen className="h-6 w-6 text-amber-500" />
          </div>
          <h3 className="font-medium text-lg mb-2">Personal Stories</h3>
          <p className="text-gray-600 text-sm mb-3">Share your life stories, memories, and experiences with future generations</p>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>0 stories</span>
              <span className="text-gray-500">Unlimited with premium</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
          <Button onClick={() => handleCreateVaultItem('Story')} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Story
          </Button>
        </motion.div>
        
        <motion.div 
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="p-3 bg-blue-50 rounded-lg inline-block mb-4">
            <Star className="h-6 w-6 text-blue-500" />
          </div>
          <h3 className="font-medium text-lg mb-2">Life Advice</h3>
          <p className="text-gray-600 text-sm mb-3">Leave behind wisdom, guidance, and advice for your loved ones</p>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>0 advice notes</span>
              <span className="text-gray-500">Unlimited with premium</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
          <Button onClick={() => handleCreateVaultItem('Advice')} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Advice
          </Button>
        </motion.div>
        
        <motion.div 
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="p-3 bg-pink-50 rounded-lg inline-block mb-4">
            <Heart className="h-6 w-6 text-pink-500" />
          </div>
          <h3 className="font-medium text-lg mb-2">Special Wishes</h3>
          <p className="text-gray-600 text-sm mb-3">Document your wishes, dreams, and hopes for your loved ones</p>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>0 wishes</span>
              <span className="text-gray-500">Unlimited with premium</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
          <Button onClick={() => handleCreateVaultItem('Wish')} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Wish
          </Button>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h3 className="font-medium">Legacy Book Preview</h3>
          </div>
          <div className="p-6 text-center">
            <div className="w-40 h-56 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center shadow-md">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h4 className="font-medium mb-2">Your Legacy Book</h4>
            <p className="text-gray-500 text-sm mb-4">
              All your vault items will be organized into a beautiful legacy book for your loved ones
            </p>
            <Button variant="outline" onClick={() => handleUpgrade()}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview Book
            </Button>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h3 className="font-medium">Legacy Vault Security</h3>
          </div>
          <div className="p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 bg-green-50 rounded-lg mr-3">
                <ShieldCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Bank-Level Encryption</h4>
                <p className="text-gray-600 text-sm">
                  All your vault content is protected with AES-256 encryption
                </p>
              </div>
            </div>
            
            <div className="flex items-start mb-4">
              <div className="p-2 bg-green-50 rounded-lg mr-3">
                <Key className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Advanced Access Control</h4>
                <p className="text-gray-600 text-sm">
                  Recipients need to authenticate their identity to access your vault
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="p-2 bg-green-50 rounded-lg mr-3">
                <FileEdit className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Unlimited Updates</h4>
                <p className="text-gray-600 text-sm">
                  Update your vault content anytime before delivery
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
