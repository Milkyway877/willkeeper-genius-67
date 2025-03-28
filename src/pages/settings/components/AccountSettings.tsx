
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Edit, Save, RefreshCw, Upload, X, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { updateUserProfile } from '@/services/profileService';
import { supabase } from '@/integrations/supabase/client';

export function AccountSettings() {
  const { toast } = useToast();
  const { user, profile, initials, refreshProfile } = useUserProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // User profile state
  const [profileData, setProfileData] = useState({
    firstName: profile?.full_name?.split(' ')[0] || '',
    lastName: profile?.full_name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
  });
  
  // Edit profile handler
  const handleProfileUpdate = async () => {
    setIsLoading(true);
    
    try {
      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
      
      // Update profile in database
      await updateUserProfile({
        full_name: fullName,
      });
      
      // Refresh the profile data
      await refreshProfile();
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully."
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Avatar upload handlers
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const uploadAvatar = async () => {
    if (!avatarFile || !user) return;
    
    setIsUploadingAvatar(true);
    
    try {
      // Create a unique file path
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      if (data.publicUrl) {
        // Update profile with new avatar URL
        await updateUserProfile({
          avatar_url: data.publicUrl,
        });
        
        // Refresh the profile
        await refreshProfile();
        
        toast({
          title: "Avatar Updated",
          description: "Your profile picture has been updated successfully."
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
      setIsUploadingAvatar(false);
      setAvatarFile(null);
    }
  };
  
  const removeAvatar = async () => {
    if (!profile?.avatar_url) return;
    
    setIsUploadingAvatar(true);
    
    try {
      // Extract the file path from the URL
      const url = new URL(profile.avatar_url);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const filePath = `avatars/${fileName}`;
      
      // Delete the file from storage (if it exists)
      await supabase.storage
        .from('avatars')
        .remove([filePath]);
      
      // Update profile to remove avatar URL
      await updateUserProfile({
        avatar_url: null,
      });
      
      // Refresh the profile
      await refreshProfile();
      
      // Reset the local state
      setAvatarUrl(null);
      
      toast({
        title: "Avatar Removed",
        description: "Your profile picture has been removed."
      });
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast({
        title: "Remove Failed",
        description: "There was an error removing your avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    // In a real app, this would need a confirmation dialog and API call
    toast({
      title: "Account Deletion",
      description: "This feature is not implemented yet for security reasons. Please contact support to delete your account.",
      variant: "destructive"
    });
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center">
            <User className="text-willtank-700 mr-2" size={18} />
            <h3 className="font-medium">Account Information</h3>
          </div>
          <Button size="sm" variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-center mb-8">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-gray-200">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Profile" />
                  ) : (
                    <AvatarFallback className="text-xl bg-willtank-100 text-willtank-700">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <label htmlFor="avatar-upload" className="cursor-pointer p-1 bg-white rounded-full">
                      <Upload size={16} className="text-gray-600" />
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarChange}
                      />
                    </label>
                    
                    {avatarUrl && (
                      <button 
                        className="p-1 bg-white rounded-full"
                        onClick={removeAvatar}
                        disabled={isUploadingAvatar}
                      >
                        <X size={16} className="text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {avatarFile && (
              <div className="flex justify-center mb-4">
                <Button 
                  onClick={uploadAvatar} 
                  disabled={isUploadingAvatar} 
                  size="sm"
                >
                  {isUploadingAvatar ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload New Avatar
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1 space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <Input 
                  id="firstName" 
                  value={profileData.firstName} 
                  onChange={e => setProfileData({...profileData, firstName: e.target.value})}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input 
                  id="email" 
                  type="email" 
                  value={profileData.email} 
                  onChange={e => setProfileData({...profileData, email: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <Input 
                  id="lastName" 
                  value={profileData.lastName} 
                  onChange={e => setProfileData({...profileData, lastName: e.target.value})}
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <Input 
                  id="phone" 
                  value={profileData.phone} 
                  onChange={e => setProfileData({...profileData, phone: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <Button onClick={handleProfileUpdate} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6"
      >
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
          <Trash2 className="text-red-500 mr-2" size={18} />
          <h3 className="font-medium text-red-500">Danger Zone</h3>
        </div>
        
        <div className="p-6">
          <h4 className="font-medium mb-2">Delete Account</h4>
          <p className="text-gray-600 text-sm mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="destructive" onClick={handleDeleteAccount}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </motion.div>
    </>
  );
}
