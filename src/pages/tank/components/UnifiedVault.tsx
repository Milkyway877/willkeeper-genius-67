
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, FileText, Image, Video, AudioLines, Filter, Loader2 } from 'lucide-react';
import { getLegacyVaultItems, deleteLegacyVaultItem } from '@/services/tankService';
import { LegacyVaultItem } from '../types';
import { useToast } from '@/hooks/use-toast';
import { VaultItem } from './vault/VaultItem';
import { VaultItemDialog } from './vault/VaultItemDialog';
import { AddVaultItem } from './vault/AddVaultItem';
import { getWills } from '@/services/willService';
import { motion } from 'framer-motion';

export const UnifiedVault: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<LegacyVaultItem[]>([]);
  const [wills, setWills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<LegacyVaultItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load vault items
      const vaultData = await getLegacyVaultItems();
      setItems(vaultData);
      
      // Load wills
      const willsData = await getWills();
      setWills(willsData);
      
      setError(null);
    } catch (err) {
      console.error('Error loading legacy vault items:', err);
      setError('Failed to load vault items. Please try again later.');
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

  const handleFilterClick = (type: string | null) => {
    setFilterType(type === filterType ? null : type);
  };

  const getFilteredItems = () => {
    return items.filter(item => {
      // Apply search filter
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.preview.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply type filter
      const matchesType = filterType ? item.type === filterType : true;
      
      // Apply tab filter
      if (activeTab === 'all') return matchesSearch && matchesType;
      if (activeTab === 'documents') return matchesSearch && matchesType && (item.type === 'document' || item.type === 'story');
      if (activeTab === 'images') return matchesSearch && matchesType && item.type === 'image';
      if (activeTab === 'videos') return matchesSearch && matchesType && item.type === 'video';
      if (activeTab === 'audio') return matchesSearch && matchesType && item.type === 'audio';
      
      return matchesSearch && matchesType;
    });
  };

  const getFilteredWills = () => {
    return wills.filter(will => {
      // Apply search filter to wills
      return will.title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  const filteredItems = getFilteredItems();
  const filteredWills = getFilteredWills();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-willtank-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading your vault...</p>
      </div>
    );
  }

  if (error && items.length === 0 && wills.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <FileText className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">Failed to load vault</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => loadData()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Legacy Vault ({items.length + wills.length} {items.length + wills.length === 1 ? 'item' : 'items'})</span>
              <Button 
                className="bg-willtank-600 hover:bg-willtank-700 text-white flex-shrink-0"
                onClick={handleAddItemClick}
                size="sm"
              >
                <Plus size={16} className="mr-2" />
                Add Item
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search all items..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={filterType === 'story' ? "default" : "outline"} 
                  className="flex-shrink-0 text-xs px-3 h-9"
                  onClick={() => handleFilterClick('story')}
                >
                  Stories
                </Button>
                <Button 
                  variant={filterType === 'image' ? "default" : "outline"} 
                  className="flex-shrink-0 text-xs px-3 h-9"
                  onClick={() => handleFilterClick('image')}
                >
                  Images
                </Button>
                <Button 
                  variant={filterType === 'video' ? "default" : "outline"} 
                  className="flex-shrink-0 text-xs px-3 h-9"
                  onClick={() => handleFilterClick('video')}
                >
                  Videos
                </Button>
                <Button 
                  variant={filterType === 'audio' ? "default" : "outline"} 
                  className="flex-shrink-0 text-xs px-3 h-9"
                  onClick={() => handleFilterClick('audio')}
                >
                  Audio
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  All
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="images" className="flex items-center">
                  <Image className="h-4 w-4 mr-2" />
                  Images
                </TabsTrigger>
                <TabsTrigger value="videos" className="flex items-center">
                  <Video className="h-4 w-4 mr-2" />
                  Videos
                </TabsTrigger>
                <TabsTrigger value="audio" className="flex items-center">
                  <AudioLines className="h-4 w-4 mr-2" />
                  Audio
                </TabsTrigger>
                <TabsTrigger value="wills" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Wills
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                {(filteredItems.length === 0 && filteredWills.length === 0) ? (
                  <EmptyVaultState
                    searchQuery={searchQuery}
                    filterType={filterType}
                    onAddClick={handleAddItemClick}
                  />
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
                    {activeTab === 'all' && filteredWills.map(will => (
                      <WillVaultItem key={will.id} will={will} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="wills" className="mt-4">
                {filteredWills.length === 0 ? (
                  <EmptyVaultState
                    category="wills"
                    searchQuery={searchQuery}
                    filterType={filterType}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredWills.map(will => (
                      <WillVaultItem key={will.id} will={will} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="documents" className="mt-4">
                {filteredItems.filter(item => item.type === 'document' || item.type === 'story').length === 0 ? (
                  <EmptyVaultState
                    category="documents"
                    searchQuery={searchQuery}
                    filterType={filterType}
                    onAddClick={handleAddItemClick}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredItems
                      .filter(item => item.type === 'document' || item.type === 'story')
                      .map(item => (
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
              </TabsContent>

              <TabsContent value="images" className="mt-4">
                {filteredItems.filter(item => item.type === 'image').length === 0 ? (
                  <EmptyVaultState
                    category="images"
                    searchQuery={searchQuery}
                    filterType={filterType}
                    onAddClick={handleAddItemClick}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredItems
                      .filter(item => item.type === 'image')
                      .map(item => (
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
              </TabsContent>

              <TabsContent value="videos" className="mt-4">
                {filteredItems.filter(item => item.type === 'video').length === 0 ? (
                  <EmptyVaultState
                    category="videos"
                    searchQuery={searchQuery}
                    filterType={filterType}
                    onAddClick={handleAddItemClick}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredItems
                      .filter(item => item.type === 'video')
                      .map(item => (
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
              </TabsContent>

              <TabsContent value="audio" className="mt-4">
                {filteredItems.filter(item => item.type === 'audio').length === 0 ? (
                  <EmptyVaultState
                    category="audio files"
                    searchQuery={searchQuery}
                    filterType={filterType}
                    onAddClick={handleAddItemClick}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredItems
                      .filter(item => item.type === 'audio')
                      .map(item => (
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
              </TabsContent>
            </Tabs>
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

interface EmptyVaultStateProps {
  category?: string;
  searchQuery: string;
  filterType: string | null;
  onAddClick?: () => void;
}

const EmptyVaultState: React.FC<EmptyVaultStateProps> = ({ 
  category = "items",
  searchQuery, 
  filterType,
  onAddClick 
}) => {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <FileText className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium mb-2">No {category} found</h3>
      <p className="text-gray-500 mb-4">
        {searchQuery || filterType ? 
          `No ${category} match your search criteria. Try different filters.` : 
          `Your vault doesn't have any ${category} yet. Add your first item to get started.`
        }
      </p>
      {!searchQuery && !filterType && onAddClick && (
        <Button onClick={onAddClick} className="gap-2">
          <Plus size={16} />
          Add Item
        </Button>
      )}
    </div>
  );
};

interface WillVaultItemProps {
  will: {
    id: string;
    title: string;
    status: string;
    created_at: string;
    updated_at: string;
    template_type?: string;
  };
}

const WillVaultItem: React.FC<WillVaultItemProps> = ({ will }) => {
  const navigate = useNavigate();
  
  const handleViewWill = () => {
    navigate(`/will/${will.id}`);
  };
  
  const handleEditWill = () => {
    navigate(`/will/edit/${will.id}`);
  };
  
  const getStatusColor = () => {
    switch (will.status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
    >
      <div className="absolute top-0 right-0">
        <div className={`${getStatusColor()} text-xs font-medium px-2 py-1 rounded-bl-lg`}>
          {will.status || 'Draft'}
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-3 flex items-center">
          <div className="rounded-full bg-blue-100 p-2 mr-2">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="font-medium truncate">{will.title}</h3>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          <p>Type: {will.template_type || 'Custom'}</p>
          <p>Last updated: {new Date(will.updated_at).toLocaleDateString()}</p>
        </div>
        
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={handleViewWill}>
            View
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={handleEditWill}>
            Edit
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
