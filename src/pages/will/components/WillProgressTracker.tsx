
import React from 'react';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  getWillProgress, 
  getWillCompletionPercentage, 
  WillProgress 
} from '@/services/willProgressService';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface WillProgressTrackerProps {
  willId?: string;
}

export function WillProgressTracker({ willId }: WillProgressTrackerProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const progress = willId ? getWillProgress(willId) : null;
  const completionPercentage = progress ? getWillCompletionPercentage(progress) : 0;
  
  if (!progress) return null;
  
  const handleResumeEditing = () => {
    if (willId) {
      navigate(`/will/edit/${willId}`);
    } else {
      navigate('/will/create');
    }
    
    toast({
      title: "Resuming your work",
      description: "Picking up where you left off"
    });
  };
  
  const formatLastEdited = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'PPpp');
  };
  
  return (
    <div className="border rounded-md p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium mb-1">Continue your progress</h3>
          <div className="text-sm text-gray-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Last edited: {formatLastEdited(progress.lastEdited)}
          </div>
        </div>
        
        <Button size="sm" onClick={handleResumeEditing}>
          Resume Editing
        </Button>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm">Completion</span>
          <span className="text-sm font-medium">{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>
      
      <div className="mt-3 space-y-1">
        {progress.completedSections?.length > 0 ? (
          <div className="text-sm text-green-600 flex items-center">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {progress.completedSections.length} sections completed
          </div>
        ) : (
          <div className="text-sm text-amber-600 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            No sections completed yet
          </div>
        )}
        
        {progress.lastEditedSection && (
          <div className="text-sm text-gray-600">
            Currently working on: {progress.lastEditedSection.replace('_', ' ')}
          </div>
        )}
      </div>
    </div>
  );
}
