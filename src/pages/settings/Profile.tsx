import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';
import { getUserProfile, updateUserProfile, UserProfile } from '@/services/userService';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, Save, Check } from 'lucide-react';

const profileFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  location: z.string().optional(),
  bio: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function Profile() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      location: "",
      bio: "",
    },
  })
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const userProfile = await getUserProfile();
        if (userProfile) {
          setProfile(userProfile);
          form.reset({
            fullName: userProfile.full_name || "",
            location: userProfile.metadata?.location || "",
            bio: userProfile.metadata?.bio || "",
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: 'Error',
          description: 'Could not load profile information.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [toast, form]);
  
  const onSave = async (values: ProfileFormValues) => {
    try {
      setIsSaving(true);
      
      const updatedProfile: Partial<UserProfile> = {
        full_name: values.fullName,
        metadata: {
          location: values.location,
          bio: values.bio
        }
      };
      
      const result = await updateUserProfile(updatedProfile);
      
      if (result) {
        setProfile(result);
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been updated successfully.',
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast({
        title: 'Error',
        description: 'Could not update profile information.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-willtank-600" />
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-gray-600 mb-6">
          Manage your personal information and profile details.
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center space-x-4">
                <Avatar size="lg">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback>{profile?.full_name?.substring(0, 2).toUpperCase() || "XX"}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold">{profile?.full_name || "No Name"}</h2>
                  <p className="text-sm text-gray-500">{profile?.id}</p>
                </div>
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Input placeholder="Tell us a little about yourself" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
