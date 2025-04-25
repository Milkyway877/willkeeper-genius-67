
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  fadeInUp, 
  glowPulse, 
  floatElement, 
  scanLine,
  holographicReveal
} from '@/components/auth/animations';
import { Fingerprint, Eye, EyeOff, Key, Mail, Shield, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{email?: string; password?: string}>({});
  const navigate = useNavigate();
  
  const validateForm = () => {
    const errors: {email?: string; password?: string} = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email format is invalid';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Simulate authentication delay
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 2000);
  };
  
  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden flex items-center justify-center p-4">
      {/* Dynamic background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.1),rgba(0,0,0,0.5))]"></div>
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full bg-blue-500"
            style={{
              width: Math.random() * 6 + 1 + 'px',
              height: Math.random() * 6 + 1 + 'px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * -100 - 50],
              x: [0, (Math.random() - 0.5) * 50],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
      
      {/* Scan line effect */}
      <motion.div 
        className="absolute inset-x-0 h-40 bg-gradient-to-b from-blue-500/10 to-transparent z-10 pointer-events-none"
        {...scanLine}
      />
      
      {/* Holographic container */}
      <motion.div
        className="w-full max-w-md relative z-20 glassmorphism border border-white/20 rounded-2xl p-8 backdrop-blur-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div {...floatElement} className="absolute -right-20 -top-20 w-40 h-40 bg-blue-500 rounded-full filter blur-3xl opacity-20 z-0" />
        <motion.div {...floatElement} className="absolute -left-20 -bottom-20 w-40 h-40 bg-indigo-500 rounded-full filter blur-3xl opacity-20 z-0" />
        
        <div className="relative z-10">
          {/* Logo and title */}
          <motion.div 
            className="mb-8 text-center"
            {...fadeInUp}
          >
            <motion.div 
              className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 p-4"
              {...glowPulse}
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1 
              className="text-3xl font-bold text-white mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Access Portal
            </motion.h1>
            <motion.p 
              className="text-blue-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Enter your credentials to continue
            </motion.p>
          </motion.div>
          
          {/* Form */}
          <form onSubmit={handleSubmit}>
            <motion.div 
              className="space-y-5"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15
                  }
                }
              }}
              initial="hidden"
              animate="show"
            >
              {/* Email field */}
              <motion.div variants={fadeInUp}>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Neural ID (Email)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-black/40 border-white/10 text-white placeholder-gray-500 focus-visible:ring-blue-500"
                  />
                </div>
                {formErrors.email && <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>}
              </motion.div>
              
              {/* Password field */}
              <motion.div variants={fadeInUp}>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Access Key (Password)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-black/40 border-white/10 text-white placeholder-gray-500 focus-visible:ring-blue-500"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {formErrors.password && <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>}
              </motion.div>
              
              {/* Biometric options */}
              <motion.div variants={fadeInUp} className="flex justify-center">
                <motion.button 
                  type="button"
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600/30 to-blue-600/30 backdrop-blur-md border border-white/10 text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Fingerprint className="w-6 h-6" />
                </motion.button>
              </motion.div>
              
              {/* Submit button */}
              <motion.div variants={fadeInUp} className="pt-2">
                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl relative overflow-hidden"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Authenticating</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="mr-2">Access System</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                  
                  {/* Animated border effect when button is hovered */}
                  <motion.div 
                    className="absolute inset-0 opacity-0 hover:opacity-100"
                    whileHover={{ opacity: 1 }}
                  >
                    <div className="absolute inset-0 border-2 border-white opacity-20"></div>
                    <div className="absolute top-0 left-0 w-2 h-2 bg-white rounded-full"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 bg-white rounded-full"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-white rounded-full"></div>
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
          </form>
          
          {/* Link to signup */}
          <motion.div 
            className="mt-8 text-center text-gray-400"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.6 }}
          >
            No neural profile?{' '}
            <Link to="/auth/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
              Initialize profile
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
