
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Video, Mic, User, Sun } from 'lucide-react';

interface VideoEnhancementPanelProps {
  videoBlob: Blob | null;
}

export const VideoEnhancementPanel: React.FC<VideoEnhancementPanelProps> = ({
  videoBlob
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Video className="mr-2 h-5 w-5 text-willtank-600" />
          Video Recording Tips
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-willtank-50 rounded-lg p-4 border border-willtank-100">
          <h3 className="font-medium text-willtank-700 mb-2">Tips for a Great Video Message</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <User className="h-4 w-4 text-willtank-600 mr-2 mt-0.5" />
              <div>
                <span className="font-medium">Dress appropriately</span>
                <p className="text-gray-600">Wear something you'd feel comfortable being remembered in</p>
              </div>
            </li>
            <li className="flex items-start">
              <Mic className="h-4 w-4 text-willtank-600 mr-2 mt-0.5" />
              <div>
                <span className="font-medium">Speak clearly and naturally</span>
                <p className="text-gray-600">Take your time and speak from the heart at a comfortable pace</p>
              </div>
            </li>
            <li className="flex items-start">
              <Sun className="h-4 w-4 text-willtank-600 mr-2 mt-0.5" />
              <div>
                <span className="font-medium">Find good lighting</span>
                <p className="text-gray-600">Natural light from a window works best, facing you rather than behind you</p>
              </div>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-willtank-600 mr-2 mt-0.5" />
              <div>
                <span className="font-medium">Choose a quiet location</span>
                <p className="text-gray-600">Minimize background noise and interruptions during recording</p>
              </div>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-willtank-600 mr-2 mt-0.5" />
              <div>
                <span className="font-medium">Be authentic</span>
                <p className="text-gray-600">The most meaningful messages come from being genuine and speaking from the heart</p>
              </div>
            </li>
          </ul>
        </div>
        
        {videoBlob && (
          <div className="bg-green-50 rounded-lg p-3 border border-green-100 mt-4">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">Video Successfully Recorded</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Your video has been recorded successfully. You can preview it in the recording panel.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
