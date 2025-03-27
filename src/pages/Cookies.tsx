
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';

export default function Cookies() {
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
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
              <p className="text-lg text-gray-600">
                This policy explains how WillTank uses cookies and similar technologies on our website.
              </p>
              <p className="text-sm text-gray-500 mt-2">Last updated: June 1, 2023</p>
            </motion.div>

            <motion.div 
              className="prose prose-gray max-w-none"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h2>1. What Are Cookies?</h2>
              <p>
                Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
              </p>
              <p>
                Cookies can be "persistent" or "session" cookies. Persistent cookies remain on your device when you go offline, while session cookies are deleted as soon as you close your web browser.
              </p>

              <h2>2. How We Use Cookies</h2>
              <p>
                We use cookies for the following purposes:
              </p>
              <ul>
                <li><strong>Essential cookies:</strong> These are necessary for the website to function properly and cannot be switched off in our systems. They are usually set in response to actions you take, such as setting your privacy preferences, logging in, or filling in forms.</li>
                <li><strong>Analytical/performance cookies:</strong> These allow us to recognize and count the number of visitors and see how visitors move around our website. This helps us improve how our website works, for example, by ensuring that users find what they are looking for easily.</li>
                <li><strong>Functionality cookies:</strong> These are used to recognize you when you return to our website. This enables us to personalize our content for you and remember your preferences.</li>
                <li><strong>Targeting cookies:</strong> These may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites.</li>
              </ul>

              <h2>3. Types of Cookies We Use</h2>
              <table className="w-full border-collapse border border-gray-300 mb-6">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2">Category</th>
                    <th className="border border-gray-300 p-2">Purpose</th>
                    <th className="border border-gray-300 p-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2">Authentication</td>
                    <td className="border border-gray-300 p-2">To identify you when you log in to our website</td>
                    <td className="border border-gray-300 p-2">Session</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">Security</td>
                    <td className="border border-gray-300 p-2">To support security features and detect malicious activity</td>
                    <td className="border border-gray-300 p-2">Persistent (1 year)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">Preferences</td>
                    <td className="border border-gray-300 p-2">To remember information about your preferences and settings</td>
                    <td className="border border-gray-300 p-2">Persistent (1 year)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">Analytics</td>
                    <td className="border border-gray-300 p-2">To help us understand how visitors interact with our website</td>
                    <td className="border border-gray-300 p-2">Persistent (2 years)</td>
                  </tr>
                </tbody>
              </table>

              <h2>4. Third-Party Cookies</h2>
              <p>
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the website and enhance your user experience. These cookies may include:
              </p>
              <ul>
                <li><strong>Google Analytics:</strong> Used to analyze how users use our website</li>
                <li><strong>Intercom:</strong> Used for customer support and chat functionality</li>
                <li><strong>Stripe:</strong> Used for processing payments securely</li>
              </ul>

              <h2>5. Managing Cookies</h2>
              <p>
                Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience and some parts of the website may not function properly.
              </p>
              <p>
                To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-willtank-600 hover:text-willtank-700">www.allaboutcookies.org</a>.
              </p>

              <h2>6. Cookie Consent</h2>
              <p>
                When you first visit our website, you will be presented with a cookie banner that allows you to accept or decline non-essential cookies. You can change your preferences at any time by clicking on the "Cookie Settings" link in the footer of our website.
              </p>

              <h2>7. Changes to This Cookie Policy</h2>
              <p>
                We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>

              <h2>8. Contact Us</h2>
              <p>
                If you have any questions about our Cookie Policy, please <Link to="/contact" className="text-willtank-600 hover:text-willtank-700">contact us</Link>.
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
