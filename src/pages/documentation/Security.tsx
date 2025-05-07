
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, Shield, Key, Eye, FileCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Security() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const sections = [
    {
      id: 'encryption',
      title: 'Encryption',
      icon: <Lock className="h-6 w-6 text-willtank-600" />,
      content: `
      <h3>Data Encryption</h3>
      <p>WillTank employs multiple layers of encryption to protect your sensitive information:</p>
      <h4>Encryption at Rest</h4>
      <p>All data stored in our systems is encrypted using AES-256, the same encryption standard used by financial institutions and government agencies. This means that even if someone were to gain unauthorized access to our storage systems, they would be unable to read your data.</p>
      
      <h4>Encryption in Transit</h4>
      <p>When data travels between your device and our servers, it's protected with TLS 1.3 encryption, ensuring that it cannot be intercepted during transmission. We maintain an A+ rating from SSL Labs for our secure connection implementation.</p>
      
      <h4>End-to-End Encryption</h4>
      <p>For our most sensitive document types, we offer optional end-to-end encryption. This means that your documents are encrypted on your device before they're sent to our servers, and can only be decrypted with your personal key. Even WillTank staff cannot access the contents of these documents.</p>
      
      <h4>Encryption Key Management</h4>
      <p>We implement strict key management protocols, including key rotation, secure key storage, and hardware security modules (HSMs) for cryptographic operations. Your encryption keys are never stored in the same location as your encrypted data.</p>
      `
    },
    {
      id: 'access-controls',
      title: 'Access Controls',
      icon: <Key className="h-6 w-6 text-willtank-600" />,
      content: `
      <h3>Robust Access Control System</h3>
      <p>WillTank implements comprehensive access controls to ensure your information is only accessible to authorized individuals:</p>
      
      <h4>Authentication Systems</h4>
      <ul>
        <li><strong>Multi-factor authentication (MFA)</strong> - We support various second factors including authenticator apps, security keys (FIDO2/WebAuthn), and biometric verification</li>
        <li><strong>Strong password requirements</strong> - Enforcing complex passwords and checking against known breached password databases</li>
        <li><strong>Configurable session timeouts</strong> - Automatically log out after periods of inactivity</li>
        <li><strong>Suspicious login detection</strong> - Alerts for logins from new devices or locations</li>
      </ul>
      
      <h4>Access Levels</h4>
      <p>WillTank provides granular permission controls so you can share specific information without exposing your entire account:</p>
      <ul>
        <li><strong>Executor access</strong> - Limited view of documents they need to execute your will</li>
        <li><strong>Trusted contact access</strong> - Verification-only access for death confirmation</li>
        <li><strong>Professional advisor access</strong> - Time-limited access for legal or financial advisors</li>
        <li><strong>Document-specific sharing</strong> - Share individual documents without granting access to others</li>
      </ul>
      
      <h4>Administrative Controls</h4>
      <p>For business and family accounts, we provide administrative controls including:</p>
      <ul>
        <li>Activity logs showing who accessed what documents and when</li>
        <li>The ability to grant and revoke access for specific users</li>
        <li>Custom access policies for different user roles</li>
      </ul>
      `
    },
    {
      id: 'compliance',
      title: 'Compliance',
      icon: <FileCheck className="h-6 w-6 text-willtank-600" />,
      content: `
      <h3>Regulatory Compliance</h3>
      <p>WillTank is committed to meeting and exceeding regulatory requirements for data protection and privacy:</p>
      
      <h4>Global Privacy Compliance</h4>
      <ul>
        <li><strong>GDPR Compliance</strong> - We adhere to the European Union's General Data Protection Regulation, providing data portability, the right to be forgotten, and transparent data processing</li>
        <li><strong>CCPA Compliance</strong> - We meet California Consumer Privacy Act requirements for California residents</li>
        <li><strong>PIPEDA Compliance</strong> - We comply with Canadian Personal Information Protection and Electronic Documents Act standards</li>
      </ul>
      
      <h4>Industry Standards</h4>
      <ul>
        <li><strong>SOC 2 Type II Certification</strong> - We undergo regular independent audits to verify our security, availability, processing integrity, confidentiality, and privacy controls</li>
        <li><strong>ISO 27001 Certification</strong> - Our information security management system is certified to meet international standards</li>
        <li><strong>NIST Cybersecurity Framework</strong> - We align our security practices with the National Institute of Standards and Technology guidelines</li>
      </ul>
      
      <h4>Legal Document Standards</h4>
      <p>Our document templates and creation tools are designed to comply with legal requirements across multiple jurisdictions. We regularly update our systems to reflect changes in estate planning laws.</p>
      
      <h4>Compliance Documentation</h4>
      <p>We maintain detailed documentation of our compliance efforts, including:</p>
      <ul>
        <li>Privacy Impact Assessments</li>
        <li>Data Protection Impact Assessments</li>
        <li>Vendor security assessments</li>
        <li>Regular compliance reports and certifications</li>
      </ul>
      <p>Copies of our compliance certifications are available upon request for enterprise customers.</p>
      `
    },
    {
      id: 'auditing',
      title: 'Auditing',
      icon: <Eye className="h-6 w-6 text-willtank-600" />,
      content: `
      <h3>Comprehensive Audit Systems</h3>
      <p>WillTank maintains extensive audit capabilities to ensure accountability and detect potential security issues:</p>
      
      <h4>System Auditing</h4>
      <ul>
        <li><strong>Immutable audit logs</strong> - All system activities are recorded in tamper-evident logs</li>
        <li><strong>Advanced log monitoring</strong> - Real-time monitoring for suspicious activities or unauthorized access attempts</li>
        <li><strong>Regular log reviews</strong> - Our security team reviews system logs for potential security incidents</li>
      </ul>
      
      <h4>User Activity Auditing</h4>
      <p>For your peace of mind, we provide detailed audit trails of account activity:</p>
      <ul>
        <li>Login history with device and location information</li>
        <li>Document access and modification records</li>
        <li>Permission changes and sharing activities</li>
        <li>Account setting modifications</li>
      </ul>
      <p>You can access your activity logs directly from your account dashboard.</p>
      
      <h4>External Audits</h4>
      <p>WillTank undergoes regular external security assessments:</p>
      <ul>
        <li>Annual penetration testing by independent security firms</li>
        <li>Regular vulnerability assessments</li>
        <li>Code security reviews</li>
        <li>Infrastructure security audits</li>
      </ul>
      <p>Summary reports of our external audits are available to enterprise customers as part of our security documentation package.</p>
      `
    },
    {
      id: 'disaster-recovery',
      title: 'Disaster Recovery',
      icon: <Clock className="h-6 w-6 text-willtank-600" />,
      content: `
      <h3>Disaster Recovery Planning</h3>
      <p>WillTank has comprehensive disaster recovery and business continuity plans to ensure your information remains safe and accessible even during emergencies:</p>
      
      <h4>Data Redundancy</h4>
      <ul>
        <li><strong>Multiple data centers</strong> - Your data is stored in geographically distributed data centers to protect against regional disasters</li>
        <li><strong>Real-time replication</strong> - Data is continuously synchronized across locations</li>
        <li><strong>Point-in-time recovery</strong> - We maintain backups that allow restoration of data from specific points in time</li>
      </ul>
      
      <h4>Infrastructure Resilience</h4>
      <ul>
        <li><strong>High availability architecture</strong> - Our systems are designed with no single points of failure</li>
        <li><strong>Automatic failover</strong> - If one system fails, your data automatically routes to functioning systems</li>
        <li><strong>Load balancing</strong> - Traffic is distributed to prevent overloading any single component</li>
        <li><strong>Redundant network connections</strong> - Multiple network providers ensure continuous connectivity</li>
      </ul>
      
      <h4>Recovery Procedures</h4>
      <p>We maintain detailed recovery procedures for various scenarios:</p>
      <ul>
        <li>Data corruption recovery plans</li>
        <li>System failure response protocols</li>
        <li>Disaster declaration and escalation procedures</li>
        <li>Emergency communication channels</li>
      </ul>
      
      <h4>Testing and Verification</h4>
      <p>Our disaster recovery capabilities are regularly tested to ensure they function as expected:</p>
      <ul>
        <li>Quarterly recovery testing of critical systems</li>
        <li>Annual full-scale disaster recovery exercises</li>
        <li>Tabletop exercises for emergency response teams</li>
        <li>Regular review and updating of recovery procedures</li>
      </ul>
      <p>Our recovery time objective (RTO) is under 4 hours for critical systems, with a recovery point objective (RPO) of less than 15 minutes.</p>
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Data Security</h1>
          </motion.div>
          
          <motion.div 
            className="mb-10 bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-willtank-50 flex items-center justify-center">
                <Shield className="h-6 w-6 text-willtank-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Our Security Commitment</h2>
                <p className="text-gray-600">Protecting your sensitive information is our highest priority</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              At WillTank, we understand that we're entrusted with your most sensitive personal and financial information. 
              We take this responsibility seriously and have implemented comprehensive security measures at every level of our organization 
              and technology stack to ensure your data remains private, intact, and accessible only to authorized individuals.
            </p>
            <p className="text-gray-700">
              Our security approach follows defense-in-depth principles, with multiple layers of protection surrounding your data. 
              From advanced encryption to strict access controls, rigorous compliance standards to comprehensive disaster recovery planning, 
              we've designed our systems with security as the foundation.
            </p>
          </motion.div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <motion.div 
              className="lg:w-1/4"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="sticky top-20 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-6">In This Section</h2>
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
