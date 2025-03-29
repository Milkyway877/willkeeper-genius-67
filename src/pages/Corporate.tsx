
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Code, 
  Briefcase, 
  Users, 
  PieChart, 
  CreditCard,
  Settings,
  Check,
  FileText,
  Server,
  TabletSmartphone,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Corporate() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  const integrationSteps = [
    {
      title: "Set up your Developer Account",
      description: "Register for a WillTank developer account and generate your API keys in the dashboard.",
      icon: Users
    },
    {
      title: "Install the SDK",
      description: "Integrate our SDK using npm, yarn, or include it directly in your application.",
      icon: Code
    },
    {
      title: "Configure API Parameters",
      description: "Set up your configuration with your API key and customize the appearance to match your brand.",
      icon: Settings
    },
    {
      title: "Implement the API",
      description: "Use our comprehensive documentation to implement the required endpoints in your application.",
      icon: Server
    },
    {
      title: "Test the Integration",
      description: "Use our sandbox environment to test your integration thoroughly before going live.",
      icon: TabletSmartphone
    },
    {
      title: "Go Live",
      description: "Switch to production credentials and start offering WillTank services to your clients.",
      icon: Database
    }
  ];
  
  const pricingPlans = [
    {
      name: "Starter",
      price: "$1,999",
      period: "/month",
      description: "For businesses just getting started with digital estate planning",
      features: [
        "White-labeled solution",
        "API access with 10,000 calls/month",
        "Standard support (24-48 hour response)",
        "Up to 1,000 active users",
        "Basic analytics dashboard",
        "Default template library"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Business",
      price: "$4,999",
      period: "/month",
      description: "For growing businesses needing advanced features",
      features: [
        "Everything in Starter",
        "API access with 50,000 calls/month",
        "Priority support (12 hour response)",
        "Up to 10,000 active users",
        "Advanced analytics & reporting",
        "Custom template creation",
        "Dedicated account manager"
      ],
      cta: "Contact Sales",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with specific requirements",
      features: [
        "Everything in Business",
        "Unlimited API calls",
        "24/7 Premium support",
        "Unlimited active users",
        "Custom integration development",
        "On-premise deployment option",
        "SLA guarantees",
        "Regulatory compliance support"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.section 
          className="text-center py-16 md:py-24"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Badge variant="outline" className="mb-4 px-3 py-1 border-blue-200 text-blue-700 bg-blue-50">For Financial Institutions & Legal Firms</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Enterprise-Grade Will Solutions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Integrate WillTank's powerful will creation and management capabilities into your own platforms with our enterprise solutions.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="rounded-full">
              Schedule a Demo
            </Button>
            {/* Fixed the Button usage here - replaced 'as' prop with component approach */}
            <Button size="lg" variant="outline" className="rounded-full" onClick={() => window.location.href = '/corporate/documentation'}>
              View Documentation
            </Button>
          </div>
        </motion.section>
        
        {/* White Labeling Section */}
        <motion.section 
          className="py-16 bg-slate-50 rounded-3xl px-6 md:px-10"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">White Labeling</Badge>
              <h2 className="text-3xl font-bold mb-6">Seamlessly Integrate with Your Brand</h2>
              <p className="text-lg text-gray-600 mb-6">
                Our white label solution allows you to offer comprehensive will and estate planning services under your own brand, creating a seamless experience for your customers.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-green-100 p-1.5 rounded-full text-green-600">
                    <Check size={16} />
                  </div>
                  <div>
                    <h3 className="font-medium">Custom Branding</h3>
                    <p className="text-gray-600">Customize colors, logos, and UI elements to match your brand identity.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-green-100 p-1.5 rounded-full text-green-600">
                    <Check size={16} />
                  </div>
                  <div>
                    <h3 className="font-medium">Domain Integration</h3>
                    <p className="text-gray-600">Deploy on your own domain with complete SSL security.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-green-100 p-1.5 rounded-full text-green-600">
                    <Check size={16} />
                  </div>
                  <div>
                    <h3 className="font-medium">Custom User Journeys</h3>
                    <p className="text-gray-600">Tailor the user experience to match your existing workflows.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-sm mb-4 text-gray-500">Example white-labeled interface</div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-md"></div>
                    <span className="font-semibold">YourBrand</span>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <span>Dashboard</span>
                    <span>Documents</span>
                    <span>Support</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Create Your Will</h3>
                  <div className="h-32 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-24 bg-gray-100 rounded-md"></div>
                    <div className="h-24 bg-gray-100 rounded-md"></div>
                  </div>
                  <div className="flex justify-end">
                    <div className="w-24 h-10 bg-blue-600 rounded-md"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
        
        {/* API Integration Section */}
        <motion.section 
          className="py-16"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">API Integration</Badge>
            <h2 className="text-3xl font-bold mb-4">Powerful API for Seamless Integration</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our comprehensive API allows you to integrate all WillTank functionality directly into your existing platforms and applications.
            </p>
          </div>
          
          <Tabs defaultValue="overview" className="w-full mb-12">
            <TabsList className="grid grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="endpoints">Key Endpoints</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4">API Overview</h3>
                <p className="mb-4">
                  The WillTank API provides a complete suite of endpoints for creating, managing, and storing wills and estate planning documents. Our RESTful API is designed to be easy to integrate with any platform.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Authentication</CardTitle>
                    </CardHeader>
                    <CardContent>
                      Secure OAuth 2.0 and API key-based authentication options for different integration needs.
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Documentation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      Comprehensive API documentation with code examples in multiple languages.
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">SDKs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      Ready-to-use SDKs for JavaScript, Python, Ruby, Java, and more.
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="endpoints" className="mt-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-hidden">
                <h3 className="text-xl font-semibold mb-4">Key API Endpoints</h3>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Endpoint</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Method</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono text-sm">/api/v1/wills</TableCell>
                        <TableCell>Create, retrieve, update and delete wills</TableCell>
                        <TableCell>GET, POST, PUT, DELETE</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-sm">/api/v1/templates</TableCell>
                        <TableCell>Access will templates</TableCell>
                        <TableCell>GET</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-sm">/api/v1/executors</TableCell>
                        <TableCell>Manage executors</TableCell>
                        <TableCell>GET, POST, PUT, DELETE</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-sm">/api/v1/documents</TableCell>
                        <TableCell>Manage supporting documents</TableCell>
                        <TableCell>GET, POST, PUT, DELETE</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-sm">/api/v1/users</TableCell>
                        <TableCell>User management</TableCell>
                        <TableCell>GET, POST, PUT, DELETE</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-6">
                  <Link to="/corporate/documentation" className="text-blue-600 hover:underline flex items-center gap-1">
                    View complete API documentation
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="mt-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Security Features</h3>
                <p className="mb-6">
                  Security is our top priority. The WillTank API includes multiple layers of security to protect sensitive data:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">End-to-End Encryption</h4>
                      <p className="text-gray-600">All data is encrypted in transit and at rest using industry-standard encryption.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Access Controls</h4>
                      <p className="text-gray-600">Granular permission settings let you control access to sensitive operations.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Audit Logging</h4>
                      <p className="text-gray-600">Comprehensive logs of all API activity for compliance and security monitoring.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Compliance</h4>
                      <p className="text-gray-600">Built to meet financial and legal regulatory requirements.</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div>
            <h3 className="text-2xl font-bold mb-8 text-center">Integration Process</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrationSteps.map((step, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardHeader>
                    <div className="mb-2 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                      <step.icon size={20} />
                    </div>
                    <CardTitle>{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.section>
        
        {/* Business Benefits Section */}
        <motion.section 
          className="py-16 bg-gray-50 rounded-3xl px-6 md:px-10"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Benefits</Badge>
            <h2 className="text-3xl font-bold mb-4">How WillTank Empowers Your Business</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Partner with WillTank to offer comprehensive estate planning solutions to your clients while increasing revenue and customer satisfaction.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <div className="mb-2 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700">
                  <PieChart size={24} />
                </div>
                <CardTitle>Increased Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Add a new revenue stream to your business with competitive pricing models and revenue sharing opportunities.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <div className="mb-2 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700">
                  <Users size={24} />
                </div>
                <CardTitle>Enhanced Client Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Provide a comprehensive service offering that adds value to your clients and enhances their overall experience.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <div className="mb-2 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700">
                  <FileText size={24} />
                </div>
                <CardTitle>Regulatory Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  All documents are legally compliant and regularly updated to meet changing regulations across jurisdictions.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <div className="mb-2 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700">
                  <Shield size={24} />
                </div>
                <CardTitle>Enterprise-Grade Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Bank-level security protocols ensure all sensitive client information is protected at all times.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <div className="mb-2 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700">
                  <Briefcase size={24} />
                </div>
                <CardTitle>Quick Implementation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Rapid integration process with dedicated support means you can start offering estate planning services within weeks.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <div className="mb-2 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700">
                  <CreditCard size={24} />
                </div>
                <CardTitle>Flexible Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Choose from transaction-based, subscription, or custom pricing models that align with your business objectives.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.section>
        
        {/* Pricing Section */}
        <motion.section 
          className="py-16"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl font-bold mb-4">Enterprise Pricing</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Flexible pricing options to suit businesses of all sizes, from startups to large enterprises.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={cn(
                "relative border", 
                plan.popular ? "border-blue-200 shadow-md" : "border-gray-200"
              )}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-xs font-medium rounded-bl-lg rounded-tr-lg">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="mt-1 text-green-600">
                          <Check size={16} />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className={cn(
                    "w-full", 
                    plan.popular ? "" : "bg-gray-800 hover:bg-gray-700"
                  )}>
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Need a custom solution? Contact our sales team for a tailored quote.</p>
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </div>
        </motion.section>
        
        {/* Call to Action */}
        <motion.section 
          className="py-16 bg-blue-600 text-white rounded-3xl px-6 md:px-10 mb-16"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to empower your business with WillTank?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
              Join leading financial institutions and legal firms already using our enterprise solutions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" className="rounded-full">
                Schedule a Demo
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-white border-white hover:bg-blue-700">
                Contact Sales
              </Button>
            </div>
          </div>
        </motion.section>
      </div>
    </Layout>
  );
}
