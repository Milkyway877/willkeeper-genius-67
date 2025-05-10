
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function SimpleVerification() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const response = searchParams.get('response');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const processVerification = async () => {
      if (!token || !response) {
        setError('Invalid verification parameters');
        return;
      }
      
      if (response !== 'accept' && response !== 'decline') {
        setError('Invalid response type');
        return;
      }
      
      try {
        // First, find the verification record
        const { data: verification, error: verificationError } = await supabase
          .from('contact_verifications')
          .select('*')
          .eq('verification_token', token)
          .single();
          
        if (verificationError || !verification) {
          // Try to find in trusted_contacts directly as fallback
          const { data: contact, error: contactError } = await supabase
            .from('trusted_contacts')
            .select('*')
            .eq('id', token)
            .single();
            
          if (contactError || !contact) {
            setError('Invalid or expired verification link');
            return;
          }
            
          // Update trusted contact status directly
          await supabase
            .from('trusted_contacts')
            .update({
              invitation_status: response === 'accept' ? 'accepted' : 'declined',
              invitation_responded_at: new Date().toISOString()
            })
            .eq('id', token);
        } else {
          // Update the verification record
          await supabase
            .from('contact_verifications')
            .update({
              response: response,
              responded_at: new Date().toISOString()
            })
            .eq('verification_token', token);
            
          // If it's a trusted contact verification, also update the contact
          if (verification.contact_type === 'trusted') {
            await supabase
              .from('trusted_contacts')
              .update({
                invitation_status: response === 'accept' ? 'accepted' : 'declined',
                invitation_responded_at: new Date().toISOString()
              })
              .eq('id', verification.contact_id);
          }
        }
        
        // Redirect to thank you page
        navigate(`/verify/thank-you?response=${response}`);
      } catch (error) {
        console.error('Error processing verification:', error);
        setError('An error occurred while processing your response');
      }
    };
    
    processVerification();
  }, [token, response, navigate]);
  
  if (error) {
    // Redirect to thank you page with error
    navigate(`/verify/thank-you?error=${encodeURIComponent(error)}`);
    return null;
  }
  
  // Show loading while processing
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-willtank-600" />
            <p className="mt-4 text-gray-600">Processing your response...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
