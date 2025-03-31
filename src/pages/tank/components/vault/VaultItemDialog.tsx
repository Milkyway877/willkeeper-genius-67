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

export interface LegacyVaultItem {
  id: string;
  user_id: string;
  item_name: string;
  item_description: string;
  item_type: string;
  item_content: string;
  is_encrypted: boolean;
  created_at: string;
  updated_at: string;
}

interface VaultItemDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  item: LegacyVaultItem | null;
  onItemUpdate: (item: LegacyVaultItem) => void;
}

export function VaultItemDialog({ open, setOpen, item, onItemUpdate }: VaultItemDialogProps) {
  const { toast } = useToast();
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemContent, setItemContent] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setItemName(item.item_name);
      setItemDescription(item.item_description);
      setItemContent(item.item_content);
      setIsEncrypted(item.is_encrypted);
    } else {
      setItemName('');
      setItemDescription('');
      setItemContent('');
      setIsEncrypted(false);
    }
  }, [item]);

  const handleClose = () => {
    setOpen(false);
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
        onItemUpdate(updatedItem);
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
    try {
      const success = await toggleItemEncryption(item.id, !item.is_encrypted);
      
      if (success) {
        // Update the local state
        const updatedItem = { ...item, is_encrypted: !item.is_encrypted };
        onItemUpdate(updatedItem);
        
        toast({
          title: updatedItem.is_encrypted ? "Item Encrypted" : "Item Decrypted",
          description: updatedItem.is_encrypted 
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
    <Dialog open={open} onOpenChange={setOpen}>
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
                checked={item ? item.is_encrypted : false}
                onCheckedChange={toggleEncryption}
              />
              {item?.is_encrypted ? (
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
