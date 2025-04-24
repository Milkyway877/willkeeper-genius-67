
import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

export function AccountActivationSuccessBanner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Auto-hide the success banner after 5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="w-full bg-green-50 border-b border-green-200 py-3 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
        <p className="text-green-800 font-medium">
          Your account is now active — Welcome to WillTank!
        </p>
      </div>
    </div>
  );
}
