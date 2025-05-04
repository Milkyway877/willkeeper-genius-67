
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { FileText, Shield, Users, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const steps = [
    {
      icon: <FileText className="h-8 w-8 text-willtank-600" />,
      title: "Create Your Will",
      description: "Our intuitive interface guides you through the process of creating a legally-sound will tailored to your specific needs. You can customize every aspect of your estate planning with ease.",
      details: [
        "Answer simple questions about your assets and wishes",
        "Select beneficiaries and specify distributions",
        "Determine guardianship for minor children",
        "Add specific bequests for cherished possessions"
      ]
    },
    {
      icon: <Shield className="h-8 w-8 text-willtank-600" />,
      title: "Secure Your Documents",
      description: "Your will and related documents are protected with bank-grade encryption. Only you and your designated trustees can access this information when needed.",
      details: [
        "Military-grade encryption protects your data",
        "Two-factor authentication for account access",
        "Regular security audits and updates",
        "Compliant with global data protection regulations"
      ]
    },
    {
      icon: <Users className="h-8 w-8 text-willtank-600" />,
      title: "Assign Executors",
      description: "Designate trusted individuals to execute your will. Our platform provides them with exactly the information they need, when they need it.",
      details: [
        "Invite executors securely via email",
        "Set specific access permissions for each executor",
        "Provide guidance for your executors' responsibilities",
        "Executors receive notifications when action is required"
      ]
    },
    {
      icon: <Clock className="h-8 w-8 text-willtank-600" />,
      title: "Regular Updates",
      description: "Life changes, and so should your will. Our platform makes it easy to update your documents as your circumstances evolve.",
      details: [
        "Automatic reminders to review your will annually",
        "Simple document revisions with change tracking",
        "Legal validation of all updates",
        "Historical versions maintained for reference"
      ]
    }
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6">How WillTank Works</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our simple four-step process makes creating and managing your will effortless, secure, and comprehensive.
          </p>
        </motion.div>

        <div className="space-y-20">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className="grid md:grid-cols-2 gap-10 items-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className={index % 2 === 1 ? "md:order-2" : ""}>
                <div className="bg-willtank-50 p-6 rounded-xl border border-willtank-100">
                  <div className="h-16 w-16 bg-willtank-100 rounded-full flex items-center justify-center mb-6">
                    {step.icon}
                  </div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">{step.title}</h2>
                  <p className="text-gray-600 mb-6">{step.description}</p>
                  <div className="space-y-3">
                    {step.details.map((detail, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-willtank-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className={`bg-gray-100 h-80 rounded-xl flex items-center justify-center ${index % 2 === 1 ? "md:order-1" : ""}`}>
                <div className="text-gray-400 text-lg">Step {index + 1} Illustration</div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-20 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="text-3xl font-bold mb-6">Ready to Secure Your Legacy?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Join thousands of people who trust WillTank to protect what matters most. Creating your will takes less than 30 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/signup">
              <Button size="lg" className="bg-willtank-600 hover:bg-willtank-700">
                Get Started Now
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline">
                View Pricing
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
