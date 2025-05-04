
import { createSystemNotification } from '@/services/notificationService';

// ============ Will Management Notifications ============
export const triggerWillCreatedNotification = async () => {
  return await createSystemNotification('will_created', {
    title: 'Will Created',
    description: 'Your will has been successfully created.'
  });
};

export const triggerWillUpdatedNotification = async (details?: string) => {
  return await createSystemNotification('will_updated', {
    title: 'Will Updated',
    description: details || 'Your will has been successfully updated.'
  });
};

export const triggerWillSignedNotification = async () => {
  return await createSystemNotification('will_signed', {
    title: 'Will Signed',
    description: 'Your will has been successfully signed and witnessed.'
  });
};

export const triggerWillDeletedNotification = async () => {
  return await createSystemNotification('will_deleted', {
    title: 'Will Deleted',
    description: 'Your will has been permanently deleted.'
  });
};

// ============ Document Management Notifications ============
export const triggerDocumentUploadedNotification = async (documentName?: string) => {
  return await createSystemNotification('document_uploaded', {
    title: 'Document Uploaded',
    description: documentName 
      ? `"${documentName}" has been successfully uploaded.` 
      : 'A new document has been successfully uploaded.'
  });
};

export const triggerDocumentDeletedNotification = async (documentName?: string) => {
  return await createSystemNotification('document_deleted', {
    title: 'Document Deleted',
    description: documentName 
      ? `"${documentName}" has been permanently deleted.` 
      : 'A document has been permanently deleted.'
  });
};

export const triggerDocumentSharedNotification = async (documentName?: string) => {
  return await createSystemNotification('document_shared', {
    title: 'Document Shared',
    description: documentName 
      ? `"${documentName}" has been shared.` 
      : 'A document has been shared.'
  });
};

// ============ Contact Management Notifications ============
export const triggerBeneficiaryAddedNotification = async (name?: string) => {
  return await createSystemNotification('beneficiary_added', {
    title: 'Beneficiary Added',
    description: name 
      ? `${name} has been added as a beneficiary.` 
      : 'A new beneficiary has been added to your will.'
  });
};

export const triggerExecutorAddedNotification = async (name?: string) => {
  return await createSystemNotification('executor_added', {
    title: 'Executor Added',
    description: name 
      ? `${name} has been added as an executor.` 
      : 'A new executor has been added to your will.'
  });
};

export const triggerContactVerifiedNotification = async (name?: string) => {
  return await createSystemNotification('contact_verified', {
    title: 'Contact Verified',
    description: name 
      ? `${name} has verified their contact information.` 
      : 'A contact has verified their information.'
  });
};

export const triggerTrustedContactAddedNotification = async (name?: string) => {
  return await createSystemNotification('trusted_contact_added', {
    title: 'Trusted Contact Added',
    description: name 
      ? `${name} has been added as a trusted contact.` 
      : 'A new trusted contact has been added.'
  });
};

export const triggerTrustedContactVerifiedNotification = async (name?: string) => {
  return await createSystemNotification('trusted_contact_verified', {
    title: 'Trusted Contact Verified',
    description: name 
      ? `${name} has verified their role as a trusted contact.` 
      : 'A trusted contact has verified their role.'
  });
};

// ============ Security Notifications ============
export const triggerSecurityKeyGeneratedNotification = async () => {
  return await createSystemNotification('security_key_generated', {
    title: 'Security Key Generated',
    description: 'A new security key has been generated for your account.'
  });
};

export const triggerNewLoginNotification = async (deviceInfo?: string) => {
  return await createSystemNotification('new_login', {
    title: 'New Login Detected',
    description: deviceInfo 
      ? `A new login was detected from ${deviceInfo}.` 
      : 'A new login was detected on your account.'
  });
};

export const triggerPasswordChangedNotification = async () => {
  return await createSystemNotification('password_changed', {
    title: 'Password Changed',
    description: 'Your account password has been changed.'
  });
};

// ============ Subscription Notifications ============
export const triggerSubscriptionChangedNotification = async (newPlan?: string) => {
  return await createSystemNotification('subscription_changed', {
    title: 'Subscription Changed',
    description: newPlan 
      ? `Your subscription has been changed to the ${newPlan} plan.` 
      : 'Your subscription has been updated.'
  });
};

export const triggerSubscriptionRenewalNotification = async (daysUntilRenewal?: number) => {
  return await createSystemNotification('subscription_renewal', {
    title: 'Subscription Renewal',
    description: daysUntilRenewal 
      ? `Your subscription will renew in ${daysUntilRenewal} days.` 
      : 'Your subscription will renew soon.'
  });
};

export const triggerPaymentFailedNotification = async () => {
  return await createSystemNotification('payment_failed', {
    title: 'Payment Failed',
    description: 'We were unable to process your last payment. Please update your payment information.'
  });
};

// ============ System Notifications ============
export const triggerSystemMaintenanceNotification = async (scheduledTime?: string) => {
  return await createSystemNotification('system_maintenance', {
    title: 'Scheduled Maintenance',
    description: scheduledTime 
      ? `WillTank will be undergoing maintenance on ${scheduledTime}.` 
      : 'WillTank will be undergoing scheduled maintenance soon.'
  });
};

export const triggerSystemUpdateNotification = async () => {
  return await createSystemNotification('system_update', {
    title: 'System Update',
    description: 'WillTank has been updated with new features and improvements.'
  });
};

// ============ Death Verification Notifications ============
export const triggerDeathVerificationSetupNotification = async () => {
  return await createSystemNotification('death_verification_setup', {
    title: 'Death Verification Setup',
    description: 'Your death verification system has been set up successfully.'
  });
};

export const triggerDeathVerificationCheckInNotification = async () => {
  return await createSystemNotification('death_verification_checkin', {
    title: 'Check-in Confirmed',
    description: 'Your regular check-in has been recorded successfully.'
  });
};

export const triggerDeathVerificationMissedCheckInNotification = async () => {
  return await createSystemNotification('death_verification_missed_checkin', {
    title: 'Missed Check-in',
    description: 'You missed your scheduled check-in. Please check in soon to prevent the verification process from starting.'
  });
};
