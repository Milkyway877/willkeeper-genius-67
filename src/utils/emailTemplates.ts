
/**
 * Generates an informational HTML email template for trusted contacts
 */
export const generateTrustedContactEmailTemplate = (
  name: string,
  userFullName: string,
  baseUrl: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Trusted Contact Information</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .content {
          margin: 20px 0;
          padding: 15px;
          background-color: #f9f9f9;
          border-left: 4px solid #10b981;
        }
        .footer {
          margin-top: 40px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>WillTank Information</h2>
      </div>
      
      <p>Hello ${name},</p>
      
      <p>${userFullName} has added you as their trusted contact on WillTank.</p>
      
      <div class="content">
        <p>As a trusted contact, you play an important role in ${userFullName}'s end-of-life planning:</p>
        <ul>
          <li>You may be contacted if ${userFullName} misses their regular check-ins</li>
          <li>You might be asked to help verify ${userFullName}'s status</li>
          <li>This helps ensure their will is only accessed at the appropriate time</li>
        </ul>
        <p>No immediate action is required from you. This email is for informational purposes only.</p>
      </div>
      
      <p>If you have any questions, you can contact ${userFullName} directly.</p>
      
      <div class="footer">
        <p>This is an automated message from WillTank. Please do not reply to this email.</p>
        <p>© WillTank ${new Date().getFullYear()}</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generates a simple plaintext email for trusted contacts
 */
export const generatePlainTextTrustedContactEmail = (
  name: string,
  userFullName: string,
  baseUrl: string
): string => {
  return `
Hello ${name},

${userFullName} has added you as their trusted contact on WillTank.

As a trusted contact, you play an important role in ${userFullName}'s end-of-life planning:
- You may be contacted if ${userFullName} misses their regular check-ins
- You might be asked to help verify ${userFullName}'s status
- This helps ensure their will is only accessed at the appropriate time

No immediate action is required from you. This email is for informational purposes only.

If you have any questions, you can contact ${userFullName} directly.

This is an automated message from WillTank. Please do not reply to this email.
© WillTank ${new Date().getFullYear()}
  `.trim();
};

/**
 * Generates a simple verification HTML email template
 * This is for when responses are needed
 */
export const generateVerificationEmailTemplate = (
  name: string,
  userFullName: string,
  baseUrl: string,
  verificationToken: string
): string => {
  // Ensure we have a valid base URL with proper formatting
  const baseUrlWithoutTrailingSlash = baseUrl.endsWith('/') 
    ? baseUrl.slice(0, -1) 
    : baseUrl;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Action Required: Verification Request</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .content {
          margin: 20px 0;
          padding: 15px;
          background-color: #f9f9f9;
          border-left: 4px solid #4a6cf7;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          margin: 10px 5px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
          text-align: center;
        }
        .accept {
          background-color: #10b981;
          color: white;
        }
        .decline {
          background-color: #ef4444;
          color: white;
        }
        .button-container {
          text-align: center;
          margin: 25px 0;
        }
        .footer {
          margin-top: 40px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>Response Required</h2>
      </div>
      
      <p>Hello ${name},</p>
      
      <p>${userFullName} has added you as a contact on WillTank and we need your confirmation.</p>
      
      <div class="content">
        <p>Please confirm whether you accept this role by clicking one of the buttons below:</p>
        
        <div class="button-container">
          <a href="${baseUrlWithoutTrailingSlash}/verify/simple/${verificationToken}?response=accept" class="button accept">Accept Role</a>
          <a href="${baseUrlWithoutTrailingSlash}/verify/simple/${verificationToken}?response=decline" class="button decline">Decline Role</a>
        </div>
      </div>
      
      <p>If the buttons don't work, you can copy and paste the following link into your browser:</p>
      <p>${baseUrlWithoutTrailingSlash}/verify/simple/${verificationToken}</p>
      
      <div class="footer">
        <p>This is an automated message from WillTank. Please do not reply to this email.</p>
        <p>© WillTank ${new Date().getFullYear()}</p>
      </div>
    </body>
    </html>
  `;
};
