
import React from 'react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export function ProfileCompleteness() {
  const { profile } = useUserProfile();
  const [completeness, setCompleteness] = React.useState(0);
  
  React.useEffect(() => {
    if (!profile) {
      setCompleteness(0);
      return;
    }
    
    // Define fields that contribute to profile completeness
    const fields = [
      { name: 'avatar_url', value: profile.avatar_url },
      { name: 'full_name', value: profile.full_name },
      { name: 'email', value: profile.email },
      { name: 'email_verified', value: profile.email_verified },
      { name: 'gender', value: profile.gender },
    ];
    
    // Count completed fields
    const completedFields = fields.filter(field => !!field.value).length;
    
    // Calculate percentage
    const percentage = Math.round((completedFields / fields.length) * 100);
    
    setCompleteness(percentage);
  }, [profile]);
  
  // Get text color based on completeness percentage
  const getTextColor = () => {
    if (completeness < 40) return 'text-red-600';
    if (completeness < 70) return 'text-orange-500';
    return 'text-green-600';
  };
  
  // Get progress color based on completeness percentage
  const getProgressColor = () => {
    if (completeness < 40) return '[&>div]:bg-red-500';
    if (completeness < 70) return '[&>div]:bg-orange-500';
    return '[&>div]:bg-green-500';
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Profile Completeness</span>
        <span className={`text-sm font-medium ${getTextColor()}`}>{completeness}%</span>
      </div>
      
      <Progress
        value={completeness}
        className={cn("h-2", getProgressColor())}
      />
      
      {completeness < 100 && (
        <p className="text-xs text-gray-500">
          Complete your profile to get the most out of our services.
        </p>
      )}
    </div>
  );
}
