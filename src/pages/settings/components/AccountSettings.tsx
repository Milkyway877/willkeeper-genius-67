
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Separator } from '@/components/ui/separator';

// Import our new components
import { AvatarUploader } from '@/components/profile/AvatarUploader';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { EmailUpdateForm } from '@/components/profile/EmailUpdateForm';
import { ProfileCompleteness } from '@/components/profile/ProfileCompleteness';

export function AccountSettings() {
  const { toast } = useToast();
  const { profile } = useUserProfile();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Update your account details and personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="relative">
              {/* Replace with our new AvatarUploader */}
              <AvatarUploader />
            </div>

            <div className="text-center sm:text-left space-y-2">
              <h3 className="text-lg font-semibold">Profile Picture</h3>
              <p className="text-sm text-gray-600">
                Upload a new avatar or choose from our library
              </p>
              <p className="text-xs text-gray-500">
                You can also take a picture with your webcam
              </p>

              {/* Add profile completeness indicator */}
              <ProfileCompleteness />
            </div>
          </div>

          <Separator />

          {/* Profile Information with our new form component */}
          <ProfileForm />

          {/* Email Update */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Email Address Settings</h3>
              <div className="flex items-center gap-2">
                <EmailUpdateForm />
                
                {profile?.email_verified ? (
                  <Button variant="ghost" className="flex items-center" disabled>
                    <span className="flex items-center text-green-600 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Verified
                    </span>
                  </Button>
                ) : (
                  <Button variant="outline" className="flex items-center">
                    <span className="text-sm">Resend Verification</span>
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Email changes require verification from the new address
              </p>
            </div>
          </div>

          <Separator />

          {/* Account Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Account Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Account Type</p>
                <p className="text-sm text-gray-500">
                  {profile?.subscription_plan || 'Free Plan'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-sm text-gray-500">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
