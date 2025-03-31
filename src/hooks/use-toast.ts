
import { toast as toastFunction } from '@/components/ui/use-toast';

export const useToast = () => {
  return { toast: toastFunction };
};

// Export the toast function directly for convenience
export const toast = toastFunction;
