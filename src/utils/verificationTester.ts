
/**
 * Verification Link Tester Utility
 * 
 * This utility helps test verification links for the WillTank application.
 * It can generate test verification tokens and URLs for debugging.
 */

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  contactId?: string;
  urls?: {
    direct: string;
    trusted: string;
    invitation: string;
  };
  error?: any;
  errorDetails?: {
    code?: string;
    message?: string;
    details?: any;
  };
}> => {
  try {
    // Get current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Session error:', sessionError);
      return { 
        success: false, 
        error: 'Authentication error', 
        errorDetails: sessionError 
      };
    }
    
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    // Get a test contact if available
    const tableName = contactType === 'trusted' ? 'trusted_contacts' : 
                      contactType === 'executor' ? 'will_executors' : 
                      'will_beneficiaries';
    
    console.log(`Fetching contact from table: ${tableName}`);
    
    const { data: contacts, error: contactsError } = await supabase
      .from(tableName)
      .select('id')
      .eq('user_id', session.user.id)
      .limit(1);
      
    if (contactsError) {
      console.error(`Error fetching contacts from ${tableName}:`, contactsError);
      return { 
        success: false, 
        error: contactsError.message,
        errorDetails: {
          code: contactsError.code,
          message: contactsError.message,
          details: contactsError.details
        }
      };
    }
      
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
    console.log('Creating verification record with data:', {
      user_id: session.user.id,
      contact_id: contacts[0].id,
      contact_type: contactType,
      verification_token: token,
      expires_at: expiresAt.toISOString()
    });
    
    const { data: verification, error: verificationError } = await supabase
      .from('contact_verifications')
      .insert({
        user_id: session.user.id,
        contact_id: contacts[0].id,
        contact_type: contactType,
        verification_token: token,
        expires_at: expiresAt.toISOString()
      })
      .select();
    
    if (verificationError) {
      console.error('Error creating verification record:', verificationError);
      
      return { 
        success: false, 
        error: verificationError.message,
        errorDetails: {
          code: verificationError.code,
          message: verificationError.message,
          details: verificationError.details
        }
      };
    }

    // Generate various test URLs
    const directUrl = generateTestUrl('verify', token);
    const trustedUrl = generateTestUrl('verify/trusted-contact', token);
    const invitationUrl = generateTestUrl('verify/invitation', token);
    
    // Return success with token and URLs
    return {
      success: true,
      token,
      contactId: contacts[0].id,
      urls: {
        direct: directUrl,
        trusted: trustedUrl,
        invitation: invitationUrl
      }
    };
  } catch (error) {
    console.error('Error creating test verification token:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error creating test verification token',
      errorDetails: error
    };
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
  error?: string;
}> => {
  try {
    // Check token in database
    const { data, error } = await supabase
      .from('contact_verifications')
      .select('*')
      .eq('verification_token', token)
      .single();
      
    if (error) {
      console.error('Error validating token:', error);
      return { valid: false, error: error.message };
    }
    
    if (!data) {
      return { valid: false, error: 'Token not found' };
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
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown error validating token' 
    };
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
