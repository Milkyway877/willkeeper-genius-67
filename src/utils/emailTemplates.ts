/**
 * Generates a simple HTML email template with Accept and Decline buttons
 * @deprecated Use generateTrustedContactEmailTemplate instead for the new flow
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
 * @deprecated Use generatePlainTextTrustedContactEmail instead for the new flow
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

/**
 * Generates an informational HTML email template for trusted contacts
 * No verification buttons - just informs the contact of their role
 */
export const generateTrustedContactEmailTemplate = (
  name: string,
  userFullName: string,
  baseUrl: string,
  contactType: string = 'trusted contact'
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
        .content {
          margin-bottom: 30px;
        }
        .important-notice {
          background-color: #f8f9fa;
          border-left: 4px solid #4F46E5;
          padding: 15px;
          margin: 20px 0;
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
        <h2>WillTank Trusted Contact</h2>
      </div>
      
      <div class="content">
        <p>Hello ${name},</p>
        
        <p>${userFullName} has added you as their ${contactType} on WillTank.</p>
        
        <div class="important-notice">
          <p><strong>What does this mean?</strong></p>
          <p>As a trusted contact, you may be notified if ${userFullName} misses their regular check-ins in our system. If this happens, you should:</p>
          <ol>
            <li>Try to contact ${userFullName} directly</li>
            <li>If you confirm ${userFullName} has passed away, please notify their executor</li>
            <li>You may receive PIN codes in the future that the executor will need to access important documents</li>
          </ol>
          <p>No action is required from you at this time. This email is simply to inform you of your role.</p>
        </div>
        
        <p>Thank you for being a trusted part of ${userFullName}'s digital legacy plan.</p>
      </div>
      
      <div class="footer">
        <p>This is an automated message from WillTank. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generates a plaintext email for trusted contacts
 */
export const generatePlainTextTrustedContactEmail = (
  name: string,
  userFullName: string,
  baseUrl: string,
  contactType: string = 'trusted contact'
): string => {
  return `
Hello ${name},

${userFullName} has added you as their ${contactType} on WillTank.

WHAT DOES THIS MEAN?

As a trusted contact, you may be notified if ${userFullName} misses their regular check-ins in our system. If this happens, you should:
1. Try to contact ${userFullName} directly
2. If you confirm ${userFullName} has passed away, please notify their executor
3. You may receive PIN codes in the future that the executor will need to access important documents

No action is required from you at this time. This email is simply to inform you of your role.

Thank you for being a trusted part of ${userFullName}'s digital legacy plan.

This is an automated message from WillTank. Please do not reply to this email.
  `.trim();
};

/**
 * Generates an HTML email for missed check-ins to send to trusted contacts
 */
export const generateMissedCheckinEmailTemplate = (
  contactName: string,
  userFullName: string,
  executorName: string,
  executorEmail: string,
  executorPhone: string = '',
  baseUrl: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WillTank Missed Check-in Alert</title>
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
        .alert {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
        }
        .executor-info {
          background-color: #e9ecef;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
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
        <h2>Important: Missed Check-in Alert</h2>
      </div>
      
      <p>Hello ${contactName},</p>
      
      <div class="alert">
        <p><strong>Important Notice:</strong> ${userFullName} has missed their regular check-ins on WillTank.</p>
      </div>
      
      <p>As a trusted contact for ${userFullName}, we're reaching out to inform you that they have not completed their scheduled check-ins. This could be for various reasons, including technical issues or inability to access the system.</p>
      
      <p><strong>What you should do:</strong></p>
      <ol>
        <li>Try to contact ${userFullName} directly if possible</li>
        <li>If you confirm that ${userFullName} has passed away, please notify their executor using the information below</li>
      </ol>
      
      <div class="executor-info">
        <h3>Executor Information</h3>
        <p><strong>Name:</strong> ${executorName}</p>
        <p><strong>Email:</strong> ${executorEmail}</p>
        ${executorPhone ? `<p><strong>Phone:</strong> ${executorPhone}</p>` : ''}
        <p>The executor will need to visit ${baseUrl}/executor to begin the will access process.</p>
      </div>
      
      <p>Thank you for your assistance in this sensitive matter.</p>
      
      <div class="footer">
        <p>This is an automated message from WillTank. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generates a plaintext email for missed check-ins to send to trusted contacts
 */
export const generatePlainTextMissedCheckinEmail = (
  contactName: string,
  userFullName: string,
  executorName: string,
  executorEmail: string,
  executorPhone: string = '',
  baseUrl: string
): string => {
  return `
Hello ${contactName},

IMPORTANT NOTICE: ${userFullName} has missed their regular check-ins on WillTank.

As a trusted contact for ${userFullName}, we're reaching out to inform you that they have not completed their scheduled check-ins. This could be for various reasons, including technical issues or inability to access the system.

What you should do:
1. Try to contact ${userFullName} directly if possible
2. If you confirm that ${userFullName} has passed away, please notify their executor using the information below

EXECUTOR INFORMATION
Name: ${executorName}
Email: ${executorEmail}
${executorPhone ? `Phone: ${executorPhone}` : ''}

The executor will need to visit ${baseUrl}/executor to begin the will access process.

Thank you for your assistance in this sensitive matter.

This is an automated message from WillTank. Please do not reply to this email.
  `.trim();
};

/**
 * Generates an HTML email with PIN code for executor verification
 */
export const generateExecutorPinEmailTemplate = (
  contactName: string,
  userFullName: string,
  executorName: string,
  pinCode: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WillTank Executor Verification PIN</title>
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
        .pin-container {
          text-align: center;
          margin: 30px 0;
        }
        .pin {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 5px;
          color: #4F46E5;
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
        }
        .important {
          color: #dc3545;
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
        <h2>Executor Access Verification</h2>
      </div>
      
      <p>Hello ${contactName},</p>
      
      <p>${executorName} is attempting to access ${userFullName}'s will documents as their executor.</p>
      
      <p>To verify this request, please provide the following PIN code to ${executorName}:</p>
      
      <div class="pin-container">
        <div class="pin">${pinCode}</div>
      </div>
      
      <p class="important">IMPORTANT: Only share this PIN with the executor if you have confirmed ${userFullName}'s passing.</p>
      
      <p>The executor needs PIN codes from all trusted contacts to access the will documents.</p>
      
      <div class="footer">
        <p>This is an automated message from WillTank. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generates a plaintext email with PIN code for executor verification
 */
export const generatePlainTextExecutorPinEmail = (
  contactName: string,
  userFullName: string,
  executorName: string,
  pinCode: string
): string => {
  return `
Hello ${contactName},

${executorName} is attempting to access ${userFullName}'s will documents as their executor.

To verify this request, please provide the following PIN code to ${executorName}:

PIN CODE: ${pinCode}

IMPORTANT: Only share this PIN with the executor if you have confirmed ${userFullName}'s passing.

The executor needs PIN codes from all trusted contacts to access the will documents.

This is an automated message from WillTank. Please do not reply to this email.
  `.trim();
};
