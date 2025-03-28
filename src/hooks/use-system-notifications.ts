
import { useCallback } from 'react';
import { createSystemNotification } from '@/services/notificationService';
import { toast } from '@/components/ui/use-toast';

export function useSystemNotifications() {
  const notifySuccess = useCallback(async (title: string, description: string) => {
    // Show immediate toast
    toast({
      title,
      description,
      variant: 'default',
    });
    
    // Also create a persistent notification
    try {
      return await createSystemNotification('success', { title, description });
    } catch (error) {
      console.error('Failed to create success notification:', error);
      return null;
    }
  }, []);
  
  const notifyInfo = useCallback(async (title: string, description: string) => {
    // Show immediate toast
    toast({
      title,
      description,
      variant: 'default',
    });
    
    // Also create a persistent notification
    try {
      return await createSystemNotification('info', { title, description });
    } catch (error) {
      console.error('Failed to create info notification:', error);
      return null;
    }
  }, []);
  
  const notifyWarning = useCallback(async (title: string, description: string) => {
    // Show immediate toast
    toast({
      title,
      description,
      variant: 'default',
    });
    
    // Also create a persistent notification
    try {
      return await createSystemNotification('warning', { title, description });
    } catch (error) {
      console.error('Failed to create warning notification:', error);
      return null;
    }
  }, []);
  
  const notifySecurity = useCallback(async (title: string, description: string) => {
    // Show immediate toast
    toast({
      title,
      description,
      variant: 'destructive',
    });
    
    // Also create a persistent notification
    try {
      return await createSystemNotification('security', { title, description });
    } catch (error) {
      console.error('Failed to create security notification:', error);
      return null;
    }
  }, []);

  // Legacy methods kept for backward compatibility
  const notifyWillUpdated = useCallback(async (details?: { title?: string, description?: string, itemId?: string }) => {
    const title = details?.title || 'Will Updated';
    const description = details?.description || 'Your will has been successfully updated.';
    return notifySuccess(title, description);
  }, [notifySuccess]);

  const notifyDocumentUploaded = useCallback(async (details?: { title?: string, description?: string, itemId?: string }) => {
    const title = details?.title || 'Document Uploaded';
    const description = details?.description || 'A new document has been uploaded to your account.';
    return notifyInfo(title, description);
  }, [notifyInfo]);

  const notifySecurityKeyGenerated = useCallback(async (details?: { title?: string, description?: string, itemId?: string }) => {
    const title = details?.title || 'Security Key Generated';
    const description = details?.description || 'A new security key has been generated for your account.';
    return notifySecurity(title, description);
  }, [notifySecurity]);

  const notifyBeneficiaryAdded = useCallback(async (details?: { title?: string, description?: string, itemId?: string }) => {
    const title = details?.title || 'Beneficiary Added';
    const description = details?.description || 'A new beneficiary has been added to your will.';
    return notifyInfo(title, description);
  }, [notifyInfo]);

  const notifyExecutorAdded = useCallback(async (details?: { title?: string, description?: string, itemId?: string }) => {
    const title = details?.title || 'Executor Added';
    const description = details?.description || 'A new executor has been added to your will.';
    return notifyInfo(title, description);
  }, [notifyInfo]);

  const notifyItemSaved = useCallback(async (details?: { title?: string, description?: string, itemId?: string }) => {
    const title = details?.title || 'Item Saved';
    const description = details?.description || 'Your item has been saved successfully.';
    return notifySuccess(title, description);
  }, [notifySuccess]);
  
  const notifyWillDeleted = useCallback(async (details?: { title?: string, description?: string, itemId?: string }) => {
    const title = details?.title || 'Will Deleted';
    const description = details?.description || 'Your will has been deleted.';
    return notifyInfo(title, description);
  }, [notifyInfo]);

  return {
    // New simpler methods
    notifySuccess,
    notifyInfo,
    notifyWarning,
    notifySecurity,
    
    // Legacy methods
    notifyWillUpdated,
    notifyDocumentUploaded,
    notifySecurityKeyGenerated,
    notifyBeneficiaryAdded,
    notifyExecutorAdded,
    notifyItemSaved,
    notifyWillDeleted
  };
}
