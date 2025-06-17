
import React from 'react';
import { Button } from '@/components/ui/button';
import { LifeBuoy } from 'lucide-react';

export function ContactSupportButton({ className }: { className?: string }) {
  const handleContactSupport = () => {
    // Create the mailto URL with proper encoding
    const subject = encodeURIComponent('Support Request - WillTank');
    const body = encodeURIComponent('Hello WillTank Support Team,\n\nI need assistance with:\n\n[Please describe your issue here]\n\nThank you for your help!\n\nBest regards');
    const mailtoUrl = `mailto:support@willtank.com?subject=${subject}&body=${body}`;
    
    // Use window.location.href instead of opening in new tab
    window.location.href = mailtoUrl;
  };

  return (
    <Button
      variant="outline"
      className={`flex items-center gap-2 border-willtank-300 text-willtank-700 hover:text-white hover:bg-indigo-600 ${className || ''}`}
      onClick={handleContactSupport}
      aria-label="Contact Support via Email"
    >
      <LifeBuoy className="h-5 w-5 text-indigo-600" />
      Contact Support
    </Button>
  );
}
