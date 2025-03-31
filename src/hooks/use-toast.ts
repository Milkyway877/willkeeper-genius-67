
import { toast as toastFunction } from '@/components/ui/use-toast';

export { toastFunction as toast };
export const useToast = () => {
  return { toast: toastFunction };
};
