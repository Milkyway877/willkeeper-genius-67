
import React from 'react';
import { useClerkSupabase } from '@/contexts/ClerkSupabaseContext';
import { Check, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@clerk/clerk-react';

export function ProfileForm() {
  const { profile } = useClerkSupabase();
  const { user } = useUser();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Full Name</h3>
              <p className="text-base font-medium">{profile?.full_name || user?.fullName || "Not available"}</p>
              <p className="text-xs text-gray-500 mt-1">
                You can update your name in your account settings
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">Email Address</h3>
              <p className="text-base font-medium">{profile?.email || user?.primaryEmailAddress?.emailAddress || "Not available"}</p>
              <div className="mt-1">
                {(profile?.email_verified || user?.primaryEmailAddress?.verification?.status === "verified") ? (
                  <span className="text-xs text-green-600 flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    Email verified
                  </span>
                ) : (
                  <span className="text-xs text-yellow-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Email not verified. Please check your inbox for verification instructions.
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
