
/**
 * Validates a TOTP code against a secret
 * @param token The TOTP code to validate
 * @param secret The secret key
 * @returns True if valid, false otherwise
 */
export function validateTOTP(token: string, secret: string): boolean {
  if (!token || !secret) return false;
  
  try {
    // Clean up the secret (remove spaces) and token
    const cleanSecret = secret.replace(/\s+/g, '');
    const cleanToken = token.replace(/\s+/g, '');
    
    if (cleanToken.length !== 6) {
      console.error('TOTP token must be 6 digits');
      return false;
    }
    
    // Create a TOTP object with the same parameters as when generating
    const totp = new OTPAuth.TOTP({
      issuer: 'WillTank',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(cleanSecret)
    });
    
    // Delta of 1 allows for a bit of time drift (±30 seconds)
    const result = totp.validate({ token: cleanToken, window: 1 });
    
    // If result is null, the token is invalid
    return result !== null;
  } catch (error) {
    console.error('Error validating TOTP:', error);
    return false;
  }
}
