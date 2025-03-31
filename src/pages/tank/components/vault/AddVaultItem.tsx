
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { LegacyVaultItem } from '@/pages/tank/types';
import { createVaultItem, convertToLegacyVaultItem } from '@/services/tankService';
import { FileUp, Lock, Unlock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddVaultItemProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: (item: LegacyVaultItem) => void;
}

export const AddVaultItem: React.FC<AddVaultItemProps> = ({ isOpen, onClose, onItemAdded }) => {
  const [title, setTitle] = useState('');
  const [itemType, setItemType] = useState('document');
  const [preview, setPreview] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setTitle('');
    setItemType('document');
    setPreview('');
    setDocumentUrl('');
    setIsEncrypted(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For a real implementation, you would upload this file to a storage service
    // and get a URL back. Here we'll simulate that.
    const fileSize = (file.size / 1024).toFixed(2); // Convert to KB
    
    setTitle(file.name);
    setPreview(`${file.name} (${fileSize} KB)`);
    
    // Simulate a document URL
    const simulatedUrl = `https://example.com/documents/${Date.now()}-${file.name}`;
    setDocumentUrl(simulatedUrl);
    
    toast({
      title: "File selected",
      description: `${file.name} is ready to be added to your legacy vault.`
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast({
        title: "Missing information",
        description: "Please provide a title for your legacy item.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const vaultItem = await createVaultItem({
        title,
        category: itemType,
        preview,
        document_url: documentUrl,
        is_encrypted: isEncrypted
      });
      
      if (vaultItem) {
        // Convert to legacy format for compatibility with existing code
        const legacyItem = convertToLegacyVaultItem(vaultItem);
        
        toast({
          title: "Item added",
          description: "Your legacy item has been successfully added to the vault."
        });
        
        onItemAdded(legacyItem as unknown as LegacyVaultItem);
        handleClose();
      } else {
        throw new Error("Failed to create vault item");
      }
    } catch (error) {
      console.error("Error creating vault item:", error);
      toast({
        title: "Error",
        description: "There was a problem adding your item to the vault. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Legacy Vault Item</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="file">Upload File (Optional)</Label>
            <div className="mt-1 flex items-center">
              <label className="flex items-center gap-2 cursor-pointer text-sm border rounded-md px-3 py-2 text-gray-600 hover:bg-gray-50">
                <FileUp size={16} />
                Choose File
                <input 
                  type="file" 
                  id="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
              </label>
              {preview && <span className="ml-2 text-sm text-gray-500">{preview}</span>}
            </div>
          </div>
          
          <div>
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Enter title"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={itemType} onValueChange={setItemType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
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
          </div>
          
          <div>
            <Label htmlFor="preview">Description</Label>
            <Textarea 
              id="preview" 
              value={preview} 
              onChange={(e) => setPreview(e.target.value)} 
              placeholder="Enter a brief description"
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="encryption" 
              checked={isEncrypted} 
              onCheckedChange={setIsEncrypted}
            />
            <Label htmlFor="encryption" className="flex items-center gap-2 cursor-pointer">
              {isEncrypted ? (
                <>
                  <Lock size={16} /> Encrypt this item
                </>
              ) : (
                <>
                  <Unlock size={16} /> Not encrypted
                </>
              )}
            </Label>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
