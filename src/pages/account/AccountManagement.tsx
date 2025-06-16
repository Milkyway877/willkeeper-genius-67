
import React from 'react';
import { PreviewSafeLayout } from '@/components/layout/PreviewSafeLayout';
import { UserProfile } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AccountManagement() {
  return (
    <PreviewSafeLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold mb-2">Account Management</h1>
          <p className="text-gray-600">
            Manage your profile, security settings, and account preferences.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile & Security Settings</CardTitle>
            <CardDescription>
              Update your personal information, manage your security settings, and control your account preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserProfile 
              appearance={{
                elements: {
                  card: 'shadow-none border-none w-full',
                  navbar: 'bg-gray-50 rounded-lg mb-6',
                  navbarButton: 'text-gray-700 hover:bg-gray-100',
                  navbarButtonActive: 'bg-willtank-100 text-willtank-700',
                  pageScrollBox: 'p-0',
                  rootBox: 'w-full',
                  page: 'bg-transparent',
                  profilePage: 'bg-white',
                  profilePageContent: 'space-y-6',
                  formButtonPrimary: 'bg-willtank-600 hover:bg-willtank-700',
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </PreviewSafeLayout>
  );
}
