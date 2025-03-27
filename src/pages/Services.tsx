
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function Services() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const services = [
    {
      title: "Will Creation",
      description: "Create legally-binding wills with our easy-to-use template system. Our step-by-step guidance ensures your will meets all legal requirements.",
      icon: <CheckCircle2 className="text-willtank-500" size={20} />
    },
    {
      title: "Digital Asset Management",
      description: "Securely manage and designate heirs for your digital assets, including cryptocurrency, online accounts, and digital collections.",
      icon: <CheckCircle2 className="text-willtank-500" size={20} />
    },
    {
      title: "Estate Planning",
      description: "Comprehensive estate planning tools to help you organize your assets, debts, and inheritance wishes in one secure location.",
      icon: <CheckCircle2 className="text-willtank-500" size={20} />
    },
    {
      title: "Executor Assistance",
      description: "Provide your executors with the tools and resources they need to efficiently manage your estate according to your wishes.",
      icon: <CheckCircle2 className="text-willtank-500" size={20} />
    },
    {
      title: "Document Validation",
      description: "Get your documents reviewed by legal professionals to ensure they comply with legal requirements in your jurisdiction.",
      icon: <CheckCircle2 className="text-willtank-500" size={20} />
    },
    {
      title: "Secure Document Storage",
      description: "Store all your important documents in our encrypted vault with role-based access control for maximum security.",
      icon: <CheckCircle2 className="text-willtank-500" size={20} />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-20">
        <div className="container px-4 md:px-6 max-w-5xl mx-auto">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              WillTank offers comprehensive tools for estate planning, will creation, and digital asset management to ensure your legacy is protected.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            {services.map((service, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-start space-x-3 mb-4">
                  {service.icon}
                  <h3 className="text-xl font-semibold text-gray-800">{service.title}</h3>
                </div>
                <p className="text-gray-600">{service.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
