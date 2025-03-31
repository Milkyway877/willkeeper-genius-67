
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Edit, Lock, Unlock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getLegacyVaultItems,
  createLegacyVaultItem,
  updateLegacyVaultItem,
  deleteLegacyVaultItem,
  toggleItemEncryption
} from '@/services/tankService';
import { LegacyVaultItem } from '../../types';

interface VaultItemDialogProps {
  open?: boolean;
  isOpen?: boolean; // Added for compatibility with calling components
  setOpen?: (open: boolean) => void;
  onClose?: () => void; // Added for compatibility with calling components
  item: LegacyVaultItem | null;
  onItemUpdate?: (item: LegacyVaultItem) => void;
  onSave?: (item: LegacyVaultItem) => void; // Added for compatibility with calling components
  onDelete?: (id: string) => Promise<void>; // Added for compatibility with calling components
}

export function VaultItemDialog({ 
  open, 
  isOpen, 
  setOpen, 
  onClose, 
  item, 
  onItemUpdate,
  onSave,
  onDelete 
}: VaultItemDialogProps) {
  const { toast } = useToast();
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemContent, setItemContent] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Handle both open and isOpen props
  const isDialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = setOpen || (onClose ? (val: boolean) => {
    if (!val) onClose();
  } : undefined);

  useEffect(() => {
    if (item) {
      setItemName(item.item_name || item.title || '');
      setItemDescription(item.item_description || item.preview || '');
      setItemContent(item.item_content || '');
      setIsEncrypted(item.is_encrypted || item.encryptionStatus || false);
    } else {
      setItemName('');
      setItemDescription('');
      setItemContent('');
      setIsEncrypted(false);
    }
  }, [item]);

  const handleClose = () => {
    if (setOpen) setOpen(false);
    if (onClose) onClose();
  };

  const handleSubmit = async () => {
    if (!item) return;

    setLoading(true);
    try {
      const updates = {
        item_name: itemName,
        item_description: itemDescription,
        item_content: itemContent,
        is_encrypted: isEncrypted,
      };

      const updatedItem = await updateLegacyVaultItem(item.id, updates);

      if (updatedItem) {
        if (onItemUpdate) onItemUpdate(updatedItem);
        if (onSave) onSave(updatedItem);
        
        toast({
          title: "Vault Item Updated",
          description: "Your vault item has been successfully updated.",
        });
        handleClose();
      } else {
        throw new Error('Failed to update vault item');
      }
    } catch (error) {
      console.error('Error updating vault item:', error);
      toast({
        title: "Error",
        description: "Failed to update vault item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleEncryption = async () => {
    if (!item) return;
    
    try {
      const success = await toggleItemEncryption(item.id, !isEncrypted);
      
      if (success) {
        // Create a proper updated item object
        const updatedItem: LegacyVaultItem = {
          ...item,
          is_encrypted: !isEncrypted,
          encryptionStatus: !isEncrypted
        };
        
        if (onItemUpdate) onItemUpdate(updatedItem);
        if (onSave) onSave(updatedItem);
        
        setIsEncrypted(!isEncrypted);
        
        toast({
          title: !isEncrypted ? "Item Encrypted" : "Item Decrypted",
          description: !isEncrypted 
            ? "Your item is now encrypted and secure." 
            : "Your item is now decrypted and accessible.",
        });
      } else {
        throw new Error('Failed to toggle encryption');
      }
    } catch (error) {
      console.error('Error toggling encryption:', error);
      toast({
        title: "Error",
        description: "Failed to change encryption status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Vault Item</DialogTitle>
          <DialogDescription>
            Make changes to your secure vault item here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content" className="text-right">
              Content
            </Label>
            <Textarea
              id="content"
              value={itemContent}
              onChange={(e) => setItemContent(e.target.value)}
              className="col-span-3 min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="encryption" className="text-right">
              Encryption
            </Label>
            <div className="col-span-3 flex items-center justify-between">
              <Switch
                id="encryption"
                checked={isEncrypted}
                onCheckedChange={toggleEncryption}
              />
              {isEncrypted ? (
                <Lock className="h-5 w-5 text-green-500" />
              ) : (
                <Unlock className="h-5 w-5 text-amber-500" />
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Update Item
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
