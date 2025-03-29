
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { Code, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function API() {
  return (
    <Layout>
      <div className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center mb-8">
            <Link to="/corporate/documentation" className="text-gray-500 hover:text-gray-700 flex items-center">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Documentation
            </Link>
          </div>
          
          <div className="grid md:grid-cols-4 gap-10">
            <div className="md:col-span-1">
              <div className="sticky top-20">
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
                  <h3 className="font-medium text-lg mb-3">On this page</h3>
                  <ul className="space-y-2 text-sm">
                    <li><a href="#overview" className="text-gray-600 hover:text-gray-900">Overview</a></li>
                    <li><a href="#authentication" className="text-gray-600 hover:text-gray-900">Authentication</a></li>
                    <li><a href="#documents-api" className="text-gray-600 hover:text-gray-900">Documents API</a></li>
                    <li><a href="#users-api" className="text-gray-600 hover:text-gray-900">Users API</a></li>
                    <li><a href="#webhooks" className="text-gray-600 hover:text-gray-900">Webhooks</a></li>
                    <li><a href="#rate-limits" className="text-gray-600 hover:text-gray-900">Rate Limits</a></li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-lg mb-3 flex items-center">
                    <Code className="h-5 w-5 mr-2 text-blue-600" />
                    In this section
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link to="/corporate/documentation/getting-started" className="text-gray-600 hover:text-gray-900">
                        Getting Started
                      </Link>
                    </li>
                    <li>
                      <Link to="/corporate/documentation/user-guides" className="text-gray-600 hover:text-gray-900">
                        User Guides
                      </Link>
                    </li>
                    <li className="bg-white px-3 py-2 rounded border border-blue-100">
                      <strong>API Reference</strong>
                    </li>
                    <li>
                      <Link to="/corporate/documentation/security" className="text-gray-600 hover:text-gray-900">
                        Data Security
                      </Link>
                    </li>
                    <li>
                      <Link to="/corporate/documentation/integrations" className="text-gray-600 hover:text-gray-900">
                        Integrations
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-3">
              <h1 className="text-3xl font-bold mb-6" id="overview">API Reference</h1>
              
              <div className="prose max-w-none">
                <p className="lead text-xl mb-8">
                  Complete documentation for the WillTank API for developers integrating with our platform.
                </p>
                
                <div className="bg-gray-100 p-4 rounded-lg mb-8">
                  <h3 className="font-medium mb-2">Base URL</h3>
                  <code className="bg-gray-800 text-white px-3 py-2 rounded block overflow-x-auto">
                    https://api.willtank.com/v2
                  </code>
                </div>
                
                <h2 id="authentication" className="text-2xl font-semibold mt-12 mb-4">Authentication</h2>
                <p>
                  All API requests require authentication using API keys. There are two types of authentication:
                </p>
                
                <h3 className="text-xl font-medium mt-6 mb-3">API Key Authentication</h3>
                <p>
                  For server-to-server integrations, use API key authentication:
                </p>
                <div className="bg-gray-100 p-4 rounded-lg my-4">
                  <h4 className="font-medium mb-2">Request Header</h4>
                  <code className="bg-gray-800 text-white px-3 py-2 rounded block overflow-x-auto">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>
                
                <h3 className="text-xl font-medium mt-6 mb-3">OAuth 2.0</h3>
                <p>
                  For user-context applications, use OAuth 2.0:
                </p>
                <ol className="list-decimal pl-6 space-y-3 my-4">
                  <li>Redirect users to <code>https://auth.willtank.com/oauth/authorize</code></li>
                  <li>User authenticates and grants permissions</li>
                  <li>User is redirected back with an authorization code</li>
                  <li>Exchange the code for an access token</li>
                  <li>Use the access token in API requests</li>
                </ol>
                
                <div className="bg-gray-100 p-4 rounded-lg my-4">
                  <h4 className="font-medium mb-2">Token Request Example</h4>
                  <code className="bg-gray-800 text-white px-3 py-2 rounded block overflow-x-auto whitespace-pre">
{`POST https://auth.willtank.com/oauth/token
Content-Type: application/json

{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "code": "AUTHORIZATION_CODE",
  "grant_type": "authorization_code",
  "redirect_uri": "YOUR_REDIRECT_URI"
}`}
                  </code>
                </div>
                
                <h2 id="documents-api" className="text-2xl font-semibold mt-12 mb-4">Documents API</h2>
                <p>
                  The Documents API allows you to manage all estate planning documents:
                </p>
                
                <h3 className="text-xl font-medium mt-6 mb-3">Endpoints</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 my-4">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">GET</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm"><code>/documents</code></td>
                        <td className="px-4 py-3 text-sm">List all documents</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">GET</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm"><code>/documents/{"{id}"}</code></td>
                        <td className="px-4 py-3 text-sm">Get a specific document</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">POST</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm"><code>/documents</code></td>
                        <td className="px-4 py-3 text-sm">Create a new document</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">PUT</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm"><code>/documents/{"{id}"}</code></td>
                        <td className="px-4 py-3 text-sm">Update a document</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">DELETE</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm"><code>/documents/{"{id}"}</code></td>
                        <td className="px-4 py-3 text-sm">Delete a document</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">GET</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm"><code>/documents/{"{id}"}/versions</code></td>
                        <td className="px-4 py-3 text-sm">List document versions</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">POST</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm"><code>/documents/{"{id}"}/share</code></td>
                        <td className="px-4 py-3 text-sm">Share a document</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <h2 id="users-api" className="text-2xl font-semibold mt-12 mb-4">Users API</h2>
                <p>
                  The Users API manages user accounts and profiles:
                </p>
                
                <h3 className="text-xl font-medium mt-6 mb-3">Endpoints</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 my-4">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">GET</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm"><code>/users/me</code></td>
                        <td className="px-4 py-3 text-sm">Get current user profile</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">PUT</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm"><code>/users/me</code></td>
                        <td className="px-4 py-3 text-sm">Update user profile</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">GET</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm"><code>/users/me/beneficiaries</code></td>
                        <td className="px-4 py-3 text-sm">List beneficiaries</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">POST</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm"><code>/users/me/beneficiaries</code></td>
                        <td className="px-4 py-3 text-sm">Add a beneficiary</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">GET</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm"><code>/users/me/executors</code></td>
                        <td className="px-4 py-3 text-sm">List executors</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">POST</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm"><code>/users/me/executors</code></td>
                        <td className="px-4 py-3 text-sm">Add an executor</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <h2 id="webhooks" className="text-2xl font-semibold mt-12 mb-4">Webhooks</h2>
                <p>
                  Webhooks allow you to receive real-time notifications about events:
                </p>
                
                <h3 className="text-xl font-medium mt-6 mb-3">Setting Up Webhooks</h3>
                <ol className="list-decimal pl-6 space-y-3 my-4">
                  <li>Register a webhook URL in your developer dashboard</li>
                  <li>Select the events you want to subscribe to</li>
                  <li>Configure your endpoint to receive and process webhook events</li>
                  <li>Verify webhook signatures for security</li>
                </ol>
                
                <h3 className="text-xl font-medium mt-6 mb-3">Event Types</h3>
                <ul className="list-disc pl-6 space-y-2 my-3">
                  <li><code>document.created</code> - A new document is created</li>
                  <li><code>document.updated</code> - A document is updated</li>
                  <li><code>document.shared</code> - A document is shared</li>
                  <li><code>document.signed</code> - A document is signed</li>
                  <li><code>user.updated</code> - User profile is updated</li>
                  <li><code>executor.added</code> - An executor is added</li>
                  <li><code>beneficiary.added</code> - A beneficiary is added</li>
                </ul>
                
                <h2 id="rate-limits" className="text-2xl font-semibold mt-12 mb-4">Rate Limits</h2>
                <p>
                  API requests are subject to rate limiting:
                </p>
                <ul className="list-disc pl-6 space-y-2 my-3">
                  <li>Standard Plan: 60 requests per minute</li>
                  <li>Professional Plan: 300 requests per minute</li>
                  <li>Enterprise Plan: Custom limits</li>
                </ul>
                <p>
                  Rate limit headers are included in API responses:
                </p>
                <div className="bg-gray-100 p-4 rounded-lg my-4">
                  <code className="bg-gray-800 text-white px-3 py-2 rounded block overflow-x-auto whitespace-pre">
{`X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1628451143`}
                  </code>
                </div>
                <p>
                  If you exceed rate limits, you'll receive a 429 (Too Many Requests) response. Implement exponential backoff in your client to handle rate limiting gracefully.
                </p>
              </div>
              
              <div className="border-t border-gray-200 mt-12 pt-8 flex justify-between">
                <Link to="/corporate/documentation/user-guides">
                  <Button variant="outline" className="flex items-center">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous: User Guides
                  </Button>
                </Link>
                <Link to="/corporate/documentation/security">
                  <Button className="flex items-center">
                    Next: Data Security
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
