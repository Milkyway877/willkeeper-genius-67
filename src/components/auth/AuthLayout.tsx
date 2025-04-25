
import React from 'react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/logo/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center overflow-hidden relative">
      {/* Dynamic background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.3),rgba(0,0,0,0.7))]"></div>
        <motion.div 
          className="absolute inset-0"
          initial={{ backgroundPosition: "0% 0%" }}
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30h60v60h-60z' fill='none' stroke='%233b82f6' stroke-opacity='0.2' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px"
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 py-12 px-4">
        {/* Add WillTank logo */}
        <div className="mb-6 flex justify-center">
          <Logo size="lg" color="white" className="mx-auto" showSlogan />
        </div>
        
        {title && (
          <motion.h1 
            className="text-center text-4xl font-extrabold text-white mb-8 tracking-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </motion.h1>
        )}
        
        <div className="max-w-md mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
