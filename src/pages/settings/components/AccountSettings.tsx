
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { updateUserProfile } from '@/services/profileService';
import { Loader2, Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function AccountSettings() {
  const { toast } = useToast();
  const { profile, refreshProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });
  
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        email: profile.email || ''
      });
    }
  }, [profile]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        email: profile.email || ''
      });
    }
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Only update the name, not the email (which would require auth changes)
      const updatedProfile = await updateUserProfile({
        full_name: formData.fullName
      });
      
      if (updatedProfile) {
        await refreshProfile();
        
        toast({
          title: "Profile Updated",
          description: "Your account information has been saved.",
          variant: "default",
        });
        
        setIsEditing(false);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditing || isSaving}
                    className="max-w-md"
                  />
                  {formData.fullName && !isEditing && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="email"
                    name="email"
                    value={formData.email || profile?.email || ''}
                    disabled={true} // Email should not be edited here
                    className="max-w-md"
                  />
                </div>
                <p className="text-sm text-gray-500">Email changes require verification.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              {!isEditing ? (
                <Button onClick={handleEdit}>
                  Edit Information
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <CardTitle className="text-lg">Account Status</CardTitle>
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
