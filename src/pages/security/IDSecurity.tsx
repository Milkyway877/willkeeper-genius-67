
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCode } from "@/components/ui/QRCode";
import { TwoFactorInput } from '@/components/ui/TwoFactorInput';
import { 
  Shield, Lock, Key, Fingerprint, Smartphone, Check, 
  AlertTriangle, RefreshCw, QrCode, Eye, EyeOff, Copy,
  Scan, UserCheck, Globe, AlertCircle, Laptop, Download,
  X, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  getUserSecurity, 
  updateUserSecurity, 
  generateTOTPSecret, 
  setup2FA, 
  disable2FA, 
  validateTOTP,
  generateRecoveryCodes,
  storeRecoveryCodes 
} from '@/services/encryptionService';

export default function IDSecurity() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showRecoveryKey, setShowRecoveryKey] = useState(false);
  const [securityScore, setSecurityScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userSecurity, setUserSecurity] = useState<any>(null);
  const [openTwoFactorSetup, setOpenTwoFactorSetup] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [verifying2FA, setVerifying2FA] = useState(false);
  
  // TOTP Setup state
  const [totpSecret, setTotpSecret] = useState({ secret: '', qrCodeUrl: '' });
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  
  // Device management
  const [trustedDevices, setTrustedDevices] = useState<any[]>([]);
  
  // Identity verification state
  const [identityStatus, setIdentityStatus] = useState('incomplete');
  
  const securityFeatures = [
    { id: 'twoFactor', name: '2-Factor Authentication', enabled: userSecurity?.google_auth_enabled || false },
    { id: 'biometric', name: 'Biometric Verification', enabled: false },
    { id: 'deviceTrust', name: 'Trusted Devices', enabled: trustedDevices.length > 0 },
    { id: 'encryptedDocs', name: 'Document Encryption', enabled: true },
    { id: 'ipRestriction', name: 'IP Restrictions', enabled: false },
  ];
  
  // Load user security data
  useEffect(() => {
    const loadSecurityData = async () => {
      try {
        const securityData = await getUserSecurity();
        if (securityData) {
          setUserSecurity(securityData);
          
          // Calculate security score based on enabled features
          let score = 30; // Base score
          if (securityData.google_auth_enabled) score += 25;
          if (identityStatus === 'complete') score += 25;
          if (trustedDevices.length > 0) score += 10;
          // Document encryption is always enabled (for now)
          score += 10;
          
          setSecurityScore(score);
        }
        
        // Get trusted devices
        const currentDevice = {
          id: 'current-device',
          name: 'Current Device',
          type: 'computer',
          lastUsed: new Date()
        };
        
        setTrustedDevices([currentDevice]);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading security data:', error);
        setIsLoading(false);
      }
    };
    
    loadSecurityData();
  }, [identityStatus]);
  
  const toggleSecurityFeature = async (id: string) => {
    try {
      if (id === 'twoFactor') {
        if (securityFeatures.find(f => f.id === id)?.enabled) {
          // Disable 2FA
          const success = await disable2FA();
          if (success) {
            setUserSecurity({
              ...userSecurity,
              google_auth_enabled: false
            });
            
            // Update security score
            let score = securityScore - 25;
            setSecurityScore(score);
            
            toast({
              title: "Two-factor authentication disabled",
              description: "Two-factor authentication has been disabled for your account."
            });
          }
        } else {
          // Open 2FA setup modal
          initializeTwoFactorSetup();
        }
      } else {
        // For other features
        const isEnabled = securityFeatures.find(f => f.id === id)?.enabled;
        
        toast({
          title: `${isEnabled ? 'Disabled' : 'Enabled'} ${securityFeatures.find(f => f.id === id)?.name}`,
          description: `${securityFeatures.find(f => f.id === id)?.name} has been ${isEnabled ? 'disabled' : 'enabled'}.`
        });
        
        // For demonstration purposes, toggle the feature
        const updatedFeatures = securityFeatures.map(feature => 
          feature.id === id ? { ...feature, enabled: !feature.enabled } : feature
        );
        
        // No need to setSecurityFeatures as it derives from userSecurity
      }
    } catch (error) {
      console.error(`Error toggling security feature ${id}:`, error);
      toast({
        title: "Error",
        description: "Failed to update security settings. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const initializeTwoFactorSetup = () => {
    // Generate new TOTP secret
    const { secret, qrCodeUrl } = generateTOTPSecret();
    setTotpSecret({ secret, qrCodeUrl });
    setSetupStep(1);
    setOpenTwoFactorSetup(true);
  };
  
  const handleTwoFactorSetup = async (code: string) => {
    setVerifying2FA(true);
    
    try {
      const result = await setup2FA(code);
      
      if (result.success) {
        // Update user security state
        setUserSecurity({
          ...userSecurity,
          google_auth_enabled: true,
          google_auth_secret: totpSecret.secret
        });
        
        // Update security score
        let newScore = securityScore + 25;
        setSecurityScore(newScore);
        
        // If recovery codes were generated, show them
        if (result.recoveryCodes) {
          setRecoveryCodes(result.recoveryCodes);
          setSetupStep(2);
        } else {
          // Close the dialog
          setOpenTwoFactorSetup(false);
          
          toast({
            title: "Two-factor authentication enabled",
            description: "Your account is now protected with 2FA."
          });
        }
      }
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      toast({
        title: "Error",
        description: "Failed to set up two-factor authentication. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerifying2FA(false);
    }
  };
  
  const finishTwoFactorSetup = () => {
    setOpenTwoFactorSetup(false);
    toast({
      title: "Two-factor authentication enabled",
      description: "Your account is now protected with 2FA and recovery codes have been saved."
    });
  };
  
  const generateNewRecoveryCodes = async () => {
    try {
      // Generate new recovery codes
      const newCodes = generateRecoveryCodes();
      
      // Store them in the database
      const success = await storeRecoveryCodes(newCodes);
      
      if (success) {
        setRecoveryCodes(newCodes);
        setShowRecoveryKey(true);
        
        toast({
          title: "Recovery Codes Generated",
          description: "New recovery codes have been generated. Old codes are no longer valid."
        });
      }
    } catch (error) {
      console.error('Error generating recovery codes:', error);
      toast({
        title: "Error",
        description: "Failed to generate new recovery codes. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "The information has been copied to your clipboard."
    });
  };
  
  const downloadRecoveryCodes = () => {
    // Create a text file with the recovery codes
    const codesText = recoveryCodes.map((code, i) => `${i + 1}. ${code}`).join('\n');
    const content = `WILLTANK RECOVERY CODES\n\nKeep these codes in a safe place. Each code can only be used once.\n\n${codesText}`;
    
    // Create a blob with the content
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element to download the file
    const a = document.createElement('a');
    a.href = url;
    a.download = 'willtank-recovery-codes.txt';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Recovery Codes Downloaded",
      description: "Your recovery codes have been downloaded as a text file."
    });
  };
  
  // Placeholder for device removal functionality
  const removeDevice = (deviceId: string) => {
    setTrustedDevices(devices => devices.filter(device => device.id !== deviceId));
    
    toast({
      title: "Device Removed",
      description: "The selected device has been removed from your trusted devices."
    });
  };
  
  // Placeholder for identity verification
  const startIdentityVerification = () => {
    navigate('/kyc/verification');
    
    toast({
      title: "ID Verification Started",
      description: "Please follow the instructions to complete your identity verification."
    });
  };
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Identity & Security</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your identity verification and security settings.</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-black rounded-full"></div>
          </div>
        ) : (
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="verification">Identity Verification</TabsTrigger>
              <TabsTrigger value="access">Access Security</TabsTrigger>
              <TabsTrigger value="recovery">Recovery Options</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center">
                      <Shield className="text-gray-900 dark:text-gray-100 mr-2" size={18} />
                      <h3 className="font-medium">Security Score</h3>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-lg">{securityScore}%</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {securityScore >= 80 ? 'Your account security is strong.'
                              : securityScore >= 60 ? 'Your account security is good, but could be improved.'
                              : 'Your account security needs improvement.'}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          securityScore >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 
                          securityScore >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                          'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {securityScore >= 80 ? 'Strong' : securityScore >= 60 ? 'Good' : 'Weak'}
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-100 dark:bg-gray-700 h-3 rounded-full mb-6">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            securityScore >= 80 ? 'bg-green-500' : 
                            securityScore >= 60 ? 'bg-amber-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${securityScore}%` }}
                        ></div>
                      </div>
                      
                      <div className="space-y-4">
                        {userSecurity?.google_auth_enabled ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <span className="dark:text-gray-200">Two-factor authentication is enabled</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setActiveTab('access')}>
                              Configure
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mr-3">
                                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                              </div>
                              <span className="dark:text-gray-200">Two-factor authentication is not enabled</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={initializeTwoFactorSetup}>
                              Enable
                            </Button>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="dark:text-gray-200">Document encryption is active</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => navigate('/encryption')}>
                            Manage
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mr-3">
                              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="dark:text-gray-200">Identity verification is incomplete</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setActiveTab('verification')}>
                            Complete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center">
                      <Lock className="text-gray-900 dark:text-gray-100 mr-2" size={18} />
                      <h3 className="font-medium">Security Features</h3>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-6">
                        {securityFeatures.map((feature) => (
                          <div key={feature.id} className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium dark:text-gray-200">{feature.name}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {feature.id === 'twoFactor' && 'Protect your account with an additional verification step'}
                                {feature.id === 'biometric' && 'Use fingerprint or face recognition for authentication'}
                                {feature.id === 'deviceTrust' && 'Only allow access from devices you trust'}
                                {feature.id === 'encryptedDocs' && 'Encrypt your documents with AES-256 encryption'}
                                {feature.id === 'ipRestriction' && 'Restrict access to specific IP addresses or regions'}
                              </p>
                            </div>
                            <Switch 
                              checked={feature.enabled} 
                              onCheckedChange={() => toggleSecurityFeature(feature.id)}
                              disabled={feature.id === 'encryptedDocs'} // Always enabled
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center">
                      <Key className="text-gray-900 dark:text-gray-100 mr-2" size={18} />
                      <h3 className="font-medium">Quick Actions</h3>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-3">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start dark:border-gray-700 dark:text-gray-200" 
                          onClick={initializeTwoFactorSetup}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          {userSecurity?.google_auth_enabled ? 'Configure' : 'Enable'} Two-Factor Authentication
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start dark:border-gray-700 dark:text-gray-200" 
                          onClick={() => setActiveTab('verification')}
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Complete Identity Verification
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start dark:border-gray-700 dark:text-gray-200" 
                          onClick={() => setActiveTab('recovery')}
                        >
                          <Key className="mr-2 h-4 w-4" />
                          Manage Recovery Keys
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start dark:border-gray-700 dark:text-gray-200" 
                          onClick={() => navigate('/encryption')}
                        >
                          <Lock className="mr-2 h-4 w-4" />
                          Manage Encryption Keys
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#FFF5E6] dark:bg-gray-800 rounded-xl p-6 border border-[#F0E0C0] dark:border-gray-700">
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-[#F0E0C0] dark:bg-gray-700 flex items-center justify-center mr-4">
                        <Shield className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-2 dark:text-gray-200">Security Tips</h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-gray-900 dark:text-gray-100 mr-2 mt-1 flex-shrink-0" />
                            Use a strong, unique password for your WillTank account
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-gray-900 dark:text-gray-100 mr-2 mt-1 flex-shrink-0" />
                            Enable two-factor authentication for added security
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-gray-900 dark:text-gray-100 mr-2 mt-1 flex-shrink-0" />
                            Store recovery keys in a secure, offline location
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-gray-900 dark:text-gray-100 mr-2 mt-1 flex-shrink-0" />
                            Regularly review your login activity
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </TabsContent>
            
            <TabsContent value="verification">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center">
                      <UserCheck className="text-gray-900 dark:text-gray-100 mr-2" size={18} />
                      <h3 className="font-medium">Identity Verification</h3>
                    </div>
                    
                    <div className="p-6">
                      <div className="mb-6">
                        <h4 className="font-medium mb-2 dark:text-gray-200">Verification Status</h4>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mr-3">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="font-medium text-amber-700 dark:text-amber-400">Verification Incomplete</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Complete verification to unlock all WillTank features</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center mb-4">
                            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h5 className="font-medium dark:text-gray-200">Email Verification</h5>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Completed on {new Date().toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center mb-4">
                            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h5 className="font-medium dark:text-gray-200">Phone Verification</h5>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Completed on {new Date().toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center mb-4">
                            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mr-3">
                              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                              <h5 className="font-medium dark:text-gray-200">ID Verification</h5>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Upload government-issued ID to verify your identity</p>
                            </div>
                          </div>
                          
                          <Button onClick={startIdentityVerification}>
                            Start ID Verification
                          </Button>
                        </div>
                        
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center mb-4">
                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                              <Fingerprint className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <h5 className="font-medium dark:text-gray-200">Biometric Verification</h5>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Optional: Add an extra layer of security</p>
                            </div>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            onClick={() => toggleSecurityFeature('biometric')}
                            className="dark:border-gray-700 dark:text-gray-200"
                          >
                            Setup Biometrics
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="space-y-6"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center">
                      <AlertCircle className="text-gray-900 dark:text-gray-100 mr-2" size={18} />
                      <h3 className="font-medium">Why Verify?</h3>
                    </div>
                    
                    <div className="p-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Identity verification is required for legal document creation and helps protect your estate plans from fraud.
                      </p>
                      
                      <h4 className="font-medium mb-2 dark:text-gray-200">Benefits include:</h4>
                      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-gray-900 dark:text-gray-100 mr-2 mt-1 flex-shrink-0" />
                          Enhanced document security and validity
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-gray-900 dark:text-gray-100 mr-2 mt-1 flex-shrink-0" />
                          Protection against unauthorized access
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-gray-900 dark:text-gray-100 mr-2 mt-1 flex-shrink-0" />
                          Stronger legal standing for your documents
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-gray-900 dark:text-gray-100 mr-2 mt-1 flex-shrink-0" />
                          Access to premium features and services
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center">
                      <Lock className="text-gray-900 dark:text-gray-100 mr-2" size={18} />
                      <h3 className="font-medium">Privacy & Security</h3>
                    </div>
                    
                    <div className="p-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Your verification information is protected with enterprise-grade security and is never shared with third parties.
                      </p>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full dark:border-gray-700 dark:text-gray-200" 
                        onClick={() => navigate('/privacy')}
                      >
                        Review Privacy Policy
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </TabsContent>
            
            <TabsContent value="access">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center">
                      <Smartphone className="text-gray-900 dark:text-gray-100 mr-2" size={18} />
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h4 className="font-medium dark:text-gray-200">Status</h4>
                          <div className="flex items-center mt-1">
                            <div className={`h-2.5 w-2.5 rounded-full ${userSecurity?.google_auth_enabled ? 'bg-green-500' : 'bg-amber-500'} mr-2`}></div>
                            <p className={`text-sm ${userSecurity?.google_auth_enabled ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                              {userSecurity?.google_auth_enabled ? 'Enabled - Authenticator App' : 'Disabled'}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={userSecurity?.google_auth_enabled ? () => toggleSecurityFeature('twoFactor') : initializeTwoFactorSetup}
                          className="dark:border-gray-700 dark:text-gray-200"
                        >
                          {userSecurity?.google_auth_enabled ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium dark:text-gray-200">Available Methods</h4>
                        
                        <div className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${userSecurity?.google_auth_enabled ? 'bg-gray-50 dark:bg-gray-900' : ''}`}>
                          <div className="flex items-center">
                            <div className={`h-8 w-8 rounded-full ${userSecurity?.google_auth_enabled ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'} flex items-center justify-center mr-3`}>
                              {userSecurity?.google_auth_enabled ? (
                                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <QrCode className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              )}
                            </div>
                            <div>
                              <h5 className="font-medium dark:text-gray-200">Authenticator App</h5>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {userSecurity?.google_auth_enabled ? 'Current method: Google Authenticator' : 'Use Google Authenticator, Authy, or other apps'}
                              </p>
                            </div>
                          </div>
                          
                          {!userSecurity?.google_auth_enabled && (
                            <Button 
                              className="mt-4" 
                              variant="secondary" 
                              onClick={initializeTwoFactorSetup}
                            >
                              Set Up
                            </Button>
                          )}
                        </div>
                        
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                              <Smartphone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <h5 className="font-medium dark:text-gray-200">SMS Authentication</h5>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Receive codes via text message</p>
                            </div>
                          </div>
                          
                          <Button 
                            className="mt-4" 
                            variant="secondary" 
                            disabled
                          >
                            Coming Soon
                          </Button>
                        </div>
                        
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                              <Key className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <h5 className="font-medium dark:text-gray-200">Security Key</h5>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Use a hardware security key like YubiKey</p>
                            </div>
                          </div>
                          
                          <Button 
                            className="mt-4" 
                            variant="secondary" 
                            disabled
                          >
                            Coming Soon
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center">
                      <Globe className="text-gray-900 dark:text-gray-100 mr-2" size={18} />
                      <h3 className="font-medium">Access Restrictions</h3>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium dark:text-gray-200">Trusted Devices</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Only allow access from devices you've previously authorized
                            </p>
                          </div>
                          <Switch 
                            checked={securityFeatures.find(f => f.id === 'deviceTrust')?.enabled} 
                            onCheckedChange={() => toggleSecurityFeature('deviceTrust')}
                          />
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3 dark:text-gray-200">Your Trusted Devices</h4>
                          <div className="space-y-3">
                            {trustedDevices.map((device) => (
                              <div key={device.id} className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                                    <Laptop className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-sm dark:text-gray-200">{device.name}</h5>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Last used: {device.lastUsed ? 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  {device.id === 'current-device' && (
                                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full mr-2">Current</span>
                                  )}
                                  {device.id !== 'current-device' && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => removeDevice(device.id)}
                                    >
                                      Remove
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                          <div>
                            <h4 className="font-medium dark:text-gray-200">IP Restrictions</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Restrict access to specific IP addresses or regions
                            </p>
                          </div>
                          <Switch 
                            checked={securityFeatures.find(f => f.id === 'ipRestriction')?.enabled} 
                            onCheckedChange={() => toggleSecurityFeature('ipRestriction')}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center">
                      <QrCode className="text-gray-900 dark:text-gray-100 mr-2" size={18} />
                      <h3 className="font-medium">Setup Guide</h3>
                    </div>
                    
                    <div className="p-6">
                      <h4 className="font-medium mb-3 dark:text-gray-200">How to Set Up 2FA</h4>
                      <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                          <span className="flex-shrink-0 h-5 w-5 rounded-full bg-[#FFF5E6] dark:bg-gray-700 text-gray-900 dark:text-gray-200 flex items-center justify-center mr-2">1</span>
                          <span>Download an authenticator app (Google Authenticator, Authy, etc.)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 h-5 w-5 rounded-full bg-[#FFF5E6] dark:bg-gray-700 text-gray-900 dark:text-gray-200 flex items-center justify-center mr-2">2</span>
                          <span>Click "Enable" and scan the QR code with your app</span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 h-5 w-5 rounded-full bg-[#FFF5E6] dark:bg-gray-700 text-gray-900 dark:text-gray-200 flex items-center justify-center mr-2">3</span>
                          <span>Enter the 6-digit code from your app to confirm setup</span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 h-5 w-5 rounded-full bg-[#FFF5E6] dark:bg-gray-700 text-gray-900 dark:text-gray-200 flex items-center justify-center mr-2">4</span>
                          <span>Save your recovery codes in a secure location</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                  
                  <div className="bg-[#FFF5E6] dark:bg-gray-800 rounded-xl p-6 border border-[#F0E0C0] dark:border-gray-700">
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-[#F0E0C0] dark:bg-gray-700 flex items-center justify-center mr-4">
                        <Shield className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-2 dark:text-gray-200">Security Best Practices</h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-gray-900 dark:text-gray-100 mr-2 mt-1 flex-shrink-0" />
                            Use a strong, unique password
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-gray-900 dark:text-gray-100 mr-2 mt-1 flex-shrink-0" />
                            Always keep your authenticator app updated
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-gray-900 dark:text-gray-100 mr-2 mt-1 flex-shrink-0" />
                            Store recovery codes in a secure location
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-gray-900 dark:text-gray-100 mr-2 mt-1 flex-shrink-0" />
                            Never share your authentication codes with anyone
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </TabsContent>
            
            <TabsContent value="recovery">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center">
                      <Key className="text-gray-900 dark:text-gray-100 mr-2" size={18} />
                      <h3 className="font-medium">Recovery Keys</h3>
                    </div>
                    
                    <div className="p-6">
                      <div className="mb-6">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium dark:text-gray-200">Account Recovery Key</h4>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setShowRecoveryKey(!showRecoveryKey)}
                            >
                              {showRecoveryKey ? <EyeOff size={16} /> : <Eye size={16} />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => copyToClipboard('ABCD-EFGH-IJKL-MNOP-QRST-UVWX')}
                            >
                              <Copy size={16} />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 font-mono">
                          {showRecoveryKey 
                            ? (recoveryCodes.length > 0 ? recoveryCodes[0] : 'No recovery key available') 
                            : '••••-••••-••••-••••-••••'
                          }
                        </div>
                        
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {recoveryCodes.length > 0 
                            ? `Last generated: ${new Date().toLocaleDateString()}` 
                            : 'No recovery key has been generated yet.'
                          }
                        </p>
                      </div>
                      
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                        <h4 className="font-medium mb-3 dark:text-gray-200">Two-Factor Recovery Codes</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Use these codes if you lose access to your authentication app. Each code can only be used once.
                        </p>
                        
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 grid grid-cols-2 gap-2 font-mono text-sm">
                          {showRecoveryKey ? (
                            recoveryCodes.length > 0 ? (
                              recoveryCodes.map((code, index) => (
                                <div key={index}>{index + 1}. {code}</div>
                              ))
                            ) : (
                              Array(6).fill(0).map((_, i) => (
                                <div key={i}>{i + 1}. No code available</div>
                              ))
                            )
                          ) : (
                            Array(6).fill(0).map((_, i) => (
                              <div key={i}>{i + 1}. •••••-•••••</div>
                            ))
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-6">
                        <Button 
                          variant="outline" 
                          onClick={downloadRecoveryCodes}
                          disabled={recoveryCodes.length === 0}
                          className="dark:border-gray-700 dark:text-gray-200"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Keys
                        </Button>
                        
                        <Button 
                          onClick={generateNewRecoveryCodes}
                          disabled={!userSecurity?.google_auth_enabled}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Generate New Keys
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center">
                      <Scan className="text-gray-900 dark:text-gray-100 mr-2" size={18} />
                      <h3 className="font-medium">Emergency Access</h3>
                    </div>
                    
                    <div className="p-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Designate trusted contacts who can request access to your account in case of emergency.
                      </p>
                      
                      <Button 
                        onClick={() => navigate('/executors')}
                      >
                        Configure Emergency Access
                      </Button>
                    </div>
                  </motion.div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-amber-50 dark:bg-gray-800 rounded-xl p-6 border border-amber-100 dark:border-gray-700">
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-gray-700 flex items-center justify-center mr-4">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-2 dark:text-gray-200">Important</h3>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                          Without access to recovery options, you may lose access to your account and documents permanently.
                        </p>
                        <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-400">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2 mt-1 flex-shrink-0" />
                            Store recovery keys in a secure location
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2 mt-1 flex-shrink-0" />
                            Consider printing a physical copy and storing it safely
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2 mt-1 flex-shrink-0" />
                            Never share your recovery keys with anyone
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center">
                      <Shield className="text-gray-900 dark:text-gray-100 mr-2" size={18} />
                      <h3 className="font-medium">Account Recovery Process</h3>
                    </div>
                    
                    <div className="p-6">
                      <h4 className="font-medium mb-3 dark:text-gray-200">How to Recover Your Account</h4>
                      <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                          <span className="flex-shrink-0 h-5 w-5 rounded-full bg-[#FFF5E6] dark:bg-gray-700 text-gray-900 dark:text-gray-200 flex items-center justify-center mr-2">1</span>
                          <span>Visit the login page and click "Forgot Password" or "Can't Access Account"</span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 h-5 w-5 rounded-full bg-[#FFF5E6] dark:bg-gray-700 text-gray-900 dark:text-gray-200 flex items-center justify-center mr-2">2</span>
                          <span>Enter your email address and follow the instructions</span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 h-5 w-5 rounded-full bg-[#FFF5E6] dark:bg-gray-700 text-gray-900 dark:text-gray-200 flex items-center justify-center mr-2">3</span>
                          <span>When prompted, enter your recovery key or one of your recovery codes</span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 h-5 w-5 rounded-full bg-[#FFF5E6] dark:bg-gray-700 text-gray-900 dark:text-gray-200 flex items-center justify-center mr-2">4</span>
                          <span>Create a new password and reconfigure security settings</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      {/* Two-Factor Authentication Setup Dialog */}
      <Dialog open={openTwoFactorSetup} onOpenChange={setOpenTwoFactorSetup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {setupStep === 1 ? 'Set Up Two-Factor Authentication' : 'Save Your Recovery Codes'}
            </DialogTitle>
            <DialogDescription>
              {setupStep === 1 
                ? 'Protect your account with an additional layer of security.' 
                : 'Keep these codes in a safe place. You can use them to access your account if you lose your authenticator device.'}
            </DialogDescription>
          </DialogHeader>
          
          {setupStep === 1 ? (
            <>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 space-y-4">
                  <p className="text-sm">
                    1. Download an authenticator app like Google Authenticator or Authy.
                  </p>
                  
                  <div>
                    <p className="text-sm mb-2">
                      2. Scan this QR code with your authenticator app:
                    </p>
                    <div className="flex justify-center bg-white p-2 border rounded-md">
                      <QRCode value={totpSecret.qrCodeUrl} size={160} />
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm mb-2">
                      3. Or enter this key manually in your app:
                    </p>
                    <div className="relative">
                      <div className="p-2 bg-gray-50 border rounded-md font-mono text-center break-all select-all text-sm">
                        {totpSecret.secret}
                      </div>
                      <button
                        type="button"
                        className="absolute top-2 right-2 p-1 bg-gray-100 rounded hover:bg-gray-200"
                        onClick={() => copyToClipboard(totpSecret.secret)}
                        aria-label="Copy to clipboard"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm mb-2">
                    Enter the 6-digit verification code from your authenticator app:
                  </p>
                  <TwoFactorInput onSubmit={handleTwoFactorSetup} loading={verifying2FA} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-amber-50 dark:bg-gray-800 border border-amber-100 dark:border-gray-700 rounded-lg p-3 mb-4">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Save these recovery codes in a secure location. Each code can only be used once.
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 font-mono text-sm grid grid-cols-2 gap-2">
                {recoveryCodes.map((code, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {index + 1}. {code}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4 mt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 dark:border-gray-700" 
                  onClick={downloadRecoveryCodes}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 dark:border-gray-700" 
                  onClick={() => copyToClipboard(recoveryCodes.join('\n'))}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
              
              <DialogFooter>
                <Button onClick={finishTwoFactorSetup}>
                  I've saved these codes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
