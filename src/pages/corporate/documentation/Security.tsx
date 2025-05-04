
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { Lock, ChevronLeft, ChevronRight, Shield, Key, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Security() {
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
                    <li><a href="#encryption" className="text-gray-600 hover:text-gray-900">Encryption</a></li>
                    <li><a href="#access-controls" className="text-gray-600 hover:text-gray-900">Access Controls</a></li>
                    <li><a href="#compliance" className="text-gray-600 hover:text-gray-900">Compliance</a></li>
                    <li><a href="#auditing" className="text-gray-600 hover:text-gray-900">Auditing</a></li>
                    <li><a href="#disaster-recovery" className="text-gray-600 hover:text-gray-900">Disaster Recovery</a></li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-lg mb-3 flex items-center">
                    <Lock className="h-5 w-5 mr-2 text-blue-600" />
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
                    <li className="bg-white px-3 py-2 rounded border border-blue-100">
                      <strong>Data Security</strong>
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
              <h1 className="text-3xl font-bold mb-6" id="overview">Data Security</h1>
              
              <div className="prose max-w-none">
                <p className="lead text-xl mb-8">
                  WillTank implements comprehensive security measures to protect your sensitive estate planning documents and personal information.
                </p>
                
                <div className="bg-willtank-50 p-6 rounded-xl border border-willtank-100 mb-10">
                  <div className="flex items-start">
                    <Shield className="h-8 w-8 text-willtank-600 mr-4 mt-1" />
                    <div>
                      <h2 className="text-lg font-semibold text-willtank-800 mb-2">Security Certification</h2>
                      <p className="text-willtank-700">
                        WillTank maintains industry-leading security certifications including SOC 2 Type II, ISO 27001, and HIPAA compliance.
                        Our infrastructure and practices are regularly audited by independent third parties.
                      </p>
                    </div>
                  </div>
                </div>
                
                <h2 id="encryption" className="text-2xl font-semibold mt-12 mb-4">Encryption</h2>
                <p>
                  WillTank uses multiple layers of encryption to protect your data:
                </p>
                <h3 className="text-xl font-medium mt-6 mb-3">Data at Rest</h3>
                <p>
                  All data stored in our systems is encrypted using AES-256 encryption, the same standard used by financial institutions and governments worldwide.
                  Each document is encrypted with its own unique encryption key, preventing unauthorized access even in the unlikely event of a system compromise.
                </p>
                
                <h3 className="text-xl font-medium mt-6 mb-3">Data in Transit</h3>
                <p>
                  All communication between your device and our servers is protected using TLS 1.3 encryption with perfect forward secrecy.
                  This ensures that data cannot be intercepted or read while being transmitted over the internet.
                </p>
                
                <h3 className="text-xl font-medium mt-6 mb-3">End-to-End Encryption</h3>
                <p>
                  For particularly sensitive documents, WillTank offers optional end-to-end encryption where only you and your designated beneficiaries
                  can access the contents, even WillTank staff cannot view the decrypted contents.
                </p>
                
                <div className="bg-gray-100 p-6 rounded-lg my-8">
                  <h3 className="font-medium mb-3">Encryption Keys Management</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Master encryption keys are stored in hardware security modules (HSMs)</li>
                    <li>Regular key rotation according to industry best practices</li>
                    <li>Strict separation of duties and access controls for encryption management</li>
                  </ul>
                </div>
                
                <h2 id="access-controls" className="text-2xl font-semibold mt-12 mb-4">Access Controls</h2>
                <p>
                  WillTank implements a robust system of access controls to ensure that only authorized individuals can access your information:
                </p>
                <h3 className="text-xl font-medium mt-6 mb-3">Authentication</h3>
                <ul className="list-disc pl-6 space-y-3 my-4">
                  <li><strong>Multi-Factor Authentication (MFA):</strong> All accounts can and should enable MFA for additional security</li>
                  <li><strong>Passwordless Options:</strong> Support for security keys (FIDO2/WebAuthn)</li>
                  <li><strong>Biometric Authentication:</strong> Support for fingerprint and face recognition on compatible devices</li>
                  <li><strong>Anti-Brute Force Protection:</strong> Automatic lockouts after failed login attempts</li>
                </ul>
                
                <h3 className="text-xl font-medium mt-6 mb-3">Authorization</h3>
                <p>
                  WillTank follows the principle of least privilege:
                </p>
                <ul className="list-disc pl-6 space-y-2 my-3">
                  <li>Role-based access control for all users and staff</li>
                  <li>Granular permission settings for document sharing</li>
                  <li>Ability to set time-limited access for executors and trusted contacts</li>
                  <li>Regular access reviews and automated permission expiration</li>
                </ul>
                
                <h2 id="compliance" className="text-2xl font-semibold mt-12 mb-4">Compliance</h2>
                <p>
                  WillTank maintains compliance with various regulatory and industry standards:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-medium text-lg mb-3">GDPR Compliance</h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Full data subject rights support</li>
                      <li>Data processing agreements</li>
                      <li>Privacy by design implementation</li>
                      <li>Data protection impact assessments</li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-medium text-lg mb-3">HIPAA Compliance</h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Business Associate Agreements</li>
                      <li>PHI protection protocols</li>
                      <li>Regular HIPAA risk assessments</li>
                      <li>Breach notification procedures</li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-medium text-lg mb-3">SOC 2 Type II</h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Annual independent audits</li>
                      <li>Controls for security, availability, and confidentiality</li>
                      <li>Continuous monitoring</li>
                      <li>Detailed audit reports available upon request</li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-medium text-lg mb-3">ISO 27001</h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Information security management system</li>
                      <li>Risk assessment and treatment</li>
                      <li>Continuous improvement processes</li>
                      <li>Regular certification maintenance</li>
                    </ul>
                  </div>
                </div>
                
                <h2 id="auditing" className="text-2xl font-semibold mt-12 mb-4">Auditing</h2>
                <p>
                  WillTank maintains comprehensive audit logs for all system activity:
                </p>
                <ul className="list-disc pl-6 space-y-3 my-4">
                  <li><strong>Immutable Audit Logs:</strong> All access to documents and account changes are recorded in tamper-proof logs</li>
                  <li><strong>User Activity Logs:</strong> View complete history of actions taken on your account</li>
                  <li><strong>Anomaly Detection:</strong> Automated systems monitor for unusual patterns that might indicate security issues</li>
                  <li><strong>Independent Audits:</strong> Regular third-party security assessments and penetration tests</li>
                </ul>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 my-8">
                  <div className="flex">
                    <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-medium text-yellow-800">Activity Transparency</h3>
                      <p className="text-yellow-700 mt-1">
                        When trusted contacts access your documents after death verification, a comprehensive audit trail is maintained.
                        Executors can see exactly which documents were accessed, when, and by whom.
                      </p>
                    </div>
                  </div>
                </div>
                
                <h2 id="disaster-recovery" className="text-2xl font-semibold mt-12 mb-4">Disaster Recovery</h2>
                <p>
                  WillTank maintains robust business continuity and disaster recovery procedures:
                </p>
                <h3 className="text-xl font-medium mt-6 mb-3">Data Redundancy</h3>
                <p>
                  Your documents are securely backed up across multiple geographically separated data centers.
                  This ensures that even in the event of a major disaster affecting one location, your data remains safe and accessible.
                </p>
                
                <h3 className="text-xl font-medium mt-6 mb-3">Recovery Objectives</h3>
                <ul className="list-disc pl-6 space-y-2 my-3">
                  <li><strong>Recovery Point Objective (RPO):</strong> Less than 15 minutes of potential data loss</li>
                  <li><strong>Recovery Time Objective (RTO):</strong> Critical systems back online within 1 hour</li>
                  <li><strong>Testing:</strong> Regular disaster recovery drills and tabletop exercises</li>
                </ul>
                
                <div className="bg-white p-6 rounded-lg border border-gray-200 my-8">
                  <h3 className="font-medium text-lg flex items-center mb-3">
                    <Key className="h-5 w-5 mr-2 text-gray-700" />
                    Secure Equipment Disposal
                  </h3>
                  <p className="text-gray-600">
                    When hardware reaches end-of-life, WillTank follows strict data sanitization procedures in accordance with NIST SP 800-88
                    guidelines. All storage media is securely wiped and physically destroyed before disposal.
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 mt-12 pt-8 flex justify-between">
                <Link to="/corporate/documentation/api">
                  <Button variant="outline" className="flex items-center">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous: API Reference
                  </Button>
                </Link>
                <Link to="/corporate/documentation/integrations">
                  <Button className="flex items-center">
                    Next: Integrations
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
