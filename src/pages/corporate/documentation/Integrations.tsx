
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { Database, ChevronLeft, ChevronRight, Globe, CreditCard, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Integrations() {
  return (
    <Layout>
      <div className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center mb-8">
            <Link to="/corporate/documentation" className="text-gray-500 hover:text-gray-700 flex items-center">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Documentation
            </Link>
          </div>
          
          <div className="grid md:grid-cols-4 gap-10">
            <div className="md:col-span-1">
              <div className="sticky top-20">
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
                  <h3 className="font-medium text-lg mb-3">On this page</h3>
                  <ul className="space-y-2 text-sm">
                    <li><a href="#overview" className="text-gray-600 hover:text-gray-900">Overview</a></li>
                    <li><a href="#crm" className="text-gray-600 hover:text-gray-900">CRM Integrations</a></li>
                    <li><a href="#document-management" className="text-gray-600 hover:text-gray-900">Document Management</a></li>
                    <li><a href="#financial" className="text-gray-600 hover:text-gray-900">Financial Platforms</a></li>
                    <li><a href="#legal" className="text-gray-600 hover:text-gray-900">Legal Software</a></li>
                    <li><a href="#custom" className="text-gray-600 hover:text-gray-900">Custom Integrations</a></li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-lg mb-3 flex items-center">
                    <Database className="h-5 w-5 mr-2 text-blue-600" />
                    In this section
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link to="/corporate/documentation/getting-started" className="text-gray-600 hover:text-gray-900">
                        Getting Started
                      </Link>
                    </li>
                    <li>
                      <Link to="/corporate/documentation/user-guides" className="text-gray-600 hover:text-gray-900">
                        User Guides
                      </Link>
                    </li>
                    <li>
                      <Link to="/corporate/documentation/api" className="text-gray-600 hover:text-gray-900">
                        API Reference
                      </Link>
                    </li>
                    <li>
                      <Link to="/corporate/documentation/security" className="text-gray-600 hover:text-gray-900">
                        Data Security
                      </Link>
                    </li>
                    <li className="bg-white px-3 py-2 rounded border border-blue-100">
                      <strong>Integrations</strong>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-3">
              <h1 className="text-3xl font-bold mb-6" id="overview">Integrations</h1>
              
              <div className="prose max-w-none">
                <p className="lead text-xl mb-8">
                  Connect WillTank with other services and platforms to streamline your estate planning workflow.
                </p>
                
                <div className="bg-willtank-50 p-6 rounded-xl border border-willtank-100 mb-10">
                  <div className="flex items-start">
                    <Globe className="h-8 w-8 text-willtank-600 mr-4 mt-1" />
                    <div>
                      <h2 className="text-lg font-semibold text-willtank-800 mb-2">Integration Ecosystem</h2>
                      <p className="text-willtank-700">
                        WillTank connects with leading software platforms in customer relationship management, document management, 
                        financial services, and legal practice management to provide a seamless experience for professionals and clients alike.
                      </p>
                    </div>
                  </div>
                </div>
                
                <h2 id="crm" className="text-2xl font-semibold mt-12 mb-4">CRM Integrations</h2>
                <p>
                  Connect WillTank with your customer relationship management system to streamline client communication and management:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-medium text-lg mb-3">Salesforce Integration</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Sync client information, track estate planning progress, and manage relationships 
                      through direct integration with Salesforce CRM.
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                      <li>Bi-directional contact syncing</li>
                      <li>Document status tracking</li>
                      <li>Custom WillTank dashboard in Salesforce</li>
                    </ul>
                    <Link to="/corporate/documentation/integrations/salesforce" className="text-willtank-600 text-sm font-medium flex items-center mt-4">
                      Setup guide <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-medium text-lg mb-3">HubSpot Integration</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Connect WillTank with HubSpot to manage client interactions and automate 
                      marketing and sales processes for estate planning services.
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                      <li>Automated workflow triggers</li>
                      <li>Custom property syncing</li>
                      <li>Email template integration</li>
                    </ul>
                    <Link to="/corporate/documentation/integrations/hubspot" className="text-willtank-600 text-sm font-medium flex items-center mt-4">
                      Setup guide <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
                
                <h2 id="document-management" className="text-2xl font-semibold mt-12 mb-4">Document Management</h2>
                <p>
                  Integrate WillTank with leading document management systems to maintain a unified 
                  repository for all client documents:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-medium text-lg mb-3">DocuSign Integration</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Add secure electronic signatures to wills, trusts, and other estate planning 
                      documents through DocuSign's legally binding eSignature platform.
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                      <li>Automated signature workflows</li>
                      <li>Witness verification support</li>
                      <li>Document completion tracking</li>
                    </ul>
                    <Link to="/corporate/documentation/integrations/docusign" className="text-willtank-600 text-sm font-medium flex items-center mt-4">
                      Setup guide <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-medium text-lg mb-3">Dropbox Integration</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Automatically sync estate planning documents with dedicated Dropbox folders
                      for secure backup and simplified file sharing.
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                      <li>Two-way file synchronization</li>
                      <li>Permissions management</li>
                      <li>Version history tracking</li>
                    </ul>
                    <Link to="/corporate/documentation/integrations/dropbox" className="text-willtank-600 text-sm font-medium flex items-center mt-4">
                      Setup guide <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
                
                <h2 id="financial" className="text-2xl font-semibold mt-12 mb-4">Financial Platforms</h2>
                <p>
                  Connect WillTank with financial management platforms to incorporate real-time asset data 
                  into estate plans:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-start mb-3">
                      <CreditCard className="h-5 w-5 mr-2 text-gray-700" />
                      <h3 className="font-medium text-lg">Plaid Integration</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      Connect bank accounts, investment portfolios, and other financial assets to incorporate
                      accurate valuation data in estate planning documents.
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                      <li>Secure financial institution connections</li>
                      <li>Automated asset updates</li>
                      <li>Custom asset allocation</li>
                    </ul>
                    <Link to="/corporate/documentation/integrations/plaid" className="text-willtank-600 text-sm font-medium flex items-center mt-4">
                      Setup guide <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-start mb-3">
                      <FileText className="h-5 w-5 mr-2 text-gray-700" />
                      <h3 className="font-medium text-lg">QuickBooks Integration</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      Streamline billing and accounting for estate planning services with direct 
                      QuickBooks integration for professional practices.
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                      <li>Automated invoice generation</li>
                      <li>Service categorization</li>
                      <li>Payment tracking</li>
                    </ul>
                    <Link to="/corporate/documentation/integrations/quickbooks" className="text-willtank-600 text-sm font-medium flex items-center mt-4">
                      Setup guide <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
                
                <h2 id="legal" className="text-2xl font-semibold mt-12 mb-4">Legal Software</h2>
                <p>
                  Integrate with legal practice management software to streamline estate planning workflows:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-medium text-lg mb-3">Clio Integration</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Connect WillTank to Clio's legal practice management platform for streamlined 
                      client intake, document management, and billing.
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                      <li>Case management synchronization</li>
                      <li>Time tracking integration</li>
                      <li>Client portal access</li>
                    </ul>
                    <Link to="/corporate/documentation/integrations/clio" className="text-willtank-600 text-sm font-medium flex items-center mt-4">
                      Setup guide <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-medium text-lg mb-3">LawToolBox Integration</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Integrate calendar deadlines and document review reminders with LawToolBox
                      for comprehensive compliance management.
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                      <li>Deadline synchronization</li>
                      <li>Court rules integration</li>
                      <li>Microsoft 365 calendar integration</li>
                    </ul>
                    <Link to="/corporate/documentation/integrations/lawtoolbox" className="text-willtank-600 text-sm font-medium flex items-center mt-4">
                      Setup guide <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
                
                <h2 id="custom" className="text-2xl font-semibold mt-12 mb-4">Custom Integrations</h2>
                <p>
                  Build custom integrations between WillTank and your existing systems using our 
                  comprehensive API:
                </p>
                <div className="bg-gradient-to-r from-willtank-50 to-white p-6 rounded-lg shadow-sm border border-willtank-100 my-8">
                  <h3 className="font-medium text-lg mb-3">API Integration Options</h3>
                  <p className="text-gray-700 mb-4">
                    Our extensive API allows for custom integration with virtually any system. Our development 
                    team can assist with creating tailored solutions for your specific needs.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-base mb-2">Integration Professional Services</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                        <li>Custom API development</li>
                        <li>Webhook implementations</li>
                        <li>Integration strategy consultation</li>
                        <li>Legacy system connectors</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-base mb-2">Developer Resources</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                        <li>Comprehensive API documentation</li>
                        <li>SDKs for major programming languages</li>
                        <li>Sample code and use cases</li>
                        <li>Developer support options</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-6">
                    <Link to="/corporate/documentation/api">
                      <Button variant="default" size="sm">View API Documentation</Button>
                    </Link>
                    <Link to="/corporate/documentation/custom-integration">
                      <Button variant="outline" size="sm">Request Custom Integration</Button>
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 mt-12 pt-8 flex justify-between">
                <Link to="/corporate/documentation/security">
                  <Button variant="outline" className="flex items-center">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous: Security
                  </Button>
                </Link>
                <div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
