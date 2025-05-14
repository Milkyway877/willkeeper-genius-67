
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MessageCategory, FrequencyInterval } from '../../types';

interface TankCheckInCreatorProps {
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  onRecipientChange: (name: string) => void;
  onCategoryChange: (category: MessageCategory) => void;
  onFrequencyChange: (frequency: FrequencyInterval) => void;
}

export const TankCheckInCreator = ({ 
  onContentChange, 
  onTitleChange, 
  onRecipientChange,
  onCategoryChange,
  onFrequencyChange
}: TankCheckInCreatorProps) => {
  const [title, setTitle] = useState('Regular Check-In');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('This is an automated check-in message. Please respond to confirm your well-being.');
  const [frequency, setFrequency] = useState<FrequencyInterval>('monthly');
  const [notifyContacts, setNotifyContacts] = useState(true);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    onTitleChange(e.target.value);
  };
  
  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipient(e.target.value);
    onRecipientChange(e.target.value);
  };
  
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    onContentChange(e.target.value);
  };
  
  const handleFrequencyChange = (value: FrequencyInterval) => {
    setFrequency(value);
    onFrequencyChange(value);
    
    // Always set category to 'check-in'
    onCategoryChange('check-in');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Set Up Your Check-In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Check-In Title</Label>
            <Input 
              id="title"
              placeholder="Regular Check-In"
              value={title}
              onChange={handleTitleChange}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="recipient">Primary Recipient (Your Email)</Label>
            <Input 
              id="recipient"
              placeholder="your@email.com"
              value={recipient}
              onChange={handleRecipientChange}
              className="mt-1"
              type="email"
            />
            <p className="text-sm text-gray-500 mt-1">
              This is where the check-in emails will be sent. You must respond to these to confirm your well-being.
            </p>
          </div>
          
          <div>
            <Label htmlFor="frequency">Check-In Frequency</Label>
            <Select 
              onValueChange={(value: FrequencyInterval) => handleFrequencyChange(value)} 
              defaultValue={frequency}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Every 3 months</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              How often would you like to receive check-in emails?
            </p>
          </div>
          
          <div>
            <Label htmlFor="message">Check-In Message</Label>
            <Textarea 
              id="message"
              placeholder="This is an automated check-in message. Please respond to confirm your well-being."
              value={message}
              onChange={handleMessageChange}
              className="mt-1 min-h-[100px]"
            />
          </div>
          
          <div className="flex items-center space-x-2 mt-6">
            <Switch
              id="notify-contacts"
              checked={notifyContacts}
              onCheckedChange={setNotifyContacts}
            />
            <Label htmlFor="notify-contacts">
              Notify trusted contacts if I don't respond
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
