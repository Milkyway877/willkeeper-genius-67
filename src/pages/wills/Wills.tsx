
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { getWills } from '@/services/willService';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

const Wills: React.FC = () => {
  const navigate = useNavigate();
  
  const { data: wills, isLoading, error } = useQuery({
    queryKey: ['wills'],
    queryFn: getWills
  });

  const handleCreateNewWill = () => {
    navigate('/templates');
  };

  const handleViewWill = (id: string) => {
    navigate(`/will/${id}`);
  };

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Wills</h1>
            <p className="text-gray-600">Manage your legal wills and testament documents.</p>
          </div>
          <Button onClick={handleCreateNewWill}>
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
          </div>
          
          {isLoading ? (
            <div className="p-6 text-center">
              <Loader2 className="h-8 w-8 text-gray-400 mx-auto animate-spin mb-4" />
              <p className="text-gray-500">Loading your wills...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Error loading wills</h3>
              <p className="text-gray-500 mb-6">There was an error loading your wills</p>
              <Button onClick={() => navigate('/templates')}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Will
              </Button>
            </div>
          ) : wills && wills.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {wills.map((will) => (
                <div 
                  key={will.id} 
                  className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                  onClick={() => handleViewWill(will.id)}
                >
                  <div>
                    <h4 className="font-medium">{will.title}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(will.updated_at).toLocaleDateString()}
                      {' · '}
                      <span className="capitalize">{will.status}</span>
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    handleViewWill(will.id);
                  }}>
                    View
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No wills created yet</h3>
              <p className="text-gray-500 mb-6">Create your first will to ensure your wishes are documented</p>
              <Button onClick={() => navigate('/templates')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Will
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Wills;
