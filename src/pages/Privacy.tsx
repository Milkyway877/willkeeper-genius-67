
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';

export default function Privacy() {
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
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
              <p className="text-lg text-gray-600">
                We take your privacy seriously. This policy explains how we collect, use, and protect your information.
              </p>
              <p className="text-sm text-gray-500 mt-2">Last updated: June 1, 2023</p>
            </motion.div>

            <motion.div 
              className="prose prose-gray max-w-none"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h2>1. Information We Collect</h2>
              <p>
                We collect several types of information from and about users of our Services, including:
              </p>
              <ul>
                <li>Personal identifiers (name, email address, phone number)</li>
                <li>Account credentials</li>
                <li>Content of your documents and communications</li>
                <li>Usage data and analytics</li>
                <li>Device and browser information</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>
                We use the information we collect to:
              </p>
              <ul>
                <li>Provide, maintain, and improve our Services</li>
                <li>Process transactions and manage your account</li>
                <li>Fulfill the purposes for which you provided the information</li>
                <li>Send notifications and updates related to your account and documents</li>
                <li>Respond to your requests and inquiries</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Protect against unauthorized access and legal liability</li>
              </ul>

              <h2>3. Data Security</h2>
              <p>
                We implement robust security measures to protect your personal information, including:
              </p>
              <ul>
                <li>AES-256 bit encryption for all stored documents</li>
                <li>TLS/SSL encryption for data transmission</li>
                <li>Role-based access controls</li>
                <li>Regular security audits and penetration testing</li>
                <li>Secure data centers with physical safeguards</li>
              </ul>
              <p>
                Despite our efforts, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
              </p>

              <h2>4. Data Sharing and Disclosure</h2>
              <p>
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul>
                <li>With trusted service providers who help us operate our business</li>
                <li>With individuals you explicitly designate as trustees, executors, or beneficiaries</li>
                <li>To comply with legal obligations or enforce our agreements</li>
                <li>In connection with a merger, acquisition, or sale of assets</li>
              </ul>

              <h2>5. Your Privacy Rights</h2>
              <p>
                Depending on your location, you may have rights regarding your personal information, including:
              </p>
              <ul>
                <li>Access to personal data we hold about you</li>
                <li>Correction of inaccurate or incomplete data</li>
                <li>Deletion of your data (subject to legal obligations)</li>
                <li>Objection to or restriction of certain processing</li>
                <li>Data portability</li>
              </ul>
              <p>
                To exercise these rights, please <Link to="/contact" className="text-willtank-600 hover:text-willtank-700">contact us</Link>.
              </p>

              <h2>6. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar technologies to enhance your experience on our website. For more information, please see our <Link to="/cookies" className="text-willtank-600 hover:text-willtank-700">Cookie Policy</Link>.
              </p>

              <h2>7. Children's Privacy</h2>
              <p>
                Our Services are not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18.
              </p>

              <h2>8. International Data Transfers</h2>
              <p>
                Your information may be transferred to, and processed in, countries other than the country in which you reside. These countries may have different data protection laws. When we transfer your information, we implement appropriate safeguards in accordance with applicable law, including the European Union's General Data Protection Regulation (GDPR).
              </p>
              <p>
                For more information about our compliance with international data protection regulations, please see our <Link to="/gdpr" className="text-willtank-600 hover:text-willtank-700">GDPR Compliance</Link> page.
              </p>

              <h2>9. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>

              <h2>10. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please <Link to="/contact" className="text-willtank-600 hover:text-willtank-700">contact us</Link>.
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
