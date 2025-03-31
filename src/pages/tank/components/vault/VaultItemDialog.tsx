import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LegacyVaultItem, VaultItemType } from '../../types';
import { FileText, Lock, Unlock, Eye, Edit, Trash2, Save, XCircle, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { toggleItemEncryption, updateLegacyVaultItem, deleteLegacyVaultItem } from '@/services/tankService';

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
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item?.title || '');
  const [type, setType] = useState<VaultItemType>(item?.type || VaultItemType.story);
  const [preview, setPreview] = useState(item?.preview || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUsingAI, setIsUsingAI] = useState(false);

  React.useEffect(() => {
    if (item) {
      setTitle(item.title);
      setType(item.type);
      setPreview(item.preview);
      setIsEditing(false);
      setIsUsingAI(false);
    }
  }, [item]);

  const handleClose = () => {
    setIsEditing(false);
    setIsUsingAI(false);
    onClose();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (item) {
      setTitle(item.title);
      setType(item.type);
      setPreview(item.preview);
    }
    setIsEditing(false);
    setIsUsingAI(false);
  };

  const handleSave = async () => {
    if (!item) return;

    setIsLoading(true);
    try {
      const updatedItem = await updateLegacyVaultItem(item.id, {
        title,
        category: type,
        preview
      });

      if (updatedItem) {
        const legacyItem = convertToLegacyVaultItem(updatedItem);
        onSave(legacyItem);
        setIsEditing(false);
        toast({
          title: "Item updated",
          description: "Your legacy item has been successfully updated."
        });
      } else {
        throw new Error("Failed to update item");
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;

    setIsLoading(true);
    try {
      const success = await deleteLegacyVaultItem(item.id);
      if (success) {
        onDelete(item.id);
        onClose();
        toast({
          title: "Item deleted",
          description: "Your legacy item has been successfully deleted."
        });
      } else {
        throw new Error("Failed to delete item");
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "There was an error deleting your item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEncryptToggle = async () => {
    if (!item) return;

    setIsLoading(true);
    try {
      const updatedItem = await toggleItemEncryption(item.id, !item.encryptionStatus);
      if (updatedItem) {
        const legacyItem = convertToLegacyVaultItem(updatedItem);
        onSave(legacyItem);
        toast({
          title: legacyItem.encryptionStatus ? "Item encrypted" : "Item decrypted",
          description: `Your legacy item has been ${legacyItem.encryptionStatus ? "encrypted" : "decrypted"}.`
        });
      } else {
        throw new Error(`Failed to ${item.encryptionStatus ? "decrypt" : "encrypt"} item`);
      }
    } catch (error) {
      toast({
        title: "Encryption toggle failed",
        description: "There was an error changing the encryption status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const enhanceWithAI = () => {
    setIsLoading(true);
    // Simulate AI enhancement
    setTimeout(() => {
      const enhancedPreview = `${preview}\n\nEnhanced by AI: This ${type} represents an important part of your legacy. It contains valuable information that future generations will appreciate.`;
      setPreview(enhancedPreview);
      toast({
        title: "AI enhancement applied",
        description: "Your content has been enhanced with AI suggestions."
      });
      setIsLoading(false);
    }, 1000);
  };

  const getItemTypeIcon = () => {
    switch (item?.type) {
      case 'story':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'confession':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'wishes':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'advice':
        return <FileText className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getItemTypeName = (itemType: string) => {
    const types = {
      'story': 'Personal Story',
      'confession': 'Confession',
      'wishes': 'Special Wishes',
      'advice': 'Life Advice'
    };
    return types[itemType as keyof typeof types] || 'Document';
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getItemTypeIcon()}
            {isEditing ? 'Edit Legacy Item' : item.title}
          </DialogTitle>
          {!isEditing && (
            <DialogDescription>
              {getItemTypeName(item.type)} • Created on {new Date(item.createdAt).toLocaleDateString()}
            </DialogDescription>
          )}
        </DialogHeader>

        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter item title" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                value={type} 
                onValueChange={(value: string) => setType(value as VaultItemType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="story">Personal Story</SelectItem>
                  <SelectItem value="confession">Confession</SelectItem>
                  <SelectItem value="wishes">Special Wishes</SelectItem>
                  <SelectItem value="advice">Life Advice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="preview">Preview / Summary</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={enhanceWithAI}
                  disabled={isLoading}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Enhance with AI
                </Button>
              </div>
              <Textarea 
                id="preview" 
                value={preview} 
                onChange={(e) => setPreview(e.target.value)} 
                placeholder="Enter a brief summary" 
                className="min-h-[100px]"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Encryption Status</div>
              <div className="flex items-center">
                {item.encryptionStatus ? (
                  <Lock className="w-4 h-4 mr-1 text-green-600" />
                ) : (
                  <Unlock className="w-4 h-4 mr-1 text-orange-500" />
                )}
                <span className={item.encryptionStatus ? "text-green-600" : "text-orange-500"}>
                  {item.encryptionStatus ? "Encrypted" : "Not Encrypted"}
                </span>
              </div>
            </div>
            
            <div className="border rounded-md p-4 bg-gray-50">
              <div className="text-sm text-gray-500 mb-1">Preview</div>
              <p className="text-sm whitespace-pre-line">{item.preview || "No preview available."}</p>
            </div>
            
            {item.document_url && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <a 
                  href={item.document_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-willtank-600 hover:underline"
                >
                  View Document
                </a>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={!title.trim() || isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                className="sm:mr-auto"
                onClick={handleEncryptToggle}
                disabled={isLoading}
              >
                {item.encryptionStatus ? (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    Decrypt
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Encrypt
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleEdit}
                disabled={isLoading}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
