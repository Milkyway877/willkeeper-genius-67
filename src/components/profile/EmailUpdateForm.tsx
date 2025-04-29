
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Mail, Loader2, Check } from 'lucide-react';

const emailSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export function EmailUpdateForm() {
  const { toast } = useToast();
  const { profile, updateEmail } = useUserProfile();
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showSuccess, setShowSuccess] = React.useState(false);
  
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });
  
  // Reset the form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        email: profile?.email || '',
      });
      setError(null);
      setShowSuccess(false);
    }
  }, [open, profile, form]);
  
  const onSubmit = async (values: EmailFormValues) => {
    if (values.email === profile?.email) {
      setError('This is already your current email address.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      console.log("Updating email to:", values.email);
      const result = await updateEmail(values.email);
      
      if (result.success) {
        setShowSuccess(true);
        form.reset();
        
        toast({
          title: 'Verification Email Sent',
          description: 'A confirmation link has been sent to your new email address. Please check your inbox to complete the update.',
        });
        
        // Close dialog after showing success for 3 seconds
        setTimeout(() => {
          setOpen(false);
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to update email. Please try again.');
      }
    } catch (err: any) {
      console.error('Email update error:', err);
      setError(err.message || 'Failed to update email. Please try again.');
      toast({
        title: 'Email Update Failed',
        description: err.message || 'There was a problem updating your email address.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="h-4 w-4 mr-2" />
          Change Email
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Email Address</DialogTitle>
          <DialogDescription>
            Enter your new email address below. A verification link will be sent to confirm the update.
          </DialogDescription>
        </DialogHeader>
        
        {showSuccess ? (
          <div className="py-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Verification Email Sent</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Please check your inbox and click the verification link to complete the email update.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your new email address"
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                
                <Button type="submit" disabled={submitting || !form.formState.isValid}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Update Email
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
