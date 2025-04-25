
import React from 'react';

interface HoneypotFieldProps {
  name: string;
  className?: string;
}

// This component creates invisible fields to catch bots
// Legitimate users won't fill these out because they can't see them
const HoneypotField: React.FC<HoneypotFieldProps> = ({ name, className }) => {
  return (
    <div 
      aria-hidden="true"
      style={{ 
        position: 'absolute',
        height: '1px',
        width: '1px',
        overflow: 'hidden',
        clip: 'rect(1px, 1px, 1px, 1px)',
        whiteSpace: 'nowrap'
      }}
    >
      <label htmlFor={name} className={className}>
        Leave this field empty
      </label>
      <input 
        type="text" 
        id={name} 
        name={name} 
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
};

export default HoneypotField;
