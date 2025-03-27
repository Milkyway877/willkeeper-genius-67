import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { FileText, Globe, ShieldCheck, UserCheck } from 'lucide-react';

export default function GDPR() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-16 bg-gray-50">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-willtank-50 px-3 py-1 text-sm font-medium text-willtank-700 mb-4">
              <Globe size={14} />
              <span>Last Updated: June 1, 2023</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">GDPR Compliance</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Information regarding WillTank's compliance with the General Data Protection Regulation (GDPR) and your rights under this regulation.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl shadow-sm overflow-hidden mb-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="p-6 md:p-8 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-willtank-50">
                  <FileText size={20} className="text-willtank-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Introduction to GDPR</h2>
              </div>
              
              <div className="prose max-w-none text-gray-600">
                <p>
                  The General Data Protection Regulation (GDPR) is a regulation in EU law on data protection and privacy for all individuals within the European Union and the European Economic Area. It addresses the export of personal data outside the EU and EEA areas.
                </p>
                <p>
                  At WillTank, we respect your privacy and are committed to protecting your personal data. This GDPR compliance statement explains how we collect, process, and store personal data from users in the European Union in accordance with GDPR requirements.
                </p>
              </div>
            </div>
            
            <div className="p-6 md:p-8 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-willtank-50">
                  <ShieldCheck size={20} className="text-willtank-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Our Commitment to GDPR Compliance</h2>
              </div>
              
              <div className="prose max-w-none text-gray-600">
                <p>
                  WillTank is committed to GDPR compliance and has implemented the following measures:
                </p>
                <ul>
                  <li>Data Protection Officer (DPO) appointment to oversee our data protection strategy and implementation</li>
                  <li>Regular data protection impact assessments (DPIAs) to identify and minimize data protection risks</li>
                  <li>Implementation of appropriate technical and organizational measures to ensure data security</li>
                  <li>Clear procedures for handling data breaches</li>
                  <li>Regular staff training on data protection and GDPR requirements</li>
                  <li>Contractual agreements with third-party processors that ensure GDPR compliance</li>
                  <li>Implementation of data protection by design and by default principles in our product development</li>
                </ul>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-willtank-50">
                  <UserCheck size={20} className="text-willtank-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Your Rights Under GDPR</h2>
              </div>
              
              <div className="prose max-w-none text-gray-600">
                <p>
                  Under the GDPR, if you are an EU resident, you have the following rights:
                </p>
                <ul>
                  <li><strong>Right of Access:</strong> You have the right to request a copy of your personal data that we hold.</li>
                  <li><strong>Right to Rectification:</strong> You have the right to request that we correct any inaccurate personal data we hold about you.</li>
                  <li><strong>Right to Erasure:</strong> You have the right to request that we delete your personal data in certain circumstances.</li>
                  <li><strong>Right to Restrict Processing:</strong> You have the right to request that we restrict the processing of your personal data in certain circumstances.</li>
                  <li><strong>Right to Data Portability:</strong> You have the right to request that we transfer your personal data to another service provider in a structured, commonly used, and machine-readable format.</li>
                  <li><strong>Right to Object:</strong> You have the right to object to the processing of your personal data in certain circumstances.</li>
                  <li><strong>Rights in Relation to Automated Decision Making and Profiling:</strong> You have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects concerning you or similarly significantly affects you.</li>
                </ul>
                <p>
                  If you wish to exercise any of these rights, please contact our Data Protection Officer at privacy@willtank.com.
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl shadow-sm overflow-hidden mb-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="p-6 md:p-8 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Legal Basis for Processing</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Under GDPR, we must have a legal basis for processing your personal data. We process your personal data on the following legal bases:
                </p>
                <ul>
                  <li><strong>Consent:</strong> Where you have given explicit consent for us to process your personal data for a specific purpose.</li>
                  <li><strong>Contract:</strong> Where processing is necessary for the performance of a contract with you or to take steps at your request before entering into a contract.</li>
                  <li><strong>Legal Obligation:</strong> Where processing is necessary for compliance with a legal obligation that we are subject to.</li>
                  <li><strong>Legitimate Interests:</strong> Where processing is necessary for the purposes of legitimate interests pursued by us or a third party, except where such interests are overridden by your interests or fundamental rights and freedoms which require protection of personal data.</li>
                </ul>
              </div>
            </div>
            
            <div className="p-6 md:p-8 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">International Data Transfers</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  As a global company, we may transfer your personal data to countries outside the European Economic Area (EEA). When we do so, we ensure that appropriate safeguards are in place to protect your data, including:
                </p>
                <ul>
                  <li>Standard Contractual Clauses approved by the European Commission</li>
                  <li>Binding Corporate Rules for transfers within a corporate group</li>
                  <li>Adherence to recognized frameworks such as the EU-US Privacy Shield</li>
                </ul>
                <p>
                  We only transfer your personal data to countries that have been deemed to provide an adequate level of protection for personal data by the European Commission, or where we have ensured that adequate safeguards are in place.
                </p>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Retention</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
                </p>
                <p>
                  To determine the appropriate retention period for personal data, we consider:
                </p>
                <ul>
                  <li>The amount, nature, and sensitivity of the personal data</li>
                  <li>The potential risk of harm from unauthorized use or disclosure of your personal data</li>
                  <li>The purposes for which we process your personal data and whether we can achieve those purposes through other means</li>
                  <li>The applicable legal requirements</li>
                </ul>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl shadow-sm overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  If you have any questions about our GDPR compliance or how we handle your personal data, please contact our Data Protection Officer at:
                </p>
                <p className="font-medium">
                  privacy@willtank.com<br />
                  WillTank, Inc.<br />
                  123 Legal Avenue, Suite 500<br />
                  San Francisco, CA 94105<br />
                  (800) WILL-TANK
                </p>
                <p>
                  You also have the right to lodge a complaint with a supervisory authority, in particular in the EU Member State of your habitual residence, place of work, or place of the alleged infringement if you consider that the processing of your personal data infringes the GDPR.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <footer className="bg-gray-900 text-gray-200 py-12">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/services" className="text-gray-400 hover:text-white transition">Features</Link></li>
                <li><Link to="/security" className="text-gray-400 hover:text-white transition">Security</Link></li>
                <li><Link to="/#pricing" className="text-gray-400 hover:text-white transition">Pricing</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition">About</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white transition">Blog</Link></li>
                <li><Link to="/careers" className="text-gray-400 hover:text-white transition">Careers</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="/documentation" className="text-gray-400 hover:text-white transition">Documentation</Link></li>
                <li><Link to="/help" className="text-gray-400 hover:text-white transition">Help Center</Link></li>
                <li><Link to="/api" className="text-gray-400 hover:text-white transition">API</Link></li>
                <li><Link to="/community" className="text-gray-400 hover:text-white transition">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition">Terms of Service</Link></li>
                <li><Link to="/cookies" className="text-gray-400 hover:text-white transition">Cookie Policy</Link></li>
                <li><Link to="/gdpr" className="text-gray-400 hover:text-white transition">GDPR</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <Logo color="white" />
            
            <div className="mt-6 md:mt-0">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} WillTank. All rights reserved.
              </p>
            </div>
            
            <div className="mt-6 md:mt-0 flex items-center space-x-4">
              <Link to="/social/facebook" className="text-gray-400 hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link to="/social/twitter" className="text-gray-400 hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link to="/social/instagram" className="text-gray-400 hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link to="/social/github" className="text-gray-400 hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
