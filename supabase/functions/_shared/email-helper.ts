
import { Resend } from 'https://esm.sh/resend@1.1.0';

export const getResendClient = () => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not set');
  }
  
  return new Resend(resendApiKey);
};

export const buildDefaultEmailLayout = (content: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>The Tank</title>
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
        a.button {
          display: inline-block;
          background-color: #4F46E5;
          color: white;
          padding: 12px 20px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} The Tank, a secure digital time capsule service.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
