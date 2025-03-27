import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Code, Lock, GitBranch, Terminal, Server, Database, BookOpen, CopyCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function API() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-16 bg-gray-50">
        <div className="container px-4 md:px-6 max-w-5xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-willtank-50 px-3 py-1 text-sm font-medium text-willtank-700 mb-4">
              <Code size={14} />
              <span>Developer Resources</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">WillTank API</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Integrate WillTank's powerful estate planning services into your own applications with our comprehensive API.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-8 mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg bg-willtank-50">
                  <Terminal size={24} className="text-willtank-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">RESTful API</h2>
                  <p className="text-gray-600">
                    Access WillTank's estate planning features with our easy-to-use REST API. Integrate will creation, management, and storage into your applications.
                  </p>
                </div>
              </div>
              <Button className="w-full">API Reference</Button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg bg-willtank-50">
                  <GitBranch size={24} className="text-willtank-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">SDKs</h2>
                  <p className="text-gray-600">
                    Use our client libraries in JavaScript, Python, Ruby, and Java to integrate WillTank's functionality with minimal code.
                  </p>
                </div>
              </div>
              <Button className="w-full">SDK Documentation</Button>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl shadow-sm overflow-hidden mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="p-6 md:p-8 border-b border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Authentication</h2>
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-willtank-50 mt-1">
                  <Lock size={20} className="text-willtank-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-600 mb-4">
                    Our API uses OAuth 2.0 for authentication. Secure your API requests with access tokens that can be easily revoked or rotated.
                  </p>
                  <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm">
                      <code>
                        # Example authentication request{"\n"}
                        curl -X POST https://api.willtank.com/oauth/token \{"\n"}
                        {"  "}-d 'grant_type=client_credentials' \{"\n"}
                        {"  "}-d 'client_id=YOUR_CLIENT_ID' \{"\n"}
                        {"  "}-d 'client_secret=YOUR_CLIENT_SECRET'
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key API Features</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    icon: <Server size={20} className="text-willtank-600" />,
                    title: "Document Generation",
                    description: "Create legally valid wills and estate planning documents via API calls."
                  },
                  {
                    icon: <Database size={20} className="text-willtank-600" />,
                    title: "Secure Storage",
                    description: "Store and retrieve documents with end-to-end encryption and access controls."
                  },
                  {
                    icon: <BookOpen size={20} className="text-willtank-600" />,
                    title: "Template Management",
                    description: "Access and customize legal templates for different jurisdictions."
                  },
                  {
                    icon: <CopyCheck size={20} className="text-willtank-600" />,
                    title: "Document Validation",
                    description: "Automatically validate documents for legal compliance in various regions."
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border border-gray-100 rounded-lg">
                    <div className="p-2 rounded-lg bg-willtank-50 mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-gradient-to-br from-willtank-600 to-willtank-800 rounded-xl shadow-lg overflow-hidden text-white mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="p-6 md:p-8">
              <div className="md:flex items-center justify-between">
                <div className="mb-6 md:mb-0 md:mr-8">
                  <h2 className="text-2xl font-semibold mb-2">Ready to start building?</h2>
                  <p className="text-willtank-100 mb-4 md:mb-0">
                    Sign up for a developer account to get your API keys and start integrating WillTank into your applications.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="secondary" className="backdrop-blur-sm bg-white/20 hover:bg-white/30 border-none text-white">
                    View Documentation
                  </Button>
                  <Button variant="default" className="bg-white text-willtank-700 hover:bg-gray-100">
                    Create Developer Account
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">API Pricing</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Free Tier",
                  price: "$0",
                  description: "For testing and small projects",
                  features: [
                    "100 API calls per month",
                    "Standard document templates",
                    "Basic document validation",
                    "Community support",
                    "Rate limit: 10 requests/minute"
                  ],
                  button: "Get Started Free"
                },
                {
                  name: "Business",
                  price: "$199",
                  period: "per month",
                  description: "For businesses and production applications",
                  features: [
                    "10,000 API calls per month",
                    "All document templates",
                    "Advanced document validation",
                    "Priority email support",
                    "Rate limit: 100 requests/minute",
                    "Custom subdomain"
                  ],
                  button: "Start Business Plan",
                  highlighted: true
                },
                {
                  name: "Enterprise",
                  price: "Custom",
                  description: "For large organizations with specific needs",
                  features: [
                    "Unlimited API calls",
                    "Custom document templates",
                    "Premium validation and compliance",
                    "Dedicated support manager",
                    "No rate limits",
                    "Custom integration assistance",
                    "SLA guarantees"
                  ],
                  button: "Contact Sales"
                }
              ].map((plan, index) => (
                <motion.div
                  key={index}
                  className={`rounded-xl overflow-hidden ${
                    plan.highlighted 
                      ? "shadow-lg border-2 border-willtank-500 relative" 
                      : "shadow-sm border border-gray-100"
                  }`}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {plan.highlighted && (
                    <div className="absolute top-0 right-0 bg-willtank-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                      Most Popular
                    </div>
                  )}
                  
                  <div className={`p-6 ${plan.highlighted ? "bg-willtank-50" : "bg-white"}`}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{plan.name}</h3>
                    <div className="flex items-baseline mb-1">
                      <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                      {plan.period && <span className="text-gray-600 ml-1">{plan.period}</span>}
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                    
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <svg className="h-5 w-5 text-willtank-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-600 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full ${
                        plan.highlighted 
                          ? "bg-willtank-500 hover:bg-willtank-600" 
                          : "bg-gray-800 hover:bg-gray-900"
                      }`}
                    >
                      {plan.button}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      
      <footer className="bg-gray-900 text-gray-200 py-12">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/services" className="text-gray-400 hover:text-white transition">Features</Link></li>
                <li><Link to="/security" className="text-gray-400 hover:text-white transition">Security</Link></li>
                <li><Link to="/#pricing" className="text-gray-400 hover:text-white transition">Pricing</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition">About</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white transition">Blog</Link></li>
                <li><Link to="/careers" className="text-gray-400 hover:text-white transition">Careers</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="/documentation" className="text-gray-400 hover:text-white transition">Documentation</Link></li>
                <li><Link to="/help" className="text-gray-400 hover:text-white transition">Help Center</Link></li>
                <li><Link to="/api" className="text-gray-400 hover:text-white transition">API</Link></li>
                <li><Link to="/community" className="text-gray-400 hover:text-white transition">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition">Terms of Service</Link></li>
                <li><Link to="/cookies" className="text-gray-400 hover:text-white transition">Cookie Policy</Link></li>
                <li><Link to="/gdpr" className="text-gray-400 hover:text-white transition">GDPR</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <Logo color="white" />
            
            <div className="mt-6 md:mt-0">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} WillTank. All rights reserved.
              </p>
            </div>
            
            <div className="mt-6 md:mt-0 flex items-center space-x-4">
              <Link to="/social/facebook" className="text-gray-400 hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link to="/social/twitter" className="text-gray-400 hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link to="/social/instagram" className="text-gray-400 hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link to="/social/github" className="text-gray-400 hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
