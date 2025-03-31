import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Check, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile, getUserProfile, UserProfile, getInitials } from '@/services/profileService';
import { useUser } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

function updateUserMetadata(fields: Record<string, any>) {
  // We need to update this to use the proper fields
  const profile: Partial<UserProfile> = {
    full_name: fields.fullName,
    // Remove user_metadata field as it doesn't exist in the UserProfile type
    // Update avatar_url without using "xl" size
    avatar_url: fields.avatar ? fields.avatar : null
  };
  return profile;
}

export default function Profile() {
  const { toast } = useToast();
  const { user, updateUser } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const userProfile = await getUserProfile();
        if (userProfile) {
          setProfile(userProfile);
          setFullName(userProfile.full_name || '');
          setAvatarUrl(userProfile.avatar_url || null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, []);
  
  const handleEditClick = () => {
    setIsEditing(true);
  };
  
  const handleCancelClick = () => {
    setIsEditing(false);
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || null);
    }
    setNewAvatar(null);
  };
  
  const handleSaveClick = async () => {
    setIsLoading(true);
    try {
      const updates: Record<string, any> = {};
      if (fullName !== profile?.full_name) {
        updates.fullName = fullName;
      }
      
      if (newAvatar) {
        updates.avatar = URL.createObjectURL(newAvatar);
      }
      
      if (Object.keys(updates).length > 0) {
        const profileUpdates = updateUserMetadata(updates);
        const updatedProfile = await updateUserProfile(profileUpdates);
        
        if (updatedProfile) {
          setProfile(updatedProfile);
          setFullName(updatedProfile.full_name || '');
          setAvatarUrl(updatedProfile.avatar_url || null);
          toast({
            title: "Profile updated",
            description: "Your profile has been updated successfully."
          });
        } else {
          throw new Error("Failed to update profile");
        }
      }
      
      setIsEditing(false);
      setNewAvatar(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewAvatar(file);
    if (file) {
      setAvatarUrl(URL.createObjectURL(file));
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          Loading profile...
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-gray-500">Manage your personal information and settings.</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            {isEditing ? (
              <div>
                <Button 
                  variant="ghost" 
                  onClick={handleCancelClick} 
                  disabled={isLoading}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveClick} 
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            ) : (
              <Button onClick={handleEditClick}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="avatar">Avatar</Label>
              <div className="mt-2 flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Avatar" />
                  ) : (
                    <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
                  )}
                </Avatar>
                {isEditing && (
                  <div>
                    <Input 
                      type="file" 
                      id="avatar" 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                      className="hidden" 
                    />
                    <Label htmlFor="avatar" className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-3 py-2 cursor-pointer">
                      {newAvatar ? 'Change Avatar' : 'Upload Avatar'}
                    </Label>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                type="text"
                id="fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                type="email"
                id="email"
                placeholder="Enter your email address"
                value={user?.email || ''}
                disabled
              />
            </div>
            
            <div>
              <Label>Email Verified</Label>
              <div className="mt-2">
                {user?.email_verified ? (
                  <div className="flex items-center text-green-500">
                    <Check className="mr-2 h-4 w-4" />
                    Verified
                  </div>
                ) : (
                  <div className="flex items-center text-red-500">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Not Verified
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
