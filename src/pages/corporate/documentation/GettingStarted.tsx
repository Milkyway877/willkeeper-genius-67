
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { Book, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GettingStarted() {
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
                    <li><a href="#account-setup" className="text-gray-600 hover:text-gray-900">Account Setup</a></li>
                    <li><a href="#dashboard" className="text-gray-600 hover:text-gray-900">Dashboard Overview</a></li>
                    <li><a href="#first-will" className="text-gray-600 hover:text-gray-900">Creating Your First Will</a></li>
                    <li><a href="#document-mgmt" className="text-gray-600 hover:text-gray-900">Document Management</a></li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-lg mb-3 flex items-center">
                    <Book className="h-5 w-5 mr-2 text-blue-600" />
                    In this section
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="bg-white px-3 py-2 rounded border border-blue-100">
                      <strong>Getting Started</strong>
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
                    <li>
                      <Link to="/corporate/documentation/integrations" className="text-gray-600 hover:text-gray-900">
                        Integrations
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-3">
              <h1 className="text-3xl font-bold mb-6" id="overview">Getting Started with WillTank</h1>
              
              <div className="prose max-w-none">
                <p className="lead text-xl mb-8">
                  Welcome to WillTank! This guide will help you get started with creating and managing your estate planning documents.
                </p>
                
                <h2 id="account-setup" className="text-2xl font-semibold mt-12 mb-4">Account Setup</h2>
                <p>
                  Before you can start creating legal documents, you'll need to set up your account. Here's how to get started:
                </p>
                <ol className="list-decimal pl-6 space-y-3 my-4">
                  <li>Navigate to the <Link to="/auth/signup" className="text-blue-600 hover:text-blue-800">Sign Up page</Link></li>
                  <li>Enter your email address and create a secure password</li>
                  <li>Complete your personal information and verify your email address</li>
                  <li>Set up two-factor authentication for additional security</li>
                  <li>Choose your subscription plan</li>
                </ol>
                <p>
                  Once your account is set up, you'll have access to your personal dashboard where you can manage all your estate planning documents.
                </p>
                
                <h2 id="dashboard" className="text-2xl font-semibold mt-12 mb-4">Dashboard Overview</h2>
                <p>
                  Your dashboard is the central hub for managing all your estate planning documents. From here, you can:
                </p>
                <ul className="list-disc pl-6 space-y-3 my-4">
                  <li>View all your existing documents</li>
                  <li>Track document completion status</li>
                  <li>See upcoming review reminders</li>
                  <li>Access the will creation tool</li>
                  <li>Manage designated executors and beneficiaries</li>
                  <li>Access your digital legacy vault (WillTank)</li>
                </ul>
                <p>
                  The dashboard also displays notifications about document updates, legal requirement changes in your jurisdiction, and upcoming review dates.
                </p>
                
                <h2 id="first-will" className="text-2xl font-semibold mt-12 mb-4">Creating Your First Will</h2>
                <p>
                  Creating a will with WillTank is straightforward and guided:
                </p>
                <ol className="list-decimal pl-6 space-y-3 my-4">
                  <li>From your dashboard, click on "Create New Will"</li>
                  <li>Choose between starting from scratch or using a template</li>
                  <li>Follow the step-by-step questionnaire to provide all necessary information</li>
                  <li>Add beneficiaries and specify asset distribution</li>
                  <li>Designate executors and backup executors</li>
                  <li>Review your will for completeness and accuracy</li>
                  <li>Generate the final document</li>
                </ol>
                <p>
                  Remember that for a will to be legally valid, it typically needs to be printed and signed in the presence of witnesses according to your local laws. WillTank will guide you through these requirements based on your jurisdiction.
                </p>
                
                <h2 id="document-mgmt" className="text-2xl font-semibold mt-12 mb-4">Document Management</h2>
                <p>
                  Proper document management ensures your estate planning wishes are up-to-date and accessible when needed:
                </p>
                <ul className="list-disc pl-6 space-y-3 my-4">
                  <li>All documents are securely stored in your account</li>
                  <li>Set automatic review reminders (recommended annually)</li>
                  <li>Track document versions and changes over time</li>
                  <li>Share document access with designated executors</li>
                  <li>Export documents in PDF format for printing</li>
                  <li>Use the document checklist to ensure completeness</li>
                </ul>
                <p>
                  We recommend reviewing your estate planning documents after major life events such as marriage, divorce, birth of children, significant asset acquisition, or moving to a different jurisdiction.
                </p>
              </div>
              
              <div className="border-t border-gray-200 mt-12 pt-8 flex justify-between">
                <div></div>
                <Link to="/corporate/documentation/user-guides">
                  <Button className="flex items-center">
                    Next: User Guides
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
