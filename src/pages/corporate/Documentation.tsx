import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { 
  ChevronDown,
  ChevronRight,
  Code,
  Copy,
  Check,
  Info,
  Shield,
  Lock,
  Key,
  RefreshCw,
  Clock,
  Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export default function Documentation() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const codeExamples = [
    {
      language: "javascript",
      title: "JavaScript/Node.js",
      code: `// Initialize the WillTank SDK with your API key
const WillTank = require('willtank-sdk');
const client = new WillTank({
  apiKey: 'YOUR_API_KEY',
  environment: 'production' // or 'sandbox' for testing
});

// Example: Create a new will
async function createWill() {
  try {
    const will = await client.wills.create({
      user_id: 'user_123',
      template_id: 'template_standard',
      data: {
        testator: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'US'
          }
        },
        executors: [
          {
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+1987654321',
            relationship: 'spouse'
          }
        ],
        // Other will-specific data
      }
    });
    
    console.log('Will created:', will.id);
    return will;
  } catch (error) {
    console.error('Error creating will:', error);
  }
}`
    },
    {
      language: "python",
      title: "Python",
      code: `# Install the SDK: pip install willtank-sdk
from willtank import WillTank

# Initialize the SDK with your API key
client = WillTank(
    api_key='YOUR_API_KEY',
    environment='production'  # or 'sandbox' for testing
)

# Example: Create a new will
def create_will():
    try:
        will = client.wills.create(
            user_id='user_123',
            template_id='template_standard',
            data={
                'testator': {
                    'name': 'John Doe',
                    'email': 'john@example.com',
                    'phone': '+1234567890',
                    'address': {
                        'street': '123 Main St',
                        'city': 'New York',
                        'state': 'NY',
                        'zip': '10001',
                        'country': 'US'
                    }
                },
                'executors': [
                    {
                        'name': 'Jane Smith',
                        'email': 'jane@example.com',
                        'phone': '+1987654321',
                        'relationship': 'spouse'
                    }
                ],
                # Other will-specific data
            }
        )
        
        print(f'Will created: {will.id}')
        return will
    except Exception as e:
        print(f'Error creating will: {e}')`
    },
    {
      language: "ruby",
      title: "Ruby",
      code: `# Install the SDK: gem install willtank-sdk
require 'willtank'

# Initialize the SDK with your API key
client = WillTank::Client.new(
  api_key: 'YOUR_API_KEY',
  environment: 'production' # or 'sandbox' for testing
)

# Example: Create a new will
def create_will
  begin
    will = client.wills.create(
      user_id: 'user_123',
      template_id: 'template_standard',
      data: {
        testator: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'US'
          }
        },
        executors: [
          {
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+1987654321',
            relationship: 'spouse'
          }
        ],
        # Other will-specific data
      }
    )
    
    puts "Will created: #{will.id}"
    return will
  rescue => e
    puts "Error creating will: #{e.message}"
  end
end`
    },
    {
      language: "php",
      title: "PHP",
      code: `<?php
// Install the SDK: composer require willtank/willtank-php
require_once 'vendor/autoload.php';

// Initialize the SDK with your API key
$willtank = new WillTank\Client([
  'api_key' => 'YOUR_API_KEY',
  'environment' => 'production' // or 'sandbox' for testing
]);

// Example: Create a new will
function createWill() {
  try {
    $will = $willtank->wills->create([
      'user_id' => 'user_123',
      'template_id' => 'template_standard',
      'data' => [
        'testator' => [
          'name' => 'John Doe',
          'email' => 'john@example.com',
          'phone' => '+1234567890',
          'address' => [
            'street' => '123 Main St',
            'city' => 'New York',
            'state' => 'NY',
            'zip' => '10001',
            'country' => 'US'
          ]
        ],
        'executors' => [
          [
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'phone' => '+1987654321',
            'relationship' => 'spouse'
          ]
        ],
        // Other will-specific data
      ]
    ]);
    
    echo "Will created: " . $will->id;
    return $will;
  } catch (Exception $e) {
    echo "Error creating will: " . $e->getMessage();
  }
}
?>`
    }
  ];

  const endpoints = [
    {
      name: "Authentication",
      endpoint: "/auth",
      description: "Authenticate with the WillTank API using your API key or OAuth credentials.",
      methods: ["POST"],
      parameters: [
        { name: "api_key", required: true, type: "string", description: "Your WillTank API key" },
        { name: "client_id", required: false, type: "string", description: "OAuth client ID (if using OAuth)" },
        { name: "client_secret", required: false, type: "string", description: "OAuth client secret (if using OAuth)" }
      ]
    },
    {
      name: "Create Will",
      endpoint: "/wills",
      description: "Create a new will for a user based on a template.",
      methods: ["POST"],
      parameters: [
        { name: "user_id", required: true, type: "string", description: "Unique identifier for the user" },
        { name: "template_id", required: true, type: "string", description: "The template to use for the will" },
        { name: "data", required: true, type: "object", description: "Will content and metadata" }
      ]
    },
    {
      name: "Get Will",
      endpoint: "/wills/{will_id}",
      description: "Retrieve a specific will by its ID.",
      methods: ["GET"],
      parameters: [
        { name: "will_id", required: true, type: "string", description: "Unique identifier for the will" }
      ]
    },
    {
      name: "Update Will",
      endpoint: "/wills/{will_id}",
      description: "Update an existing will with new information.",
      methods: ["PUT", "PATCH"],
      parameters: [
        { name: "will_id", required: true, type: "string", description: "Unique identifier for the will" },
        { name: "data", required: true, type: "object", description: "Updated will content" }
      ]
    },
    {
      name: "Delete Will",
      endpoint: "/wills/{will_id}",
      description: "Delete a will from the system.",
      methods: ["DELETE"],
      parameters: [
        { name: "will_id", required: true, type: "string", description: "Unique identifier for the will" }
      ]
    },
    {
      name: "List Wills",
      endpoint: "/wills",
      description: "List all wills for a specific user.",
      methods: ["GET"],
      parameters: [
        { name: "user_id", required: true, type: "string", description: "Filter wills by user ID" },
        { name: "status", required: false, type: "string", description: "Filter by will status (draft, submitted, finalized)" },
        { name: "limit", required: false, type: "integer", description: "Number of results to return per page" },
        { name: "offset", required: false, type: "integer", description: "Number of results to skip" }
      ]
    },
    {
      name: "Get Templates",
      endpoint: "/templates",
      description: "List available will templates.",
      methods: ["GET"],
      parameters: [
        { name: "jurisdiction", required: false, type: "string", description: "Filter templates by legal jurisdiction" },
        { name: "type", required: false, type: "string", description: "Filter by template type" }
      ]
    },
    {
      name: "Get Template",
      endpoint: "/templates/{template_id}",
      description: "Get details for a specific template.",
      methods: ["GET"],
      parameters: [
        { name: "template_id", required: true, type: "string", description: "Unique identifier for the template" }
      ]
    },
    {
      name: "Generate Document",
      endpoint: "/wills/{will_id}/documents",
      description: "Generate a legal document from a will.",
      methods: ["POST"],
      parameters: [
        { name: "will_id", required: true, type: "string", description: "Unique identifier for the will" },
        { name: "format", required: false, type: "string", description: "Document format (pdf, docx)" },
        { name: "include_metadata", required: false, type: "boolean", description: "Whether to include metadata in the document" }
      ]
    },
    {
      name: "Add Executor",
      endpoint: "/wills/{will_id}/executors",
      description: "Add an executor to a will.",
      methods: ["POST"],
      parameters: [
        { name: "will_id", required: true, type: "string", description: "Unique identifier for the will" },
        { name: "name", required: true, type: "string", description: "Executor's name" },
        { name: "email", required: true, type: "string", description: "Executor's email" },
        { name: "phone", required: false, type: "string", description: "Executor's phone number" },
        { name: "relationship", required: false, type: "string", description: "Relationship to the testator" }
      ]
    },
    {
      name: "Get Webhooks",
      endpoint: "/webhooks",
      description: "List configured webhooks.",
      methods: ["GET"],
      parameters: []
    },
    {
      name: "Create Webhook",
      endpoint: "/webhooks",
      description: "Create a new webhook subscription.",
      methods: ["POST"],
      parameters: [
        { name: "url", required: true, type: "string", description: "URL to send webhook notifications to" },
        { name: "events", required: true, type: "array", description: "Array of events to subscribe to" },
        { name: "description", required: false, type: "string", description: "Description of this webhook" }
      ]
    }
  ];

  const webhookEvents = [
    {
      event: "will.created",
      description: "Triggered when a new will is created"
    },
    {
      event: "will.updated",
      description: "Triggered when a will is updated"
    },
    {
      event: "will.finalized",
      description: "Triggered when a will is finalized and legally completed"
    },
    {
      event: "will.deleted",
      description: "Triggered when a will is deleted"
    },
    {
      event: "executor.added",
      description: "Triggered when an executor is added to a will"
    },
    {
      event: "executor.confirmed",
      description: "Triggered when an executor confirms their role"
    },
    {
      event: "document.generated",
      description: "Triggered when a document is generated from a will"
    },
    {
      event: "document.signed",
      description: "Triggered when a document is signed"
    }
  ];

  const apiRate = [
    {
      plan: "Starter",
      requestsPerMonth: "10,000",
      requestsPerSecond: "10"
    },
    {
      plan: "Business",
      requestsPerMonth: "50,000",
      requestsPerSecond: "20"
    },
    {
      plan: "Enterprise",
      requestsPerMonth: "Unlimited",
      requestsPerSecond: "50+"
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-[280px_1fr] gap-6 lg:gap-10">
          {/* Sidebar Navigation */}
          <aside className="md:block hidden h-[calc(100vh-6rem)] sticky top-24 overflow-y-auto pb-12">
            <div className="space-y-4">
              <div className="px-3 py-2">
                <h3 className="mb-2 text-lg font-semibold">Documentation</h3>
                <nav className="space-y-1">
                  <a href="#getting-started" className="block px-3 py-2 text-sm rounded-md hover:bg-gray-100">Getting Started</a>
                  <a href="#authentication" className="block px-3 py-2 text-sm rounded-md hover:bg-gray-100">Authentication</a>
                  <a href="#rate-limits" className="block px-3 py-2 text-sm rounded-md hover:bg-gray-100">Rate Limits</a>
                  <a href="#api-reference" className="block px-3 py-2 text-sm rounded-md hover:bg-gray-100">API Reference</a>
                  <div>
                    <a href="#endpoints" className="block px-3 py-2 text-sm rounded-md hover:bg-gray-100 pl-6">Endpoints</a>
                    <a href="#webhooks" className="block px-3 py-2 text-sm rounded-md hover:bg-gray-100 pl-6">Webhooks</a>
                  </div>
                  <a href="#sdks" className="block px-3 py-2 text-sm rounded-md hover:bg-gray-100">SDKs & Code Examples</a>
                  <a href="#white-labeling" className="block px-3 py-2 text-sm rounded-md hover:bg-gray-100">White Labeling</a>
                  <a href="#security" className="block px-3 py-2 text-sm rounded-md hover:bg-gray-100">Security</a>
                  <a href="#support" className="block px-3 py-2 text-sm rounded-md hover:bg-gray-100">Support</a>
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="w-full pb-16">
            <div className="space-y-10">
              {/* Header */}
              <div className="text-center space-y-3 px-4 mb-10">
                <Badge variant="outline" className="mb-2">Developer Documentation</Badge>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">WillTank API Documentation</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Integrate comprehensive will creation and estate planning services into your platforms
                </p>
              </div>

              {/* Getting Started */}
              <section id="getting-started" className="border-b pb-10">
                <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
                <p className="mb-4">
                  The WillTank API allows you to integrate our comprehensive will creation, management, and storage capabilities into your existing platforms. This documentation provides detailed information on how to use our API, including authentication, endpoints, and code examples.
                </p>
                
                <div className="space-y-4 mt-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">1</span>
                          Register
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">
                          Create a developer account to get your API keys and access to our dashboard.
                        </p>
                        <Button className="mt-4 w-full" size="sm">
                          Create Account
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">2</span>
                          Integrate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">
                          Use our SDKs or API endpoints to integrate WillTank's functionality into your platform.
                        </p>
                        <Button className="mt-4 w-full" size="sm" variant="outline">
                          Get SDK
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">3</span>
                          Go Live
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">
                          Test in our sandbox environment, then switch to production with your live API keys.
                        </p>
                        <Button className="mt-4 w-full" size="sm" variant="outline">
                          Contact Support
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </section>

              {/* Authentication */}
              <section id="authentication" className="border-b pb-10">
                <h2 className="text-2xl font-bold mb-4">Authentication</h2>
                <p className="mb-4">
                  All requests to the WillTank API must be authenticated. We support two authentication methods:
                </p>
                
                <Tabs defaultValue="api-key" className="w-full mt-6">
                  <TabsList>
                    <TabsTrigger value="api-key">API Key (Recommended)</TabsTrigger>
                    <TabsTrigger value="oauth">OAuth 2.0</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="api-key" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="mb-2">
                          The simplest way to authenticate with the WillTank API is using your API key. Include your API key in the <code className="bg-gray-100 px-1 py-0.5 rounded">Authorization</code> header with all API requests:
                        </p>
                        
                        <div className="bg-gray-900 text-white p-4 rounded-md mt-4 overflow-x-auto font-mono text-sm">
                          <pre>Authorization: Bearer YOUR_API_KEY</pre>
                        </div>
                        
                        <Alert className="mt-4">
                          <Info className="h-4 w-4" />
                          <AlertTitle>Security Notice</AlertTitle>
                          <AlertDescription>
                            Keep your API keys secure and never expose them in client-side code. Always make API calls from your server.
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="oauth" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="mb-2">
                          For more complex integrations, we support OAuth 2.0 authentication. This allows you to request permissions from users to access their WillTank data.
                        </p>
                        
                        <h4 className="font-semibold mt-4 mb-2">OAuth Flow:</h4>
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>Redirect users to <code className="bg-gray-100 px-1 py-0.5 rounded">https://api.willtank.com/oauth/authorize</code></li>
                          <li>User authenticates and grants permissions</li>
                          <li>User is redirected back to your redirect URI with an authorization code</li>
                          <li>Exchange the code for an access token</li>
                          <li>Use the access token in API requests</li>
                        </ol>
                        
                        <div className="bg-gray-900 text-white p-4 rounded-md mt-4 overflow-x-auto font-mono text-sm">
                          <pre>
{`// Exchange authorization code for token
POST https://api.willtank.com/oauth/token
Content-Type: application/json

{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "code": "AUTHORIZATION_CODE",
  "grant_type": "authorization_code",
  "redirect_uri": "YOUR_REDIRECT_URI"
}`}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </section>

              {/* Rate Limits */}
              <section id="rate-limits" className="border-b pb-10">
                <h2 className="text-2xl font-bold mb-4">Rate Limits</h2>
                <p className="mb-4">
                  To ensure optimal performance for all users, the WillTank API enforces rate limits that vary based on your subscription plan.
                </p>
                
                <Table className="mt-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Requests per Month</TableHead>
                      <TableHead>Requests per Second</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiRate.map((rate, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{rate.plan}</TableCell>
                        <TableCell>{rate.requestsPerMonth}</TableCell>
                        <TableCell>{rate.requestsPerSecond}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <Alert className="mt-6">
                  <RefreshCw className="h-4 w-4" />
                  <AlertTitle>Rate Limit Headers</AlertTitle>
                  <AlertDescription>
                    All API responses include headers that show your current rate limit status:
                    <ul className="list-disc pl-5 mt-2">
                      <li><code className="bg-gray-100 px-1 py-0.5 rounded">X-RateLimit-Limit</code>: Maximum requests per hour</li>
                      <li><code className="bg-gray-100 px-1 py-0.5 rounded">X-RateLimit-Remaining</code>: Remaining requests in the current period</li>
                      <li><code className="bg-gray-100 px-1 py-0.5 rounded">X-RateLimit-Reset</code>: Time at which the rate limit resets (Unix timestamp)</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </section>

              {/* API Reference */}
              <section id="api-reference" className="border-b pb-10">
                <h2 className="text-2xl font-bold mb-4">API Reference</h2>
                <p className="mb-4">
                  Our RESTful API provides comprehensive endpoints for managing wills, executors, templates, and more. All endpoints return JSON responses and accept JSON payloads.
                </p>
                
                <Alert variant="outline" className="my-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Base URL</AlertTitle>
                  <AlertDescription>
                    <p>All API URLs referenced in this documentation have the following base:</p>
                    <code className="bg-gray-100 px-2 py-1 rounded block mt-2">https://api.willtank.com/v1</code>
                  </AlertDescription>
                </Alert>
                
                <section id="endpoints" className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Endpoints</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {endpoints.map((endpoint, index) => (
                      <AccordionItem value={`endpoint-${index}`} key={index}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2 text-left">
                            <Badge variant="outline" className={cn(
                              "text-xs font-mono",
                              endpoint.methods.includes("GET") ? "bg-blue-50 text-blue-700 border-blue-200" : 
                              endpoint.methods.includes("POST") ? "bg-green-50 text-green-700 border-green-200" :
                              endpoint.methods.includes("DELETE") ? "bg-red-50 text-red-700 border-red-200" :
                              "bg-orange-50 text-orange-700 border-orange-200"
                            )}>
                              {endpoint.methods.join(" | ")}
                            </Badge>
                            <span>{endpoint.name}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-2 pb-4">
                            <div className="font-mono text-sm bg-gray-100 p-2 rounded mb-3">
                              {endpoint.methods[0]} {endpoint.endpoint}
                            </div>
                            <p className="mb-3">{endpoint.description}</p>
                            
                            {endpoint.parameters.length > 0 && (
                              <>
                                <h4 className="font-semibold mt-4 mb-2">Parameters</h4>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Name</TableHead>
                                      <TableHead>Type</TableHead>
                                      <TableHead>Required</TableHead>
                                      <TableHead>Description</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {endpoint.parameters.map((param, pIndex) => (
                                      <TableRow key={pIndex}>
                                        <TableCell className="font-mono text-sm">{param.name}</TableCell>
                                        <TableCell>{param.type}</TableCell>
                                        <TableCell>{param.required ? "Yes" : "No"}</TableCell>
                                        <TableCell>{param.description}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </>
                            )}
                            
                            <h4 className="font-semibold mt-4 mb-2">Example Response</h4>
                            <div className="bg-gray-900 text-white p-3 rounded-md overflow-x-auto font-mono text-sm">
                              <pre>
{endpoint.name === "Create Will" ? 
`{
  "id": "will_1234567890",
  "user_id": "user_123",
  "template_id": "template_standard",
  "status": "draft",
  "created_at": "2023-09-15T14:32:21Z",
  "updated_at": "2023-09-15T14:32:21Z",
  "data": {
    "testator": {
      "name": "John Doe",
      "email": "john@example.com",
      // Additional testator data
    },
    "executors": [
      {
        "id": "exec_12345",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "status": "invited"
      }
    ]
  }
}` : 
endpoint.name === "List Wills" ?
`{
  "data": [
    {
      "id": "will_1234567890",
      "user_id": "user_123",
      "template_id": "template_standard",
      "status": "draft",
      "created_at": "2023-09-15T14:32:21Z",
      "updated_at": "2023-09-15T14:32:21Z"
    },
    {
      "id": "will_0987654321",
      "user_id": "user_123",
      "template_id": "template_advanced",
      "status": "finalized",
      "created_at": "2023-08-10T09:15:43Z",
      "updated_at": "2023-08-12T16:22:11Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 10,
    "offset": 0
  }
}` :
endpoint.name === "Get Templates" ?
`{
  "data": [
    {
      "id": "template_standard",
      "name": "Standard Will",
      "description": "Basic will suitable for simple estates",
      "jurisdiction": "US-All",
      "version": "1.2.0"
    },
    {
      "id": "template_living_trust",
      "name": "Living Trust",
      "description": "Comprehensive trust and will combination",
      "jurisdiction": "US-CA",
      "version": "2.0.1"
    }
  ],
  "pagination": {
    "total": 8,
    "limit": 10,
    "offset": 0
  }
}` :
`{
  "id": "${endpoint.endpoint.includes('{') ? endpoint.endpoint.replace(/\/\{([^}]+)\}.*/, '/$1_value') : endpoint.endpoint.split('/').pop() + '_value'}",
  "success": true,
  "created_at": "2023-09-15T14:32:21Z",
  "updated_at": "2023-09-15T14:32:21Z"
}`
}
                              </pre>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
                
                <section id="webhooks" className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Webhooks</h3>
                  <p className="mb-4">
                    Webhooks allow you to receive real-time notifications when events occur in the WillTank system. This is useful for keeping your systems in sync with WillTank data.
                  </
