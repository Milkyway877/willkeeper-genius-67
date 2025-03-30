import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { FileUploader } from './will/components/FileUploader';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, Vault, FileText, Key, Image, CreditCard, FileImage, Lock, LockKeyhole, 
  Shield, Share2, Files, UserPlus, Trash2, Eye, Edit, Download, Loader2
} from 'lucide-react';

interface LegacyItem {
  id: string;
  title: string;
  preview?: string;
  category: string;
  document_url?: string;
  is_encrypted: boolean;
  created_at: string;
}

const ITEM_CATEGORIES = [
  { value: 'documents', label: 'Legal Documents', icon: <FileText className="h-4 w-4" /> },
  { value: 'passwords', label: 'Passwords & Accounts', icon: <Key className="h-4 w-4" /> },
  { value: 'photos', label: 'Photos & Memories', icon: <FileImage className="h-4 w-4" /> },
  { value: 'financial', label: 'Financial Information', icon: <CreditCard className="h-4 w-4" /> },
  { value: 'instructions', label: 'Final Instructions', icon: <FileText className="h-4 w-4" /> },
  { value: 'other', label: 'Other Items', icon: <Files className="h-4 w-4" /> }
];

const itemSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  category: z.string({
    required_error: 'Please select a category.',
  }),
  preview: z.string().optional(),
  is_encrypted: z.boolean().default(false)
});

export default function LegacyVault() {
  const [items, setItems] = useState<LegacyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [viewItemOpen, setViewItemOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<LegacyItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<LegacyItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFileDownloading, setIsFileDownloading] = useState(false);
  
  const form = useForm<z.infer<typeof itemSchema>>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: '',
      category: '',
      preview: '',
      is_encrypted: false
    },
  });
  
  useEffect(() => {
    fetchItems();
  }, []);
  
  const fetchItems = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.warn('No authenticated user found when fetching legacy vault items');
        return;
      }
      
      const { data, error } = await supabase
        .from('legacy_vault')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching legacy vault items:', error);
      toast({
        title: "Error Loading Items",
        description: "Failed to load your legacy vault items. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const onSubmit = async (values: z.infer<typeof itemSchema>) => {
    try {
      setIsSaving(true);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to add items to your vault",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }
      
      // Upload file if present
      let fileUrl = '';
      if (uploadedFiles.length > 0) {
        const file = uploadedFiles[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('legacy_vault')
          .upload(fileName, file);
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('legacy_vault')
          .getPublicUrl(uploadData.path);
          
        fileUrl = publicUrlData.publicUrl;
      }
      
      // Save item to database
      const { data: item, error: itemError } = await supabase
        .from('legacy_vault')
        .insert({
          user_id: session.user.id,
          title: values.title,
          category: values.category,
          preview: values.preview,
          document_url: fileUrl,
          is_encrypted: values.is_encrypted
        })
        .select()
        .single();
        
      if (itemError) throw itemError;
      
      // Update local state
      setItems(prev => [item, ...prev]);
      
      // Reset form and close dialog
      form.reset();
      setUploadedFiles([]);
      setAddItemOpen(false);
      
      // Show success notification
      toast({
        title: "Item Added",
        description: "Your item has been added to the legacy vault.",
      });
      
      // Create a notification
      await supabase.from('notifications').insert({
        user_id: session.user.id,
        title: 'Legacy Vault Updated',
        description: `Item "${values.title}" has been added to your legacy vault.`,
        type: 'info',
        read: false
      });
    } catch (error) {
      console.error('Error adding item to legacy vault:', error);
      toast({
        title: "Error",
        description: "Failed to add item to your legacy vault. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleViewItem = (item: LegacyItem) => {
    setViewingItem(item);
    setViewItemOpen(true);
  };
  
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to manage your vault",
          variant: "destructive"
        });
        return;
      }
      
      // Delete from database
      const { error } = await supabase
        .from('legacy_vault')
        .delete()
        .eq('id', itemToDelete.id);
        
      if (error) throw error;
      
      // If there's a file URL, delete from storage
      if (itemToDelete.document_url) {
        // Extract file path from URL
        const urlParts = itemToDelete.document_url.split('/');
        const filePath = `${session.user.id}/${urlParts[urlParts.length - 1]}`;
        
        const { error: storageError } = await supabase.storage
          .from('legacy_vault')
          .remove([filePath]);
          
        if (storageError) {
          console.warn('Error deleting file from storage:', storageError);
        }
      }
      
      // Update local state
      setItems(prev => prev.filter(item => item.id !== itemToDelete.id));
      
      // Close dialog
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      
      // Show success notification
      toast({
        title: "Item Deleted",
        description: "The item has been removed from your legacy vault.",
      });
    } catch (error) {
      console.error('Error deleting item from legacy vault:', error);
      toast({
        title: "Error",
        description: "Failed to delete the item. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const downloadFile = async (item: LegacyItem) => {
    if (!item.document_url) {
      toast({
        title: "No File Available",
        description: "This item doesn't have an attached file to download.",
      });
      return;
    }
    
    try {
      setIsFileDownloading(true);
      
      // Create an anchor element and set the href to the document URL
      const link = document.createElement('a');
      link.href = item.document_url;
      link.target = '_blank';
      
      // Extract the filename from the URL
      const urlParts = item.document_url.split('/');
      link.download = urlParts[urlParts.length - 1];
      
      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: "Your file download has started.",
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download Failed",
        description: "There was a problem downloading your file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsFileDownloading(false);
    }
  };
  
  const getFilteredItems = () => {
    if (activeTab === 'all') {
      return items;
    }
    return items.filter(item => item.category === activeTab);
  };
  
  const filteredItems = getFilteredItems();
  
  const getCategoryIcon = (category: string) => {
    const found = ITEM_CATEGORIES.find(cat => cat.value === category);
    return found ? found.icon : <FileText className="h-4 w-4" />;
  };
  
  const getCategoryLabel = (category: string) => {
    const found = ITEM_CATEGORIES.find(cat => cat.value === category);
    return found ? found.label : 'Unknown';
  };
  
  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Legacy Vault</h1>
            <p className="text-gray-600">Securely store important information and documents for your loved ones.</p>
          </div>
          
          <Button onClick={() => setAddItemOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            <TabsTrigger value="all" className="flex items-center">
              <Files className="h-4 w-4 mr-2" />
              All Items
            </TabsTrigger>
            {ITEM_CATEGORIES.map(category => (
              <TabsTrigger 
                key={category.value} 
                value={category.value}
                className="hidden md:flex items-center lg:inline-flex"
              >
                {category.icon}
                <span className="ml-2">{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Loader2 className="h-10 w-10 text-willtank-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your legacy vault items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Vault className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-medium text-gray-700 mb-2">Your Legacy Vault is Empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Add important documents, passwords, instructions, and more to your legacy vault to share with your loved ones.
            </p>
            <Button size="lg" onClick={() => setAddItemOpen(true)}>
              <Plus className="mr-2 h-5 w-5" />
              Add Your First Item
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-lg bg-willtank-100 flex items-center justify-center mr-3">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-xs text-gray-500">{getCategoryLabel(item.category)}</p>
                    </div>
                  </div>
                  
                  {item.is_encrypted && (
                    <div className="p-1 bg-green-100 rounded-full">
                      <LockKeyhole className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </div>
                
                {item.preview && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md flex-grow">
                    <p className="text-sm text-gray-700 line-clamp-3">{item.preview}</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 mt-auto pt-3 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewItem(item)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    View
                  </Button>
                  
                  {item.document_url && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadFile(item)}
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Download
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setItemToDelete(item);
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Add Item Dialog */}
        <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add to Legacy Vault</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Life Insurance Policy" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ITEM_CATEGORIES.map(category => (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center">
                                {category.icon}
                                <span className="ml-2">{category.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preview"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description/Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add details about this item..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide additional information or instructions about this item
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <Label>Upload Document (Optional)</Label>
                  <div className="mt-2">
                    <FileUploader 
                      onFilesUploaded={(files) => {
                        setUploadedFiles(files);
                        toast({
                          title: "File Uploaded",
                          description: "Your file has been uploaded successfully.",
                        });
                      }}
                    />
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="is_encrypted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Encrypt Item</FormLabel>
                        <FormDescription>
                          Add additional encryption for sensitive information
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="submit"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add to Vault
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* View Item Dialog */}
        <Dialog open={viewItemOpen} onOpenChange={setViewItemOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{viewingItem?.title}</DialogTitle>
            </DialogHeader>
            
            {viewingItem && (
              <div className="py-4">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-lg bg-willtank-100 flex items-center justify-center mr-3">
                    {getCategoryIcon(viewingItem.category)}
                  </div>
                  <div>
                    <h3 className="font-medium">{viewingItem.title}</h3>
                    <p className="text-xs text-gray-500">{getCategoryLabel(viewingItem.category)}</p>
                  </div>
                </div>
                
                {viewingItem.is_encrypted && (
                  <div className="bg-green-50 p-3 rounded-md flex items-start mb-4">
                    <Shield className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-700 font-medium">Enhanced Encryption Enabled</p>
                      <p className="text-sm text-green-600">This item has additional encryption for extra security.</p>
                    </div>
                  </div>
                )}
                
                {viewingItem.preview && (
                  <div className="mb-4">
                    <Label className="mb-2 block">Description/Notes</Label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{viewingItem.preview}</p>
                    </div>
                  </div>
                )}
                
                {viewingItem.document_url && (
                  <div className="mb-4">
                    <Label className="mb-2 block">Attached Document</Label>
                    <div className="p-3 bg-gray-50 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-500 mr-2" />
                        <p className="text-sm text-gray-700">Document attached</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadFile(viewingItem)}
                        disabled={isFileDownloading}
                      >
                        {isFileDownloading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Added on {new Date(viewingItem.created_at).toLocaleDateString()}</p>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setItemToDelete(viewingItem);
                          setViewItemOpen(false);
                          setDeleteConfirmOpen(true);
                        }}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <p className="mb-4">
                Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteItem}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Item
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
