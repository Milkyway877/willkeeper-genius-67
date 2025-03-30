
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, Trash2, Plus, Loader2, Mail, Phone, Edit, Users } from 'lucide-react';
import { createWillExecutor, getWillExecutors, updateWillExecutor, deleteWillExecutor, WillExecutor } from '@/services/willService';
import { useNotifications } from '@/contexts/NotificationsContext';

export default function Executors() {
  const [executors, setExecutors] = useState<WillExecutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [currentExecutor, setCurrentExecutor] = useState<WillExecutor | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    address: '',
    notes: ''
  });
  
  const { toast } = useToast();
  const { createNotification } = useNotifications();

  useEffect(() => {
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
        title: "Failed to load executors",
        description: "There was an error loading your executors. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      relationship: '',
      address: '',
      notes: ''
    });
  };

  const handleOpenEditDialog = (executor: WillExecutor) => {
    setCurrentExecutor(executor);
    setFormData({
      name: executor.name || '',
      email: executor.email || '',
      phone: executor.phone || '',
      relationship: executor.relationship || '',
      address: executor.address || '',
      notes: executor.notes || ''
    });
    setOpenEditDialog(true);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the executor.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address for the executor.",
        variant: "destructive"
      });
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleAddExecutor = async () => {
    if (!validateForm()) return;
    
    try {
      setFormSubmitting(true);
      
      const newExecutor = await createWillExecutor({
        name: formData.name,
        email: formData.email,
        status: 'pending',
        phone: formData.phone,
        relationship: formData.relationship,
        address: formData.address,
        notes: formData.notes
      });
      
      if (newExecutor) {
        setExecutors(prev => [newExecutor, ...prev]);
        setOpenAddDialog(false);
        resetForm();
        
        toast({
          title: "Executor added",
          description: `${formData.name} has been added as an executor.`
        });
        
        await createNotification('success', {
          title: "Executor Added",
          description: `${formData.name} has been added as an executor to your will.`
        });
      } else {
        throw new Error("Failed to add executor");
      }
    } catch (error) {
      console.error('Error adding executor:', error);
      toast({
        title: "Failed to add executor",
        description: "There was an error adding the executor. Please try again.",
        variant: "destructive"
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateExecutor = async () => {
    if (!currentExecutor || !validateForm()) return;
    
    try {
      setFormSubmitting(true);
      
      const updatedExecutor = await updateWillExecutor(currentExecutor.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        relationship: formData.relationship,
        address: formData.address,
        notes: formData.notes
      });
      
      if (updatedExecutor) {
        setExecutors(prev => prev.map(exec => 
          exec.id === updatedExecutor.id ? updatedExecutor : exec
        ));
        setOpenEditDialog(false);
        resetForm();
        
        toast({
          title: "Executor updated",
          description: `${updatedExecutor.name}'s information has been updated.`
        });
      } else {
        throw new Error("Failed to update executor");
      }
    } catch (error) {
      console.error('Error updating executor:', error);
      toast({
        title: "Failed to update executor",
        description: "There was an error updating the executor. Please try again.",
        variant: "destructive"
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteExecutor = async (id: string) => {
    try {
      const success = await deleteWillExecutor(id);
      
      if (success) {
        setExecutors(prev => prev.filter(exec => exec.id !== id));
        
        toast({
          title: "Executor removed",
          description: "The executor has been removed successfully."
        });
      } else {
        throw new Error("Failed to delete executor");
      }
    } catch (error) {
      console.error('Error deleting executor:', error);
      toast({
        title: "Failed to remove executor",
        description: "There was an error removing the executor. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Executors</h1>
            <p className="text-gray-600">Manage who will administer your estate and execute your will.</p>
          </div>
          
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                Add Executor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Executor</DialogTitle>
                <DialogDescription>
                  An executor is responsible for carrying out the instructions in your will. Add someone you trust.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Smith"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="relationship">Relationship (Optional)</Label>
                  <Input
                    id="relationship"
                    name="relationship"
                    placeholder="Spouse, Child, Friend, Attorney"
                    value={formData.relationship}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="address">Address (Optional)</Label>
                  <Textarea
                    id="address"
                    name="address"
                    placeholder="123 Main St, Anytown, CA 12345"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Any additional information about this executor"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    resetForm();
                    setOpenAddDialog(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddExecutor} disabled={formSubmitting}>
                  {formSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>Add Executor</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Executor</DialogTitle>
                <DialogDescription>
                  Update the information for this executor.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    placeholder="John Smith"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email Address</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone Number (Optional)</Label>
                  <Input
                    id="edit-phone"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-relationship">Relationship (Optional)</Label>
                  <Input
                    id="edit-relationship"
                    name="relationship"
                    placeholder="Spouse, Child, Friend, Attorney"
                    value={formData.relationship}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-address">Address (Optional)</Label>
                  <Textarea
                    id="edit-address"
                    name="address"
                    placeholder="123 Main St, Anytown, CA 12345"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-notes">Notes (Optional)</Label>
                  <Textarea
                    id="edit-notes"
                    name="notes"
                    placeholder="Any additional information about this executor"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    resetForm();
                    setOpenEditDialog(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateExecutor} disabled={formSubmitting}>
                  {formSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>Save Changes</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-willtank-600" />
          </div>
        ) : executors.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-medium mb-3">No Executors Added Yet</h2>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              You haven't added any executors to your will yet. An executor is responsible for carrying out your wishes after you're gone.
            </p>
            <Button onClick={() => setOpenAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Executor
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {executors.map((executor) => (
              <Card key={executor.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-willtank-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <UserCheck className="h-5 w-5 text-willtank-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{executor.name}</h3>
                        {executor.relationship && (
                          <p className="text-sm text-gray-500">{executor.relationship}</p>
                        )}
                      </div>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove {executor.name} as an executor from your will.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteExecutor(executor.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-700">{executor.email}</span>
                    </div>
                    
                    {executor.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-700">{executor.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  {executor.address && (
                    <div className="border-t border-gray-100 pt-3 mb-3">
                      <p className="text-xs text-gray-500 mb-1">Address</p>
                      <p className="text-sm text-gray-700">{executor.address}</p>
                    </div>
                  )}
                  
                  {executor.notes && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs text-gray-500 mb-1">Notes</p>
                      <p className="text-sm text-gray-700">{executor.notes}</p>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleOpenEditDialog(executor)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        <div className="mt-8 bg-willtank-50 rounded-xl border border-willtank-100 p-6">
          <h3 className="text-lg font-medium mb-3">About Executors</h3>
          <p className="text-gray-700 mb-4">
            An executor is the person you name in your will to carry out your wishes after you die. 
            They will be responsible for:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Gathering and managing your assets</li>
            <li>Paying any debts, expenses, and taxes</li>
            <li>Distributing your property according to your will</li>
            <li>Representing your estate in court, if necessary</li>
            <li>Making sure all legal procedures are followed</li>
          </ul>
          <p className="mt-4 text-gray-700">
            Choose someone you trust who is responsible and well-organized. It's a good idea to name an alternate 
            executor in case your first choice is unable to serve.
          </p>
        </div>
      </div>
    </Layout>
  );
}
