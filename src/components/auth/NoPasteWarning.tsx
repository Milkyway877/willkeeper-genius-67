
import React from 'react';

const NoPasteWarning: React.FC = () => {
  return (
    <div className="text-xs text-gray-500 mt-1">
      For security reasons, please type your password. Copy-paste is disabled.
    </div>
  );
};

export default NoPasteWarning;
