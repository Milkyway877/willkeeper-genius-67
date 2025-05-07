
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Code, ArrowLeft, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function ApiReference() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const endpoints = [
    {
      name: "Authentication",
      description: "Authenticate and manage API access",
      methods: [
        {
          type: "POST",
          path: "/auth/token",
          description: "Get an access token",
          request: `
{
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "grant_type": "client_credentials"
}`,
          response: `
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}`
        },
        {
          type: "POST",
          path: "/auth/revoke",
          description: "Revoke an access token",
          request: `
{
  "token": "your_access_token"
}`,
          response: `
{
  "status": "success",
  "message": "Token revoked successfully"
}`
        }
      ]
    },
    {
      name: "Documents",
      description: "Manage document templates and content",
      methods: [
        {
          type: "GET",
          path: "/documents/templates",
          description: "List available document templates",
          request: "",
          response: `
{
  "templates": [
    {
      "id": "simple-will",
      "name": "Simple Will",
      "description": "Basic will template for straightforward estates",
      "category": "will"
    },
    {
      "id": "family-trust",
      "name": "Family Trust",
      "description": "Trust document for family asset protection",
      "category": "trust"
    }
  ]
}`
        },
        {
          type: "POST",
          path: "/documents/generate",
          description: "Generate a document from template",
          request: `
{
  "template_id": "simple-will",
  "data": {
    "testator_name": "John Smith",
    "testator_address": "123 Main St, Anytown, USA",
    "executor_name": "Jane Smith",
    "assets": [
      {
        "type": "real_estate",
        "description": "Primary residence",
        "beneficiary": "Jane Smith"
      }
    ]
  }
}`,
          response: `
{
  "document_id": "doc_12345",
  "status": "generated",
  "download_url": "https://api.willtank.com/documents/download/doc_12345"
}`
        }
      ]
    },
    {
      name: "Users",
      description: "Manage user accounts and permissions",
      methods: [
        {
          type: "GET",
          path: "/users/{user_id}",
          description: "Get user information",
          request: "",
          response: `
{
  "user_id": "usr_12345",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Smith",
  "subscription_tier": "premium",
  "created_at": "2023-03-15T08:12:31Z"
}`
        },
        {
          type: "POST",
          path: "/users/invite",
          description: "Invite a user to collaborate",
          request: `
{
  "email": "collaborator@example.com",
  "role": "viewer",
  "document_id": "doc_12345",
  "message": "Please review my estate plan"
}`,
          response: `
{
  "invite_id": "inv_78901",
  "status": "sent",
  "expires_at": "2023-04-15T08:12:31Z"
}`
        }
      ]
    },
    {
      name: "Webhooks",
      description: "Configure and manage webhook notifications",
      methods: [
        {
          type: "POST",
          path: "/webhooks",
          description: "Create a new webhook subscription",
          request: `
{
  "url": "https://your-app.com/webhooks/willtank",
  "events": ["document.updated", "verification.completed"],
  "secret": "your_webhook_secret"
}`,
          response: `
{
  "webhook_id": "whk_34567",
  "status": "active",
  "events": ["document.updated", "verification.completed"]
}`
        },
        {
          type: "GET",
          path: "/webhooks/{webhook_id}/deliveries",
          description: "List webhook delivery attempts",
          request: "",
          response: `
{
  "deliveries": [
    {
      "id": "del_23456",
      "webhook_id": "whk_34567",
      "event": "document.updated",
      "status": "delivered",
      "response_code": 200,
      "timestamp": "2023-03-15T10:14:22Z"
    }
  ]
}`
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 md:py-16 bg-gray-50">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="mb-8 flex items-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Link to="/documentation" className="mr-4">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Documentation
              </Button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">API Reference</h1>
          </motion.div>
          
          <motion.div 
            className="mb-10"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started with the WillTank API</h2>
              <p className="text-gray-700 mb-6">
                The WillTank API allows you to integrate our estate planning and document management 
                capabilities into your own applications. This reference provides details on available 
                endpoints, authentication methods, and example requests and responses.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="p-5">
                  <div className="flex gap-3 items-start mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Authentication</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    All API requests require authentication with an API key or OAuth token.
                    See the Authentication section for details.
                  </p>
                </Card>
                <Card className="p-5">
                  <div className="flex gap-3 items-start mb-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Rate Limits</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    API requests are limited to 60 requests per minute per API key.
                    Higher limits are available for enterprise customers.
                  </p>
                </Card>
                <Card className="p-5">
                  <div className="flex gap-3 items-start mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Response Format</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    All API responses are returned in JSON format with consistent
                    error handling and status codes.
                  </p>
                </Card>
              </div>
              
              <div className="border p-4 rounded-lg bg-gray-50 mb-8">
                <h3 className="text-lg font-semibold mb-2">Base URL</h3>
                <code className="block bg-gray-100 p-3 rounded border font-mono text-sm">
                  https://api.willtank.com/v1
                </code>
              </div>
              
              <h3 className="text-xl font-bold mb-4">Authentication</h3>
              <p className="mb-4">
                The WillTank API uses Bearer token authentication. To obtain a token:
              </p>
              <ol className="list-decimal list-inside space-y-2 mb-6">
                <li>Register for an API key in your WillTank dashboard under Developer Settings</li>
                <li>Exchange your API credentials for a token using the /auth/token endpoint</li>
                <li>Include the token in all API requests in the Authorization header</li>
              </ol>
              
              <div className="border p-4 rounded-lg bg-gray-50 mb-8">
                <h4 className="text-md font-semibold mb-2">Example Authorization Header</h4>
                <code className="block bg-gray-100 p-3 rounded border font-mono text-sm">
                  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                </code>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Tabs defaultValue={endpoints[0].name.toLowerCase()} className="w-full">
              <TabsList className="mb-6">
                {endpoints.map((endpoint, index) => (
                  <TabsTrigger key={index} value={endpoint.name.toLowerCase()}>
                    {endpoint.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {endpoints.map((endpoint, index) => (
                <TabsContent key={index} value={endpoint.name.toLowerCase()}>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{endpoint.name} API</h2>
                    <p className="text-gray-700 mb-8">{endpoint.description}</p>
                    
                    <div className="space-y-12">
                      {endpoint.methods.map((method, methodIndex) => (
                        <div key={methodIndex} className="border-t pt-8 first:border-t-0 first:pt-0">
                          <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${
                                  method.type === "GET" ? "bg-blue-100 text-blue-800" : 
                                  method.type === "POST" ? "bg-green-100 text-green-800" : 
                                  method.type === "PUT" ? "bg-yellow-100 text-yellow-800" :
                                  "bg-red-100 text-red-800"
                                }`}>
                                  {method.type}
                                </span>
                                <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                  {method.path}
                                </code>
                              </div>
                              <p className="text-gray-700">{method.description}</p>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-6 mt-6">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-500 mb-2">REQUEST</h4>
                              {method.request ? (
                                <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
                                  <code>{method.request}</code>
                                </pre>
                              ) : (
                                <p className="text-gray-500 italic">No request body needed</p>
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-500 mb-2">RESPONSE</h4>
                              <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
                                <code>{method.response}</code>
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
