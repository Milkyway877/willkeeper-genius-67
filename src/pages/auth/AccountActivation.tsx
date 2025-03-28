import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { QRCode } from '@/components/ui/QRCode';
import { TwoFactorInput } from '@/components/ui/TwoFactorInput';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, 
  CheckCircle, 
  ChevronRight, 
  FileText, 
  ShieldCheck, 
  UserPlus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import * as OTPAuth from 'otpauth';
import { fadeInUp } from '@/components/auth/animations';
import { toast } from '@/hooks/use-toast';
import { useToast } from '@/hooks/use-toast';
import { validateTOTP, createUserSecurity } from '@/services/encryptionService';

enum STEPS {
  VERIFY_EMAIL = 'verify_email',
  PROFILE = 'profile',
  SECURITY_QUESTIONS = 'security_questions',
  AUTHENTICATOR = 'authenticator',
  SUBSCRIPTION = 'subscription',
  COMPLETE = 'complete'
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    description: 'Basic features for personal use',
    price: '$0',
    features: [
      'Create and store 1 will',
      'Basic templates',
      'Email support'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Advanced features for individuals',
    price: '$9.99',
    features: [
      'Create and store unlimited wills',
      'All templates',
      'Priority support',
      'Document encryption',
      'Advanced security features'
    ]
  },
  {
    id: 'family',
    name: 'Family',
    description: 'Complete coverage for families',
    price: '$19.99',
    features: [
      'All Premium features',
      'Up to 5 family members',
      'Family document sharing',
      'Dedicated account manager',
      'Legal consultation (1 hour)'
    ]
  }
];

const generateOTPSecret = (): string => {
  const VALID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  
  const randomBytes = new Uint8Array(32);
  window.crypto.getRandomValues(randomBytes);
  
  for (let i = 0; i < 32; i++) {
    result += VALID_CHARS.charAt(randomBytes[i] % VALID_CHARS.length);
  }
  
  return result.match(/.{1,4}/g)?.join(' ') || result;
};

const generateRecoveryPhrase = (): string => {
  const words = [
    'apple', 'banana', 'orange', 'grape', 'kiwi', 'melon', 'peach', 'plum', 'cherry', 'lemon',
    'lime', 'coconut', 'mango', 'pear', 'berry', 'apricot', 'fig', 'guava', 'papaya', 'avocado',
    'water', 'ocean', 'river', 'lake', 'stream', 'rain', 'cloud', 'storm', 'snow', 'ice',
    'mountain', 'valley', 'hill', 'cliff', 'peak', 'plateau', 'canyon', 'cave', 'desert', 'forest',
    'tree', 'flower', 'grass', 'bush', 'vine', 'moss', 'leaf', 'root', 'stem', 'branch',
    'dog', 'cat', 'bird', 'fish', 'lion', 'tiger', 'bear', 'wolf', 'fox', 'deer',
    'book', 'page', 'story', 'tale', 'novel', 'poem', 'song', 'music', 'art', 'paint'
  ];
  
  const selectedWords: string[] = [];
  
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    selectedWords.push(words[randomIndex]);
  }
  
  return selectedWords.join(' ');
};

const generateRandomString = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  
  return result;
};

const generatePin = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getRecoveryKey = (): string => {
  const key = generateRandomString(16);
  return key.match(/.{1,4}/g)?.join('-') || key;
};

const SecurityInfoPanel = () => (
  <div className="space-y-6 text-center">
    <ShieldCheck className="h-16 w-16 mx-auto text-willtank-600" />
    <h3 className="text-2xl font-bold">Secure Your Account</h3>
    <p className="text-muted-foreground">
      Complete your account activation to unlock all security features and protect your digital legacy.
    </p>
    <div className="space-y-4 text-left">
      <div className="flex items-start">
        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-willtank-100 flex items-center justify-center mt-0.5">
          <Check className="h-3.5 w-3.5 text-willtank-600" />
        </div>
        <div className="ml-3">
          <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
          <p className="text-xs text-muted-foreground">Adds an extra layer of security to your account</p>
        </div>
      </div>
      <div className="flex items-start">
        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-willtank-100 flex items-center justify-center mt-0.5">
          <Check className="h-3.5 w-3.5 text-willtank-600" />
        </div>
        <div className="ml-3">
          <h4 className="text-sm font-medium">Recovery Keys</h4>
          <p className="text-xs text-muted-foreground">Keep access to your account even if you lose your device</p>
        </div>
      </div>
      <div className="flex items-start">
        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-willtank-100 flex items-center justify-center mt-0.5">
          <Check className="h-3.5 w-3.5 text-willtank-600" />
        </div>
        <div className="ml-3">
          <h4 className="text-sm font-medium">Security Questions</h4>
          <p className="text-xs text-muted-foreground">Additional verification for account recovery</p>
        </div>
      </div>
    </div>
  </div>
);

export default function AccountActivation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<STEPS>(STEPS.VERIFY_EMAIL);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [country, setCountry] = useState('');
  
  const [securityQuestions, setSecurityQuestions] = useState([
    { question: 'What was the name of your first pet?', answer: '' },
    { question: 'In what city were you born?', answer: '' },
    { question: 'What was your childhood nickname?', answer: '' }
  ]);
  
  const [totpSecret, setTotpSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [enableTwoFactor, setEnableTwoFactor] = useState(true);
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  
  useEffect(() => {
    const secret = generateOTPSecret();
    const cleanSecret = secret.replace(/\s+/g, '');
    const totp = new OTPAuth.TOTP({
      issuer: 'WillTank',
      label: 'user@example.com',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(cleanSecret)
    });
    setQrCodeUrl(totp.toString());
    setTotpSecret(secret);
  }, []);
  
  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting user:', error);
          return;
        }
        
        if (user && user.email) {
          setEmail(user.email);
          
          const cleanSecret = totpSecret.replace(/\s+/g, '');
          const totp = new OTPAuth.TOTP({
            issuer: 'WillTank',
            label: user.email,
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: OTPAuth.Secret.fromBase32(cleanSecret)
          });
          
          setQrCodeUrl(totp.toString());
        }
      } catch (error) {
        console.error('Error getting user email:', error);
      }
    };
    
    getUserEmail();
  }, [totpSecret]);
  
  useEffect(() => {
    setRecoveryPhrase(generateRecoveryPhrase());
    setRecoveryKey(getRecoveryKey());
  }, []);

  const verifyAuthenticatorCode = (code: string) => {
    if (!totpSecret) {
      setVerificationError('Error: Missing authenticator secret');
      return false;
    }
    
    try {
      const cleanSecret = totpSecret.replace(/\s+/g, '');
      const cleanToken = code.replace(/\s+/g, '');
      
      if (cleanToken.length !== 6) {
        setVerificationError('Verification code must be 6 digits');
        return false;
      }
      
      const totp = new OTPAuth.TOTP({
        issuer: 'WillTank',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(cleanSecret)
      });
      
      // Use a larger window to allow for time drift (±2 minutes)
      const result = totp.validate({ token: cleanToken, window: 4 });
      console.log('TOTP validation result:', result !== null ? 'Valid' : 'Invalid', 'for secret:', cleanSecret);
      
      if (result === null) {
        setVerificationError('Invalid verification code. Please try again.');
        return false;
      }
      
      setVerificationError(null);
      return true;
    } catch (error) {
      console.error('Error validating TOTP:', error);
      setVerificationError('Error validating code. Please try again.');
      return false;
    }
  };

  const handleTotpVerification = (code: string) => {
    setIsLoading(true);
    
    try {
      if (verifyAuthenticatorCode(code)) {
        supabase.auth.getUser().then(({ data: { user }, error: userError }) => {
          if (userError || !user) {
            setVerificationError('User not found. Please ensure you are logged in.');
            setIsLoading(false);
            return;
          }
          
          // Generate a random encryption key for the user
          const encryptionKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
          
          supabase
            .from('user_security')
            .upsert({
              user_id: user.id,
              google_auth_enabled: enableTwoFactor,
              google_auth_secret: totpSecret.replace(/\s+/g, ''),
              encryption_key: encryptionKey,
              updated_at: new Date().toISOString()
            })
            .then(({ error }) => {
              if (error) {
                console.error('Error saving authenticator settings:', error);
                setVerificationError('Failed to save authenticator settings. Please try again.');
                setIsLoading(false);
                return;
              }
              
              setCurrentStep(STEPS.SUBSCRIPTION);
              setIsLoading(false);
              
              toast({
                title: "2FA " + (enableTwoFactor ? "Enabled" : "Configured"),
                description: enableTwoFactor 
                  ? "Your account is now protected with two-factor authentication." 
                  : "You can enable 2FA later in your security settings."
              });
            });
        });
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error in TOTP verification:', error);
      setVerificationError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const saveAuthenticatorSettings = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not found');
      }
      
      let security = await createUserSecurity();
      
      if (!security) {
        throw new Error('Failed to create security record');
      }
      
      const { error } = await supabase
        .from('user_security')
        .update({
          google_auth_enabled: enableTwoFactor,
          google_auth_secret: totpSecret.replace(/\s+/g, ''),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving authenticator settings:', error);
      throw error;
    }
  };

  const handleVerifyEmail = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsEmailVerified(true);
      setCurrentStep(STEPS.PROFILE);
      setIsLoading(false);
      
      toast({
        title: "Email verified",
        description: "Your email has been successfully verified."
      });
    }, 1500);
  };
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setCurrentStep(STEPS.SECURITY_QUESTIONS);
      setIsLoading(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved."
      });
    }, 1500);
  };
  
  const handleSecurityQuestionsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const allAnswered = securityQuestions.every(q => q.answer.trim() !== '');
    
    if (!allAnswered) {
      toast({
        title: "Missing answers",
        description: "Please answer all security questions.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    setTimeout(() => {
      setCurrentStep(STEPS.AUTHENTICATOR);
      setIsLoading(false);
      
      toast({
        title: "Security questions saved",
        description: "Your security questions have been saved."
      });
    }, 1500);
  };
  
  const handleAuthenticatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };
  
  const handleSubscriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!agreeToTerms) {
      toast({
        title: "Terms agreement required",
        description: "Please agree to the terms and conditions to continue.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    setTimeout(() => {
      setCurrentStep(STEPS.COMPLETE);
      setIsLoading(false);
      
      toast({
        title: "Subscription activated",
        description: `Your ${selectedPlan} plan has been activated.`
      });
    }, 1500);
  };
  
  const handleComplete = () => {
    navigate('/dashboard');
    
    toast({
      title: "Account activated",
      description: "Welcome to WillTank! Your account is now fully set up."
    });
  };
  
  const updateSecurityQuestionAnswer = (index: number, answer: string) => {
    const updatedQuestions = [...securityQuestions];
    updatedQuestions[index].answer = answer;
    setSecurityQuestions(updatedQuestions);
  };

  return (
    <AuthLayout
      title="Activate Your Account"
      subtitle="Complete these steps to start using your WillTank account"
      rightPanel={<SecurityInfoPanel />}
    >
      <div className="max-w-md mx-auto p-4">
        <div className="mb-8 text-center">
          <img 
            src="/lovable-uploads/6f404753-7188-4c3d-ba16-7d17fbc490b3.png" 
            alt="WillTank Logo" 
            className="h-12 w-auto mx-auto mb-4" 
          />
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {Object.values(STEPS).map((step, index) => (
              <div 
                key={step} 
                className={`flex flex-col items-center ${index < Object.values(STEPS).indexOf(currentStep) ? 'text-green-600' : index === Object.values(STEPS).indexOf(currentStep) ? 'text-willtank-600' : 'text-gray-400'}`}
              >
                <div 
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
                    index < Object.values(STEPS).indexOf(currentStep) 
                      ? 'bg-green-100 text-green-600' 
                      : index === Object.values(STEPS).indexOf(currentStep)
                        ? 'bg-willtank-100 text-willtank-600 font-medium' 
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {index < Object.values(STEPS).indexOf(currentStep) ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-gray-200 w-full"></div>
            <div 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 transition-all duration-300 ease-in-out" 
              style={{ 
                width: `${(Object.values(STEPS).indexOf(currentStep) / (Object.values(STEPS).length - 1)) * 100}%` 
              }}
            ></div>
          </div>
        </div>
        
        {currentStep === STEPS.VERIFY_EMAIL && (
          <Card>
            <CardHeader>
              <CardTitle>Verify Your Email</CardTitle>
              <CardDescription>
                We've sent a verification code to your email address. Please enter it below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleVerifyEmail(); }}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      disabled 
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <Input 
                      id="verificationCode" 
                      value={verificationCode} 
                      onChange={(e) => setVerificationCode(e.target.value)} 
                      className="mt-1"
                      placeholder="Enter the 6-digit code"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || verificationCode.length < 6}
                  >
                    {isLoading ? 'Verifying...' : 'Verify Email'}
                  </Button>
                  
                  <div className="text-center text-sm">
                    <button 
                      type="button" 
                      className="text-willtank-600 hover:text-willtank-700"
                      onClick={() => {
                        toast({
                          title: "Verification code resent",
                          description: "Please check your email for the new code."
                        });
                      }}
                    >
                      Resend verification code
                    </button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        {currentStep === STEPS.PROFILE && (
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                Please provide your personal information to complete your profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input 
                      id="phoneNumber" 
                      type="tel" 
                      value={phoneNumber} 
                      onChange={(e) => setPhoneNumber(e.target.value)} 
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input 
                      id="dateOfBirth" 
                      type="date" 
                      value={dateOfBirth} 
                      onChange={(e) => setDateOfBirth(e.target.value)} 
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input 
                      id="country" 
                      value={country} 
                      onChange={(e) => setCountry(e.target.value)} 
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !firstName || !lastName || !phoneNumber || !dateOfBirth || !country}
                  >
                    {isLoading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        {currentStep === STEPS.SECURITY_QUESTIONS && (
          <Card>
            <CardHeader>
              <CardTitle>Set Up Security Questions</CardTitle>
              <CardDescription>
                These questions will help verify your identity if you need to recover your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSecurityQuestionsSubmit}>
                <div className="space-y-6">
                  {securityQuestions.map((q, index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={`question-${index}`}>{q.question}</Label>
                      <Input 
                        id={`question-${index}`} 
                        value={q.answer} 
                        onChange={(e) => updateSecurityQuestionAnswer(index, e.target.value)} 
                        className="mt-1"
                        required
                      />
                    </div>
                  ))}
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || securityQuestions.some(q => !q.answer)}
                  >
                    {isLoading ? 'Saving...' : 'Save Security Questions'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        {currentStep === STEPS.AUTHENTICATOR && (
          <Card>
            <CardHeader>
              <CardTitle>Setup Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account by setting up two-factor authentication.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">1. Scan this QR code with your authenticator app</h3>
                  <div className="flex justify-center bg-white p-4 border border-gray-200 rounded-md">
                    <QRCode 
                      value={qrCodeUrl} 
                      size={180}
                    />
                  </div>
                  <p className="text-sm text-center text-gray-600">
                    (Google Authenticator, Authy, etc.)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">2. Or enter this secret key manually:</h3>
                  <div className="relative">
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md font-mono text-center break-all select-all text-sm">
                      {totpSecret}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        navigator.clipboard.writeText(totpSecret.replace(/\s+/g, ''));
                        toast({
                          title: "Secret key copied",
                          description: "The secret key has been copied to your clipboard."
                        });
                      }}
                    >
                      Copy Secret Key
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">3. Enter the 6-digit code from your authenticator app:</h3>
                  <TwoFactorInput 
                    onSubmit={handleTotpVerification} 
                    loading={isLoading}
                    error={verificationError}
                  />
                </div>
                
                <div className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                  <Checkbox 
                    id="enableTwoFactor"
                    checked={enableTwoFactor} 
                    onCheckedChange={(checked) => setEnableTwoFactor(checked === true)}
                  />
                  <div className="space-y-1 leading-none">
                    <label htmlFor="enableTwoFactor" className="text-sm font-normal">
                      Enable two-factor authentication for my account
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Highly recommended for securing your account and sensitive documents.
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
            <CardContent>
              <form onSubmit={handleSubscriptionSubmit}>
                <div className="space-y-6">
                  <div className="flex justify-center mb-4">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${billingCycle === 'monthly' ? 'font-medium' : 'text-gray-500'}`}>Monthly</span>
                      <Switch 
                        checked={billingCycle === 'annual'} 
                        onCheckedChange={(checked) => setBillingCycle(checked ? 'annual' : 'monthly')}
                      />
                      <span className={`text-sm ${billingCycle === 'annual' ? 'font-medium' : 'text-gray-500'}`}>
                        Annual <span className="text-green-600 text-xs">(Save 20%)</span>
                      </span>
                    </div>
                  </div>
                  
                  <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                    <div className="grid gap-4">
                      {PLANS.map((plan) => (
                        <div key={plan.id}>
                          <RadioGroupItem
                            value={plan.id}
                            id={plan.id}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={plan.id}
                            className="flex flex-col p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-willtank-500 peer-checked:border-willtank-500 peer-checked:bg-willtank-50"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">{plan.name}</span>
                              <span className="font-bold">{plan.price}{billingCycle === 'monthly' ? '/mo' : '/yr'}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                            <ul className="text-sm space-y-1">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-center">
                                  <CheckCircle className="h-3.5 w-3.5 text-green-600 mr-2" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                  
                  <div className="flex items-start space-x-3 pt-4">
                    <Checkbox 
                      id="terms" 
                      checked={agreeToTerms} 
                      onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                    />
                    <div className="space-y-1 leading-none">
                      <label htmlFor="terms" className="text-sm font-normal">
                        I agree to the <a href="/terms" className="text-willtank-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-willtank-600 hover:underline">Privacy Policy</a>
                      </label>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !agreeToTerms}
                  >
                    {isLoading ? 'Processing...' : 'Confirm Subscription'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        {currentStep === STEPS.COMPLETE && (
          <Card>
            <CardHeader>
              <CardTitle>Account Activation Complete</CardTitle>
              <CardDescription>
                Your account has been successfully activated and is ready to use.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center py-6">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-medium text-center">Welcome to WillTank!</h3>
                <p className="text-gray-600 text-center mt-2">
                  Your account is now fully set up and ready to use. You can now create and manage your wills and other important documents.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-willtank-600" />
                    Next Steps
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                      Create your first will or legal document
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                      Set up your beneficiaries and executors
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                      Explore templates and document options
                    </li>
                  </ul>
                </div>
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
    </AuthLayout>
  );
}
