
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/UserAvatar';
import { ProfileForm } from '@/components/profile/ProfileForm';

export function AccountSettings() {
  const { profile, user, displayName, displayEmail, loading } = useUserProfile();

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
              <UserAvatar size="lg" />
            </div>

            <div className="text-center sm:text-left space-y-2">
              <h3 className="text-lg font-semibold">
                {loading ? "Loading..." : displayName}
              </h3>
              <p className="text-sm text-gray-600">
                {loading ? "Loading email..." : displayEmail}
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
                  {loading ? "Loading..." : (profile?.subscription_plan || 'Free Plan')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-sm text-gray-500">
                  {loading ? "Loading..." : (
                    profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString()
                      : user?.created_at 
                        ? new Date(user.created_at).toLocaleDateString()
                        : 'Unknown'
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Email Verified</p>
                <p className="text-sm text-gray-500">
                  {loading ? "Loading..." : (
                    profile?.email_verified || user?.email_confirmed_at ? "Yes" : "No"
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Account Status</p>
                <p className="text-sm text-gray-500">
                  {loading ? "Loading..." : (
                    profile?.is_activated ? "Active" : "Pending Activation"
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
