
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo/Logo';
import { updateUserProfile } from '@/services/profileService';
import { useToast } from '@/components/ui/use-toast';
import { 
  ChevronRight, 
  ChevronLeft,
  Shield, 
  Lock, 
  Users,
  FileText,
  MessageSquare,
  Eye,
  UserCheck,
  Settings,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Key
} from 'lucide-react';

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "Welcome to WillTank",
      subtitle: "Your Trusted Digital Legacy Keeper",
      content: (
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto w-32 h-32 bg-willtank-100 rounded-full flex items-center justify-center"
          >
            <Shield className="w-16 h-16 text-willtank-600" />
          </motion.div>
          
          <div className="space-y-4">
            <p className="text-lg text-gray-600 leading-relaxed">
              WillTank protects and delivers your most important digital messages, 
              documents, and final wishes when they matter most.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <FileText className="w-8 h-8 text-willtank-600 mx-auto mb-2" />
                <h4 className="font-medium text-sm">Digital Wills</h4>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <MessageSquare className="w-8 h-8 text-willtank-600 mx-auto mb-2" />
                <h4 className="font-medium text-sm">Future Messages</h4>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <Lock className="w-8 h-8 text-willtank-600 mx-auto mb-2" />
                <h4 className="font-medium text-sm">Secure Storage</h4>
              </motion.div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Security & Trust",
      subtitle: "Bank-Grade Protection for Your Digital Legacy",
      content: (
        <div className="space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Data is Protected</h3>
            <p className="text-gray-600">Military-grade encryption ensures your information stays private and secure.</p>
          </motion.div>

          <div className="space-y-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400"
            >
              <Smartphone className="w-6 h-6 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Enable Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400"
            >
              <Key className="w-6 h-6 text-yellow-600" />
              <div>
                <h4 className="font-medium text-gray-900">Strong Password Required</h4>
                <p className="text-sm text-gray-600">Use a unique, complex password for maximum protection</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-400"
            >
              <Shield className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-medium text-gray-900">Regular Security Checkups</h4>
                <p className="text-sm text-gray-600">We'll remind you to review and update your security settings</p>
              </div>
            </motion.div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Platform Features",
      subtitle: "Everything You Need for Digital Legacy Management",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-willtank-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-willtank-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Digital Wills</h4>
              <p className="text-sm text-gray-600">Create, edit, and securely store your legal documents with our guided templates.</p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Tank Messages</h4>
              <p className="text-sm text-gray-600">Schedule future messages to be delivered to loved ones at the right time.</p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Trusted Contacts</h4>
              <p className="text-sm text-gray-600">Designate trusted individuals who can verify your status and access your legacy.</p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Death Verification</h4>
              <p className="text-sm text-gray-600">Automated system to verify your status and trigger message delivery when needed.</p>
            </motion.div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Best Practices",
      subtitle: "Keep Your Account Safe and Your Legacy Protected",
      content: (
        <div className="space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <div className="mx-auto w-20 h-20 bg-willtank-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-willtank-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">You're Almost Ready!</h3>
          </motion.div>

          <div className="space-y-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-start space-x-3 p-4 bg-willtank-50 rounded-lg"
            >
              <div className="w-6 h-6 bg-willtank-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Complete Your Profile</h4>
                <p className="text-sm text-gray-600">Add your personal information and verify your identity</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg"
            >
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Enable Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600">Secure your account with 2FA immediately after onboarding</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg"
            >
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Add Trusted Contacts</h4>
                <p className="text-sm text-gray-600">Invite family members or friends who can verify your status</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg"
            >
              <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">4</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Regular Security Reviews</h4>
                <p className="text-sm text-gray-600">Check your security settings monthly and update passwords regularly</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="bg-willtank-600 text-white p-6 rounded-lg text-center"
          >
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <h4 className="font-semibold mb-2">Important Reminder</h4>
            <p className="text-sm text-willtank-100">
              Your digital legacy is precious. Take a few minutes now to secure your account 
              and set up your trusted contacts. Your future self will thank you.
            </p>
          </motion.div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    
    try {
      await updateUserProfile({
        onboarding_completed: true
      });
      
      toast({
        title: "Welcome to WillTank!",
        description: "Your onboarding is complete. Let's get started with securing your digital legacy.",
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "There was an issue completing your onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  const currentStepData = steps.find(step => step.id === currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-willtank-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-4" />
          
          {/* Progress Bar */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step.id <= currentStep 
                    ? 'bg-willtank-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.id}
                </div>
                {step.id < steps.length && (
                  <div className={`w-12 h-0.5 mx-2 transition-colors ${
                    step.id < currentStep ? 'bg-willtank-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <AnimatePresence mode="wait">
            {currentStepData && (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[400px]"
              >
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {currentStepData.title}
                  </h1>
                  <p className="text-lg text-gray-600">
                    {currentStepData.subtitle}
                  </p>
                </div>
                
                <div>
                  {currentStepData.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700"
              >
                Skip Onboarding
              </Button>
            )}
          </div>

          <div className="text-center text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </div>

          <div>
            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                className="flex items-center space-x-2 bg-willtank-600 hover:bg-willtank-700"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isCompleting}
                className="flex items-center space-x-2 bg-willtank-600 hover:bg-willtank-700"
              >
                {isCompleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Completing...</span>
                  </>
                ) : (
                  <>
                    <span>Get Started</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
