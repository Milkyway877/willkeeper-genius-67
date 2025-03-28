
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  BookOpen, 
  Heart, 
  Lightbulb, 
  MessageSquare, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Lock,
  Shield,
  Loader2,
  Sparkles
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LegacyVaultItem } from '../types';
import { getLegacyVaultItems, deleteLegacyVaultItem, createLegacyVaultItem } from '@/services/tankService';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useSystemNotifications } from '@/hooks/use-system-notifications';

const getTypeIcon = (type: LegacyVaultItem['type']) => {
  switch (type) {
    case 'story':
      return <BookOpen size={16} className="text-blue-500" />;
    case 'confession':
      return <Heart size={16} className="text-red-500" />;
    case 'wishes':
      return <MessageSquare size={16} className="text-purple-500" />;
    case 'advice':
      return <Lightbulb size={16} className="text-amber-500" />;
    default:
      return <BookOpen size={16} />;
  }
};

const getTypeName = (type: LegacyVaultItem['type']) => {
  switch (type) {
    case 'story':
      return 'Personal Story';
    case 'confession':
      return 'Confession/Secret';
    case 'wishes':
      return 'Special Wishes';
    case 'advice':
      return 'Life Advice';
    default:
      return 'Unknown';
  }
};

export const TankLegacyVault: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { notifyDocumentUploaded } = useSystemNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [vaultItems, setVaultItems] = useState<LegacyVaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    type: 'story' as LegacyVaultItem['type'],
    preview: '',
    document_url: 'https://placeholder-document-url.com'
  });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewItem, setViewItem] = useState<LegacyVaultItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);
  
  useEffect(() => {
    const loadVaultItems = async () => {
      try {
        setIsLoading(true);
        const data = await getLegacyVaultItems();
        setVaultItems(data);
        setError(null);
      } catch (err) {
        console.error('Error loading vault items:', err);
        setError('Failed to load vault items. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVaultItems();
  }, []);
  
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  const filteredItems = vaultItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getTypeName(item.type).toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleView = (item: LegacyVaultItem) => {
    setViewItem(item);
  };
  
  const handleEdit = (id: number | string) => {
    // Find the item and pre-populate the edit dialog
    const itemToEdit = vaultItems.find(item => item.id === id);
    if (itemToEdit) {
      setCurrentEditId(id.toString());
      setNewItem({
        title: itemToEdit.title,
        type: itemToEdit.type,
        preview: itemToEdit.preview || '',
        document_url: itemToEdit.document_url || 'https://placeholder-document-url.com'
      });
      setShowCreateDialog(true);
    }
  };
  
  const handleDelete = async (id: number | string) => {
    try {
      await deleteLegacyVaultItem(id.toString());
      setVaultItems(vaultItems.filter(item => item.id !== id));
      toast({
        title: "Vault item deleted",
        description: "The vault item has been permanently deleted."
      });
    } catch (err) {
      console.error('Error deleting vault item:', err);
      toast({
        title: "Error",
        description: "Failed to delete the vault item. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleAddNew = () => {
    // Reset the form
    setCurrentEditId(null);
    setNewItem({
      title: '',
      type: 'story',
      preview: '',
      document_url: 'https://placeholder-document-url.com'
    });
    setAiPrompt('');
    setShowCreateDialog(true);
  };

  const handleCreateItem = async () => {
    if (!newItem.title) {
      toast({
        title: "Missing information",
        description: "Please provide a title for your legacy item.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);

      if (currentEditId) {
        // Update existing item
        const { data, error } = await supabase
          .from('legacy_vault')
          .update({
            title: newItem.title,
            category: newItem.type,
            preview: newItem.preview,
            document_url: newItem.document_url
          })
          .eq('id', currentEditId)
          .select();
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Update the item in the local state
          setVaultItems(vaultItems.map(item => 
            item.id === currentEditId ? {
              ...item,
              title: newItem.title,
              type: newItem.type,
              preview: newItem.preview,
              document_url: newItem.document_url
            } : item
          ));
          
          toast({
            title: "Item updated",
            description: "Your legacy item has been updated successfully."
          });
        }
      } else {
        // Create new item
        const createdItem = await createLegacyVaultItem(newItem);
        if (createdItem) {
          setVaultItems([createdItem, ...vaultItems]);
          
          // Send system notification
          await notifyDocumentUploaded({
            title: "Legacy Item Added",
            description: `Your legacy item "${newItem.title}" has been added to your vault.`
          });
          
          toast({
            title: "Item created",
            description: "Your legacy item has been added to your vault."
          });
        }
      }
      
      setShowCreateDialog(false);
    } catch (err) {
      console.error('Error saving vault item:', err);
      toast({
        title: "Error",
        description: "Failed to save the vault item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const generateWithAI = async () => {
    if (!aiPrompt) {
      toast({
        title: "Missing information",
        description: "Please provide a prompt for the AI.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Call the AI assistant edge function
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          query: `Generate a ${newItem.type} about ${aiPrompt}. Make it personal, emotional and detailed. Keep it under 500 words.`,
          conversation_history: []
        }
      });
      
      if (error) {
        throw new Error('Error generating content with AI');
      }
      
      const generatedContent = data.response || '';
      
      // Update the new item with AI generated content
      setNewItem({
        ...newItem,
        title: newItem.title || `My ${getTypeName(newItem.type)} about ${aiPrompt}`,
        preview: generatedContent
      });
      
      toast({
        title: "Content generated",
        description: "AI has created content based on your prompt."
      });
    } catch (err) {
      console.error('Error generating content with AI:', err);
      toast({
        title: "Generation failed",
        description: "Could not generate content. Please try again or create manually.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-willtank-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading your vault items...</p>
      </div>
    );
  }

  if (error && vaultItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <BookOpen className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">Failed to load vault items</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      <Card className="mb-6 border-willtank-100 bg-gradient-to-br from-willtank-50 to-gray-50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="h-16 w-16 rounded-full bg-willtank-100 flex items-center justify-center flex-shrink-0">
              <Shield className="h-8 w-8 text-willtank-600" />
            </div>
            
            <div className="flex-grow">
              <h3 className="text-xl font-bold mb-2">Legacy Vault</h3>
              <p className="text-gray-600 mb-4">
                Secure storage for your most important personal memories, confessions, and wishes that will be
                passed on to your loved ones according to your specified conditions.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-white">Triple-encrypted</Badge>
                <Badge variant="outline" className="bg-white">Posthumous delivery</Badge>
                <Badge variant="outline" className="bg-white">Private access</Badge>
              </div>
            </div>
            
            <Button onClick={handleAddNew} className="flex-shrink-0">
              <Plus size={16} className="mr-2" />
              Add to Vault
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search vault items by title or type..." 
            className="pl-10"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No vault items found</h3>
            <p className="text-gray-500 mb-4">Add personal stories, secrets, or wishes to your legacy vault.</p>
            <Button onClick={handleAddNew}>Add to Vault</Button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      {getTypeIcon(item.type)}
                    </div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(item)}>
                        <Eye size={14} className="mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(item.id)}>
                        <Edit size={14} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>{getTypeName(item.type)}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-500 line-clamp-3">{item.preview}</p>
              </CardContent>
              
              <CardFooter className="flex justify-between text-xs text-gray-500 pt-0">
                <div>Created {new Date(item.createdAt).toLocaleDateString()}</div>
                {item.encryptionStatus && (
                  <div className="flex items-center">
                    <Lock size={12} className="mr-1" />
                    Encrypted
                  </div>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      
      {/* Create/Edit Item Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentEditId ? 'Edit Legacy Item' : 'Add to Legacy Vault'}</DialogTitle>
            <DialogDescription>
              {currentEditId 
                ? 'Update your legacy vault item details below.'
                : 'Create a new item for your legacy vault. These items will be securely stored and delivered according to your wishes.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="item-title" className="text-sm font-medium">Title</label>
              <Input
                id="item-title"
                value={newItem.title}
                onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                placeholder="Enter a title for your legacy item"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="item-type" className="text-sm font-medium">Item Type</label>
              <select 
                id="item-type"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newItem.type}
                onChange={(e) => setNewItem({...newItem, type: e.target.value as LegacyVaultItem['type']})}
              >
                <option value="story">Personal Story</option>
                <option value="confession">Confession/Secret</option>
                <option value="wishes">Special Wishes</option>
                <option value="advice">Life Advice</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="item-content" className="text-sm font-medium">Content</label>
                <div className="flex items-center">
                  <Sparkles size={14} className="text-amber-500 mr-1" />
                  <span className="text-xs text-gray-500">AI Assistance Available</span>
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-md mb-2">
                <div className="flex gap-2 items-center mb-2">
                  <Input
                    placeholder="Describe what you want the AI to write about..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="flex-grow"
                  />
                  <Button 
                    onClick={generateWithAI} 
                    disabled={isGenerating} 
                    size="sm"
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Example: "my childhood summers at grandma's lake house" or "advice for my children about finding happiness"
                </p>
              </div>
              <Textarea
                id="item-content"
                value={newItem.preview}
                onChange={(e) => setNewItem({...newItem, preview: e.target.value})}
                placeholder="Write your content or use AI to generate it..."
                rows={8}
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleCreateItem}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {currentEditId ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                currentEditId ? 'Update Item' : 'Save to Vault'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Item Dialog */}
      <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {viewItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    {getTypeIcon(viewItem.type)}
                  </div>
                  <DialogTitle>{viewItem.title}</DialogTitle>
                </div>
                <DialogDescription>
                  {getTypeName(viewItem.type)} · Created {new Date(viewItem.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="bg-gray-50 p-4 rounded-md whitespace-pre-line">
                  {viewItem.preview}
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setViewItem(null)}
                >
                  Close
                </Button>
                <Button 
                  type="button" 
                  onClick={() => {
                    setViewItem(null);
                    handleEdit(viewItem.id);
                  }}
                >
                  <Edit size={14} className="mr-2" />
                  Edit
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
