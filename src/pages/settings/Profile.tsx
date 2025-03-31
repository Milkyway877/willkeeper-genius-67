
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { UserAvatar } from '@/components/UserAvatar';
import { Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileFormValues {
  email: string;
  fullName: string;
  avatarUrl: string | null;
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileFormValues>({
    email: '',
    fullName: '',
    avatarUrl: null
  });
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('No user found');
        }
        
        // Get profile data
        const { data: profileData, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setProfile({
          email: user.email || '',
          fullName: profileData.full_name || '',
          avatarUrl: profileData.avatar_url
        });
      } catch (error: any) {
        console.error('Error loading profile:', error);
        toast({
          title: 'Error loading profile',
          description: error.message || 'Failed to load profile data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, [toast]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Update user profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: profile.fullName,
          avatar_url: profile.avatarUrl
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated'
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Profile Settings</h2>
        <p className="text-gray-500">Manage your account information and preferences.</p>
      </div>
      
      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <Check className="h-4 w-4" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>Your profile has been updated successfully.</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details and profile picture.</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex justify-center">
                <UserAvatar 
                  user={{ 
                    id: 'current-user',
                    email: profile.email,
                    user_metadata: { full_name: profile.fullName }
                  }} 
                  size="xl" 
                />
              </div>
              
              <div className="flex-grow">
                <div className="space-y-1">
                  <Label htmlFor="avatarUrl">Profile Picture URL</Label>
                  <Input 
                    id="avatarUrl"
                    name="avatarUrl"
                    type="text"
                    placeholder="https://example.com/avatar.jpg"
                    value={profile.avatarUrl || ''}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">
                    Enter a URL to your profile picture. Leave blank to use your initials.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500">
                  Your email cannot be changed. Contact support if you need to use a different email.
                </p>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={profile.fullName}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Your full name"
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" disabled={updating}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || updating}>
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
