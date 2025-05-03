
import { createSystemNotification } from '@/services/notificationService';

// Define valid event types for type safety
export type EventType = 
  | 'will_created' 
  | 'will_updated' 
  | 'document_uploaded' 
  | 'beneficiary_added' 
  | 'executor_added'
  | 'security'
  | 'subscription_update'
  | 'account_update'
  | 'will_signed'
  | 'will_deleted'
  | 'document_deleted'
  | 'document_shared'
  | 'contact_verified'
  | 'trusted_contact_added'
  | 'trusted_contact_verified'
  | 'security_key_generated'
  | 'subscription_changed'
  | 'subscription_renewal'
  | 'payment_failed'
  | 'system';

// Will-related notifications
export const triggerWillCreatedNotification = async () => {
  return await createSystemNotification('will_created', {
    title: 'Will Created Successfully',
    description: 'Your will has been created and saved securely.'
  });
};

export const triggerWillUpdatedNotification = async (details?: string) => {
  return await createSystemNotification('will_updated', {
    title: 'Will Updated',
    description: details || 'Your will has been updated and saved securely.'
  });
};

export const triggerWillSignedNotification = async () => {
  return await createSystemNotification('will_signed', {
    title: 'Will Signed',
    description: 'Your will has been digitally signed and witnesses have been notified.'
  });
};

export const triggerWillDeletedNotification = async () => {
  return await createSystemNotification('will_deleted', {
    title: 'Will Deleted',
    description: 'Your will has been deleted from our system.'
  });
};

// Document-related notifications
export const triggerDocumentUploadedNotification = async (documentName?: string) => {
  return await createSystemNotification('document_uploaded', {
    title: 'Document Uploaded',
    description: documentName 
      ? `"${documentName}" has been uploaded successfully.` 
      : 'Your document has been uploaded successfully.'
  });
};

export const triggerDocumentDeletedNotification = async (documentName?: string) => {
  return await createSystemNotification('document_deleted', {
    title: 'Document Deleted',
    description: documentName 
      ? `"${documentName}" has been deleted.` 
      : 'Your document has been deleted.'
  });
};

export const triggerDocumentSharedNotification = async (documentName?: string) => {
  return await createSystemNotification('document_shared', {
    title: 'Document Shared',
    description: documentName 
      ? `"${documentName}" has been shared successfully.` 
      : 'Your document has been shared successfully.'
  });
};

// Contact-related notifications
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
      : 'A contact has been verified successfully.'
  });
};

export const triggerTrustedContactAddedNotification = async (name?: string) => {
  return await createSystemNotification('trusted_contact_added', {
    title: 'Trusted Contact Added',
    description: name 
      ? `${name} has been added as a trusted contact.` 
      : 'A new trusted contact has been added for verification purposes.'
  });
};

export const triggerTrustedContactVerifiedNotification = async (name?: string) => {
  return await createSystemNotification('trusted_contact_verified', {
    title: 'Trusted Contact Verified',
    description: name 
      ? `${name} has verified their contact information.` 
      : 'A trusted contact has verified their information.'
  });
};

// Security-related notifications
export const triggerSecurityKeyGeneratedNotification = async () => {
  return await createSystemNotification('security_key_generated', {
    title: 'Security Keys Generated',
    description: 'New security keys have been generated for your account.'
  });
};

export const triggerNewLoginNotification = async (deviceInfo?: string) => {
  return await createSystemNotification('security', {
    title: 'New Login Detected',
    description: deviceInfo 
      ? `A new login was detected from ${deviceInfo}.` 
      : 'A new login was detected on your account.'
  });
};

export const triggerPasswordChangedNotification = async () => {
  return await createSystemNotification('security', {
    title: 'Password Changed',
    description: 'Your account password has been changed successfully.'
  });
};

// Subscription-related notifications
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
      ? `Your subscription will be renewed in ${daysUntilRenewal} days.` 
      : 'Your subscription will be renewed soon.'
  });
};

export const triggerPaymentFailedNotification = async () => {
  return await createSystemNotification('payment_failed', {
    title: 'Payment Failed',
    description: 'We were unable to process your payment. Please update your payment method.'
  });
};

// System notifications
export const triggerSystemMaintenanceNotification = async (scheduledTime?: string) => {
  return await createSystemNotification('system', {
    title: 'Scheduled Maintenance',
    description: scheduledTime 
      ? `System maintenance is scheduled for ${scheduledTime}.` 
      : 'System maintenance is scheduled. Some features may be temporarily unavailable.'
  });
};

export const triggerSystemUpdateNotification = async () => {
  return await createSystemNotification('system', {
    title: 'System Updated',
    description: 'Our system has been updated with new features and improvements.'
  });
};

// Death verification notifications
export const triggerDeathVerificationSetupNotification = async () => {
  return await createSystemNotification('security', {
    title: 'Death Verification Set Up',
    description: 'Your death verification system has been set up successfully.'
  });
};

export const triggerDeathVerificationCheckInNotification = async () => {
  return await createSystemNotification('security', {
    title: 'Check-in Confirmed',
    description: 'You have successfully completed your scheduled check-in.'
  });
};

export const triggerDeathVerificationMissedCheckInNotification = async () => {
  return await createSystemNotification('security', {
    title: 'Check-in Missed',
    description: 'You missed a scheduled check-in. Please check in as soon as possible to avoid triggering the verification process.'
  });
};
