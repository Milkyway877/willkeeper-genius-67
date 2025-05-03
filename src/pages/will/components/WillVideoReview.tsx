
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { 
  Video,
  Check,
  RefreshCw,
  ChevronRight
} from 'lucide-react';

interface WillVideoReviewProps {
  videoTitle: string;
  recipient: string;
  willTitle: string;
  isProcessing: boolean;
  progress: number;
  onFinalize: () => void;
  finalizeButtonText?: string;
  finalizeButtonIcon?: React.ReactNode;
}

export function WillVideoReview({ 
  videoTitle, 
  recipient, 
  willTitle,
  isProcessing,
  progress,
  onFinalize,
  finalizeButtonText = "Finalize Video",
  finalizeButtonIcon = <Check className="mr-2 h-4 w-4" />
}: WillVideoReviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Video className="mr-2 h-5 w-5 text-willtank-600" />
          Review Video Testament
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Video Title</p>
            <p className="text-base">{videoTitle}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">For</p>
            <p className="text-base">{recipient}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg col-span-1 md:col-span-2">
            <p className="text-sm font-medium text-gray-700 mb-1">Will</p>
            <p className="text-base">{willTitle}</p>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-md border border-green-100">
          <div className="flex">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-800">Video Recorded Successfully</h3>
              <p className="text-sm text-green-700 mt-1">
                Your video testament has been recorded and is ready to be attached to your will.
              </p>
            </div>
          </div>
        </div>
        
        {isProcessing ? (
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Finalizing your video testament...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        ) : (
          <div className="flex justify-end">
            <Button onClick={onFinalize}>
              {finalizeButtonIcon}
              {finalizeButtonText}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
