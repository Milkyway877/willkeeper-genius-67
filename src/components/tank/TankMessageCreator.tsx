
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send } from 'lucide-react';

export function TankMessageCreator() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Tank Message</h1>
        <p className="text-gray-600">Create a message to be delivered in the future.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            New Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Message Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter message title..."
            />
          </div>
          
          <div>
            <Label htmlFor="message">Message Content</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              rows={8}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline">Save Draft</Button>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Create Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
