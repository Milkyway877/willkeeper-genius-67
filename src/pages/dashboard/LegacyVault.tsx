
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Archive, Plus, FileText, Image, Key, FileCheck, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LegacyVault: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  
  const categories = [
    { id: 'all', label: 'All Documents', icon: FileCheck },
    { id: 'legal', label: 'Legal Documents', icon: FileText },
    { id: 'financial', label: 'Financial Records', icon: Key },
    { id: 'personal', label: 'Personal Records', icon: Image },
  ];
  
  const handleAddDocument = () => {
    navigate('/dashboard/vault/create');
  };
  
  const handleDocumentClick = (id: string) => {
    navigate(`/dashboard/vault/view/${id}`);
  };
  
  const vaultItems = [
    {
      id: '1',
      title: 'Life Insurance Policy',
      category: 'financial',
      added: '2024-01-10',
      icon: Key,
      sensitive: true,
    },
    {
      id: '2',
      title: 'Property Deed',
      category: 'legal',
      added: '2024-02-15',
      icon: FileText,
      sensitive: true,
    },
    {
      id: '3',
      title: 'Birth Certificate',
      category: 'personal',
      added: '2024-03-05',
      icon: Image,
      sensitive: false,
    },
    {
      id: '4',
      title: 'Stock Portfolio',
      category: 'financial',
      added: '2024-04-01',
      icon: Key,
      sensitive: true,
    },
  ];
  
  const filteredItems = activeCategory === 'all' 
    ? vaultItems 
    : vaultItems.filter(item => item.category === activeCategory);
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Legacy Vault</h1>
          <p className="text-gray-600">Your secure repository for important documents and information</p>
        </div>
        
        <Button onClick={handleAddDocument} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Add Document
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-medium">Categories</h3>
            </div>
            
            <div className="p-2">
              <div className="flex flex-col items-stretch h-auto bg-transparent border-none p-0">
                {categories.map((category) => (
                  <button 
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)} 
                    className={`flex items-center justify-start mb-1 rounded-lg px-3 py-2 text-sm ${
                      activeCategory === category.id 
                        ? 'bg-willtank-50 text-willtank-700' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <category.icon className="h-4 w-4 mr-2" />
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100">
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-600">Vault Security</p>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <div className="flex items-center">
                    <Archive className="text-blue-600 mr-2 h-4 w-4" />
                    <p className="text-xs text-blue-700">
                      Your vault is encrypted with AES-256 encryption
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">
                {categories.find(cat => cat.id === activeCategory)?.label || 'All Documents'}
              </h3>
              
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="pl-8 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-willtank-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => {
                  const ItemIcon = item.icon;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between border-b border-gray-100 pb-4 cursor-pointer hover:bg-gray-50 rounded-lg p-3"
                      onClick={() => handleDocumentClick(item.id)}
                    >
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          item.category === 'legal' 
                            ? 'bg-blue-50' 
                            : item.category === 'financial'
                            ? 'bg-green-50'
                            : 'bg-amber-50'
                        }`}>
                          <ItemIcon className={`h-5 w-5 ${
                            item.category === 'legal'
                              ? 'text-blue-600'
                              : item.category === 'financial'
                              ? 'text-green-600'
                              : 'text-amber-600'
                          }`} />
                        </div>
                        
                        <div className="ml-3">
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-xs text-gray-500">Added: {item.added}</p>
                        </div>
                      </div>
                      
                      {item.sensitive && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-800">
                          Sensitive
                        </span>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <Archive className="h-12 w-12 text-gray-300 mb-3" />
                  <h4 className="font-medium text-gray-600 mb-1">No documents found</h4>
                  <p className="text-sm text-gray-500">
                    Add documents to your vault to store them securely
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegacyVault;
