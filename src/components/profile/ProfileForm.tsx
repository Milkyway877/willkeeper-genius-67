
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useFormAutoSave } from '@/hooks/use-form-auto-save';
import { useToast } from '@/hooks/use-toast';
import { Check, AlertCircle, Save, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Validation schema
const profileFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const { toast } = useToast();
  const { profile, updateProfile } = useUserProfile();
  const [manualSaving, setManualSaving] = React.useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: profile?.full_name || '',
      email: profile?.email || '',
    },
    mode: 'onChange',
  });
  
  // Update form when profile changes
  React.useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.full_name || '',
        email: profile.email || '',
      });
    }
  }, [profile, form]);
  
  // Get form values for auto-save
  const formValues = form.watch();
  
  // Auto-save functionality
  const { saving, lastSaved, saveError } = useFormAutoSave({
    data: formValues,
    onSave: async (data) => {
      // Only save if full name has changed and is valid
      if (data.fullName !== profile?.full_name && data.fullName.length >= 2) {
        await updateProfile({
          full_name: data.fullName,
        });
        
        // Show toast for auto-save
        toast({
          title: 'Changes Saved',
          description: 'Your profile has been updated automatically.',
        });
      }
    },
    debounceMs: 2000, // Wait 2 seconds after typing stops
    enabled: !!profile && form.formState.isDirty && form.formState.isValid,
  });
  
  // Manual save handler
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setManualSaving(true);
      
      await updateProfile({
        full_name: data.fullName,
      });
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved successfully.',
      });
      
      form.reset({
        fullName: data.fullName,
        email: profile?.email || '',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Save Failed',
        description: 'There was a problem saving your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setManualSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Full Name</FormLabel>
                {saving ? (
                  <span className="text-xs text-gray-500 flex items-center">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Saving...
                  </span>
                ) : lastSaved ? (
                  <span className="text-xs text-green-600 flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                ) : null}
              </div>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter your full name"
                  className={`${
                    form.formState.errors.fullName
                      ? 'border-red-300 focus:border-red-500'
                      : 'focus:border-willtank-500'
                  }`}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input {...field} disabled placeholder="Your email address" />
              </FormControl>
              <div className="mt-1">
                {profile?.email_verified ? (
                  <span className="text-xs text-green-600 flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    Email verified
                  </span>
                ) : (
                  <span className="text-xs text-yellow-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Email not verified. Please check your inbox for verification instructions.
                  </span>
                )}
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className={`
              inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium
              transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              focus-visible:ring-offset-2 disabled:opacity-50 bg-black text-white hover:bg-gray-800
              h-10 px-4 py-2
            `}
            disabled={manualSaving || !form.formState.isDirty || saving}
          >
            {manualSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </Form>
  );
}
