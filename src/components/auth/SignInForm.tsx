
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  tanKey: z.string().min(6, 'Please enter your TanKey'),
});

type SignInFormInputs = z.infer<typeof signInSchema>;

export function SignInForm() {
  const [showTanKey, setShowTanKey] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<SignInFormInputs>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      tanKey: '',
    },
  });

  const onSubmit = (data: SignInFormInputs) => {
    console.log('Sign in data submitted:', data);
    
    // Show success toast
    toast({
      title: "Sign in successful",
      description: "Redirecting to your dashboard...",
    });
    
    // Redirect to dashboard (would normally check auth first)
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tanKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>TanKey</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input 
                    type={showTanKey ? "text" : "password"} 
                    placeholder="Paste your TanKey" 
                    className="pr-10 font-mono"
                    {...field} 
                  />
                </FormControl>
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-500"
                  onClick={() => setShowTanKey(!showTanKey)}
                >
                  {showTanKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          Sign In <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        
        <div className="space-y-2 mt-6">
          <div className="text-center">
            <Link 
              to="/auth/recover" 
              className="text-sm font-medium text-willtank-600 hover:text-willtank-700"
            >
              Forgot TanKey? Recover with PIN →
            </Link>
          </div>
          
          <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md border border-slate-200">
            <p>Your TanKey is required for login. If lost, recover using your PIN. Keep your credentials secure.</p>
          </div>
        </div>
      </form>
    </Form>
  );
}
