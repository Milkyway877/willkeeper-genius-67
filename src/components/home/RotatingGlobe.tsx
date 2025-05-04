
import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

export function RotatingGlobe() {
  return (
    <div className="relative w-full aspect-square max-w-xl flex items-center justify-center">
      {/* Globe outer glow effect */}
      <motion.div
        className="absolute w-4/5 h-4/5 rounded-full bg-blue-500/10 blur-xl"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.7, 0.5]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 8,
          ease: "easeInOut" 
        }}
      />
      
      {/* Main rotating globe */}
      <motion.div
        className="relative w-4/5 aspect-square bg-gradient-to-b from-blue-900/30 to-indigo-900/30 rounded-full flex items-center justify-center border border-white/10 backdrop-blur-sm"
        animate={{ 
          rotate: 360,
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 40,
          ease: "linear" 
        }}
      >
        {/* Globe content */}
        <div className="relative w-full h-full">
          {/* Globe texture */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 dot-pattern opacity-10 animate-dot-pattern"></div>
          </div>
          
          {/* Meridians and parallels */}
          <div className="absolute inset-0 rounded-full border border-white/10"></div>
          <div className="absolute top-0 bottom-0 left-1/4 w-px bg-white/10"></div>
          <div className="absolute top-0 bottom-0 left-2/4 w-px bg-white/10"></div>
          <div className="absolute top-0 bottom-0 left-3/4 w-px bg-white/10"></div>
          <div className="absolute left-0 right-0 top-1/4 h-px bg-white/10"></div>
          <div className="absolute left-0 right-0 top-2/4 h-px bg-white/10"></div>
          <div className="absolute left-0 right-0 top-3/4 h-px bg-white/10"></div>
          
          {/* Center icon */}
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80"
            animate={{ 
              opacity: [0.7, 1, 0.7],
              scale: [0.9, 1, 0.9]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3,
              ease: "easeInOut" 
            }}
          >
            <Globe size={40} className="text-blue-100" />
          </motion.div>
        </div>
      </motion.div>
      
      {/* Outer ring */}
      <motion.div 
        className="absolute inset-0 rounded-full border-2 border-white/10"
        animate={{ 
          rotate: -360,
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 60,
          ease: "linear" 
        }}
      />
      
      {/* Floating text indicators */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs text-white border border-white/20">
        Global Coverage
      </div>
      
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs text-white border border-white/20">
        24/7 Access
      </div>
      
      <div className="absolute top-1/2 -right-8 -translate-y-1/2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs text-white border border-white/20">
        Worldwide Security
      </div>
    </div>
  );
}
