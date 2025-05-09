
import React from 'react';
import { UserButton } from '@clerk/clerk-react';
import { useClerkSupabase } from '@/contexts/ClerkSupabaseContext';

export function UserDropdownMenu() {
  const { profile } = useClerkSupabase();
  
  return (
    <div className="flex items-center gap-2">
      <UserButton 
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "w-8 h-8 rounded-full",
          }
        }}
      />
      <span className="hidden md:inline text-sm font-medium">
        {profile?.full_name || ''}
      </span>
    </div>
  );
}
