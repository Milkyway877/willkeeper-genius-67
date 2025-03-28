
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, FileText, Loader2, Filter } from 'lucide-react';
import { getLegacyVaultItems, deleteLegacyVaultItem } from '@/services/tankService';
import { LegacyVaultItem } from '../types';
import { useToast } from '@/hooks/use-toast';
import { VaultItem } from './vault/VaultItem';
import { VaultItemDialog } from './vault/VaultItemDialog';
import { AddVaultItem } from './vault/AddVaultItem';

export const TankLegacyVault: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<LegacyVaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<LegacyVaultItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const data = await getLegacyVaultItems();
      setItems(data);
      setError(null);
    } catch (err) {
      console.error('Error loading legacy vault items:', err);
      setError('Failed to load legacy vault items. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleItemClick = (item: LegacyVaultItem) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const handleItemEdit = (item: LegacyVaultItem) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const handleItemDelete = async (id: string) => {
    try {
      const success = await deleteLegacyVaultItem(id);
      
      if (success) {
        setItems(items.filter(item => item.id !== id));
        toast({
          title: "Item deleted",
          description: "The legacy item has been permanently deleted."
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

  const handleDetailsClose = () => {
    setIsDetailsOpen(false);
    setSelectedItem(null);
  };

  const handleItemSaved = (updatedItem: LegacyVaultItem) => {
    setItems(items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    setSelectedItem(updatedItem);
  };

  const handleAddItemClick = () => {
    setIsAddingItem(true);
  };

  const handleAddItemClose = () => {
    setIsAddingItem(false);
  };

  const handleItemAdded = (newItem: LegacyVaultItem) => {
    setItems([newItem, ...items]);
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-willtank-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading your legacy vault...</p>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <FileText className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">Failed to load legacy vault</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => loadItems()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              Legacy Vault ({items.length} {items.length === 1 ? 'item' : 'items'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search by title or content..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-shrink-0"
                >
                  <Filter size={16} className="mr-2" />
                  Filter
                </Button>
                <Button 
                  className="bg-willtank-600 hover:bg-willtank-700 text-white flex-shrink-0"
                  onClick={handleAddItemClick}
                >
                  <Plus size={16} className="mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No items found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery ? 
                    "No items match your search criteria. Try a different search term." : 
                    "Your legacy vault is empty. Add your first item to get started."
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={handleAddItemClick}>Add Legacy Item</Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredItems.map(item => (
                  <VaultItem 
                    key={item.id} 
                    item={item} 
                    onView={handleItemClick}
                    onEdit={handleItemEdit}
                    onDelete={handleItemDelete}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Item Details Dialog */}
      <VaultItemDialog 
        item={selectedItem}
        isOpen={isDetailsOpen}
        onClose={handleDetailsClose}
        onSave={handleItemSaved}
        onDelete={handleItemDelete}
      />

      {/* Add Item Dialog */}
      <AddVaultItem 
        isOpen={isAddingItem}
        onClose={handleAddItemClose}
        onItemAdded={handleItemAdded}
      />
    </div>
  );
};
