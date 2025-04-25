
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/logo/Logo';
import { 
  fadeInUp, 
  glowPulse, 
  floatElement, 
  scanLine,
  holographicReveal
} from '@/components/auth/animations';
import { Eye, EyeOff, Key, Mail, Shield, ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';

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
    <AuthLayout title="Welcome Back">
      <motion.div
        className="w-full max-w-md relative z-20 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(14,165,233,0.2)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div {...floatElement} className="absolute -right-20 -top-20 w-40 h-40 bg-blue-500 rounded-full filter blur-3xl opacity-20 z-0" />
        <motion.div {...floatElement} className="absolute -left-20 -bottom-20 w-40 h-40 bg-indigo-500 rounded-full filter blur-3xl opacity-20 z-0" />
        
        <div className="relative z-10">
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
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-blue-400" />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus-visible:ring-blue-500"
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
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus-visible:ring-blue-500"
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
              
              {/* Submit button */}
              <motion.div variants={fadeInUp} className="pt-2">
                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl relative overflow-hidden border border-white/20"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Signing In</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="mr-2">Sign In</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </form>
          
          {/* Link to signup */}
          <motion.div 
            className="mt-8 text-center text-gray-300"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.6 }}
          >
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
              Create account
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
