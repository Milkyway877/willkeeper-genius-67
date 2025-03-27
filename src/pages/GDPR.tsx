
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';

export default function GDPR() {
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
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">GDPR Compliance</h1>
              <p className="text-lg text-gray-600">
                Information about how WillTank complies with the EU General Data Protection Regulation.
              </p>
              <p className="text-sm text-gray-500 mt-2">Last updated: June 1, 2023</p>
            </motion.div>

            <motion.div 
              className="prose prose-gray max-w-none"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h2>1. Introduction to GDPR</h2>
              <p>
                The General Data Protection Regulation (GDPR) is a comprehensive data protection law that came into effect on May 25, 2018. It applies to all organizations that process personal data of individuals in the European Union (EU) and European Economic Area (EEA), regardless of where the organization is located.
              </p>
              <p>
                At WillTank, we are committed to ensuring the privacy and protection of your personal data in compliance with GDPR requirements.
              </p>

              <h2>2. Our Role Under GDPR</h2>
              <p>
                Under the GDPR, WillTank acts as:
              </p>
              <ul>
                <li>A <strong>data controller</strong> for information we collect about our users (account information, billing details, etc.)</li>
                <li>A <strong>data processor</strong> for the content of documents and information that users store on our platform</li>
              </ul>

              <h2>3. Legal Basis for Processing</h2>
              <p>
                WillTank processes personal data on the following legal bases:
              </p>
              <ul>
                <li><strong>Contractual necessity:</strong> To provide our services and fulfill our contractual obligations to you</li>
                <li><strong>Legitimate interests:</strong> To improve our services, prevent fraud, and ensure security</li>
                <li><strong>Consent:</strong> For marketing communications and certain cookies (where required)</li>
                <li><strong>Legal obligation:</strong> To comply with applicable laws and regulations</li>
              </ul>

              <h2>4. Your Rights Under GDPR</h2>
              <p>
                The GDPR provides EU/EEA residents with certain rights regarding their personal data, including:
              </p>
              <ul>
                <li><strong>Right to access:</strong> You can request a copy of the personal data we hold about you</li>
                <li><strong>Right to rectification:</strong> You can request that we correct inaccurate or incomplete data</li>
                <li><strong>Right to erasure:</strong> You can request that we delete your personal data (subject to certain conditions)</li>
                <li><strong>Right to restrict processing:</strong> You can request that we limit how we use your data</li>
                <li><strong>Right to data portability:</strong> You can request a machine-readable copy of your data to transfer to another service</li>
                <li><strong>Right to object:</strong> You can object to our processing of your data in certain circumstances</li>
                <li><strong>Rights related to automated decision-making:</strong> You have rights related to automated decisions with legal or significant effects</li>
              </ul>
              <p>
                To exercise these rights, please <Link to="/contact" className="text-willtank-600 hover:text-willtank-700">contact us</Link>. We will respond to your request within one month.
              </p>

              <h2>5. Data Security Measures</h2>
              <p>
                We implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including:
              </p>
              <ul>
                <li>Encryption of personal data in transit and at rest</li>
                <li>Regular testing and evaluation of security measures</li>
                <li>Ability to restore data in the event of a physical or technical incident</li>
                <li>Restricted access to personal data on a need-to-know basis</li>
                <li>Regular staff training on data protection and security</li>
              </ul>

              <h2>6. International Data Transfers</h2>
              <p>
                When transferring personal data outside the EU/EEA, we ensure appropriate safeguards are in place, such as:
              </p>
              <ul>
                <li>Standard Contractual Clauses approved by the European Commission</li>
                <li>Binding Corporate Rules (where applicable)</li>
                <li>Adequacy decisions for countries with adequate protection</li>
              </ul>

              <h2>7. Data Protection Impact Assessments</h2>
              <p>
                We conduct Data Protection Impact Assessments (DPIAs) for processing activities that may result in high risk to individuals' rights and freedoms, particularly when implementing new technologies.
              </p>

              <h2>8. Data Breach Notification</h2>
              <p>
                In the event of a personal data breach that is likely to result in a risk to your rights and freedoms, we will notify the relevant supervisory authority within 72 hours of becoming aware of the breach, where feasible. We will also notify affected individuals without undue delay when the breach is likely to result in a high risk to their rights and freedoms.
              </p>

              <h2>9. Data Protection Officer</h2>
              <p>
                We have appointed a Data Protection Officer (DPO) who is responsible for overseeing our data protection strategy and implementation. You can contact our DPO at <a href="mailto:dpo@willtank.com" className="text-willtank-600 hover:text-willtank-700">dpo@willtank.com</a>.
              </p>

              <h2>10. Contact Us</h2>
              <p>
                If you have any questions about our GDPR compliance or wish to exercise your rights, please <Link to="/contact" className="text-willtank-600 hover:text-willtank-700">contact us</Link>.
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
