
import { Resend } from 'https://esm.sh/resend@1.1.0';

export const getResendClient = () => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not set');
  }
  
  return new Resend(resendApiKey);
};

export const buildEmailTemplate = (content: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>WillTank</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #eaeaea;
        }
        .content {
          padding: 30px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          color: #777;
          font-size: 12px;
          border-top: 1px solid #eaeaea;
        }
        .verification-code {
          font-size: 32px;
          letter-spacing: 8px;
          font-weight: bold;
          text-align: center;
          margin: 30px 0;
          color: #1a1a1a;
          background-color: #f4f4f4;
          padding: 15px;
          border-radius: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} WillTank. All rights reserved.</p>
          <p>If you did not request this email, please disregard it.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendVerificationEmail = async (
  email: string,
  code: string,
  type: string
): Promise<{success: boolean; messageId?: string; error?: string}> => {
  try {
    const resend = getResendClient();
    
    let subject = 'Your Verification Code';
    let greeting = 'Verify your email';
    let actionText = 'verify your email address';
    
    if (type === 'signup') {
      subject = 'Welcome to WillTank - Verify Your Account';
      greeting = 'Welcome to WillTank';
      actionText = 'complete your account setup';
    } else if (type === 'login') {
      subject = 'Sign in to WillTank';
      greeting = 'Sign In Verification';
      actionText = 'complete your sign-in';
    } else if (type === 'recovery') {
      subject = 'Reset Your WillTank Password';
      greeting = 'Password Reset';
      actionText = 'reset your password';
    }
    
    const content = `
      <h2>${greeting}</h2>
      <p>Please use the following verification code to ${actionText}:</p>
      <div class="verification-code">${code}</div>
      <p>This code will expire in 30 minutes.</p>
      <p>If you did not request this code, please ignore this message.</p>
    `;
    
    const emailResult = await resend.emails.send({
      from: 'WillTank <support@willtank.com>',
      to: [email],
      subject: subject,
      html: buildEmailTemplate(content),
    });
    
    if (emailResult.error) {
      return {
        success: false, 
        error: emailResult.error.message || 'Failed to send email'
      };
    }
    
    return {
      success: true,
      messageId: emailResult.id
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email'
    };
  }
};
