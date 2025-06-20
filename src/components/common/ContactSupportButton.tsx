
import React from 'react';
import { Button } from '@/components/ui/button';
import { LifeBuoy } from 'lucide-react';

export function ContactSupportButton({ className }: { className?: string }) {
  return (
    <Button
      asChild
      variant="outline"
      className={`flex items-center gap-2 border-willtank-300 text-willtank-700 hover:text-white hover:bg-indigo-600 ${className || ''}`}
      aria-label="Contact Support via Email"
    >
      <a
        href="mailto:support@willtank.com?subject=Support Request - WillTank"
        rel="noopener noreferrer"
      >
        <LifeBuoy className="h-5 w-5 text-indigo-600" />
        Contact Support
      </a>
    </Button>
  );
}
