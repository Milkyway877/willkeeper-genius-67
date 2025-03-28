
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/home/Hero';
import { ServicesSection } from '@/components/home/ServicesSection';
import { SecuritySection } from '@/components/home/SecuritySection';
import { Pricing } from '@/components/home/Pricing';
import { FeatureCarousel } from '@/components/home/FeatureCarousel';
import { FloatingAssistant } from '@/components/ui/FloatingAssistant';
import { motion } from 'framer-motion';
import { ArrowRight, Users, BarChart, Briefcase, Map, FileCheck, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
        
        <motion.section 
          id="contact" 
          className="py-24 bg-white overflow-hidden relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Background elements */}
          <div className="absolute top-1/3 left-0 w-1/3 h-1/2 bg-gradient-to-br from-orange-50 to-orange-100/0 opacity-70 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-blue-50 to-blue-100/0 opacity-70 rounded-full blur-3xl"></div>
          
          <div className="container max-w-6xl px-4 md:px-6">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-1 text-sm font-medium text-white mb-4">
                <Phone size={14} />
                <span>24/7 Support</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-black">
                Get in Touch
              </h2>
              <p className="text-xl text-gray-700">
                Have questions about our services? Our team is ready to help you.
              </p>
            </motion.div>
            
            <div className="max-w-md mx-auto">
              <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-black focus:border-black" 
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-black focus:border-black" 
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea 
                      id="message" 
                      rows={4} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                    ></textarea>
                  </div>
                  <Link to="/contact">
                    <Button type="button" className="w-full bg-black hover:bg-gray-800 text-white rounded-full py-6">
                      Send Message
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </form>
              </motion.div>
            </div>
          </div>
        </motion.section>
        
        <section id="pricing">
          <Pricing />
        </section>
      </main>
      
      <footer className="bg-black text-gray-300 py-12">
        <div className="container max-w-6xl px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-medium mb-4 text-white">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/services" className="text-gray-400 hover:text-white transition">Features</Link></li>
                <li><Link to="/security" className="text-gray-400 hover:text-white transition">Security</Link></li>
                <li><Link to="/#pricing" className="text-gray-400 hover:text-white transition">Pricing</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4 text-white">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition">About</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white transition">Blog</Link></li>
                <li><Link to="/careers" className="text-gray-400 hover:text-white transition">Careers</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4 text-white">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="/documentation" className="text-gray-400 hover:text-white transition">Documentation</Link></li>
                <li><Link to="/help" className="text-gray-400 hover:text-white transition">Help Center</Link></li>
                <li><Link to="/api" className="text-gray-400 hover:text-white transition">API</Link></li>
                <li><Link to="/community" className="text-gray-400 hover:text-white transition">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4 text-white">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition">Terms of Service</Link></li>
                <li><Link to="/cookies" className="text-gray-400 hover:text-white transition">Cookie Policy</Link></li>
                <li><Link to="/gdpr" className="text-gray-400 hover:text-white transition">GDPR</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-xl md:text-2xl font-bold tracking-tight text-white">
              WillTank
            </p>
            
            <div className="mt-6 md:mt-0">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} WillTank. All rights reserved.
              </p>
            </div>
            
            <div className="mt-6 md:mt-0 flex items-center space-x-4">
              <Link to="/social/github" className="text-gray-400 hover:text-white transition h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link to="/social/twitter" className="text-gray-400 hover:text-white transition h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link to="/social/instagram" className="text-gray-400 hover:text-white transition h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.045-1.064.218-1.504.344-1.857.182-.467.399-.8.748-1.15.35-.35.683-.566 1.15-.748.353-.137.882-.3 1.857-.344 1.054-.048 1.37-.058 4.041-.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
      
      <FloatingAssistant />
    </div>
  );
}
