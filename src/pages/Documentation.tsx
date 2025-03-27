import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Search, FileText, Book, Code, GitBranch, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Documentation() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const categories = [
    "Getting Started",
    "API Reference",
    "Guides",
    "Tutorials",
    "Best Practices",
    "FAQs"
  ];

  const [activeCategory, setActiveCategory] = React.useState(categories[0]);

  const docs = [
    {
      title: "Setting Up Your Account",
      category: "Getting Started",
      description: "Learn how to create and configure your WillTank account for optimal security and usability.",
      timeToRead: "5 min read",
      updated: "2 weeks ago"
    },
    {
      title: "Creating Your First Will",
      category: "Getting Started",
      description: "A step-by-step guide to drafting your first legally-binding will using our platform.",
      timeToRead: "10 min read",
      updated: "1 month ago"
    },
    {
      title: "Adding Executors to Your Will",
      category: "Getting Started",
      description: "How to add and manage executors, including setting their access levels and responsibilities.",
      timeToRead: "7 min read",
      updated: "3 weeks ago"
    },
    {
      title: "API Authentication",
      category: "API Reference",
      description: "Detailed information on API authentication methods, token management, and security best practices.",
      timeToRead: "8 min read",
      updated: "1 month ago"
    },
    {
      title: "Wills API Endpoints",
      category: "API Reference",
      description: "Complete reference for all will-related API endpoints, including parameters and response formats.",
      timeToRead: "15 min read",
      updated: "2 months ago"
    },
    {
      title: "Digital Asset Integration",
      category: "Guides",
      description: "How to properly document and integrate digital assets like cryptocurrency in your estate plan.",
      timeToRead: "12 min read",
      updated: "1 month ago"
    }
  ];

  const filteredDocs = docs.filter(doc => doc.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-16 bg-gray-50">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Everything you need to know about using WillTank's platform and services.
            </p>
            
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search documentation..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-willtank-500 focus:border-willtank-500"
              />
            </div>
          </motion.div>
          
          <div className="flex flex-col md:flex-row gap-8">
            <motion.div
              className="md:w-64 flex-shrink-0"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
                <h3 className="font-medium text-gray-900 mb-3 px-3">Categories</h3>
                <nav className="space-y-1">
                  {categories.map((category, index) => (
                    <button
                      key={index}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg transition-colors",
                        activeCategory === category
                          ? "bg-willtank-50 text-willtank-700 font-medium"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                      onClick={() => setActiveCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>
            
            <motion.div
              className="flex-1"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">{activeCategory}</h2>
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <Book className="mr-1" size={16} />
                    View All
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {filteredDocs.map((doc, index) => (
                    <motion.div
                      key={index}
                      className="p-5 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors"
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <div className="flex items-start">
                        <div className="p-2 bg-gray-100 rounded mr-4">
                          <FileText size={20} className="text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">{doc.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">{doc.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500 space-x-4">
                              <span>{doc.timeToRead}</span>
                              <span>Updated {doc.updated}</span>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                                <Copy size={16} />
                              </Button>
                              <Button size="sm">Read</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 bg-willtank-50 border border-willtank-100 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-willtank-100 rounded-lg">
                    <Code size={24} className="text-willtank-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Developer Resources</h3>
                    <p className="text-gray-700 mb-4">
                      Looking for developer documentation, SDKs, or API references? Check out our dedicated developer portal.
                    </p>
                    <div className="flex space-x-3">
                      <Button className="flex items-center">
                        <GitBranch size={16} className="mr-1" />
                        Developer Portal
                      </Button>
                      <Button variant="outline" className="flex items-center">
                        <ExternalLink size={16} className="mr-1" />
                        API Reference
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
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
