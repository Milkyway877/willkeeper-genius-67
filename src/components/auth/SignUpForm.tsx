import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ArrowRight, Check, Copy, Download, Shield, Lock, User, MapPin, FileText, CreditCard, Key, Upload, Camera, BadgeCheck, CreditCard as CreditCardIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

// Form schemas
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

const recoveryPhraseSchema = z.object({
  verificationWords: z.record(z.string()).refine((data) => {
    return Object.values(data).every(word => word.trim() !== '');
  }, {
    message: 'All verification words must be filled',
  }),
});

const userBackgroundSchema = z.object({
  isMarried: z.enum(['yes', 'no', 'skip']),
  hasChildren: z.enum(['yes', 'no', 'skip']),
  ownsBusiness: z.enum(['yes', 'no', 'skip']),
  specificAssets: z.string().optional(),
});

const authenticatorSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

const locationSchema = z.object({
  country: z.string().min(2, 'Please select a country'),
  city: z.string().min(2, 'Please enter a city'),
});

const templateSchema = z.object({
  templateChoice: z.string().min(1, 'Please select a template'),
});

const kycSchema = z.object({
  idType: z.enum(['nationalId', 'passport', 'driversLicense']),
  idDocument: z.string().min(1, 'Please upload an ID document'),
  selfie: z.string().min(1, 'Please take a selfie'),
});

const subscriptionSchema = z.object({
  plan: z.enum(['gold', 'platinum', 'lifetime']),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

type UserDetailsInputs = z.infer<typeof userDetailsSchema>;
type PinInputs = z.infer<typeof pinSchema>;
type TanKeyInputs = z.infer<typeof tanKeySchema>;
type RecoveryPhraseInputs = z.infer<typeof recoveryPhraseSchema>;
type UserBackgroundInputs = z.infer<typeof userBackgroundSchema>;
type AuthenticatorInputs = z.infer<typeof authenticatorSchema>;
type LocationInputs = z.infer<typeof locationSchema>;
type TemplateInputs = z.infer<typeof templateSchema>;
type KycInputs = z.infer<typeof kycSchema>;
type SubscriptionInputs = z.infer<typeof subscriptionSchema>;

// Stepper component
const Stepper = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
        <span className="text-sm font-medium">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
      </div>
      <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
    </div>
  );
};

export function SignUpForm() {
  // State management for multi-step form
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetailsInputs | null>(null);
  const [pinDetails, setPinDetails] = useState<PinInputs | null>(null);
  const [tanKey, setTanKey] = useState<string>('');
  const [recoveryPhrase, setRecoveryPhrase] = useState<string[]>([]);
  const [verificationIndices, setVerificationIndices] = useState<number[]>([]);
  const [userBackground, setUserBackground] = useState<UserBackgroundInputs | null>(null);
  const [authenticatorKey, setAuthenticatorKey] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [location, setLocation] = useState<LocationInputs | null>(null);
  const [templateChoice, setTemplateChoice] = useState<string>('');
  const [willPreview, setWillPreview] = useState<string>('');
  const [kycData, setKycData] = useState<KycInputs | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInputs | null>(null);
  
  const navigate = useNavigate();
  
  // Generate TanKey when reaching step 3
  useEffect(() => {
    if (step === 3 && !tanKey) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
      let result = '';
      for (let i = 0; i < 24; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
        if (i % 6 === 5 && i < 23) result += '-';
      }
      setTanKey(result);
    }
  }, [step, tanKey]);
  
  // Generate recovery phrase when reaching step 4
  useEffect(() => {
    if (step === 4 && recoveryPhrase.length === 0) {
      const wordList = [
        'apple', 'banana', 'cherry', 'dolphin', 'elephant', 'falcon', 'giraffe', 'horizon',
        'igloo', 'jaguar', 'kangaroo', 'lemon', 'mountain', 'nebula', 'octopus', 'penguin',
        'quasar', 'rabbit', 'salmon', 'tiger', 'umbrella', 'volcano', 'walrus', 'xenon',
        'yacht', 'zebra', 'asteroid', 'butterfly', 'cactus', 'diamond', 'eagle', 'forest'
      ];
      
      const phrase: string[] = [];
      for (let i = 0; i < 12; i++) {
        const randomIndex = Math.floor(Math.random() * wordList.length);
        phrase.push(wordList[randomIndex]);
      }
      setRecoveryPhrase(phrase);
      
      const indices: number[] = [];
      while (indices.length < 3) {
        const randomIndex = Math.floor(Math.random() * 12);
        if (!indices.includes(randomIndex)) {
          indices.push(randomIndex);
        }
      }
      setVerificationIndices(indices);
    }
  }, [step, recoveryPhrase.length]);
  
  // Generate authenticator key when reaching step 6
  useEffect(() => {
    if (step === 6 && !authenticatorKey) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      let result = '';
      for (let i = 0; i < 16; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
        if (i % 4 === 3 && i < 15) result += ' ';
      }
      setAuthenticatorKey(result);
      
      setQrCodeUrl('https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/WillTank:' + 
                  (userDetails?.email || 'user') + '%3Fsecret%3D' + result.replace(/\s/g, '') + '%26issuer%3DWillTank');
    }
  }, [step, authenticatorKey, userDetails]);
  
  // Auto-detect location when reaching step 7
  useEffect(() => {
    if (step === 7 && !location) {
      setLocation({
        country: 'United States',
        city: 'New York'
      });
    }
  }, [step, location]);
  
  // Generate will preview when reaching step 8
  useEffect(() => {
    if (step === 8 && !willPreview) {
      const firstName = userDetails?.firstName || 'John';
      const lastName = userDetails?.lastName || 'Doe';
      const isMarried = userBackground?.isMarried === 'yes';
      const hasChildren = userBackground?.hasChildren === 'yes';
      
      setWillPreview(`
LAST WILL AND TESTAMENT OF ${firstName.toUpperCase()} ${lastName.toUpperCase()}

I, ${firstName} ${lastName}, a resident of ${location?.city || 'City'}, ${location?.country || 'Country'}, being of sound mind, declare this to be my Last Will and Testament.

ARTICLE I - REVOCATION
I revoke all prior wills and codicils.

ARTICLE II - FAMILY STATUS
${isMarried ? 'I am married to [Spouse Name].' : 'I am not currently married.'}
${hasChildren ? 'I have children whose names are [Child Names].' : 'I do not currently have any children.'}

ARTICLE III - EXECUTOR APPOINTMENT
I appoint [Executor Name] as Executor of my estate.

ARTICLE IV - DISTRIBUTION OF ASSETS
I give all of my property, real and personal, to [Beneficiary Names].

ARTICLE V - SPECIFIC BEQUESTS
[List of specific items and who they go to]

This document is a preview generated by WillTank's AI system. It is not a legal document and would require customization, verification, and proper execution to be valid.
      `);
    }
  }, [step, willPreview, userDetails, userBackground, location]);

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
  
  // Form 4: Recovery Phrase Verification
  const recoveryPhraseForm = useForm<RecoveryPhraseInputs>({
    resolver: zodResolver(recoveryPhraseSchema),
    defaultValues: {
      verificationWords: {},
    },
  });
  
  // Form 5: User Background
  const userBackgroundForm = useForm<UserBackgroundInputs>({
    resolver: zodResolver(userBackgroundSchema),
    defaultValues: {
      isMarried: 'skip',
      hasChildren: 'skip',
      ownsBusiness: 'skip',
      specificAssets: '',
    },
  });
  
  // Form 6: Authenticator Setup
  const authenticatorForm = useForm<AuthenticatorInputs>({
    resolver: zodResolver(authenticatorSchema),
    defaultValues: {
      otp: '',
    },
  });
  
  // Form 7: Location Setup
  const locationForm = useForm<LocationInputs>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      country: location?.country || '',
      city: location?.city || '',
    },
  });
  
  // Form 8: Template Selection
  const templateForm = useForm<TemplateInputs>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      templateChoice: '',
    },
  });
  
  // Form 9: KYC
  const kycForm = useForm<KycInputs>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      idType: 'passport',
      idDocument: '',
      selfie: '',
    },
  });
  
  // Form 10: Subscription
  const subscriptionForm = useForm<SubscriptionInputs>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      plan: 'gold',
      agreeToTerms: false,
    },
  });

  // Form submission handlers
  const onUserDetailsSubmit = (data: UserDetailsInputs) => {
    setUserDetails(data);
    setStep(2);
  };

  const onPinSubmit = (data: PinInputs) => {
    setPinDetails(data);
    setStep(3);
  };

  const onTanKeySubmit = () => {
    setStep(4);
  };
  
  const onRecoveryPhraseSubmit = (data: RecoveryPhraseInputs) => {
    const isValid = verificationIndices.every((index, i) => {
      const key = `word${i}`;
      return data.verificationWords[key]?.toLowerCase() === recoveryPhrase[index]?.toLowerCase();
    });
    
    if (isValid) {
      setStep(5);
    } else {
      toast({
        title: "Verification failed",
        description: "The words you entered don't match your recovery phrase. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const onUserBackgroundSubmit = (data: UserBackgroundInputs) => {
    setUserBackground(data);
    setStep(6);
  };
  
  const onAuthenticatorSubmit = () => {
    setStep(7);
  };
  
  const onLocationSubmit = (data: LocationInputs) => {
    setLocation(data);
    setStep(8);
  };
  
  const onTemplateSubmit = (data: TemplateInputs) => {
    setTemplateChoice(data.templateChoice);
    setStep(9);
  };
  
  const onKycSubmit = (data: KycInputs) => {
    setKycData(data);
    toast({
      title: "Identity verified",
      description: "Your identity has been successfully verified.",
      variant: "default"
    });
    setStep(10);
  };
  
  const onSubscriptionSubmit = (data: SubscriptionInputs) => {
    setSubscription(data);
    
    const formData = {
      ...userDetails,
      ...pinDetails,
      tanKey,
      recoveryPhrase,
      userBackground,
      authenticatorKey,
      location,
      templateChoice,
      kycData,
      subscription: data,
    };
    
    console.log('Form data submitted:', formData);
    
    toast({
      title: "Account created!",
      description: "Your WillTank account has been successfully created.",
    });
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
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

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="w-full">
      <Stepper currentStep={step} totalSteps={10} />
      
      {/* Step 1: User Details */}
      {step === 1 && (
        <motion.div key="step1" {...fadeInUp}>
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
        </motion.div>
      )}
      
      {/* Step 2: PIN Setup */}
      {step === 2 && (
        <motion.div key="step2" {...fadeInUp}>
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
        </motion.div>
      )}
      
      {/* Step 3: TanKey Generation */}
      {step === 3 && (
        <motion.div key="step3" {...fadeInUp}>
          <Form {...tanKeyForm}>
            <form onSubmit={tanKeyForm.handleSubmit(onTanKeySubmit)} className="space-y-6">
              <div className="space-y-2">
                <FormLabel>Your Encryption/Decryption Key</FormLabel>
                <div className="relative">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-md font-mono text-center break-all select-all">
                    {tanKey}
                  </div>
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      type="button"
                      className="p-1 bg-slate-100 rounded hover:bg-slate-200"
                      onClick={() => {
                        navigator.clipboard.writeText(tanKey);
                        toast({ 
                          title: "Copied to clipboard",
                          description: "The encryption key has been copied to your clipboard."
                        });
                      }}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">This is your unique encryption key. You will need it to access your will and other documents.</p>
              </div>
              
              <Button 
                type="button" 
                onClick={downloadTanKey} 
                variant="outline" 
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" /> Download Encryption Key
              </Button>
              
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-md space-y-2">
                <p className="text-amber-800 font-medium text-sm flex items-center">
                  <span className="text-amber-600 mr-2 text-lg">⚠️</span> <b>Important Security Warning</b>
                </p>
                <p className="text-amber-700 text-sm">
                  This key is private and cannot be recovered. Store it securely. It is essential for accessing and decrypting your will documents.
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
                        I have safely stored my encryption key
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
        </motion.div>
      )}
      
      {/* Step 4: Recovery Phrase */}
      {step === 4 && (
        <motion.div key="step4" {...fadeInUp}>
          <Form {...recoveryPhraseForm}>
            <form onSubmit={recoveryPhraseForm.handleSubmit(onRecoveryPhraseSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Your Recovery Phrase</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Write down and safely store these 12 words. They will be used for account recovery.
                </p>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {recoveryPhrase.map((word, index) => (
                    <div key={index} className="relative border rounded p-2 text-center bg-slate-50">
                      <span className="text-xs text-muted-foreground absolute top-1 left-1">{index + 1}</span>
                      <span className="font-mono">{word}</span>
                    </div>
                  ))}
                </div>
                
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-6">
                  <p className="text-sm text-amber-800">
                    <b>Security Notice:</b> WillTank does NOT store this phrase. You must keep it safe.
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Verification</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  To verify you've saved your recovery phrase, please enter the following words:
                </p>
                
                <div className="space-y-4">
                  {verificationIndices.map((index, i) => (
                    <FormField
                      key={i}
                      control={recoveryPhraseForm.control}
                      name={`verificationWords.word${i}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Word #{index + 1}</FormLabel>
                          <FormControl>
                            <Input placeholder={`Enter word #${index + 1}`} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
              
              <Button type="submit" className="w-full">
                Verify & Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
        </motion.div>
      )}
      
      {/* Step 5: User Background */}
      {step === 5 && (
        <motion.div key="step5" {...fadeInUp}>
          <Form {...userBackgroundForm}>
            <form onSubmit={userBackgroundForm.handleSubmit(onUserBackgroundSubmit)} className="space-y-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">User Background</h3>
                <p className="text-sm text-muted-foreground">
                  Please provide some background information to help us customize your experience.
                  This information will enhance our AI-generated will and customization options.
                </p>
              </div>
              
              <FormField
                control={userBackgroundForm.control}
                name="isMarried"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Are you married?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="skip" />
                          </FormControl>
                          <FormLabel className="font-normal">Skip this question</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userBackgroundForm.control}
                name="hasChildren"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Do you have children?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="skip" />
                          </FormControl>
                          <FormLabel className="font-normal">Skip this question</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userBackgroundForm.control}
                name="ownsBusiness"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Do you own a business?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="skip" />
                          </FormControl>
                          <FormLabel className="font-normal">Skip this question</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userBackgroundForm.control}
                name="specificAssets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Do you have specific assets you'd like to mention? (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="E.g. real estate, valuable collections, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md">
                <p>You can skip any question you prefer not to answer. This information helps us tailor our service to your needs.</p>
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      )}
      
      {/* Step 9: Identity Verification (KYC) */}
      {step === 9 && (
        <motion.div key="step9" {...fadeInUp}>
          <Form {...kycForm}>
            <form onSubmit={kycForm.handleSubmit(onKycSubmit)} className="space-y-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Identity Verification</h3>
                <p className="text-sm text-muted-foreground">
                  We need to verify your identity to ensure the security of your will and assets.
                </p>
              </div>
              
              <FormField
                control={kycForm.control}
                name="idType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>ID Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="passport" />
                          </FormControl>
                          <FormLabel className="font-normal">Passport</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="nationalId" />
                          </FormControl>
                          <FormLabel className="font-normal">National ID</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="driversLicense" />
                          </FormControl>
                          <FormLabel className="font-normal">Driver's License</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={kycForm.control}
                name="idDocument"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload ID Document</FormLabel>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-willtank-400 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
                        <p className="mb-1 text-sm font-medium">Click or drag to upload</p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG or PDF up to 10MB
                        </p>
                        <Input 
                          type="file" 
                          className="hidden" 
                          id="id-document"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              field.onChange(e.target.files[0].name);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={kycForm.control}
                name="selfie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Take a Selfie</FormLabel>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-willtank-400 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center justify-center">
                        <Camera className="mb-2 h-10 w-10 text-muted-foreground" />
                        <p className="mb-1 text-sm font-medium">Click to take a selfie</p>
                        <p className="text-xs text-muted-foreground">
                          Make sure your face is clearly visible
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4"
                          onClick={() => {
                            field.onChange("selfie_" + new Date().getTime() + ".jpg");
                            toast({
                              title: "Selfie captured",
                              description: "Your selfie has been successfully captured.",
                            });
                          }}
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Take Selfie
                        </Button>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                <p className="text-sm text-muted-foreground flex items-center">
                  <Shield className="mr-2 h-4 w-4 text-willtank-600" />
                  Your ID documents are encrypted and securely stored. They are only used for verification purposes.
                </p>
              </div>
              
              <Button type="submit" className="w-full">
                Verify Identity <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
        </motion.div>
      )}
      
      {/* Step 10: Subscription Selection */}
      {step === 10 && (
        <motion.div key="step10" {...fadeInUp}>
          <Form {...subscriptionForm}>
            <form onSubmit={subscriptionForm.handleSubmit(onSubscriptionSubmit)} className="space-y-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Select Your Plan</h3>
                <p className="text-sm text-muted-foreground">
                  Choose the subscription plan that best fits your needs.
                </p>
              </div>
              
              <FormField
                control={subscriptionForm.control}
                name="plan"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        <FormItem className="col-span-1">
                          <FormControl>
                            <RadioGroupItem value="gold" className="peer sr-only" id="gold" />
                          </FormControl>
                          <label
                            htmlFor="gold"
                            className="flex flex-col h-full p-6 border rounded-xl cursor-pointer peer-data-[state=checked]:border-willtank-600 peer-data-[state=checked]:bg-willtank-50 hover:bg-slate-50 transition-colors"
                          >
                            <div className="mb-3">
                              <span className="inline-block px-2.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 mb-2">
                                Monthly
                              </span>
                              <h3 className="text-lg font-semibold">Gold Plan</h3>
                              <p className="text-3xl font-bold my-2">$15.99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                              <p className="text-sm text-muted-foreground">Perfect for individuals</p>
                            </div>
                            <ul className="space-y-2 text-sm flex-1">
                              <li className="flex items-center">
                                <Check className="h-4 w-4 mr-2 text-willtank-600" /> Standard will templates
                              </li>
                              <li className="flex items-center">
                                <Check className="h-4 w-4 mr-2 text-willtank-600" /> Secure storage
                              </li>
                              <li className="flex items-center">
                                <Check className="h-4 w-4 mr-2 text-willtank-600" /> Basic support
                              </li>
                            </ul>
                          </label>
                        </FormItem>
                        
                        <FormItem className="col-span-1">
                          <FormControl>
                            <RadioGroupItem value="platinum" className="peer sr-only" id="platinum" />
                          </FormControl>
                          <label
                            htmlFor="platinum"
                            className="flex flex-col h-full p-6 border rounded-xl cursor-pointer peer-data-[state=checked]:border-willtank-600 peer-data-[state=checked]:bg-willtank-50 hover:bg-slate-50 transition-colors"
                          >
                            <div className="mb-3">
                              <span className="inline-block px-2.5 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800 mb-2">
                                Annual (Save 20%)
                              </span>
                              <h3 className="text-lg font-semibold">Platinum Plan</h3>
                              <p className="text-3xl font-bold my-2">$191.88<span className="text-sm font-normal text-muted-foreground">/year</span></p>
                              <p className="text-sm text-muted-foreground">For those seeking premium features</p>
                            </div>
                            <ul className="space-y-2 text-sm flex-1">
                              <li className="flex items-center">
                                <Check className="h-4 w-4 mr-2 text-willtank-600" /> Advanced will templates
                              </li>
                              <li className="flex items-center">
                                <Check className="h-4 w-4 mr-2 text-willtank-600" /> Advanced encryption
                              </li>
                              <li className="flex items-center">
                                <Check className="h-4 w-4 mr-2 text-willtank-600" /> Priority support
                              </li>
                              <li className="flex items-center">
                                <Check className="h-4 w-4 mr-2 text-willtank-600" /> Family access options
                              </li>
                            </ul>
                          </label>
                        </FormItem>
                        
                        <FormItem className="col-span-1">
                          <FormControl>
                            <RadioGroupItem value="lifetime" className="peer sr-only" id="lifetime" />
                          </FormControl>
                          <label
                            htmlFor="lifetime"
                            className="flex flex-col h-full p-6 border rounded-xl cursor-pointer peer-data-[state=checked]:border-willtank-600 peer-data-[state=checked]:bg-willtank-50 hover:bg-slate-50 transition-colors"
                          >
                            <div className="mb-3">
                              <span className="inline-block px-2.5 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 mb-2">
                                One-time Payment
                              </span>
                              <h3 className="text-lg font-semibold">Lifetime Plan</h3>
                              <p className="text-3xl font-bold my-2">$399<span className="text-sm font-normal text-muted-foreground"></span></p>
                              <p className="text-sm text-muted-foreground">For long-term peace of mind</p>
                            </div>
                            <ul className="space-y-2 text-sm flex-1">
                              <li className="flex items-center">
                                <Check className="h-4 w-4 mr-2 text-willtank-600" /> All premium templates
                              </li>
                              <li className="flex items-center">
                                <Check className="h-4 w-4 mr-2 text-willtank-600" /> Military-grade encryption
                              </li>
                              <li className="flex items-center">
                                <Check className="h-4 w-4 mr-2 text-willtank-600" /> 24/7 VIP support
                              </li>
                              <li className="flex items-center">
                                <Check className="h-4 w-4 mr-2 text-willtank-600" /> Family & business options
                              </li>
                              <li className="flex items-center">
                                <Check className="h-4 w-4 mr-2 text-willtank-600" /> Lifetime updates
                              </li>
                            </ul>
                          </label>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center mb-3">
                  <CreditCardIcon className="h-5 w-5 mr-2 text-willtank-600" />
                  <h4 className="font-medium">Payment Information</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Your payment will be securely processed by Stripe. We don't store your payment details.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Input type="text" placeholder="Card Number" className="w-full" />
                  </div>
                  <div className="col-span-1">
                    <Input type="text" placeholder="MM/YY" className="w-full" />
                  </div>
                  <div className="col-span-1">
                    <Input type="text" placeholder="CVC" className="w-full" />
                  </div>
                </div>
              </div>
              
              <FormField
                control={subscriptionForm.control}
                name="agreeToTerms"
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
                        I agree to the <a href="/terms" className="text-willtank-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-willtank-600 hover:underline">Privacy Policy</a>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full">
                Complete Sign Up <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
        </motion.div>
      )}
      
      {/* Success Step - Shown briefly after subscription */}
      {step > 10 && (
        <motion.div key="success" {...fadeInUp} className="text-center py-8">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <BadgeCheck className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Account Created Successfully!</h3>
            <p className="text-muted-foreground">
              Your WillTank account has been set up with bank-grade encryption and security.
            </p>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="p-4 bg-willtank-50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center">
                <Key className="h-4 w-4 mr-2" /> Important Security Reminder
              </h4>
              <p className="text-sm">
                Keep your encryption key and recovery phrase in a secure location. They cannot be recovered if lost.
              </p>
            </div>
          </div>
          
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
