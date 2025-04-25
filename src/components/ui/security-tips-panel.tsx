
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

// Security tips and legal terms to display
const securityTips = [
  "Use a strong, unique password for your account.",
  "Enable two-factor authentication for additional security.",
  "Regularly update your contact information to ensure you receive important notifications.",
  "Keep your recovery methods up to date for account retrieval.",
  "Don't share your login credentials with others.",
  "Be cautious of phishing attempts - we'll never ask for your password via email.",
  "Choose executors you trust completely with your digital legacy.",
  "Your will information is encrypted and stored securely."
];

const legalTerms = [
  "Estate Planning: The process of arranging the management and disposal of a person's estate during their life and after death.",
  "Executor: The person appointed to execute the provisions of a will.",
  "Probate: The official proving of a will, involving the legal process where a will is reviewed to determine its authenticity.",
  "Testator: Person who has made a will or given a legacy.",
  "Beneficiary: A person who is eligible to receive distributions from a trust, will, or life insurance policy.",
  "Digital Legacy: The digital information available about someone following their death.",
  "Living Will: A document stating a person's wishes regarding their medical treatment if they become unable to make decisions.",
  "Power of Attorney: Legal authorization for someone to act on your behalf in financial or legal matters."
];

export function SecurityTipsPanel() {
  const [currentTip, setCurrentTip] = useState(0);
  const [currentTerm, setCurrentTerm] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Auto-scroll through tips and terms every 5 seconds
    intervalRef.current = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % securityTips.length);
      
      // Stagger the terms to not change at the same time as tips
      setTimeout(() => {
        setCurrentTerm((prev) => (prev + 1) % legalTerms.length);
      }, 2500);
    }, 5000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  return (
    <div className="w-full h-full flex flex-col justify-center items-center text-white p-8 relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-dot-pattern-text opacity-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.15),rgba(0,0,0,0.5))]"></div>
      </div>
      
      <div className="z-10 max-w-lg">
        <h2 className="text-2xl font-bold mb-8 text-willtank-400 tracking-tight">
          Security & Legal Information
        </h2>
        
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-4 border-l-4 border-willtank-600 pl-3">
            Security Tips
          </h3>
          <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg h-[120px] flex items-center justify-center">
            <motion.div
              key={`tip-${currentTip}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {securityTips[currentTip]}
            </motion.div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4 border-l-4 border-willtank-600 pl-3">
            Legal Terminology
          </h3>
          <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg h-[180px] flex items-center justify-center">
            <motion.div
              key={`term-${currentTerm}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <strong className="block mb-2 text-willtank-400">
                {legalTerms[currentTerm].split(':')[0]}:
              </strong>
              <span className="text-sm text-gray-300">
                {legalTerms[currentTerm].split(':')[1]}
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
