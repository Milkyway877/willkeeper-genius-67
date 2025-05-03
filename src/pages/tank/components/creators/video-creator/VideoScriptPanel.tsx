
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Check, Sparkles } from 'lucide-react';

interface VideoScriptPanelProps {
  scriptContent: string;
  recipient: string;
  onScriptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const VideoScriptPanel: React.FC<VideoScriptPanelProps> = ({
  scriptContent,
  recipient,
  onScriptChange
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <FileText className="mr-2 h-5 w-5 text-willtank-600" />
          Video Script & Guidance
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-1 block">Write a Script (Optional)</Label>
          <Textarea 
            placeholder="Write your video script here to help you stay on track during recording..." 
            className="min-h-[200px]"
            value={scriptContent}
            onChange={onScriptChange}
          />
        </div>
        
        <div className="bg-willtank-50 rounded-lg p-4 border border-willtank-100">
          <h3 className="font-medium text-willtank-700 mb-2">Recording Tips</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <Check className="h-4 w-4 text-willtank-600 mr-2 mt-0.5" />
              Start by introducing yourself and your relationship to the recipient
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-willtank-600 mr-2 mt-0.5" />
              Speak naturally and from the heart, as if the person is right in front of you
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-willtank-600 mr-2 mt-0.5" />
              Share specific memories, advice, or messages that are meaningful
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-willtank-600 mr-2 mt-0.5" />
              Find good lighting and a quiet environment for the best quality
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-willtank-600 mr-2 mt-0.5" />
              End with a heartfelt closing message
            </li>
          </ul>
        </div>
        
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
          <h3 className="font-medium text-amber-700 mb-2">AI Script Assistance</h3>
          <p className="text-sm text-amber-700 mb-3">
            Let our AI help you craft a personalized script based on your relationship with {recipient || "the recipient"}.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Badge variant="outline" className="bg-white cursor-pointer hover:bg-amber-50 transition-colors px-3 py-1">
              Loving
            </Badge>
            <Badge variant="outline" className="bg-white cursor-pointer hover:bg-amber-50 transition-colors px-3 py-1">
              Inspiring
            </Badge>
            <Badge variant="outline" className="bg-white cursor-pointer hover:bg-amber-50 transition-colors px-3 py-1">
              Advice
            </Badge>
            <Badge variant="outline" className="bg-white cursor-pointer hover:bg-amber-50 transition-colors px-3 py-1">
              Memories
            </Badge>
          </div>
          <Button className="mt-3 w-full" size="sm">
            <Sparkles className="mr-2 h-4 w-4" />
            Generate AI Script
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
