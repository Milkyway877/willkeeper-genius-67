import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, Lock, Key, Fingerprint, Smartphone, Check, 
  AlertTriangle, RefreshCw, QrCode, Eye, EyeOff, Copy,
  Scan, UserCheck, Globe, AlertCircle, Laptop, Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function IDSecurity() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showRecoveryKey, setShowRecoveryKey] = useState(false);
  const [securityScore, setSecurityScore] = useState(75);
  
  const securityFeatures = [
    { id: 'twoFactor', name: '2-Factor Authentication', enabled: true },
    { id: 'biometric', name: 'Biometric Verification', enabled: false },
    { id: 'deviceTrust', name: 'Trusted Devices', enabled: true },
    { id: 'encryptedDocs', name: 'Document Encryption', enabled: true },
    { id: 'ipRestriction', name: 'IP Restrictions', enabled: false },
  ];
  
  const toggleSecurityFeature = (id: string) => {
    toast({
      title: "Security Setting Updated",
      description: `Security feature has been ${securityFeatures.find(f => f.id === id)?.enabled ? 'disabled' : 'enabled'}.`
    });
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "The recovery key has been copied to your clipboard."
    });
  };
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Identity & Security</h1>
          <p className="text-gray-600">Manage your identity verification and security settings.</p>
        </div>
        
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
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <Shield className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Security Score</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-lg">{securityScore}%</h4>
                        <p className="text-sm text-gray-500">Your account security is good, but could be improved</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        securityScore >= 80 ? 'bg-green-100 text-green-700' : 
                        securityScore >= 60 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {securityScore >= 80 ? 'Strong' : securityScore >= 60 ? 'Good' : 'Weak'}
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-100 h-3 rounded-full mb-6">
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                          <span>Two-factor authentication is enabled</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('access')}>
                          Configure
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                          <span>Document encryption is active</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/encryption')}>
                          Manage
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                          </div>
                          <span>Identity verification is incomplete</span>
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
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <Lock className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Security Features</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-6">
                      {securityFeatures.map((feature) => (
                        <div key={feature.id} className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{feature.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <Key className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Quick Actions</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('access')}>
                        <Shield className="mr-2 h-4 w-4" />
                        Configure Two-Factor Authentication
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('verification')}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Complete Identity Verification
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('recovery')}>
                        <Key className="mr-2 h-4 w-4" />
                        Generate Recovery Keys
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/encryption')}>
                        <Lock className="mr-2 h-4 w-4" />
                        Manage Encryption Keys
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-willtank-50 rounded-xl p-6 border border-willtank-100">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-willtank-100 flex items-center justify-center mr-4">
                      <Shield className="h-5 w-5 text-willtank-600" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Security Tips</h3>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1 flex-shrink-0" />
                          Use a strong, unique password for your WillTank account
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1 flex-shrink-0" />
                          Enable two-factor authentication for added security
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1 flex-shrink-0" />
                          Store recovery keys in a secure, offline location
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1 flex-shrink-0" />
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
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <UserCheck className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Identity Verification</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Verification Status</h4>
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-amber-700">Verification Incomplete</p>
                          <p className="text-sm text-gray-500">Complete verification to unlock all WillTank features</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-4">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <h5 className="font-medium">Email Verification</h5>
                            <p className="text-sm text-gray-500">Completed on Jun 15, 2023</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-4">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <h5 className="font-medium">Phone Verification</h5>
                            <p className="text-sm text-gray-500">Completed on Jun 15, 2023</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-4">
                          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <h5 className="font-medium">ID Verification</h5>
                            <p className="text-sm text-gray-500">Upload government-issued ID to verify your identity</p>
                          </div>
                        </div>
                        
                        <Button onClick={() => toast({
                          title: "ID Verification",
                          description: "Starting the ID verification process..."
                        })}>
                          Start ID Verification
                        </Button>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-4">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                            <Fingerprint className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <h5 className="font-medium">Biometric Verification</h5>
                            <p className="text-sm text-gray-500">Optional: Add an extra layer of security</p>
                          </div>
                        </div>
                        
                        <Button variant="outline" onClick={() => toast({
                          title: "Biometric Setup",
                          description: "Starting biometric verification setup..."
                        })}>
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <AlertCircle className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Why Verify?</h3>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Identity verification is required for legal document creation and helps protect your estate plans from fraud.
                    </p>
                    
                    <h4 className="font-medium mb-2">Benefits include:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1 flex-shrink-0" />
                        Enhanced document security and validity
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1 flex-shrink-0" />
                        Protection against unauthorized access
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1 flex-shrink-0" />
                        Stronger legal standing for your documents
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1 flex-shrink-0" />
                        Access to premium features and services
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <Lock className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Privacy & Security</h3>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Your verification information is protected with enterprise-grade security and is never shared with third parties.
                    </p>
                    
                    <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/privacy')}>
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
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <Smartphone className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="font-medium">Status</h4>
                        <div className="flex items-center mt-1">
                          <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                          <p className="text-sm text-green-700">Enabled - Authenticator App</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => toast({
                        title: "2FA Configuration",
                        description: "Opening 2FA configuration wizard..."
                      })}>
                        Reconfigure
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Available Methods</h4>
                      
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <h5 className="font-medium">Authenticator App</h5>
                            <p className="text-sm text-gray-500">Current method: Google Authenticator</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                            <Smartphone className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <h5 className="font-medium">SMS Authentication</h5>
                            <p className="text-sm text-gray-500">Receive codes via text message</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                            <Key className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <h5 className="font-medium">Security Key</h5>
                            <p className="text-sm text-gray-500">Use a hardware security key like YubiKey</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <Globe className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Access Restrictions</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Trusted Devices</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Only allow access from devices you've previously authorized
                          </p>
                        </div>
                        <Switch checked={true} />
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Your Trusted Devices</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                <Laptop className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <h5 className="font-medium text-sm">MacBook Pro</h5>
                                <p className="text-xs text-gray-500">Last used: Today at 2:34 PM</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mr-2">Current</span>
                              <Button variant="ghost" size="sm">Remove</Button>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                <Smartphone className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <h5 className="font-medium text-sm">iPhone 13</h5>
                                <p className="text-xs text-gray-500">Last used: Yesterday at 8:15 AM</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">Remove</Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <h4 className="font-medium">IP Restrictions</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Restrict access to specific IP addresses or regions
                          </p>
                        </div>
                        <Switch checked={false} />
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <QrCode className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Setup Guide</h3>
                  </div>
                  
                  <div className="p-6">
                    <h4 className="font-medium mb-3">How to Set Up 2FA</h4>
                    <ol className="space-y-3 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-willtank-100 text-willtank-700 flex items-center justify-center mr-2">1</span>
                        <span>Download an authenticator app (Google Authenticator, Authy, etc.)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-willtank-100 text-willtank-700 flex items-center justify-center mr-2">2</span>
                        <span>Click "Reconfigure" and scan the QR code with your app</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-willtank-100 text-willtank-700 flex items-center justify-center mr-2">3</span>
                        <span>Enter the 6-digit code from your app to confirm setup</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-willtank-100 text-willtank-700 flex items-center justify-center mr-2">4</span>
                        <span>Save your recovery codes in a secure location</span>
                      </li>
                    </ol>
                  </div>
                </div>
                
                <div className="bg-willtank-50 rounded-xl p-6 border border-willtank-100">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-willtank-100 flex items-center justify-center mr-4">
                      <Shield className="h-5 w-5 text-willtank-600" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Security Best Practices</h3>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1 flex-shrink-0" />
                          Use a strong, unique password
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1 flex-shrink-0" />
                          Always keep your authenticator app updated
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1 flex-shrink-0" />
                          Store recovery codes in a secure location
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1 flex-shrink-0" />
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
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <Key className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Recovery Keys</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Account Recovery Key</h4>
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
                      
                      <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono">
                        {showRecoveryKey ? 'ABCD-EFGH-IJKL-MNOP-QRST-UVWX' : '••••-••••-••••-••••-••••'}
                      </div>
                      
                      <p className="text-sm text-gray-500 mt-2">
                        Last generated: June 15, 2023
                      </p>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-6">
                      <h4 className="font-medium mb-3">Two-Factor Recovery Codes</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Use these codes if you lose access to your authentication app. Each code can only be used once.
                      </p>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 grid grid-cols-2 gap-2 font-mono text-sm">
                        {showRecoveryKey ? (
                          <>
                            <div>1. 84953-ABCDE</div>
                            <div>2. 29384-FGHIJ</div>
                            <div>3. 39485-KLMNO</div>
                            <div>4. 12093-PQRST</div>
                            <div>5. 45678-UVWXY</div>
                            <div>6. 98765-ZABCD</div>
                          </>
                        ) : (
                          <>
                            <div>1. •••••-•••••</div>
                            <div>2. •••••-•••••</div>
                            <div>3. •••••-•••••</div>
                            <div>4. •••••-•••••</div>
                            <div>5. •••••-•••••</div>
                            <div>6. •••••-•••••</div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => toast({
                          title: "Recovery Keys Downloaded",
                          description: "Your recovery keys have been downloaded as a PDF file."
                        })}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Keys
                      </Button>
                      
                      <Button 
                        onClick={() => toast({
                          title: "Recovery Keys Generated",
                          description: "New recovery keys have been generated. Old keys are no longer valid."
                        })}
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
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <Scan className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Emergency Access</h3>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Designate trusted contacts who can request access to your account in case of emergency.
                    </p>
                    
                    <Button onClick={() => toast({
                      title: "Emergency Access",
                      description: "Opening emergency access configuration..."
                    })}>
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
                <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Important</h3>
                      <p className="text-sm text-amber-700 mb-3">
                        Without access to recovery options, you may lose access to your account and documents permanently.
                      </p>
                      <ul className="space-y-2 text-sm text-amber-700">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-amber-600 mr-2 mt-1 flex-shrink-0" />
                          Store recovery keys in a secure location
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-amber-600 mr-2 mt-1 flex-shrink-0" />
                          Consider printing a physical copy and storing it safely
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-amber-600 mr-2 mt-1 flex-shrink-0" />
                          Never share your recovery keys with anyone
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <Shield className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Account Recovery Process</h3>
                  </div>
                  
                  <div className="p-6">
                    <h4 className="font-medium mb-3">How to Recover Your Account</h4>
                    <ol className="space-y-3 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-willtank-100 text-willtank-700 flex items-center justify-center mr-2">1</span>
                        <span>Visit the login page and click "Forgot Password" or "Can't Access Account"</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-willtank-100 text-willtank-700 flex items-center justify-center mr-2">2</span>
                        <span>Enter your email address and follow the instructions</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-willtank-100 text-willtank-700 flex items-center justify-center mr-2">3</span>
                        <span>When prompted, enter your recovery key or one of your recovery codes</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-willtank-100 text-willtank-700 flex items-center justify-center mr-2">4</span>
                        <span>Create a new password and reconfigure security settings</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
