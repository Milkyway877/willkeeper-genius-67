
import { createSystemNotification } from '@/services/notificationService';
import { EventType } from '@/services/notificationService';

// Will-related notifications
export const triggerWillCreatedNotification = async () => {
  return createSystemNotification('will_created', {
    title: 'Will Created',
    description: 'You have successfully created a new will. Review it regularly to ensure it stays up to date.'
  });
};

export const triggerWillUpdatedNotification = async (details?: string) => {
  return createSystemNotification('will_updated', {
    title: 'Will Updated',
    description: details || 'Your will has been successfully updated.'
  });
};

export const triggerWillSignedNotification = async () => {
  return createSystemNotification('success', {
    title: 'Will Signed',
    description: 'Your will has been successfully signed. This is an important step in formalizing your legal document.'
  });
};

export const triggerWillDeletedNotification = async () => {
  return createSystemNotification('will_deleted', {
    title: 'Will Deleted',
    description: 'A will has been deleted from your account. Please create a new will if needed.'
  });
};

// Document-related notifications
export const triggerDocumentUploadedNotification = async (documentName?: string) => {
  return createSystemNotification('document_uploaded', {
    title: 'Document Uploaded',
    description: documentName 
      ? `Your document "${documentName}" has been successfully uploaded.` 
      : 'A new document has been uploaded to your account.'
  });
};

export const triggerDocumentDeletedNotification = async (documentName?: string) => {
  return createSystemNotification('warning', {
    title: 'Document Deleted',
    description: documentName 
      ? `Your document "${documentName}" has been deleted.` 
      : 'A document has been deleted from your account.'
  });
};

export const triggerDocumentSharedNotification = async (documentName?: string) => {
  return createSystemNotification('info', {
    title: 'Document Shared',
    description: documentName 
      ? `Your document "${documentName}" has been shared.` 
      : 'A document has been shared from your account.'
  });
};

// Beneficiary and executor notifications
export const triggerBeneficiaryAddedNotification = async (name?: string) => {
  return createSystemNotification('beneficiary_added', {
    title: 'Beneficiary Added',
    description: name 
      ? `${name} has been added as a beneficiary to your will.` 
      : 'A new beneficiary has been added to your will.'
  });
};

export const triggerExecutorAddedNotification = async (name?: string) => {
  return createSystemNotification('executor_added', {
    title: 'Executor Added',
    description: name 
      ? `${name} has been added as an executor to your will.` 
      : 'A new executor has been added to your will.'
  });
};

export const triggerContactVerifiedNotification = async (name?: string) => {
  return createSystemNotification('success', {
    title: 'Contact Verified',
    description: name 
      ? `${name} has verified their contact information.` 
      : 'A contact has verified their information.'
  });
};

// Security-related notifications
export const triggerSecurityKeyGeneratedNotification = async () => {
  return createSystemNotification('security_key_generated', {
    title: 'Security Key Generated',
    description: 'A new security key has been generated for your account.'
  });
};

export const triggerNewLoginNotification = async (deviceInfo?: string) => {
  return createSystemNotification('security', {
    title: 'New Login Detected',
    description: deviceInfo 
      ? `A new login was detected from ${deviceInfo}.` 
      : 'A new login was detected on your account. If this wasn\'t you, please secure your account immediately.'
  });
};

export const triggerPasswordChangedNotification = async () => {
  return createSystemNotification('security', {
    title: 'Password Changed',
    description: 'Your account password has been changed. If you didn\'t make this change, please contact support.'
  });
};

// Subscription and billing notifications
export const triggerSubscriptionChangedNotification = async (newPlan?: string) => {
  return createSystemNotification('success', {
    title: 'Subscription Updated',
    description: newPlan 
      ? `Your subscription has been updated to ${newPlan}.` 
      : 'Your subscription plan has been updated.'
  });
};

export const triggerSubscriptionRenewalNotification = async (daysUntilRenewal?: number) => {
  return createSystemNotification('info', {
    title: 'Subscription Renewal Reminder',
    description: daysUntilRenewal 
      ? `Your subscription will renew in ${daysUntilRenewal} days.` 
      : 'Your subscription will renew soon.'
  });
};

export const triggerPaymentFailedNotification = async () => {
  return createSystemNotification('warning', {
    title: 'Payment Failed',
    description: 'We were unable to process your payment. Please update your payment information.'
  });
};

// System notifications
export const triggerSystemMaintenanceNotification = async (scheduledTime?: string) => {
  return createSystemNotification('info', {
    title: 'Scheduled Maintenance',
    description: scheduledTime 
      ? `WillTank will undergo scheduled maintenance on ${scheduledTime}.` 
      : 'WillTank will undergo scheduled maintenance soon. You may experience brief service interruptions.'
  });
};

export const triggerSystemUpdateNotification = async () => {
  return createSystemNotification('info', {
    title: 'System Update',
    description: 'WillTank has been updated with new features and improvements.'
  });
};
