
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { fadeInUp } from '@/components/auth/animations';
import { toast } from '@/hooks/use-toast';
import { useToast } from '@/hooks/use-toast';

enum STEPS {
  VERIFY_EMAIL = 'verify_email',
  PROFILE = 'profile',
  SECURITY_QUESTIONS = 'security_questions',
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
          <p className="text-xs text-muted-foreground">Available in your security settings after activation</p>
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
  
  const [recoveryKey, setRecoveryKey] = useState('');
  
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  
  useEffect(() => {
    setRecoveryKey(getRecoveryKey());
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
        }
      } catch (error) {
        console.error('Error getting user email:', error);
      }
    };
    
    getUserEmail();
  }, []);

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
      setCurrentStep(STEPS.SUBSCRIPTION);
      setIsLoading(false);
      
      toast({
        title: "Security questions saved",
        description: "Your security questions have been saved."
      });
    }, 1500);
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
                              <span className="font-bold">{plan.price}{plan.id !== 'free' ? (billingCycle === 'monthly' ? '/mo' : '/yr') : ''}</span>
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
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                      Configure 2FA in your security settings
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
