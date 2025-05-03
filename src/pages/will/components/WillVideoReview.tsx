
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { Check, Clock, FileCheck, Video, UserRound } from 'lucide-react';

interface WillVideoReviewProps {
  videoTitle: string;
  recipient: string;
  willTitle: string;
  isProcessing: boolean;
  progress: number;
  onFinalize: () => void;
}

export const WillVideoReview: React.FC<WillVideoReviewProps> = ({
  videoTitle,
  recipient,
  willTitle,
  isProcessing,
  progress,
  onFinalize
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Review Your Video Testament</h2>
      
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <h3 className="font-medium text-gray-800">Video Details</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Title:</span>
                <span className="font-medium">{videoTitle}</span>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-md p-3 mt-2">
                <div className="flex items-center">
                  <FileCheck className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="font-medium text-green-800">Will Testament</p>
                    <p className="text-sm text-green-700">
                      This video will be attached to <span className="font-medium">{willTitle}</span> and will be 
                      available to your executors and beneficiaries after your passing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800">Intended Audience</h3>
            <div className="mt-2 space-y-2">
              <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                <div className="flex items-start">
                  <UserRound className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">
                      {recipient === "All Beneficiaries" ? "All Beneficiaries" : "Specific Recipients"}
                    </p>
                    <p className="text-sm text-blue-700">
                      This testament will be viewable by {recipient === "All Beneficiaries" ? 
                        "the executors and all beneficiaries of your will after your passing." :
                        `${recipient} after your passing.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800">Delivery Information</h3>
            <div className="mt-2 space-y-2">
              <div className="bg-amber-50 border border-amber-100 rounded-md p-3">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-700">Posthumous Delivery</p>
                    <p className="text-sm text-amber-700">
                      This testament will be delivered to {recipient} upon confirmation of your passing, 
                      alongside your will document.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-col items-center justify-center pt-4">
        {!isProcessing && (
          <Button 
            onClick={onFinalize}
            className="w-full md:w-auto md:min-w-[200px] bg-willtank-600 hover:bg-willtank-700 text-white"
          >
            <FileCheck className="mr-2 h-4 w-4" />
            Finalize and Attach to Will
          </Button>
        )}
        
        {isProcessing && (
          <div className="w-full space-y-4 text-center">
            <Progress value={progress} className="w-full" />
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              {progress < 50 && <Clock className="animate-pulse h-4 w-4" />}
              {progress >= 50 && progress < 100 && <Video className="animate-bounce h-4 w-4" />}
              {progress === 100 && <Check className="text-green-500 h-4 w-4" />}
              
              {progress < 50 && "Preparing your video testament..."}
              {progress >= 50 && progress < 100 && "Attaching to will..."}
              {progress === 100 && "Video testament attached successfully!"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
