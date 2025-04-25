
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/home/Hero';
import { ServicesSection } from '@/components/home/ServicesSection';
import { SecuritySection } from '@/components/home/SecuritySection';
import { FeatureCarousel } from '@/components/home/FeatureCarousel';
import { InfoCards } from '@/components/home/InfoCards';
import { FloatingAssistant } from '@/components/ui/FloatingAssistant';
import { motion } from 'framer-motion';
import { ArrowRight, Users, BarChart, Briefcase, Map, FileCheck, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Hero />
        
        <ServicesSection />
        
        <section id="features" className="py-20 bg-gray-50">
          <FeatureCarousel />
        </section>
        
        <section id="security">
          <SecuritySection />
        </section>
        
        <InfoCards />
        
        <motion.section
          id="business"
          className="py-24 bg-white relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Background elements */}
          <div className="absolute top-1/3 right-0 w-1/3 h-1/2 bg-gradient-to-br from-orange-50 to-orange-100/0 opacity-70 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tl from-blue-50 to-blue-100/0 opacity-70 rounded-full blur-3xl"></div>
          
          <div className="container max-w-6xl px-4 md:px-6 relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-black">
                Enterprise Solutions
              </h2>
              <p className="text-xl text-gray-700">
                WillTank provides powerful tools for businesses to integrate estate planning services into their existing client offerings.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Law Firms",
                  description: "Streamline will management for your clients with our secure platform.",
                  icon: <Users className="h-6 w-6 text-black" />,
                  delay: 0
                },
                {
                  title: "Financial Advisors",
                  description: "Integrate estate planning seamlessly into your wealth management services.",
                  icon: <BarChart className="h-6 w-6 text-black" />,
                  delay: 0.1
                },
                {
                  title: "Banks & Institutions",
                  description: "Offer WillTank as a value-added service to your premium clients.",
                  icon: <Briefcase className="h-6 w-6 text-black" />,
                  delay: 0.2
                }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="rounded-xl bg-white border border-gray-200 p-6 hover-lift"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: item.delay }}
                >
                  <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center mb-4">
                    {React.cloneElement(item.icon, { className: "h-6 w-6 text-white" })}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-black">{item.title}</h3>
                  <p className="text-gray-700 mb-4">{item.description}</p>
                  <Link to="/business">
                    <Button variant="ghost" size="sm" className="text-black hover:text-black hover:bg-black/5 p-0 h-auto">
                      Learn more <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
        
        <motion.section
          id="how-it-works"
          className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Background elements */}
          <div className="absolute inset-0 dot-pattern opacity-[0.07]"></div>
          
          <div className="container max-w-6xl px-4 md:px-6 relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-black">
                How It Works
              </h2>
              <p className="text-xl text-gray-700">
                Our simple three-step process makes creating and managing your will effortless and secure.
              </p>
            </motion.div>
            
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="absolute left-[19px] top-0 h-full w-0.5 bg-gradient-to-b from-black to-gray-300 hidden md:block" />
                
                <div className="space-y-16">
                  {[
                    {
                      number: 1,
                      title: "Create Your Account",
                      description: "Sign up in minutes with our secure, user-friendly platform.",
                      icon: <Users className="h-5 w-5" />,
                      delay: 0
                    },
                    {
                      number: 2,
                      title: "Draft Your Will",
                      description: "Follow our guided process to create a legally sound document tailored to your needs.",
                      icon: <FileCheck className="h-5 w-5" />,
                      delay: 0.1
                    },
                    {
                      number: 3,
                      title: "Securely Store & Share",
                      description: "Your will is encrypted and accessible only to designated individuals when needed.",
                      icon: <Map className="h-5 w-5" />,
                      delay: 0.2
                    }
                  ].map((step, index) => (
                    <motion.div 
                      key={index}
                      className="flex gap-8"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: step.delay }}
                    >
                      <motion.div 
                        className="flex-shrink-0 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold z-10"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        {step.number}
                      </motion.div>
                      <div>
                        <h3 className="text-2xl font-bold mb-4 text-black">{step.title}</h3>
                        <p className="text-gray-700 text-lg">{step.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <motion.div 
                className="mt-16 text-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Link to="/how-it-works">
                  <Button className="bg-black hover:bg-gray-800 text-white rounded-full px-8 py-6 text-lg">
                    See Detailed Process
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>
      
      <Footer />
      
      <FloatingAssistant />
    </div>
  );
}
