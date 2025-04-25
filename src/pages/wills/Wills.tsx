
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';

const Wills: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Wills</h1>
          <p className="text-gray-600">Manage your legal wills and testament documents.</p>
        </div>
        <Button onClick={() => navigate('/will/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Will
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-medium flex items-center">
            <FileText className="h-4 w-4 mr-2 text-gray-500" />
            Your Wills
          </h3>
          <Button variant="link" size="sm">
            View All
          </Button>
        </div>
        
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No wills created yet</h3>
          <p className="text-gray-500 mb-6">Create your first will to ensure your wishes are documented</p>
          <Button onClick={() => navigate('/will/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Will
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Wills;
