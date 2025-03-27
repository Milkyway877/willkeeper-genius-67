
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';

export default function Terms() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <motion.div 
              className="text-center mb-12"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
              <p className="text-lg text-gray-600">
                Please read these terms and conditions carefully before using WillTank's services.
              </p>
              <p className="text-sm text-gray-500 mt-2">Last updated: June 1, 2023</p>
            </motion.div>

            <motion.div 
              className="prose prose-gray max-w-none"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using WillTank's services, website, or application (collectively, the "Services"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Services.
              </p>

              <h2>2. Description of Services</h2>
              <p>
                WillTank provides an online platform for creating, storing, and managing legal documents related to estate planning, including wills, trusts, and advance directives. Our Services may include:
              </p>
              <ul>
                <li>Document creation tools and templates</li>
                <li>Secure digital storage of documents and related information</li>
                <li>Access control and sharing features for trustees, executors, and beneficiaries</li>
                <li>Educational resources about estate planning</li>
              </ul>

              <h2>3. User Accounts</h2>
              <p>
                To use certain features of our Services, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>
              <p>
                You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>

              <h2>4. User Responsibilities</h2>
              <p>
                You are solely responsible for:
              </p>
              <ul>
                <li>The accuracy and completeness of all information and documents you create using our Services</li>
                <li>Ensuring that your will and other estate planning documents comply with relevant laws in your jurisdiction</li>
                <li>Properly executing documents according to the legal requirements in your jurisdiction (such as having witnesses or notarization)</li>
                <li>Keeping your estate planning information updated</li>
              </ul>

              <h2>5. Privacy</h2>
              <p>
                Your privacy is important to us. Our <Link to="/privacy" className="text-willtank-600 hover:text-willtank-700">Privacy Policy</Link> describes how we collect, use, and disclose information about you.
              </p>

              <h2>6. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account and access to our Services at any time, for any reason, including but not limited to, your violation of these Terms of Service.
              </p>

              <h2>7. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, WillTank shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, or use, incurred by you or any third party, whether in an action in contract or tort, arising from your access to, or use of, our Services.
              </p>

              <h2>8. Disclaimers</h2>
              <p>
                WillTank provides tools and information to help you create estate planning documents, but we do not provide legal advice. Nothing in our Services should be considered legal advice, and we strongly recommend consulting with a qualified attorney to review your specific situation and documents.
              </p>
              <p>
                Our Services are provided "as is" without any warranty of any kind, either express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
              </p>

              <h2>9. Changes to These Terms</h2>
              <p>
                We may update these Terms of Service from time to time. We will notify you of any changes by posting the new Terms on this page and updating the "Last updated" date. You are advised to review these Terms periodically for any changes.
              </p>

              <h2>10. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please <Link to="/contact" className="text-willtank-600 hover:text-willtank-700">contact us</Link>.
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
