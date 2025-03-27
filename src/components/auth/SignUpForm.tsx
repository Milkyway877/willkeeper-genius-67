import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const userDetailsSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const pinSchema = z.object({
  pin: z.string().length(6, 'PIN must be exactly 6 digits').regex(/^\d+$/, 'PIN must contain only numbers'),
  confirmPin: z.string().length(6, 'PIN must be exactly 6 digits'),
}).refine(data => data.pin === data.confirmPin, {
  message: "PINs don't match",
  path: ['confirmPin'],
});

const tanKeySchema = z.object({
  confirmStorage: z.boolean().refine(val => val === true, {
    message: 'You must confirm you have safely stored your TanKey',
  }),
});

type UserDetailsInputs = z.infer<typeof userDetailsSchema>;
type PinInputs = z.infer<typeof pinSchema>;
type TanKeyInputs = z.infer<typeof tanKeySchema>;

export function SignUpForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetailsInputs | null>(null);
  const [pinDetails, setPinDetails] = useState<PinInputs | null>(null);
  const [tanKey, setTanKey] = useState<string>('');
  const navigate = useNavigate();
  
  // Generate a random TanKey when the component is mounted or when reaching step 3
  React.useEffect(() => {
    if (step === 3 && !tanKey) {
      // Generate a strong random key (simplified version for demo)
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
      let result = '';
      for (let i = 0; i < 24; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
        if (i % 6 === 5 && i < 23) result += '-';
      }
      setTanKey(result);
    }
  }, [step, tanKey]);

  // Form 1: User Details
  const userDetailsForm = useForm<UserDetailsInputs>({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Form 2: PIN Setup
  const pinForm = useForm<PinInputs>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      pin: '',
      confirmPin: '',
    },
  });

  // Form 3: TanKey Confirmation
  const tanKeyForm = useForm<TanKeyInputs>({
    resolver: zodResolver(tanKeySchema),
    defaultValues: {
      confirmStorage: false,
    },
  });

  const onUserDetailsSubmit = (data: UserDetailsInputs) => {
    setUserDetails(data);
    setStep(2);
  };

  const onPinSubmit = (data: PinInputs) => {
    setPinDetails(data);
    setStep(3);
  };

  const onTanKeySubmit = () => {
    // Combine all data and submit to API
    const formData = {
      ...userDetails,
      ...pinDetails,
      tanKey,
    };
    
    console.log('Form data submitted:', formData);
    
    // Show success toast
    toast({
      title: "Account created!",
      description: "Your WillTank account has been successfully created.",
    });
    
    // Redirect to login
    setTimeout(() => {
      navigate('/auth/signin');
    }, 2000);
  };

  const downloadTanKey = () => {
    const element = document.createElement('a');
    const file = new Blob([tanKey], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `willtank-tankey-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "TanKey downloaded",
      description: "Keep this file safe and secure. It cannot be recovered if lost.",
    });
  };

  return (
    <div className="w-full">
      {step === 1 && (
        <Form {...userDetailsForm}>
          <form onSubmit={userDetailsForm.handleSubmit(onUserDetailsSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={userDetailsForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userDetailsForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={userDetailsForm.control}
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
              control={userDetailsForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••••••" 
                        className="pr-10"
                        {...field} 
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={field.value} />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={userDetailsForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="••••••••••••" 
                        className="pr-10"
                        {...field} 
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-500"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md border border-slate-200">
              <p>Your email and password will be used for secure access. Ensure your password is strong and unique.</p>
            </div>
            
            <Button type="submit" className="w-full">
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      )}
      
      {step === 2 && (
        <Form {...pinForm}>
          <form onSubmit={pinForm.handleSubmit(onPinSubmit)} className="space-y-6">
            <FormField
              control={pinForm.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter 6-Digit Security PIN</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={pinForm.control}
              name="confirmPin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Security PIN</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md border border-slate-200">
              <p>This PIN adds an extra layer of security. Do not share it. You will need it for recovery.</p>
            </div>
            
            <Button type="submit" className="w-full">
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      )}
      
      {step === 3 && (
        <Form {...tanKeyForm}>
          <form onSubmit={tanKeyForm.handleSubmit(onTanKeySubmit)} className="space-y-6">
            <div className="space-y-2">
              <FormLabel>Your Unique TanKey</FormLabel>
              <div className="relative">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-md font-mono text-center break-all select-all">
                  {tanKey}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">This is your unique access key. Store it securely.</p>
            </div>
            
            <Button 
              type="button" 
              onClick={downloadTanKey} 
              variant="outline" 
              className="w-full"
            >
              Download TanKey
            </Button>
            
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-md space-y-2">
              <p className="text-amber-800 font-medium text-sm flex items-center">
                <span className="text-amber-600 mr-2 text-lg">⚠️</span> Important Security Warning
              </p>
              <p className="text-amber-700 text-sm">
                This TanKey is your only way to access your account. Store it safely. It cannot be recovered if lost!
              </p>
            </div>
            
            <FormField
              control={tanKeyForm.control}
              name="confirmStorage"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      I have safely stored my TanKey
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full">
              Finish Signup <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
