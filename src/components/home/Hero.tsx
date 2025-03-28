
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, useAnimation } from 'framer-motion';
import { RotatingGlobe } from './RotatingGlobe';

export function Hero() {
  const controls = useAnimation();
  
  useEffect(() => {
    const animateBackground = async () => {
      await controls.start({
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        transition: { 
          repeat: Infinity, 
          duration: 20, 
          ease: "linear" 
        }
      });
    };
    
    animateBackground();
  }, [controls]);

  return (
    <motion.section 
      className="relative min-h-screen overflow-hidden flex items-center"
      animate={controls}
      style={{
        background: 'linear-gradient(135deg, #000000, #2c3e50, #000000, #1a1a2e, #000000)',
        backgroundSize: '300% 300%',
      }}
    >
      {/* Overlay pattern */}
      <div className="absolute inset-0 dot-pattern opacity-[0.07] z-10"></div>
      
      <div className="container max-w-7xl mx-auto px-4 md:px-6 relative z-20 pt-20 lg:pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div 
            className="text-white"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white mb-8 border border-white/20 backdrop-blur-sm"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <span>Secure global legacy planning</span>
              <Link to="/how-it-works" className="ml-2 text-white/70 hover:text-white transition-colors">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold leading-tight text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Legacy planning 
              <span className="bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent"> for the </span>
              <span className="relative">
                <span className="bg-gradient-to-r from-white to-white bg-clip-text text-transparent">
                  digital age
                </span>
                <motion.span 
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-white/0 via-white to-white/0"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 1 }}
                ></motion.span>
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-200 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              WillTank provides enterprise-grade security for your estate planning, 
              protecting your legacy across <span className="text-white font-medium">every corner of the globe</span>.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Link to="/auth/signup">
                <Button size="lg" className="rounded-full bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg">
                  Get started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="rounded-full border-white text-white bg-transparent hover:bg-white/10 px-8 py-6 text-lg">
                  How it works
                </Button>
              </Link>
            </motion.div>
            
            <motion.div 
              className="flex items-center flex-wrap gap-6 text-sm text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <div className="flex items-center">
                <span className="inline-block w-1 h-1 rounded-full bg-white mr-2"></span>
                Bank-grade encryption
              </div>
              <div className="flex items-center">
                <span className="inline-block w-1 h-1 rounded-full bg-white mr-2"></span>
                24/7 global support
              </div>
              <div className="flex items-center">
                <span className="inline-block w-1 h-1 rounded-full bg-white mr-2"></span>
                International legal compliance
              </div>
            </motion.div>
          </motion.div>
          
          {/* Right content - Globe */}
          <motion.div 
            className="flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="relative w-full max-w-xl">
              <motion.div 
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-3xl"
                animate={{ 
                  opacity: [0.5, 0.8, 0.5],
                  scale: [0.8, 1, 0.8],
                  rotate: 360
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 15,
                  ease: "linear" 
                }}
              ></motion.div>
              <RotatingGlobe />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent z-10"></div>
    </motion.section>
  );
}
