
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, FileText, Code, Database, Lock, Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/Footer';

export default function Documentation() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const documentationCategories = [
    {
      title: "Getting Started",
      description: "Learn the basics of using WillTank's platform and services.",
      icon: <Book className="h-6 w-6 text-willtank-600" />,
      subcategories: ["Account Setup", "Dashboard Overview", "Creating Your First Will", "Document Management"],
      link: "/documentation/getting-started"
    },
    {
      title: "User Guides",
      description: "Detailed guides for using all features of the WillTank platform.",
      icon: <FileText className="h-6 w-6 text-willtank-600" />,
      subcategories: ["Estate Planning Basics", "Will Creation", "Trust Documents", "Power of Attorney", "Healthcare Directives"],
      link: "/documentation/user-guides"
    },
    {
      title: "API Reference",
      description: "Complete documentation for the WillTank API for developers.",
      icon: <Code className="h-6 w-6 text-willtank-600" />,
      subcategories: ["Authentication", "Documents API", "Users API", "Webhooks", "Rate Limits"],
      link: "/documentation/api"
    },
    {
      title: "Data Security",
      description: "Information about our security measures and data protection.",
      icon: <Lock className="h-6 w-6 text-willtank-600" />,
      subcategories: ["Encryption", "Access Controls", "Compliance", "Auditing", "Disaster Recovery"],
      link: "/documentation/security"
    },
    {
      title: "Integrations",
      description: "Connect WillTank with other services and platforms.",
      icon: <Database className="h-6 w-6 text-willtank-600" />,
      subcategories: ["CRM Integrations", "Document Management Systems", "Financial Platforms", "Legal Software", "Custom Integrations"],
      link: "/documentation/integrations"
    }
  ];

  const recentUpdates = [
    {
      title: "API v2.0 Release",
      date: "June 10, 2023",
      description: "New endpoints for beneficiary management and improved document versioning.",
      link: "/documentation/updates/api-v2"
    },
    {
      title: "Advanced Document Sharing",
      date: "May 22, 2023",
      description: "Enhanced permissions and controls for document sharing with executors and trusted contacts.",
      link: "/documentation/updates/document-sharing"
    },
    {
      title: "Multi-Factor Authentication",
      date: "May 5, 2023",
      description: "Added support for hardware security keys and additional MFA options.",
      link: "/documentation/updates/mfa-enhancements"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 md:py-16 bg-gray-50">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="text-center mb-10"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Comprehensive guides and resources to help you use WillTank effectively.
            </p>
            
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search documentation..." 
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-willtank-500 focus:border-transparent"
              />
            </div>
          </motion.div>
          
          <motion.div 
            className="mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documentationCategories.map((category, index) => (
                <motion.div 
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-12 h-12 rounded-full bg-willtank-50 flex items-center justify-center mb-4">
                    {category.icon}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{category.title}</h2>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  
                  <ul className="space-y-1 mb-4">
                    {category.subcategories.map((subcat, subIndex) => (
                      <li key={subIndex} className="text-sm text-gray-600">
                        <Link to={`${category.link}/${subcat.toLowerCase().replace(/ /g, '-')}`} className="hover:text-willtank-600">
                          • {subcat}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to={category.link} className="text-willtank-600 hover:text-willtank-700 font-medium inline-flex items-center">
                    View Documentation <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <motion.div 
              className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular Documentation</h2>
              
              <div className="space-y-4">
                {[
                  { title: "Creating Your First Will", views: "5.2k", difficulty: "Beginner", time: "10 min read", link: "/documentation/getting-started/first-will" },
                  { title: "Setting Up Executor Access", views: "3.8k", difficulty: "Intermediate", time: "15 min read", link: "/documentation/user-guides/executors" },
                  { title: "Digital Asset Management", views: "2.9k", difficulty: "Intermediate", time: "12 min read", link: "/documentation/user-guides/digital-assets" },
                  { title: "Estate Planning for Business Owners", views: "2.5k", difficulty: "Advanced", time: "20 min read", link: "/documentation/user-guides/business-owners" },
                  { title: "API Authentication", views: "1.8k", difficulty: "Technical", time: "8 min read", link: "/documentation/api/authentication" }
                ].map((doc, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <Link to={doc.link} className="hover:text-willtank-600">
                      <h3 className="font-medium text-gray-900 mb-2">{doc.title}</h3>
                    </Link>
                    <div className="flex flex-wrap gap-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {doc.views} views
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {doc.difficulty}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {doc.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Updates</h2>
              
              <div className="space-y-6">
                {recentUpdates.map((update, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                    <Link to={update.link} className="hover:text-willtank-600">
                      <h3 className="font-medium text-gray-900 mb-1">{update.title}</h3>
                    </Link>
                    <p className="text-sm text-gray-500 mb-2">{update.date}</p>
                    <p className="text-sm text-gray-600">{update.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Link to="/documentation/updates" className="text-willtank-600 hover:text-willtank-700 font-medium inline-flex items-center">
                  View All Updates <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="bg-gradient-to-br from-willtank-50 to-gray-50 rounded-2xl p-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="md:flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Need Additional Help?</h2>
                <p className="text-gray-600 mb-4 md:mb-0 max-w-xl">
                  Can't find what you're looking for in our documentation? Our support team is ready to assist you.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link to="/contact">
                  <Button variant="default">Contact Support</Button>
                </Link>
                <Link to="/help">
                  <Button variant="outline">Visit Help Center</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
