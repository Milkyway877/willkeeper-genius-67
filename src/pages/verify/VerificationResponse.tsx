
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { AlertTriangle, Check, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function VerificationResponse() {
  const navigate = useNavigate();
  const { type, token } = useParams();
  const [searchParams] = useSearchParams();
  const autoResponse = searchParams.get('response');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [verificationDetails, setVerificationDetails] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  
  useEffect(() => {
    if (!token || !type) {
      setError('Invalid verification token or type');
      setLoading(false);
      return;
    }
    
    if (type !== 'invitation' && type !== 'status') {
      setError('Invalid verification type');
      setLoading(false);
      return;
    }
    
    fetchVerificationDetails();
  }, [token, type]);
  
  // Auto-submit if response is in URL params (for status checks)
  useEffect(() => {
    if (autoResponse && type === 'status' && token && verificationDetails && !processing && !success) {
      if (autoResponse === 'alive' || autoResponse === 'deceased') {
        handleSubmit(autoResponse);
      }
    }
  }, [autoResponse, type, token, verificationDetails, processing, success]);
  
  const fetchVerificationDetails = async () => {
    try {
      setLoading(true);
      
      let details = null;
      
      if (type === 'invitation') {
        // For invitations, we look in the logs
        const { data, error } = await supabase
          .from('death_verification_logs')
          .select('details')
          .eq('action', 'invitation_sent')
          .eq('details->verification_token', token)
          .single();
        
        if (error || !data) {
          console.error('Error fetching invitation details:', error);
          setError('This invitation link is invalid or has expired');
          return;
        }
        
        details = data.details;
      } else if (type === 'status') {
        // For status checks, we look in the contact_verifications table
        const { data, error } = await supabase
          .from('contact_verifications')
          .select('*')
          .eq('verification_token', token)
          .single();
        
        if (error || !data) {
          console.error('Error fetching verification details:', error);
          setError('This verification link is invalid or has expired');
          return;
        }
        
        if (new Date(data.expires_at) < new Date()) {
          setError('This verification link has expired');
          return;
        }
        
        if (data.responded_at) {
          setSuccess(true);
          setVerificationDetails(data);
          return;
        }
        
        // Get contact info
        let contactInfo = null;
        if (data.contact_type === 'beneficiary') {
          const { data: beneficiary } = await supabase
            .from('will_beneficiaries')
            .select('beneficiary_name')
            .eq('id', data.contact_id)
            .single();
          
          if (beneficiary) {
            contactInfo = { name: beneficiary.beneficiary_name };
          }
        } else if (data.contact_type === 'executor') {
          const { data: executor } = await supabase
            .from('will_executors')
            .select('name')
            .eq('id', data.contact_id)
            .single();
          
          if (executor) {
            contactInfo = { name: executor.name };
          }
        } else if (data.contact_type === 'trusted') {
          const { data: trusted } = await supabase
            .from('trusted_contacts')
            .select('name')
            .eq('id', data.contact_id)
            .single();
          
          if (trusted) {
            contactInfo = { name: trusted.name };
          }
        }
        
        details = { ...data, contact: contactInfo };
      }
      
      if (!details) {
        setError('Unable to find verification details');
        return;
      }
      
      setVerificationDetails(details);
    } catch (error) {
      console.error('Error fetching verification details:', error);
      setError('An error occurred while fetching verification details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (response: string) => {
    try {
      setProcessing(true);
      
      const { data, error } = await supabase.functions.invoke('process-verification-response', {
        body: {
          token,
          type,
          response,
          notes: notes.trim() || undefined
        }
      });
      
      if (error) {
        console.error('Error processing response:', error);
        setError('An error occurred while processing your response');
        return;
      }
      
      setSuccess(true);
    } catch (error) {
      console.error('Error submitting response:', error);
      setError('An error occurred while submitting your response');
    } finally {
      setProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Verification</CardTitle>
            <CardDescription className="text-center">Loading verification details...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-willtank-600" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Verification Error</CardTitle>
            <CardDescription className="text-center">
              There was a problem with your verification link
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md border-green-200">
          <CardHeader>
            <CardTitle className="text-center text-green-600">Thank You</CardTitle>
            <CardDescription className="text-center">
              Your response has been recorded successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
            {type === 'invitation' && (
              <p className="text-sm text-gray-600 mb-4">
                Thank you for responding to the invitation. The user has been notified of your decision.
              </p>
            )}
            {type === 'status' && (
              <p className="text-sm text-gray-600 mb-4">
                Thank you for confirming the status. Your response helps ensure the will is only accessible at the appropriate time.
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          {type === 'invitation' && (
            <>
              <CardTitle className="text-center">Role Invitation</CardTitle>
              <CardDescription className="text-center">
                You've been invited to be a {verificationDetails.contact_type} for {verificationDetails.user_name || 'a WillTank user'}
              </CardDescription>
            </>
          )}
          {type === 'status' && (
            <>
              <CardTitle className="text-center">Status Check</CardTitle>
              <CardDescription className="text-center">
                Please confirm the status of the WillTank user
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {type === 'invitation' && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Please indicate whether you accept or decline this role. This decision can be changed later by contacting the user.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <Textarea
                  placeholder="Any additional information you want to share with the user..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <Button 
                  onClick={() => handleSubmit('accept')}
                  disabled={processing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                  Accept Role
                </Button>
                <Button 
                  onClick={() => handleSubmit('decline')}
                  disabled={processing}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
                  Decline Role
                </Button>
              </div>
            </div>
          )}
          
          {type === 'status' && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-6">
                Please confirm whether the person is still alive or has passed away. Your response helps ensure their will is only accessible at the appropriate time.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <Textarea
                  placeholder="Any additional information you want to share..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <Button 
                  onClick={() => handleSubmit('alive')}
                  disabled={processing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                  Yes, Still Alive
                </Button>
                <Button 
                  onClick={() => handleSubmit('deceased')}
                  disabled={processing}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
                  No, Deceased
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
