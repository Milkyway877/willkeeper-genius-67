
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserAuth } from '@/hooks/useUserAuth';
import { Separator } from '@/components/ui/separator';
import { SimpleAvatar } from '@/components/user/SimpleAvatar';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@clerk/clerk-react';
import { Check, AlertCircle, ExternalLink } from 'lucide-react';

export function AccountSettings() {
  const { user, displayName, displayEmail, loading } = useUserAuth();

  if (loading) {
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
      {/* Account Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Overview</CardTitle>
          <CardDescription>
            Your basic account information managed by Clerk
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <SimpleAvatar size="lg" />
            </div>

            <div className="text-center sm:text-left space-y-2">
              <h3 className="text-lg font-semibold">{displayName}</h3>
              <p className="text-sm text-gray-600">{displayEmail || "Email not available"}</p>
              <div className="flex items-center justify-center sm:justify-start">
                {user?.emailAddresses?.[0]?.verification?.status === 'verified' ? (
                  <span className="text-xs text-green-600 flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    Email verified
                  </span>
                ) : (
                  <span className="text-xs text-yellow-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Email verification pending
                  </span>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Member Since</p>
              <p className="text-sm text-gray-500">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Last Sign In</p>
              <p className="text-sm text-gray-500">
                {user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Sign Ins</p>
              <p className="text-sm text-gray-500">
                {user?.publicMetadata?.signInCount || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Account Status</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clerk Profile Management */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Management</CardTitle>
          <CardDescription>
            Manage your profile details, security settings, and account preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Use the comprehensive profile management system below to update your personal information, 
              manage your security settings, add two-factor authentication, and more.
            </p>
            
            <div className="border rounded-lg p-1 bg-gray-50">
              <UserProfile 
                appearance={{
                  elements: {
                    card: 'shadow-none border-none',
                    navbar: 'hidden',
                    pageScrollBox: 'p-0',
                    rootBox: 'w-full',
                    page: 'bg-transparent',
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
