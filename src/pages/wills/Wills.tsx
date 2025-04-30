
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Trash2, Edit, Clock, Check, MoreHorizontal, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getWills, Will, deleteWill } from '@/services/willService';
import { templates } from '../will/config/wizardSteps';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

export default function Wills() {
  const [wills, setWills] = useState<Will[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [willToDelete, setWillToDelete] = useState<Will | null>(null);
  const [currentTab, setCurrentTab] = useState('active');
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadWills();
  }, []);

  const loadWills = async () => {
    try {
      setIsLoading(true);
      const willsData = await getWills();
      setWills(willsData);
    } catch (error) {
      console.error('Error loading wills:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your wills',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (will: Will) => {
    setWillToDelete(will);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (willToDelete) {
      try {
        await deleteWill(willToDelete.id);
        setWills(wills.filter(w => w.id !== willToDelete.id));
        toast({
          title: 'Success',
          description: 'Will deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting will:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete will',
          variant: 'destructive',
        });
      }
      setDeleteDialogOpen(false);
      setWillToDelete(null);
    }
  };

  const filteredWills = wills.filter(will => {
    if (currentTab === 'all') return true;
    return will.status === currentTab;
  });

  const navigateToCreateWill = () => {
    // Direct users to the template selection page for our new AI chat creation experience
    navigate('/will/create');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Wills</h1>
            <p className="text-gray-500">Manage and create your legal wills</p>
          </div>
          <Button onClick={navigateToCreateWill}>
            <Plus className="mr-2 h-4 w-4" /> Create New Will
          </Button>
        </div>

        <Tabs defaultValue="active" className="w-full" onValueChange={setCurrentTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin h-8 w-8 border-4 border-willtank-600 border-t-transparent rounded-full"></div>
                  </div>
                </CardContent>
              </Card>
            ) : filteredWills.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredWills.map((will) => (
                  <WillCard 
                    key={will.id} 
                    will={will} 
                    onDelete={() => handleDelete(will)}
                    onView={() => navigate(`/will/${will.id}`)}
                    onEdit={() => navigate(`/will/edit/${will.id}`)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold">No wills found</h3>
                  <p className="text-gray-500 mb-6">
                    {currentTab === 'active' 
                      ? "You don't have any active wills yet." 
                      : currentTab === 'draft' 
                      ? "You don't have any draft wills." 
                      : "You haven't created any wills yet."}
                  </p>
                  <Button onClick={navigateToCreateWill}>Create Your First Will</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="draft" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin h-8 w-8 border-4 border-willtank-600 border-t-transparent rounded-full"></div>
                  </div>
                </CardContent>
              </Card>
            ) : filteredWills.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredWills.map((will) => (
                  <WillCard 
                    key={will.id} 
                    will={will} 
                    onDelete={() => handleDelete(will)}
                    onView={() => navigate(`/will/${will.id}`)}
                    onEdit={() => navigate(`/will/edit/${will.id}`)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold">No draft wills</h3>
                  <p className="text-gray-500 mb-6">You don't have any wills in draft status.</p>
                  <Button onClick={navigateToCreateWill}>Create a New Will</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin h-8 w-8 border-4 border-willtank-600 border-t-transparent rounded-full"></div>
                  </div>
                </CardContent>
              </Card>
            ) : filteredWills.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredWills.map((will) => (
                  <WillCard 
                    key={will.id} 
                    will={will} 
                    onDelete={() => handleDelete(will)}
                    onView={() => navigate(`/will/${will.id}`)}
                    onEdit={() => navigate(`/will/edit/${will.id}`)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold">No wills yet</h3>
                  <p className="text-gray-500 mb-6">You haven't created any wills yet.</p>
                  <Button onClick={navigateToCreateWill}>Create Your First Will</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this will? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

interface WillCardProps {
  will: Will;
  onDelete: () => void;
  onView: () => void;
  onEdit: () => void;
}

function WillCard({ will, onDelete, onView, onEdit }: WillCardProps) {
  const templateInfo = templates.find(t => t.id === will.template_type) || {
    title: 'Standard Will',
    description: 'A standard legal will document'
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{will.title}</CardTitle>
            <CardDescription>{templateInfo.title}</CardDescription>
          </div>
          <div className="flex items-center">
            <Badge variant={will.status === 'active' ? 'default' : 'secondary'}>
              {will.status === 'active' ? (
                <><Check className="mr-1 h-3 w-3" /> Active</>
              ) : (
                <><Clock className="mr-1 h-3 w-3" /> Draft</>
              )}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="mr-2 h-4 w-4" /> View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm truncate">
          {will.content ? (
            will.content.substring(0, 100) + '...'
          ) : (
            'No content available'
          )}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-gray-500">
          Updated {formatDate(will.updated_at)}
        </div>
        <Button variant="outline" size="sm" onClick={onView}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
