
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePwaInstall = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      // For iOS (Safari)
      if (navigator.standalone) {
        setIsInstalled(true);
        return;
      }
      
      // For Chrome and others with display-mode: standalone
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      setIsInstalled(false);
    };

    checkIfInstalled();

    // Listen for beforeinstallprompt event
    const beforeInstallPromptHandler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for appinstalled event
    const appInstalledHandler = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
    window.addEventListener('appinstalled', appInstalledHandler);
    window.addEventListener('display-mode-changed', checkIfInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
      window.removeEventListener('appinstalled', appInstalledHandler);
      window.removeEventListener('display-mode-changed', checkIfInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!installPrompt) {
      return;
    }

    // Show the install prompt
    await installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    // Clear the prompt regardless of outcome
    setInstallPrompt(null);
  };

  return {
    isInstallable: !!installPrompt && !isInstalled,
    isInstalled,
    promptInstall
  };
};
