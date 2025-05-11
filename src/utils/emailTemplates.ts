
/**
 * Generates a simple HTML email template with Accept and Decline buttons
 */
export const generateVerificationEmailTemplate = (
  name: string,
  userFullName: string,
  verificationToken: string,
  baseUrl: string,
  contactType: string = 'trusted contact'
): string => {
  const acceptUrl = `${baseUrl}/verify/simple/${verificationToken}?response=accept`;
  const declineUrl = `${baseUrl}/verify/simple/${verificationToken}?response=decline`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contact Verification</title>
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
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          margin: 0 10px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          text-align: center;
        }
        .accept {
          background-color: #10b981;
          color: white;
        }
        .decline {
          background-color: white;
          color: #ef4444;
          border: 1px solid #ef4444;
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
        <h2>WillTank Verification</h2>
      </div>
      
      <p>Hello ${name},</p>
      
      <p>${userFullName} has added you as their ${contactType} on WillTank.</p>
      
      <p>Please confirm whether you accept or decline this role by clicking one of the buttons below:</p>
      
      <div class="button-container">
        <a href="${acceptUrl}" class="button accept">Accept</a>
        <a href="${declineUrl}" class="button decline">Decline</a>
      </div>
      
      <p>If you didn't expect to receive this email, you can simply ignore it or decline the request.</p>
      
      <div class="footer">
        <p>This is an automated message from WillTank. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generates a simple plaintext email for clients that don't support HTML
 */
export const generatePlainTextVerificationEmail = (
  name: string,
  userFullName: string,
  verificationToken: string,
  baseUrl: string,
  contactType: string = 'trusted contact'
): string => {
  const acceptUrl = `${baseUrl}/verify/simple/${verificationToken}?response=accept`;
  const declineUrl = `${baseUrl}/verify/simple/${verificationToken}?response=decline`;
  
  return `
Hello ${name},

${userFullName} has added you as their ${contactType} on WillTank.

Please confirm whether you accept or decline this role by clicking one of these links:

To accept: ${acceptUrl}
To decline: ${declineUrl}

If you didn't expect to receive this email, you can simply ignore it or decline the request.

This is an automated message from WillTank. Please do not reply to this email.
  `.trim();
};
