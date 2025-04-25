
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Archive, Plus, File, Key, CreditCard, FileText, 
  Home, Briefcase, Image, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LegacyVault: React.FC = () => {
  return (
    <div className="container mx-auto max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Legacy Vault</h1>
          <p className="text-gray-600">Securely store your important documents and information</p>
        </div>
        
        <div className="flex gap-2">
          <Link to="/dashboard/vault/create">
            <Button variant="default">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </Link>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="digital">Digital</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="ml-3 font-medium text-lg">Documents</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">Store important legal documents, certificates, and identification.</p>
              <Link to="/dashboard/vault/create">
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Documents
                </Button>
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="ml-3 font-medium text-lg">Financial</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">Store bank accounts, investment information, and insurance policies.</p>
              <Link to="/dashboard/vault/create">
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Financial Info
                </Button>
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Key className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="ml-3 font-medium text-lg">Digital Assets</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">Store login credentials, digital assets, and online accounts.</p>
              <Link to="/dashboard/vault/create">
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Digital Assets
                </Button>
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Home className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="ml-3 font-medium text-lg">Real Estate</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">Store property deeds, mortgages, and related documents.</p>
              <Link to="/dashboard/vault/create">
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property Info
                </Button>
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="ml-3 font-medium text-lg">Business</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">Store business licenses, contracts, and ownership details.</p>
              <Link to="/dashboard/vault/create">
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Business Info
                </Button>
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Image className="h-5 w-5 text-cyan-600" />
                </div>
                <h3 className="ml-3 font-medium text-lg">Personal</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">Store personal items, heirlooms, and their information.</p>
              <Link to="/dashboard/vault/create">
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Personal Items
                </Button>
              </Link>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="documents" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 flex justify-center items-center flex-col py-12">
            <File size={48} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-medium mb-2">No documents yet</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              Add important documents to your vault to keep them secure and accessible to your executors when needed.
            </p>
            <Link to="/dashboard/vault/create">
              <Button variant="default">
                <Plus className="mr-2 h-4 w-4" />
                Add Document
              </Button>
            </Link>
          </div>
        </TabsContent>
        
        <TabsContent value="financial" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 flex justify-center items-center flex-col py-12">
            <CreditCard size={48} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-medium mb-2">No financial items yet</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              Add financial accounts, policies, and other financial information to your vault.
            </p>
            <Link to="/dashboard/vault/create">
              <Button variant="default">
                <Plus className="mr-2 h-4 w-4" />
                Add Financial Item
              </Button>
            </Link>
          </div>
        </TabsContent>
        
        <TabsContent value="personal" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 flex justify-center items-center flex-col py-12">
            <Award size={48} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-medium mb-2">No personal items yet</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              Add personal items, heirlooms, and sentimental assets to your vault.
            </p>
            <Link to="/dashboard/vault/create">
              <Button variant="default">
                <Plus className="mr-2 h-4 w-4" />
                Add Personal Item
              </Button>
            </Link>
          </div>
        </TabsContent>
        
        <TabsContent value="digital" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 flex justify-center items-center flex-col py-12">
            <Key size={48} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-medium mb-2">No digital assets yet</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              Add digital assets, online accounts, and passwords to your vault.
            </p>
            <Link to="/dashboard/vault/create">
              <Button variant="default">
                <Plus className="mr-2 h-4 w-4" />
                Add Digital Asset
              </Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LegacyVault;
