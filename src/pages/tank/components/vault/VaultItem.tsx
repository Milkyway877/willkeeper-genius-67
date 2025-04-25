
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { FileText, Lock, Unlock, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { LegacyVaultItem } from '../../types';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'react-router-dom';

interface VaultItemProps {
  item?: LegacyVaultItem;
  onView?: (item: LegacyVaultItem) => void;
  onEdit?: (item: LegacyVaultItem) => void;
  onDelete?: (id: string) => void;
  mode?: 'default' | 'view';
}

export const VaultItem: React.FC<VaultItemProps> = ({ 
  item, 
  onView, 
  onEdit, 
  onDelete,
  mode = 'default'
}) => {
  const { id } = useParams();
  
  // If in view mode and no item is provided, render a placeholder for the single item view
  if (mode === 'view') {
    return (
      <div>
        <h2>View Vault Item</h2>
        <p>Viewing vault item with ID: {id}</p>
      </div>
    );
  }
  
  // If no item is provided in default mode, don't render
  if (!item) return null;
  
  const getTypeIcon = () => {
    switch (item.type) {
      case 'story':
        return <FileText size={16} className="text-blue-500" />;
      case 'confession':
        return <FileText size={16} className="text-red-500" />;
      case 'wishes':
        return <FileText size={16} className="text-purple-500" />;
      case 'advice':
        return <FileText size={16} className="text-green-500" />;
      default:
        return <FileText size={16} />;
    }
  };

  const getTypeName = () => {
    const types = {
      'story': 'Personal Story',
      'confession': 'Confession',
      'wishes': 'Special Wishes',
      'advice': 'Life Advice'
    };
    return types[item.type] || 'Document';
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView && onView(item);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit && onEdit(item);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete && onDelete(item.id);
  };

  return (
    <Card 
      className="h-full flex flex-col hover:shadow-md transition-shadow cursor-pointer"
      onClick={onView ? () => onView(item) : undefined}
    >
      <CardContent className="flex-grow pt-6">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-1">
            {getTypeIcon()}
            <span className="text-xs text-gray-500">{getTypeName()}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={handleView}>
                  <Eye size={14} className="mr-2" />
                  View
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit size={14} className="mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600"
                  onClick={handleDelete}
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <h3 className="font-medium mb-2 line-clamp-2">{item.title}</h3>
        
        <p className="text-sm text-gray-600 line-clamp-3 mb-2">
          {item.preview || "No preview available"}
        </p>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 border-t px-6 pt-3 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {new Date(item.createdAt).toLocaleDateString()}
        </div>
        
        <Badge 
          variant="outline" 
          className={item.encryptionStatus ? 
            "border-green-200 text-green-700 bg-green-50" : 
            "border-gray-200 text-gray-700 bg-gray-50"}
        >
          {item.encryptionStatus ? (
            <span className="flex items-center">
              <Lock size={10} className="mr-1" />
              Encrypted
            </span>
          ) : (
            <span className="flex items-center">
              <Unlock size={10} className="mr-1" />
              Not Encrypted
            </span>
          )}
        </Badge>
      </CardFooter>
    </Card>
  );
};
