
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Video, FileAudio, File, Bell, Filter, RefreshCcw } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFutureMessages } from '@/services/tankService';
import { Message, MessageType } from '../types';
import { MessageList } from './MessageList';
import { TankCheckIns } from './TankCheckIns';
import { Link } from 'react-router-dom';

export const TankDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<MessageType | 'all'>('all');
  
  const { data: messages = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['futureMessages'],
    queryFn: getFutureMessages,
  });
  
  const filteredMessages = useMemo(() => {
    if (filter === 'all') return messages;
    return messages.filter(msg => msg.type === filter);
  }, [messages, filter]);
  
  // Group messages by type for counts
  const messageCountsByType = useMemo(() => {
    const counts = {
      letters: messages.filter(m => m.type === 'letter').length,
      videos: messages.filter(m => m.type === 'video').length,
      audios: messages.filter(m => m.type === 'audio').length,
      documents: messages.filter(m => m.type === 'document').length,
      checkins: messages.filter(m => m.type === 'check-in').length,
      all: messages.length
    };
    return counts;
  }, [messages]);
  
  const checkInMessages = useMemo(() => {
    return messages.filter(msg => msg.type === 'check-in');
  }, [messages]);

  const refreshMessages = () => {
    refetch();
  };
  
  useEffect(() => {
    if (isError) {
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive"
      });
    }
  }, [isError, toast]);
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="messages">
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="check-ins">Check-ins</TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className="space-y-6 mt-6">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={filter === 'all' ? "default" : "outline"} 
                size="sm" 
                onClick={() => setFilter('all')}
                className="flex items-center"
              >
                All ({messageCountsByType.all})
              </Button>
              <Button 
                variant={filter === 'letter' ? "default" : "outline"} 
                size="sm" 
                onClick={() => setFilter('letter')}
                className="flex items-center"
              >
                <FileText className="h-4 w-4 mr-1" /> Letters ({messageCountsByType.letters})
              </Button>
              <Button 
                variant={filter === 'video' ? "default" : "outline"} 
                size="sm" 
                onClick={() => setFilter('video')}
                className="flex items-center"
              >
                <Video className="h-4 w-4 mr-1" /> Videos ({messageCountsByType.videos})
              </Button>
              <Button 
                variant={filter === 'audio' ? "default" : "outline"} 
                size="sm" 
                onClick={() => setFilter('audio')}
                className="flex items-center"
              >
                <FileAudio className="h-4 w-4 mr-1" /> Audio ({messageCountsByType.audios})
              </Button>
              <Button 
                variant={filter === 'document' ? "default" : "outline"} 
                size="sm" 
                onClick={() => setFilter('document')}
                className="flex items-center"
              >
                <File className="h-4 w-4 mr-1" /> Documents ({messageCountsByType.documents})
              </Button>
              <Button 
                variant={filter === 'check-in' ? "default" : "outline"} 
                size="sm" 
                onClick={() => setFilter('check-in')}
                className="flex items-center"
              >
                <Bell className="h-4 w-4 mr-1" /> Check-ins ({messageCountsByType.checkins})
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshMessages}
                className="flex items-center"
              >
                <RefreshCcw className="h-4 w-4 mr-1" /> Refresh
              </Button>
              <Link to="/tank/creation">
                <Button size="sm" className="flex items-center">
                  <Plus className="h-4 w-4 mr-1" /> New Message
                </Button>
              </Link>
            </div>
          </div>
          
          <MessageList 
            messages={filteredMessages} 
            isLoading={isLoading} 
            onRefresh={refreshMessages}
          />
        </TabsContent>
        
        <TabsContent value="check-ins" className="space-y-6 mt-6">
          <TankCheckIns 
            checkIns={checkInMessages}
            onRefresh={refreshMessages}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
