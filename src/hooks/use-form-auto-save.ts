
import { useEffect, useState, useCallback, useRef } from 'react';
import { debounce } from 'lodash';

export interface AutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<any>;
  debounceMs?: number;
  enabled?: boolean;
}

export function useFormAutoSave<T extends Record<string, any>>({
  data,
  onSave,
  debounceMs = 1000,
  enabled = true
}: AutoSaveOptions<T>) {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const debouncedSaveRef = useRef<any>(null);
  const previousDataRef = useRef<T | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Function to check if data has actually changed
  const hasDataChanged = useCallback((newData: T) => {
    if (!previousDataRef.current) return true;
    
    // Compare each key in the data
    const prevData = previousDataRef.current;
    for (const key in newData) {
      if (JSON.stringify(newData[key]) !== JSON.stringify(prevData[key])) {
        return true;
      }
    }
    
    return false;
  }, []);

  // Create save function
  const saveData = useCallback(async (dataToSave: T) => {
    if (!enabled || !isMountedRef.current) return;
    
    // Only save if data has actually changed
    if (!hasDataChanged(dataToSave)) {
      console.log("Data hasn't changed, skipping auto-save");
      return;
    }
    
    // Save the current data as previous data
    previousDataRef.current = {...dataToSave};
    
    try {
      console.log("Auto-saving data:", dataToSave);
      setSaving(true);
      setSaveError(null);
      
      await onSave(dataToSave);
      
      if (isMountedRef.current) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Error auto-saving form:', error);
      if (isMountedRef.current) {
        setSaveError(typeof error === 'string' ? error : 'Failed to save changes');
      }
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, [enabled, onSave, hasDataChanged]);

  // Create and store the debounced function
  useEffect(() => {
    debouncedSaveRef.current = debounce(saveData, debounceMs);
    
    // Clean up on unmount
    return () => {
      isMountedRef.current = false;
      if (debouncedSaveRef.current?.cancel) {
        debouncedSaveRef.current.cancel();
      }
    };
  }, [saveData, debounceMs]);

  // Trigger save when data changes
  useEffect(() => {
    if (enabled && Object.keys(data).length > 0 && debouncedSaveRef.current) {
      debouncedSaveRef.current(data);
    }
  }, [data, enabled]);

  // Cancel function that correctly accesses the latest debounced function
  const cancelSave = useCallback(() => {
    if (debouncedSaveRef.current?.cancel) {
      debouncedSaveRef.current.cancel();
    }
  }, []);

  // Save immediately (bypass debounce)
  const saveImmediately = useCallback(async () => {
    if (!enabled || !isMountedRef.current) return;
    
    cancelSave();
    await saveData(data);
  }, [cancelSave, data, enabled, saveData]);

  return {
    saving,
    lastSaved,
    saveError,
    cancelSave,
    saveImmediately
  };
}
