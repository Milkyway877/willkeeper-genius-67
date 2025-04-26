import React, { useState } from 'react';
import { MessageCategory } from '../../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface TankLetterCreatorProps {
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  onRecipientChange: (recipient: string) => void;
  onCategoryChange: (category: MessageCategory) => void;
}

export const TankLetterCreator: React.FC<TankLetterCreatorProps> = ({
  onContentChange,
  onTitleChange,
  onRecipientChange,
  onCategoryChange
}) => {
  const [letterContent, setLetterContent] = useState('');
  const [letterTitle, setLetterTitle] = useState('');
  const [letterRecipient, setLetterRecipient] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MessageCategory>('letter');

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLetterContent(newContent);
    onContentChange(newContent);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setLetterTitle(newTitle);
    onTitleChange(newTitle);
  };

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRecipient = e.target.value;
    setLetterRecipient(newRecipient);
    onRecipientChange(newRecipient);
  };

  const handleCategoryChange = (category: MessageCategory) => {
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="letter_category">Category</Label>
        <select 
          id="letter_category"
          className="w-full mt-1 p-2 border rounded"
          value={selectedCategory} 
          onChange={(e) => handleCategoryChange(e.target.value as MessageCategory)}
        >
          <option value="letter">Letter</option>
          <option value="story">Story</option>
          <option value="confession">Confession</option>
          <option value="wishes">Wishes</option>
          <option value="advice">Advice</option>
        </select>
      </div>
      
      <div>
        <Label htmlFor="letter_title">Message Title</Label>
        <Input
          id="letter_title"
          type="text"
          placeholder="A title for your message"
          value={letterTitle}
          onChange={handleTitleChange}
          className="w-full"
        />
      </div>
      
      <div>
        <Label htmlFor="letter_recipient">Recipient Name</Label>
        <Input
          id="letter_recipient"
          type="text"
          placeholder="Recipient's Name"
          value={letterRecipient}
          onChange={handleRecipientChange}
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="letter_content">Your Message</Label>
        <Textarea
          id="letter_content"
          placeholder="Write your heartfelt message here..."
          value={letterContent}
          onChange={handleContentChange}
          className="w-full h-48 resize-none"
        />
      </div>
    </div>
  );
};
