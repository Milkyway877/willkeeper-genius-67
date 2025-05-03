
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit, FileVideo, Upload, CheckCircle2, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Will } from '@/services/willService';

interface HighlightedWillCardProps {
  will: Will;
  hasVideo?: boolean;
  hasDocuments?: boolean;
}

export function HighlightedWillCard({ will, hasVideo = false, hasDocuments = false }: HighlightedWillCardProps) {
  const navigate = useNavigate();

  const handleViewWill = () => {
    navigate(`/will/${will.id}`);
  };

  const handleRecordVideo = () => {
    navigate(`/will/video-creation/${will.id}`);
  };

  const handleUploadDocuments = () => {
    navigate(`/will/${will.id}?action=upload`);
  };

  return (
    <Card className="relative animate-pulse-subtle overflow-hidden border-2 border-willtank-200">
      {/* Glowing effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-willtank-100/40 to-willtank-200/40 animate-glow-pulse"></div>
      
      <CardContent className="p-5 relative">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-2">
            <FileText className="h-10 w-10 text-willtank-600 mt-1" />
            <div>
              <div className="flex items-center mb-1">
                <h3 className="font-bold text-lg">{will.title}</h3>
                <Badge className="ml-2 bg-willtank-500 text-white">New</Badge>
              </div>
              <p className="text-sm text-gray-500">Created: {formatDate(will.created_at)}</p>
              <Badge variant="outline" className="mt-2 capitalize">
                {will.status}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Complete Your Will:</p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              {hasVideo ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />
              ) : (
                <Clock className="h-4 w-4 text-amber-500 mr-1.5" />
              )}
              <span>{hasVideo ? "Video Testament Added" : "Add Video Testament"}</span>
            </div>
            {!hasVideo && (
              <Button variant="ghost" size="sm" onClick={handleRecordVideo} className="h-8 text-willtank-600">
                Record
              </Button>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              {hasDocuments ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />
              ) : (
                <Clock className="h-4 w-4 text-amber-500 mr-1.5" />
              )}
              <span>{hasDocuments ? "Supporting Documents Added" : "Add Supporting Documents"}</span>
            </div>
            {!hasDocuments && (
              <Button variant="ghost" size="sm" onClick={handleUploadDocuments} className="h-8 text-willtank-600">
                Upload
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gradient-to-r from-willtank-50 to-willtank-100 p-4 flex justify-between">
        <Button variant="outline" size="sm" onClick={handleViewWill}>
          View Will
        </Button>
        <Button className="bg-willtank-600 hover:bg-willtank-700" size="sm" onClick={handleRecordVideo}>
          <FileVideo className="mr-1.5 h-4 w-4" />
          Record Video
        </Button>
      </CardFooter>
    </Card>
  );
}
