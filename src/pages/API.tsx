import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { Code } from 'lucide-react';

export default function API() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const endpoints = [
    {
      method: "GET",
      path: "/api/v1/documents",
      description: "List all documents",
      authentication: "Bearer Token",
      response: `{
  "documents": [
    {
      "id": "doc_123abc",
      "title": "My Will",
      "created_at": "2023-03-15T14:30:00Z",
      "updated_at": "2023-05-20T09:15:22Z",
      "document_type": "will",
      "status": "active"
    },
    // ...more documents
  ],
  "pagination": {
    "total": 24,
    "page": 1,
    "per_page": 10
  }
}`
    },
    {
      method: "GET",
      path: "/api/v1/documents/:id",
      description: "Get document details",
      authentication: "Bearer Token",
      response: `{
  "id": "doc_123abc",
  "title": "My Will",
  "content": "...",
  "created_at": "2023-03-15T14:30:00Z",
  "updated_at": "2023-05-20T09:15:22Z",
  "document_type": "will",
  "status": "active",
  "metadata": {
    "executor_email": "executor@example.com",
    "beneficiaries": 3
  }
}`
    },
    {
      method: "POST",
      path: "/api/v1/documents",
      description: "Create a new document",
      authentication: "Bearer Token",
      request: `{
  "title": "New Will",
  "document_type": "will",
  "content": "...",
  "metadata": {
    "executor_email": "executor@example.com"
  }
}`,
      response: `{
  "id": "doc_456def",
  "title": "New Will",
  "created_at": "2023-06-10T11:22:33Z",
  "updated_at": "2023-06-10T11:22:33Z",
  "document_type": "will",
  "status": "draft"
}`
    },
    {
      method: "PUT",
      path: "/api/v1/documents/:id",
      description: "Update a document",
      authentication: "Bearer Token",
      request: `{
  "title": "Updated Will Title",
  "content": "...",
  "metadata": {
    "executor_email": "new-executor@example.com"
  }
}`,
      response: `{
  "id": "doc_123abc",
  "title": "Updated Will Title",
  "updated_at": "2023-06-12T15:30:45Z",
  "status": "draft"
}`
    },
    {
      method: "DELETE",
      path: "/api/v1/documents/:id",
      description: "Delete a document",
      authentication: "Bearer Token",
      response: `{
  "success": true,
  "message": "Document deleted successfully"
}`
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-12"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="inline-flex items-center gap-2 bg-willtank-50 text-willtank-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <Code size={16} />
                <span>Developer Resources</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">WillTank API Documentation</h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Build integrations with WillTank's powerful API to manage estate planning documents programmatically.
              </p>
            </motion.div>

            <motion.div 
              className="mb-16"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
                <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
                <p className="text-gray-600 mb-4">
                  The WillTank API allows you to programmatically access and manage estate planning documents. Follow these steps to start using the API:
                </p>
                
                <ol className="space-y-4 mb-8">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-willtank-100 text-willtank-700 flex items-center justify-center font-medium">1</span>
                    <div>
                      <h3 className="font-medium">Create an account</h3>
                      <p className="text-sm text-gray-600">
                        Sign up for a WillTank account if you don't already have one.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-willtank-100 text-willtank-700 flex items-center justify-center font-medium">2</span>
                    <div>
                      <h3 className="font-medium">Generate API keys</h3>
                      <p className="text-sm text-gray-600">
                        Navigate to the API section in your dashboard and generate an API key.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-willtank-100 text-willtank-700 flex items-center justify-center font-medium">3</span>
                    <div>
                      <h3 className="font-medium">Make your first request</h3>
                      <p className="text-sm text-gray-600">
                        Use your API key in the Authorization header to make authenticated requests.
                      </p>
                    </div>
                  </li>
                </ol>
                
                <div className="bg-gray-900 rounded-lg p-4 text-white mb-6 overflow-x-auto">
                  <pre className="text-sm">
                    <code>
{`curl -X GET \\
  https://api.willtank.com/v1/documents \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                    </code>
                  </pre>
                </div>
                
                <div className="bg-willtank-50 border border-willtank-100 rounded-lg p-4 text-gray-700">
                  <div className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-willtank-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">
                      <strong>Note:</strong> Keep your API keys secure. Do not share them in publicly accessible areas such as GitHub, client-side code, or public forums.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h2 className="text-2xl font-semibold mb-6">API Reference</h2>
              
              <div className="space-y-6">
                {endpoints.map((endpoint, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded ${
                          endpoint.method === "GET" ? "bg-blue-100 text-blue-800" :
                          endpoint.method === "POST" ? "bg-green-100 text-green-800" :
                          endpoint.method === "PUT" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="text-sm font-mono text-gray-800">{endpoint.path}</code>
                      </div>
                      <span className="text-sm text-gray-500">
                        Auth: {endpoint.authentication}
                      </span>
                    </div>
                    <div className="px-6 py-4">
                      <h3 className="font-medium mb-2">{endpoint.description}</h3>
                      
                      {endpoint.request && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Request Body</h4>
                          <div className="bg-gray-900 rounded-lg p-3 text-white overflow-x-auto">
                            <pre className="text-sm">
                              <code>{endpoint.request}</code>
                            </pre>
                          </div>
                        </div>
                      )}
                      
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Response</h4>
                      <div className="bg-gray-900 rounded-lg p-3 text-white overflow-x-auto">
                        <pre className="text-sm">
                          <code>{endpoint.response}</code>
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">Need more detailed documentation?</p>
                <Link to="/documentation" className="inline-flex items-center px-4 py-2 bg-willtank-500 text-white rounded-md hover:bg-willtank-600">
                  View Complete API Docs
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
