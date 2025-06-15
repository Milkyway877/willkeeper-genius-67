
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function BackButton({ className = '' }: { className?: string }) {
  const navigate = useNavigate();
  return (
    <button
      className={`flex items-center gap-2 text-willtank-700 hover:text-indigo-700 transition-colors px-2 py-1 rounded-md bg-transparent border-none text-base font-medium shadow-none ${className}`}
      onClick={() => navigate('/')}
      aria-label="Back"
      type="button"
    >
      <ArrowLeft className="h-5 w-5" />
      <span className="hidden sm:inline">Back</span>
    </button>
  );
}
