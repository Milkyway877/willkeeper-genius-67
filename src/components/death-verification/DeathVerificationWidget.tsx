
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  getLatestCheckin,
  processCheckin,
  DeathVerificationCheckin
} from '@/services/deathVerificationService';

export function DeathVerificationWidget() {
  const [loading, setLoading] = useState(true);
  const [checkin, setCheckin] = useState<DeathVerificationCheckin | null>(null);
  
  useEffect(() => {
    const loadCheckinStatus = async () => {
      try {
        setLoading(true);
        const data = await getLatestCheckin();
        setCheckin(data);
      } catch (error) {
        console.error('Error loading check-in status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCheckinStatus();
  }, []);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="lg:col-span-3 xl:col-span-1">
      <Card className="p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Death Verification</h3>
          <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center">
            <Clock size={20} className="text-willtank-500" />
          </div>
        </div>
        
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full mt-4" />
          </div>
        ) : (
          <>
            {checkin ? (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  {checkin.status === 'alive' ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : checkin.status === 'dead' ? (
                    <AlertTriangle size={16} className="text-red-500" />
                  ) : (
                    <Clock size={16} className="text-orange-500" />
                  )}
                  <span className="font-medium">
                    Status: {checkin.status === 'alive' 
                      ? 'Alive' 
                      : checkin.status === 'dead' 
                      ? 'Reported Deceased' 
                      : 'Pending'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Last check-in: {formatDate(checkin.last_checkin)}
                </p>
                <p className="text-sm text-gray-600">
                  Verified by: {checkin.executor_email}
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  No death verification check-ins have been set up yet. Configure your death verification settings to ensure your will is accessible when needed.
                </p>
              </div>
            )}
            
            <Link to="/settings/death-verification">
              <Button variant="outline" className="w-full">
                Manage Verification
              </Button>
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}
