
import React from 'react';
import { Info } from 'lucide-react';

const NoPasteWarning: React.FC = () => {
  return (
    <div className="flex items-start gap-2 p-2 bg-amber-50 text-amber-800 rounded-md text-sm mt-2">
      <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <p>
        For security reasons, please manually type your credentials. 
        Copy-paste has been disabled on sensitive fields.
      </p>
    </div>
  );
};

export default NoPasteWarning;
