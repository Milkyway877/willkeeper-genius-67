
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

export function RotatingGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // This function creates the dots on the globe representing global coverage
  const generateLocationDots = () => {
    const dots = [];
    const locations = [
      { top: '30%', left: '20%', delay: 0, size: 'md' },     // North America
      { top: '35%', left: '45%', delay: 1, size: 'sm' },     // Europe
      { top: '40%', left: '65%', delay: 2, size: 'md' },     // Asia
      { top: '55%', left: '55%', delay: 3, size: 'sm' },     // Africa
      { top: '60%', left: '30%', delay: 4, size: 'md' },     // South America
      { top: '70%', left: '80%', delay: 5, size: 'sm' },     // Australia
      { top: '25%', left: '75%', delay: 6, size: 'sm' },     // East Asia
      { top: '45%', left: '30%', delay: 7, size: 'xs' },     // Central America
      { top: '50%', left: '75%', delay: 8, size: 'sm' },     // Middle East
      { top: '38%', left: '52%', delay: 9, size: 'xs' },     // Eastern Europe
      { top: '25%', left: '28%', delay: 10, size: 'sm' },    // North America (West)
      { top: '65%', left: '60%', delay: 11, size: 'xs' },    // Southern Africa
    ];
    
    for (const loc of locations) {
      const sizeClass = loc.size === 'xs' ? 'w-1.5 h-1.5' : 
                        loc.size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';
      
      dots.push(
        <motion.div 
          key={`${loc.top}-${loc.left}`}
          className={`absolute ${sizeClass} rounded-full bg-white`}
          style={{ top: loc.top, left: loc.left }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0]
          }}
          transition={{ 
            delay: loc.delay * 0.5, 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 7
          }}
        />
      );
    }
    
    return dots;
  };
  
  // Connection lines animation effect
  const generateConnectionLines = () => {
    const lines = [];
    const connections = [
      { from: { top: '30%', left: '20%' }, to: { top: '35%', left: '45%' }, delay: 0.5, length: '120px' },  // North America to Europe
      { from: { top: '35%', left: '45%' }, to: { top: '40%', left: '65%' }, delay: 1.5, length: '90px' },  // Europe to Asia
      { from: { top: '40%', left: '65%' }, to: { top: '55%', left: '55%' }, delay: 2.5, length: '80px' },  // Asia to Africa
      { from: { top: '55%', left: '55%' }, to: { top: '60%', left: '30%' }, delay: 3.5, length: '110px' },  // Africa to South America
      { from: { top: '60%', left: '30%' }, to: { top: '30%', left: '20%' }, delay: 4.5, length: '135px' },  // South America to North America
      { from: { top: '70%', left: '80%' }, to: { top: '40%', left: '65%' }, delay: 5.5, length: '100px' },  // Australia to Asia
    ];
    
    for (let i = 0; i < connections.length; i++) {
      const conn = connections[i];
      lines.push(
        <motion.div
          key={`line-${i}`}
          className="absolute h-px bg-gradient-to-r from-blue-400 to-white/50 z-10"
          style={{
            top: conn.from.top,
            left: conn.from.left,
            transformOrigin: 'left center',
            width: conn.length,
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ 
            scaleX: 1, 
            opacity: [0, 0.6, 0],
          }}
          transition={{ 
            delay: conn.delay,
            duration: 2,
            repeat: Infinity,
            repeatDelay: 8
          }}
        />
      );
    }
    
    return lines;
  };
  
  return (
    <div className="relative w-full aspect-square max-w-xl flex items-center justify-center" ref={containerRef}>
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
          
          {/* Location dots */}
          {generateLocationDots()}
          
          {/* Connection lines */}
          {generateConnectionLines()}
          
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
      
      {/* Middle ring */}
      <motion.div 
        className="absolute w-[85%] h-[85%] rounded-full border border-blue-500/20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ 
          rotate: 360,
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 50,
          ease: "linear" 
        }}
      />
      
      {/* Floating text indicators */}
      <motion.div 
        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs text-white border border-white/20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        Global Coverage
      </motion.div>
      
      <motion.div 
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs text-white border border-white/20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.5 }}
      >
        24/7 Access
      </motion.div>
      
      <motion.div 
        className="absolute top-1/2 -right-8 -translate-y-1/2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs text-white border border-white/20"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.1, duration: 0.5 }}
      >
        Worldwide Security
      </motion.div>
    </div>
  );
}
