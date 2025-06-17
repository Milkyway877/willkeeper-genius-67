
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  FileText, 
  Vault, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  Lock,
  Key,
  UserCheck,
  AlertTriangle,
  Sparkles,
  Loader
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/contexts/UserProfileContext';

interface OnboardingStep {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: {
    text: string;
    path: string;
  };
  color: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    icon: Shield,
    title: "Enable Two-Factor Authentication",
    description: "Secure your account with 2FA for maximum protection. Your digital legacy deserves the strongest security available.",
    action: {
      text: "Set up 2FA",
      path: "/settings"
    },
    color: "bg-red-500"
  },
  {
    icon: FileText,
    title: "Create Your First Will",
    description: "Start with our guided will creation process. Choose from professional templates and customize to your needs.",
    action: {
      text: "Create Will",
      path: "/will/create"
    },
    color: "bg-purple-500"
  },
  {
    icon: Vault,
    title: "Send Messages to the Future",
    description: "Create time-locked messages for your loved ones. Birthday wishes, life advice, or final thoughts - delivered when you choose.",
    action: {
      text: "Create Message",
      path: "/tank/create"
    },
    color: "bg-blue-500"
  },
  {
    icon: Users,
    title: "Add Trusted Contacts",
    description: "Designate people who can verify your passing and access your digital legacy. Essential for account security.",
    action: {
      text: "Add Contacts",
      path: "/tank?tab=verification"
    },
    color: "bg-green-500"
  }
];

const securityTips = [
  "Use a unique, strong password for your WillTank account",
  "Enable two-factor authentication immediately",
  "Regularly update your trusted contacts",
  "Keep your recovery information secure and accessible",
  "Review your account activity periodically"
];

interface WelcomeOnboardingPopupProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  isCompleting?: boolean;
}

export function WelcomeOnboardingPopup({ open, onClose, onComplete, isCompleting = false }: WelcomeOnboardingPopupProps) {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  
  const userName = profile?.full_name?.split(' ')[0] || 'there';

  const handleActionClick = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleGotIt = async () => {
    await onComplete();
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 border-2 border-purple-100">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative"
            >
              {/* Header with Logo and Welcome */}
              <div className="relative px-8 py-6 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white">
                <div className="flex items-center space-x-4">
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="bg-white/20 p-3 rounded-full"
                  >
                    <Vault className="h-8 w-8" />
                  </motion.div>
                  <div>
                    <motion.h1
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl font-bold"
                    >
                      Welcome to WillTank, {userName}! 
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-white/90 mt-1"
                    >
                      Your digital legacy platform is ready. Let's get you started with the essentials.
                    </motion.p>
                  </div>
                </div>
                
                {/* Animated background elements */}
                <div className="absolute top-0 right-0 opacity-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-32 w-32" />
                  </motion.div>
                </div>
              </div>

              {/* Scrollable Content */}
              <ScrollArea className="max-h-[500px]">
                <div className="p-8 space-y-8">
                  {/* Security Priority Alert */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-lg"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="bg-red-100 p-2 rounded-full">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-red-900 text-lg">Security First Priority</h3>
                        <p className="text-red-800 mt-1">
                          Your digital legacy is precious. Enable two-factor authentication now to protect your account from unauthorized access.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Main Steps */}
                  <div className="space-y-6">
                    <motion.h2
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-2xl font-bold text-gray-900 text-center"
                    >
                      Essential Steps to Get Started
                    </motion.h2>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                      {onboardingSteps.map((step, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group"
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`${step.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform duration-200`}>
                              <step.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                {step.description}
                              </p>
                              {step.action && (
                                <Button
                                  onClick={() => handleActionClick(step.action!.path)}
                                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm"
                                  size="sm"
                                >
                                  {step.action.text}
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Security Best Practices */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Lock className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">Security Best Practices</h3>
                    </div>
                    <div className="space-y-3">
                      {securityTips.map((tip, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.2 + index * 0.05 }}
                          className="flex items-center space-x-3"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{tip}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Quick Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 }}
                    className="grid grid-cols-3 gap-4 text-center"
                  >
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <div className="text-2xl font-bold text-purple-600">256</div>
                      <div className="text-xs text-gray-500">Bit Encryption</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <div className="text-2xl font-bold text-blue-600">24/7</div>
                      <div className="text-xs text-gray-500">Monitoring</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <div className="text-2xl font-bold text-green-600">100%</div>
                      <div className="text-xs text-gray-500">Private</div>
                    </div>
                  </motion.div>
                </div>
              </ScrollArea>

              {/* Footer with Got It Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="px-8 py-6 bg-gradient-to-r from-gray-50 to-purple-50 border-t border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Account Active
                    </Badge>
                    <span className="text-sm text-gray-600">Your WillTank account is ready to use</span>
                  </div>
                  <Button
                    onClick={handleGotIt}
                    disabled={isCompleting}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-2 font-semibold"
                  >
                    {isCompleting ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Got It, Let's Start!
                        <Sparkles className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
