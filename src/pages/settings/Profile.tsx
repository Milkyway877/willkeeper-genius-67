import React, { useState, useEffect } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/contexts/AuthContext';
import { updateUserProfile, getUserProfile } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  email: string;
  metadata: any;
}

export default function Profile() {
  const { user } = useUser();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          setLoading(true);
          const profile = await getUserProfile(user.id);
          setUserProfile(profile);
          setFormData(profile);
        } catch (error) {
          console.error("Failed to load profile:", error);
          toast({
            title: "Error loading profile",
            description: "Failed to load your profile data. Please try again.",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadProfile();
  }, [user, toast]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev?.metadata,
        [name]: value
      }
    }));
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar_url: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleProfileUpdate = async (formData: UserProfile) => {
    setIsEditing(false);
    setLoading(true);
    
    try {
      if (!user) {
        throw new Error("Not authenticated.");
      }
      
      // Update the formData structure - Fix email_verified reference
      await updateUserProfile({
        ...formData,
        metadata: formData.metadata
      });
      
      setUserProfile(formData);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error) {
      console.error("Profile update failed:", error);
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <Layout><div className="container mx-auto">Loading profile...</div></Layout>;
  }
  
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
        
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4">
              <div className="flex flex-col items-center justify-center space-y-2">
                <Avatar
                  src={userProfile?.avatar_url || '/assets/avatar-placeholder.png'}
                  alt={`${userProfile?.full_name || 'User'}'s avatar`}
                  size="lg" // Changed from "xl" to "lg"
                />
                <Label htmlFor="avatar">Update Avatar</Label>
                <Input type="file" id="avatar" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                <Button variant="secondary" size="sm" asChild>
                  <Label htmlFor="avatar">Choose Image</Label>
                </Button>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input 
                  type="text" 
                  id="full_name" 
                  name="full_name"
                  defaultValue={userProfile?.full_name || ''} 
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  type="email" 
                  id="email" 
                  name="email"
                  defaultValue={userProfile?.email || ''}
                  onChange={handleChange}
                  disabled
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  type="text" 
                  id="location" 
                  name="location"
                  defaultValue={userProfile?.metadata?.location || ''}
                  onChange={handleMetadataChange}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  type="text"
                  id="bio"
                  name="bio"
                  defaultValue={userProfile?.metadata?.bio || ''}
                  onChange={handleMetadataChange}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="flex justify-end">
                {isEditing ? (
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => {
                      setIsEditing(false);
                      setFormData(userProfile); // Revert changes
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleProfileUpdate(formData as UserProfile)}>
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
