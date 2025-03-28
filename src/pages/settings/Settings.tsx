import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, User, Lock, Bell, Shield, 
  CreditCard, Mail, Check, Smartphone, Key, Globe, 
  LogOut, Save, RefreshCw, Trash2, Edit
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('account');
  const [isLoading, setIsLoading] = useState(false);
  
  // User profile state
  const [profile, setProfile] = useState({
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@example.com',
    phone: '(555) 123-4567',
  });
  
  // Notification settings state
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    documentUpdates: true,
    securityAlerts: true,
    marketingEmails: false,
    executorInvitations: true,
    willtankUpdates: true,
  });
  
  // Security settings state
  const [security, setSecurity] = useState({
    twoFactorEnabled: true,
    loginNotifications: true,
    documentEncryption: true,
    biometricLogin: false,
  });
  
  // Edit profile handler
  const handleProfileUpdate = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully."
      });
    }, 1000);
  };
  
  // Toggle notification setting
  const toggleNotification = (setting: keyof typeof notifications) => {
    setNotifications({
      ...notifications,
      [setting]: !notifications[setting]
    });
    
    toast({
      title: "Notification Setting Updated",
      description: `${notifications[setting] ? 'Disabled' : 'Enabled'} ${setting} notifications.`
    });
  };
  
  // Toggle security setting
  const toggleSecurity = (setting: keyof typeof security) => {
    setSecurity({
      ...security,
      [setting]: !security[setting]
    });
    
    toast({
      title: "Security Setting Updated",
      description: `${security[setting] ? 'Disabled' : 'Enabled'} ${setting}.`
    });
  };
  
  // Handle logout
  const handleLogout = () => {
    toast({
      title: "Logging Out",
      description: "You have been logged out successfully."
    });
    
    // In a real app, this would redirect to login page
    window.location.href = '/auth/signin';
  };
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-medium">Settings</h3>
              </div>
              
              <div className="p-2">
                <div className="flex flex-col items-stretch h-auto bg-transparent border-none p-0">
                  <button 
                    onClick={() => setActiveTab('account')} 
                    className={`flex items-center justify-start mb-1 rounded-lg px-3 py-2 text-sm ${activeTab === 'account' ? 'bg-willtank-50 text-willtank-700' : 'hover:bg-gray-100'}`}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </button>
                  <button 
                    onClick={() => setActiveTab('security')} 
                    className={`flex items-center justify-start mb-1 rounded-lg px-3 py-2 text-sm ${activeTab === 'security' ? 'bg-willtank-50 text-willtank-700' : 'hover:bg-gray-100'}`}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Security
                  </button>
                  <button 
                    onClick={() => setActiveTab('notifications')} 
                    className={`flex items-center justify-start mb-1 rounded-lg px-3 py-2 text-sm ${activeTab === 'notifications' ? 'bg-willtank-50 text-willtank-700' : 'hover:bg-gray-100'}`}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </button>
                  <button 
                    onClick={() => setActiveTab('billing')} 
                    className={`flex items-center justify-start mb-1 rounded-lg px-3 py-2 text-sm ${activeTab === 'billing' ? 'bg-willtank-50 text-willtank-700' : 'hover:bg-gray-100'}`}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Billing
                  </button>
                  <button 
                    onClick={() => setActiveTab('privacy')} 
                    className={`flex items-center justify-start mb-1 rounded-lg px-3 py-2 text-sm ${activeTab === 'privacy' ? 'bg-willtank-50 text-willtank-700' : 'hover:bg-gray-100'}`}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Privacy
                  </button>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Settings content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden">
              <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
              </TabsList>
            
              <TabsContent value="account" className="m-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center">
                      <User className="text-willtank-700 mr-2" size={18} />
                      <h3 className="font-medium">Account Information</h3>
                    </div>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                      <div className="flex-1 space-y-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                          <Input 
                            id="firstName" 
                            value={profile.firstName} 
                            onChange={e => setProfile({...profile, firstName: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={profile.email} 
                            onChange={e => setProfile({...profile, email: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <Input 
                            id="lastName" 
                            value={profile.lastName} 
                            onChange={e => setProfile({...profile, lastName: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <Input 
                            id="phone" 
                            value={profile.phone} 
                            onChange={e => setProfile({...profile, phone: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button onClick={handleProfileUpdate} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <Trash2 className="text-red-500 mr-2" size={18} />
                    <h3 className="font-medium text-red-500">Danger Zone</h3>
                  </div>
                  
                  <div className="p-6">
                    <h4 className="font-medium mb-2">Delete Account</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="destructive" onClick={() => toast({
                      title: "Are you sure?",
                      description: "Deleting your account is permanent. All your data will be wiped.",
                      variant: "destructive"
                    })}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="security" className="m-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <Shield className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Security Settings</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Switch 
                          checked={security.twoFactorEnabled} 
                          onCheckedChange={() => toggleSecurity('twoFactorEnabled')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Login Notifications</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Receive notifications when someone logs into your account
                          </p>
                        </div>
                        <Switch 
                          checked={security.loginNotifications} 
                          onCheckedChange={() => toggleSecurity('loginNotifications')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Document Encryption</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Encrypt all your documents with AES-256 encryption
                          </p>
                        </div>
                        <Switch 
                          checked={security.documentEncryption} 
                          onCheckedChange={() => toggleSecurity('documentEncryption')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Biometric Login</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Use fingerprint or face recognition to log in on supported devices
                          </p>
                        </div>
                        <Switch 
                          checked={security.biometricLogin} 
                          onCheckedChange={() => toggleSecurity('biometricLogin')}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <Key className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Password</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Change Password</h4>
                      <p className="text-gray-600 text-sm mb-4">
                        Ensure your account is using a strong, secure password
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                          <Input id="currentPassword" type="password" />
                        </div>
                        
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                          <Input id="newPassword" type="password" />
                        </div>
                        
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                          <Input id="confirmPassword" type="password" />
                        </div>
                      </div>
                    </div>
                    
                    <Button onClick={() => toast({
                      title: "Password Updated",
                      description: "Your password has been changed successfully."
                    })}>
                      <Save className="mr-2 h-4 w-4" />
                      Update Password
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="notifications" className="m-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <Bell className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Notification Preferences</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-6">
                      <h4 className="font-medium mb-4">Notification Channels</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Mail className="h-5 w-5 text-gray-400 mr-3" />
                            <span>Email Notifications</span>
                          </div>
                          <Switch 
                            checked={notifications.email} 
                            onCheckedChange={() => toggleNotification('email')}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Smartphone className="h-5 w-5 text-gray-400 mr-3" />
                            <span>SMS Notifications</span>
                          </div>
                          <Switch 
                            checked={notifications.sms} 
                            onCheckedChange={() => toggleNotification('sms')}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-4">Notification Types</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium">Document Updates</h5>
                            <p className="text-xs text-gray-500">Notifications about changes to your documents</p>
                          </div>
                          <Switch 
                            checked={notifications.documentUpdates} 
                            onCheckedChange={() => toggleNotification('documentUpdates')}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium">Security Alerts</h5>
                            <p className="text-xs text-gray-500">Notifications about security-related events</p>
                          </div>
                          <Switch 
                            checked={notifications.securityAlerts} 
                            onCheckedChange={() => toggleNotification('securityAlerts')}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium">Marketing Emails</h5>
                            <p className="text-xs text-gray-500">Promotional emails and offers</p>
                          </div>
                          <Switch 
                            checked={notifications.marketingEmails} 
                            onCheckedChange={() => toggleNotification('marketingEmails')}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium">Executor Invitations</h5>
                            <p className="text-xs text-gray-500">Notifications about executor invitations and responses</p>
                          </div>
                          <Switch 
                            checked={notifications.executorInvitations} 
                            onCheckedChange={() => toggleNotification('executorInvitations')}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium">WillTank Updates</h5>
                            <p className="text-xs text-gray-500">Notifications about new features and updates</p>
                          </div>
                          <Switch 
                            checked={notifications.willtankUpdates} 
                            onCheckedChange={() => toggleNotification('willtankUpdates')}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="billing" className="m-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <CreditCard className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Billing Information</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="inline-flex items-center gap-2 rounded-full bg-willtank-100 px-3 py-1 text-sm font-medium text-willtank-700">
                        <Check size={14} />
                        <span>Premium Plan</span>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium">Subscription Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <div>
                            <p className="text-sm text-gray-500">Plan</p>
                            <p className="font-medium">Premium ($199.99/year)</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Next Billing Date</p>
                            <p className="font-medium">July 15, 2024</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Payment Method</p>
                            <p className="font-medium">•••• •••• •••• 4242</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Billing Address</p>
                            <p className="font-medium">123 Main St, Anytown, USA</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="outline">Update Payment Method</Button>
                      <Button variant="outline">Billing History</Button>
                      <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        Cancel Subscription
                      </Button>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <Globe className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Available Plans</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <h4 className="font-medium">Basic Plan</h4>
                        <p className="text-2xl font-bold my-2">$99<span className="text-sm font-normal text-gray-500">/year</span></p>
                        <ul className="space-y-2 mb-4">
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            1 will document
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            Basic templates
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            1 year of secure storage
                          </li>
                        </ul>
                        <Button variant="outline" size="sm" className="w-full">
                          Downgrade
                        </Button>
                      </div>
                      
                      <div className="border-2 border-willtank-300 rounded-lg p-4 shadow-sm relative">
                        <div className="absolute -top-3 -right-3 bg-willtank-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Current
                        </div>
                        <h4 className="font-medium">Premium Plan</h4>
                        <p className="text-2xl font-bold my-2">$199<span className="text-sm font-normal text-gray-500">/year</span></p>
                        <ul className="space-y-2 mb-4">
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            Unlimited will documents
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            All premium templates
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            5 years of secure storage
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            Advanced legal analysis
                          </li>
                        </ul>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <h4 className="font-medium">Lifetime Plan</h4>
                        <p className="text-2xl font-bold my-2">$499<span className="text-sm font-normal text-gray-500">/once</span></p>
                        <ul className="space-y-2 mb-4">
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            All Premium features
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            Lifetime storage
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            Unlimited updates
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            Priority support
                          </li>
                        </ul>
                        <Button variant="outline" size="sm" className="w-full">
                          Upgrade
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="privacy" className="m-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <Lock className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Privacy Settings</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Data Collection</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Allow WillTank to collect anonymous usage data to improve our service
                          </p>
                        </div>
                        <Switch checked={true} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Cookie Preferences</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Manage your cookie preferences and tracking
                          </p>
                        </div>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Data Export</h4>
                        <p className="text-sm text-gray-500 mb-4">
                          Download a copy of all your data stored on WillTank
                        </p>
                        <Button variant="outline" onClick={() => toast({
                          title: "Data Export Requested",
                          description: "Your data export is being prepared and will be emailed to you within 24 hours."
                        })}>
                          Request Data Export
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
            
            {activeTab === 'account' && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center">
                      <User className="text-willtank-700 mr-2" size={18} />
                      <h3 className="font-medium">Account Information</h3>
                    </div>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                      <div className="flex-1 space-y-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                          <Input 
                            id="firstName" 
                            value={profile.firstName} 
                            onChange={e => setProfile({...profile, firstName: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={profile.email} 
                            onChange={e => setProfile({...profile, email: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <Input 
                            id="lastName" 
                            value={profile.lastName} 
                            onChange={e => setProfile({...profile, lastName: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <Input 
                            id="phone" 
                            value={profile.phone} 
                            onChange={e => setProfile({...profile, phone: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button onClick={handleProfileUpdate} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <Trash2 className="text-red-500 mr-2" size={18} />
                    <h3 className="font-medium text-red-500">Danger Zone</h3>
                  </div>
                  
                  <div className="p-6">
                    <h4 className="font-medium mb-2">Delete Account</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="destructive" onClick={() => toast({
                      title: "Are you sure?",
                      description: "Deleting your account is permanent. All your data will be wiped.",
                      variant: "destructive"
                    })}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </motion.div>
              </>
            )}
            
            {activeTab === 'security' && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <Shield className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Security Settings</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Switch 
                          checked={security.twoFactorEnabled} 
                          onCheckedChange={() => toggleSecurity('twoFactorEnabled')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Login Notifications</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Receive notifications when someone logs into your account
                          </p>
                        </div>
                        <Switch 
                          checked={security.loginNotifications} 
                          onCheckedChange={() => toggleSecurity('loginNotifications')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Document Encryption</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Encrypt all your documents with AES-256 encryption
                          </p>
                        </div>
                        <Switch 
                          checked={security.documentEncryption} 
                          onCheckedChange={() => toggleSecurity('documentEncryption')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Biometric Login</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Use fingerprint or face recognition to log in on supported devices
                          </p>
                        </div>
                        <Switch 
                          checked={security.biometricLogin} 
                          onCheckedChange={() => toggleSecurity('biometricLogin')}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <Key className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Password</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Change Password</h4>
                      <p className="text-gray-600 text-sm mb-4">
                        Ensure your account is using a strong, secure password
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                          <Input id="currentPassword" type="password" />
                        </div>
                        
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                          <Input id="newPassword" type="password" />
                        </div>
                        
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                          <Input id="confirmPassword" type="password" />
                        </div>
                      </div>
                    </div>
                    
                    <Button onClick={() => toast({
                      title: "Password Updated",
                      description: "Your password has been changed successfully."
                    })}>
                      <Save className="mr-2 h-4 w-4" />
                      Update Password
                    </Button>
                  </div>
                </motion.div>
              </>
            )}
            
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                  <Bell className="text-willtank-700 mr-2" size={18} />
                  <h3 className="font-medium">Notification Preferences</h3>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <h4 className="font-medium mb-4">Notification Channels</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-gray-400 mr-3" />
                          <span>Email Notifications</span>
                        </div>
                        <Switch 
                          checked={notifications.email} 
                          onCheckedChange={() => toggleNotification('email')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Smartphone className="h-5 w-5 text-gray-400 mr-3" />
                          <span>SMS Notifications</span>
                        </div>
                        <Switch 
                          checked={notifications.sms} 
                          onCheckedChange={() => toggleNotification('sms')}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-4">Notification Types</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium">Document Updates</h5>
                          <p className="text-xs text-gray-500">Notifications about changes to your documents</p>
                        </div>
                        <Switch 
                          checked={notifications.documentUpdates} 
                          onCheckedChange={() => toggleNotification('documentUpdates')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium">Security Alerts</h5>
                          <p className="text-xs text-gray-500">Notifications about security-related events</p>
                        </div>
                        <Switch 
                          checked={notifications.securityAlerts} 
                          onCheckedChange={() => toggleNotification('securityAlerts')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium">Marketing Emails</h5>
                          <p className="text-xs text-gray-500">Promotional emails and offers</p>
                        </div>
                        <Switch 
                          checked={notifications.marketingEmails} 
                          onCheckedChange={() => toggleNotification('marketingEmails')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium">Executor Invitations</h5>
                          <p className="text-xs text-gray-500">Notifications about executor invitations and responses</p>
                        </div>
                        <Switch 
                          checked={notifications.executorInvitations} 
                          onCheckedChange={() => toggleNotification('executorInvitations')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium">WillTank Updates</h5>
                          <p className="text-xs text-gray-500">Notifications about new features and updates</p>
                        </div>
                        <Switch 
                          checked={notifications.willtankUpdates} 
                          onCheckedChange={() => toggleNotification('willtankUpdates')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'billing' && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <CreditCard className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Billing Information</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="inline-flex items-center gap-2 rounded-full bg-willtank-100 px-3 py-1 text-sm font-medium text-willtank-700">
                        <Check size={14} />
                        <span>Premium Plan</span>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium">Subscription Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <div>
                            <p className="text-sm text-gray-500">Plan</p>
                            <p className="font-medium">Premium ($199.99/year)</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Next Billing Date</p>
                            <p className="font-medium">July 15, 2024</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Payment Method</p>
                            <p className="font-medium">•••• •••• •••• 4242</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Billing Address</p>
                            <p className="font-medium">123 Main St, Anytown, USA</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="outline">Update Payment Method</Button>
                      <Button variant="outline">Billing History</Button>
                      <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        Cancel Subscription
                      </Button>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <Globe className="text-willtank-700 mr-2" size={18} />
                    <h3 className="font-medium">Available Plans</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <h4 className="font-medium">Basic Plan</h4>
                        <p className="text-2xl font-bold my-2">$99<span className="text-sm font-normal text-gray-500">/year</span></p>
                        <ul className="space-y-2 mb-4">
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            1 will document
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            Basic templates
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            1 year of secure storage
                          </li>
                        </ul>
                        <Button variant="outline" size="sm" className="w-full">
                          Downgrade
                        </Button>
                      </div>
                      
                      <div className="border-2 border-willtank-300 rounded-lg p-4 shadow-sm relative">
                        <div className="absolute -top-3 -right-3 bg-willtank-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Current
                        </div>
                        <h4 className="font-medium">Premium Plan</h4>
                        <p className="text-2xl font-bold my-2">$199<span className="text-sm font-normal text-gray-500">/year</span></p>
                        <ul className="space-y-2 mb-4">
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            Unlimited will documents
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            All premium templates
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            5 years of secure storage
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            Advanced legal analysis
                          </li>
                        </ul>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <h4 className="font-medium">Lifetime Plan</h4>
                        <p className="text-2xl font-bold my-2">$499<span className="text-sm font-normal text-gray-500">/once</span></p>
                        <ul className="space-y-2 mb-4">
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            All Premium features
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            Lifetime storage
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            Unlimited updates
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            Priority support
                          </li>
                        </ul>
                        <Button variant="outline" size="sm" className="w-full">
                          Upgrade
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
            
            {activeTab === 'privacy' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                  <Lock className="text-willtank-700 mr-2" size={18} />
                  <h3 className="font-medium">Privacy Settings</h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Data Collection</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Allow WillTank to collect anonymous usage data to improve our service
                        </p>
                      </div>
                      <Switch checked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Cookie Preferences</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Manage your cookie preferences and tracking
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Data Export</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        Download a copy of all your data stored on WillTank
                      </p>
                      <Button variant="outline" onClick={() => toast({
                        title: "Data Export Requested",
                        description: "Your data export is being prepared and will be emailed to you within 24 hours."
                      })}>
                        Request Data Export
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
