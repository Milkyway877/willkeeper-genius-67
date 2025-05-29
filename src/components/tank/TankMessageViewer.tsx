
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TankMessageViewerProps {
  messageId?: string;
}

export function TankMessageViewer({ messageId }: TankMessageViewerProps) {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/tank')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tank
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Tank Message</h1>
        <p className="text-gray-600">View your tank message details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Message Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">Sample Message Title</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Calendar className="mr-1 h-4 w-4" />
              Created: December 1, 2024
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Message Content:</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                This is a sample tank message. Tank messages are designed to be delivered
                in the future under specific conditions. They can contain important
                information, instructions, or personal messages for your loved ones.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline">Edit Message</Button>
            <Button variant="destructive">Delete Message</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
