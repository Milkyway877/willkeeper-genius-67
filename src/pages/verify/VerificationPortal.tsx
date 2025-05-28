
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VerificationData {
  id: string;
  contact_id: string;
  contact_type: string;
  user_id: string;
  verification_token: string;
  expires_at: string;
  responded_at?: string;
  response?: string;
}

export default function VerificationPortal() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const response = searchParams.get('response');
  
  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchVerification();
    }
  }, [token]);

  useEffect(() => {
    if (verification && response && !submitted) {
      handleResponse(response);
    }
  }, [verification, response, submitted]);

  const fetchVerification = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('contact_verifications')
        .select('*')
        .eq('verification_token', token)
        .single();

      if (error) {
        throw new Error('Verification not found or invalid');
      }

      if (!data) {
        throw new Error('Verification not found');
      }

      // Check if already responded
      if (data.responded_at) {
        setSubmitted(true);
      }

      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        throw new Error('This verification link has expired');
      }

      setVerification(data);
    } catch (err) {
      console.error('Error fetching verification:', err);
      setError(err instanceof Error ? err.message : 'Failed to load verification');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (responseType: string) => {
    if (!verification || submitting || submitted) return;

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('contact_verifications')
        .update({
          response: responseType,
          responded_at: new Date().toISOString(),
        })
        .eq('id', verification.id);

      if (error) {
        throw error;
      }

      setSubmitted(true);
      setVerification(prev => prev ? {
        ...prev,
        response: responseType,
        responded_at: new Date().toISOString()
      } : null);
    } catch (err) {
      console.error('Error submitting response:', err);
      setError('Failed to submit response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-willtank-600"></div>
            </div>
            <p className="text-center mt-4 text-gray-600">Loading verification...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <XCircle className="h-5 w-5 mr-2" />
              Verification Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              Response Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Thank you for your response. Your verification has been recorded.
                {verification?.response === 'accept' 
                  ? ' You have confirmed the status check.'
                  : ' You have declined the status check.'
                }
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-willtank-600" />
            Verification Required
          </CardTitle>
          <CardDescription>
            Please respond to this status check verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              You have been asked to verify the status of a Skyler user as part of their death verification process.
              Please respond honestly based on your knowledge of their current status.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button
              onClick={() => handleResponse('accept')}
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm - User is Active
                </>
              )}
            </Button>

            <Button
              onClick={() => handleResponse('decline')}
              disabled={submitting}
              variant="destructive"
              className="w-full"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Report - Unable to Confirm
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            This verification will expire on {verification ? new Date(verification.expires_at).toLocaleDateString() : 'N/A'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
