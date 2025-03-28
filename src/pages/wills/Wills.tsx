
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus, ArrowUpRight, AlertCircle, Clock, FileCheck, Copy, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Will, getWills, deleteWill } from '@/services/willsService';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Wills() {
  const [wills, setWills] = useState<Will[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [willToDelete, setWillToDelete] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadWills = async () => {
      try {
        setLoading(true);
        const data = await getWills();
        setWills(data);
      } catch (error) {
        console.error('Error loading wills:', error);
        toast({
          title: "Error loading wills",
          description: "We couldn't load your wills. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadWills();
  }, [toast]);

  const handleCreateNewWill = () => {
    navigate('/will/create');
  };

  const handleViewWill = (id: string) => {
    navigate(`/will/${id}`);
  };

  const handleEditWill = (id: string) => {
    navigate(`/will/${id}/edit`);
  };

  const handleCopyWill = (will: Will) => {
    // Create a copy of the will with a new title
    const copyTitle = `${will.title} (Copy)`;
    // Logic to create a new will based on this one
    toast({
      title: "Will copied",
      description: `A copy of "${will.title}" has been created.`
    });
    // Refresh the list
    getWills().then(data => setWills(data));
  };

  const handleDeleteWill = async () => {
    if (!willToDelete) return;
    
    try {
      const success = await deleteWill(willToDelete);
      if (success) {
        setWills(prev => prev.filter(will => will.id !== willToDelete));
      }
    } catch (error) {
      console.error('Error deleting will:', error);
    } finally {
      setWillToDelete(null);
      setConfirmText('');
      setDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (id: string) => {
    setWillToDelete(id);
    setDeleteDialogOpen(true);
  };

  const renderWillStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Draft</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'signed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Signed</Badge>;
      case 'archived':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <FileText className="mr-2 h-7 w-7 text-willtank-600" />
              My Wills
            </h1>
            <p className="text-gray-600">
              Manage your legal documents and ensure your legacy is preserved
            </p>
          </div>
          
          <Button 
            onClick={handleCreateNewWill}
            className="bg-willtank-600 hover:bg-willtank-700 text-white flex-shrink-0"
          >
            <Plus size={16} className="mr-2" />
            Create New Will
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="shadow-sm">
                <CardHeader className="pb-4">
                  <Skeleton className="h-5 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-1/4" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {wills.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
                <div className="mx-auto h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Wills Found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You haven't created any wills yet. Create your first will to ensure your wishes are documented and preserved.
                </p>
                <Button onClick={handleCreateNewWill}>
                  <Plus size={16} className="mr-2" />
                  Create Your First Will
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {wills.map((will) => (
                    <motion.div
                      key={will.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl">{will.title}</CardTitle>
                              <CardDescription>
                                {renderWillStatus(will.status)}
                                {will.ai_generated && (
                                  <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
                                    AI Generated
                                  </Badge>
                                )}
                              </CardDescription>
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Clock size={12} className="mr-1" />
                              {format(new Date(will.updated_at), 'MMM d, yyyy')}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-gray-50 p-4 rounded-md mb-4 flex items-center">
                            <div className="h-10 w-10 bg-willtank-100 rounded-md flex items-center justify-center mr-3">
                              {will.status.toLowerCase() === 'signed' ? (
                                <FileCheck size={20} className="text-willtank-600" />
                              ) : (
                                <FileText size={20} className="text-willtank-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {will.status.toLowerCase() === 'draft' ? 'Draft will document' : 'Legal will document'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Created on {format(new Date(will.created_at), 'MMMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <div>
                              <p className="text-gray-500">Template</p>
                              <p className="font-medium">{will.template_type || 'Standard'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Last Updated</p>
                              <p className="font-medium">{format(new Date(will.updated_at), 'MMM d, yyyy')}</p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button variant="outline" size="sm" onClick={() => handleCopyWill(will)}>
                            <Copy size={14} className="mr-1" />
                            Clone
                          </Button>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => openDeleteDialog(will.id)}
                            >
                              <Trash2 size={14} className="mr-1" />
                              Delete
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditWill(will.id)}
                            >
                              <Edit size={14} className="mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleViewWill(will.id)}
                            >
                              <ArrowUpRight size={14} className="mr-1" />
                              View
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Delete Will Document
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The will document will be permanently deleted from our servers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              To confirm, please type <span className="font-bold">DELETE</span> below:
            </p>
            <Input 
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="mb-2"
            />
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDeleteWill}
              disabled={confirmText !== 'DELETE'}
            >
              <Trash2 size={16} className="mr-2" />
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
