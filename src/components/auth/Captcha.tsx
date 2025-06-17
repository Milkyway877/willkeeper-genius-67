
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
  className?: string;
}

export function Captcha({ onVerify, className = '' }: CaptchaProps) {
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const drawCaptcha = (code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background with noise
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add background noise
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }

    // Draw distorted text
    ctx.font = 'bold 24px Arial';
    ctx.textBaseline = 'middle';
    
    const spacing = canvas.width / (code.length + 1);
    
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const x = spacing * (i + 1);
      const y = canvas.height / 2 + (Math.random() - 0.5) * 10;
      
      // Random color
      const r = Math.floor(Math.random() * 100) + 50;
      const g = Math.floor(Math.random() * 100) + 50;
      const b = Math.floor(Math.random() * 100) + 50;
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      
      // Random rotation
      const angle = (Math.random() - 0.5) * 0.5;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    // Add some lines for extra noise
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
  };

  const refreshCaptcha = () => {
    const newCode = generateRandomCode();
    setCaptchaCode(newCode);
    setUserInput('');
    drawCaptcha(newCode);
    onVerify(false);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  useEffect(() => {
    const isValid = userInput.toUpperCase() === captchaCode && userInput.length === captchaCode.length;
    onVerify(isValid);
  }, [userInput, captchaCode, onVerify]);

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Security Verification
      </label>
      
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <canvas
            ref={canvasRef}
            width="150"
            height="50"
            className="border border-gray-300 rounded bg-gray-50"
          />
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={refreshCaptcha}
          className="px-3"
          title="Generate new captcha"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <Input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value.toUpperCase())}
          placeholder="Enter the code above"
          className="font-mono tracking-wider"
          maxLength={6}
        />
        <p className="text-xs text-gray-500">
          Enter the {captchaCode.length} characters shown above (case insensitive)
        </p>
      </div>
    </div>
  );
}

export default Captcha;
