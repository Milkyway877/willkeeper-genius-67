
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Shield, Key, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SecuritySection() {
  return (
    <section id="security" className="py-16 sm:py-20 lg:py-24 overflow-hidden bg-white">
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          <motion.div 
            className="relative order-2 md:order-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-willtank-600/5 to-willtank-500/10 rounded-2xl transform -rotate-2 scale-105"></div>
            <motion.div 
              className="relative bg-white rounded-2xl shadow-md p-6 border border-willtank-100"
              initial={{ scale: 0.95 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="grid gap-5">
                <motion.div 
                  className="flex items-start gap-4 p-4 rounded-lg bg-willtank-50 border border-willtank-100"
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                >
                  <div className="h-10 w-10 rounded-full bg-willtank-100 flex items-center justify-center flex-shrink-0">
                    <Lock size={20} className="text-willtank-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">End-to-End Encryption</h4>
                    <p className="text-xs text-gray-600">Your data is encrypted in transit and at rest using AES-256 encryption.</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start gap-4 p-4 rounded-lg bg-willtank-50 border border-willtank-100"
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                >
                  <div className="h-10 w-10 rounded-full bg-willtank-100 flex items-center justify-center flex-shrink-0">
                    <Key size={20} className="text-willtank-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">Multi-Factor Authentication</h4>
                    <p className="text-xs text-gray-600">Secure your account with multiple authentication methods including biometrics.</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start gap-4 p-4 rounded-lg bg-willtank-50 border border-willtank-100"
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                >
                  <div className="h-10 w-10 rounded-full bg-willtank-100 flex items-center justify-center flex-shrink-0">
                    <Shield size={20} className="text-willtank-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">Access Control</h4>
                    <p className="text-xs text-gray-600">Fine-grained access control ensures only authorized individuals can view your will.</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="order-1 md:order-2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-willtank-50 px-3 py-1 text-sm font-medium text-willtank-700">
              <Lock size={14} />
              <span>Military-Grade Protection</span>
            </div>
            
            <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-gray-900">
              Your Will, Secure for Generations
            </h2>
            
            <p className="mt-4 text-lg text-gray-600">
              WillTank employs state-of-the-art security measures to ensure your most sensitive documents remain protected from unauthorized access.
            </p>
            
            <div className="mt-6 grid gap-3">
              {[
                "Regular security audits and penetration testing",
                "Compliance with global data protection regulations",
                "Transparent access logs to monitor activity",
                "Executor verification through multiple channels"
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <CheckCircle size={18} className="text-willtank-500" />
                  <span className="text-gray-700">{feature}</span>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8">
              <Link to="/security">
                <Button className="bg-willtank-600 hover:bg-willtank-700">
                  Learn More About Security
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
