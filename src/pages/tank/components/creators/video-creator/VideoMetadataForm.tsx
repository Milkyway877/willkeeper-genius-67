
import React from 'react';
import { Input } from '@/components/ui/input';
import { Video, User } from 'lucide-react';

interface VideoMetadataFormProps {
  title: string;
  recipient: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRecipientChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const VideoMetadataForm: React.FC<VideoMetadataFormProps> = ({
  title,
  recipient,
  onTitleChange,
  onRecipientChange
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
      <div>
        <label htmlFor="videoTitle" className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
        <div className="relative">
          <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input 
            id="videoTitle"
            placeholder="e.g. Wedding Day Message" 
            className="pl-10"
            value={title}
            onChange={onTitleChange}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="videoRecipient" className="block text-sm font-medium text-gray-700 mb-1">
          Recipient
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input 
            id="videoRecipient"
            placeholder="e.g. Michael Johnson" 
            className="pl-10"
            value={recipient}
            onChange={onRecipientChange}
          />
        </div>
      </div>
    </div>
  );
};
