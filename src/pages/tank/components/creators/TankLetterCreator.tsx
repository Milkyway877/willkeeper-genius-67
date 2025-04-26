
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2, Loader2 } from 'lucide-react';
import { useMessageAI } from '../../hooks/useMessageAI';
import { MessageCategory } from '../../types';

interface TankLetterCreatorProps {
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  onRecipientChange: (recipient: string) => void;
  onCategoryChange?: (category: MessageCategory) => void;
}

export const TankLetterCreator: React.FC<TankLetterCreatorProps> = ({
  onContentChange,
  onTitleChange,
  onRecipientChange,
  onCategoryChange
}) => {
  const [title, setTitle] = useState('');
  const [recipient, setRecipient] = useState('');
  const [content, setContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState<MessageCategory>('letter');
  const { generateWithAI, isGenerating } = useMessageAI();

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onContentChange(e.target.value);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    onTitleChange(e.target.value);
  };

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipient(e.target.value);
    onRecipientChange(e.target.value);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value as MessageCategory);
    if (onCategoryChange) {
      onCategoryChange(value as MessageCategory);
    }
  };

  const handleGenerateContent = async () => {
    if (!prompt.trim()) return;
    
    const generatedContent = await generateWithAI(prompt, category);
    if (generatedContent) {
      setContent(generatedContent);
      onContentChange(generatedContent);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="block mb-2">Message Title</Label>
                <Input 
                  id="title"
                  placeholder="My Letter to the Future" 
                  value={title}
                  onChange={handleTitleChange}
                />
              </div>
              <div>
                <Label htmlFor="recipient" className="block mb-2">Recipient Name</Label>
                <Input 
                  id="recipient"
                  placeholder="Who is this message for?" 
                  value={recipient}
                  onChange={handleRecipientChange}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="category" className="block mb-2">Message Category</Label>
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select message type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="letter">Personal Letter</SelectItem>
                  <SelectItem value="story">Life Story</SelectItem>
                  <SelectItem value="confession">Confession</SelectItem>
                  <SelectItem value="wishes">Wishes & Hopes</SelectItem>
                  <SelectItem value="advice">Life Advice</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Selecting a category helps our AI generate more relevant content.
              </p>
            </div>
            
            <div>
              <Label htmlFor="content" className="block mb-2">Message Content</Label>
              <Textarea 
                id="content"
                placeholder="Write your message here..." 
                value={content}
                onChange={handleContentChange}
                className="min-h-[250px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4">
            <Label htmlFor="ai-prompt" className="block font-medium">AI Writing Assistant</Label>
            <div className="flex gap-2">
              <Textarea 
                id="ai-prompt"
                placeholder="Describe what you want to write about, and our AI will help craft it..." 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-grow"
              />
              <Button 
                onClick={handleGenerateContent} 
                className="self-end whitespace-nowrap"
                disabled={isGenerating || !prompt.trim()}
              >
                {isGenerating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Wand2 className="mr-2 h-4 w-4" /> Generate</>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Our AI will help you craft a meaningful message. Examples: "Write a heartfelt letter to my future daughter" or 
              "Create a message about important life lessons I've learned" or "Write advice for my son when he graduates college"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
