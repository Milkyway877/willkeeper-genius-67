
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, FileText, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function WillCreationWizard() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Create Your Will</h1>
        <p className="text-xl text-gray-600">Choose how you'd like to create your will</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Wand2 className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>AI-Guided Creation</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Let our AI assistant guide you through creating your will with intelligent questions and suggestions.
            </p>
            <Button 
              className="w-full" 
              onClick={() => navigate('/will/creation/ai')}
            >
              Start with AI
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Template-Based</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Choose from professionally crafted templates and customize them to fit your needs.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/will/templates')}
            >
              Browse Templates
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle>Chat Interface</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Have a conversation with our assistant to create your will naturally through chat.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/will/chat')}
            >
              Start Chatting
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
