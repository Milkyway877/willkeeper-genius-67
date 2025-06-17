
import React from 'react';
import { useUserAuth } from '@/hooks/useUserAuth';
import { Check, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function ProfileForm() {
  const { user, displayName, displayEmail } = useUserAuth();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Full Name</h3>
              <p className="text-base font-medium">{displayName}</p>
              <p className="text-xs text-gray-500 mt-1">
                Contact support to update your name information
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">Email Address</h3>
              <p className="text-base font-medium">{displayEmail || "Email not available"}</p>
              <div className="mt-1">
                {user?.email_confirmed_at ? (
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
              <p className="text-xs text-gray-500 mt-1">
                Contact support to update your email address
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
