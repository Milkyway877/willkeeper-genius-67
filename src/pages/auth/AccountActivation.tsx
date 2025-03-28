
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { TwoFactorInput } from '@/components/ui/TwoFactorInput';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { generateTOTPSecret, setup2FA } from '@/services/encryptionService';
import { 
  Shield, 
  Key, 
  Download, 
  Smartphone, 
  CreditCard, 
  UserCircle,
  CheckCircle,
  AlertTriangle,
  Lock,
  ArrowRight
} from 'lucide-react';
import QRCode from '@/components/ui/QRCode';

export default function AccountActivation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, refreshProfile } = useUserProfile();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [setupPin, setSetupPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [background, setBackground] = useState({
    occupation: '',
    reason: '',
    assets: ''
  });
  const [encryptionKey, setEncryptionKey] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [totpError, setTotpError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  // Generate encryption key and recovery phrase
  useEffect(() => {
    if (currentStep === 2) {
      generateEncryptionKeyAndPhrase();
    }
  }, [currentStep]);
  
  // Generate TOTP secret when reaching the 2FA step
  useEffect(() => {
    if (currentStep === 3) {
      generateTOTPSecretKey();
    }
  }, [currentStep]);
  
  const generateEncryptionKeyAndPhrase = () => {
    // Generate a random encryption key (32 bytes, hex encoded)
    const encKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Generate a recovery phrase (12 random words)
    const wordList = [
      'apple', 'banana', 'carrot', 'dolphin', 'elephant', 'falcon',
      'giraffe', 'house', 'igloo', 'jacket', 'kangaroo', 'lemon',
      'monkey', 'noodle', 'orange', 'penguin', 'quasar', 'rabbit',
      'sunshine', 'tiger', 'umbrella', 'violin', 'walnut', 'xylophone',
      'zebra', 'airplane', 'balloon', 'castle', 'dragon', 'eagle',
      'forest', 'garden', 'hammer', 'island', 'jungle', 'kingdom',
      'lantern', 'mountain', 'notebook', 'octopus', 'planet', 'quantum',
      'rainbow', 'sandwich', 'treasure', 'unicorn', 'volcano', 'waterfall',
      'xylophone', 'yogurt', 'zeppelin'
    ];
    
    // Select 12 random words
    const randomWords = Array(12).fill(0).map(() => {
      const randomIndex = Math.floor(Math.random() * wordList.length);
      return wordList[randomIndex];
    });
    
    const phrase = randomWords.join(' ');
    
    setEncryptionKey(encKey);
    setRecoveryPhrase(phrase);
  };
  
  const generateTOTPSecretKey = async () => {
    try {
      setLoading(true);
      const { secret, qrCodeUrl } = await generateTOTPSecret();
      setTotpSecret(secret);
      setQrCodeUrl(qrCodeUrl);
    } catch (error) {
      console.error("Error generating TOTP secret:", error);
      toast({
        title: "Error",
        description: "Failed to generate authentication secret. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePinSetup = () => {
    if (setupPin.length !== 6) {
      setPinError("PIN must be 6 digits");
      return;
    }
    
    if (setupPin !== confirmPin) {
      setPinError("PINs do not match");
      return;
    }
    
    setPinError(null);
    setCurrentStep(1);
  };
  
  const handleBackgroundSubmit = () => {
    if (!background.occupation || !background.reason) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentStep(2);
  };
  
  const handleDownloadKey = () => {
    // Create files for download
    const encryptionKeyBlob = new Blob([encryptionKey], { type: 'text/plain' });
    const recoveryPhraseBlob = new Blob([recoveryPhrase], { type: 'text/plain' });
    
    // Create download links
    const encryptionKeyURL = URL.createObjectURL(encryptionKeyBlob);
    const recoveryPhraseURL = URL.createObjectURL(recoveryPhraseBlob);
    
    // Create and trigger download links
    const encryptionKeyLink = document.createElement('a');
    encryptionKeyLink.href = encryptionKeyURL;
    encryptionKeyLink.download = 'willtank_encryption_key.txt';
    document.body.appendChild(encryptionKeyLink);
    encryptionKeyLink.click();
    
    const recoveryPhraseLink = document.createElement('a');
    recoveryPhraseLink.href = recoveryPhraseURL;
    recoveryPhraseLink.download = 'willtank_recovery_phrase.txt';
    document.body.appendChild(recoveryPhraseLink);
    recoveryPhraseLink.click();
    
    // Clean up
    document.body.removeChild(encryptionKeyLink);
    document.body.removeChild(recoveryPhraseLink);
    URL.revokeObjectURL(encryptionKeyURL);
    URL.revokeObjectURL(recoveryPhraseURL);
    
    // Store the encryption key and recovery phrase in user_security
    storeEncryptionKey(encryptionKey);
    
    // Move to next step
    setCurrentStep(3);
  };
  
  const storeEncryptionKey = async (key: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Check if user_security record exists
      const { data: existingRecord, error: checkError } = await supabase
        .from('user_security')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (checkError) {
        throw checkError;
      }
      
      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_security')
          .update({
            encryption_key: key,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
          
        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('user_security')
          .insert({
            user_id: user.id,
            encryption_key: key,
            google_auth_enabled: false,
            google_auth_secret: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (insertError) {
          throw insertError;
        }
      }
    } catch (error) {
      console.error("Error storing encryption key:", error);
      toast({
        title: "Error",
        description: "Failed to store your encryption key. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleSetup2FA = async () => {
    if (verificationCode.length !== 6) {
      setTotpError("Verification code must be 6 digits");
      return;
    }
    
    try {
      setLoading(true);
      setTotpError(null);
      
      const { success, recoveryCodes } = await setup2FA(verificationCode);
      
      if (success) {
        toast({
          title: "2FA Enabled",
          description: "Two-factor authentication has been successfully set up.",
        });
        setCurrentStep(4);
      } else {
        setTotpError("Invalid verification code. Please try again.");
      }
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      setTotpError("Failed to set up two-factor authentication. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectPlan = (plan: string) => {
    setSelectedPlan(plan);
  };
  
  const handleCompletePlanSelection = async () => {
    if (!selectedPlan) {
      toast({
        title: "Plan Selection Required",
        description: "Please select a subscription plan to continue.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Create a subscription record
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan: selectedPlan,
          status: 'Active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
        });
        
      if (subscriptionError) {
        throw subscriptionError;
      }
      
      // Update user profile with activation status
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          activation_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (profileError) {
        throw profileError;
      }
      
      // Refresh user profile
      await refreshProfile();
      
      toast({
        title: "Account Activated",
        description: "Your account has been successfully activated. Welcome to WillTank!",
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error("Error completing activation:", error);
      toast({
        title: "Error",
        description: "Failed to complete account activation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const stepIcons = [
    <Lock key="lock" className="h-6 w-6" />,
    <UserCircle key="user" className="h-6 w-6" />,
    <Key key="key" className="h-6 w-6" />,
    <Smartphone key="smartphone" className="h-6 w-6" />,
    <CreditCard key="credit-card" className="h-6 w-6" />
  ];
  
  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-8">
        {stepIcons.map((icon, index) => (
          <React.Fragment key={index}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep === index 
              ? 'border-willtank-600 bg-willtank-50 text-willtank-600' 
              : currentStep > index 
              ? 'border-green-500 bg-green-50 text-green-500' 
              : 'border-gray-300 bg-gray-50 text-gray-400'
            }`}>
              {currentStep > index ? <CheckCircle className="h-5 w-5" /> : icon}
            </div>
            {index < stepIcons.length - 1 && (
              <div className={`w-16 h-1 mx-1 ${
                currentStep > index 
                ? 'bg-green-500' 
                : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Shield className="h-12 w-12 text-willtank-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Set Your Security PIN</h2>
              <p className="text-gray-600 mt-2">
                This 6-digit PIN will be used to secure your WillTank account
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Enter 6-digit PIN</label>
                <TwoFactorInput
                  onSubmit={() => {}} 
                  error={pinError}
                />
                <input 
                  type="hidden" 
                  value={setupPin} 
                  onChange={(e) => setSetupPin(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Confirm 6-digit PIN</label>
                <TwoFactorInput
                  onSubmit={() => {}} 
                  error={null}
                />
                <input 
                  type="hidden" 
                  value={confirmPin} 
                  onChange={(e) => setConfirmPin(e.target.value)} 
                />
              </div>
              
              {pinError && (
                <div className="text-red-600 text-sm">{pinError}</div>
              )}
              
              <Button 
                className="w-full mt-4" 
                onClick={handlePinSetup}
                disabled={setupPin.length !== 6 || confirmPin.length !== 6}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
        
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <UserCircle className="h-12 w-12 text-willtank-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Tell Us About Yourself</h2>
              <p className="text-gray-600 mt-2">
                This information helps us customize your experience
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">What is your occupation?</label>
                <Input 
                  placeholder="e.g., Software Engineer, Doctor, etc."
                  value={background.occupation}
                  onChange={(e) => setBackground({...background, occupation: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Why are you creating a will?</label>
                <Textarea 
                  placeholder="Tell us your reasons for creating a will..."
                  value={background.reason}
                  onChange={(e) => setBackground({...background, reason: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">What types of assets do you own? (optional)</label>
                <Textarea 
                  placeholder="e.g., real estate, investments, digital assets..."
                  value={background.assets}
                  onChange={(e) => setBackground({...background, assets: e.target.value})}
                  rows={2}
                />
              </div>
              
              <Button className="w-full mt-4" onClick={handleBackgroundSubmit}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Key className="h-12 w-12 text-willtank-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Your Encryption Key</h2>
              <p className="text-gray-600 mt-2">
                Download and securely store these keys. They are essential for accessing your documents.
              </p>
            </div>
            
            <div className="space-y-4">
              <Card className="p-4 border-amber-200 bg-amber-50">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Important Security Notice</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      If you lose these keys, you may permanently lose access to your encrypted documents.
                      Store them in a secure location like a password manager.
                    </p>
                  </div>
                </div>
              </Card>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Your Encryption Key:</h4>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded font-mono text-xs overflow-auto">
                    {encryptionKey || "Generating encryption key..."}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Your Recovery Phrase:</h4>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded font-mono text-xs overflow-auto">
                    {recoveryPhrase || "Generating recovery phrase..."}
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-4" onClick={handleDownloadKey} disabled={!encryptionKey || !recoveryPhrase}>
                <Download className="mr-2 h-4 w-4" />
                Download Keys & Continue
              </Button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Smartphone className="h-12 w-12 text-willtank-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Set Up Two-Factor Authentication</h2>
              <p className="text-gray-600 mt-2">
                Enhance your account security with 2FA using Google Authenticator
              </p>
            </div>
            
            <div className="space-y-4">
              <ol className="space-y-6">
                <li className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-willtank-100 text-willtank-700 font-medium text-sm mr-3 mt-0.5">1</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Download Google Authenticator</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      If you haven't already, download Google Authenticator for 
                      <a href="https://apps.apple.com/us/app/google-authenticator/id388497605" target="_blank" rel="noopener noreferrer" className="text-willtank-600 font-medium ml-1">iOS</a> or 
                      <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" rel="noopener noreferrer" className="text-willtank-600 font-medium ml-1">Android</a>
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-willtank-100 text-willtank-700 font-medium text-sm mr-3 mt-0.5">2</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Scan the QR code</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Open Google Authenticator and scan this QR code
                    </p>
                    <div className="mt-3 flex justify-center">
                      {qrCodeUrl ? (
                        <div className="p-4 bg-white border rounded-lg">
                          <QRCode url={qrCodeUrl} size={200} />
                        </div>
                      ) : (
                        <div className="h-[200px] w-[200px] flex items-center justify-center bg-gray-100 rounded-lg">
                          Loading QR code...
                        </div>
                      )}
                    </div>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-willtank-100 text-willtank-700 font-medium text-sm mr-3 mt-0.5">3</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Enter the code from the app</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Enter the 6-digit code displayed in Google Authenticator
                    </p>
                    <div className="mt-3">
                      <TwoFactorInput
                        onSubmit={(code) => setVerificationCode(code)}
                        loading={loading}
                        error={totpError}
                      />
                    </div>
                  </div>
                </li>
              </ol>
              
              <Button 
                className="w-full mt-4" 
                onClick={handleSetup2FA} 
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CreditCard className="h-12 w-12 text-willtank-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
              <p className="text-gray-600 mt-2">
                Select a subscription plan that fits your needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <Card 
                className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${
                  selectedPlan === 'Basic' ? 'border-willtank-600 ring-2 ring-willtank-600/20' : ''
                }`}
                onClick={() => handleSelectPlan('Basic')}
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Basic</h3>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">$9.99</span>
                    <span className="text-gray-500 text-sm">/month</span>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <ul className="text-left space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Single will document</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Basic templates</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>1 executor</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
              
              <Card 
                className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${
                  selectedPlan === 'Premium' ? 'border-willtank-600 ring-2 ring-willtank-600/20' : ''
                }`}
                onClick={() => handleSelectPlan('Premium')}
              >
                <div className="text-center">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-300 text-white text-xs font-bold py-1 px-2 rounded absolute -top-2 left-1/2 transform -translate-x-1/2">
                    RECOMMENDED
                  </div>
                  <h3 className="text-lg font-semibold mt-2">Premium</h3>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">$19.99</span>
                    <span className="text-gray-500 text-sm">/month</span>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <ul className="text-left space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Multiple will documents</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Advanced templates</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>5 executors</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Future messages</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
              
              <Card 
                className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${
                  selectedPlan === 'Enterprise' ? 'border-willtank-600 ring-2 ring-willtank-600/20' : ''
                }`}
                onClick={() => handleSelectPlan('Enterprise')}
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Enterprise</h3>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">$49.99</span>
                    <span className="text-gray-500 text-sm">/month</span>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <ul className="text-left space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Unlimited documents</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>All templates</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Unlimited executors</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Advanced legal features</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Priority support</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
            
            <Button 
              className="w-full mt-4" 
              onClick={handleCompletePlanSelection}
              disabled={!selectedPlan}
            >
              {loading ? "Finalizing..." : "Complete Activation"}
            </Button>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        {renderStepIndicator()}
        
        <Card className="p-6 md:p-8">
          {renderStep()}
        </Card>
      </div>
    </Layout>
  );
}
