import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, Image, Video, AudioLines, File, MoreVertical, Edit, Trash2, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LegacyVaultItem, VaultItemType } from '../types';
import { AddVaultItem } from './vault/AddVaultItem';
import { VaultItemDialog } from './vault/VaultItemDialog';
import {
  getVaultItems,
  deleteVaultItem,
  convertToLegacyVaultItem
} from '@/services/tankService';
import { useToast } from '@/hooks/use-toast';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'story':
      return <FileText size={16} className="text-blue-500" />;
    case 'confession':
      return <FileText size={16} className="text-red-500" />;
    case 'wishes':
      return <FileText size={16} className="text-purple-500" />;
    case 'advice':
      return <FileText size={16} className="text-green-500" />;
    case 'image':
      return <Image size={16} className="text-blue-500" />;
    case 'video':
      return <Video size={16} className="text-red-500" />;
    case 'audio':
      return <AudioLines size={16} className="text-purple-500" />;
    case 'will':
      return <FileText size={16} className="text-green-700" />;
    case 'document':
      return <File size={16} className="text-amber-500" />;
    default:
      return <FileText size={16} />;
  }
};

export const UnifiedVault: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [vaultItems, setVaultItems] = useState<LegacyVaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LegacyVaultItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const loadVaultItems = async () => {
    setIsLoading(true);
    try {
      const items = await getVaultItems();
      const legacyItems = items.map(item => {
        const converted = convertToLegacyVaultItem(item);
        return converted as unknown as LegacyVaultItem;
      });
      setVaultItems(legacyItems);
    } catch (error) {
      console.error('Error loading vault items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVaultItems();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredVaultItems = vaultItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddItem = () => {
    setIsAddDialogOpen(true);
  };

  const handleItemAdded = (newItem: LegacyVaultItem) => {
    setVaultItems([...vaultItems, newItem]);
    setIsAddDialogOpen(false);
  };

  const handleViewItem = (item: LegacyVaultItem) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const handleEditItem = (item: LegacyVaultItem) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const handleSaveItem = (updatedItem: LegacyVaultItem) => {
    setVaultItems(vaultItems.map(item => item.id === updatedItem.id ? updatedItem : item));
    setSelectedItem(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const success = await deleteVaultItem(id);
      if (success) {
        setVaultItems(vaultItems.filter(item => item.id !== id));
        toast({
          title: "Item deleted",
          description: "The item has been successfully deleted."
        });
      } else {
        throw new Error('Failed to delete item');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      toast({
        title: "Error",
        description: "Failed to delete the item. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search vault items by title..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <Button variant="outline" className="flex-shrink-0">
          <Filter size={16} className="mr-2" />
          Filter
        </Button>
      </div>

      <div className="mb-4">
        <Button onClick={handleAddItem}>Add Vault Item</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Loading vault items...</div>
        ) : filteredVaultItems.length === 0 ? (
          <div className="col-span-full text-center py-8">No vault items found.</div>
        ) : (
          filteredVaultItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1">
                    {getTypeIcon(item.type)}
                    <span className="text-xs text-gray-500">{item.type}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewItem(item)}>
                        <Edit size={14} className="mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditItem(item)}>
                        <Edit size={14} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="font-medium mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">{item.preview}</p>
                <div className="mt-2">
                  <Badge variant="outline">
                    {item.encryptionStatus ? (
                      <>
                        <Lock size={12} className="mr-1" />
                        Encrypted
                      </>
                    ) : (
                      <>
                        <Unlock size={12} className="mr-1" />
                        Not Encrypted
                      </>
                    )}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AddVaultItem isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} onItemAdded={handleItemAdded} />
      <VaultItemDialog
        item={selectedItem}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
      />
    </div>
  );
};
