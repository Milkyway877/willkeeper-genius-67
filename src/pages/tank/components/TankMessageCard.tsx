
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Video, 
  Mic, 
  FileText, 
  Calendar, 
  User, 
  MoreVertical,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';

type MessageType = 'letter' | 'video' | 'audio' | 'document';
type MessageStatus = 'scheduled' | 'delivered';

type Message = {
  id: number;
  type: MessageType;
  title: string;
  recipient: string;
  deliveryDate: string;
  status: MessageStatus;
  preview: string;
};

type TankMessageCardProps = {
  message: Message;
};

export function TankMessageCard({ message }: TankMessageCardProps) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    
    // Handle actual delete
    toast({
      title: "Message deleted",
      description: "The future message has been permanently deleted",
    });
    setConfirmDelete(false);
  };
  
  const handleEdit = () => {
    toast({
      title: "Edit message",
      description: "Edit functionality coming soon",
    });
  };
  
  const handleSendNow = () => {
    toast({
      title: "Message sent",
      description: `Your message to ${message.recipient} has been sent immediately`,
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  const getTypeIcon = (type: MessageType) => {
    switch (type) {
      case 'letter':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-purple-500" />;
      case 'audio':
        return <Mic className="h-5 w-5 text-red-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-green-500" />;
    }
  };
  
  const getTypeLabel = (type: MessageType) => {
    switch (type) {
      case 'letter':
        return 'Future Letter';
      case 'video':
        return 'Future Video';
      case 'audio':
        return 'Future Audio';
      case 'document':
        return 'Future Document';
    }
  };
  
  const getStatusColor = (status: MessageStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-amber-100 text-amber-700';
      case 'delivered':
        return 'bg-green-100 text-green-700';
    }
  };
  
  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'delivered':
        return <CheckCircle className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center mb-3">
            <div className="rounded-lg p-2 bg-gray-50 mr-3">
              {getTypeIcon(message.type)}
            </div>
            <div>
              <span className="text-xs text-gray-500 block">{getTypeLabel(message.type)}</span>
              <h3 className="font-medium text-gray-900">{message.title}</h3>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" /> Edit Message
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSendNow}>
                <Send className="h-4 w-4 mr-2" /> Send Now
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" /> 
                {confirmDelete ? "Confirm Delete" : "Delete Message"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex flex-wrap gap-y-2 gap-x-4 mb-3 text-sm">
          <div className="flex items-center text-gray-600">
            <User className="h-4 w-4 mr-1" />
            <span>{message.recipient}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(message.deliveryDate)}</span>
          </div>
          
          <div className={cn("flex items-center text-xs px-2 py-1 rounded-full", getStatusColor(message.status))}>
            {getStatusIcon(message.status)}
            <span>{message.status === 'scheduled' ? 'Scheduled' : 'Delivered'}</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {message.preview}
        </p>
        
        {expanded && (
          <div className="pt-3 border-t border-gray-100 mt-3">
            <h4 className="text-sm font-medium mb-2">Preview</h4>
            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
              {message.type === 'letter' && message.preview}
              {message.type === 'video' && (
                <div className="bg-gray-800 aspect-video rounded-lg flex items-center justify-center">
                  <Video className="h-8 w-8 text-gray-400" />
                </div>
              )}
              {message.type === 'audio' && (
                <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-center">
                  <Mic className="h-6 w-6 text-gray-400 mr-2" />
                  <div className="h-1 flex-1 bg-gray-300 rounded-full">
                    <div className="h-1 w-1/3 bg-willtank-500 rounded-full"></div>
                  </div>
                </div>
              )}
              {message.type === 'document' && (
                <div className="bg-gray-100 p-3 rounded-lg flex items-center">
                  <FileText className="h-6 w-6 text-gray-400 mr-2" />
                  <span>document_preview.pdf</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div 
        className="p-3 bg-gray-50 text-center text-sm text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-center">
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" /> Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" /> Show More
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
