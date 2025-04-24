
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Trash2, Edit, Eye, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getWills, Will, deleteWill } from '@/services/willService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Wills() {
  const [willToDelete, setWillToDelete] = useState<Will | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch wills data
  const { data: wills, isLoading, error } = useQuery({
    queryKey: ['wills'],
    queryFn: getWills,
  });

  // Delete will mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wills'] });
      toast({
        title: "Will deleted",
        description: "Your will has been successfully deleted.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error deleting will:", error);
      toast({
        title: "Error",
        description: "Failed to delete will. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle create new will button click
  const handleCreateWill = () => {
    navigate('/will/create');
  };

  // Handle view will button click
  const handleViewWill = (will: Will) => {
    navigate(`/will/${will.id}`);
  };

  // Handle edit will button click
  const handleEditWill = (will: Will) => {
    navigate(`/will/edit/${will.id}`);
  };

  // Handle delete will button click
  const handleDeleteWill = (will: Will) => {
    setWillToDelete(will);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete will
  const confirmDeleteWill = () => {
    if (willToDelete) {
      deleteMutation.mutate(willToDelete.id);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 text-willtank-600 animate-spin" />
            <span className="ml-2 text-lg text-gray-600">Loading your wills...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-red-800">Unable to load wills</h3>
            <p className="mt-2 text-sm text-red-700">
              There was an error retrieving your wills. Please refresh the page or try again later.
            </p>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['wills'] })}
              variant="outline"
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wills</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage all your will documents in one place.
            </p>
          </div>
          <Button onClick={handleCreateWill}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Will
          </Button>
        </div>

        {wills && wills.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wills.map((will) => (
                  <TableRow key={will.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-willtank-600" />
                      {will.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(will.status)}>
                        {will.status || 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {will.created_at 
                        ? format(new Date(will.created_at), 'MMM dd, yyyy') 
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {will.updated_at 
                        ? format(new Date(will.updated_at), 'MMM dd, yyyy') 
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {will.template_type 
                        ? will.template_type.charAt(0).toUpperCase() + will.template_type.slice(1) 
                        : 'Custom'}
                      {will.ai_generated && (
                        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-800">
                          AI Generated
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewWill(will)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditWill(will)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={() => handleDeleteWill(will)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-lg border border-dashed border-gray-300"
          >
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No wills found</h3>
            <p className="mt-1 text-sm text-gray-500 text-center max-w-md">
              You don't have any wills yet. Get started by creating your first will document.
            </p>
            <Button onClick={handleCreateWill} className="mt-6">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Will
            </Button>
          </motion.div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Will</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this will? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-gray-50 p-4 rounded-md my-4">
              <p className="font-medium">{willToDelete?.title}</p>
              <p className="text-sm text-gray-500 mt-1">
                Created on {willToDelete?.created_at 
                  ? format(new Date(willToDelete.created_at), 'MMMM dd, yyyy') 
                  : 'unknown date'}
              </p>
            </div>
            <DialogFooter className="gap-2 sm:justify-end">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteWill}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
