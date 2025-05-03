
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
