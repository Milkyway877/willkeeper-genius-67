
import { createSystemNotification } from '@/services/notificationService';

export const createTestNotification = async () => {
  try {
    const result = await createSystemNotification('info', {
      title: 'Test Notification',
      description: 'This is a test notification to verify the system is working.'
    });
    
    if (result) {
      console.log('Test notification created successfully');
      return true;
    } else {
      console.error('Failed to create test notification');
      return false;
    }
  } catch (error) {
    console.error('Error creating test notification:', error);
    return false;
  }
};

export const createSecurityNotification = async () => {
  return createSystemNotification('security', {
    title: 'Security Alert',
    description: 'This is a test security notification to verify the system is working.'
  });
};

export const createSuccessNotification = async () => {
  return createSystemNotification('success', {
    title: 'Success',
    description: 'This is a test success notification to verify the system is working.'
  });
};

export const createWarningNotification = async () => {
  return createSystemNotification('warning', {
    title: 'Warning',
    description: 'This is a test warning notification to verify the system is working.'
  });
};

export const createWillCreatedNotification = async () => {
  return createSystemNotification('will_created', {
    title: 'Will Created',
    description: 'This is a test will creation notification to verify the system is working.'
  });
};

export const createWillUpdatedNotification = async () => {
  return createSystemNotification('will_updated', {
    title: 'Will Updated',
    description: 'This is a test will update notification to verify the system is working.'
  });
};

export const createBeneficiaryAddedNotification = async () => {
  return createSystemNotification('beneficiary_added', {
    title: 'Beneficiary Added',
    description: 'This is a test beneficiary added notification to verify the system is working.'
  });
};

export const createExecutorAddedNotification = async () => {
  return createSystemNotification('executor_added', {
    title: 'Executor Added',
    description: 'This is a test executor added notification to verify the system is working.'
  });
};

export const createDocumentUploadedNotification = async () => {
  return createSystemNotification('document_uploaded', {
    title: 'Document Uploaded',
    description: 'This is a test document uploaded notification to verify the system is working.'
  });
};
