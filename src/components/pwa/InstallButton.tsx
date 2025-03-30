
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { motion } from 'framer-motion';

export const InstallButton = () => {
  const { isInstallable, promptInstall } = usePwaInstall();

  if (!isInstallable) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Button 
        onClick={promptInstall}
        className="bg-willtank-500 hover:bg-willtank-600 text-white w-full group transition-all duration-300 hover:shadow-lg"
      >
        <motion.div 
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Download className="mr-2 h-5 w-5 group-hover:animate-bounce" /> 
          Install WillTank
        </motion.div>
      </Button>
    </motion.div>
  );
};
