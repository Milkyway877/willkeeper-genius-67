
import { useCallback } from 'react';
import * as notificationTriggers from '@/utils/notificationTriggers';

export function useNotificationTriggers() {
  const triggerWillCreated = useCallback(async () => {
    return await notificationTriggers.triggerWillCreatedNotification();
  }, []);

  const triggerWillUpdated = useCallback(async (details?: string) => {
    return await notificationTriggers.triggerWillUpdatedNotification(details);
  }, []);

  const triggerWillSigned = useCallback(async () => {
    return await notificationTriggers.triggerWillSignedNotification();
  }, []);

  const triggerWillDeleted = useCallback(async () => {
    return await notificationTriggers.triggerWillDeletedNotification();
  }, []);

  const triggerDocumentUploaded = useCallback(async (documentName?: string) => {
    return await notificationTriggers.triggerDocumentUploadedNotification(documentName);
  }, []);

  const triggerDocumentDeleted = useCallback(async (documentName?: string) => {
    return await notificationTriggers.triggerDocumentDeletedNotification(documentName);
  }, []);

  const triggerDocumentShared = useCallback(async (documentName?: string) => {
    return await notificationTriggers.triggerDocumentSharedNotification(documentName);
  }, []);

  const triggerBeneficiaryAdded = useCallback(async (name?: string) => {
    return await notificationTriggers.triggerBeneficiaryAddedNotification(name);
  }, []);

  const triggerExecutorAdded = useCallback(async (name?: string) => {
    return await notificationTriggers.triggerExecutorAddedNotification(name);
  }, []);

  const triggerContactVerified = useCallback(async (name?: string) => {
    return await notificationTriggers.triggerContactVerifiedNotification(name);
  }, []);

  const triggerSecurityKeyGenerated = useCallback(async () => {
    return await notificationTriggers.triggerSecurityKeyGeneratedNotification();
  }, []);

  const triggerNewLogin = useCallback(async (deviceInfo?: string) => {
    return await notificationTriggers.triggerNewLoginNotification(deviceInfo);
  }, []);

  const triggerPasswordChanged = useCallback(async () => {
    return await notificationTriggers.triggerPasswordChangedNotification();
  }, []);

  const triggerSubscriptionChanged = useCallback(async (newPlan?: string) => {
    return await notificationTriggers.triggerSubscriptionChangedNotification(newPlan);
  }, []);

  const triggerSubscriptionRenewal = useCallback(async (daysUntilRenewal?: number) => {
    return await notificationTriggers.triggerSubscriptionRenewalNotification(daysUntilRenewal);
  }, []);

  const triggerPaymentFailed = useCallback(async () => {
    return await notificationTriggers.triggerPaymentFailedNotification();
  }, []);

  const triggerSystemMaintenance = useCallback(async (scheduledTime?: string) => {
    return await notificationTriggers.triggerSystemMaintenanceNotification(scheduledTime);
  }, []);

  const triggerSystemUpdate = useCallback(async () => {
    return await notificationTriggers.triggerSystemUpdateNotification();
  }, []);

  return {
    triggerWillCreated,
    triggerWillUpdated,
    triggerWillSigned,
    triggerWillDeleted,
    triggerDocumentUploaded,
    triggerDocumentDeleted,
    triggerDocumentShared,
    triggerBeneficiaryAdded,
    triggerExecutorAdded,
    triggerContactVerified,
    triggerSecurityKeyGenerated,
    triggerNewLogin,
    triggerPasswordChanged,
    triggerSubscriptionChanged,
    triggerSubscriptionRenewal,
    triggerPaymentFailed,
    triggerSystemMaintenance,
    triggerSystemUpdate
  };
}
