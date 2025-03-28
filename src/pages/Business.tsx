
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Building, BarChart, Users, Briefcase, Scale, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Business() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const businessSolutions = [
    {
      title: "Law Firms",
      description: "Streamline your client's estate planning process with our white-labeled platform. Reduce paperwork, improve client satisfaction, and increase efficiency.",
      icon: <Scale className="text-black" size={24} />,
      features: ["Client management dashboard", "Document automation", "Integration with legal CRMs", "Custom branded portal"]
    },
    {
      title: "Financial Advisors",
      description: "Incorporate comprehensive estate planning into your wealth management services. Provide added value to clients and ensure holistic financial planning.",
      icon: <BarChart className="text-black" size={24} />,
      features: ["Wealth management integration", "Financial planning tools", "Inheritance tax planning", "Client collaboration features"]
    },
    {
      title: "Banks & Financial Institutions",
      description: "Offer WillTank as a premium service to your high-net-worth clients. Strengthen relationships and increase customer loyalty with comprehensive estate services.",
      icon: <Landmark className="text-black" size={24} />,
      features: ["White-label solution", "API integration", "Multi-user access control", "Compliance monitoring"]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-20">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Enterprise Solutions</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              WillTank provides powerful tools for businesses to integrate estate planning services into their existing client offerings.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8 mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            {businessSolutions.map((solution, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="p-6">
                  <div className="bg-[#FFF5E6] p-3 rounded-full w-fit mb-4">
                    {solution.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{solution.title}</h3>
                  <p className="text-gray-600 mb-4">{solution.description}</p>
                  <ul className="space-y-2">
                    {solution.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-black mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <Button variant="ghost" className="w-full">Learn More</Button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="bg-[#FFF5E6] rounded-2xl p-8 md:p-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Partner With WillTank</h2>
                <p className="text-gray-700 mb-6">
                  Join our partner program and offer your clients the most secure and comprehensive estate planning solution available. Our flexible API and white-label options make integration seamless.
                </p>
                <Button className="mb-2">Request Demo</Button>
                <p className="text-sm text-gray-500">No credit card required. 14-day free trial for business accounts.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Enterprise Features</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="text-black mr-2">✓</div>
                    <p>Advanced user permission system</p>
                  </li>
                  <li className="flex items-start">
                    <div className="text-black mr-2">✓</div>
                    <p>Custom branding and white labeling</p>
                  </li>
                  <li className="flex items-start">
                    <div className="text-black mr-2">✓</div>
                    <p>Dedicated account management</p>
                  </li>
                  <li className="flex items-start">
                    <div className="text-black mr-2">✓</div>
                    <p>GDPR and CCPA compliant</p>
                  </li>
                  <li className="flex items-start">
                    <div className="text-black mr-2">✓</div>
                    <p>API access for seamless integration</p>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
