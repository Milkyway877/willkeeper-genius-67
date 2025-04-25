
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wills: React.FC = () => {
  return (
    <div className="container mx-auto max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Wills</h1>
          <p className="text-gray-600">Manage and create your legal wills</p>
        </div>
        
        <div className="flex gap-2">
          <Link to="/dashboard/will/create">
            <Button variant="default">
              <Plus className="mr-2 h-4 w-4" />
              Create New Will
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-center items-center flex-col py-12">
            <FileText size={48} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-medium mb-2">No wills yet</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              Create your first will document to protect your assets and ensure your wishes are carried out.
            </p>
            <Link to="/dashboard/will/create">
              <Button variant="default">
                <Plus className="mr-2 h-4 w-4" />
                Create Will
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wills;
