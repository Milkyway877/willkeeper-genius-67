import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DeathVerification from './settings/DeathVerification';
import { DeathVerificationWidget } from '@/components/death-verification/DeathVerificationWidget';
import { TrustedContacts } from '@/components/death-verification/TrustedContacts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Clock, Check, Calendar as CalendarIcon, History, Shield, Info, Mail, RefreshCw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { 
  getDeathVerificationSettings, 
  saveDeathVerificationSettings, 
  DEFAULT_SETTINGS,
  getLatestCheckin,
  createInitialCheckin,
  DeathVerificationCheckin
} from '@/services/deathVerificationService';
import { Executor, Beneficiary, getExecutors, getBeneficiaries } from '@/services/executorService';
import { sendContactInvitation } from '@/services/contactsService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

export default function CheckIns() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [checkins, setCheckins] = useState<DeathVerificationCheckin[]>([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [executors, setExecutors] = useState<Executor[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sending, setSending] = useState<Record<string, boolean>>({});
  
  // Get the initial tab from location state or default to 'settings'
  const initialTab = location.state?.activeTab || 'settings';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    console.log('CheckIns: Component mounted or refreshKey changed:', refreshKey);
    fetchData();
  }, [refreshKey]);

  // Handle tab switching from location state
  useEffect(() => {
    if (location.state?.activeTab) {
      console.log('CheckIns: Switching to tab:', location.state.activeTab);
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('CheckIns: Fetching all data...');
      
      // Fetch settings
      const fetchedSettings = await getDeathVerificationSettings();
      if (fetchedSettings) {
        console.log('CheckIns: Settings fetched:', fetchedSettings);
        setSettings(fetchedSettings);
      } else {
        console.log('CheckIns: No settings found, using defaults');
        setSettings(DEFAULT_SETTINGS);
      }
      
      // Fetch check-in history
      const latestCheckin = await getLatestCheckin();
      if (latestCheckin) {
        console.log('CheckIns: Latest checkin:', latestCheckin);
        setCheckins([latestCheckin]);
      } else {
        console.log('CheckIns: No checkins found');
        setCheckins([]);
      }

      // Fetch contacts
      const fetchedExecutors = await getExecutors();
      const fetchedBeneficiaries = await getBeneficiaries();
      console.log('CheckIns: Executors:', fetchedExecutors);
      console.log('CheckIns: Beneficiaries:', fetchedBeneficiaries);
      setExecutors(fetchedExecutors);
      setBeneficiaries(fetchedBeneficiaries);
    } catch (error) {
      console.error('CheckIns: Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load check-in data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Callback function to refresh the data when settings change
  const handleSettingsChange = () => {
    console.log('CheckIns: Settings changed, refreshing data...');
    setRefreshKey(prev => prev + 1);
  };

  const handleContactsChange = () => {
    console.log('CheckIns: Contacts changed, refreshing data...');
    setRefreshKey(prev => prev + 1);
  };

  const handleSendNotification = async (id: string, type: 'executor' | 'beneficiary', name: string, email: string, isResend = false) => {
    try {
      setSending(prev => ({ ...prev, [`${type}-${id}`]: true }));
      
      const success = await sendContactInvitation({
        contactId: id,
        contactType: type,
        name,
        email,
        userId: '',
      });
      
      if (success) {
        toast({
          title: isResend ? "Notification Resent" : "Notification Sent",
          description: `${name} has been notified about their ${type} role.`,
        });
        await fetchData();
      } else {
        throw new Error("Failed to send notification");
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(prev => ({ ...prev, [`${type}-${id}`]: false }));
    }
  };

  const getStatusBadge = (invitation_status?: string) => {
    if (!invitation_status || invitation_status === 'not_sent') {
      return <Badge variant="outline" className="bg-gray-100">Not Notified</Badge>;
    } else if (invitation_status === 'sent' || invitation_status === 'notified') {
      return <Badge variant="outline" className="bg-green-100 text-green-800">Notified</Badge>;
    } else if (invitation_status === 'failed') {
      return <Badge variant="outline" className="bg-red-100 text-red-800">Failed</Badge>;
    }
    return <Badge variant="outline">{invitation_status}</Badge>;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Check-ins</h1>
          <p className="text-gray-600">Manage your check-in settings and automated protection system.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <DeathVerificationWidget key={refreshKey} />
          </div>
          <div className="md:col-span-1">
            <div className="bg-willtank-50 rounded-xl shadow-sm border border-willtank-100 p-4">
              <h2 className="text-lg font-medium text-willtank-800 mb-2">About Check-ins</h2>
              <p className="text-sm text-willtank-700 mb-4">
                The Check-in System ensures your will is only accessible upon verified absence.
                Regular check-ins confirm you're still alive, and if you stop responding,
                your trusted contacts will be asked to verify your status.
              </p>
              <h3 className="text-md font-medium text-willtank-800 mb-1">Key Features:</h3>
              <ul className="text-sm text-willtank-700 space-y-1 list-disc pl-5 mb-2">
                <li>Regular check-in reminders by email</li>
                <li>Multi-contact verification system</li>
                <li>PIN-protected will access</li>
              </ul>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 border-b w-full justify-start rounded-none pb-0">
            <TabsTrigger value="settings" className="rounded-t-lg rounded-b-none border-b-0">Settings</TabsTrigger>
            <TabsTrigger value="contacts" className="rounded-t-lg rounded-b-none border-b-0">Manage Contacts</TabsTrigger>
            <TabsTrigger value="history" className="rounded-t-lg rounded-b-none border-b-0">Check-in History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings">
            <DeathVerification onSettingsChange={handleSettingsChange} />
          </TabsContent>

          <TabsContent value="contacts">
            <div className="space-y-6">
              {/* Trusted Contacts Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-willtank-600" />
                    Trusted Contacts
                  </CardTitle>
                  <CardDescription>
                    Manage trusted contacts who can verify your status and receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TrustedContacts onContactsChange={handleContactsChange} />
                </CardContent>
              </Card>

              {/* Executors Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-willtank-600" />
                    Executors
                  </CardTitle>
                  <CardDescription>
                    Executors will be notified of their role and can help with will execution when the time comes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {executors.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <User className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <h3 className="font-medium mb-1">No executors found</h3>
                      <p className="text-sm">Add executors in the will settings to enable them for check-ins</p>
                      <Link to="/wills">
                        <Button variant="outline" className="mt-3">
                          Go to Will Settings
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Notification Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {executors.map(executor => (
                          <TableRow key={executor.id}>
                            <TableCell className="font-medium">{executor.name}</TableCell>
                            <TableCell>{executor.email || <span className="text-gray-400">Not set</span>}</TableCell>
                            <TableCell>
                              {getStatusBadge(executor.invitation_status)}
                            </TableCell>
                            <TableCell className="text-right">
                              {executor.email ? (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  disabled={sending[`executor-${executor.id}`]}
                                  onClick={() => handleSendNotification(
                                    executor.id, 
                                    'executor', 
                                    executor.name, 
                                    executor.email!,
                                    executor.invitation_status === 'sent' || executor.invitation_status === 'notified'
                                  )}
                                >
                                  {sending[`executor-${executor.id}`] ? (
                                    <>
                                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                                      Sending...
                                    </>
                                  ) : (
                                    <>
                                      {(executor.invitation_status === 'sent' || executor.invitation_status === 'notified') ? (
                                        <>
                                          <RefreshCw className="mr-2 h-4 w-4" />
                                          Resend Notification
                                        </>
                                      ) : (
                                        <>
                                          <Mail className="mr-2 h-4 w-4" />
                                          Send Notification
                                        </>
                                      )}
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <span className="text-gray-400 text-sm">No email</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Beneficiaries Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-willtank-600" />
                    Beneficiaries
                  </CardTitle>
                  <CardDescription>
                    Beneficiaries will be notified of their role and can help verify your status if you miss check-ins
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {beneficiaries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <User className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <h3 className="font-medium mb-1">No beneficiaries found</h3>
                      <p className="text-sm">Add beneficiaries in the will settings to enable them for check-ins</p>
                      <Link to="/wills">
                        <Button variant="outline" className="mt-3">
                          Go to Will Settings
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Notification Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {beneficiaries.map(beneficiary => (
                          <TableRow key={beneficiary.id}>
                            <TableCell className="font-medium">{beneficiary.name}</TableCell>
                            <TableCell>{beneficiary.email || <span className="text-gray-400">Not set</span>}</TableCell>
                            <TableCell>
                              {getStatusBadge(beneficiary.invitation_status)}
                            </TableCell>
                            <TableCell className="text-right">
                              {beneficiary.email ? (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  disabled={sending[`beneficiary-${beneficiary.id}`]}
                                  onClick={() => handleSendNotification(
                                    beneficiary.id, 
                                    'beneficiary', 
                                    beneficiary.name, 
                                    beneficiary.email!,
                                    beneficiary.invitation_status === 'sent' || beneficiary.invitation_status === 'notified'
                                  )}
                                >
                                  {sending[`beneficiary-${beneficiary.id}`] ? (
                                    <>
                                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                                      Sending...
                                    </>
                                  ) : (
                                    <>
                                      {(beneficiary.invitation_status === 'sent' || beneficiary.invitation_status === 'notified') ? (
                                        <>
                                          <RefreshCw className="mr-2 h-4 w-4" />
                                          Resend Notification
                                        </>
                                      ) : (
                                        <>
                                          <Mail className="mr-2 h-4 w-4" />
                                          Send Notification
                                        </>
                                      )}
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <span className="text-gray-400 text-sm">No email</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Important Notice */}
              <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                <h3 className="font-medium mb-2 flex items-center text-blue-800">
                  <Info className="mr-2 h-4 w-4" />
                  Important Notice
                </h3>
                <p className="text-sm text-blue-700 mb-2">
                  All contacts listed above will be automatically notified of their roles. They don't need to confirm or accept anything through the system.
                </p>
                <p className="text-sm text-blue-700">
                  If any contact wishes to decline their role, they should contact you directly and you can manually remove them from your will.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="mr-2 h-5 w-5 text-willtank-600" />
                  Check-in History
                </CardTitle>
                <CardDescription>
                  View your past check-ins and verification activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {checkins.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="font-medium mb-1">No check-in history yet</h3>
                    <p className="text-sm">Your check-in history will appear here once you enable check-ins</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Next Check-in</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {checkins.map(checkin => (
                        <TableRow key={checkin.id}>
                          <TableCell>
                            {format(parseISO(checkin.checked_in_at), 'PPP')}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {checkin.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {format(parseISO(checkin.next_check_in), 'PPP')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
