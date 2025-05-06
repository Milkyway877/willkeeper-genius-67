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
import { getWills, Will, deleteWill, willHasVideos, willHasDocuments } from '@/services/willService';
import { templates } from '../will/config/wizardSteps';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { HighlightedWillCard } from './components/HighlightedWillCard';

// WillCard component remains the same
const WillCard = ({ will, onDelete, onView, onEdit, hasVideo, hasDocuments }: { 
  will: Will, 
  onDelete: () => void, 
  onView: () => void, 
  onEdit: () => void,
  hasVideo: boolean,
  hasDocuments: boolean 
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          <FileText className="h-8 w-8 text-willtank-600 mt-1" />
          <div>
            <h3 className="font-bold">{will.title}</h3>
            <p className="text-sm text-gray-500">Created: {formatDate(will.created_at)}</p>
            <Badge variant="outline" className="mt-2 capitalize">
              {will.status}
            </Badge>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardContent>
    <CardFooter className="bg-gray-50 flex justify-end">
      <Button variant="outline" size="sm" onClick={onView}>
        View Will
      </Button>
    </CardFooter>
  </Card>
);

export default function Wills() {
  const [wills, setWills] = useState<Will[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [willToDelete, setWillToDelete] = useState<Will | null>(null);
  const [currentTab, setCurrentTab] = useState('active');
  const [newlyCreatedWillId, setNewlyCreatedWillId] = useState<string | null>(null);
  const [willAttachments, setWillAttachments] = useState<Record<string, {hasVideo: boolean, hasDocuments: boolean}>>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if there's a newly created will from session storage
    const newWillId = sessionStorage.getItem('newlyCreatedWill');
    if (newWillId) {
      setNewlyCreatedWillId(newWillId);
      // Clear it after retrieving
      sessionStorage.removeItem('newlyCreatedWill');
    }
    
    loadWills();
  }, []);

  const loadWills = async () => {
    try {
      setIsLoading(true);
      const willsData = await getWills();
      setWills(willsData);
      
      // Check for video and document attachments for each will
      const attachmentsData: Record<string, {hasVideo: boolean, hasDocuments: boolean}> = {};
      
      for (const will of willsData) {
        const [hasVideo, hasDocuments] = await Promise.all([
          willHasVideos(will.id),
          willHasDocuments(will.id)
        ]);
        
        attachmentsData[will.id] = { hasVideo, hasDocuments };
      }
      
      setWillAttachments(attachmentsData);
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
                  will.id === newlyCreatedWillId ? (
                    <HighlightedWillCard 
                      key={will.id} 
                      will={will}
                      hasVideo={willAttachments[will.id]?.hasVideo || false} 
                      hasDocuments={willAttachments[will.id]?.hasDocuments || false} 
                    />
                  ) : (
                    <WillCard 
                      key={will.id} 
                      will={will} 
                      onDelete={() => handleDelete(will)}
                      onView={() => navigate(`/will/${will.id}`)}
                      onEdit={() => navigate(`/will/edit/${will.id}`)}
                      hasVideo={willAttachments[will.id]?.hasVideo || false}
                      hasDocuments={willAttachments[will.id]?.hasDocuments || false}
                    />
                  )
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-medium mb-2">No Active Wills</h3>
                  <p className="text-gray-500 mb-4">You haven't created any active wills yet.</p>
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
                  will.id === newlyCreatedWillId ? (
                    <HighlightedWillCard 
                      key={will.id} 
                      will={will}
                      hasVideo={willAttachments[will.id]?.hasVideo || false} 
                      hasDocuments={willAttachments[will.id]?.hasDocuments || false} 
                    />
                  ) : (
                    <WillCard 
                      key={will.id} 
                      will={will} 
                      onDelete={() => handleDelete(will)}
                      onView={() => navigate(`/will/${will.id}`)}
                      onEdit={() => navigate(`/will/edit/${will.id}`)}
                      hasVideo={willAttachments[will.id]?.hasVideo || false}
                      hasDocuments={willAttachments[will.id]?.hasDocuments || false}
                    />
                  )
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-medium mb-2">No Draft Wills</h3>
                  <p className="text-gray-500 mb-4">You haven't created any draft wills yet.</p>
                  <Button onClick={navigateToCreateWill}>Create Your First Will</Button>
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
                  will.id === newlyCreatedWillId ? (
                    <HighlightedWillCard 
                      key={will.id} 
                      will={will}
                      hasVideo={willAttachments[will.id]?.hasVideo || false} 
                      hasDocuments={willAttachments[will.id]?.hasDocuments || false} 
                    />
                  ) : (
                    <WillCard 
                      key={will.id} 
                      will={will} 
                      onDelete={() => handleDelete(will)}
                      onView={() => navigate(`/will/${will.id}`)}
                      onEdit={() => navigate(`/will/edit/${will.id}`)}
                      hasVideo={willAttachments[will.id]?.hasVideo || false}
                      hasDocuments={willAttachments[will.id]?.hasDocuments || false}
                    />
                  )
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-medium mb-2">No Wills Yet</h3>
                  <p className="text-gray-500 mb-4">You haven't created any wills yet.</p>
                  <Button onClick={navigateToCreateWill}>Create Your First Will</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Will</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{willToDelete?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
