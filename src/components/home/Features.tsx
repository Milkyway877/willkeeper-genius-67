
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Users, Zap, Lock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: <FileText className="h-6 w-6 text-willtank-500" />,
    title: 'AI-Powered Will Creation',
    description: 'Generate legally-binding will documents with the assistance of our advanced AI, customized to your specific needs and location.',
    link: '/services'
  },
  {
    icon: <Shield className="h-6 w-6 text-willtank-500" />,
    title: 'Bank-Grade Security',
    description: 'Rest easy knowing your sensitive information is protected with end-to-end encryption and multiple authentication factors.',
    link: '/security'
  },
  {
    icon: <Users className="h-6 w-6 text-willtank-500" />,
    title: 'Executor Management',
    description: 'Assign trusted executors for your will and provide them with the appropriate level of access and information.',
    link: '/services'
  },
  {
    icon: <Globe className="h-6 w-6 text-willtank-500" />,
    title: 'Location-Based Services',
    description: 'Google Maps integration for asset location tracking and executor assignment based on proximity and availability.',
    link: '/services'
  },
  {
    icon: <Zap className="h-6 w-6 text-willtank-500" />,
    title: 'Multi-Device Access',
    description: 'Access your will from any device with our responsive platform that works flawlessly on mobile, tablet, or desktop.',
    link: '/how-it-works'
  },
  {
    icon: <Lock className="h-6 w-6 text-willtank-500" />,
    title: 'Secure Document Vault',
    description: 'Store additional important documents alongside your will in our highly secure document vault system.',
    link: '/security'
  }
];

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section id="features" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container px-4 md:px-6">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-gray-900">
            Comprehensive Will Management
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Our platform offers a complete suite of tools to create, manage, and secure your will with confidence.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 relative overflow-hidden group"
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-willtank-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="h-12 w-12 rounded-lg bg-willtank-50 flex items-center justify-center mb-4 group-hover:bg-willtank-100 transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <Link to={feature.link}>
                <Button variant="ghost" size="sm" className="text-willtank-600 hover:text-willtank-700 hover:bg-willtank-50 p-0 h-auto">
                  Learn more →
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
