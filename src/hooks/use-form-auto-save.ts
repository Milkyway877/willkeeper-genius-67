
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

  // Create debounced save function
  const saveData = useCallback(async (dataToSave: T) => {
    if (!enabled) return;
    
    setSaving(true);
    setSaveError(null);
    
    try {
      await onSave(dataToSave);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error auto-saving form:', error);
      setSaveError(typeof error === 'string' ? error : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }, [enabled, onSave]);

  // Create and store the debounced function
  useEffect(() => {
    debouncedSaveRef.current = debounce(saveData, debounceMs);
    
    // Clean up on unmount
    return () => {
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

  return {
    saving,
    lastSaved,
    saveError,
    cancelSave
  };
}
