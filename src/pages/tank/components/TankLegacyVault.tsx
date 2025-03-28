
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  BookOpen, 
  Heart, 
  Lightbulb, 
  MessageSquare, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Lock,
  Shield,
  Loader2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LegacyVaultItem } from '../types';
import { getLegacyVaultItems, deleteLegacyVaultItem } from '@/services/tankService';

const getTypeIcon = (type: LegacyVaultItem['type']) => {
  switch (type) {
    case 'story':
      return <BookOpen size={16} className="text-blue-500" />;
    case 'confession':
      return <Heart size={16} className="text-red-500" />;
    case 'wishes':
      return <MessageSquare size={16} className="text-purple-500" />;
    case 'advice':
      return <Lightbulb size={16} className="text-amber-500" />;
    default:
      return <BookOpen size={16} />;
  }
};

const getTypeName = (type: LegacyVaultItem['type']) => {
  switch (type) {
    case 'story':
      return 'Personal Story';
    case 'confession':
      return 'Confession/Secret';
    case 'wishes':
      return 'Special Wishes';
    case 'advice':
      return 'Life Advice';
    default:
      return 'Unknown';
  }
};

export const TankLegacyVault: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [vaultItems, setVaultItems] = useState<LegacyVaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  useEffect(() => {
    const loadVaultItems = async () => {
      try {
        setIsLoading(true);
        const data = await getLegacyVaultItems();
        setVaultItems(data);
        setError(null);
      } catch (err) {
        console.error('Error loading vault items:', err);
        setError('Failed to load vault items. Please try again later.');
        // Fallback to demo data if needed
        setVaultItems([
          {
            id: 1,
            title: 'My Life Journey',
            type: 'story',
            preview: 'The full story of my life journey, including the challenges and victories that shaped who I am...',
            createdAt: '2023-09-15',
            encryptionStatus: true
          },
          {
            id: 2,
            title: 'Family Secret',
            type: 'confession',
            preview: 'An important family secret that should only be revealed after my passing...',
            createdAt: '2023-09-20',
            encryptionStatus: true
          },
          {
            id: 3,
            title: 'Career Advice for My Children',
            type: 'advice',
            preview: 'Lessons learned from my career path and advice for my children as they navigate their own careers...',
            createdAt: '2023-10-05',
            encryptionStatus: true
          },
          {
            id: 4,
            title: 'My Final Wishes',
            type: 'wishes',
            preview: 'Special requests and personal wishes for my loved ones to consider after I\'m gone...',
            createdAt: '2023-10-10',
            encryptionStatus: true
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVaultItems();
  }, []);
  
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  const filteredItems = vaultItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getTypeName(item.type).toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleView = (id: number | string) => {
    toast({
      title: "Viewing vault item",
      description: `Opening vault item #${id} for viewing.`
    });
  };
  
  const handleEdit = (id: number | string) => {
    toast({
      title: "Edit vault item",
      description: `Opening vault item #${id} for editing.`
    });
  };
  
  const handleDelete = async (id: number | string) => {
    try {
      await deleteLegacyVaultItem(id.toString());
      setVaultItems(vaultItems.filter(item => item.id !== id));
      toast({
        title: "Vault item deleted",
        description: "The vault item has been permanently deleted."
      });
    } catch (err) {
      console.error('Error deleting vault item:', err);
      toast({
        title: "Error",
        description: "Failed to delete the vault item. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleAddNew = () => {
    setShowUpgradeModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-willtank-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading your vault items...</p>
      </div>
    );
  }

  if (error && vaultItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <BookOpen className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">Failed to load vault items</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      <Card className="mb-6 border-willtank-100 bg-gradient-to-br from-willtank-50 to-gray-50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="h-16 w-16 rounded-full bg-willtank-100 flex items-center justify-center flex-shrink-0">
              <Shield className="h-8 w-8 text-willtank-600" />
            </div>
            
            <div className="flex-grow">
              <h3 className="text-xl font-bold mb-2">Legacy Vault</h3>
              <p className="text-gray-600 mb-4">
                Secure storage for your most important personal memories, confessions, and wishes that will be
                passed on to your loved ones according to your specified conditions.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-white">Triple-encrypted</Badge>
                <Badge variant="outline" className="bg-white">Posthumous delivery</Badge>
                <Badge variant="outline" className="bg-white">Private access</Badge>
              </div>
            </div>
            
            <Button onClick={handleAddNew} className="flex-shrink-0">
              <Plus size={16} className="mr-2" />
              Add to Vault
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search vault items by title or type..." 
            className="pl-10"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No vault items found</h3>
            <p className="text-gray-500 mb-4">Add personal stories, secrets, or wishes to your legacy vault.</p>
            <Button onClick={handleAddNew}>Add to Vault</Button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      {getTypeIcon(item.type)}
                    </div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(item.id)}>
                        <Eye size={14} className="mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(item.id)}>
                        <Edit size={14} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>{getTypeName(item.type)}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-500 line-clamp-3">{item.preview}</p>
              </CardContent>
              
              <CardFooter className="flex justify-between text-xs text-gray-500 pt-0">
                <div>Created {new Date(item.createdAt).toLocaleDateString()}</div>
                {item.encryptionStatus && (
                  <div className="flex items-center">
                    <Lock size={12} className="mr-1" />
                    Encrypted
                  </div>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-willtank-100 flex items-center justify-center">
                <Lock className="h-8 w-8 text-willtank-600" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-center mb-2">Upgrade to Access Legacy Vault</h3>
            <p className="text-gray-600 text-center mb-6">
              The Legacy Vault is available exclusively for Premium and Lifetime plan subscribers.
              Upgrade your plan to unlock this powerful feature.
            </p>
            
            <div className="space-y-4">
              <Button className="w-full" onClick={() => navigate('/billing')}>
                View Upgrade Options
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setShowUpgradeModal(false)}>
                Not Now
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
