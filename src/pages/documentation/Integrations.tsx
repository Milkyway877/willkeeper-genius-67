
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Database, ArrowLeft, Blocks, Puzzle, FileCog, Network, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';

export default function Integrations() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const sections = [
    {
      id: 'crm-integrations',
      title: 'CRM Integrations',
      icon: <Blocks className="h-6 w-6 text-willtank-600" />,
      content: `
      <h3>Connecting WillTank with CRM Systems</h3>
      <p>WillTank offers seamless integration with leading CRM platforms to help legal and financial professionals manage client relationships alongside estate planning documents.</p>
      
      <h4>Supported CRM Platforms</h4>
      <ul>
        <li><strong>Salesforce</strong> - Full bidirectional sync with custom objects for estate planning</li>
        <li><strong>HubSpot</strong> - Contact synchronization and document status tracking</li>
        <li><strong>Clio</strong> - Legal-specific integration for case management</li>
        <li><strong>Zoho CRM</strong> - Contact and document management synchronization</li>
      </ul>
      
      <h4>Key Features</h4>
      <ul>
        <li>Automatic client record creation from WillTank accounts</li>
        <li>Document status tracking in your CRM</li>
        <li>Task creation for document reviews and updates</li>
        <li>Secure document sharing between systems</li>
        <li>Activity logging for client interactions</li>
      </ul>
      
      <h4>Implementation Guide</h4>
      <p>Our CRM integrations can be set up in a few simple steps:</p>
      <ol>
        <li>Navigate to Settings > Integrations in your WillTank dashboard</li>
        <li>Select your CRM provider and authenticate</li>
        <li>Configure field mappings between systems</li>
        <li>Set synchronization preferences and frequency</li>
        <li>Test the connection with sample data</li>
      </ol>
      <p>For enterprise customers, we offer custom CRM integrations with additional fields and workflows tailored to your specific needs.</p>
      `
    },
    {
      id: 'document-management-systems',
      title: 'Document Management Systems',
      icon: <FileCog className="h-6 w-6 text-willtank-600" />,
      content: `
      <h3>Integrating with Document Management Systems</h3>
      <p>WillTank connects with popular document management systems to provide a unified approach to storing and organizing estate planning documents alongside other important records.</p>
      
      <h4>Supported Platforms</h4>
      <ul>
        <li><strong>SharePoint</strong> - Enterprise-grade document management with advanced permissions</li>
        <li><strong>Dropbox</strong> - Cloud storage synchronization for individuals and small firms</li>
        <li><strong>Box</strong> - Secure enterprise content management integration</li>
        <li><strong>Google Drive</strong> - Document synchronization and collaborative editing</li>
        <li><strong>DocuSign</strong> - Electronic signature workflow integration</li>
      </ul>
      
      <h4>Integration Capabilities</h4>
      <ul>
        <li><strong>Document Synchronization</strong> - Keep documents updated across platforms</li>
        <li><strong>Version Control</strong> - Track document versions across systems</li>
        <li><strong>Metadata Mapping</strong> - Preserve document classifications and properties</li>
        <li><strong>Permission Synchronization</strong> - Maintain consistent access controls</li>
        <li><strong>Search Capability</strong> - Find documents across integrated platforms</li>
      </ul>
      
      <h4>Security Considerations</h4>
      <p>Our document management integrations maintain WillTank's high security standards:</p>
      <ul>
        <li>Documents remain encrypted during transfer between systems</li>
        <li>Integration permissions are granular and can be limited to specific document types</li>
        <li>Access audit trails track document movement across platforms</li>
        <li>Integration credentials are stored securely with encryption and regular rotation</li>
      </ul>
      `
    },
    {
      id: 'financial-platforms',
      title: 'Financial Platforms',
      icon: <Network className="h-6 w-6 text-willtank-600" />,
      content: `
      <h3>Connecting with Financial Services Platforms</h3>
      <p>WillTank integrates with financial services platforms to help you create comprehensive estate plans that include accurate and up-to-date financial information.</p>
      
      <h4>Financial Platform Integrations</h4>
      <ul>
        <li><strong>Plaid</strong> - Secure bank account and asset verification</li>
        <li><strong>Yodlee</strong> - Financial account aggregation for comprehensive asset tracking</li>
        <li><strong>Fidelity</strong> - Investment account integration for beneficiary designation</li>
        <li><strong>Prudential</strong> - Life insurance policy integration</li>
        <li><strong>Rocket Mortgage</strong> - Mortgage and property information</li>
      </ul>
      
      <h4>Integration Benefits</h4>
      <ul>
        <li><strong>Accurate Asset Inventory</strong> - Automatically import and track financial assets</li>
        <li><strong>Beneficiary Management</strong> - Coordinate beneficiary designations across financial accounts and estate documents</li>
        <li><strong>Value Tracking</strong> - Monitor estate value changes over time</li>
        <li><strong>Tax Planning</strong> - Improve estate tax planning with comprehensive financial data</li>
      </ul>
      
      <h4>Setup Process</h4>
      <p>Financial platform integrations require secure authentication:</p>
      <ol>
        <li>Navigate to the Asset Management section of your Will</li>
        <li>Select "Add Financial Account" and choose your institution</li>
        <li>Complete the secure authentication process</li>
        <li>Select which accounts to include in your estate inventory</li>
        <li>Configure update frequency and notification preferences</li>
      </ol>
      <p>All financial integrations use read-only access. WillTank never stores your financial credentials and cannot make transactions or changes to your accounts.</p>
      `
    },
    {
      id: 'legal-software',
      title: 'Legal Software',
      icon: <Puzzle className="h-6 w-6 text-willtank-600" />,
      content: `
      <h3>Integrating with Legal Practice Management Software</h3>
      <p>For legal professionals, WillTank offers specialized integrations with practice management software to streamline estate planning workflows.</p>
      
      <h4>Supported Legal Platforms</h4>
      <ul>
        <li><strong>Clio</strong> - Complete practice management integration</li>
        <li><strong>PracticePanther</strong> - Case management and billing integration</li>
        <li><strong>MyCase</strong> - Document and client management synchronization</li>
        <li><strong>Actionstep</strong> - Workflow automation for estate planning processes</li>
        <li><strong>Smokeball</strong> - Document automation and matter management</li>
      </ul>
      
      <h4>Integration Features</h4>
      <ul>
        <li><strong>Client Synchronization</strong> - Keep client records consistent across platforms</li>
        <li><strong>Matter/Case Linking</strong> - Connect WillTank documents to specific legal matters</li>
        <li><strong>Template Sharing</strong> - Access your firm's document templates within WillTank</li>
        <li><strong>Time Tracking</strong> - Record billable time spent in WillTank</li>
        <li><strong>Calendar Integration</strong> - Schedule document reviews and client meetings</li>
        <li><strong>Secure Client Portal</strong> - Unified client access to documents and communications</li>
      </ul>
      
      <h4>For Law Firms</h4>
      <p>Our enterprise plan includes additional features for legal practitioners:</p>
      <ul>
        <li>Firm-wide document template management</li>
        <li>Client intake form integration</li>
        <li>Custom branded client experience</li>
        <li>Advanced conflict checking</li>
        <li>Collaborative document drafting with version control</li>
      </ul>
      <p>Contact our professional services team for custom legal software integrations specific to your firm's needs.</p>
      `
    },
    {
      id: 'custom-integrations',
      title: 'Custom Integrations',
      icon: <Code className="h-6 w-6 text-willtank-600" />,
      content: `
      <h3>Building Custom Integrations with WillTank</h3>
      <p>For organizations with unique needs, WillTank provides comprehensive API access and developer tools to create custom integrations.</p>
      
      <h4>Integration Methods</h4>
      <ul>
        <li><strong>REST API</strong> - Comprehensive API access to WillTank functionality</li>
        <li><strong>Webhooks</strong> - Real-time event notifications for estate planning activities</li>
        <li><strong>OAuth 2.0</strong> - Secure authentication framework for third-party applications</li>
        <li><strong>SFTP</strong> - Secure file transfer for batch document processing</li>
        <li><strong>Custom Connectors</strong> - Purpose-built connections for specific systems</li>
      </ul>
      
      <h4>Developer Resources</h4>
      <ul>
        <li><strong>API Documentation</strong> - Complete reference for all API endpoints</li>
        <li><strong>SDKs</strong> - Client libraries for common programming languages</li>
        <li><strong>Sample Applications</strong> - Example code for common integration scenarios</li>
        <li><strong>Sandbox Environment</strong> - Test your integrations without affecting production data</li>
        <li><strong>Developer Support</strong> - Dedicated technical assistance for integration projects</li>
      </ul>
      
      <h4>Enterprise Integration Services</h4>
      <p>For complex integration needs, our professional services team offers:</p>
      <ul>
        <li>Integration strategy consulting</li>
        <li>Custom connector development</li>
        <li>System architecture design</li>
        <li>Implementation support and training</li>
        <li>Ongoing maintenance and optimization</li>
      </ul>
      <p>Contact our enterprise sales team to discuss your specific integration requirements and how WillTank can fit into your organization's technology ecosystem.</p>
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Integrations</h1>
          </motion.div>
          
          <motion.div 
            className="mb-10"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Card className="bg-gradient-to-br from-white to-gray-50 p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-willtank-50 flex items-center justify-center">
                  <Database className="h-6 w-6 text-willtank-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Connect Your Systems</h2>
                  <p className="text-gray-600">Extend WillTank's capabilities through integrations with your existing tools</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                WillTank is designed to work seamlessly with the tools and platforms you already use. Our integration capabilities 
                allow you to connect WillTank with CRM systems, document management platforms, financial services, legal software, 
                and more, creating a unified ecosystem for managing estate planning and digital legacy.
              </p>
              <p className="text-gray-700">
                Whether you're an individual user looking to connect your financial accounts, a legal professional integrating with 
                practice management software, or an enterprise needing custom integration solutions, WillTank provides secure and 
                flexible options to meet your needs.
              </p>
            </Card>
          </motion.div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <motion.div 
              className="lg:w-1/4"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="sticky top-20 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-6">Integration Categories</h2>
                <ul className="space-y-3">
                  {sections.map((section, index) => (
                    <li key={index}>
                      <a 
                        href={`#${section.id}`} 
                        className="flex items-center gap-2 text-willtank-600 hover:text-willtank-800 font-medium"
                      >
                        {section.icon}
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8 p-4 bg-willtank-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Need a Custom Integration?</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Our team can help build custom connections to your specific systems.
                  </p>
                  <Link to="/contact">
                    <Button size="sm" variant="default" className="w-full">Contact Us</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="lg:w-3/4"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="space-y-10">
                {sections.map((section, index) => (
                  <div 
                    key={index}
                    id={section.id} 
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-willtank-50 flex items-center justify-center">
                        {section.icon}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                    </div>
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
