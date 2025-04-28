
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { updateUserProfile, uploadProfileImage } from '@/services/profileService';
import { Loader2, Check, Upload, Edit, Mail, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserAvatar } from '@/components/UserAvatar';
import { supabase } from "@/integrations/supabase/client";

// Custom hook for handling profile updates
const useProfileUpdates = () => {
  const { toast } = useToast();
  const { profile, refreshProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: error.message || "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploading(true);
      await uploadProfileImage(file);
      await refreshProfile();
      
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been successfully updated.",
        variant: "default"
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "There was an error uploading your avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    formData,
    isEditing,
    isSaving,
    isUploading,
    handleInputChange,
    handleEdit,
    handleCancel,
    handleSave,
    handleAvatarUpload
  };
};

export function AccountSettings() {
  const { toast } = useToast();
  const { profile, refreshProfile, updateEmail } = useUserProfile();
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    formData,
    isEditing,
    isUploading,
    handleInputChange,
    handleEdit,
    handleCancel,
    handleSave,
    handleAvatarUpload
  } = useProfileUpdates();

  useEffect(() => {
    // Ensure profile is loaded when component mounts
    refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile?.email) {
      setNewEmail(profile.email);
    }
  }, [profile]);

  const handleEmailUpdate = async () => {
    try {
      setIsSaving(true);
      setEmailError('');
      
      if (!newEmail) {
        setEmailError('Email is required');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        setEmailError('Please enter a valid email address');
        return;
      }

      const { success, error } = await updateEmail(newEmail);
      
      if (success) {
        setShowEmailDialog(false);
        toast({
          title: "Email Update Initiated",
          description: error || "A confirmation link has been sent to your new email address. Please check your inbox to complete the update.",
          variant: "default"
        });
      } else {
        setEmailError(error || "Failed to update email");
      }
    } catch (error: any) {
      console.error("Error updating email:", error);
      setEmailError(error.message || "Failed to update email");
    } finally {
      setIsSaving(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleAvatarUpload(file);
      // Clear the input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <div className="relative rounded-full overflow-hidden">
                <UserAvatar
                  size="lg"
                  loading={isUploading}
                  className="h-24 w-24"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white"
                onClick={triggerFileInput}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </>
                )}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/gif"
                className="hidden"
              />
            </div>

            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold">Profile Picture</h3>
              <p className="text-sm text-gray-600 mt-1">
                Upload a new avatar or profile picture
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG or GIF. Maximum size 2MB.
              </p>
            </div>
          </div>

          <Separator />

          {/* Profile Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing || isSaving}
                  className="max-w-md"
                />
                
                {!isEditing ? (
                  <Button onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled={true}
                  className="max-w-md"
                />
                <Button onClick={() => setShowEmailDialog(true)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Change Email
                </Button>
              </div>
              {profile?.email_verified ? (
                <p className="text-sm text-green-600 mt-1">Email verified</p>
              ) : (
                <p className="text-sm text-yellow-600 mt-1">
                  Email not verified. Please check your inbox for verification instructions.
                </p>
              )}
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

      {/* Email Update Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Email Address</DialogTitle>
            <DialogDescription>
              Enter your new email address below. A verification link will be sent to complete the update.
            </DialogDescription>
          </DialogHeader>

          {emailError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{emailError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newEmail" className="text-right">
                New Email
              </Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="col-span-3"
                placeholder="Enter your new email address"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEmailDialog(false);
              setEmailError('');
              if (profile?.email) setNewEmail(profile.email);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleEmailUpdate}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Update Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
