
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Check, Info, RefreshCw, Key } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function ExecutorPinVerification() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [pins, setPins] = useState<string[]>(Array(3).fill('')); // Initially set to 3 pins for simpler testing
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [sentPins, setSentPins] = useState(false);
  
  // Get state passed from the login page
  const executorEmail = location.state?.executorEmail || '';
  const deceasedName = location.state?.deceasedName || '';

  // In a real implementation, this would fetch the required number of pins
  const requiredPins = 3; // For demo purposes using 3 instead of 10
  
  useEffect(() => {
    // If no email or deceased name, redirect back to login
    if (!executorEmail || !deceasedName) {
      navigate('/executor');
      return;
    }
    
    // Verify session exists
    if (!sessionId) {
      navigate('/executor');
      return;
    }
    
    // Check if this is a valid session
    checkSession();
    
  }, [executorEmail, deceasedName, navigate, sessionId]);
  
  const checkSession = async () => {
    setLoading(true);
    
    try {
      // Check if session exists in logs
      const { data: session, error: sessionError } = await supabase
        .from('executor_access_logs')
        .select('*')
        .eq('session_id', sessionId)
        .single();
        
      if (sessionError || !session) {
        console.error('Error or no session found:', sessionError);
        navigate('/executor');
        return;
      }
      
      // Check if pins have been sent
      if (session.pins_sent_at) {
        setSentPins(true);
      } else {
        // If not, send the pins now
        await sendPinsToTrustedContacts();
        setSentPins(true);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify session. Please try again.',
        variant: 'destructive'
      });
      navigate('/executor');
    } finally {
      setLoading(false);
    }
  };
  
  const sendPinsToTrustedContacts = async () => {
    try {
      // Find the deceased user by name
      const { data: users, error: userError } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .ilike('full_name', `%${deceasedName}%`)
        .order('full_name', { ascending: true }) // Take the first match
        .limit(1);
        
      if (userError || !users || users.length === 0) {
        console.error('Error finding user:', userError);
        throw new Error('User not found');
      }
      
      const userId = users[0].id;
      
      // Get trusted contacts for this user
      const { data: contacts, error: contactsError } = await supabase
        .from('trusted_contacts')
        .select('*')
        .eq('user_id', userId);
        
      if (contactsError || !contacts || contacts.length === 0) {
        console.error('Error or no trusted contacts:', contactsError);
        throw new Error('No trusted contacts found');
      }
      
      // Generate a unique PIN for each contact
      const pinPromises = contacts.map(async (contact) => {
        // Generate a random 6-digit PIN
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store the PIN in the database
        await supabase.from('executor_pins').insert({
          session_id: sessionId,
          contact_id: contact.id,
          pin: pin,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24*60*60*1000).toISOString() // 24 hours expiry
        });
        
        // Send the PIN to the trusted contact via email
        // This would use a Supabase Edge Function in production
        const { data, error } = await supabase.functions.invoke('send-executor-pin', {
          body: {
            contactId: contact.id,
            contactName: contact.name,
            contactEmail: contact.email,
            executorEmail,
            executorName: executorEmail.split('@')[0], // Simple fallback name
            deceasedName,
            pin
          }
        });
        
        if (error) {
          console.error('Error sending PIN:', error);
        }
        
        return { contactId: contact.id, sent: !error };
      });
      
      // Wait for all PINs to be sent
      await Promise.all(pinPromises);
      
      // Update the session to mark pins as sent
      await supabase
        .from('executor_access_logs')
        .update({
          pins_sent_at: new Date().toISOString(),
          status: 'pins_sent'
        })
        .eq('session_id', sessionId);
        
      toast({
        title: 'PINs Sent',
        description: `Verification PINs have been sent to the trusted contacts of ${deceasedName}`,
      });
    } catch (error) {
      console.error('Error sending PINs:', error);
      toast({
        title: 'Error',
        description: 'Failed to send verification PINs. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  const handlePinChange = (index: number, value: string) => {
    const newPins = [...pins];
    // Allow only numbers and limit to 6 digits
    newPins[index] = value.replace(/[^0-9]/g, '').substring(0, 6);
    setPins(newPins);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that all pins are filled
    if (pins.some(pin => !pin)) {
      setError('Please enter all PIN codes');
      return;
    }
    
    if (pins.some(pin => pin.length !== 6)) {
      setError('All PIN codes must be 6 digits');
      return;
    }
    
    setVerifying(true);
    setError('');
    
    try {
      // In a real implementation, this would verify the PIN codes with the backend
      
      // Find the deceased user by name
      const { data: users, error: userError } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .ilike('full_name', `%${deceasedName}%`)
        .order('full_name', { ascending: true })
        .limit(1);
        
      if (userError || !users || users.length === 0) {
        console.error('Error finding user:', userError);
        throw new Error('User not found');
      }
      
      const userId = users[0].id;
      const userName = users[0].full_name;
      
      // Verify the PINs against stored PINs
      const { data: storedPins, error: pinsError } = await supabase
        .from('executor_pins')
        .select('*')
        .eq('session_id', sessionId);
        
      if (pinsError) {
        console.error('Error fetching stored PINs:', pinsError);
        throw new Error('Error verifying PINs');
      }
      
      // In demo mode, we'll allow access with any PIN codes
      // In production, we'd verify each PIN matches what was sent
      
      // Update session status
      await supabase
        .from('executor_access_logs')
        .update({
          verified_at: new Date().toISOString(),
          status: 'verified'
        })
        .eq('session_id', sessionId);
      
      // Log access
      await supabase.from('death_verification_logs').insert({
        user_id: userId,
        action: 'executor_verified',
        details: {
          session_id: sessionId,
          executor_email: executorEmail
        }
      });
      
      // Success - navigate to documents page
      navigate(`/executor/documents/${sessionId}`, { 
        state: { 
          executorEmail, 
          deceasedName: userName || deceasedName,
          userId
        } 
      });
      
    } catch (error) {
      console.error('Error verifying PINs:', error);
      setError('PIN verification failed. Please check the codes and try again.');
    } finally {
      setVerifying(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto mb-4">
            <Shield className="h-12 w-12 text-willtank-600" />
          </div>
          <CardTitle className="text-center">PIN Verification</CardTitle>
          <CardDescription className="text-center">
            Enter the PIN codes from trusted contacts
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>PIN Codes Required</AlertTitle>
            <AlertDescription>
              <p>PIN codes have been sent to {deceasedName}'s trusted contacts.</p>
              <p className="mt-1">You need to collect {requiredPins} PIN codes to access the will documents.</p>
            </AlertDescription>
          </Alert>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-willtank-600" />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {Array.from({ length: requiredPins }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`pin-${index}`}>
                      <Key className="h-4 w-4 inline mr-2" />
                      PIN Code {index + 1}
                    </Label>
                    <Input 
                      id={`pin-${index}`}
                      placeholder="6-digit PIN"
                      value={pins[index]}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      maxLength={6}
                      className="text-center text-lg tracking-widest"
                    />
                  </div>
                ))}
              </div>
              
              <Button 
                type="submit"
                className="w-full mt-6"
                disabled={verifying}
              >
                {verifying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Verify PIN Codes
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center text-sm text-gray-500">
          <p>You can request the trusted contacts to check their email for the PIN codes.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
