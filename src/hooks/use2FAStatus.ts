
import { useState, useEffect } from 'react';
import { check2FAStatus } from '@/services/encryptionService';

export const use2FAStatus = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const check2FA = async () => {
    try {
      setLoading(true);
      const status = await check2FAStatus();
      setIs2FAEnabled(status);
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      setIs2FAEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    check2FA();
  }, []);

  return {
    is2FAEnabled,
    loading,
    refresh: check2FA
  };
};
