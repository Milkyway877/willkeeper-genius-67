import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Copy, CheckCircle, Search, ChevronRight, ChevronDown, Lock, Clock, AlertTriangle, Server, RefreshCw, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function Documentation() {
  const [copied, setCopied] = useState(false);
  const [expandedItem, setExpandedItem] = useState('authentication');

  const toggleItem = (item: string) => {
    if (expandedItem === item) {
      setExpandedItem('');
    } else {
      setExpandedItem(item);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const codeSnippets = {
    authentication: `const willTank = new WillTankAPI({
  apiKey: 'your_api_key',
  environment: 'sandbox' // or 'production'
});`,
    
    createWill: `// Create a new will
const newWill = await willTank.wills.create({
  clientId: 'client_12345',
  templateId: 'template_standard',
  data: {
    testator: {
      fullName: 'John Smith',
      dateOfBirth: '1980-01-15',
      address: {
        line1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US'
      }
    },
    executors: [
      {
        fullName: 'Jane Smith',
        relationship: 'Spouse',
        email: 'jane@example.com'
      }
    ],
    // Additional will content...
  }
});

console.log('Will created with ID:', newWill.id);`,
    
    retrieveWill: `// Retrieve a will by ID
const will = await willTank.wills.retrieve('will_74ad236c');

console.log('Will details:', will);`,
    
    updateWill: `// Update an existing will
const updatedWill = await willTank.wills.update('will_74ad236c', {
  data: {
    executors: [
      {
        fullName: 'Jane Smith',
        relationship: 'Spouse',
        email: 'jane.smith@example.com' // Updated email
      },
      {
        fullName: 'Robert Johnson',
        relationship: 'Brother',
        email: 'robert@example.com'
      }
    ]
    // Other fields to update...
  }
});

console.log('Will updated:', updatedWill);`,
    
    listWills: `// List all wills for a client
const willsList = await willTank.wills.list({
  clientId: 'client_12345',
  limit: 10,
  status: 'active'
});

console.log('Client wills:', willsList.data);
console.log('Pagination:', willsList.pagination);`,
    
    generateDocument: `// Generate a PDF document for a will
const document = await willTank.documents.generate({
  willId: 'will_74ad236c',
  format: 'pdf',
  includeSignaturePage: true
});

console.log('Document URL:', document.url);
console.log('Document expiration:', document.expiresAt);`,
    
    webhook: `// Sample webhook handler (Express.js)
app.post('/api/willtank-webhook', (req, res) => {
  const signature = req.headers['x-willtank-signature'];
  
  // Verify webhook signature
  const isValid = willTank.webhooks.verifySignature(
    signature,
    req.body,
    'your_webhook_secret'
  );
  
  if (!isValid) {
    return res.status(400).send('Invalid signature');
  }
  
  const event = req.body;
  
  switch (event.type) {
    case 'will.created':
      console.log('Will created:', event.data.willId);
      // Handle will creation event
      break;
    case 'will.updated':
      console.log('Will updated:', event.data.willId);
      // Handle will update event
      break;
    case 'will.signed':
      console.log('Will signed:', event.data.willId);
      // Handle will signing event
      break;
    // Handle other event types...
  }
  
  res.status(200).send('Webhook received');
});`
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4 pt-6 hidden lg:block">
            <div className="sticky top-24">
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search documentation..." 
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-willtank-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <a href="#getting-started" className="block px-4 py-2 text-willtank-600 font-medium hover:bg-gray-50 rounded-md">Getting Started</a>
                <a href="#authentication" className="block px-4 py-2 font-medium hover:bg-gray-50 rounded-md">Authentication</a>
                <a href="#rate-limits" className="block px-4 py-2 font-medium hover:bg-gray-50 rounded-md">Rate Limits</a>
                <a href="#api-reference" className="block px-4 py-2 font-medium hover:bg-gray-50 rounded-md">API Reference</a>
                <div className="pl-4">
                  <a href="#wills" className="block px-4 py-2 text-sm hover:bg-gray-50 rounded-md">Wills</a>
                  <a href="#templates" className="block px-4 py-2 text-sm hover:bg-gray-50 rounded-md">Templates</a>
                  <a href="#executors" className="block px-4 py-2 text-sm hover:bg-gray-50 rounded-md">Executors</a>
                  <a href="#documents" className="block px-4 py-2 text-sm hover:bg-gray-50 rounded-md">Documents</a>
                  <a href="#webhooks" className="block px-4 py-2 text-sm hover:bg-gray-50 rounded-md">Webhooks</a>
                </div>
                <a href="#white-labeling" className="block px-4 py-2 font-medium hover:bg-gray-50 rounded-md">White Labeling</a>
                <a href="#sdk-libraries" className="block px-4 py-2 font-medium hover:bg-gray-50 rounded-md">SDK Libraries</a>
                <a href="#security" className="block px-4 py-2 font-medium hover:bg-gray-50 rounded-md">Security</a>
                <a href="#support" className="block px-4 py-2 font-medium hover:bg-gray-50 rounded-md">Support</a>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <main className="lg:w-3/4 pt-6 pb-16">
            <div className="space-y-12">
              {/* Hero section */}
              <motion.section
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <div className="mb-8">
                  <Link to="/corporate" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
                    <ChevronRight size={16} className="rotate-180 mr-1" />
                    Back to Corporate
                  </Link>
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">WillTank API Documentation</h1>
                  <p className="text-xl text-gray-600 mb-6">
                    Comprehensive documentation for integrating the WillTank API into your applications.
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <Button>
                      <BookOpen className="mr-2" size={18} />
                      Quick Start Guide
                    </Button>
                    <Button variant="secondary">
                      <Server className="mr-2" size={18} />
                      API Reference
                    </Button>
                  </div>
                </div>
                
                <Alert className="bg-blue-50 border border-blue-100 text-blue-800">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>API Version Notice</AlertTitle>
                  <AlertDescription>
                    You're viewing documentation for WillTank API v1. We recommend using this stable version for all integrations.
                  </AlertDescription>
                </Alert>
              </motion.section>
              
              {/* Getting Started */}
              <motion.section
                id="getting-started"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
                <p className="text-gray-600 mb-6">
                  The WillTank API allows you to integrate our estate planning services into your application. This documentation will guide you through the process of setting up and using our API.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-medium text-lg mb-2">1. Register for an API Key</h3>
                    <p className="text-gray-600 mb-4">
                      Create a developer account and generate API keys through the WillTank Developer Portal.
                    </p>
                    <Button variant="secondary" size="sm">
                      Visit Developer Portal
                    </Button>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-medium text-lg mb-2">2. Choose Your Integration Method</h3>
                    <p className="text-gray-600 mb-4">
                      Decide whether to use our SDK libraries or make direct REST API calls to our endpoints.
                    </p>
                    <Button variant="secondary" size="sm">
                      View SDK Libraries
                    </Button>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-medium text-lg mb-2">3. Test in Sandbox Environment</h3>
                    <p className="text-gray-600 mb-4">
                      Use our sandbox environment to test your integration without affecting production data.
                    </p>
                    <Button variant="secondary" size="sm">
                      Sandbox Guide
                    </Button>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-medium text-lg mb-2">4. Go Live with Production</h3>
                    <p className="text-gray-600 mb-4">
                      When you're ready, switch to production API keys and start serving real customers.
                    </p>
                    <Button variant="secondary" size="sm">
                      Production Checklist
                    </Button>
                  </div>
                </div>
              </motion.section>
              
              {/* Authentication */}
              <motion.section
                id="authentication"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <h2 className="text-2xl font-bold mb-4">Authentication</h2>
                <p className="text-gray-600 mb-6">
                  WillTank API uses API keys for authentication. You can generate API keys from your developer dashboard.
                </p>
                
                <div className="mb-6">
                  <h3 className="font-medium text-lg mb-3">API Key Types</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-willtank-100 p-2 rounded-full text-willtank-600 mt-1">
                          <Lock size={16} />
                        </div>
                        <div>
                          <h4 className="font-medium">Public Key</h4>
                          <p className="text-sm text-gray-600">
                            Used for client-side operations. Can be safely included in front-end code.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-willtank-100 p-2 rounded-full text-willtank-600 mt-1">
                          <Lock size={16} />
                        </div>
                        <div>
                          <h4 className="font-medium">Secret Key</h4>
                          <p className="text-sm text-gray-600">
                            Used for server-side operations. Must be kept secure and never exposed to clients.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900 text-white p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">API Authentication Example</span>
                    <button 
                      className="text-xs flex items-center gap-1 text-gray-400 hover:text-white"
                      onClick={() => copyToClipboard(codeSnippets.authentication)}
                    >
                      {copied ? (
                        <>
                          <CheckCircle size={14} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy code
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                    {codeSnippets.authentication}
                  </pre>
                </div>
                
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertTitle>Security Best Practice</AlertTitle>
                  <AlertDescription>
                    Never hardcode API keys in your client-side code. Use environment variables or a secure configuration manager.
                  </AlertDescription>
                </Alert>
              </motion.section>
              
              {/* Rate Limits */}
              <motion.section
                id="rate-limits"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <h2 className="text-2xl font-bold mb-4">Rate Limits</h2>
                <p className="text-gray-600 mb-6">
                  To ensure stable service for all users, the WillTank API implements rate limiting on API requests. Exceeding these limits will result in HTTP 429 (Too Many Requests) errors.
                </p>
                
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Plan</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Requests per minute</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Requests per day</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Burst capacity</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-200 px-4 py-2">Starter</td>
                        <td className="border border-gray-200 px-4 py-2">60</td>
                        <td className="border border-gray-200 px-4 py-2">10,000</td>
                        <td className="border border-gray-200 px-4 py-2">120</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-200 px-4 py-2">Business</td>
                        <td className="border border-gray-200 px-4 py-2">300</td>
                        <td className="border border-gray-200 px-4 py-2">50,000</td>
                        <td className="border border-gray-200 px-4 py-2">500</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 px-4 py-2">Enterprise</td>
                        <td className="border border-gray-200 px-4 py-2">1,000+</td>
                        <td className="border border-gray-200 px-4 py-2">Unlimited</td>
                        <td className="border border-gray-200 px-4 py-2">2,000+</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 bg-willtank-100 p-2 rounded-full text-willtank-600">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Handling Rate Limits</h3>
                    <p className="text-gray-600 mb-2">
                      When you receive a 429 response, the headers will include:
                    </p>
                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                      <li><code className="bg-gray-100 px-1 py-0.5 rounded">X-RateLimit-Limit</code>: Maximum requests per window</li>
                      <li><code className="bg-gray-100 px-1 py-0.5 rounded">X-RateLimit-Remaining</code>: Remaining requests in current window</li>
                      <li><code className="bg-gray-100 px-1 py-0.5 rounded">X-RateLimit-Reset</code>: Time (in seconds) until the rate limit resets</li>
                    </ul>
                  </div>
                </div>
              </motion.section>
              
              {/* API Reference */}
              <motion.section
                id="api-reference"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <h2 className="text-2xl font-bold mb-4">API Reference</h2>
                <p className="text-gray-600 mb-6">
                  Explore the complete WillTank API endpoints and learn how to interact with our service.
                </p>
                
                <Tabs defaultValue="wills" className="mb-10">
                  <TabsList className="grid grid-cols-5">
                    <TabsTrigger value="wills">Wills</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="executors">Executors</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="wills" className="mt-6">
                    <div id="wills" className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Will Objects</h3>
                        <p className="text-gray-600 mb-4">
                          Will objects represent a single will document in the WillTank system. They contain all information about a will, including testator details, executors, and assets.
                        </p>
                        
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h4 className="font-medium mb-2">Will Object Properties</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-2 px-4">Property</th>
                                  <th className="text-left py-2 px-4">Type</th>
                                  <th className="text-left py-2 px-4">Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b">
                                  <td className="py-2 px-4 font-mono">id</td>
                                  <td className="py-2 px-4">string</td>
                                  <td className="py-2 px-4">Unique identifier for the will</td>
                                </tr>
                                <tr className="border-b">
                                  <td className="py-2 px-4 font-mono">clientId</td>
                                  <td className="py-2 px-4">string</td>
                                  <td className="py-2 px-4">Identifier for the client this will belongs to</td>
                                </tr>
                                <tr className="border-b">
                                  <td className="py-2 px-4 font-mono">templateId</td>
                                  <td className="py-2 px-4">string</td>
                                  <td className="py-2 px-4">Template used to create the will</td>
                                </tr>
                                <tr className="border-b">
                                  <td className="py-2 px-4 font-mono">status</td>
                                  <td className="py-2 px-4">string</td>
                                  <td className="py-2 px-4">Current status (draft, active, signed, revoked)</td>
                                </tr>
                                <tr className="border-b">
                                  <td className="py-2 px-4 font-mono">data</td>
                                  <td className="py-2 px-4">object</td>
                                  <td className="py-2 px-4">All will content and structure</td>
                                </tr>
                                <tr className="border-b">
                                  <td className="py-2 px-4 font-mono">createdAt</td>
                                  <td className="py-2 px-4">timestamp</td>
                                  <td className="py-2 px-4">When the will was created</td>
                                </tr>
                                <tr>
                                  <td className="py-2 px-4 font-mono">updatedAt</td>
                                  <td className="py-2 px-4">timestamp</td>
                                  <td className="py-2 px-4">When the will was last updated</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Create a Will</h3>
                        <div className="bg-gray-100 p-3 rounded mb-3 flex justify-between">
                          <code className="font-mono">POST /api/v1/wills</code>
                          <span className="text-xs bg-green-100 text-green-800 rounded px-2 py-1">201 Created</span>
                        </div>
                        
                        <div className="bg-gray-900 text-white p-4 rounded-lg mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-sm">Create Will Example</span>
                            <button 
                              className="text-xs flex items-center gap-1 text-gray-400 hover:text-white"
                              onClick={() => copyToClipboard(codeSnippets.createWill)}
                            >
                              {copied ? (
                                <>
                                  <CheckCircle size={14} />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy size={14} />
                                  Copy code
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                            {codeSnippets.createWill}
                          </pre>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Retrieve a Will</h3>
                        <div className="bg-gray-100 p-3 rounded mb-3 flex justify-between">
                          <code className="font-mono">GET /api/v1/wills/:id</code>
                          <span className="text-xs bg-green-100 text-green-800 rounded px-2 py-1">200 OK</span>
                        </div>
                        
                        <div className="bg-gray-900 text-white p-4 rounded-lg mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-sm">Retrieve Will Example</span>
                            <button 
                              className="text-xs flex items-center gap-1 text-gray-400 hover:text-white"
                              onClick={() => copyToClipboard(codeSnippets.retrieveWill)}
                            >
                              {copied ? (
                                <>
                                  <CheckCircle size={14} />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy size={14} />
                                  Copy code
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                            {codeSnippets.retrieveWill}
                          </pre>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Update a Will</h3>
                        <div className="bg-gray-100 p-3 rounded mb-3 flex justify-between">
                          <code className="font-mono">PUT /api/v1/wills/:id</code>
                          <span className="text-xs bg-green-100 text-green-800 rounded px-2 py-1">200 OK</span>
                        </div>
                        
                        <div className="bg-gray-900 text-white p-4 rounded-lg mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-sm">Update Will Example</span>
                            <button 
                              className="text-xs flex items-center gap-1 text-gray-400 hover:text-white"
                              onClick={() => copyToClipboard(codeSnippets.updateWill)}
                            >
                              {copied ? (
                                <>
                                  <CheckCircle size={14} />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy size={14} />
                                  Copy code
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                            {codeSnippets.updateWill}
                          </pre>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg mb-2">List Wills</h3>
                        <div className="bg-gray-100 p-3 rounded mb-3 flex justify-between">
                          <code className="font-mono">GET /api/v1/wills</code>
                          <span className="text-xs bg-green-100 text-green-800 rounded px-2 py-1">200 OK</span>
                        </div>
                        
                        <div className="bg-gray-900 text-white p-4 rounded-lg mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-sm">List Wills Example</span>
                            <button 
                              className="text-xs flex items-center gap-1 text-gray-400 hover:text-white"
                              onClick={() => copyToClipboard(codeSnippets.listWills)}
                            >
                              {copied ? (
                                <>
                                  <CheckCircle size={14} />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy size={14} />
                                  Copy code
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                            {codeSnippets.listWills}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="templates" id="templates" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold mb-2">Will Templates</h3>
                      <p className="text-gray-600">
                        Templates provide pre-defined will structures that can be customized for specific client needs.
                      </p>
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Template Documentation</AlertTitle>
                        <AlertDescription>
                          Detailed template API documentation is available in the full API reference.
                        </AlertDescription>
                      </Alert>
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Available Template Types</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          <li><strong>Standard Will</strong> - Basic will template suitable for most individuals</li>
                          <li><strong>Married Couple</strong> - Specialized will template for married couples</li>
                          <li><strong>Business Owner</strong> - Template with provisions for business assets</li>
                          <li><strong>Digital Assets</strong> - Template with special focus on digital property</li>
                          <li><strong>Custom</strong> - Fully customizable template structure</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="executors" id="executors" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold mb-2">Executors Management</h3>
                      <p className="text-gray-600">
                        The executors API allows you to manage the people designated to execute a will.
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Executor Object Properties</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 px-4">Property</th>
                                <th className="text-left py-2 px-4">Type</th>
                                <th className="text-left py-2 px-4">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="py-2 px-4 font-mono">id</td>
                                <td className="py-2 px-4">string</td>
                                <td className="py-2 px-4">Unique identifier for the executor</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 px-4 font-mono">willId</td>
                                <td className="py-2 px-4">string</td>
                                <td className="py-2 px-4">ID of the will this executor is associated with</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 px-4 font-mono">fullName</td>
                                <td className="py-2 px-4">string</td>
                                <td className="py-2 px-4">Full name of the executor</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 px-4 font-mono">email</td>
                                <td className="py-2 px-4">string</td>
                                <td className="py-2 px-4">Contact email for the executor</td>
                              </tr>
                              <tr>
                                <td className="py-2 px-4 font-mono">relationship</td>
                                <td className="py-2 px-4">string</td>
                                <td className="py-2 px-4">Relationship to the testator</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-gray-100 p-3 rounded">
                          <h5 className="font-medium mb-1">Add Executor</h5>
                          <code className="text-sm font-mono">POST /api/v1/wills/:id/executors</code>
                        </div>
                        <div className="bg-gray-100 p-3 rounded">
                          <h5 className="font-medium mb-1">Remove Executor</h5>
                          <code className="text-sm font-mono">DELETE /api/v1/executors/:id</code>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="documents" id="documents" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold mb-2">Document Generation</h3>
                      <p className="text-gray-600">
                        Generate legal documents from wills in various formats for signing and storage.
                      </p>
                      
                      <div className="bg-gray-900 text-white p-4 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400 text-sm">Generate Document Example</span>
                          <button 
                            className="text-xs flex items-center gap-1 text-gray-400 hover:text-white"
                            onClick={() => copyToClipboard(codeSnippets.generateDocument)}
                          >
                            {copied ? (
                              <>
                                <CheckCircle size={14} />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                Copy code
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                          {codeSnippets.generateDocument}
                        </pre>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Supported Document Formats</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <span className="font-medium">PDF</span>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <span className="font-medium">DOCX</span>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <span className="font-medium">HTML</span>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <span className="font-medium">JSON</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="webhooks" id="webhooks" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold mb-2">Webhooks</h3>
                      <p className="text-gray-600">
                        Webhooks allow your application to receive real-time notifications when events occur in the WillTank system.
                      </p>
                      
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="font-medium mb-2">Supported Webhook Events</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <code className="bg-gray-200 px-2 py-0.5 rounded text-sm inline-block min-w-24">will.created</code>
                            <span>Triggered when a new will is created</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <code className="bg-gray-200 px-2 py-0.5 rounded text-sm inline-block min-w-24">will.updated</code>
                            <span>Triggered when a will is updated</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <code className="bg-gray-200 px-2 py-0.5 rounded text-sm inline-block min-w-24">will.signed</code>
                            <span>Triggered when a will is signed by the testator</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <code className="bg-gray-200 px-2 py-0.5 rounded text-sm inline-block min-w-24">will.witnessed</code>
                            <span>Triggered when a will is witnessed</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <code className="bg-gray-200 px-2 py-0.5 rounded text-sm inline-block min-w-24">will.revoked</code>
                            <span>Triggered when a will is revoked</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <code className="bg-gray-200 px-2 py-0.5 rounded text-sm inline-block min-w-24">executor.added</code>
                            <span>Triggered when an executor is added to a will</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <code className="bg-gray-200 px-2 py-0.5 rounded text-sm inline-block min-w-24">document.generated</code>
                            <span>Triggered when a document is generated</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-900 text-white p-4 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400 text-sm">Webhook Handler Example</span>
                          <button 
                            className="text-xs flex items-center gap-1 text-gray-400 hover:text-white"
                            onClick={() => copyToClipboard(codeSnippets.webhook)}
                          >
                            {copied ? (
                              <>
                                <CheckCircle size={14} />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                Copy code
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                          {codeSnippets.webhook}
                        </pre>
                      </div>
                      
                      <Alert>
                        <RefreshCw className="h-4 w-4" />
                        <AlertTitle>Retry Policy</AlertTitle>
                        <AlertDescription>
                          If your endpoint returns a non-2xx status code, we'll retry the webhook delivery up to 5 times with exponential backoff.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.section>
              
              {/* White Labeling */}
              <motion.section
                id="white-labeling"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <h2 className="text-2xl font-bold mb-4">White Labeling</h2>
                <p className="text-gray-600 mb-6">
                  WillTank's API can be fully white-labeled to match your brand identity. This section covers the customization options available.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-medium text-lg mb-3">Visual Customization</h3>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-1">Branding</h4>
                        <p className="text-sm text-gray-600">
                          Customize logos, color schemes, fonts, and other visual elements to match your brand identity.
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-1">Custom CSS</h4>
                        <p className="text-sm text-gray-600">
                          Apply your own CSS stylesheets to fully control the appearance of web interfaces.
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-1">Document Templates</h4>
                        <p className="text-sm text-gray-600">
                          Customize the look and feel of generated documents, including letterheads and signatures.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-3">Integration Options</h3>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-1">Custom Domain</h4>
                        <p className="text-sm text-gray-600">
                          Host the white-labeled interface on your own domain for a seamless experience.
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-1">Email Customization</h4>
                        <p className="text-sm text-gray-600">
                          Customize all transactional emails with your branding and sender information.
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-1">Custom Terminology</h4>
                        <p className="text-sm text-gray-600">
                          Rename elements in the user interface to match your organization's terminology.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>White Labeling Requirements</AlertTitle>
                  <AlertDescription>
                    White labeling is available on Business and Enterprise plans only. Contact our sales team for details.
                  </AlertDescription>
                </Alert>
              </motion.section>
              
              {/* SDK Libraries */}
              <motion.section
                id="sdk-libraries"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <h2 className="text-2xl font-bold mb-4">SDK Libraries</h2>
                <p className="text-gray-600 mb-6">
                  We provide official client libraries for popular programming languages to make integration easy.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h3 className="font-medium mb-2">JavaScript</h3>
                    <div className="flex justify-center gap-2">
                      <Button variant="secondary" size="sm">Docs</Button>
                      <Button variant="secondary" size="sm">GitHub</Button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h3 className="font-medium mb-2">Python</h3>
                    <div className="flex justify-center gap-2">
                      <Button variant="secondary" size="sm">Docs</Button>
                      <Button variant="secondary" size="sm">GitHub</Button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h3 className="font-medium mb-2">Ruby</h3>
                    <div className="flex justify-center gap-2">
                      <Button variant="secondary" size="sm">Docs</Button>
                      <Button variant="secondary" size="sm">GitHub</Button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h3 className="font-medium mb-2">PHP</h3>
                    <div className="flex justify-center gap-2">
                      <Button variant="secondary" size="sm">Docs</Button>
                      <Button variant="secondary" size="sm">GitHub</Button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h3 className="font-medium mb-2">Java</h3>
                    <div className="flex justify-center gap-2">
                      <Button variant="secondary" size="sm">Docs</Button>
                      <Button variant="secondary" size="sm">GitHub</Button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h3 className="font-medium mb-2">.NET</h3>
                    <div className="flex justify-center gap-2">
                      <Button variant="secondary" size="sm">Docs</Button>
                      <Button variant="secondary" size="sm">GitHub</Button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h3 className="font-medium mb-2">Go</h3>
                    <div className="flex justify-center gap-2">
                      <Button variant="secondary" size="sm">Docs</Button>
                      <Button variant="secondary" size="sm">GitHub</Button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h3 className="font-medium mb-2">Swift</h3>
                    <div className="flex justify-center gap-2">
                      <Button variant="secondary" size="sm">Docs</Button>
                      <Button variant="secondary" size="sm">GitHub</Button>
                    </div>
                  </div>
                </div>
              </motion.section>
              
              {/* Security */}
              <motion.section
                id="security"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <h2 className="text-2xl font-bold mb-4">Security & Compliance</h2>
                <p className="text-gray-600 mb-6">
                  Security is at the core of our API design. We implement industry best practices to protect sensitive data.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-medium text-lg mb-3">Data Protection</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="text-green-600 mt-1">✓</div>
                        <div>
                          <span className="font-medium">End-to-End Encryption</span>
                          <p className="text-sm text-gray-600">All data is encrypted in transit and at rest using AES-256 encryption.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="text-green-600 mt-1">✓</div>
                        <div>
                          <span className="font-medium">Secure Key Management</span>
                          <p className="text-sm text-gray-600">Encryption keys are stored securely using HSMs (Hardware Security Modules).</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="text-green-600 mt-1">✓</div>
                        <div>
                          <span className="font-medium">Data Isolation</span>
                          <p className="text-sm text-gray-600">Multi-tenant architecture with strict data segregation between clients.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-medium text-lg mb-3">Compliance</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="text-green-600 mt-1">✓</div>
                        <div>
                          <span className="font-medium">SOC 2 Type II Certified</span>
                          <p className="text-sm text-gray-600">Our systems and processes are regularly audited for security and compliance.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="text-green-600 mt-1">✓</div>
                        <div>
                          <span className="font-medium">GDPR Compliant</span>
                          <p className="text-sm text-gray-600">Our systems are designed with privacy by design principles.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="text-green-600 mt-1">✓</div>
                        <div>
                          <span className="font-medium">Legal Document Compliance</span>
                          <p className="text-sm text-gray-600">All will templates are regularly reviewed by legal experts.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-medium text-lg mb-3">API Security Best Practices</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="text-green-600 mt-1">✓</div>
                          <div>
                            <span className="font-medium">TLS 1.2+ Required</span>
                            <p className="text-sm text-gray-600">All API requests must use HTTPS with TLS 1.2 or higher.</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="text-green-600 mt-1">✓</div>
                          <div>
                            <span className="font-medium">API Key Rotation</span>
                            <p className="text-sm text-gray-600">Regularly rotate your API keys to minimize security risks.</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="text-green-600 mt-1">✓</div>
                          <div>
                            <span className="font-medium">IP Whitelisting</span>
                            <p className="text-sm text-gray-600">Restrict API access to specific IP addresses for added security.</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="text-green-600 mt-1">✓</div>
                          <div>
                            <span className="font-medium">Audit Logging</span>
                            <p className="text-sm text-gray-600">All API activities are logged for security and compliance purposes.</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.section>
              
              {/* Support */}
              <motion.section
                id="support"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <h2 className="text-2xl font-bold mb-4">Support & Resources</h2>
                <p className="text-gray-600 mb-6">
                  We're here to help you succeed with your integration. Take advantage of our support resources.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-medium text-lg mb-3">Developer Support</h3>
                    <p className="text-gray-600 mb-4">
                      Get help from our engineering team when you encounter technical challenges.
                    </p>
                    <Button variant="secondary" size="sm">Contact Support</Button>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-medium text-lg mb-3">Community Forum</h3>
                    <p className="text-gray-600 mb-4">
                      Connect with other developers and share integration experiences.
                    </p>
                    <Button variant="secondary" size="sm">Join Community</Button>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-medium text-lg mb-3">API Changelog</h3>
                    <p className="text-gray-600 mb-4">
                      Stay updated with the latest API features, improvements, and bug fixes.
                    </p>
                    <Button variant="secondary" size="sm">View Changelog</Button>
                  </div>
                </div>
                
                <div className="text-center py-6">
                  <h3 className="text-xl font-bold mb-4">Ready to start building?</h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Create your developer account to get instant access to API keys, documentation, and SDKs.
                  </p>
                  <Button size="lg">
                    Sign Up for Developer Access
                  </Button>
                </div>
              </motion.section>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
}
