import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { Shield, Lock, Key, Eye, Server, FileCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Security() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const securityFeatures = [
    {
      icon: <Lock />,
      title: "End-to-End Encryption",
      description: "All your data is encrypted in transit and at rest using AES-256 encryption, the same standard used by financial institutions worldwide."
    },
    {
      icon: <Key />,
      title: "Multi-Factor Authentication",
      description: "Add an extra layer of security with our multi-factor authentication options, including SMS, email, and authenticator apps."
    },
    {
      icon: <Eye />,
      title: "Access Controls",
      description: "Grant specific permissions to your executors and trustees, ensuring they can only access exactly what they need, when they need it."
    },
    {
      icon: <Server />,
      title: "Secure Infrastructure",
      description: "Our platform is built on enterprise-grade cloud infrastructure with regular security audits and penetration testing."
    },
    {
      icon: <FileCheck />,
      title: "Compliance",
      description: "We adhere to global data protection regulations including GDPR, CCPA, and other relevant privacy laws."
    },
    {
      icon: <AlertTriangle />,
      title: "Activity Monitoring",
      description: "All account activities are logged and monitored for suspicious behavior, with alerts for unusual access attempts."
    }
  ];

  const certifications = [
    "ISO 27001:2013",
    "SOC 2 Type II",
    "HIPAA Compliant",
    "GDPR Compliant",
    "CCPA Compliant"
  ];

  return (
    <Layout forceAuthenticated={false}>
      <div className="container max-w-6xl py-16 md:py-24">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="inline-flex items-center justify-center p-2 bg-willtank-50 rounded-full mb-6">
            <Shield className="h-6 w-6 text-willtank-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Military-Grade Security</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Your will contains your most sensitive information. That's why WillTank employs bank-grade security measures
            to ensure your data is protected at all times.
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          {securityFeatures.map((feature, index) => (
            <motion.div 
              key={index} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="h-12 w-12 bg-willtank-50 rounded-full flex items-center justify-center mb-4">
                {React.cloneElement(feature.icon, { className: "h-6 w-6 text-willtank-600" })}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 gap-12 items-center mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Security Commitment</h2>
            <p className="text-gray-600 mb-6">
              At WillTank, security isn't just a feature—it's foundational to everything we do. Our team of security experts
              constantly monitors for new threats and vulnerabilities, ensuring your data remains protected against even the
              most sophisticated attacks.
            </p>
            <p className="text-gray-600 mb-6">
              We employ a defense-in-depth approach, with multiple layers of security controls working together to provide
              comprehensive protection for your sensitive information.
            </p>
            <div className="flex flex-wrap gap-3">
              {certifications.map((cert, index) => (
                <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                  {cert}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-gray-100 rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-4">Security by the Numbers</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Data Encryption</span>
                  <span className="text-sm font-medium">256-bit AES</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-willtank-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Server Uptime</span>
                  <span className="text-sm font-medium">99.99%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-willtank-600 h-2 rounded-full" style={{ width: '99.99%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Threat Monitoring</span>
                  <span className="text-sm font-medium">24/7/365</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-willtank-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Security Audits</span>
                  <span className="text-sm font-medium">Quarterly</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-willtank-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-willtank-50 rounded-xl p-8 border border-willtank-100"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Ready to secure your legacy?</h2>
            <p className="text-gray-600 mb-6">
              Join thousands of individuals and families who trust WillTank with their most important documents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/signup">
                <Button className="bg-willtank-600 hover:bg-willtank-700">
                  Get Started
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline">
                  Contact Security Team
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
