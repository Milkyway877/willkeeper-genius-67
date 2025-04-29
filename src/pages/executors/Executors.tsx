
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  UserRoundPlus, 
  Users, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Percent, 
  Plus,
  Loader2,
  User 
} from 'lucide-react';
import { 
  Executor, 
  Beneficiary, 
  getExecutors, 
  getBeneficiaries, 
  createExecutor, 
  createBeneficiary, 
  updateExecutor, 
  updateBeneficiary, 
  deleteExecutor, 
  deleteBeneficiary, 
  sendVerificationRequest 
} from '@/services/executorService';

// Define a separate type for form data to handle both executor and beneficiary fields
type FormData = {
  name: string;
  email: string;
  phone: string;
  relationship: string;
  address?: string;
  notes?: string;
  percentage?: number;
  will_id?: string;
};

export default function Executors() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("executors");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSendingVerification, setIsSendingVerification] = useState<boolean>(false);
  
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  
  const [executors, setExecutors] = useState<Executor[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    address: '',
    notes: '',
    percentage: undefined
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const executorsData = await getExecutors();
      const beneficiariesData = await getBeneficiaries();
      
      setExecutors(executorsData);
      setBeneficiaries(beneficiariesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load your executors and beneficiaries.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      relationship: '',
      address: '',
      notes: '',
      percentage: undefined
    });
    setIsEditMode(false);
    setEditItemId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle percentage as a number
    if (name === 'percentage') {
      const numValue = value === '' ? undefined : Number(value);
      setFormData({ ...formData, [name]: numValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleEdit = (item: Executor | Beneficiary) => {
    const isExecutor = 'relationship' in item && !('percentage' in item);
    
    setFormData({
      name: item.name,
      email: item.email,
      phone: item.phone,
      relationship: item.relationship,
      address: item.address || '',
      notes: item.notes || '',
      percentage: 'percentage' in item ? item.percentage : undefined
    });
    
    setIsEditMode(true);
    setEditItemId(item.id);
    setIsSheetOpen(true);
    setActiveTab(isExecutor ? "executors" : "beneficiaries");
  };

  const handleDelete = async (id: string, type: 'executor' | 'beneficiary') => {
    setIsDeleting(true);
    try {
      let success;
      
      if (type === 'executor') {
        success = await deleteExecutor(id);
        if (success) {
          setExecutors(executors.filter(item => item.id !== id));
        }
      } else {
        success = await deleteBeneficiary(id);
        if (success) {
          setBeneficiaries(beneficiaries.filter(item => item.id !== id));
        }
      }
      
      if (success) {
        toast({
          title: "Deleted",
          description: `The ${type} has been successfully removed.`
        });
      } else {
        throw new Error(`Failed to delete ${type}`);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast({
        title: "Error",
        description: `Failed to delete the ${type}.`,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVerificationRequest = async (email: string, name: string, type: 'executor' | 'beneficiary') => {
    setIsSendingVerification(true);
    try {
      const success = await sendVerificationRequest(email, name, type);
      
      if (success) {
        toast({
          title: "Verification Sent",
          description: `A verification request has been sent to ${email}.`
        });
      } else {
        throw new Error('Failed to send verification');
      }
    } catch (error) {
      console.error('Error sending verification:', error);
      toast({
        title: "Error",
        description: "Failed to send the verification request.",
        variant: "destructive"
      });
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.relationship) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }
      
      // Check percentage for beneficiaries
      if (activeTab === "beneficiaries" && (formData.percentage === undefined || formData.percentage < 0 || formData.percentage > 100)) {
        toast({
          title: "Invalid Percentage",
          description: "Please enter a percentage between 0 and 100.",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }
      
      let result;
      
      if (isEditMode && editItemId) {
        // Update existing item
        if (activeTab === "executors") {
          result = await updateExecutor(editItemId, formData as Partial<Executor>);
          if (result) {
            setExecutors(executors.map(item => item.id === editItemId ? result as Executor : item));
          }
        } else {
          result = await updateBeneficiary(editItemId, formData as Partial<Beneficiary>);
          if (result) {
            setBeneficiaries(beneficiaries.map(item => item.id === editItemId ? result as Beneficiary : item));
          }
        }
        
        if (result) {
          toast({
            title: "Updated",
            description: `The ${activeTab === "executors" ? "executor" : "beneficiary"} has been updated successfully.`
          });
          setIsSheetOpen(false);
          resetForm();
        } else {
          throw new Error('Update failed');
        }
      } else {
        // Create new item
        if (activeTab === "executors") {
          const newExecutor = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            relationship: formData.relationship,
            address: formData.address,
            notes: formData.notes
          };
          
          result = await createExecutor(newExecutor);
          if (result) {
            setExecutors([result, ...executors]);
          }
        } else {
          const newBeneficiary = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            relationship: formData.relationship,
            address: formData.address,
            notes: formData.notes,
            percentage: formData.percentage
          };
          
          result = await createBeneficiary(newBeneficiary);
          if (result) {
            setBeneficiaries([result, ...beneficiaries]);
          }
        }
        
        if (result) {
          toast({
            title: "Created",
            description: `New ${activeTab === "executors" ? "executor" : "beneficiary"} has been added successfully.`
          });
          setIsSheetOpen(false);
          resetForm();
        } else {
          throw new Error('Creation failed');
        }
      }
    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'create'} the ${activeTab === "executors" ? "executor" : "beneficiary"}.`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Will Executors & Beneficiaries</h1>
          <p className="text-gray-500 mt-1">Manage the people who will handle your will and receive your assets.</p>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setIsSheetOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add {activeTab === "executors" ? "Executor" : "Beneficiary"}
            </Button>
          </SheetTrigger>
          
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>{isEditMode ? 'Edit' : 'Add'} {activeTab === "executors" ? "Executor" : "Beneficiary"}</SheetTitle>
              <SheetDescription>
                {activeTab === "executors" 
                  ? "Add someone who will execute your will and ensure your wishes are followed." 
                  : "Add someone who will receive a portion of your assets."}
              </SheetDescription>
            </SheetHeader>
            
            <form onSubmit={handleSubmit} className="mt-6">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="relationship" className="text-right">
                    Relationship *
                  </Label>
                  <Input
                    id="relationship"
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="e.g. Spouse, Child, Friend"
                    required
                  />
                </div>
                
                {activeTab === "beneficiaries" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="percentage" className="text-right">
                      Percentage *
                    </Label>
                    <Input
                      id="percentage"
                      name="percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.percentage !== undefined ? formData.percentage : ''}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required={activeTab === "beneficiaries"}
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    Address
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="notes" className="text-right pt-2">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
              </div>
              
              <SheetFooter>
                <SheetClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? 'Update' : 'Save'}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="executors" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Executors
          </TabsTrigger>
          <TabsTrigger value="beneficiaries" className="flex items-center">
            <UserRoundPlus className="mr-2 h-4 w-4" />
            Beneficiaries
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="executors">
          <Card>
            <CardHeader>
              <CardTitle>Executors</CardTitle>
              <CardDescription>
                The people who will manage your estate and execute your will after your passing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : executors.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Executors Added</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Add executors who will manage your estate after your passing.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      resetForm();
                      setIsSheetOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Executor
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableCaption>A list of your will executors.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Relationship</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executors.map((executor) => (
                      <TableRow key={executor.id}>
                        <TableCell className="font-medium">{executor.name}</TableCell>
                        <TableCell>{executor.relationship}</TableCell>
                        <TableCell>{executor.email}</TableCell>
                        <TableCell>
                          {executor.isVerified ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              <XCircle className="mr-1 h-3 w-3" />
                              Pending
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEdit(executor)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete {executor.name} from your executors list.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => handleDelete(executor.id, 'executor')}
                                    disabled={isDeleting}
                                  >
                                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            
                            {!executor.isVerified && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleVerificationRequest(executor.email, executor.name, 'executor')}
                                disabled={isSendingVerification}
                              >
                                {isSendingVerification ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4 text-blue-500" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-500">
                {executors.length} {executors.length === 1 ? 'executor' : 'executors'} listed
              </div>
              {executors.length > 0 && (
                <Button variant="outline" onClick={() => setIsSheetOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="beneficiaries">
          <Card>
            <CardHeader>
              <CardTitle>Beneficiaries</CardTitle>
              <CardDescription>
                The people who will receive portions of your estate after your passing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : beneficiaries.length === 0 ? (
                <div className="text-center py-8">
                  <UserRoundPlus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Beneficiaries Added</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Add beneficiaries who will receive portions of your estate.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      resetForm();
                      setIsSheetOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Beneficiary
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableCaption>A list of your will beneficiaries.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Relationship</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {beneficiaries.map((beneficiary) => (
                      <TableRow key={beneficiary.id}>
                        <TableCell className="font-medium">{beneficiary.name}</TableCell>
                        <TableCell>{beneficiary.relationship}</TableCell>
                        <TableCell>{beneficiary.email}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center">
                            <Percent className="mr-1 h-3 w-3" />
                            {beneficiary.percentage || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          {beneficiary.isVerified ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              <XCircle className="mr-1 h-3 w-3" />
                              Pending
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEdit(beneficiary)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete {beneficiary.name} from your beneficiaries list.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => handleDelete(beneficiary.id, 'beneficiary')}
                                    disabled={isDeleting}
                                  >
                                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            
                            {!beneficiary.isVerified && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleVerificationRequest(beneficiary.email, beneficiary.name, 'beneficiary')}
                                disabled={isSendingVerification}
                              >
                                {isSendingVerification ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4 text-blue-500" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-500">
                {beneficiaries.length} {beneficiaries.length === 1 ? 'beneficiary' : 'beneficiaries'} listed
              </div>
              {beneficiaries.length > 0 && (
                <Button variant="outline" onClick={() => setIsSheetOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
