
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit, FileVideo, Upload, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Will } from '@/services/willService';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HighlightedWillCardProps {
  will: Will;
  hasVideo?: boolean;
  hasDocuments?: boolean;
}

export function HighlightedWillCard({ will, hasVideo = false, hasDocuments = false }: HighlightedWillCardProps) {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    // Auto-hide tooltip after 10 seconds
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleViewWill = () => {
    navigate(`/will/${will.id}`);
  };

  const handleCompleteWill = () => {
    navigate(`/will/${will.id}`);
  };

  const completionStatus = hasVideo && hasDocuments ? 'complete' : 'incomplete';
  const urgencyLevel = !hasVideo && !hasDocuments ? 'urgent' : 'moderate';

  return (
    <TooltipProvider>
      <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
        <TooltipTrigger asChild>
          <Card className={`relative overflow-hidden border-2 cursor-pointer transition-all duration-300 ${
            completionStatus === 'complete' 
              ? 'border-green-400 bg-green-50' 
              : urgencyLevel === 'urgent'
                ? 'border-amber-400 bg-amber-50 animate-pulse-subtle shadow-amber-200 shadow-lg'
                : 'border-willtank-400 bg-willtank-50 animate-glow-pulse'
          }`}>
            {/* Glowing effect for incomplete wills */}
            {completionStatus === 'incomplete' && (
              <div className="absolute inset-0 bg-gradient-to-r from-willtank-100/40 to-amber-100/40 animate-glow-pulse"></div>
            )}
            
            <CardContent className="p-5 relative">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-10 w-10 text-willtank-600 mt-1" />
                  <div>
                    <div className="flex items-center mb-1">
                      <h3 className="font-bold text-lg">{will.title}</h3>
                      <Badge className="ml-2 bg-willtank-500 text-white">New</Badge>
                      {urgencyLevel === 'urgent' && (
                        <Badge className="ml-1 bg-amber-500 text-white flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Action Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">Created: {formatDate(will.created_at)}</p>
                    <Badge variant="outline" className="mt-2 capitalize">
                      {will.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white border">
                  <div className="flex items-center">
                    {hasVideo ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-500 mr-2" />
                    )}
                    <div>
                      <span className="font-medium text-sm">
                        {hasVideo ? "✓ Video Testament Complete" : "⚠️ Video Testament Required"}
                      </span>
                      {!hasVideo && (
                        <p className="text-xs text-amber-600">Record your personal message</p>
                      )}
                    </div>
                  </div>
                  {!hasVideo && (
                    <Button variant="ghost" size="sm" onClick={handleCompleteWill} className="text-willtank-600">
                      Record
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-white border">
                  <div className="flex items-center">
                    {hasDocuments ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-500 mr-2" />
                    )}
                    <div>
                      <span className="font-medium text-sm">
                        {hasDocuments ? "✓ Documents Complete" : "⚠️ Supporting Documents Required"}
                      </span>
                      {!hasDocuments && (
                        <p className="text-xs text-amber-600">Upload ID and supporting files</p>
                      )}
                    </div>
                  </div>
                  {!hasDocuments && (
                    <Button variant="ghost" size="sm" onClick={handleCompleteWill} className="text-willtank-600">
                      Upload
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className={`p-4 flex justify-between ${
              completionStatus === 'complete' 
                ? 'bg-green-100' 
                : 'bg-gradient-to-r from-willtank-50 to-amber-50'
            }`}>
              <Button variant="outline" size="sm" onClick={handleViewWill}>
                View Will
              </Button>
              {completionStatus === 'incomplete' ? (
                <Button 
                  className="bg-willtank-600 hover:bg-willtank-700" 
                  size="sm" 
                  onClick={handleCompleteWill}
                >
                  <FileVideo className="mr-1.5 h-4 w-4" />
                  Complete Will
                </Button>
              ) : (
                <Button 
                  className="bg-green-600 hover:bg-green-700" 
                  size="sm" 
                  disabled
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  Will Complete
                </Button>
              )}
            </CardFooter>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">🎉 Will Created Successfully!</p>
            <p className="text-sm">
              {completionStatus === 'incomplete' 
                ? "Complete your will by adding a video testament and uploading supporting documents. These steps are crucial for legal validity."
                : "Your will is complete with all required components!"
              }
            </p>
            <p className="text-xs text-gray-500">Click anywhere to continue setup</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
