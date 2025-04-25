import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { createLegacyVaultItem, updateLegacyVaultItem } from '@/services/tankService';
import { LegacyVaultItem, VaultItemType } from '../../types';
import { FileText, Save, Plus, Sparkles, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';

interface AddVaultItemProps {
  isOpen?: boolean;
  onClose?: () => void;
  onItemAdded?: (item: LegacyVaultItem) => void;
  mode?: 'create' | 'edit' | 'dialog';
  initialItem?: LegacyVaultItem;
}

export const AddVaultItem: React.FC<AddVaultItemProps> = ({ 
  isOpen = false, 
  onClose, 
  onItemAdded,
  mode = 'dialog',
  initialItem
}) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<VaultItemType>('story');
  const [preview, setPreview] = useState('');
  const [encryptionStatus, setEncryptionStatus] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  
  const isStandalone = mode === 'create' || mode === 'edit';
  const isEditMode = mode === 'edit';
  
  useEffect(() => {
    if (isEditMode && id) {
      setTitle(`Item ${id} - Edit Mode`);
      setPreview("This is a placeholder for editing an existing vault item");
      setType('advice');
      setEncryptionStatus(true);
    }
    
    if (initialItem) {
      setTitle(initialItem.title);
      setType(initialItem.type);
      setPreview(initialItem.preview || '');
      setEncryptionStatus(initialItem.encryptionStatus || false);
      setDocumentUrl(initialItem.document_url || '');
    }
  }, [isEditMode, id, initialItem]);

  const resetForm = () => {
    setTitle('');
    setType('story');
    setPreview('');
    setEncryptionStatus(false);
    setDocumentUrl('');
    setUseAI(false);
  };

  const handleClose = () => {
    if (isStandalone) {
      navigate('/dashboard/vault');
    } else if (onClose) {
      resetForm();
      onClose();
    }
  };

  const generateWithAI = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title before generating content with AI.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      setTimeout(() => {
        const aiPreview = `This is an AI-generated preview for "${title}". It's a ${type} that contains important information to be preserved for future generations.`;
        setPreview(aiPreview);
        setDocumentUrl('https://example.com/ai-generated-document');
        
        toast({
          title: "AI content generated",
          description: "Content has been created based on your title and type."
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "AI generation failed",
        description: "There was an error generating content. Please try again or create manually.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
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
      const finalDocumentUrl = documentUrl || `https://example.com/documents/${Date.now()}`;
      
      let resultItem;
      
      if (isEditMode && id) {
        resultItem = await updateLegacyVaultItem(id, {
          title,
          type,
          preview,
          document_url: finalDocumentUrl,
          encryptionStatus
        });
        
        if (resultItem) {
          toast({
            title: "Item updated",
            description: "Your legacy item has been successfully updated."
          });
        }
      } else {
        resultItem = await createLegacyVaultItem({
          title,
          type,
          preview,
          document_url: finalDocumentUrl,
          encryptionStatus
        });
        
        if (resultItem) {
          if (onItemAdded) {
            onItemAdded(resultItem);
          }
          toast({
            title: "Item created",
            description: "Your legacy item has been successfully added to the vault."
          });
        }
      }
      
      if (!resultItem) {
        throw new Error(isEditMode ? "Failed to update item" : "Failed to create item");
      }
      
      handleClose();
    } catch (error) {
      console.error("Error saving item:", error);
      toast({
        title: isEditMode ? "Update failed" : "Creation failed",
        description: `There was an error ${isEditMode ? 'updating' : 'adding'} your item. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isStandalone && (
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button 
              type="button"
              variant="ghost"
              className="mr-2"
              onClick={handleClose}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vault
            </Button>
            <h1 className="text-2xl font-bold">
              {isEditMode ? "Edit Legacy Item" : "Create Legacy Item"}
            </h1>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
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
          <Select value={type} onValueChange={(value) => setType(value as VaultItemType)}>
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
        
        <div className="flex items-center justify-between">
          <Label htmlFor="ai-assist" className="cursor-pointer">Use AI assistance</Label>
          <div className="flex items-center gap-2">
            <Switch 
              id="ai-assist" 
              checked={useAI} 
              onCheckedChange={setUseAI} 
            />
            {useAI && (
              <Button 
                type="button" 
                size="sm"
                variant="outline"
                onClick={generateWithAI}
                disabled={isLoading || !title.trim()}
                className="ml-2"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
              </Button>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="preview">Preview / Summary</Label>
          <Textarea 
            id="preview" 
            value={preview} 
            onChange={(e) => setPreview(e.target.value)} 
            placeholder="Enter a brief summary or let AI generate it"
            className="min-h-[100px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="documentUrl">Document URL (optional)</Label>
          <Input 
            id="documentUrl" 
            value={documentUrl} 
            onChange={(e) => setDocumentUrl(e.target.value)} 
            placeholder="Enter URL to the document or leave blank"
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
      
      {isStandalone ? (
        <div className="flex justify-end gap-3 pt-4">
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
                {isEditMode ? "Updating..." : "Saving..."}
              </span>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? "Update Item" : "Save Item"}
              </>
            )}
          </Button>
        </div>
      ) : null}
    </form>
  );

  if (isStandalone) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            {formContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isEditMode ? "Edit Legacy Item" : "Add Legacy Item"}
          </DialogTitle>
        </DialogHeader>
        
        {formContent}
        
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
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <span className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {isEditMode ? "Updating..." : "Saving..."}
              </span>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? "Update Item" : "Save Item"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
