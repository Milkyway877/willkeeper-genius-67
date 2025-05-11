
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
      if (!token) {
        setError('Invalid verification token');
        navigate(`/verify/thank-you?error=${encodeURIComponent('Invalid verification token')}`);
        return;
      }
      
      if (!response) {
        // No response in URL, show the verification options page
        navigate(`/verify/invitation/${token}`);
        return;
      }
      
      if (response !== 'accept' && response !== 'decline') {
        setError('Invalid response type');
        navigate(`/verify/thank-you?error=${encodeURIComponent('Invalid response type')}`);
        return;
      }
      
      try {
        console.log('Processing verification for token:', token, 'with response:', response);
        
        // First, find the verification record
        const { data: verification, error: verificationError } = await supabase
          .from('contact_verifications')
          .select('*')
          .eq('verification_token', token)
          .single();
          
        if (verificationError || !verification) {
          console.log('No verification record found, trying trusted_contacts directly');
          // Try to find in trusted_contacts directly as fallback
          const { data: contact, error: contactError } = await supabase
            .from('trusted_contacts')
            .select('*')
            .eq('id', token)
            .single();
            
          if (contactError || !contact) {
            console.error('Error finding contact:', contactError);
            setError('Invalid or expired verification link');
            navigate(`/verify/thank-you?error=${encodeURIComponent('Invalid or expired verification link')}`);
            return;
          }
            
          console.log('Found contact, updating status');
          // Update trusted contact status directly
          const { error: updateError } = await supabase
            .from('trusted_contacts')
            .update({
              invitation_status: response === 'accept' ? 'accepted' : 'declined',
              invitation_responded_at: new Date().toISOString()
            })
            .eq('id', token);
            
          if (updateError) {
            console.error('Error updating contact:', updateError);
            setError('Failed to update your response. Please try again.');
            navigate(`/verify/thank-you?error=${encodeURIComponent('Failed to update your response. Please try again.')}`);
            return;
          }
        } else {
          console.log('Found verification record, updating');
          // Update the verification record
          const { error: updateError } = await supabase
            .from('contact_verifications')
            .update({
              response: response,
              responded_at: new Date().toISOString()
            })
            .eq('verification_token', token);
            
          if (updateError) {
            console.error('Error updating verification:', updateError);
            setError('Failed to update your response. Please try again.');
            navigate(`/verify/thank-you?error=${encodeURIComponent('Failed to update your response. Please try again.')}`);
            return;
          }
            
          // If it's a trusted contact verification, also update the contact
          if (verification.contact_type === 'trusted' && verification.contact_id) {
            console.log('Updating associated trusted contact');
            const { error: contactUpdateError } = await supabase
              .from('trusted_contacts')
              .update({
                invitation_status: response === 'accept' ? 'accepted' : 'declined',
                invitation_responded_at: new Date().toISOString()
              })
              .eq('id', verification.contact_id);
              
            if (contactUpdateError) {
              console.error('Error updating contact from verification:', contactUpdateError);
              // Don't set an error here since we already updated the verification record
            }
          }
        }
        
        // Redirect to thank you page
        navigate(`/verify/thank-you?response=${response}`);
      } catch (error) {
        console.error('Error processing verification:', error);
        setError('An error occurred while processing your response');
        navigate(`/verify/thank-you?error=${encodeURIComponent('An error occurred while processing your response')}`);
      }
    };
    
    processVerification();
  }, [token, response, navigate]);
  
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
