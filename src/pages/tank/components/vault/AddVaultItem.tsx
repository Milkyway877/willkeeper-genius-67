
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { createLegacyVaultItem } from '@/services/tankService';
import { LegacyVaultItem } from '../../types';
import { FileText, Save, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AddVaultItemProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: (item: LegacyVaultItem) => void;
}

export const AddVaultItem: React.FC<AddVaultItemProps> = ({ isOpen, onClose, onItemAdded }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'story' | 'confession' | 'wishes' | 'advice'>('story');
  const [preview, setPreview] = useState('');
  const [encryptionStatus, setEncryptionStatus] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setTitle('');
    setType('story');
    setPreview('');
    setEncryptionStatus(false);
    setDocumentUrl('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title for your item.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const newItem = await createLegacyVaultItem({
        title,
        type,
        preview,
        document_url: documentUrl || 'https://example.com/placeholder-document',
        encryptionStatus
      });

      if (newItem) {
        onItemAdded(newItem);
        handleClose();
        toast({
          title: "Item created",
          description: "Your legacy item has been successfully added to the vault."
        });
      } else {
        throw new Error("Failed to create item");
      }
    } catch (error) {
      toast({
        title: "Creation failed",
        description: "There was an error adding your item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Add Legacy Item
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter item title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as any)}>
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
              <Label htmlFor="preview">Preview / Summary</Label>
              <Textarea 
                id="preview" 
                value={preview} 
                onChange={(e) => setPreview(e.target.value)} 
                placeholder="Enter a brief summary"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="documentUrl">Document URL (optional)</Label>
              <Input 
                id="documentUrl" 
                value={documentUrl} 
                onChange={(e) => setDocumentUrl(e.target.value)} 
                placeholder="Enter URL to the document"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="encrypt" className="cursor-pointer">Encrypt this item</Label>
              <Switch 
                id="encrypt" 
                checked={encryptionStatus} 
                onCheckedChange={setEncryptionStatus} 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
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
                  Save Item
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
