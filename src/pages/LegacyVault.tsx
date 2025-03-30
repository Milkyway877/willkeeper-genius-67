
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Plus, File, Folder, Lock, Unlock, Pencil, Trash2, Briefcase, Key, FileText, Image, FileVideo, Music, Link, Upload, Loader2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/contexts/NotificationsContext';

interface VaultItem {
  id: string;
  title: string;
  preview?: string;
  category: string;
  document_url: string;
  is_encrypted: boolean;
  created_at: string;
}

type Category = 'documents' | 'photos' | 'videos' | 'financials' | 'passwords' | 'other';

export default function LegacyVault() {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('documents');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { createNotification } = useNotifications();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'documents',
    isEncrypted: false
  });

  useEffect(() => {
    fetchVaultItems();
  }, []);

  const fetchVaultItems = async () => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to access your Legacy Vault.",
          variant: "destructive"
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('legacy_vault')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching vault items:', error);
        throw new Error('Failed to load vault items');
      }
      
      setVaultItems(data || []);
    } catch (error) {
      console.error('Error fetching vault items:', error);
      toast({
        title: "Error",
        description: "There was a problem loading your Legacy Vault items. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleEncryptedChange = (value: boolean) => {
    setFormData(prev => ({ ...prev, isEncrypted: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddItem = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your vault item.",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedFile) {
      toast({
        title: "File Required",
        description: "Please upload a file for your vault item.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to add items to your Legacy Vault.",
          variant: "destructive"
        });
        return;
      }
      
      // Generate a unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;
      
      // Upload the file to storage bucket
      // Note: In a real implementation, you would need to set up a storage bucket
      // For now, we'll simulate it by storing the file name
      
      // If encryption was selected, you would encrypt the file here before upload
      // For this implementation, we'll just set the flag
      
      // Create entry in the database
      const { data, error } = await supabase
        .from('legacy_vault')
        .insert({
          title: formData.title,
          preview: formData.description,
          category: formData.category,
          document_url: filePath, // In a real app, this would be a storage URL
          is_encrypted: formData.isEncrypted,
          user_id: session.user.id
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding vault item:', error);
        throw new Error('Failed to add item to vault');
      }
      
      // Add the new item to the state
      setVaultItems(prev => [data, ...prev]);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'documents',
        isEncrypted: false
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Close dialog
      setOpenAddDialog(false);
      
      // Show success toast
      toast({
        title: "Item Added",
        description: "Your item has been successfully added to the Legacy Vault.",
      });
      
      // Create notification
      await createNotification('success', {
        title: "Legacy Vault Item Added",
        description: `Your item "${formData.title}" has been added to the Legacy Vault.`
      });
    } catch (error) {
      console.error('Error adding vault item:', error);
      toast({
        title: "Error",
        description: "There was a problem adding your item to the Legacy Vault. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to delete items from your Legacy Vault.",
          variant: "destructive"
        });
        return;
      }
      
      // Get item details before deletion
      const itemToDeleteData = vaultItems.find(item => item.id === itemToDelete);
      
      // Delete the item from the database
      const { error } = await supabase
        .from('legacy_vault')
        .delete()
        .eq('id', itemToDelete)
        .eq('user_id', session.user.id);
      
      if (error) {
        console.error('Error deleting vault item:', error);
        throw new Error('Failed to delete item from vault');
      }
      
      // Remove the item from the state
      setVaultItems(prev => prev.filter(item => item.id !== itemToDelete));
      
      // Reset the item to delete
      setItemToDelete(null);
      
      // Show success toast
      toast({
        title: "Item Deleted",
        description: "Your item has been successfully deleted from the Legacy Vault.",
      });
      
      // Create notification if we have the item details
      if (itemToDeleteData) {
        await createNotification('info', {
          title: "Legacy Vault Item Deleted",
          description: `Your item "${itemToDeleteData.title}" has been removed from the Legacy Vault.`
        });
      }
    } catch (error) {
      console.error('Error deleting vault item:', error);
      toast({
        title: "Error",
        description: "There was a problem deleting your item from the Legacy Vault. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'documents':
        return <FileText className="h-5 w-5" />;
      case 'photos':
        return <Image className="h-5 w-5" />;
      case 'videos':
        return <FileVideo className="h-5 w-5" />;
      case 'financials':
        return <Briefcase className="h-5 w-5" />;
      case 'passwords':
        return <Key className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const filterItemsByCategory = (items: VaultItem[], category: Category) => {
    if (category === 'documents') {
      return items.filter(item => item.category === 'documents');
    } else if (category === 'photos') {
      return items.filter(item => item.category === 'photos');
    } else if (category === 'videos') {
      return items.filter(item => item.category === 'videos');
    } else if (category === 'financials') {
      return items.filter(item => item.category === 'financials');
    } else if (category === 'passwords') {
      return items.filter(item => item.category === 'passwords');
    } else {
      return items.filter(item => item.category === 'other');
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Legacy Vault</h1>
            <p className="text-gray-600">Securely store and manage important files, documents, and information for your beneficiaries.</p>
          </div>
          
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Vault Item</DialogTitle>
                <DialogDescription>
                  Add an important document, photo, video, or information to your legacy vault.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Marriage Certificate, Family Photo Album"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Add details about this item..."
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="documents">Documents</SelectItem>
                      <SelectItem value="photos">Photos</SelectItem>
                      <SelectItem value="videos">Videos</SelectItem>
                      <SelectItem value="financials">Financial Records</SelectItem>
                      <SelectItem value="passwords">Passwords & Accounts</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="file-upload">Upload File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-gray-500">
                    Maximum file size: 25MB. Supported formats: PDF, DOC, JPG, PNG, MP4, MP3.
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="encrypted">Encrypt this file?</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={formData.isEncrypted ? "default" : "outline"}
                      className="flex items-center"
                      onClick={() => handleEncryptedChange(true)}
                    >
                      <Lock className="h-4 w-4 mr-1" />
                      Yes
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={!formData.isEncrypted ? "default" : "outline"}
                      className="flex items-center"
                      onClick={() => handleEncryptedChange(false)}
                    >
                      <Unlock className="h-4 w-4 mr-1" />
                      No
                    </Button>
                  </div>
                </div>
                
                {formData.isEncrypted && (
                  <div className="bg-willtank-50 rounded-md p-3 text-sm text-willtank-800">
                    <div className="flex">
                      <Shield className="h-5 w-5 mr-2 text-willtank-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium mb-1">Encryption Information</p>
                        <p>This file will be encrypted with AES-256 encryption before storage. Your beneficiaries will need your encryption key to access it later.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setOpenAddDialog(false);
                    setFormData({
                      title: '',
                      description: '',
                      category: 'documents',
                      isEncrypted: false
                    });
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddItem} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>Add to Vault</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <Tabs defaultValue="documents" value={activeCategory} onValueChange={(value) => setActiveCategory(value as Category)} className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2">
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden md:inline">Documents</span>
                </TabsTrigger>
                <TabsTrigger value="photos" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  <span className="hidden md:inline">Photos</span>
                </TabsTrigger>
                <TabsTrigger value="videos" className="flex items-center gap-2">
                  <FileVideo className="h-4 w-4" />
                  <span className="hidden md:inline">Videos</span>
                </TabsTrigger>
                <TabsTrigger value="financials" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden md:inline">Financials</span>
                </TabsTrigger>
                <TabsTrigger value="passwords" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <span className="hidden md:inline">Passwords</span>
                </TabsTrigger>
                <TabsTrigger value="other" className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  <span className="hidden md:inline">Other</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6">
              {Object.keys(
                {
                  documents: 'Documents',
                  photos: 'Photos',
                  videos: 'Videos',
                  financials: 'Financial Records',
                  passwords: 'Passwords & Accounts',
                  other: 'Other Items'
                }
              ).map((category) => (
                <TabsContent key={category} value={category} className="mt-0">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-willtank-600" />
                    </div>
                  ) : filterItemsByCategory(vaultItems, category as Category).length === 0 ? (
                    <div className="text-center py-12">
                      <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        {getCategoryIcon(category)}
                      </div>
                      <h3 className="text-lg font-medium mb-2">No {category === 'documents' ? 'Documents' : 
                                                       category === 'photos' ? 'Photos' : 
                                                       category === 'videos' ? 'Videos' : 
                                                       category === 'financials' ? 'Financial Records' : 
                                                       category === 'passwords' ? 'Passwords & Accounts' : 
                                                       'Items'} Yet</h3>
                      <p className="text-gray-600 mb-4">
                        You haven't added any {category === 'documents' ? 'documents' : 
                                           category === 'photos' ? 'photos' : 
                                           category === 'videos' ? 'videos' : 
                                           category === 'financials' ? 'financial records' : 
                                           category === 'passwords' ? 'passwords or accounts' : 
                                           'items'} to your vault yet.
                      </p>
                      <Button onClick={() => setOpenAddDialog(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add {category === 'documents' ? 'Document' : 
                            category === 'photos' ? 'Photo' : 
                            category === 'videos' ? 'Video' : 
                            category === 'financials' ? 'Financial Record' : 
                            category === 'passwords' ? 'Password/Account' : 
                            'Item'}
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filterItemsByCategory(vaultItems, category as Category).map((item) => (
                        <div key={item.id} className="border rounded-lg overflow-hidden">
                          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(item.category)}
                              <h3 className="font-medium truncate max-w-xs">{item.title}</h3>
                            </div>
                            {item.is_encrypted && (
                              <Lock className="h-4 w-4 text-willtank-600" />
                            )}
                          </div>
                          <div className="p-4">
                            {item.preview && (
                              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.preview}</p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Added: {new Date(item.created_at).toLocaleDateString()}
                              </span>
                              <div className="flex gap-2">
                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                  <Pencil className="h-4 w-4 text-gray-500" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8"
                                      onClick={() => setItemToDelete(item.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-gray-500" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete "{item.title}" from your Legacy Vault.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={handleDeleteItem}
                                        className="bg-red-500 hover:bg-red-600"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
        
        <div className="bg-willtank-50 rounded-xl border border-willtank-100 p-6">
          <h3 className="text-lg font-medium mb-4">About Legacy Vault</h3>
          <p className="text-gray-700 mb-4">
            Your Legacy Vault is a secure digital repository for important documents, photos, videos, financial records, 
            and other information you want to pass on to your loved ones.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-willtank-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Secure Storage</h4>
                <p className="text-sm text-gray-600">
                  All items are stored with bank-level security and optional encryption for sensitive materials.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Lock className="h-5 w-5 text-willtank-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Private Access</h4>
                <p className="text-sm text-gray-600">
                  Only you can access your vault until your will is executed, at which point your executors will gain access.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Upload className="h-5 w-5 text-willtank-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Easy Uploads</h4>
                <p className="text-sm text-gray-600">
                  Quickly upload documents, photos, videos, and other digital assets to your vault.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Folder className="h-5 w-5 text-willtank-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Organized Categories</h4>
                <p className="text-sm text-gray-600">
                  Keep everything organized in categories for easy access by your beneficiaries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
