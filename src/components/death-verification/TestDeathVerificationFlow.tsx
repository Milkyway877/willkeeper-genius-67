import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Clock, 
  AlertTriangle, 
  Check, 
  User, 
  Key, 
  Loader2, 
  ShieldCheck,
  RefreshCw,
  Users,
  Mail
} from 'lucide-react';

export default function TestDeathVerificationFlow() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [statusCheckLoading, setStatusCheckLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [simulateLoading, setSimulateLoading] = useState(false);
  
  const [status, setStatus] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [verificationLink, setVerificationLink] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [pins, setPins] = useState<any[]>([]);
  
  // New states for simulating contacts
  const [testContacts, setTestContacts] = useState<{id: string, name: string, email: string, type: string}[]>([]);
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactType, setNewContactType] = useState<'executor'|'beneficiary'>('beneficiary');
  const [loadingContacts, setLoadingContacts] = useState(false);
  
  // Load existing contacts
  useEffect(() => {
    loadTestContacts();
  }, []);
  
  const loadTestContacts = async () => {
    setLoadingContacts(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoadingContacts(false);
        return;
      }
      
      // Load executors
      const { data: executors } = await supabase
        .from('will_executors')
        .select('id, name, email')
        .eq('user_id', session.user.id);
      
      // Load beneficiaries
      const { data: beneficiaries } = await supabase
        .from('will_beneficiaries')
        .select('id, beneficiary_name, email')
        .eq('user_id', session.user.id);
      
      const contacts = [
        ...(executors?.map(e => ({ id: e.id, name: e.name, email: e.email, type: 'executor' as const })) || []),
        ...(beneficiaries?.map(b => ({ id: b.id, name: b.beneficiary_name, email: b.email || '', type: 'beneficiary' as const })) || []),
      ];
      
      setTestContacts(contacts);
    } catch (error) {
      console.error('Error loading test contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  };
  
  const addTestContact = async () => {
    if (!newContactEmail || !newContactName) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and email for the test contact",
        variant: "destructive"
      });
      return;
    }
    
    setSimulateLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to add test contacts",
          variant: "destructive"
        });
        return;
      }
      
      if (newContactType === 'executor') {
        const { data, error } = await supabase
          .from('will_executors')
          .insert({
            name: newContactName,
            email: newContactEmail,
            user_id: session.user.id,
            status: 'pending'
          })
          .select()
          .single();
          
        if (error) throw error;
        
        setTestContacts(prev => [...prev, {
          id: data.id,
          name: data.name,
          email: data.email,
          type: 'executor'
        }]);
      } else {
        const { data, error } = await supabase
          .from('will_beneficiaries')
          .insert({
            beneficiary_name: newContactName,
            email: newContactEmail,
            user_id: session.user.id,
            relationship: 'Test Contact',
            status: 'pending'
          })
          .select()
          .single();
          
        if (error) throw error;
        
        setTestContacts(prev => [...prev, {
          id: data.id,
          name: data.beneficiary_name,
          email: data.email || '',
          type: 'beneficiary'
        }]);
      }
      
      setNewContactName('');
      setNewContactEmail('');
      
      toast({
        title: "Contact Added",
        description: `Test ${newContactType} has been added successfully`,
      });
      
    } catch (error: any) {
      console.error('Error adding test contact:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add test contact",
        variant: "destructive"
      });
    } finally {
      setSimulateLoading(false);
    }
  };
  
  const removeTestContact = async (id: string, type: string) => {
    try {
      if (type === 'executor') {
        const { error } = await supabase
          .from('will_executors')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('will_beneficiaries')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
      }
      
      setTestContacts(prev => prev.filter(contact => contact.id !== id));
      
      toast({
        title: "Contact Removed",
        description: "Test contact has been removed successfully",
      });
      
    } catch (error: any) {
      console.error('Error removing test contact:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove test contact",
        variant: "destructive"
      });
    }
  };

  // Trigger status check emails to contacts
  const triggerStatusCheck = async () => {
    try {
      setStatusCheckLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to test this feature",
          variant: "destructive"
        });
        return;
      }
      
      // Call the edge function to send status check emails
      const response = await supabase.functions.invoke('send-status-check', {
        body: { userId: session.user.id },
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to send status check emails');
      }
      
      setStatus('Status check emails sent successfully to all contacts. Use the verification link in the emails to mark the user as deceased.');
      
      toast({
        title: "Status Checks Sent",
        description: "Status check emails have been sent to all contacts",
      });
      
    } catch (error: any) {
      console.error('Error sending status check emails:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send status check emails",
        variant: "destructive"
      });
    } finally {
      setStatusCheckLoading(false);
    }
  };
  
  // Simulate a contact reporting the user as deceased
  const simulateContactReport = async () => {
    try {
      setVerificationLoading(true);
      
      if (!verificationToken) {
        toast({
          title: "Error",
          description: "Please enter a verification token",
          variant: "destructive"
        });
        return;
      }
      
      // Call the edge function to process the verification response
      const response = await supabase.functions.invoke('process-verification-response', {
        body: {
          token: verificationToken,
          response: 'deceased',
          type: 'status',
          notes: 'This is a test of the death verification system'
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to process verification response');
      }
      
      setStatus('Contact has reported the user as deceased. The death verification process has been triggered.');
      
      toast({
        title: "Deceased Status Reported",
        description: "A contact has reported the user as deceased",
      });
      
      // Generate PINs now
      await generatePins();
      
    } catch (error: any) {
      console.error('Error processing verification response:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process verification response",
        variant: "destructive"
      });
    } finally {
      setVerificationLoading(false);
    }
  };
  
  // Generate PIN codes for beneficiaries and executors
  const generatePins = async () => {
    try {
      setPinLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      // Create a death verification request
      const { data: settingsData } = await supabase
        .from('death_verification_settings')
        .select('beneficiary_verification_interval, trusted_contact_email')
        .eq('user_id', session.user.id)
        .single();
      
      const interval = settingsData?.beneficiary_verification_interval || 48;
      
      // Create expiration date
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + interval);
      
      // Generate verification token
      const token = crypto.randomUUID();
      
      // Create verification request
      const { data: request, error: requestError } = await supabase
        .from('death_verification_requests')
        .insert({
          user_id: session.user.id,
          status: 'pending',
          verification_token: token,
          verification_link: `https://willtank.com/verify/death/${token}`,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();
      
      if (requestError || !request) {
        throw new Error(requestError?.message || 'Failed to create verification request');
      }
      
      // Update check-in status
      await supabase
        .from('death_verification_checkins')
        .update({ status: 'verification_triggered' })
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      // Get beneficiaries and executors
      const { data: beneficiaries } = await supabase
        .from('will_beneficiaries')
        .select('id, beneficiary_name, email')
        .eq('user_id', session.user.id);
      
      const { data: executors } = await supabase
        .from('will_executors')
        .select('id, name, email')
        .eq('user_id', session.user.id);
      
      const pinResults = [];
      
      // Generate PINs for beneficiaries
      if (beneficiaries && beneficiaries.length > 0) {
        for (const beneficiary of beneficiaries) {
          // Generate PIN
          const pinCode = generatePINCode();
          
          // Store PIN
          const { data: pin, error: pinError } = await supabase
            .from('death_verification_pins')
            .insert({
              person_id: beneficiary.id,
              pin_code: pinCode,
              person_type: 'beneficiary',
              used: false
            })
            .select()
            .single();
          
          if (pinError) {
            console.error(`Error creating PIN for beneficiary ${beneficiary.id}:`, pinError);
            continue;
          }
          
          pinResults.push({
            name: beneficiary.beneficiary_name,
            email: beneficiary.email,
            type: 'beneficiary',
            pin: pinCode
          });
        }
      }
      
      // Generate PINs for executors
      if (executors && executors.length > 0) {
        for (const executor of executors) {
          // Generate PIN
          const pinCode = generatePINCode();
          
          // Store PIN
          const { data: pin, error: pinError } = await supabase
            .from('death_verification_pins')
            .insert({
              person_id: executor.id,
              pin_code: pinCode,
              person_type: 'executor',
              used: false
            })
            .select()
            .single();
          
          if (pinError) {
            console.error(`Error creating PIN for executor ${executor.id}:`, pinError);
            continue;
          }
          
          pinResults.push({
            name: executor.name,
            email: executor.email,
            type: 'executor',
            pin: pinCode
          });
        }
      }
      
      // Generate trusted contact PIN if configured
      if (settingsData?.trusted_contact_email) {
        const pinCode = generatePINCode();
        
        const { error: pinError } = await supabase
          .from('death_verification_pins')
          .insert({
            person_id: session.user.id,
            pin_code: pinCode,
            person_type: 'trusted',
            used: false
          });
        
        if (pinError) {
          console.error('Error creating PIN for trusted contact:', pinError);
        } else {
          pinResults.push({
            name: 'Trusted Contact',
            email: settingsData.trusted_contact_email,
            type: 'trusted',
            pin: pinCode
          });
        }
      }
      
      // Log verification event
      await supabase.from('death_verification_logs').insert({
        user_id: session.user.id,
        action: 'verification_triggered',
        details: {
          request_id: request.id,
          expires_at: request.expires_at,
          pin_count: pinResults.length
        }
      });
      
      setPins(pinResults);
      setVerificationLink(`https://willtank.com/verify/death/${token}`);
      
      setStatus(`PINs generated for ${pinResults.length} contacts. You can now test accessing the will using these PINs.`);
      
      toast({
        title: "PINs Generated",
        description: `Generated ${pinResults.length} PINs for contacts`,
      });
      
    } catch (error: any) {
      console.error('Error generating PINs:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate PINs",
        variant: "destructive"
      });
    } finally {
      setPinLoading(false);
    }
  };
  
  // Reset the verification state
  const resetVerificationState = async () => {
    try {
      setResetLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      // Delete verification PINs
      await supabase
        .from('death_verification_pins')
        .delete()
        .eq('person_type', 'beneficiary');
      
      await supabase
        .from('death_verification_pins')
        .delete()
        .eq('person_type', 'executor');
      
      await supabase
        .from('death_verification_pins')
        .delete()
        .eq('person_type', 'trusted');
      
      // Delete verification requests
      await supabase
        .from('death_verification_requests')
        .delete()
        .eq('user_id', session.user.id);
      
      // Reset check-in status
      const settings = await supabase
        .from('death_verification_settings')
        .select('check_in_frequency')
        .eq('user_id', session.user.id)
        .single();
      
      const frequency = settings.data?.check_in_frequency || 7;
      
      const now = new Date();
      const nextCheckIn = new Date();
      nextCheckIn.setDate(nextCheckIn.getDate() + frequency);
      
      await supabase
        .from('death_verification_checkins')
        .insert({
          user_id: session.user.id,
          status: 'alive',
          checked_in_at: now.toISOString(),
          next_check_in: nextCheckIn.toISOString()
        });
      
      // Log reset event
      await supabase.from('death_verification_logs').insert({
        user_id: session.user.id,
        action: 'test_reset',
        details: {
          reset_time: now.toISOString()
        }
      });
      
      setPins([]);
      setVerificationLink('');
      setStatus('Verification state has been reset. The user is now marked as alive.');
      
      toast({
        title: "Reset Complete",
        description: "Death verification test state has been reset",
      });
      
    } catch (error: any) {
      console.error('Error resetting verification state:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reset verification state",
        variant: "destructive"
      });
    } finally {
      setResetLoading(false);
    }
  };
  
  // Generate a 10-digit PIN code
  const generatePINCode = (): string => {
    const digits = '0123456789';
    let pin = '';
    for (let i = 0; i < 10; i++) {
      pin += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return pin;
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
            Death Verification Testing Tool
          </CardTitle>
          <CardDescription>
            This tool allows you to test the death verification flow without waiting for missed check-ins
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Testing Mode</AlertTitle>
            <AlertDescription>
              This tool is for testing only. It will simulate the death verification process without affecting the real check-in system.
            </AlertDescription>
          </Alert>
          
          {status && (
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Clock className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-blue-700">Status Update</AlertTitle>
              <AlertDescription className="text-blue-600">
                {status}
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="setup">Setup Contacts</TabsTrigger>
              <TabsTrigger value="step1">Send Status Check</TabsTrigger>
              <TabsTrigger value="step2">Report Status</TabsTrigger>
              <TabsTrigger value="step3">PIN Access</TabsTrigger>
              <TabsTrigger value="step4">Reset Test</TabsTrigger>
            </TabsList>
            
            {/* Setup Contacts Tab */}
            <TabsContent value="setup" className="p-4 border rounded-md mt-4">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Setup Test Contacts
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Add test executors and beneficiaries to simulate the death verification flow. 
                These contacts will receive the status check emails and PIN codes.
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="contact-name">Name</Label>
                    <Input 
                      id="contact-name" 
                      placeholder="Contact Name" 
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-email">Email</Label>
                    <Input 
                      id="contact-email" 
                      placeholder="contact@example.com" 
                      type="email"
                      value={newContactEmail}
                      onChange={(e) => setNewContactEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-type">Type</Label>
                    <select 
                      id="contact-type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newContactType}
                      onChange={(e) => setNewContactType(e.target.value as 'executor' | 'beneficiary')}
                    >
                      <option value="beneficiary">Beneficiary</option>
                      <option value="executor">Executor</option>
                    </select>
                  </div>
                </div>
                
                <Button 
                  onClick={addTestContact}
                  disabled={simulateLoading || !newContactName || !newContactEmail}
                  className="w-full"
                >
                  {simulateLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding Contact...
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 mr-2" />
                      Add Test Contact
                    </>
                  )}
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h4 className="text-md font-medium mb-2">Current Test Contacts</h4>
                {loadingContacts ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  </div>
                ) : testContacts.length > 0 ? (
                  <div className="rounded-md border">
                    <div className="bg-gray-50 p-2 grid grid-cols-12 text-sm font-medium">
                      <div className="col-span-4">Name</div>
                      <div className="col-span-5">Email</div>
                      <div className="col-span-2">Type</div>
                      <div className="col-span-1"></div>
                    </div>
                    <div className="divide-y">
                      {testContacts.map((contact) => (
                        <div key={contact.id} className="p-3 grid grid-cols-12 items-center">
                          <div className="col-span-4 font-medium">{contact.name}</div>
                          <div className="col-span-5 text-gray-600">{contact.email}</div>
                          <div className="col-span-2 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              contact.type === 'executor' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {contact.type}
                            </span>
                          </div>
                          <div className="col-span-1 text-right">
                            <button 
                              onClick={() => removeTestContact(contact.id, contact.type)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove contact"
                            >
                              &times;
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 border rounded-md bg-gray-50">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <h4 className="text-lg font-medium mb-1">No Test Contacts</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Add test contacts to simulate the death verification flow
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="step1" className="p-4 border rounded-md mt-4">
              <h3 className="text-lg font-medium mb-2">Step 1: Send Status Check Emails</h3>
              <p className="text-sm text-gray-600 mb-4">
                This will send status check emails to all contacts (beneficiaries and executors).
                The emails will contain links to report the user as alive or deceased.
              </p>
              
              <Button 
                onClick={triggerStatusCheck}
                disabled={statusCheckLoading}
                className="w-full"
              >
                {statusCheckLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending Status Check Emails...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Status Check Emails
                  </>
                )}
              </Button>
            </TabsContent>
            
            <TabsContent value="step2" className="p-4 border rounded-md mt-4">
              <h3 className="text-lg font-medium mb-2">Step 2: Report User as Deceased</h3>
              <p className="text-sm text-gray-600 mb-4">
                Simulate a contact reporting the user as deceased using a verification token.
                You can get this token from the verification link in the status check email.
              </p>
              
              <div className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="verification-token">Verification Token</Label>
                  <Input 
                    id="verification-token" 
                    placeholder="Enter the verification token from the email" 
                    value={verificationToken}
                    onChange={(e) => setVerificationToken(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    This is the token part from the verification link in the email
                  </p>
                </div>
                
                <Button 
                  onClick={simulateContactReport}
                  disabled={verificationLoading || !verificationToken}
                  className="w-full"
                >
                  {verificationLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Report User as Deceased
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="step3" className="p-4 border rounded-md mt-4">
              <h3 className="text-lg font-medium mb-2">Step 3: PIN Access</h3>
              <p className="text-sm text-gray-600 mb-4">
                View generated PINs for contacts and manually generate them if needed.
              </p>
              
              {pins.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <div className="bg-gray-50 p-2 text-sm font-medium">Generated PINs</div>
                    <div className="divide-y">
                      {pins.map((pin, index) => (
                        <div key={index} className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{pin.name}</div>
                              <div className="text-sm text-gray-500">{pin.email} ({pin.type})</div>
                            </div>
                            <div className="text-lg font-mono bg-gray-50 px-3 py-1 rounded border">
                              {pin.pin}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {verificationLink && (
                    <div className="p-3 border rounded-md">
                      <div className="font-medium mb-1">Verification Link:</div>
                      <div className="text-sm mb-2 break-all">{verificationLink}</div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          navigator.clipboard.writeText(verificationLink);
                          toast({
                            title: "Copied",
                            description: "Verification link copied to clipboard",
                          });
                        }}
                      >
                        Copy Link
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-8 border rounded-md bg-gray-50">
                  <Key className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <h4 className="text-lg font-medium mb-1">No PINs Generated Yet</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Generate PINs by completing Step 2 or click the button below
                  </p>
                  <Button 
                    onClick={generatePins}
                    disabled={pinLoading}
                    variant="outline"
                  >
                    {pinLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating PINs...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Generate PINs Manually
                      </>
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="step4" className="p-4 border rounded-md mt-4">
              <h3 className="text-lg font-medium mb-2">Reset Test State</h3>
              <p className="text-sm text-gray-600 mb-4">
                Reset the verification state to allow for new tests. This will:
              </p>
              <ul className="list-disc pl-5 mb-4 text-sm text-gray-600 space-y-1">
                <li>Delete generated PIN codes</li>
                <li>Delete verification requests</li>
                <li>Reset check-in status to alive</li>
                <li>Create a new check-in record</li>
              </ul>
              
              <Button 
                onClick={resetVerificationState}
                disabled={resetLoading}
                variant="destructive"
                className="w-full"
              >
                {resetLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Verification State
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-gray-500">
            This tool is for testing the death verification flow only. It does not affect the actual death verification status
            of the user, except during the testing process.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
