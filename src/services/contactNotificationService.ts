
import { supabase } from '@/integrations/supabase/client';
import { sendEmail } from '@/services/emailService';

export interface ContactNotificationData {
  contactId: string;
  contactName: string;
  contactEmail: string;
  contactType: 'executor' | 'beneficiary' | 'trusted_contact';
  userFullName: string;
  userEmail: string;
  additionalInfo?: {
    relation?: string;
    phone?: string;
    isPrimary?: boolean;
  };
}

// Send welcome email when a new contact is added
export const sendContactWelcomeNotification = async (data: ContactNotificationData): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`Sending welcome notification to ${data.contactType}: ${data.contactName} (${data.contactEmail})`);
    
    const { contactType, contactName, contactEmail, userFullName, userEmail, additionalInfo } = data;
    
    // Build role-specific email content
    let roleDescription = '';
    let responsibilities = '';
    let nextSteps = '';
    
    switch (contactType) {
      case 'executor':
        roleDescription = `You have been designated as ${additionalInfo?.isPrimary ? 'the primary executor' : 'an executor'} of ${userFullName}'s will on WillTank.`;
        responsibilities = `
          <ul style="color: #374151; margin: 10px 0; padding-left: 20px;">
            <li>You will be responsible for carrying out ${userFullName}'s final wishes as outlined in their will</li>
            <li>You will receive notifications if ${userFullName} misses their regular check-ins</li>
            <li>You may be asked to help verify ${userFullName}'s status in case of missed check-ins</li>
            <li>Upon verified death, you will receive access to unlock and execute the will</li>
            ${additionalInfo?.isPrimary ? '<li><strong>As the primary executor, you have additional override capabilities</strong></li>' : ''}
          </ul>
        `;
        nextSteps = `
          <h3 style="color: #1f2937;">What happens next:</h3>
          <ol style="color: #374151; margin: 10px 0; padding-left: 20px;">
            <li>No action is required from you at this time</li>
            <li>You will receive email notifications if ${userFullName} misses check-ins</li>
            <li>If needed, you may be contacted to verify ${userFullName}'s status</li>
            <li>Keep this email for your records as it contains important information about your role</li>
          </ol>
        `;
        break;
        
      case 'beneficiary':
        roleDescription = `You have been designated as a beneficiary in ${userFullName}'s will on WillTank.`;
        responsibilities = `
          <ul style="color: #374151; margin: 10px 0; padding-left: 20px;">
            <li>You are entitled to receive assets or bequests as specified in ${userFullName}'s will</li>
            <li>You may receive notifications if ${userFullName} misses their regular check-ins</li>
            <li>You may be asked to help verify ${userFullName}'s status in case of missed check-ins</li>
            <li>Upon verified death, you will be contacted about your inheritance</li>
          </ul>
        `;
        nextSteps = `
          <h3 style="color: #1f2937;">What happens next:</h3>
          <ol style="color: #374151; margin: 10px 0; padding-left: 20px;">
            <li>No action is required from you at this time</li>
            <li>You may receive email notifications if ${userFullName} misses check-ins</li>
            <li>If needed, you may be contacted to verify ${userFullName}'s status</li>
            <li>Keep this email for your records as it contains important information about your inheritance</li>
          </ol>
        `;
        break;
        
      case 'trusted_contact':
        roleDescription = `You have been designated as a trusted contact for ${userFullName} on WillTank.`;
        responsibilities = `
          <ul style="color: #374151; margin: 10px 0; padding-left: 20px;">
            <li>You will receive notifications if ${userFullName} misses their regular check-ins</li>
            <li>You may be asked to help verify ${userFullName}'s status and well-being</li>
            <li>Your role is to help ensure ${userFullName}'s digital legacy is properly managed</li>
            <li>You serve as an additional safety net in the verification process</li>
          </ul>
        `;
        nextSteps = `
          <h3 style="color: #1f2937;">What happens next:</h3>
          <ol style="color: #374151; margin: 10px 0; padding-left: 20px;">
            <li>No action is required from you at this time</li>
            <li>You will receive email notifications if ${userFullName} misses check-ins</li>
            <li>If you receive a notification, try to contact ${userFullName} to remind them to check in</li>
            <li>Keep this email for your records as it contains important contact information</li>
          </ol>
        `;
        break;
    }
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a6cf7;">Important: You've Been Added to a WillTank Account</h1>
        <p>Dear ${contactName},</p>
        <p>${roleDescription}</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Your Role & Responsibilities:</h3>
          ${responsibilities}
        </div>

        ${nextSteps}

        <div style="background-color: #f3f4f6; border: 1px solid #d1d5db; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Contact Information</h3>
          <p><strong>Account Holder:</strong> ${userFullName}<br>
          <strong>Email:</strong> ${userEmail}<br>
          ${additionalInfo?.relation ? `<strong>Your Relation:</strong> ${additionalInfo.relation}<br>` : ''}
          ${additionalInfo?.phone ? `<strong>Your Phone on File:</strong> ${additionalInfo.phone}<br>` : ''}
          <strong>Your Role:</strong> ${contactType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
        </div>

        <div style="background-color: #fffbeb; border: 1px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <h4 style="color: #92400e; margin-top: 0;">About WillTank</h4>
          <p style="color: #92400e; margin: 0;">WillTank is a secure digital platform for creating and managing wills. Our check-in system ensures that wills are only accessible upon verified absence, protecting your loved one's final wishes.</p>
        </div>

        <p>If you have any questions about your role or WillTank, please contact our support team at support@willtank.com.</p>

        <p>Thank you for being part of ${userFullName}'s digital legacy protection plan.</p>

        <p>Best regards,<br>
        The WillTank Team</p>
      </div>
    `;
    
    const result = await sendEmail({
      to: contactEmail,
      subject: `Important: You've been added as ${contactType.replace('_', ' ')} for ${userFullName}`,
      htmlContent: emailContent,
      priority: 'high',
      tags: [
        { name: 'type', value: 'contact_welcome' },
        { name: 'role', value: contactType }
      ]
    });
    
    if (result.success) {
      console.log(`Welcome notification sent successfully to ${contactEmail}`);
      return { success: true };
    } else {
      console.error(`Failed to send welcome notification to ${contactEmail}:`, result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Error in sendContactWelcomeNotification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Send missed check-in notification to contacts
export const sendMissedCheckinNotification = async (
  userId: string,
  daysOverdue: number
): Promise<{ success: boolean; notifications: any[]; error?: string }> => {
  try {
    console.log(`Sending missed check-in notifications for user ${userId} (${daysOverdue} days overdue)`);
    
    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, full_name, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return { success: false, notifications: [], error: 'User not found' };
    }

    const userFullName = user.full_name || 
      (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email);

    // Get all contacts (executors, beneficiaries, trusted contacts)
    const [executorsResult, beneficiariesResult, trustedContactsResult] = await Promise.all([
      supabase.from('will_executors').select('*').eq('user_id', userId),
      supabase.from('will_beneficiaries').select('*').eq('user_id', userId),
      supabase.from('trusted_contacts').select('*').eq('user_id', userId)
    ]);

    const contacts = [];
    
    // Add executors
    if (executorsResult.data) {
      executorsResult.data.forEach(executor => {
        if (executor.email) {
          contacts.push({
            name: executor.name,
            email: executor.email,
            type: 'executor',
            isPrimary: executor.primary_executor,
            phone: executor.phone,
            relation: executor.relation
          });
        }
      });
    }
    
    // Add beneficiaries
    if (beneficiariesResult.data) {
      beneficiariesResult.data.forEach(beneficiary => {
        if (beneficiary.email) {
          contacts.push({
            name: beneficiary.name,
            email: beneficiary.email,
            type: 'beneficiary',
            phone: beneficiary.phone,
            relation: beneficiary.relation
          });
        }
      });
    }
    
    // Add trusted contacts
    if (trustedContactsResult.data) {
      trustedContactsResult.data.forEach(trustedContact => {
        if (trustedContact.email) {
          contacts.push({
            name: trustedContact.name,
            email: trustedContact.email,
            type: 'trusted_contact',
            phone: trustedContact.phone,
            relation: trustedContact.relation
          });
        }
      });
    }

    if (contacts.length === 0) {
      return { success: false, notifications: [], error: 'No contacts to notify' };
    }

    // Build executor contact info for emergency access
    const primaryExecutor = contacts.find(c => c.type === 'executor' && c.isPrimary);
    const executorInfo = primaryExecutor || contacts.find(c => c.type === 'executor');

    const notifications = [];

    // Send notifications to all contacts
    for (const contact of contacts) {
      try {
        const urgencyLevel = daysOverdue <= 3 ? 'mild' : daysOverdue <= 7 ? 'moderate' : 'severe';
        
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: ${urgencyLevel === 'severe' ? '#dc2626' : urgencyLevel === 'moderate' ? '#f59e0b' : '#4a6cf7'};">
              ${urgencyLevel === 'severe' ? '🚨 URGENT' : '⚠️'} Check-in Alert: ${userFullName}
            </h1>
            <p>Dear ${contact.name},</p>
            <p>You are receiving this notification because <strong>${userFullName}</strong> has missed their regular check-in on WillTank for <strong>${daysOverdue} days</strong>.</p>
            
            <div style="background-color: ${urgencyLevel === 'severe' ? '#fef2f2' : '#fef3c7'}; border: 1px solid ${urgencyLevel === 'severe' ? '#fecaca' : '#fcd34d'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: ${urgencyLevel === 'severe' ? '#dc2626' : '#92400e'}; margin-top: 0;">What this means:</h3>
              <p>WillTank users are required to check in regularly to confirm they are well. When someone misses their check-in, we notify their contacts to help verify their status.</p>
            </div>

            <h3 style="color: #1f2937;">🔍 What you should do:</h3>
            <ol style="color: #374151;">
              <li><strong>Contact ${userFullName} immediately</strong> using your usual methods (phone, text, email, or in person)</li>
              <li><strong>If you reach them:</strong> Ask them to log into their WillTank account and complete their check-in</li>
              <li><strong>If you cannot reach them after reasonable attempts:</strong> This may indicate a serious situation</li>
            </ol>

            ${executorInfo ? `
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">🔐 Emergency Contact Information</h3>
                <p>If you cannot reach ${userFullName} and believe something may have happened, contact the executor:</p>
                <p><strong>Executor:</strong> ${executorInfo.name}<br>
                <strong>Email:</strong> ${executorInfo.email}<br>
                ${executorInfo.phone ? `<strong>Phone:</strong> ${executorInfo.phone}<br>` : ''}
                <strong>Role:</strong> ${executorInfo.isPrimary ? 'Primary Executor' : 'Executor'}</p>
              </div>
            ` : ''}

            <div style="background-color: #f3f4f6; border: 1px solid #d1d5db; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">📊 Status Details</h3>
              <p><strong>User:</strong> ${userFullName}<br>
              <strong>Email:</strong> ${user.email}<br>
              <strong>Days Overdue:</strong> ${daysOverdue}<br>
              <strong>Your Role:</strong> ${contact.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}<br>
              <strong>Alert Level:</strong> ${urgencyLevel.toUpperCase()}</p>
            </div>

            <p>Thank you for being part of ${userFullName}'s digital legacy protection plan. Your prompt attention to this matter is crucial.</p>

            <p>Best regards,<br>
            The WillTank Security Team</p>
          </div>
        `;

        const result = await sendEmail({
          to: contact.email,
          subject: `${urgencyLevel === 'severe' ? '🚨 URGENT' : '⚠️'} Check-in Alert: ${userFullName} (${daysOverdue} days overdue)`,
          htmlContent: emailContent,
          priority: urgencyLevel === 'severe' ? 'high' : 'normal',
          tags: [
            { name: 'type', value: 'missed_checkin' },
            { name: 'urgency', value: urgencyLevel },
            { name: 'days_overdue', value: daysOverdue.toString() }
          ]
        });

        notifications.push({
          contact: contact.name,
          email: contact.email,
          type: contact.type,
          success: result.success,
          error: result.error
        });

      } catch (error) {
        console.error(`Error sending notification to ${contact.email}:`, error);
        notifications.push({
          contact: contact.name,
          email: contact.email,
          type: contact.type,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { success: true, notifications };
  } catch (error) {
    console.error('Error in sendMissedCheckinNotification:', error);
    return { success: false, notifications: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
