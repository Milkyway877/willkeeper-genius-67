
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
