
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export default function UpdatesArchive() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const updates = [
    {
      title: "API v2.0 Release",
      date: "June 10, 2023",
      category: "API",
      description: "We're excited to announce the release of WillTank API v2.0, featuring enhanced endpoints for beneficiary management and improved document versioning.",
      details: `
        <h4>New Features</h4>
        <ul>
          <li>Comprehensive beneficiary management API with relationship handling</li>
          <li>Document version control with detailed change tracking</li>
          <li>Enhanced webhook delivery with retry mechanisms</li>
          <li>New endpoints for digital asset inventory management</li>
        </ul>
        
        <h4>Improvements</h4>
        <ul>
          <li>50% increased rate limits for all API tiers</li>
          <li>Improved error messaging with actionable guidance</li>
          <li>Expanded documentation with more code examples</li>
          <li>New SDKs for Python, Ruby, and Java</li>
        </ul>
        
        <h4>Migration Guide</h4>
        <p>API v1.0 will be maintained until December 31, 2023. We recommend migrating to v2.0 as soon as possible to take advantage of the new features and improvements. Our <a href="/documentation/api">migration guide</a> provides step-by-step instructions for updating your integrations.</p>
      `
    },
    {
      title: "Advanced Document Sharing",
      date: "May 22, 2023",
      category: "Features",
      description: "Enhanced permissions and controls for document sharing with executors and trusted contacts.",
      details: `
        <h4>New Features</h4>
        <ul>
          <li>Granular permissions system for document sharing</li>
          <li>Time-limited access options for professional advisors</li>
          <li>Watermarking for shared document exports</li>
          <li>Activity tracking for document views and downloads</li>
          <li>Customizable notification settings for document access</li>
        </ul>
        
        <h4>How to Use Advanced Sharing</h4>
        <p>To access the new sharing features:</p>
        <ol>
          <li>Navigate to any document in your account</li>
          <li>Click the "Share" button in the document toolbar</li>
          <li>Select a recipient from your contacts or enter a new email address</li>
          <li>Configure permission levels and access duration</li>
          <li>Add an optional message and send the invitation</li>
        </ol>
        
        <p>Recipients will receive an email with secure access instructions. You can monitor and manage all shared documents from the new "Shared Documents" dashboard.</p>
      `
    },
    {
      title: "Multi-Factor Authentication Enhancements",
      date: "May 5, 2023",
      category: "Security",
      description: "Added support for hardware security keys and additional MFA options.",
      details: `
        <h4>New Security Options</h4>
        <ul>
          <li>FIDO2/WebAuthn support for hardware security keys (YubiKey, etc.)</li>
          <li>Biometric authentication on compatible devices</li>
          <li>Backup recovery codes for account access</li>
          <li>Account activity notifications for security events</li>
        </ul>
        
        <h4>Setting Up Enhanced MFA</h4>
        <p>To configure your new security options:</p>
        <ol>
          <li>Go to Account Settings > Security</li>
          <li>Under "Multi-Factor Authentication," select "Manage Methods"</li>
          <li>Choose your preferred additional authentication methods</li>
          <li>Follow the setup instructions for each method</li>
        </ol>
        
        <p>We recommend enabling multiple authentication methods for maximum account security and recovery options.</p>
        
        <h4>Security Best Practices</h4>
        <p>With these enhancements, we've also updated our <a href="/security">security best practices guide</a> with recommendations for keeping your estate planning documents and digital legacy secure.</p>
      `
    },
    {
      title: "Digital Asset Management System",
      date: "April 18, 2023",
      category: "Features",
      description: "Comprehensive digital asset tracking and management system for cryptocurrency, NFTs, and online accounts.",
      details: `
        <h4>Digital Asset Features</h4>
        <ul>
          <li>Cryptocurrency wallet tracking and beneficiary assignment</li>
          <li>NFT inventory management with ownership documentation</li>
          <li>Digital account catalog with access instructions</li>
          <li>Secure password hint storage (not full passwords)</li>
          <li>Integration with popular digital asset platforms</li>
        </ul>
        
        <h4>Getting Started with Digital Asset Management</h4>
        <p>To begin organizing your digital assets:</p>
        <ol>
          <li>Navigate to the new "Digital Assets" section in your dashboard</li>
          <li>Select "Add New Asset" and choose the asset type</li>
          <li>Enter the relevant details and ownership information</li>
          <li>Assign beneficiaries and access instructions</li>
          <li>Securely store recovery information using our encryption system</li>
        </ol>
        
        <p>For more information, check out our <a href="/documentation/user-guides/digital-assets">Digital Asset Management Guide</a>.</p>
      `
    },
    {
      title: "Will Template Expansion",
      date: "March 30, 2023",
      category: "Content",
      description: "Added 15 new will templates covering specialized scenarios and additional jurisdictions.",
      details: `
        <h4>New Templates Added</h4>
        <ul>
          <li>Business Owner Will with Succession Planning</li>
          <li>Blended Family Estate Plan</li>
          <li>International Asset Distribution Plan</li>
          <li>Artist/Creator Intellectual Property Will</li>
          <li>Pet Trust Provisions</li>
          <li>Digital Asset Specialized Will</li>
          <li>Charitable Giving Focus Plan</li>
          <li>Special Needs Trust Provisions</li>
        </ul>
        
        <h4>New Jurisdictions</h4>
        <p>Added jurisdiction-specific templates for:</p>
        <ul>
          <li>Australia</li>
          <li>New Zealand</li>
          <li>United Kingdom</li>
          <li>Germany</li>
          <li>France</li>
          <li>Singapore</li>
          <li>Japan</li>
        </ul>
        
        <p>All templates have been reviewed by legal professionals in their respective jurisdictions. However, we always recommend consulting with a local attorney for final review of your estate planning documents.</p>
      `
    },
    {
      title: "Legacy Message System",
      date: "February 14, 2023",
      category: "Features",
      description: "New system for creating and scheduling personal messages to be delivered after your passing.",
      details: `
        <h4>Legacy Message Features</h4>
        <ul>
          <li>Text, audio, and video message creation</li>
          <li>Scheduled delivery based on verification of passing</li>
          <li>Individual messages for specific recipients</li>
          <li>Group messages for family or friends</li>
          <li>Message preview and editing capabilities</li>
          <li>Secure storage with encryption</li>
        </ul>
        
        <h4>Creating Your First Legacy Message</h4>
        <p>To create a legacy message:</p>
        <ol>
          <li>Navigate to the "Legacy Messages" section in your dashboard</li>
          <li>Select "Create New Message"</li>
          <li>Choose your message format (text, audio, or video)</li>
          <li>Record or compose your message</li>
          <li>Select recipients from your contacts</li>
          <li>Configure delivery conditions and timing</li>
          <li>Preview and save your message</li>
        </ol>
        
        <p>Legacy messages are securely stored and will only be delivered after our verification system confirms your passing, providing peace of mind that your final thoughts and wishes will reach your loved ones.</p>
      `
    },
    {
      title: "Mobile App Launch",
      date: "January 10, 2023",
      category: "Platform",
      description: "Introducing the WillTank mobile app for iOS and Android devices.",
      details: `
        <h4>Mobile App Features</h4>
        <ul>
          <li>Access to all your estate planning documents on the go</li>
          <li>Biometric authentication for secure access</li>
          <li>Document scanning for easy uploads</li>
          <li>Emergency access to critical documents</li>
          <li>Check-in system with configurable reminders</li>
          <li>Offline access to key documents</li>
        </ul>
        
        <h4>Download Information</h4>
        <p>The WillTank mobile app is available now:</p>
        <ul>
          <li>iOS: Available on the App Store for iPhone and iPad</li>
          <li>Android: Available on Google Play Store</li>
          <li>Requires iOS 13+ or Android 8+</li>
        </ul>
        
        <p>Simply download the app and log in with your existing WillTank account. All your documents and settings will automatically sync to your mobile device.</p>
        
        <p>For security, we recommend enabling biometric authentication during the app setup process.</p>
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Updates Archive</h1>
          </motion.div>
          
          <motion.div 
            className="mb-10 bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-willtank-50 flex items-center justify-center">
                <Clock className="h-6 w-6 text-willtank-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Product Updates & Release Notes</h2>
                <p className="text-gray-600">A comprehensive archive of WillTank's feature and enhancement releases</p>
              </div>
            </div>
            <p className="text-gray-700">
              We're constantly working to improve WillTank and add features that help our users manage their estate planning 
              and digital legacy needs. This archive contains details about our past updates, enhancements, and new features.
            </p>
            
            <div className="flex flex-wrap gap-2 mt-6">
              <Button variant="outline" size="sm">All Updates</Button>
              <Button variant="outline" size="sm">Features</Button>
              <Button variant="outline" size="sm">Security</Button>
              <Button variant="outline" size="sm">API</Button>
              <Button variant="outline" size="sm">Platform</Button>
              <Button variant="outline" size="sm">Content</Button>
            </div>
          </motion.div>
          
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="space-y-8">
              {updates.map((update, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8"
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{update.title}</h2>
                      <Badge variant="outline" className="border-willtank-200 bg-willtank-50 text-willtank-700 font-medium">
                        {update.category}
                      </Badge>
                    </div>
                    <p className="text-gray-500 text-sm">{update.date}</p>
                  </div>
                  
                  <p className="text-gray-700 text-lg mb-6">{update.description}</p>
                  
                  <div 
                    className="prose max-w-none" 
                    dangerouslySetInnerHTML={{ __html: update.details }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
