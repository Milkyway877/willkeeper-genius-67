
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { FileText, Lock, Unlock, MoreVertical, Eye, Edit, Trash2, Image, Video, AudioLines, FileIcon } from 'lucide-react';
import { LegacyVaultItem, VaultItemType } from '../../types';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface VaultItemProps {
  item: LegacyVaultItem;
  onView: (item: LegacyVaultItem) => void;
  onEdit: (item: LegacyVaultItem) => void;
  onDelete: (id: string) => void;
}

export const VaultItem: React.FC<VaultItemProps> = ({ item, onView, onEdit, onDelete }) => {
  const getTypeIcon = () => {
    switch (item.type) {
      case VaultItemType.story:
        return <FileText size={16} className="text-blue-500" />;
      case VaultItemType.confession:
        return <FileText size={16} className="text-red-500" />;
      case VaultItemType.wishes:
        return <FileText size={16} className="text-purple-500" />;
      case VaultItemType.advice:
        return <FileText size={16} className="text-green-500" />;
      case VaultItemType.image:
        return <Image size={16} className="text-blue-500" />;
      case VaultItemType.video:
        return <Video size={16} className="text-red-500" />;
      case VaultItemType.audio:
        return <AudioLines size={16} className="text-purple-500" />;
      case VaultItemType.will:
        return <FileText size={16} className="text-green-700" />;
      case VaultItemType.document:
        return <FileIcon size={16} className="text-amber-500" />;
      default:
        return <FileText size={16} />;
    }
  };

  const getTypeName = () => {
    const types = {
      [VaultItemType.story]: 'Personal Story',
      [VaultItemType.confession]: 'Confession',
      [VaultItemType.wishes]: 'Special Wishes',
      [VaultItemType.advice]: 'Life Advice',
      [VaultItemType.image]: 'Image',
      [VaultItemType.video]: 'Video',
      [VaultItemType.audio]: 'Audio Recording',
      [VaultItemType.will]: 'Will Document',
      [VaultItemType.document]: 'Document'
    };
    return types[item.type] || 'Document';
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView(item);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(item);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  return (
    <Card 
      className="h-full flex flex-col hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleView}
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
              <DropdownMenuItem onClick={handleView}>
                <Eye size={14} className="mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit size={14} className="mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={handleDelete}
              >
                <Trash2 size={14} className="mr-2" />
                Delete
              </DropdownMenuItem>
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
