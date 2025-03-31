
import { toast as toastImpl } from '@/components/ui/use-toast';

export const toast = toastImpl;

export const useToast = () => {
  return { toast: toastImpl };
};
