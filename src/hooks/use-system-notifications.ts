
import { useCallback } from 'react';
import { createSystemNotification } from '@/services/notificationService';

export function useSystemNotifications() {
  const notifyWillUpdated = useCallback(async (details?: { title?: string, description?: string, itemId?: string }) => {
    return createSystemNotification('will_updated', details);
  }, []);

  const notifyDocumentUploaded = useCallback(async (details?: { title?: string, description?: string, itemId?: string }) => {
    return createSystemNotification('document_uploaded', details);
  }, []);

  const notifySecurityKeyGenerated = useCallback(async (details?: { title?: string, description?: string, itemId?: string }) => {
    return createSystemNotification('security_key_generated', details);
  }, []);

  const notifyBeneficiaryAdded = useCallback(async (details?: { title?: string, description?: string, itemId?: string }) => {
    return createSystemNotification('beneficiary_added', details);
  }, []);

  const notifyExecutorAdded = useCallback(async (details?: { title?: string, description?: string, itemId?: string }) => {
    return createSystemNotification('executor_added', details);
  }, []);

  const notifyItemSaved = useCallback(async (details?: { title?: string, description?: string, itemId?: string }) => {
    return createSystemNotification('item_saved', details);
  }, []);

  return {
    notifyWillUpdated,
    notifyDocumentUploaded,
    notifySecurityKeyGenerated,
    notifyBeneficiaryAdded,
    notifyExecutorAdded,
    notifyItemSaved
  };
}
