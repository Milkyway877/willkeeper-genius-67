
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

// Import step components
import { UserDetailsStep } from './steps/UserDetailsStep';
import { PinSetupStep } from './steps/PinSetupStep';
import { TanKeyStep } from './steps/TanKeyStep';
import { RecoveryPhraseStep } from './steps/RecoveryPhraseStep';
import { UserBackgroundStep } from './steps/UserBackgroundStep';
import { AuthenticatorStep } from './steps/AuthenticatorStep';
import { LocationStep } from './steps/LocationStep';
import { TemplateStep } from './steps/TemplateStep';
import { KycStep } from './steps/KycStep';
import { SubscriptionStep } from './steps/SubscriptionStep';
import { SuccessStep } from './steps/SuccessStep';

// Import types and Stepper
import { Stepper } from './Stepper';
import { 
  SignUpStep, 
  UserDetailsInputs, 
  PinInputs, 
  RecoveryPhraseInputs, 
  UserBackgroundInputs, 
  LocationInputs, 
  TemplateInputs, 
  KycInputs, 
  SubscriptionInputs
} from './SignUpSchemas';

export function SignUpForm() {
  // State management for multi-step form
  const [step, setStep] = useState<SignUpStep>(1);
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
    setStep(5);
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
    
    setStep(11);
    
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  return (
    <div className="w-full">
      <Stepper currentStep={step} totalSteps={10} />
      
      {/* Step 1: User Details */}
      {step === 1 && <UserDetailsStep onNext={onUserDetailsSubmit} />}
      
      {/* Step 2: PIN Setup */}
      {step === 2 && <PinSetupStep onNext={onPinSubmit} />}
      
      {/* Step 3: TanKey Generation */}
      {step === 3 && <TanKeyStep tanKey={tanKey} onNext={onTanKeySubmit} />}
      
      {/* Step 4: Recovery Phrase */}
      {step === 4 && (
        <RecoveryPhraseStep 
          recoveryPhrase={recoveryPhrase} 
          verificationIndices={verificationIndices} 
          onNext={onRecoveryPhraseSubmit} 
        />
      )}
      
      {/* Step 5: User Background */}
      {step === 5 && <UserBackgroundStep onNext={onUserBackgroundSubmit} />}
      
      {/* Step 6: Authenticator Setup */}
      {step === 6 && (
        <AuthenticatorStep 
          authenticatorKey={authenticatorKey} 
          qrCodeUrl={qrCodeUrl} 
          onNext={onAuthenticatorSubmit} 
        />
      )}
      
      {/* Step 7: Location Setup */}
      {step === 7 && (
        <LocationStep 
          defaultLocation={location!} 
          onNext={onLocationSubmit} 
        />
      )}
      
      {/* Step 8: Template Selection */}
      {step === 8 && (
        <TemplateStep 
          willPreview={willPreview} 
          onNext={onTemplateSubmit} 
        />
      )}
      
      {/* Step 9: Identity Verification (KYC) */}
      {step === 9 && <KycStep onNext={onKycSubmit} />}
      
      {/* Step 10: Subscription Selection */}
      {step === 10 && <SubscriptionStep onNext={onSubscriptionSubmit} />}
      
      {/* Success Step - Shown briefly after subscription */}
      {step === 11 && <SuccessStep />}
    </div>
  );
}
