
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, FileText, Key, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function ServicesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/3 left-0 w-1/3 h-1/2 bg-gradient-to-br from-orange-50 to-orange-100/0 opacity-70 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-blue-50 to-blue-100/0 opacity-70 rounded-full blur-3xl"></div>
      
      <div className="container max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight text-black">
            Our Work <span className="dot-pattern animate-dot-pattern opacity-80 text-black">Slaps</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            WillTank offers estate planning as a service. This means we can solve your legacy 
            needs from design <span className="highlight-text">👉</span> execution. Bring the idea <span className="highlight-text">💡</span> and watch as it comes to life.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            {
              title: "Will Creation",
              description: "Generate legally-binding will documents with our advanced system, customized to your specific needs.",
              icon: <FileText className="h-6 w-6 text-black" />,
              color: "bg-peach-gradient"
            },
            {
              title: "Bank-Grade Security",
              description: "Rest easy knowing your sensitive information is protected with end-to-end encryption.",
              icon: <Shield className="h-6 w-6 text-black" />,
              color: "bg-peach-gradient"
            },
            {
              title: "Executor Management",
              description: "Assign trusted executors for your will and provide them with the appropriate level of access.",
              icon: <Users className="h-6 w-6 text-black" />,
              color: "bg-peach-gradient"
            },
            {
              title: "Asset Protection",
              description: "Secure your digital and physical assets with our comprehensive management system.",
              icon: <Key className="h-6 w-6 text-black" />,
              color: "bg-peach-gradient"
            },
            {
              title: "Multi-Device Access",
              description: "Access your will from any device with our responsive platform that works flawlessly everywhere.",
              icon: <Shield className="h-6 w-6 text-black" />,
              color: "bg-peach-gradient"
            },
            {
              title: "Document Vault",
              description: "Store additional important documents alongside your will in our highly secure vault system.",
              icon: <FileText className="h-6 w-6 text-black" />,
              color: "bg-peach-gradient"
            }
          ].map((service, index) => (
            <motion.div 
              key={index}
              className="rounded-xl p-6 h-full flex flex-col justify-between hover-lift"
              variants={itemVariants}
              style={{ 
                background: index % 2 === 0 ? "white" : service.color,
                border: "1px solid rgba(0,0,0,0.1)"
              }}
            >
              <div>
                <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center mb-4">
                  {React.cloneElement(service.icon, { className: "h-6 w-6 text-white" })}
                </div>
                <h3 className="text-xl font-bold mb-2 text-black">{service.title}</h3>
                <p className="text-gray-700 mb-4">{service.description}</p>
              </div>
              <Link to="/services">
                <Button variant="ghost" size="sm" className="text-black hover:text-black hover:bg-black/5 p-0 h-auto">
                  Learn more <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
