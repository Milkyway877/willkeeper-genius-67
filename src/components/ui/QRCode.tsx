
import React from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
}

export function QRCode({ value, size = 200 }: QRCodeProps) {
  // This is a placeholder component - in a real app, you'd use a proper QR code library
  return (
    <div 
      className="bg-gray-200 flex items-center justify-center" 
      style={{ width: size, height: size }}
    >
      <span className="text-xs text-gray-600 text-center p-4">
        QR Code Placeholder<br />
        {value ? "(QR data available)" : "(No QR data)"}
      </span>
    </div>
  );
}
