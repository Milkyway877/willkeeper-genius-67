
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative pt-32 md:pt-40 pb-20 overflow-hidden bg-hero-gradient">
      {/* Blob background shapes */}
      <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-orange-100/40 to-orange-200/20 blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-blue-100/30 to-blue-200/10 blur-3xl"></div>
      
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 dot-pattern opacity-[0.15]"></div>
      
      <div className="container max-w-6xl relative z-10">
        <motion.div 
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8 text-black"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Update your{' '}
            <motion.span 
              className="inline-block relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="dot-pattern animate-dot-pattern opacity-80 text-black font-black tracking-tight">
                legacy
              </span>
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            WillTank provides <span className="highlight-text">bank-grade</span> security for your estate planning, ensuring your legacy is <span className="highlight-text">protected</span> for generations.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/auth/signup">
              <Button size="lg" className="rounded-full bg-black text-white hover:bg-gray-800 px-8 py-6 text-lg">
                start <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button size="lg" variant="outline" className="rounded-full border-black bg-transparent text-black hover:bg-black hover:text-white px-8 py-6 text-lg">
                How it works
              </Button>
            </Link>
          </motion.div>
          
          {/* Trust indicators */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.div 
              className="flex flex-col items-center"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="text-4xl font-bold text-black mb-2">99.9%</div>
              <div className="text-sm text-gray-600">Uptime Guarantee</div>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="text-4xl font-bold text-black mb-2">AES-256</div>
              <div className="text-sm text-gray-600">Encryption</div>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="text-4xl font-bold text-black mb-2">24/7</div>
              <div className="text-sm text-gray-600">Expert Support</div>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="text-4xl font-bold text-black mb-2">10k+</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
