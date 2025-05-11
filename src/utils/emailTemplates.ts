/**
 * Generates a simple HTML email template with instructions for trusted contacts
 */
export const generateVerificationEmailTemplate = (
  name: string,
  userFullName: string,
  contactId: string,
  baseUrl: string,
  contactType: string = 'trusted contact',
  executorInfo?: { name?: string; email?: string; phone?: string }
): string => {
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WillTank Trusted Contact Information</title>
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
        .info-box {
          background-color: #f9f9f9;
          border-left: 4px solid #10b981;
          padding: 15px;
          margin: 20px 0;
        }
        .executor-info {
          background-color: #f0f7ff;
          border: 1px solid #cce5ff;
          border-radius: 4px;
          padding: 15px;
          margin: 20px 0;
        }
        .important {
          color: #b91c1c;
          font-weight: bold;
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
        <h2>WillTank Trusted Contact Information</h2>
      </div>
      
      <p>Hello ${name},</p>
      
      <p>${userFullName} has added you as their ${contactType} on WillTank.</p>
      
      <div class="info-box">
        <p><strong>What does this mean?</strong></p>
        <p>As a trusted contact, you may be contacted if ${userFullName} misses their regular check-ins in the WillTank system. Your role is simply to receive this notification and, if necessary, contact the executor to help determine ${userFullName}'s status.</p>
      </div>
      
      ${executorInfo ? `
      <p><strong>Executor Information:</strong></p>
      <div class="executor-info">
        <p>Name: ${executorInfo.name || 'Not provided'}</p>
        <p>Email: ${executorInfo.email || 'Not provided'}</p>
        <p>Phone: ${executorInfo.phone || 'Not provided'}</p>
      </div>
      ` : `
      <p>Executor information will be provided if ${userFullName} misses their check-ins.</p>
      `}
      
      <p class="important">Important: There is no action required from you at this time. This email is for your information only.</p>
      
      <p>If you receive future notifications about missed check-ins, please follow the instructions in those emails to contact the executor.</p>
      
      <div class="footer">
        <p>This is an automated message from WillTank. Please do not reply to this email.</p>
        <p>WillTank - Secure Digital Legacy Management</p>
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
  contactId: string,
  baseUrl: string,
  contactType: string = 'trusted contact',
  executorInfo?: { name?: string; email?: string; phone?: string }
): string => {
  
  return `
Hello ${name},

${userFullName} has added you as their ${contactType} on WillTank.

WHAT DOES THIS MEAN?
As a trusted contact, you may be contacted if ${userFullName} misses their regular check-ins in the WillTank system. Your role is simply to receive this notification and, if necessary, contact the executor to help determine ${userFullName}'s status.

${executorInfo ? `
EXECUTOR INFORMATION:
Name: ${executorInfo.name || 'Not provided'}
Email: ${executorInfo.email || 'Not provided'}
Phone: ${executorInfo.phone || 'Not provided'}
` : `
Executor information will be provided if ${userFullName} misses their check-ins.
`}

IMPORTANT: There is no action required from you at this time. This email is for your information only.

If you receive future notifications about missed check-ins, please follow the instructions in those emails to contact the executor.

This is an automated message from WillTank. Please do not reply to this email.
WillTank - Secure Digital Legacy Management
  `.trim();
};

/**
 * Generates an HTML email notification for missed check-ins to send to trusted contacts
 */
export const generateMissedCheckInEmailTemplate = (
  name: string,
  userFullName: string,
  executorInfo: { name: string; email: string; phone?: string },
  missedSince: string
): string => {
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>IMPORTANT: Missed Check-In Notification</title>
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
        .alert-box {
          background-color: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 15px;
          margin: 20px 0;
        }
        .executor-info {
          background-color: #f0f7ff;
          border: 1px solid #cce5ff;
          border-radius: 4px;
          padding: 15px;
          margin: 20px 0;
        }
        .action-steps {
          background-color: #f0fdf4;
          border-left: 4px solid #10b981;
          padding: 15px;
          margin: 20px 0;
        }
        .important {
          color: #b91c1c;
          font-weight: bold;
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
        <h2>IMPORTANT: Missed Check-In Notification</h2>
      </div>
      
      <p>Hello ${name},</p>
      
      <div class="alert-box">
        <p><strong>IMPORTANT NOTICE:</strong> ${userFullName} has missed their regular check-ins on WillTank since ${missedSince}.</p>
      </div>
      
      <p>As a trusted contact for ${userFullName}, we are reaching out to inform you of this situation. This could be due to technical issues, travel, or other circumstances, but it might also indicate that ${userFullName} may need assistance.</p>
      
      <div class="action-steps">
        <h3>Recommended Actions:</h3>
        <ol>
          <li>Try to contact ${userFullName} directly if you have their contact information</li>
          <li>If you cannot reach them and have reason to believe there might be a serious issue, please contact their appointed executor using the information below</li>
        </ol>
      </div>
      
      <h3>Executor Information:</h3>
      <div class="executor-info">
        <p><strong>Name:</strong> ${executorInfo.name}</p>
        <p><strong>Email:</strong> ${executorInfo.email}</p>
        ${executorInfo.phone ? `<p><strong>Phone:</strong> ${executorInfo.phone}</p>` : ''}
      </div>
      
      <p class="important">Please inform the executor if you have any information about ${userFullName}'s status.</p>
      
      <div class="footer">
        <p>This is an automated message from WillTank. Please do not reply to this email.</p>
        <p>WillTank - Secure Digital Legacy Management</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generates a plaintext email notification for missed check-ins to trusted contacts
 */
export const generatePlainTextMissedCheckInEmail = (
  name: string,
  userFullName: string,
  executorInfo: { name: string; email: string; phone?: string },
  missedSince: string
): string => {
  
  return `
IMPORTANT: MISSED CHECK-IN NOTIFICATION

Hello ${name},

IMPORTANT NOTICE: ${userFullName} has missed their regular check-ins on WillTank since ${missedSince}.

As a trusted contact for ${userFullName}, we are reaching out to inform you of this situation. This could be due to technical issues, travel, or other circumstances, but it might also indicate that ${userFullName} may need assistance.

RECOMMENDED ACTIONS:
1. Try to contact ${userFullName} directly if you have their contact information
2. If you cannot reach them and have reason to believe there might be a serious issue, please contact their appointed executor using the information below

EXECUTOR INFORMATION:
Name: ${executorInfo.name}
Email: ${executorInfo.email}
${executorInfo.phone ? `Phone: ${executorInfo.phone}` : ''}

Please inform the executor if you have any information about ${userFullName}'s status.

This is an automated message from WillTank. Please do not reply to this email.
WillTank - Secure Digital Legacy Management
  `.trim();
};
