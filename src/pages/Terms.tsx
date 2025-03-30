
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
                Please read these terms and conditions carefully before using our service.
              </p>
              <p className="text-sm text-gray-500 mt-2">Last updated: June 1, 2023</p>
            </motion.div>

            <motion.div 
              className="prose prose-gray max-w-none"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h2>1. Agreement to Terms</h2>
              <p>
                By accessing or using the WillTank service, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>

              <h2>2. Use License</h2>
              <p>
                Permission is granted to temporarily access the materials (information or software) on WillTank's website for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul>
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to decompile or reverse engineer any software contained on WillTank's website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
              <p>
                This license shall automatically terminate if you violate any of these restrictions and may be terminated by WillTank at any time.
              </p>

              <h2>3. Subscription and Payments</h2>
              <p>
                WillTank offers various subscription plans. By subscribing to our service, you agree to pay the applicable fees. All fees are exclusive of taxes, which may be added to the fees charged to you.
              </p>
              <p>
                Subscriptions automatically renew unless canceled before the renewal date. You can cancel your subscription at any time through your account settings or by contacting our customer support.
              </p>

              <h2>4. Legal Disclaimer</h2>
              <p>
                The materials on WillTank's website are provided on an 'as is' basis. WillTank makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
              <p>
                WillTank does not provide legal advice. The documents and services we offer are not a substitute for the advice of an attorney. WillTank is not a law firm and is not a substitute for an attorney or law firm. We cannot provide any kind of legal advice, opinion, or recommendation about possible legal rights, remedies, defenses, options, or strategies.
              </p>

              <h2>5. Limitations</h2>
              <p>
                In no event shall WillTank or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on WillTank's website, even if WillTank or a WillTank authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>

              <h2>6. Accuracy of Materials</h2>
              <p>
                The materials appearing on WillTank's website could include technical, typographical, or photographic errors. WillTank does not warrant that any of the materials on its website are accurate, complete, or current. WillTank may make changes to the materials contained on its website at any time without notice.
              </p>

              <h2>7. User Accounts</h2>
              <p>
                When you create an account with us, you must provide accurate and complete information. You are solely responsible for the activity that occurs on your account, and you must keep your account password secure. You must notify WillTank immediately of any breach of security or unauthorized use of your account.
              </p>

              <h2>8. Termination</h2>
              <p>
                We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>

              <h2>9. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
              </p>

              <h2>10. Changes to Terms</h2>
              <p>
                WillTank reserves the right, at its sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>

              <h2>11. Contact Us</h2>
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
