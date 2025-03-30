
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { motion } from 'framer-motion';
import {
  UserPlus, Mail, Phone, Home, ClipboardEdit, Trash2, User, UserCheck, Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getWillExecutors, 
  WillExecutor, 
  createWillExecutor,
  updateWillExecutor,
  deleteWillExecutor
} from '@/services/willService';

const executorSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  relationship: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().default("pending")
});

export default function Executors() {
  const { toast } = useToast();
  const [executors, setExecutors] = useState<WillExecutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [addExecutorOpen, setAddExecutorOpen] = useState(false);
  const [editExecutorOpen, setEditExecutorOpen] = useState(false);
  const [editingExecutor, setEditingExecutor] = useState<WillExecutor | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [executorToDelete, setExecutorToDelete] = useState<WillExecutor | null>(null);
  
  const form = useForm<z.infer<typeof executorSchema>>({
    resolver: zodResolver(executorSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      relationship: "",
      address: "",
      notes: "",
      status: "pending"
    },
  });

  const editForm = useForm<z.infer<typeof executorSchema>>({
    resolver: zodResolver(executorSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      relationship: "",
      address: "",
      notes: "",
      status: "pending"
    },
  });

  useEffect(() => {
    // Fetch executors when component mounts
    fetchExecutors();
  }, []);

  const fetchExecutors = async () => {
    try {
      setLoading(true);
      const data = await getWillExecutors();
      setExecutors(data);
    } catch (error) {
      console.error('Error fetching executors:', error);
      toast({
        title: "Error",
        description: "Unable to fetch executors. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof executorSchema>) => {
    try {
      const newExecutor = await createWillExecutor({
        name: values.name,
        email: values.email,
        status: values.status,
        phone: values.phone,
        relationship: values.relationship,
        address: values.address,
        notes: values.notes
      });
      
      if (newExecutor) {
        setExecutors(prev => [newExecutor, ...prev]);
        form.reset();
        setAddExecutorOpen(false);
        toast({
          title: "Executor Added",
          description: `${values.name} has been added as an executor.`,
        });
      } else {
        throw new Error("Failed to create executor");
      }
    } catch (error) {
      console.error('Error creating executor:', error);
      toast({
        title: "Error",
        description: "Failed to add executor. Please try again.",
        variant: "destructive"
      });
    }
  };

  const onEditSubmit = async (values: z.infer<typeof executorSchema>) => {
    if (!editingExecutor) return;
    
    try {
      const updatedExecutor = await updateWillExecutor(editingExecutor.id, {
        name: values.name,
        email: values.email,
        status: values.status,
        phone: values.phone,
        relationship: values.relationship,
        address: values.address,
        notes: values.notes
      });
      
      if (updatedExecutor) {
        setExecutors(prev => 
          prev.map(exec => exec.id === updatedExecutor.id ? updatedExecutor : exec)
        );
        editForm.reset();
        setEditExecutorOpen(false);
        setEditingExecutor(null);
        toast({
          title: "Executor Updated",
          description: `${values.name}'s information has been updated.`,
        });
      } else {
        throw new Error("Failed to update executor");
      }
    } catch (error) {
      console.error('Error updating executor:', error);
      toast({
        title: "Error",
        description: "Failed to update executor. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteExecutor = async () => {
    if (!executorToDelete) return;
    
    try {
      const success = await deleteWillExecutor(executorToDelete.id);
      
      if (success) {
        setExecutors(prev => prev.filter(exec => exec.id !== executorToDelete.id));
        setDeleteConfirmOpen(false);
        setExecutorToDelete(null);
        toast({
          title: "Executor Removed",
          description: `${executorToDelete.name} has been removed from your executors.`,
        });
      } else {
        throw new Error("Failed to delete executor");
      }
    } catch (error) {
      console.error('Error deleting executor:', error);
      toast({
        title: "Error",
        description: "Failed to remove executor. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (executor: WillExecutor) => {
    setEditingExecutor(executor);
    editForm.reset({
      name: executor.name,
      email: executor.email,
      status: executor.status,
      phone: executor.phone || '',
      relationship: executor.relationship || '',
      address: executor.address || '',
      notes: executor.notes || ''
    });
    setEditExecutorOpen(true);
  };

  const openDeleteDialog = (executor: WillExecutor) => {
    setExecutorToDelete(executor);
    setDeleteConfirmOpen(true);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Will Executors</h1>
            <p className="text-gray-600">Manage the executors for your will.</p>
          </div>
          
          <Button onClick={() => setAddExecutorOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Executor
          </Button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : executors.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="flex flex-col items-center">
              <User className="h-16 w-16 text-gray-300 mb-4" />
              <h2 className="text-xl font-medium text-gray-700 mb-2">No Executors Added</h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                You haven't added any executors yet. Executors are responsible for carrying out the instructions in your will after your passing.
              </p>
              <Button onClick={() => setAddExecutorOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Your First Executor
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {executors.map((executor) => (
              <motion.div
                key={executor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-willtank-100 flex items-center justify-center mr-3">
                      <UserCheck className="h-6 w-6 text-willtank-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{executor.name}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-3.5 w-3.5 mr-1" />
                        {executor.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                    executor.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {executor.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                  </div>
                </div>
                
                {executor.relationship && (
                  <div className="mb-3 text-sm">
                    <span className="font-medium text-gray-700">Relationship:</span> {executor.relationship}
                  </div>
                )}
                
                {executor.phone && (
                  <div className="flex items-center mb-3 text-sm">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{executor.phone}</span>
                  </div>
                )}
                
                {executor.address && (
                  <div className="flex items-start mb-3 text-sm">
                    <Home className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                    <span>{executor.address}</span>
                  </div>
                )}
                
                {executor.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md text-sm">
                    <p className="text-gray-700">{executor.notes}</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openEditDialog(executor)}
                  >
                    <ClipboardEdit className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => openDeleteDialog(executor)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Remove
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Add Executor Dialog */}
        <Dialog open={addExecutorOpen} onOpenChange={setAddExecutorOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add Executor</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Spouse, Child, Friend" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any additional notes about this executor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">
                    <Check className="mr-2 h-4 w-4" />
                    Add Executor
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Edit Executor Dialog */}
        <Dialog open={editExecutorOpen} onOpenChange={setEditExecutorOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Executor</DialogTitle>
            </DialogHeader>
            
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Spouse, Child, Friend" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={editForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any additional notes about this executor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">
                    <Check className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Confirm Removal</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <p className="mb-4">
                Are you sure you want to remove <span className="font-medium">{executorToDelete?.name}</span> as an executor?
              </p>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteExecutor}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Executor
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
