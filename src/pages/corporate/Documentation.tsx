
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
                  </p>
                  
                  <h4 className="font-semibold mt-6 mb-3">Available Webhook Events</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Name</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {webhookEvents.map((event, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">{event.event}</TableCell>
                          <TableCell>{event.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <h4 className="font-semibold mt-6 mb-3">Setting Up Webhooks</h4>
                  <p className="mb-4">
                    You can set up webhooks through our API or from the developer dashboard. A webhook consists of a URL where we'll send HTTP POST requests when events occur, along with the specific events you want to be notified about.
                  </p>
                  
                  <div className="bg-gray-900 text-white p-3 rounded-md overflow-x-auto font-mono text-sm mt-4">
                    <pre>
{`// Example webhook payload
{
  "event": "will.created",
  "created_at": "2023-09-15T14:32:21Z",
  "data": {
    "will_id": "will_1234567890",
    "user_id": "user_123",
    "template_id": "template_standard",
    "status": "draft"
  }
}`}
                    </pre>
                  </div>
                  
                  <Alert className="mt-6">
                    <Key className="h-4 w-4" />
                    <AlertTitle>Webhook Security</AlertTitle>
                    <AlertDescription>
                      All webhook requests include a signature header (<code className="bg-gray-100 px-1 py-0.5 rounded">X-WillTank-Signature</code>) that you can use to verify the request came from WillTank. We strongly recommend verifying this signature before processing webhook data.
                    </AlertDescription>
                  </Alert>
                </section>
              </section>

              {/* SDKs & Code Examples */}
              <section id="sdks" className="border-b pb-10">
                <h2 className="text-2xl font-bold mb-4">SDKs & Code Examples</h2>
                <p className="mb-4">
                  We provide official SDKs for several popular programming languages to make integrating with the WillTank API as easy as possible.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Official SDKs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <Badge className="mr-2 bg-yellow-100 text-yellow-800 border-yellow-200">JS</Badge>
                          <span>JavaScript/Node.js - <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">npm install willtank-sdk</code></span>
                        </li>
                        <li className="flex items-center">
                          <Badge className="mr-2 bg-blue-100 text-blue-800 border-blue-200">PY</Badge>
                          <span>Python - <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">pip install willtank-sdk</code></span>
                        </li>
                        <li className="flex items-center">
                          <Badge className="mr-2 bg-red-100 text-red-800 border-red-200">RB</Badge>
                          <span>Ruby - <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">gem install willtank-sdk</code></span>
                        </li>
                        <li className="flex items-center">
                          <Badge className="mr-2 bg-purple-100 text-purple-800 border-purple-200">PHP</Badge>
                          <span>PHP - <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">composer require willtank/willtank-php</code></span>
                        </li>
                        <li className="flex items-center">
                          <Badge className="mr-2 bg-green-100 text-green-800 border-green-200">GO</Badge>
                          <span>Go - <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">go get github.com/willtank/willtank-go</code></span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">SDK Benefits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Automatic authentication handling</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Type-safe API interfaces</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Simplified error handling and retry logic</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Webhook signature verification utilities</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Comprehensive documentation and examples</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                
                <h3 className="text-xl font-semibold mt-8 mb-4">Code Examples</h3>
                
                <Tabs defaultValue={codeExamples[0].language} className="w-full mt-4">
                  <TabsList className="mb-2">
                    {codeExamples.map((example, index) => (
                      <TabsTrigger key={index} value={example.language}>{example.title}</TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {codeExamples.map((example, index) => (
                    <TabsContent key={index} value={example.language} className="mt-0">
                      <div className="relative">
                        <div className="bg-gray-900 text-white p-4 rounded-md overflow-x-auto font-mono text-sm">
                          <pre>{example.code}</pre>
                        </div>
                        <button 
                          onClick={() => handleCopyCode(example.code, index)}
                          className="absolute top-3 right-3 p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors"
                          aria-label="Copy code"
                        >
                          {copiedIndex === index ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </section>

              {/* White Labeling */}
              <section id="white-labeling" className="border-b pb-10">
                <h2 className="text-2xl font-bold mb-4">White Labeling</h2>
                <p className="mb-4">
                  Our white-labeling capabilities allow you to integrate WillTank's powerful will creation and management features into your own platform under your own brand.
                </p>
                
                <div className="grid md:grid-cols-2 gap-8 mt-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">White Labeling Options</h3>
                    
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="mr-3 bg-blue-100 p-2 rounded-full">
                          <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Custom Branding</h4>
                          <p className="text-gray-600 text-sm">Customize all user-facing elements with your company's branding, including colors, logos, and terminology.</p>
                        </div>
                      </li>
                      
                      <li className="flex items-start">
                        <div className="mr-3 bg-blue-100 p-2 rounded-full">
                          <Terminal className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Custom Domain</h4>
                          <p className="text-gray-600 text-sm">Host the solution on your own domain for a seamless user experience.</p>
                        </div>
                      </li>
                      
                      <li className="flex items-start">
                        <div className="mr-3 bg-blue-100 p-2 rounded-full">
                          <Lock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Document Customization</h4>
                          <p className="text-gray-600 text-sm">Customize the appearance and branding of all generated legal documents.</p>
                        </div>
                      </li>
                      
                      <li className="flex items-start">
                        <div className="mr-3 bg-blue-100 p-2 rounded-full">
                          <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Custom Workflows</h4>
                          <p className="text-gray-600 text-sm">Create tailored user journeys that match your existing business processes.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Implementation Steps</h3>
                    
                    <ol className="space-y-4 list-decimal pl-5">
                      <li className="pl-2">
                        <p className="font-semibold">Contact our enterprise sales team</p>
                        <p className="text-gray-600 text-sm">Schedule a consultation to discuss your specific white-labeling requirements.</p>
                      </li>
                      
                      <li className="pl-2">
                        <p className="font-semibold">Provide branding assets</p>
                        <p className="text-gray-600 text-sm">Share your logo, color scheme, and brand guidelines for implementation.</p>
                      </li>
                      
                      <li className="pl-2">
                        <p className="font-semibold">Configure integration options</p>
                        <p className="text-gray-600 text-sm">Work with our team to set up the API integration and customize the user experience.</p>
                      </li>
                      
                      <li className="pl-2">
                        <p className="font-semibold">Review and test</p>
                        <p className="text-gray-600 text-sm">Preview the white-labeled solution and test all functionality.</p>
                      </li>
                      
                      <li className="pl-2">
                        <p className="font-semibold">Launch</p>
                        <p className="text-gray-600 text-sm">Deploy the white-labeled solution to your users.</p>
                      </li>
                    </ol>
                    
                    <div className="mt-6">
                      <Button className="w-full">
                        Request White-Label Information
                      </Button>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mt-8 mb-4">Pricing</h3>
                <p className="mb-4">
                  White-labeling is available on our Enterprise plan, with pricing based on your specific requirements and usage volume. Contact our sales team for a custom quote.
                </p>
                
                <Alert variant="outline" className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>White-Label Support</AlertTitle>
                  <AlertDescription>
                    Enterprise customers with white-labeled solutions receive dedicated support and account management to ensure your integration remains smooth and up-to-date.
                  </AlertDescription>
                </Alert>
              </section>

              {/* Security */}
              <section id="security" className="border-b pb-10">
                <h2 className="text-2xl font-bold mb-4">Security</h2>
                <p className="mb-4">
                  At WillTank, security is our top priority. We implement industry-leading security measures to protect your data and your users' sensitive information.
                </p>
                
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Lock className="h-5 w-5 mr-2 text-willtank-600" />
                        Data Encryption
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm">
                        All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. Sensitive user data is additionally protected with field-level encryption.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-willtank-600" />
                        Compliance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm">
                        Our platform is compliant with SOC 2, GDPR, CCPA, and industry-specific regulations related to legal document management and privacy protection.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Key className="h-5 w-5 mr-2 text-willtank-600" />
                        Authentication
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm">
                        We support advanced authentication methods including MFA, SSO, and IP-based access restrictions for your administrative access.
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <h3 className="text-xl font-semibold mt-8 mb-4">Security Documentation</h3>
                <p className="mb-4">
                  Detailed security information is available for enterprise customers, including:
                </p>
                
                <ul className="list-disc pl-5 space-y-2">
                  <li>Security whitepapers</li>
                  <li>Compliance certifications</li>
                  <li>Penetration test results (available under NDA)</li>
                  <li>Data processing agreements</li>
                  <li>Business continuity and disaster recovery plans</li>
                </ul>
                
                <div className="mt-6">
                  <Button variant="outline">
                    Request Security Documentation
                  </Button>
                </div>
              </section>

              {/* Support */}
              <section id="support" className="pb-10">
                <h2 className="text-2xl font-bold mb-4">Support</h2>
                <p className="mb-4">
                  Our dedicated developer support team is available to help you with your integration needs.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Developer Support</CardTitle>
                      <CardDescription>For technical assistance with API integration</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Email support: <a href="mailto:api-support@willtank.com" className="text-willtank-600 hover:underline">api-support@willtank.com</a></span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Developer forums</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>API status page</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>GitHub repository for SDK issues</span>
                        </li>
                      </ul>
                      <div className="mt-6">
                        <Button variant="outline" className="w-full">
                          Contact Developer Support
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Enterprise Support</CardTitle>
                      <CardDescription>For enterprise customers with dedicated needs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Dedicated account manager</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Priority email and phone support</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Implementation consultation</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Custom SLAs available</span>
                        </li>
                      </ul>
                      <div className="mt-6">
                        <Button className="w-full">
                          Schedule Enterprise Support Call
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-10 text-center">
                  <h3 className="text-xl font-semibold mb-4">Ready to Get Started?</h3>
                  <p className="mb-6 max-w-2xl mx-auto">
                    Create your developer account today and start exploring the WillTank API in our sandbox environment.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button size="lg">
                      Create Developer Account
                    </Button>
                    <Button size="lg" variant="outline">
                      Contact Sales
                    </Button>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
}
