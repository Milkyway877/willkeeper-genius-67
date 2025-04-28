
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/UserAvatar';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { updateUserProfile } from '@/services/profileService';
import { Check, Loader2, User, Upload, Image, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Profile() {
  const { toast } = useToast();
  const { profile, refreshProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile]);
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    // Reset to original values
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const updatedProfile = await updateUserProfile({
        full_name: fullName
      });
      
      if (updatedProfile) {
        await refreshProfile();
        setIsEditing(false);
        
        toast({
          title: "Profile Updated",
          description: "Your profile information has been successfully updated.",
          variant: "default"
        });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !profile) return;

      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Avatar image must be less than 2MB",
          variant: "destructive"
        });
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG or GIF image",
          variant: "destructive"
        });
        return;
      }

      setIsUploading(true);
      
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the uploaded image
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // Update the user profile with the new avatar URL
      const updatedProfile = await updateUserProfile({
        avatar_url: data.publicUrl
      });
      
      if (updatedProfile) {
        await refreshProfile();
        
        toast({
          title: "Avatar Updated",
          description: "Your profile picture has been successfully updated.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>
        
        <Card className="border-willtank-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-willtank-50 to-white">
            <CardTitle className="text-willtank-800">Personal Information</CardTitle>
            <CardDescription className="text-willtank-600">
              Update your personal details and how others see you on the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
              <div className="relative group">
                <div className="relative rounded-full overflow-hidden border-4 border-willtank-100 shadow-md h-32 w-32">
                  <UserAvatar size="lg" className="h-full w-full" />
                  
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={triggerFileInput}
                  >
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white" 
                  onClick={triggerFileInput}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/png, image/jpeg, image/gif"
                  className="hidden"
                />
              </div>

              <div className="text-center md:text-left">
                <h3 className="font-semibold text-xl">
                  {profile?.full_name || 'User'}
                </h3>
                <p className="text-gray-600">
                  {profile?.email || 'Loading email...'}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-willtank-100 text-willtank-800">
                    {profile?.subscription_plan || 'Free Plan'}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {profile?.is_activated ? 'Activated' : 'Not Activated'}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}
                  </span>
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="fullName" className="text-base font-medium">Full Name</Label>
                <div className="flex gap-4 mt-1.5">
                  <Input 
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!isEditing || isSaving}
                    className="max-w-md"
                    placeholder="Enter your full name"
                  />
                  
                  {!isEditing ? (
                    <Button onClick={handleEdit} className="bg-willtank-600 hover:bg-willtank-700">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={isSaving} className="bg-willtank-600 hover:bg-willtank-700">
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
                <div className="mt-1.5">
                  <Input 
                    id="email"
                    value={profile?.email || 'Loading...'}
                    disabled={true}
                    className="max-w-md"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    To change your email address, please contact support.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
