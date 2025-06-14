import { useState, useEffect, useCallback } from 'react';
import { getMonitoringStatus, MonitoringStatus } from '@/services/godmodeService';

export function useGodmodeStatus(willId?: string) {
  const [monitoringStatus, setMonitoringStatus] = useState<MonitoringStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshStatus = useCallback(async () => {
    if (!willId) return;
    
    setLoading(true);
    try {
      const status = await getMonitoringStatus(willId);
      setMonitoringStatus(status);
    } catch (error) {
      console.error('Error fetching GODMODE status:', error);
    } finally {
      setLoading(false);
    }
  }, [willId]);

  useEffect(() => {
    if (willId) {
      refreshStatus();
      
      // Refresh every minute to keep countdown accurate
      const interval = setInterval(refreshStatus, 60000);
      return () => clearInterval(interval);
    }
  }, [willId, refreshStatus]);

  const formatTimeRemaining = useCallback(() => {
    if (!monitoringStatus?.timeRemaining) return '00:00:00';
    
    const hours = Math.floor(monitoringStatus.timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((monitoringStatus.timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((monitoringStatus.timeRemaining % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [monitoringStatus?.timeRemaining]);

  const getUrgencyLevel = useCallback((): 'normal' | 'high' | 'critical' => {
    if (!monitoringStatus?.timeRemaining) return 'normal';
    
    const hoursRemaining = monitoringStatus.timeRemaining / (1000 * 60 * 60);
    
    if (hoursRemaining <= 1) return 'critical';
    if (hoursRemaining <= 4) return 'high';
    return 'normal';
  }, [monitoringStatus?.timeRemaining]);

  return {
    monitoringStatus,
    loading,
    refreshStatus,
    formattedTimeRemaining: formatTimeRemaining(),
    urgencyLevel: getUrgencyLevel(),
    isDeletionScheduled: monitoringStatus?.status === 'deletion_pending'
  };
}
