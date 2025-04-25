
import React from 'react';
import { ShieldAlert } from 'lucide-react';

const NoPasteWarning: React.FC = () => {
  return (
    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-sm">
      <ShieldAlert className="h-5 w-5 mt-0.5 flex-shrink-0 text-amber-500" />
      <div>
        <p className="font-medium">Security Notice</p>
        <p>
          For your security, please manually type your credentials. 
          Copy-paste has been disabled on sensitive fields.
        </p>
      </div>
    </div>
  );
};

export default NoPasteWarning;
