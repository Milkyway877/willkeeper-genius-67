
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { LegacyVaultItem } from '@/pages/tank/types';
import { useToast } from '@/hooks/use-toast';
import { toggleItemEncryption, updateVaultItem, deleteVaultItem, convertToLegacyVaultItem } from '@/services/tankService';
import { Lock, Unlock, Eye, File, ExternalLink } from 'lucide-react';

interface VaultItemDialogProps {
  item: LegacyVaultItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: LegacyVaultItem) => void;
  onDelete: (id: string) => void;
}

export const VaultItemDialog: React.FC<VaultItemDialogProps> = ({ 
  item, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete 
}) => {
  const [title, setTitle] = useState('');
  const [itemType, setItemType] = useState('');
  const [preview, setPreview] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setItemType(item.type);
      setPreview(item.preview);
      setDocumentUrl(item.document_url);
      setIsEncrypted(item.encryptionStatus);
    }
  }, [item]);

  const handleSave = async () => {
    if (!item) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedItem = await updateVaultItem(item.id, {
        title,
        category: itemType,
        preview,
        document_url: documentUrl,
        is_encrypted: isEncrypted
      });
      
      if (updatedItem) {
        // Convert to legacy format for compatibility
        const legacyItem = convertToLegacyVaultItem(updatedItem);
        
        toast({
          title: "Item updated",
          description: "Your vault item has been successfully updated."
        });
        
        onSave(legacyItem as unknown as LegacyVaultItem);
      } else {
        throw new Error("Failed to update item");
      }
    } catch (error) {
      console.error("Error updating vault item:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your vault item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    
    setIsSubmitting(true);
    
    try {
      const success = await deleteVaultItem(item.id);
      
      if (success) {
        toast({
          title: "Item deleted",
          description: "Your vault item has been successfully deleted."
        });
        
        onDelete(item.id);
        onClose();
      } else {
        throw new Error("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting vault item:", error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting your vault item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleToggleEncryption = async () => {
    if (!item) return;
    
    try {
      const updatedItem = await toggleItemEncryption(item.id, !isEncrypted);
      
      if (updatedItem) {
        const legacyItem = convertToLegacyVaultItem(updatedItem);
        
        toast({
          title: isEncrypted ? "Item decrypted" : "Item encrypted",
          description: `Your vault item is now ${isEncrypted ? 'decrypted' : 'encrypted'}.`
        });
        
        setIsEncrypted(!isEncrypted);
        onSave(legacyItem as unknown as LegacyVaultItem);
      }
    } catch (error) {
      console.error("Error toggling encryption:", error);
      toast({
        title: "Action failed",
        description: "There was an error changing the encryption status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{viewMode ? 'View Vault Item' : 'Edit Vault Item'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                readOnly={viewMode}
              />
            </div>
            
            <div>
              <Label htmlFor="type">Type</Label>
              {viewMode ? (
                <div className="flex items-center gap-2 p-2 border rounded-md text-sm">
                  <File size={16} />
                  {itemType}
                </div>
              ) : (
                <Select value={itemType} onValueChange={setItemType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="confession">Confession</SelectItem>
                    <SelectItem value="wishes">Wishes</SelectItem>
                    <SelectItem value="advice">Advice</SelectItem>
                    <SelectItem value="will">Will</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div>
              <Label htmlFor="preview">Description</Label>
              <Textarea 
                id="preview" 
                value={preview} 
                onChange={(e) => setPreview(e.target.value)} 
                readOnly={viewMode}
                rows={3}
              />
            </div>
            
            {documentUrl && (
              <div>
                <Label>Document</Label>
                <div className="flex items-center justify-between p-2 border rounded-md text-sm">
                  <span className="truncate flex-1">{documentUrl.split('/').pop()}</span>
                  <a 
                    href={documentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink size={14} />
                    View
                  </a>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="encryption" 
                  checked={isEncrypted} 
                  onCheckedChange={setIsEncrypted}
                  disabled={viewMode}
                />
                <Label htmlFor="encryption" className="flex items-center gap-2 cursor-pointer">
                  {isEncrypted ? (
                    <>
                      <Lock size={16} /> Encrypted
                    </>
                  ) : (
                    <>
                      <Unlock size={16} /> Not encrypted
                    </>
                  )}
                </Label>
              </div>
              
              {viewMode && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleToggleEncryption}
                >
                  {isEncrypted ? 'Decrypt' : 'Encrypt'}
                </Button>
              )}
            </div>
            
            <div className="flex justify-between mt-4">
              {viewMode ? (
                <>
                  <Button type="button" variant="destructive" onClick={openDeleteDialog}>
                    Delete
                  </Button>
                  <div className="space-x-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Close
                    </Button>
                    <Button type="button" onClick={() => setViewMode(false)}>
                      Edit
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={() => setViewMode(true)}>
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleSave}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your vault item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
