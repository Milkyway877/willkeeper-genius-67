
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserAuth } from '@/hooks/useUserAuth';
import { Separator } from '@/components/ui/separator';
import { SimpleAvatar } from '@/components/user/SimpleAvatar';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { getSimpleUserProfile, type SimpleUserProfile } from '@/services/simpleProfileService';

export function AccountSettings() {
  const { user, displayName, displayEmail, loading: authLoading } = useUserAuth();
  const [profile, setProfile] = useState<SimpleUserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Load profile data in background (optional enhancement)
  useEffect(() => {
    if (user && !profileLoading) {
      setProfileLoading(true);
      getSimpleUserProfile()
        .then(setProfile)
        .catch(error => console.error('Error loading profile:', error))
        .finally(() => setProfileLoading(false));
    }
  }, [user, profileLoading]);

  // Show loading only if we don't have a user session at all
  if (authLoading && !user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Loading your account details...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="animate-pulse space-y-4">
              <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            View your account details and personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <SimpleAvatar size="lg" />
            </div>

            <div className="text-center sm:text-left space-y-2">
              <h3 className="text-lg font-semibold">
                {displayName}
              </h3>
              <p className="text-sm text-gray-600">
                {displayEmail || "Email not available"}
              </p>
              <p className="text-xs text-gray-500">
                Your account profile displays your identity on WillTank
              </p>
              <p className="text-xs text-gray-500">
                For security reasons, profile information cannot be edited directly
              </p>
            </div>
          </div>

          <Separator />

          {/* Profile Information in read-only format */}
          <ProfileForm />

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
                    : user?.created_at 
                      ? new Date(user.created_at).toLocaleDateString()
                      : 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Email Verified</p>
                <p className="text-sm text-gray-500">
                  {profile?.email_verified || user?.email_confirmed_at ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Account Status</p>
                <p className="text-sm text-gray-500">
                  {profile?.is_activated ? "Active" : "Pending Activation"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
