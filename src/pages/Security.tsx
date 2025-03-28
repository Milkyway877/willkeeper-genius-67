
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { Lock, Shield, Database, Key, Eye, FileCheck } from 'lucide-react';

export default function Security() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const securityFeatures = [
    {
      title: "End-to-End Encryption",
      description: "All documents and data are encrypted using industry-standard AES-256 encryption, ensuring only you and your designated contacts can access your information.",
      icon: <Lock className="text-willtank-500" size={24} />
    },
    {
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account with SMS, email, or authenticator app verification methods.",
      icon: <Shield className="text-willtank-500" size={24} />
    },
    {
      title: "Secure Data Storage",
      description: "Your data is stored in multiple redundant locations with military-grade security protocols and regular security audits.",
      icon: <Database className="text-willtank-500" size={24} />
    },
    {
      title: "Private Key Management",
      description: "Control access to your documents with cryptographic keys that only you and your designated recipients can use.",
      icon: <Key className="text-willtank-500" size={24} />
    },
    {
      title: "Privacy Controls",
      description: "Granular privacy settings allow you to control exactly who can see which documents and when they can access them.",
      icon: <Eye className="text-willtank-500" size={24} />
    },
    {
      title: "Document Verification",
      description: "Each document includes tamper-evident seals and verification methods to ensure authenticity and integrity.",
      icon: <FileCheck className="text-willtank-500" size={24} />
    }
  ];

  return (
    <Layout>
      <div className="container px-4 md:px-6 max-w-5xl mx-auto">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Enterprise-Grade Security</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            At WillTank, your security and privacy are our top priorities. We implement the highest standards of data protection to safeguard your sensitive information.
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 gap-8"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          {securityFeatures.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-start mb-4">
                <div className="bg-willtank-50 p-3 rounded-full mr-4">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-16 bg-willtank-50 rounded-2xl p-8 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Security Commitment</h2>
          <p className="text-gray-700 mb-6">
            WillTank undergoes regular security audits and compliance checks to ensure your data remains protected at all times. Our team of security experts constantly monitors and updates our systems to address emerging threats.
          </p>
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-willtank-600 mb-2">256-bit</div>
              <div className="text-sm text-gray-600">Encryption</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-willtank-600 mb-2">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-willtank-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Monitoring</div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
