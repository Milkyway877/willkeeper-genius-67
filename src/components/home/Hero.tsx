
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, useAnimation } from 'framer-motion';
import { OptimizedGlobe } from '@/components/ui/optimized-globe';

export function Hero() {
  const controls = useAnimation();
  
  useEffect(() => {
    const animateBackground = async () => {
      await controls.start({
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        transition: { 
          repeat: Infinity, 
          duration: 25, // Slower animation
          ease: "easeInOut" 
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
        background: 'linear-gradient(135deg, rgba(0,0,0,0.7), rgba(28,46,64,0.7), rgba(0,0,0,0.7), rgba(22,36,53,0.7), rgba(0,0,0,0.7))',
        backgroundSize: '400% 400%',
      }}
    >
      {/* Globe background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10"></div>
        <div className="w-full h-full scale-[1.8] md:scale-[1.4] -translate-y-24 md:-translate-y-0">
          <OptimizedGlobe 
            className="opacity-90" 
            config={{
              width: 800,
              height: 800,
              onRender: () => {},
              devicePixelRatio: window.devicePixelRatio > 1 ? 2 : 1,
              phi: 0,
              theta: 0.3,
              dark: 1,
              diffuse: 0.4,
              mapSamples: 12000,
              mapBrightness: 1.2,
              baseColor: [0.3, 0.3, 0.6],
              markerColor: [66/255, 160/255, 136/255],
              glowColor: [0.2, 0.2, 0.5],
              markers: [
                { location: [14.5995, 120.9842], size: 0.03 },
                { location: [19.076, 72.8777], size: 0.1 },
                { location: [39.9042, 116.4074], size: 0.08 },
                { location: [-23.5505, -46.6333], size: 0.1 },
                { location: [40.7128, -74.006], size: 0.1 },
                { location: [51.5074, -0.1278], size: 0.1 },
              ],
            }}
          />
        </div>
      </div>
      
      {/* Subtle overlay pattern for texture */}
      <div className="absolute inset-0 dot-pattern opacity-[0.05] z-10"></div>
      
      <div className="container max-w-7xl mx-auto px-6 md:px-8 relative z-20 pt-24 lg:pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left content - Text */}
          <motion.div 
            className="text-white max-w-2xl"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white mb-10 border border-white/20 backdrop-blur-sm"
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
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white mb-8"
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
              className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              WillTank provides enterprise-grade security for your estate planning, 
              protecting your legacy across <span className="text-white font-medium">every corner of the globe</span>.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-5 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Link to="/auth/signup">
                <Button size="lg" className="rounded-full bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                  Get started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="rounded-full border-white text-white bg-transparent hover:bg-white/10 px-8 py-6 text-lg transition-all">
                  How it works
                </Button>
              </Link>
            </motion.div>
            
            <motion.div 
              className="flex items-center flex-wrap gap-7 text-sm text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <div className="flex items-center group">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-2 group-hover:bg-blue-400 transition-colors"></span>
                <span className="group-hover:text-white transition-colors">Bank-grade encryption</span>
              </div>
              <div className="flex items-center group">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-2 group-hover:bg-blue-400 transition-colors"></span>
                <span className="group-hover:text-white transition-colors">24/7 global support</span>
              </div>
              <div className="flex items-center group">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-2 group-hover:bg-blue-400 transition-colors"></span>
                <span className="group-hover:text-white transition-colors">International legal compliance</span>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Right content - Space for feature highlights */}
          <motion.div 
            className="flex justify-center items-center lg:justify-end backdrop-blur-sm bg-black/10 p-6 rounded-xl border border-white/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="relative w-full max-w-xl">
              <motion.div 
                className="absolute inset-0 rounded-full bg-gradient-to-r from-willtank-500/20 to-indigo-500/20 blur-3xl"
                animate={{ 
                  opacity: [0.5, 0.8, 0.5],
                  scale: [0.8, 1.05, 0.8],
                  rotate: 360
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 20,
                  ease: "linear" 
                }}
              ></motion.div>
              
              <div className="text-center space-y-6">
                <h3 className="text-2xl text-white font-medium">Trusted Worldwide</h3>
                <p className="text-gray-300">Our secure platform connects you with trusted legal experts and ensures your legacy is protected globally.</p>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-20 rounded bg-white/5 flex items-center justify-center border border-white/10">
                      <div className="w-10 h-10 rounded-full bg-willtank-500/20 flex items-center justify-center">
                        <span className="text-white font-medium">{i}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent z-10"></div>
    </motion.section>
  );
}
