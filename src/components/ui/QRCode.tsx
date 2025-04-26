
import React, { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

interface QRCodeProps {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  logoImage?: string;
  logoWidth?: number;
  logoHeight?: number;
}

export function QRCode({
  value,
  size = 200,
  color = '#000000',
  backgroundColor = '#ffffff',
  logoImage,
  logoWidth,
  logoHeight
}: QRCodeProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!ref.current || !value) return;
    
    // Clear any previous QR codes
    while (ref.current.firstChild) {
      ref.current.removeChild(ref.current.firstChild);
    }
    
    try {
      console.log("Generating QR code for value:", value);
      
      // Create QR code
      const qrCode = new QRCodeStyling({
        width: size,
        height: size,
        type: 'svg',
        data: value,
        dotsOptions: {
          color: color,
          type: 'rounded'
        },
        backgroundOptions: {
          color: backgroundColor,
        },
        cornersSquareOptions: {
          type: 'extra-rounded'
        },
        cornersDotOptions: {
          type: 'dot'
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 10
        },
        qrOptions: {
          errorCorrectionLevel: 'H'
        }
      });
      
      // Add logo if provided
      if (logoImage) {
        qrCode.update({
          image: logoImage,
          imageOptions: {
            hideBackgroundDots: true,
            imageSize: 0.3,
            crossOrigin: 'anonymous',
            margin: 10
          }
        });
      }
      
      qrCode.append(ref.current);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  }, [value, size, color, backgroundColor, logoImage, logoWidth, logoHeight]);
  
  return <div ref={ref} className="flex justify-center" />;
}
