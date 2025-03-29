
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UserGuides() {
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
                    <li><a href="#estate-planning" className="text-gray-600 hover:text-gray-900">Estate Planning Basics</a></li>
                    <li><a href="#will-creation" className="text-gray-600 hover:text-gray-900">Will Creation</a></li>
                    <li><a href="#trusts" className="text-gray-600 hover:text-gray-900">Trust Documents</a></li>
                    <li><a href="#poa" className="text-gray-600 hover:text-gray-900">Power of Attorney</a></li>
                    <li><a href="#healthcare" className="text-gray-600 hover:text-gray-900">Healthcare Directives</a></li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-lg mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    In this section
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link to="/corporate/documentation/getting-started" className="text-gray-600 hover:text-gray-900">
                        Getting Started
                      </Link>
                    </li>
                    <li className="bg-white px-3 py-2 rounded border border-blue-100">
                      <strong>User Guides</strong>
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
              <h1 className="text-3xl font-bold mb-6" id="overview">User Guides</h1>
              
              <div className="prose max-w-none">
                <p className="lead text-xl mb-8">
                  Detailed guides for using all features of the WillTank platform to manage your estate planning needs.
                </p>
                
                <h2 id="estate-planning" className="text-2xl font-semibold mt-12 mb-4">Estate Planning Basics</h2>
                <p>
                  Estate planning is the process of arranging for the management and disposal of your estate during your lifetime and after death. Key components include:
                </p>
                <ul className="list-disc pl-6 space-y-3 my-4">
                  <li><strong>Wills:</strong> Legal documents that specify how you want your assets distributed after death</li>
                  <li><strong>Trusts:</strong> Legal arrangements that allow a third party to hold and manage assets for beneficiaries</li>
                  <li><strong>Powers of Attorney:</strong> Legal authorization for someone to make decisions on your behalf</li>
                  <li><strong>Healthcare Directives:</strong> Instructions for medical care if you're unable to communicate</li>
                  <li><strong>Beneficiary Designations:</strong> Specifications for who receives assets from accounts like retirement plans</li>
                  <li><strong>Guardianship Designations:</strong> Appointment of guardians for minor children</li>
                </ul>
                <p>
                  Effective estate planning ensures your wishes are carried out and can help minimize taxes and legal complications for your heirs.
                </p>
                
                <h2 id="will-creation" className="text-2xl font-semibold mt-12 mb-4">Will Creation</h2>
                <p>
                  WillTank provides a comprehensive will creation process:
                </p>
                <h3 className="text-xl font-medium mt-6 mb-3">Step 1: Inventory Your Assets</h3>
                <p>
                  Start by creating a complete inventory of your assets, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 my-3">
                  <li>Real estate properties</li>
                  <li>Financial accounts (checking, savings, investments)</li>
                  <li>Retirement accounts</li>
                  <li>Life insurance policies</li>
                  <li>Business interests</li>
                  <li>Personal property (vehicles, jewelry, art, collections)</li>
                  <li>Digital assets (cryptocurrency, online accounts)</li>
                </ul>
                
                <h3 className="text-xl font-medium mt-6 mb-3">Step 2: Select Beneficiaries</h3>
                <p>
                  Specify who will receive your assets. You can designate:
                </p>
                <ul className="list-disc pl-6 space-y-2 my-3">
                  <li>Primary beneficiaries for each asset</li>
                  <li>Contingent (backup) beneficiaries</li>
                  <li>Specific gifts or bequests</li>
                  <li>Percentage distributions for residual estate</li>
                  <li>Charitable donations</li>
                </ul>
                
                <h3 className="text-xl font-medium mt-6 mb-3">Step 3: Appoint an Executor</h3>
                <p>
                  Your executor will be responsible for carrying out the terms of your will. Consider appointing:
                </p>
                <ul className="list-disc pl-6 space-y-2 my-3">
                  <li>A primary executor (typically a trusted family member or friend)</li>
                  <li>A backup executor</li>
                  <li>A professional executor (lawyer, bank) for complex estates</li>
                </ul>
                
                <h3 className="text-xl font-medium mt-6 mb-3">Step 4: Validate and Finalize</h3>
                <p>
                  Requirements vary by jurisdiction, but typically include:
                </p>
                <ul className="list-disc pl-6 space-y-2 my-3">
                  <li>Signing in the presence of witnesses (typically 2-3)</li>
                  <li>Witness signatures (witnesses cannot be beneficiaries)</li>
                  <li>Notarization (required in some jurisdictions)</li>
                  <li>Safe storage of the original document</li>
                </ul>
                
                <h2 id="trusts" className="text-2xl font-semibold mt-12 mb-4">Trust Documents</h2>
                <p>
                  Trusts offer additional control over how your assets are managed and distributed:
                </p>
                <h3 className="text-xl font-medium mt-6 mb-3">Living Trusts</h3>
                <p>
                  Created during your lifetime and can be either revocable or irrevocable:
                </p>
                <ul className="list-disc pl-6 space-y-2 my-3">
                  <li><strong>Revocable Trusts:</strong> Can be altered or canceled during your lifetime</li>
                  <li><strong>Irrevocable Trusts:</strong> Cannot be changed once established without beneficiary consent</li>
                </ul>
                
                <h3 className="text-xl font-medium mt-6 mb-3">Specialized Trusts</h3>
                <p>
                  WillTank supports creating various specialized trusts:
                </p>
                <ul className="list-disc pl-6 space-y-2 my-3">
                  <li><strong>Testamentary Trusts:</strong> Created through your will and take effect after death</li>
                  <li><strong>Special Needs Trusts:</strong> For beneficiaries with disabilities</li>
                  <li><strong>Spendthrift Trusts:</strong> Protect assets from beneficiaries' creditors</li>
                  <li><strong>Charitable Trusts:</strong> Support charitable organizations while providing tax benefits</li>
                </ul>
                
                <h2 id="poa" className="text-2xl font-semibold mt-12 mb-4">Power of Attorney</h2>
                <p>
                  Power of Attorney (POA) documents authorize someone to act on your behalf:
                </p>
                <h3 className="text-xl font-medium mt-6 mb-3">Types of POA</h3>
                <ul className="list-disc pl-6 space-y-2 my-3">
                  <li><strong>General POA:</strong> Broad powers across multiple areas</li>
                  <li><strong>Limited POA:</strong> Specific powers for defined transactions or time periods</li>
                  <li><strong>Durable POA:</strong> Remains in effect if you become incapacitated</li>
                  <li><strong>Springing POA:</strong> Takes effect only when specified conditions are met (e.g., incapacity)</li>
                </ul>
                
                <h2 id="healthcare" className="text-2xl font-semibold mt-12 mb-4">Healthcare Directives</h2>
                <p>
                  Healthcare directives ensure your medical wishes are respected:
                </p>
                <h3 className="text-xl font-medium mt-6 mb-3">Components</h3>
                <ul className="list-disc pl-6 space-y-2 my-3">
                  <li><strong>Living Will:</strong> Specifies medical treatments you would or would not want</li>
                  <li><strong>Healthcare Proxy/Medical POA:</strong> Appoints someone to make healthcare decisions if you cannot</li>
                  <li><strong>HIPAA Authorization:</strong> Allows access to your medical records</li>
                  <li><strong>Do Not Resuscitate (DNR) Orders:</strong> Instructions regarding resuscitation efforts</li>
                </ul>
                <p>
                  WillTank's platform walks you through creating comprehensive healthcare directives that comply with your state's requirements.
                </p>
              </div>
              
              <div className="border-t border-gray-200 mt-12 pt-8 flex justify-between">
                <Link to="/corporate/documentation/getting-started">
                  <Button variant="outline" className="flex items-center">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous: Getting Started
                  </Button>
                </Link>
                <Link to="/corporate/documentation/api">
                  <Button className="flex items-center">
                    Next: API Reference
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
