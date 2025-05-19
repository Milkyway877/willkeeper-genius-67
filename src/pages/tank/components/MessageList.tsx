
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Message } from '../types';
import { FileText, Video, FileAudio, File, Calendar, Clock, Eye, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, onRefresh }) => {
  const getIconForType = (type: string) => {
    switch (type) {
      case 'letter':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-500" />;
      case 'audio':
        return <FileAudio className="h-5 w-5 text-purple-500" />;
      case 'document':
        return <File className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PPP');
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-gray-50 animate-pulse">
            <CardContent className="h-32"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <Card className="bg-gray-50 text-center py-8">
        <CardContent>
          <h3 className="text-lg font-medium mb-2">No Messages Yet</h3>
          <p className="text-gray-500 mb-4">
            Create your first future message to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Card key={message.id} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-3/4 flex-grow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    {getIconForType(message.message_type)}
                    <CardTitle className="text-lg ml-2">{message.title}</CardTitle>
                  </div>
                  <Badge variant={message.status === 'delivered' ? 'success' : 'default'}>
                    {message.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-2">{message.preview}</p>
                <div className="flex flex-wrap gap-6 mt-3 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Delivery: {formatDate(message.delivery_date)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Created: {formatDate(message.delivery_date)}</span>
                  </div>
                </div>
              </CardContent>
            </div>
            <div className="md:w-1/4 flex md:flex-col justify-end p-4 bg-gray-50 md:space-y-2">
              <Button variant="outline" className="w-full flex items-center justify-center">
                <Eye className="h-4 w-4 mr-2" /> Preview
              </Button>
              <Button variant="destructive" className="w-full flex items-center justify-center">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
