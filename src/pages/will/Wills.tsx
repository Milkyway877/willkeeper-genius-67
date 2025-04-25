
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Filter, Search, SortDesc } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Wills() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const mockWills = [
    {
      id: '1',
      title: 'My Primary Will',
      created: '2024-01-15',
      updated: '2024-04-01',
      status: 'Active',
    },
    {
      id: '2',
      title: 'Joint Will with Spouse',
      created: '2023-10-22',
      updated: '2024-03-15',
      status: 'Draft',
    },
    {
      id: '3',
      title: 'Living Trust',
      created: '2023-08-05',
      updated: '2024-02-28',
      status: 'Requires Signature',
    }
  ];
  
  const handleCreateWill = () => {
    navigate('/dashboard/will/create');
  };
  
  const handleViewWill = (id: string) => {
    navigate(`/dashboard/will/view/${id}`);
  };
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Wills</h1>
            <p className="text-gray-600">Manage and organize your will documents</p>
          </div>
          
          <Button onClick={handleCreateWill} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Create New Will
          </Button>
        </div>
        
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Search wills..."
                className="pl-8 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-willtank-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <Filter className="mr-2 h-3.5 w-3.5" />
                Filter
              </Button>
              
              <Button variant="outline" size="sm" className="flex items-center">
                <SortDesc className="mr-2 h-3.5 w-3.5" />
                Sort
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {mockWills.map((will, index) => (
              <motion.div
                key={will.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                onClick={() => handleViewWill(will.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-willtank-50 rounded-lg p-3">
                      <FileText className="h-6 w-6 text-willtank-600" />
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-1">{will.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Created: {will.created}</span>
                        <span>Updated: {will.updated}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      will.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : will.status === 'Draft' 
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {will.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
