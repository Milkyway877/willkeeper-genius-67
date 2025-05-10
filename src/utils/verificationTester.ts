
/**
 * Verification Link Tester Utility
 * 
 * This utility helps test verification links for the WillTank application.
 * It can generate test verification tokens and URLs for debugging.
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Generates a test verification URL for the specified path
 */
export const generateTestUrl = (basePath: string, token: string): string => {
  // Get the current origin (domain)
  const origin = window.location.origin;
  
  // Clean the base path to ensure it starts with a slash
  const cleanPath = basePath.startsWith('/') ? basePath : `/${basePath}`;
  
  // Generate the complete URL
  return `${origin}${cleanPath}/${token}`;
};

/**
 * Creates a test verification token in the database
 */
export const createTestVerificationToken = async (contactType: 'trusted' | 'executor' | 'beneficiary'): Promise<{
  success: boolean;
  token?: string;
  urls?: {
    direct: string;
    trusted: string;
    invitation: string;
  };
  error?: any;
}> => {
  try {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    // Get a test contact if available
    const { data: contacts } = await supabase
      .from(contactType === 'trusted' ? 'trusted_contacts' : 
            contactType === 'executor' ? 'will_executors' : 
            'will_beneficiaries')
      .select('id')
      .eq('user_id', session.user.id)
      .limit(1);
      
    if (!contacts || contacts.length === 0) {
      return { 
        success: false, 
        error: `No ${contactType} contacts found. Please create one first.` 
      };
    }
    
    // Generate verification token
    const token = crypto.randomUUID();
    
    // Set expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    // Create verification record
    await supabase
      .from('contact_verifications')
      .insert({
        user_id: session.user.id,
        contact_id: contacts[0].id,
        contact_type: contactType,
        verification_token: token,
        expires_at: expiresAt.toISOString()
      });

    // Generate various test URLs
    const directUrl = generateTestUrl('verify', token);
    const trustedUrl = generateTestUrl('verify/trusted-contact', token);
    const invitationUrl = generateTestUrl('verify/invitation', token);
    
    // Return success with token and URLs
    return {
      success: true,
      token,
      urls: {
        direct: directUrl,
        trusted: trustedUrl,
        invitation: invitationUrl
      }
    };
  } catch (error) {
    console.error('Error creating test verification token:', error);
    return { success: false, error };
  }
};

/**
 * Tests various verification URLs by opening them in new tabs
 */
export const testVerificationUrls = (token: string): void => {
  const directUrl = generateTestUrl('verify', token);
  const trustedUrl = generateTestUrl('verify/trusted-contact', token);
  const invitationUrl = generateTestUrl('verify/invitation', token);
  
  // Log URLs for reference
  console.log('Test URLs generated:');
  console.log('Direct:', directUrl);
  console.log('Trusted Contact:', trustedUrl);
  console.log('Invitation:', invitationUrl);
  
  // Open URLs in new tabs (only if explicitly requested)
  if (confirm('Open test links in new tabs?')) {
    window.open(directUrl, '_blank');
    setTimeout(() => window.open(trustedUrl, '_blank'), 500);
    setTimeout(() => window.open(invitationUrl, '_blank'), 1000);
  }
};

/**
 * Validates and tests a verification token
 */
export const validateVerificationToken = async (token: string): Promise<{
  valid: boolean;
  expired?: boolean;
  responded?: boolean;
  details?: any;
}> => {
  try {
    // Check token in database
    const { data, error } = await supabase
      .from('contact_verifications')
      .select('*')
      .eq('verification_token', token)
      .single();
      
    if (error || !data) {
      return { valid: false };
    }
    
    // Check if token is expired
    const expired = new Date(data.expires_at) < new Date();
    
    // Check if already responded
    const responded = !!data.responded_at;
    
    return {
      valid: true,
      expired,
      responded,
      details: data
    };
  } catch (error) {
    console.error('Error validating token:', error);
    return { valid: false };
  }
};

// Add global variable for console testing
(window as any).verificationTester = {
  createTestToken: createTestVerificationToken,
  testUrls: testVerificationUrls,
  validateToken: validateVerificationToken
};

// Export instructions for usage
export const verificationTestInstructions = `
# Verification Testing Instructions

To test verification links, open your browser console and use the following commands:

## Create a test verification token:
\`\`\`
verificationTester.createTestToken('trusted').then(console.log)
\`\`\`

## Test verification URLs with an existing token:
\`\`\`
verificationTester.testUrls('your-token-here')
\`\`\`

## Validate a verification token:
\`\`\`
verificationTester.validateToken('your-token-here').then(console.log)
\`\`\`
`;
