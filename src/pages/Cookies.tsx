import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Cookie, Info, ShieldCheck, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Cookies() {
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
              <Cookie size={14} />
              <span>Last Updated: June 1, 2023</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              This Cookie Policy explains how WillTank uses cookies and similar technologies to recognize you when you visit our website.
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
                  <Info size={20} className="text-willtank-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">What are Cookies?</h2>
              </div>
              
              <div className="prose max-w-none text-gray-600">
                <p>
                  Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
                </p>
                <p>
                  Cookies set by the website owner (in this case, WillTank) are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies." Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your computer both when it visits the website in question and also when it visits certain other websites.
                </p>
              </div>
            </div>
            
            <div className="p-6 md:p-8 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-willtank-50">
                  <Cookie size={20} className="text-willtank-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Why We Use Cookies</h2>
              </div>
              
              <div className="prose max-w-none text-gray-600">
                <p>
                  We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our website. Third parties serve cookies through our website for advertising, analytics, and other purposes.
                </p>
                <p>
                  The specific types of first and third-party cookies served through our website and the purposes they perform are described below:
                </p>
                
                <h3 className="text-lg font-medium mt-6 mb-3">Essential Cookies</h3>
                <p>
                  These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas. Because these cookies are strictly necessary to deliver the website, you cannot refuse them without impacting how our website functions.
                </p>
                
                <h3 className="text-lg font-medium mt-6 mb-3">Performance and Functionality Cookies</h3>
                <p>
                  These cookies are used to enhance the performance and functionality of our website but are non-essential to their use. However, without these cookies, certain functionality may become unavailable.
                </p>
                
                <h3 className="text-lg font-medium mt-6 mb-3">Analytics and Customization Cookies</h3>
                <p>
                  These cookies collect information that is used either in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are, or to help us customize our website for you in order to enhance your experience.
                </p>
                
                <h3 className="text-lg font-medium mt-6 mb-3">Advertising Cookies</h3>
                <p>
                  These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed, and in some cases selecting advertisements that are based on your interests.
                </p>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-willtank-50">
                  <Settings size={20} className="text-willtank-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">How Can You Control Cookies?</h2>
              </div>
              
              <div className="prose max-w-none text-gray-600">
                <p>
                  You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
                </p>
                <p>
                  In addition to controls provided by your browser, many advertising companies are members of one of the following self-regulatory programs for online behavioral advertising:
                </p>
                <ul>
                  <li>The Network Advertising Initiative (NAI) - <a href="http://www.networkadvertising.org/choices/" className="text-willtank-600 hover:text-willtank-800">www.networkadvertising.org/choices/</a></li>
                  <li>The Digital Advertising Alliance (DAA) - <a href="http://www.aboutads.info/choices/" className="text-willtank-600 hover:text-willtank-800">www.aboutads.info/choices/</a></li>
                </ul>
                <p>
                  You can opt out of targeted advertising by these members through the links above.
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
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-willtank-50">
                  <ShieldCheck size={20} className="text-willtank-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Cookie Preferences</h2>
              </div>
              
              <div className="prose max-w-none text-gray-600 mb-6">
                <p>
                  You can set your cookie preferences specifically for our website using the controls below. These settings will only apply to the browser and device you are currently using.
                </p>
              </div>
              
              <div className="space-y-4">
                {[
                  { id: "essential", label: "Essential Cookies", description: "Always active and necessary for the website to function properly", required: true },
                  { id: "performance", label: "Performance & Functionality", description: "Help us enhance the performance and functionality of our website" },
                  { id: "analytics", label: "Analytics & Customization", description: "Allow us to understand how visitors interact with our website" },
                  { id: "advertising", label: "Advertising", description: "Allow us to provide you with relevant advertisements" }
                ].map((cookie, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{cookie.label}</h3>
                      <p className="text-sm text-gray-600">{cookie.description}</p>
                    </div>
                    <div className="ml-4">
                      {cookie.required ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Always Active
                        </span>
                      ) : (
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" id={cookie.id} className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-willtank-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-willtank-500"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="outline">Reject All</Button>
                <Button>Accept All</Button>
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
                  If you have any questions about our use of cookies or other technologies, please contact us at:
                </p>
                <p className="font-medium">
                  privacy@willtank.com<br />
                  WillTank, Inc.<br />
                  123 Legal Avenue, Suite 500<br />
                  San Francisco, CA 94105<br />
                  (800) WILL-TANK
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
