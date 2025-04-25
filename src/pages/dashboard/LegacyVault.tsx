
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Archive, Plus, FileText, Image, FileLock2, FileArchive, FileCheck, Folder, Lock, Shield } from 'lucide-react';

const LegacyVault: React.FC = () => {
  const navigate = useNavigate();
  
  const vaultCategories = [
    { 
      title: 'Legal Documents', 
      icon: FileText, 
      description: 'Store important legal documents like power of attorney and birth certificates',
      color: 'bg-blue-50 text-blue-700',
      count: 0
    },
    { 
      title: 'Financial Records', 
      icon: FileArchive, 
      description: 'Keep your financial documents secure for your beneficiaries',
      color: 'bg-green-50 text-green-700',
      count: 0
    },
    { 
      title: 'Personal Information', 
      icon: FileCheck, 
      description: 'Important personal information your loved ones may need',
      color: 'bg-purple-50 text-purple-700',
      count: 0
    },
    { 
      title: 'Digital Assets', 
      icon: FileLock2, 
      description: 'Credentials and access information for your digital accounts',
      color: 'bg-amber-50 text-amber-700',
      count: 0
    },
    { 
      title: 'Legacy Media', 
      icon: Image, 
      description: 'Photos, videos, and other media you want to preserve',
      color: 'bg-pink-50 text-pink-700',
      count: 0
    },
    { 
      title: 'Medical Information', 
      icon: FileText, 
      description: 'Medical history, insurance, and health directives',
      color: 'bg-red-50 text-red-700',
      count: 0
    }
  ];
  
  return (
    <div className="container max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Legacy Vault</h1>
          <p className="text-gray-600">Securely store important documents and information for your beneficiaries.</p>
        </div>
        
        <Button onClick={() => navigate('/vault/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Document
        </Button>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-10"
      >
        <div className="bg-gradient-to-r from-willtank-50 to-blue-50 border border-willtank-100 rounded-xl p-6 flex items-center justify-between">
          <div className="flex items-start">
            <div className="h-12 w-12 rounded-full bg-willtank-100 flex items-center justify-center mr-4">
              <Shield className="h-6 w-6 text-willtank-700" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-1">Bank-Level Security</h3>
              <p className="text-gray-600">
                Your documents are encrypted with AES-256 encryption. Only you and your designated executors can access them.
              </p>
            </div>
          </div>
          <Button variant="outline" className="whitespace-nowrap">
            <Lock className="mr-2 h-4 w-4" />
            Security Settings
          </Button>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {vaultCategories.map((category, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className={`p-5 ${category.color} flex justify-between items-center border-b border-gray-100`}>
              <div className="flex items-center">
                <div className="bg-white p-2 rounded-lg mr-3">
                  <category.icon className="h-6 w-6" />
                </div>
                <h3 className="font-medium">{category.title}</h3>
              </div>
              <div className="bg-white text-gray-800 h-8 w-8 rounded-full flex items-center justify-center font-medium">
                {category.count}
              </div>
            </div>
            
            <div className="p-5">
              <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate('/vault/create')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-medium flex items-center">
            <Archive className="h-4 w-4 mr-2 text-gray-500" />
            Recent Documents
          </h3>
          <Button variant="link" size="sm">
            View All
          </Button>
        </div>
        
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Folder className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No documents yet</h3>
          <p className="text-gray-500 mb-6">Start adding important documents to your vault for safekeeping</p>
          <Button onClick={() => navigate('/vault/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Document
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LegacyVault;
