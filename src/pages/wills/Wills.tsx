
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Eye, Edit, Trash2, Filter, Search, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { getWills, deleteWill } from '@/services/willService';
import { format } from 'date-fns';

export default function Wills() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [wills, setWills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    const fetchWills = async () => {
      try {
        setIsLoading(true);
        const willsData = await getWills();
        setWills(willsData || []);
      } catch (error) {
        console.error("Error fetching wills:", error);
        toast({
          title: "Error",
          description: "Could not load your wills. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWills();
  }, [toast]);

  const handleCreateNew = () => {
    navigate('/will/create');
  };

  const handlePreviewWill = (willId) => {
    navigate(`/will/${willId}`);
  };

  const handleEditWill = (willId) => {
    navigate(`/will/edit/${willId}`);
  };

  const handleDeleteWill = async (willId) => {
    try {
      if (confirm("Are you sure you want to delete this will? This action cannot be undone.")) {
        await deleteWill(willId);
        setWills(wills.filter(will => will.id !== willId));
        toast({
          title: "Will Deleted",
          description: "The will has been successfully deleted."
        });
      }
    } catch (error) {
      console.error("Error deleting will:", error);
      toast({
        title: "Error",
        description: "Could not delete the will. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredWills = wills.filter(will => {
    const matchesSearch = will.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || will.status?.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'draft':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Draft</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Archived</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Wills</h1>
            <p className="text-gray-600">Manage and view all your will documents</p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Will
          </Button>
        </div>
        
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Search wills by title..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full md:w-auto"
            >
              <Filter size={16} className="mr-2" />
              Filter
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <h3 className="font-medium mb-3">Filter by Status</h3>
            <div className="flex flex-wrap gap-2">
              {['all', 'active', 'draft', 'archived'].map((status) => (
                <Badge 
                  key={status}
                  variant={selectedStatus === status ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => setSelectedStatus(status)}
                >
                  {status}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-willtank-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your wills...</p>
          </div>
        ) : (
          <>
            {filteredWills.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No wills found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || selectedStatus !== 'all' 
                    ? "No wills match your search criteria." 
                    : "You haven't created any wills yet."}
                </p>
                {(searchQuery || selectedStatus !== 'all') && (
                  <Button variant="outline" onClick={() => {
                    setSearchQuery('');
                    setSelectedStatus('all');
                  }}>
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredWills.map((will) => (
                  <Card key={will.id} className="overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-willtank-100 flex items-center justify-center mr-4 flex-shrink-0">
                            <FileText className="h-5 w-5 text-willtank-600" />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium text-lg">{will.title}</h3>
                              <div className="ml-3">{getStatusBadge(will.status)}</div>
                            </div>
                            <p className="text-gray-500 text-sm">
                              Last updated: {will.updated_at ? format(new Date(will.updated_at), 'MMM dd, yyyy') : 'N/A'}
                            </p>
                            {will.template_type && (
                              <Badge variant="outline" className="mt-2">
                                {will.template_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePreviewWill(will.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditWill(will.id)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDeleteWill(will.id)} className="text-red-600">
                                <Trash2 size={14} className="mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
