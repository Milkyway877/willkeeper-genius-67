
declare namespace Verification {
  interface VerificationRecord {
    id: string;
    email: string;
    code?: string;
    verification_token?: string;
    type: 'signup' | 'login' | 'recovery';
    created_at: string;
    expires_at: string;
    used: boolean;
    link_clicked?: boolean;
    user_id?: string;
  }
  
  interface VerificationStatus {
    status: 'pending' | 'verified' | 'expired' | 'invalid';
    message?: string;
    email?: string;
    type?: string;
  }
  
  interface VerificationResponse {
    success: boolean;
    message?: string;
    token?: string;
    error?: string;
  }
}
