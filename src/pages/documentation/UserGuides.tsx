
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function UserGuides() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const sections = [
    {
      id: 'estate-planning-basics',
      title: 'Estate Planning Basics',
      content: `
      <h3>Understanding Estate Planning</h3>
      <p>Estate planning is the process of arranging how your assets will be managed and distributed after your death or incapacitation. It involves creating documents that outline your wishes and appointing individuals to carry them out.</p>
      <h4>Key Components of Estate Planning</h4>
      <ul>
        <li><strong>Will:</strong> A legal document that specifies how you want your assets distributed after death</li>
        <li><strong>Trust:</strong> A legal arrangement where assets are held by one party for the benefit of another</li>
        <li><strong>Power of Attorney:</strong> A document that gives someone else the authority to make decisions on your behalf</li>
        <li><strong>Healthcare Directive:</strong> Instructions for your medical care if you become unable to make decisions</li>
        <li><strong>Digital Asset Plan:</strong> Instructions for handling your online accounts and digital properties</li>
      </ul>
      <p>WillTank helps you create all these documents in one secure platform, ensuring your complete estate plan is organized and accessible to the right people at the right time.</p>
      `
    },
    {
      id: 'will-creation',
      title: 'Will Creation',
      content: `
      <h3>Creating a Comprehensive Will</h3>
      <p>Your will is the cornerstone of your estate plan. WillTank offers multiple approaches to creating a legally sound will:</p>
      <h4>Available Will Creation Methods</h4>
      <ul>
        <li><strong>Guided Wizard:</strong> Step-by-step interface that walks you through each section of your will</li>
        <li><strong>AI Assistant:</strong> Conversational interface that helps you create your will through natural dialogue</li>
        <li><strong>Template Selection:</strong> Choose from legally-reviewed templates for common situations</li>
        <li><strong>Document Upload:</strong> Upload an existing will for secure storage and future updates</li>
      </ul>
      <h4>Will Components</h4>
      <ul>
        <li>Personal information and family details</li>
        <li>Asset inventory and distribution instructions</li>
        <li>Beneficiary designations</li>
        <li>Executor appointments</li>
        <li>Guardian appointments for minor children</li>
        <li>Special provisions and specific bequests</li>
        <li>Digital asset instructions</li>
      </ul>
      <p>Remember to review and update your will regularly, especially after major life events like marriage, divorce, birth of children, or significant changes in assets.</p>
      `
    },
    {
      id: 'trust-documents',
      title: 'Trust Documents',
      content: `
      <h3>Creating and Managing Trusts</h3>
      <p>Trusts are powerful legal tools that provide more control over how and when your assets are distributed. WillTank helps you create and manage various types of trusts:</p>
      <h4>Common Trust Types</h4>
      <ul>
        <li><strong>Revocable Living Trust:</strong> Can be changed during your lifetime and helps avoid probate</li>
        <li><strong>Irrevocable Trust:</strong> Cannot be changed once established and may offer tax advantages</li>
        <li><strong>Testamentary Trust:</strong> Created through your will and activated upon your death</li>
        <li><strong>Special Needs Trust:</strong> Provides for disabled beneficiaries without affecting government benefits</li>
        <li><strong>Charitable Trust:</strong> Supports charitable organizations while potentially providing tax benefits</li>
      </ul>
      <p>WillTank's trust templates are reviewed by legal experts and can be customized to your specific situation. For complex trusts, we recommend consultation with an attorney.</p>
      <p>Our platform allows you to store trust documents securely and share them with relevant parties such as trustees and beneficiaries.</p>
      `
    },
    {
      id: 'power-of-attorney',
      title: 'Power of Attorney',
      content: `
      <h3>Setting Up Power of Attorney Documents</h3>
      <p>Power of attorney (POA) documents allow you to designate someone to make decisions on your behalf if you're unable to do so. WillTank helps you create several types of POA documents:</p>
      <h4>Types of Power of Attorney</h4>
      <ul>
        <li><strong>Durable Power of Attorney:</strong> Remains in effect if you become incapacitated</li>
        <li><strong>Medical Power of Attorney:</strong> Specifically for healthcare decisions</li>
        <li><strong>Financial Power of Attorney:</strong> For managing financial affairs</li>
        <li><strong>Limited Power of Attorney:</strong> Grants authority for specific tasks or timeframes</li>
        <li><strong>Springing Power of Attorney:</strong> Takes effect only when specific conditions are met (like incapacitation)</li>
      </ul>
      <p>When creating a POA document, carefully consider who you trust to make decisions aligned with your wishes. The person you designate (your "agent" or "attorney-in-fact") should be reliable, trustworthy, and willing to serve in this role.</p>
      <p>WillTank allows you to store these documents securely and share them with your designated agents and relevant healthcare providers or financial institutions.</p>
      `
    },
    {
      id: 'healthcare-directives',
      title: 'Healthcare Directives',
      content: `
      <h3>Creating Advanced Healthcare Directives</h3>
      <p>Healthcare directives ensure your medical preferences are known and followed if you can't communicate them yourself. WillTank helps you create comprehensive healthcare documentation:</p>
      <h4>Key Healthcare Documents</h4>
      <ul>
        <li><strong>Living Will:</strong> Specifies what medical treatments you do or don't want in end-of-life scenarios</li>
        <li><strong>Medical Power of Attorney:</strong> Designates someone to make healthcare decisions for you</li>
        <li><strong>HIPAA Authorization:</strong> Allows specified individuals to access your medical information</li>
        <li><strong>Do Not Resuscitate (DNR) Order:</strong> Instructs healthcare providers not to perform CPR</li>
        <li><strong>Organ Donation Declaration:</strong> Documents your wishes regarding organ donation</li>
      </ul>
      <p>These documents can be created and stored on WillTank, with secure sharing options for your healthcare providers, designated agents, and family members.</p>
      <p>WillTank also provides a digital healthcare card that can be accessed from your smartphone, giving emergency responders immediate access to your critical healthcare information and directives.</p>
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">User Guides</h1>
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
                    <FileText className="h-5 w-5 text-willtank-600" />
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
