
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Code, FileCode, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function API() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 md:py-16 bg-gray-50">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">WillTank API</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Integrate estate planning and digital legacy functionality directly into your applications with our powerful, secure API.
            </p>
          </motion.div>
          
          <motion.div
            className="mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Developer-First Design</h2>
                <p className="text-gray-600 mb-4">
                  Built with developers in mind, our RESTful API offers intuitive endpoints, comprehensive documentation, and flexible SDKs.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-blue-500 mr-2" />
                    RESTful architecture
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-blue-500 mr-2" />
                    JSON response format
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-blue-500 mr-2" />
                    Consistent error handling
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-blue-500 mr-2" />
                    SDKs for popular languages
                  </li>
                </ul>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
                  <FileCode className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Powerful Capabilities</h2>
                <p className="text-gray-600 mb-4">
                  Leverage our estate planning expertise and secure infrastructure in your own applications.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-green-500 mr-2" />
                    Will and trust generation
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-green-500 mr-2" />
                    Document storage and management
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-green-500 mr-2" />
                    Beneficiary management
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-green-500 mr-2" />
                    Verification workflows
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-green-500 mr-2" />
                    Future message delivery
                  </li>
                </ul>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Enterprise-Grade Security</h2>
                <p className="text-gray-600 mb-4">
                  Our API is built with the same security standards that protect our core platform.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-purple-500 mr-2" />
                    OAuth 2.0 authentication
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-purple-500 mr-2" />
                    End-to-end encryption
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-purple-500 mr-2" />
                    Rate limiting and abuse prevention
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-purple-500 mr-2" />
                    GDPR and SOC 2 compliance
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-purple-500 mr-2" />
                    Extensive audit logging
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2 p-8">
                  <h2 className="text-2xl font-bold mb-4">API Documentation</h2>
                  <p className="text-gray-600 mb-6">
                    Our comprehensive API documentation includes detailed endpoint references, code examples in multiple languages, 
                    authentication guides, and best practices for integration.
                  </p>
                  
                  <h3 className="text-lg font-semibold mb-2">Documentation Features:</h3>
                  <ul className="space-y-2 text-gray-600 mb-6">
                    <li className="flex items-center">
                      <ArrowRight className="h-4 w-4 text-willtank-500 mr-2" />
                      Interactive API explorer
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="h-4 w-4 text-willtank-500 mr-2" />
                      Code samples in 6 languages
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="h-4 w-4 text-willtank-500 mr-2" />
                      Request/response examples
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="h-4 w-4 text-willtank-500 mr-2" />
                      Authentication tutorial
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="h-4 w-4 text-willtank-500 mr-2" />
                      Rate limit guidelines
                    </li>
                  </ul>
                  
                  <Link to="/documentation/api">
                    <Button>View API Documentation</Button>
                  </Link>
                </div>
                
                <div className="md:w-1/2 bg-gray-900 p-8 text-white">
                  <h3 className="text-lg font-semibold mb-4">Example API Request</h3>
                  <pre className="bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
{`// Create a new will document
fetch('https://api.willtank.com/v1/documents', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    document_type: 'will',
    template_id: 'simple-will',
    testator: {
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    executor: {
      name: 'John Smith',
      relationship: 'spouse',
      email: 'john@example.com'
    },
    beneficiaries: [
      {
        name: 'Emily Smith',
        relationship: 'child',
        inheritance: 'equal_share'
      }
    ]
  })
})
.then(response => response.json())
.then(data => console.log(data))`}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
                <h2 className="text-2xl font-bold mb-4">Get API Access</h2>
                <p className="text-gray-600 mb-6">
                  Ready to integrate with WillTank? Create a developer account to get your API keys and start building.
                </p>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-willtank-100 text-willtank-700 rounded-full w-6 h-6 flex items-center justify-center mt-0.5 mr-3 font-semibold">1</div>
                    <div>
                      <h3 className="font-semibold">Create a Developer Account</h3>
                      <p className="text-gray-600 text-sm">Sign up for a WillTank developer account to access API keys and dashboard.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-willtank-100 text-willtank-700 rounded-full w-6 h-6 flex items-center justify-center mt-0.5 mr-3 font-semibold">2</div>
                    <div>
                      <h3 className="font-semibold">Choose Your API Plan</h3>
                      <p className="text-gray-600 text-sm">Select from developer, business, or enterprise API access tiers.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-willtank-100 text-willtank-700 rounded-full w-6 h-6 flex items-center justify-center mt-0.5 mr-3 font-semibold">3</div>
                    <div>
                      <h3 className="font-semibold">Generate API Credentials</h3>
                      <p className="text-gray-600 text-sm">Create API keys for development, staging, and production environments.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-willtank-100 text-willtank-700 rounded-full w-6 h-6 flex items-center justify-center mt-0.5 mr-3 font-semibold">4</div>
                    <div>
                      <h3 className="font-semibold">Start Building</h3>
                      <p className="text-gray-600 text-sm">Use our SDKs or direct API calls to integrate WillTank features.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Link to="/auth/signup">
                    <Button>Create Developer Account</Button>
                  </Link>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
                <h2 className="text-2xl font-bold mb-4">API Resources</h2>
                <p className="text-gray-600 mb-6">
                  Everything you need to successfully integrate with the WillTank platform.
                </p>
                <ul className="space-y-4">
                  <li>
                    <Link to="/documentation/api" className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                      <div className="mr-4 text-blue-500">
                        <FileCode className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">API Reference</h3>
                        <p className="text-gray-600 text-sm">Complete endpoint documentation with examples</p>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link to="/documentation/api#authentication" className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                      <div className="mr-4 text-green-500">
                        <Shield className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Authentication Guide</h3>
                        <p className="text-gray-600 text-sm">Learn how to authenticate API requests</p>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link to="/documentation/api#webhooks" className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                      <div className="mr-4 text-purple-500">
                        <Code className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Webhook Documentation</h3>
                        <p className="text-gray-600 text-sm">Set up event notifications for your application</p>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link to="/documentation/api#rate-limits" className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                      <div className="mr-4 text-orange-500">
                        <FileCode className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">SDK Downloads</h3>
                        <p className="text-gray-600 text-sm">Client libraries for multiple programming languages</p>
                      </div>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-gradient-to-br from-willtank-50 to-gray-50 rounded-2xl p-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="md:flex items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Need Enterprise API Solutions?</h2>
                <p className="text-gray-600 max-w-2xl">
                  Our enterprise API program includes custom rate limits, dedicated support, and integration assistance.
                  Contact our team to discuss your specific requirements.
                </p>
              </div>
              <Link to="/contact">
                <Button size="lg">Contact Sales</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
