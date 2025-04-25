import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  fadeInUp, 
  floatElement, 
  scanLine,
  holographicReveal,
  particleSystem,
  glitchText
} from '@/components/auth/animations';
import { CircleUser, Key, Mail, ShieldCheck, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { QRCode } from '@/components/ui/QRCode';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const navigate = useNavigate();
  
  const validateStep1 = () => {
    const errors: {name?: string; email?: string} = {};
    
    if (!name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email format is invalid';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateStep2 = () => {
    const errors: {password?: string; confirmPassword?: string} = {};
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };
  
  const handlePreviousStep = () => {
    setStep(step - 1);
  };
  
  const handleCompleteSignup = () => {
    setLoading(true);
    
    // Simulate registration delay
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 2000);
  };
  
  const renderStep1 = () => (
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
      {/* Name field */}
      <motion.div variants={fadeInUp}>
        <div className="relative">
          <CircleUser className="absolute left-3 top-3 h-5 w-5 text-blue-400" />
          <Input
            type="text"
            placeholder="Neural Identifier (Full Name)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-400 focus-visible:ring-blue-500"
          />
        </div>
        {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
      </motion.div>
      
      {/* Email field */}
      <motion.div variants={fadeInUp}>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="email"
            placeholder="Neural Connection (Email)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-400 focus-visible:ring-blue-500"
          />
        </div>
        {formErrors.email && <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>}
      </motion.div>
      
      {/* Next button */}
      <motion.div variants={fadeInUp} className="pt-2">
        <Button 
          type="button"
          onClick={handleNextStep}
          className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl relative overflow-hidden border border-white/20"
        >
          <div className="flex items-center justify-center">
            <span className="mr-2">Continue Neural Interface Setup</span>
            <ArrowRight className="h-5 w-5" />
          </div>
          
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
  );
  
  const renderStep2 = () => (
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
      {/* Password field */}
      <motion.div variants={fadeInUp}>
        <div className="relative">
          <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Neural Security Key (Password)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder-gray-400 focus-visible:ring-blue-500"
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
      
      {/* Confirm password field */}
      <motion.div variants={fadeInUp}>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Neural Security Key"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder-gray-400 focus-visible:ring-blue-500"
          />
          <button 
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {formErrors.confirmPassword && <p className="text-red-400 text-sm mt-1">{formErrors.confirmPassword}</p>}
      </motion.div>
      
      {/* Password strength indicator */}
      <motion.div variants={fadeInUp} className="pt-2">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-sm text-gray-300 mb-2">Neural Key Strength:</div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                password.length > 12 ? 'bg-green-500' : 
                password.length > 8 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              style={{ width: `${Math.min((password.length / 16) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </motion.div>
      
      {/* Navigation buttons */}
      <motion.div variants={fadeInUp} className="pt-2 flex gap-3">
        <Button 
          type="button"
          onClick={handlePreviousStep}
          variant="outline"
          className="w-1/3 py-6 border-white/20 text-white hover:bg-white/10"
        >
          Back
        </Button>
        <Button 
          type="button"
          onClick={handleNextStep}
          className="w-2/3 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl relative overflow-hidden"
        >
          <div className="flex items-center justify-center">
            <span className="mr-2">Complete Neural Link</span>
            <ArrowRight className="h-5 w-5" />
          </div>
        </Button>
      </motion.div>
    </motion.div>
  );
  
  const renderStep3 = () => (
    <motion.div 
      className="space-y-6"
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
      {/* Success message */}
      <motion.div variants={fadeInUp} className="text-center">
        <motion.div 
          className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-500"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
        >
          <ShieldCheck className="w-10 h-10 text-white" />
        </motion.div>
        <h3 className="text-xl font-medium text-white mb-2">Neural Profile Created</h3>
        <p className="text-gray-400 mb-4">Complete by scanning the quantum code below</p>
      </motion.div>
      
      {/* QR code */}
      <motion.div variants={fadeInUp} className="flex justify-center">
        <motion.div 
          className="p-3 bg-white rounded-lg"
          whileHover={{ boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
        >
          <QRCode value={`neurolink:${email}`} size={180} />
        </motion.div>
      </motion.div>
      
      {/* Scanning animation */}
      <motion.div 
        variants={fadeInUp} 
        className="h-1 bg-blue-500 rounded-full"
        animate={{ 
          y: [0, 180, 0],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ 
          duration: 2.5, 
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Complete button */}
      <motion.div variants={fadeInUp} className="pt-2">
        <Button 
          type="button"
          onClick={handleCompleteSignup}
          disabled={loading}
          className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Integrating Neural Profile</span>
            </div>
          ) : (
            "Complete Neural Interface Setup"
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
  
  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden flex items-center justify-center p-4">
      {/* Dynamic background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(67,56,202,0.15),rgba(0,0,0,0.5))]"></div>
        <motion.div 
          className="absolute inset-0"
          initial={{ backgroundPosition: "0% 0%" }}
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30h60v60h-60z' fill='none' stroke='%233b82f6' stroke-opacity='0.1' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px"
          }}
        />
        
        {/* Animated particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full bg-blue-400"
            style={{
              width: Math.random() * 8 + 2 + 'px',
              height: Math.random() * 8 + 2 + 'px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: "blur(1px)"
            }}
            animate={{
              y: [0, Math.random() * -150 - 50],
              x: [0, (Math.random() - 0.5) * 100],
              opacity: [0, 0.7, 0]
            }}
            transition={{
              duration: Math.random() * 7 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
      
      {/* Scan line effect */}
      <motion.div 
        className="absolute inset-x-0 h-40 bg-gradient-to-b from-indigo-500/10 to-transparent z-10 pointer-events-none"
        {...scanLine}
      />
      
      {/* Holographic container */}
      <motion.div
        className="w-full max-w-md relative z-20 bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-[0_0_40px_rgba(59,130,246,0.1)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div {...floatElement} className="absolute -right-20 -top-20 w-40 h-40 bg-indigo-500 rounded-full filter blur-3xl opacity-20 z-0" />
        <motion.div {...floatElement} className="absolute -left-20 -bottom-20 w-40 h-40 bg-blue-500 rounded-full filter blur-3xl opacity-20 z-0" />
        
        <div className="relative z-10">
          {/* Header and title */}
          <motion.div 
            className="mb-8 text-center"
            {...fadeInUp}
          >
            {/* Step indicator */}
            <motion.div className="flex items-center justify-center gap-3 mb-6">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <motion.div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                      stepNumber === step
                        ? 'bg-blue-600 border-blue-400 text-white'
                        : stepNumber < step
                          ? 'bg-green-600 border-green-400 text-white'
                          : 'bg-white/5 border-white/20 text-gray-400'
                    }`}
                    whileHover={stepNumber < step ? { scale: 1.1 } : {}}
                    onClick={() => stepNumber < step && setStep(stepNumber)}
                    style={{ cursor: stepNumber < step ? 'pointer' : 'default' }}
                  >
                    {stepNumber < step ? '✓' : stepNumber}
                  </motion.div>
                  {stepNumber < 3 && (
                    <div 
                      className={`w-10 h-0.5 ${
                        stepNumber < step ? 'bg-green-600' : 'bg-white/10'
                      }`}
                    />
                  )}
                </div>
              ))}
            </motion.div>
            
            <motion.h1 
              className="text-3xl font-bold text-white mb-1"
              {...glitchText}
            >
              {step === 1 && "Neural Profile Creation"}
              {step === 2 && "Security Protocol Setup"}
              {step === 3 && "Quantum Authentication"}
            </motion.h1>
            <motion.p 
              className="text-blue-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {step === 1 && "Enter your neural identifiers"}
              {step === 2 && "Establish secure neural links"}
              {step === 3 && "Complete biometric integration"}
            </motion.p>
          </motion.div>
          
          {/* Form steps */}
          <form onSubmit={(e) => e.preventDefault()}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </form>
          
          {/* Link to login */}
          {step < 3 && (
            <motion.div 
              className="mt-8 text-center text-gray-400"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.6 }}
            >
              Neural profile exists?{' '}
              <Link to="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                Access system
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
