
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
import { updateUserProfile } from '@/services/userService';
import { useNotifications } from '@/hooks/use-notifications';
import { Check, Loader2, Upload, Camera, User, Mail, Calendar, X, UserPlus, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

export default function Profile() {
  const { toast } = useToast();
  const { profile, refreshProfile } = useUserProfile();
  const { notifyProfileUpdated } = useNotifications();
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
        
        // Create notification
        await notifyProfileUpdated('Full Name');
        
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile?.id}/avatar-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      if (!publicUrlData?.publicUrl) throw new Error('Failed to get public URL');
      
      // Update user profile with new avatar URL
      const updatedProfile = await updateUserProfile({
        avatar_url: publicUrlData.publicUrl
      });
      
      if (updatedProfile) {
        await refreshProfile();
        
        // Create notification
        await notifyProfileUpdated('Profile Picture');
        
        toast({
          title: "Avatar Updated",
          description: "Your profile picture has been successfully updated.",
          variant: "default"
        });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Clear the input value so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile?.avatar_url) return;
    
    try {
      setIsUploading(true);
      
      // Update user profile with null avatar URL
      const updatedProfile = await updateUserProfile({
        avatar_url: null
      });
      
      if (updatedProfile) {
        await refreshProfile();
        
        // Create notification
        await notifyProfileUpdated('Profile Picture');
        
        toast({
          title: "Avatar Removed",
          description: "Your profile picture has been removed.",
          variant: "default"
        });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error removing avatar:", error);
      
      toast({
        title: "Update Failed",
        description: "There was an error removing your profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and account settings</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Your public profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <div className="relative mb-4 group cursor-pointer" onClick={handleAvatarClick}>
                {isUploading ? (
                  <div className="h-32 w-32 rounded-full bg-gray-100 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-willtank-600 animate-spin" />
                  </div>
                ) : (
                  <>
                    <UserAvatar size="lg" className="h-32 w-32 text-3xl" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </>
                )}
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              
              <h3 className="text-xl font-semibold mb-1">{profile?.full_name || 'User'}</h3>
              <p className="text-gray-500 mb-4">{profile?.email || 'No email available'}</p>
              
              <div className="flex gap-2 mb-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Change Avatar
                </Button>
                
                {profile?.avatar_url && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={isUploading}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <div className="w-full space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm">{profile?.full_name || 'Name not set'}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm">{profile?.email || 'Email not available'}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm">
                    {profile?.created_at 
                      ? `Joined ${new Date(profile.created_at).toLocaleDateString()}` 
                      : 'Join date unknown'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Personal Information Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="flex gap-4 mt-1.5">
                    <Input 
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={!isEditing || isSaving}
                      className="max-w-md"
                    />
                    
                    {!isEditing ? (
                      <Button onClick={handleEdit}>
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                          Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
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
                
                <Separator />
                
                <div>
                  <Label>Email Address</Label>
                  <div className="mt-1.5 flex">
                    <Input 
                      value={profile?.email || ''}
                      disabled
                      className="max-w-md bg-gray-50"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    To change your email address, please contact support
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-3">Account Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="p-4 rounded-lg border border-green-100 bg-green-50"
                    >
                      <div className="font-medium text-green-700 mb-1">Account Status</div>
                      <div className="text-sm text-green-600">
                        Active
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="p-4 rounded-lg border border-blue-100 bg-blue-50"
                    >
                      <div className="font-medium text-blue-700 mb-1">Email Verification</div>
                      <div className="text-sm text-blue-600">
                        {profile?.email_verified ? 'Verified' : 'Not Verified'}
                      </div>
                    </motion.div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-3">Quick Access</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <Button variant="outline" className="justify-start">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Beneficiary
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <User className="mr-2 h-4 w-4" />
                      Add Executor
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Shield className="mr-2 h-4 w-4" />
                      Security Settings
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
