
import { useEffect, useState } from 'react';
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

  // Create debounced save function
  const debouncedSave = debounce(async (dataToSave: T) => {
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
  }, debounceMs);

  // Trigger save when data changes
  useEffect(() => {
    if (enabled && Object.keys(data).length > 0) {
      debouncedSave(data);
    }
    
    // Cancel debounced call on cleanup
    return () => {
      debouncedSave.cancel();
    };
  }, [data, enabled]);

  return {
    saving,
    lastSaved,
    saveError,
    cancelSave: debouncedSave.cancel
  };
}
