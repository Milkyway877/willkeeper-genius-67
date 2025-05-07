
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Book, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function GettingStarted() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const sections = [
    {
      id: 'account-setup',
      title: 'Account Setup',
      content: `
      <h3>Setting Up Your WillTank Account</h3>
      <p>Creating a WillTank account is the first step toward securing your digital legacy. Follow these simple steps to get started:</p>
      <ol>
        <li>Navigate to the WillTank homepage and click "Sign Up"</li>
        <li>Enter your email address and create a strong password</li>
        <li>Verify your email address through the confirmation message</li>
        <li>Complete your profile information including legal name and contact details</li>
        <li>Set up your security preferences including two-factor authentication</li>
      </ol>
      <p>Once your account is created, you'll have access to all WillTank features and can begin creating your digital legacy plan.</p>
      `
    },
    {
      id: 'dashboard-overview',
      title: 'Dashboard Overview',
      content: `
      <h3>Understanding Your WillTank Dashboard</h3>
      <p>Your WillTank dashboard is the central hub for managing all aspects of your digital legacy. Here's what you'll find:</p>
      <ul>
        <li><strong>Quick Actions:</strong> Create new wills, add trusted contacts, schedule future messages, and more</li>
        <li><strong>Status Overview:</strong> See your will completion status, document verification, and security status at a glance</li>
        <li><strong>Recent Activity:</strong> Track recent changes to your account and documents</li>
        <li><strong>Notifications:</strong> Important alerts about document status, contact verifications, and system updates</li>
        <li><strong>Security Status:</strong> Monitor the security of your account and receive recommendations for improvements</li>
      </ul>
      <p>Your dashboard is fully customizable. Use the settings menu to arrange widgets according to your preferences.</p>
      `
    },
    {
      id: 'first-will',
      title: 'Creating Your First Will',
      content: `
      <h3>Getting Started with Your First Will</h3>
      <p>Creating your will through WillTank is straightforward and comprehensive. Follow these steps:</p>
      <ol>
        <li>From your dashboard, select "Create New Will" or navigate to the Wills section</li>
        <li>Choose between our guided wizard, AI assistant, or template-based approach</li>
        <li>Enter your personal information including legal name and contact details</li>
        <li>Add information about your assets, both physical and digital</li>
        <li>Designate your beneficiaries and specify what each should receive</li>
        <li>Name your executor(s) who will handle your estate</li>
        <li>Add any special instructions or final wishes</li>
        <li>Review all information for accuracy and completeness</li>
        <li>Finalize your will according to your local laws (which may require witnesses or notarization)</li>
      </ol>
      <p>Remember that laws regarding wills vary by location. WillTank provides jurisdiction-specific guidance, but consulting with a legal professional in your area is recommended.</p>
      `
    },
    {
      id: 'document-management',
      title: 'Document Management',
      content: `
      <h3>Managing Your Important Documents</h3>
      <p>WillTank's document management system helps you securely organize all your important papers and digital assets. Here's how to use it effectively:</p>
      <h4>Document Categories</h4>
      <ul>
        <li><strong>Legal Documents:</strong> Wills, trusts, power of attorney, healthcare directives</li>
        <li><strong>Financial Records:</strong> Bank accounts, investments, insurance policies, property deeds</li>
        <li><strong>Digital Assets:</strong> Account credentials, cryptocurrency wallets, digital property</li>
        <li><strong>Personal Items:</strong> Inventories of valuable possessions with photos and descriptions</li>
        <li><strong>Final Wishes:</strong> Funeral arrangements, memorial preferences, personal messages</li>
      </ul>
      <h4>Key Features</h4>
      <ul>
        <li>Bank-level encryption for all documents</li>
        <li>Selective sharing with trusted contacts and executors</li>
        <li>Document verification system</li>
        <li>Automatic organization and categorization</li>
        <li>Search functionality for quick access</li>
      </ul>
      <p>To upload documents, simply click the "Add Document" button in any category and follow the prompts. You can upload PDFs, images, text files, and more.</p>
      `
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 md:py-16 bg-gray-50">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="mb-8 flex items-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Link to="/documentation" className="mr-4">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Documentation
              </Button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Getting Started</h1>
          </motion.div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <motion.div 
              className="lg:w-1/4"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="sticky top-20 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-willtank-50 flex items-center justify-center">
                    <Book className="h-5 w-5 text-willtank-600" />
                  </div>
                  <h2 className="text-xl font-semibold">In This Section</h2>
                </div>
                <ul className="space-y-2">
                  {sections.map((section, index) => (
                    <li key={index}>
                      <a 
                        href={`#${section.id}`} 
                        className="text-willtank-600 hover:text-willtank-800 font-medium"
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
            
            <motion.div 
              className="lg:w-3/4"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                {sections.map((section, index) => (
                  <div 
                    key={index} 
                    id={section.id} 
                    className={`${index > 0 ? 'mt-12 pt-12 border-t border-gray-200' : ''}`}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.title}</h2>
                    <div 
                      className="prose max-w-none" 
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
