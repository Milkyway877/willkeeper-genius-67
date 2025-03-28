
import { useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { createSystemNotification } from '@/services/notificationService';

export function useSuccessNotification() {
  const notifySuccess = useCallback(async (title: string, description: string) => {
    // Show immediate toast
    toast({
      title,
      description,
      variant: 'default',
    });
    
    // Also create a persistent notification
    try {
      await createSystemNotification('success', { title, description });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }, []);

  return { notifySuccess };
}
