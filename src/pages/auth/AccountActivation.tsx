import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Check, CheckCircle, Copy, Download, ChevronRight, Key, Lock, Shield, CreditCard } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { QRCode } from '@/components/ui/QRCode';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/contexts/UserProfileContext';
import * as otpAuth from 'otpauth';

const STEPS = {
  PIN_SETUP: 0,
  BACKGROUND_INFO: 1,
  ENCRYPTION_KEY: 2,
  TWO_FACTOR: 3,
  SUBSCRIPTION: 4,
  COMPLETE: 5
};

const pinSetupSchema = z.object({
  pin: z
    .string()
    .min(6, { message: 'PIN must be 6 digits' })
    .max(6, { message: 'PIN must be 6 digits' }),
  confirmPin: z
    .string()
    .min(6, { message: 'PIN must be 6 digits' })
    .max(6, { message: 'PIN must be 6 digits' }),
}).refine((data) => data.pin === data.confirmPin, {
  message: "PINs don't match",
  path: ['confirmPin'],
});

type PinSetupInputs = z.infer<typeof pinSetupSchema>;

const backgroundInfoSchema = z.object({
  maritalStatus: z.string().min(1, { message: 'Please select your marital status' }),
  hasChildren: z.string().min(1, { message: 'Please select if you have children' }),
  ownsBusiness: z.string().min(1, { message: 'Please select if you own a business' }),
});

type BackgroundInfoInputs = z.infer<typeof backgroundInfoSchema>;

const generateRandomString = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const generateRecoveryPhrase = (): string => {
  const words = [
    'apple', 'banana', 'orange', 'grape', 'kiwi', 'melon', 'pear', 'peach', 'plum', 'cherry',
    'mango', 'lemon', 'lime', 'coconut', 'pineapple', 'fig', 'date', 'apricot', 'blueberry', 'raspberry',
    'strawberry', 'blackberry', 'watermelon', 'cantaloupe', 'honeydew', 'papaya', 'guava', 'lychee', 'pomegranate', 'dragon',
    'star', 'avocado', 'nectarine', 'tangerine', 'clementine', 'mandarin', 'persimmon', 'quince', 'elderberry', 'cranberry',
    'boysenberry', 'gooseberry', 'kumquat', 'durian', 'jackfruit', 'rhubarb', 'passion', 'ugli', 'cameo', 'ambrosia'
  ];
  
  const selectedWords = [];
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    selectedWords.push(words[randomIndex]);
  }
  
  return selectedWords.join(' ');
};

export default function AccountActivation() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useUserProfile();
  const [currentStep, setCurrentStep] = useState(STEPS.PIN_SETUP);
  const [isLoading, setIsLoading] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [recoveryPhrase, setRecoveryPhrase] = useState("");
  const [otpSecret, setOtpSecret] = useState("");
  const [otpUri, setOtpUri] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("free");

  useEffect(() => {
    const generatedKey = generateRandomString(32);
    const generatedPhrase = generateRecoveryPhrase();
    setEncryptionKey(generatedKey);
    setRecoveryPhrase(generatedPhrase);

    const secret = generateRandomString(20);
    setOtpSecret(secret);

    const totp = new otpAuth.TOTP({
      issuer: "WillTank",
      label: user?.email || "user",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: otpAuth.Secret.fromBase32(secret),
    });
    setOtpUri(totp.toString());
  }, [user?.email]);

  const pinSetupForm = useForm<PinSetupInputs>({
    resolver: zodResolver(pinSetupSchema),
    defaultValues: {
      pin: '',
      confirmPin: '',
    },
  });

  const backgroundInfoForm = useForm<BackgroundInfoInputs>({
    resolver: zodResolver(backgroundInfoSchema),
    defaultValues: {
      maritalStatus: '',
      hasChildren: '',
      ownsBusiness: '',
    },
  });

  const handlePinSetupSubmit = async (data: PinSetupInputs) => {
    setIsLoading(true);
    try {
      if (user) {
        const { error } = await supabase.auth.updateUser({
          data: { security_pin: data.pin }
        });

        if (error) throw error;
        
        toast.success("PIN set successfully");
        setCurrentStep(STEPS.BACKGROUND_INFO);
      }
    } catch (error) {
      console.error("Error setting PIN:", error);
      toast.error("Failed to set PIN. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackgroundInfoSubmit = async (data: BackgroundInfoInputs) => {
    setIsLoading(true);
    try {
      if (user) {
        const { error } = await supabase.auth.updateUser({
          data: { 
            marital_status: data.maritalStatus,
            has_children: data.hasChildren,
            owns_business: data.ownsBusiness 
          }
        });

        if (error) throw error;
        
        toast.success("Background information saved");
        setCurrentStep(STEPS.ENCRYPTION_KEY);
      }
    } catch (error) {
      console.error("Error saving background info:", error);
      toast.error("Failed to save background information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEncryptionKeysSubmit = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const { error } = await supabase.auth.updateUser({
          data: { 
            encryption_key_downloaded: true,
            recovery_phrase_generated: true 
          }
        });

        if (error) throw error;
        
        toast.success("Encryption keys saved");
        setCurrentStep(STEPS.TWO_FACTOR);
      }
    } catch (error) {
      console.error("Error saving encryption keys:", error);
      toast.error("Failed to save encryption keys. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setIsVerifying(true);
    
    try {
      const totp = new otpAuth.TOTP({
        issuer: "WillTank",
        label: user?.email || "user",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: otpAuth.Secret.fromBase32(otpSecret),
      });
      
      const isValid = totp.validate({ token: verificationCode, window: 1 });
      
      if (!isValid) {
        toast.error("Invalid verification code. Please try again.");
        return;
      }
      
      if (user) {
        const { error } = await supabase.auth.updateUser({
          data: { 
            two_factor_enabled: true,
            two_factor_secret: otpSecret 
          }
        });

        if (error) throw error;
        
        toast.success("Two-factor authentication enabled");
        setCurrentStep(STEPS.SUBSCRIPTION);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubscriptionSubmit = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const { error } = await supabase.auth.updateUser({
          data: { 
            subscription_plan: selectedPlan,
            account_activated: true
          }
        });

        if (error) throw error;
        
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ 
            activation_complete: true,
            subscription_plan: selectedPlan
          })
          .eq('id', user.id);

        if (profileError) throw profileError;
        
        await refreshProfile();
        
        toast.success("Account successfully activated!");
        setCurrentStep(STEPS.COMPLETE);
      }
    } catch (error) {
      console.error("Error activating account:", error);
      toast.error("Failed to activate account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadKey = () => {
    const element = document.createElement("a");
    const file = new Blob([encryptionKey], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "willtank_encryption_key.txt";
    document.body.appendChild(element);
    element.click();
    
    toast.success("Encryption Key Downloaded");
  };

  const handleDownloadPhrase = () => {
    const element = document.createElement("a");
    const file = new Blob([recoveryPhrase], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "willtank_recovery_phrase.txt";
    document.body.appendChild(element);
    element.click();
    
    toast.success("Recovery Phrase Downloaded");
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Account Activation</h1>
          <p className="text-gray-600 mt-2">Complete these steps to activate your account</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {Object.values(STEPS).filter(step => typeof step === 'number').map((step) => (
              <div 
                key={step} 
                className="flex flex-col items-center"
              >
                <div 
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    currentStep > step
                      ? 'bg-green-100 text-green-600 border border-green-200'
                      : currentStep === step
                      ? 'bg-willtank-100 text-willtank-600 border border-willtank-200'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {currentStep > step ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span>{step + 1}</span>
                  )}
                </div>
                <div className="text-xs mt-2 text-center">
                  {step === STEPS.PIN_SETUP && "PIN Setup"}
                  {step === STEPS.BACKGROUND_INFO && "Background"}
                  {step === STEPS.ENCRYPTION_KEY && "Security Keys"}
                  {step === STEPS.TWO_FACTOR && "2FA"}
                  {step === STEPS.SUBSCRIPTION && "Plan"}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 h-1 bg-gray-100 rounded-full">
            <div 
              className="h-full bg-willtank-500 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / (Object.keys(STEPS).length / 2 - 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {currentStep === STEPS.PIN_SETUP && (
          <Card>
            <CardHeader>
              <CardTitle>Set Your Security PIN</CardTitle>
              <CardDescription>
                This 6-digit PIN will be used to secure your account and verify important actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...pinSetupForm}>
                <form onSubmit={pinSetupForm.handleSubmit(handlePinSetupSubmit)} className="space-y-6">
                  <FormField
                    control={pinSetupForm.control}
                    name="pin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enter 6-digit PIN</FormLabel>
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
                    control={pinSetupForm.control}
                    name="confirmPin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm 6-digit PIN</FormLabel>
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
                  
                  <div className="bg-amber-50 p-4 rounded-md border border-amber-100">
                    <div className="flex gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-800">
                          Remember this PIN carefully. You'll need it to access important functions within your account.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Continue"}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {currentStep === STEPS.BACKGROUND_INFO && (
          <Card>
            <CardHeader>
              <CardTitle>Background Information</CardTitle>
              <CardDescription>
                Help us personalize your experience by sharing some basic information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...backgroundInfoForm}>
                <form onSubmit={backgroundInfoForm.handleSubmit(handleBackgroundInfoSubmit)} className="space-y-6">
                  <FormField
                    control={backgroundInfoForm.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Marital Status</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="single" />
                              </FormControl>
                              <FormLabel className="font-normal">Single</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="married" />
                              </FormControl>
                              <FormLabel className="font-normal">Married</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="divorced" />
                              </FormControl>
                              <FormLabel className="font-normal">Divorced</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="widowed" />
                              </FormControl>
                              <FormLabel className="font-normal">Widowed</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="prefer_not_to_say" />
                              </FormControl>
                              <FormLabel className="font-normal">Prefer not to say</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={backgroundInfoForm.control}
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
                                <RadioGroupItem value="prefer_not_to_say" />
                              </FormControl>
                              <FormLabel className="font-normal">Prefer not to say</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={backgroundInfoForm.control}
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
                                <RadioGroupItem value="prefer_not_to_say" />
                              </FormControl>
                              <FormLabel className="font-normal">Prefer not to say</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Continue"}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {currentStep === STEPS.ENCRYPTION_KEY && (
          <Card>
            <CardHeader>
              <CardTitle>Setup Security Keys</CardTitle>
              <CardDescription>
                Download your encryption key and recovery phrase. These are essential for securing your digital legacy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Key className="h-5 w-5 text-slate-600 mr-2" />
                    <h3 className="font-medium">Encryption Key</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopy(encryptionKey, "Encryption Key")}
                    >
                      <Copy className="h-4 w-4 mr-1" /> Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDownloadKey}
                    >
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                  </div>
                </div>
                <div className="bg-white p-3 rounded border border-slate-200 font-mono text-sm break-all">
                  {encryptionKey}
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 text-slate-600 mr-2" />
                    <h3 className="font-medium">Recovery Phrase</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopy(recoveryPhrase, "Recovery Phrase")}
                    >
                      <Copy className="h-4 w-4 mr-1" /> Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDownloadPhrase}
                    >
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                  </div>
                </div>
                <div className="bg-white p-3 rounded border border-slate-200 font-mono text-sm">
                  {recoveryPhrase}
                </div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-md border border-amber-100">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 font-semibold mb-1">
                      Important Security Information
                    </p>
                    <ul className="text-sm text-amber-800 list-disc pl-4 space-y-1">
                      <li>Store these keys in a secure location.</li>
                      <li>Never share them with anyone.</li>
                      <li>You'll need these to recover your account if you lose access.</li>
                      <li>WillTank cannot recover these keys if lost.</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleEncryptionKeysSubmit} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "I've Saved My Keys"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === STEPS.TWO_FACTOR && (
          <Card>
            <CardHeader>
              <CardTitle>Setup Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account by setting up two-factor authentication.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-md border border-slate-200">
                <div className="mb-4">
                  <QRCode 
                    value={otpUri}
                    size={200}
                    color="#000000"
                    backgroundColor="#ffffff"
                  />
                </div>
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">Scan this QR code with your authenticator app</p>
                  <p className="text-xs text-gray-500 mt-1">(Google Authenticator, Authy, etc.)</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleCopy(otpSecret, "Secret Key")}
                  >
                    <Copy className="h-4 w-4 mr-1" /> Copy Secret Key
                  </Button>
                </div>
                <div className="w-full mt-4">
                  <p className="text-sm text-center mb-2">Enter the 6-digit code from your authenticator app</p>
                  <div className="flex justify-center mb-4">
                    <InputOTP 
                      maxLength={6}
                      value={verificationCode}
                      onChange={setVerificationCode}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleVerifyOTP} 
                className="w-full"
                disabled={verificationCode.length < 6 || isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify & Continue"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              
              <div className="bg-amber-50 p-4 rounded-md border border-amber-100">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800">
                      Two-factor authentication adds an extra layer of security to your account. 
                      You'll need your authenticator app to access your account in the future.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === STEPS.SUBSCRIPTION && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Plan</CardTitle>
              <CardDescription>
                Select a subscription plan that best fits your needs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div 
                  className={`p-4 rounded-md border ${
                    selectedPlan === "free" 
                      ? "border-willtank-500 bg-willtank-50" 
                      : "border-gray-200 bg-white"
                  } cursor-pointer hover:border-willtank-300`}
                  onClick={() => setSelectedPlan("free")}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Free Plan</h3>
                    <div className="flex items-center">
                      <span className="text-lg font-bold">$0</span>
                      <span className="text-sm text-gray-500 ml-1">/mo</span>
                    </div>
                  </div>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Basic will creation</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Limited document storage</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Email support</span>
                    </li>
                  </ul>
                </div>
                
                <div 
                  className={`p-4 rounded-md border ${
                    selectedPlan === "basic" 
                      ? "border-willtank-500 bg-willtank-50" 
                      : "border-gray-200 bg-white"
                  } cursor-pointer hover:border-willtank-300`}
                  onClick={() => setSelectedPlan("basic")}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Basic Plan</h3>
                    <div className="flex items-center">
                      <span className="text-lg font-bold">$9.99</span>
                      <span className="text-sm text-gray-500 ml-1">/mo</span>
                    </div>
                  </div>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Advanced will creation</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>5GB document storage</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Priority email support</span>
                    </li>
                  </ul>
                </div>
                
                <div 
                  className={`p-4 rounded-md border ${
                    selectedPlan === "premium" 
                      ? "border-willtank-500 bg-willtank-50" 
                      : "border-gray-200 bg-white"
                  } cursor-pointer hover:border-willtank-300`}
                  onClick={() => setSelectedPlan("premium")}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Premium Plan</h3>
                    <div className="flex items-center">
                      <span className="text-lg font-bold">$19.99</span>
                      <span className="text-sm text-gray-500 ml-1">/mo</span>
                    </div>
                  </div>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Comprehensive will & trust creation</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Unlimited document storage</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>24/7 priority support</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Legal document review</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <Button 
                onClick={handleSubscriptionSubmit} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : `Continue with ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan`}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  You can change your plan anytime from the billing settings.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === STEPS.COMPLETE && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Account Activated!</CardTitle>
              <CardDescription>
                Your account has been successfully activated and is ready to use.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <p>
                Thank you for completing the activation process. You now have access to all features of your plan.
              </p>
              
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                <h3 className="font-medium mb-2">Next Steps</h3>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>Create your first will document</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>Add executors to your estate</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>Explore other features in your dashboard</span>
                  </li>
                </ul>
              </div>
              
              <Button 
                onClick={handleComplete} 
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
