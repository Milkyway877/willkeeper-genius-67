
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LegacyVaultItem } from '../types';
import { VaultItem } from '@/services/tankService';
import { VaultItem as VaultItemComponent } from './vault/VaultItem';
import { AddVaultItem } from './vault/AddVaultItem';
import { VaultItemDialog } from './vault/VaultItemDialog';
import { getVaultItems, deleteVaultItem, convertToLegacyVaultItem } from '@/services/tankService';
import { toast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';

export const TankLegacyVault: React.FC = () => {
  const [vaultItems, setVaultItems] = useState<LegacyVaultItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LegacyVaultItem | null>(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVaultItems = async () => {
      setLoading(true);
      try {
        const items = await getVaultItems();
        // Convert VaultItem to LegacyVaultItem
        const legacyItems = items.map(item => {
          // Ensure type compatibility by converting type to VaultItemType
          const converted = convertToLegacyVaultItem(item);
          return converted as unknown as LegacyVaultItem;
        });
        setVaultItems(legacyItems);
      } catch (error) {
        console.error('Error fetching vault items:', error);
        // Display error message
      } finally {
        setLoading(false);
      }
    };
    
    fetchVaultItems();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredVaultItems = vaultItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAddItemDialog = () => {
    setIsAddDialogOpen(true);
  };

  const handleCloseAddItemDialog = () => {
    setIsAddDialogOpen(false);
  };

  const handleItemAdded = (newItem: LegacyVaultItem) => {
    setVaultItems([...vaultItems, newItem]);
  };

  const handleViewItem = (item: LegacyVaultItem) => {
    setSelectedItem(item);
    setIsItemDialogOpen(true);
  };

  const handleEditItem = (item: LegacyVaultItem) => {
    setSelectedItem(item);
    setIsItemDialogOpen(true);
  };

  const handleCloseItemDialog = () => {
    setIsItemDialogOpen(false);
    setSelectedItem(null);
  };

  const handleSaveItem = (updatedItem: LegacyVaultItem) => {
    setVaultItems(
      vaultItems.map(item => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const success = await deleteVaultItem(id);
      if (success) {
        setVaultItems(vaultItems.filter(item => item.id !== id));
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
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Legacy Vault</h1>
        <p className="text-gray-600 mt-1">
          Store your legacy items for future generations
        </p>
      </div>

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
        <Button onClick={handleOpenAddItemDialog}>Add Item</Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          Loading vault items...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredVaultItems.map(item => (
            <VaultItemComponent
              key={item.id}
              item={item}
              onView={handleViewItem}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
            />
          ))}
        </div>
      )}

      <AddVaultItem
        isOpen={isAddDialogOpen}
        onClose={handleCloseAddItemDialog}
        onItemAdded={handleItemAdded}
      />

      <VaultItemDialog
        item={selectedItem}
        isOpen={isItemDialogOpen}
        onClose={handleCloseItemDialog}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
      />
    </div>
  );
};
