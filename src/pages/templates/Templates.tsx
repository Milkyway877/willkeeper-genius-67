import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Plus, Search, Filter, ArrowRight, Download, 
  BookOpen, Heart, Briefcase, Shield, Key, Users, 
  Folder, Check, Tag, ChevronRight, Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Template = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  popularity: number;
  icon: React.ReactNode;
  sample: string;
};

export default function Templates() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const templates: Template[] = [
    {
      id: 'basic-will',
      title: 'Basic Will & Testament',
      description: 'A straightforward will for simple estates with standard provisions.',
      category: 'wills',
      tags: ['Basic', 'Simple', 'Standard'],
      popularity: 95,
      icon: <FileText className="h-8 w-8 text-willtank-600" />,
      sample: "LAST WILL AND TESTAMENT OF [YOUR NAME]\n\nI, [YOUR NAME], residing at [YOUR ADDRESS], being of sound mind, declare this to be my Last Will and Testament.\n\nARTICLE I: REVOCATION\nI hereby revoke all prior wills and codicils.\n\nARTICLE II: FAMILY\nI am married to [SPOUSE NAME]. We have [NUMBER] children: [CHILD NAME(S)].\n\nARTICLE III: EXECUTOR\nI appoint [EXECUTOR NAME] as the Executor of this Will. If [EXECUTOR NAME] is unable or unwilling to serve, I appoint [ALTERNATE EXECUTOR] as alternate Executor.\n\nARTICLE IV: DISTRIBUTION OF PROPERTY\nI give all my property, real and personal, to my [SPOUSE/CHILDREN/BENEFICIARIES] in equal shares."
    },
    {
      id: 'comprehensive-will',
      title: 'Comprehensive Will',
      description: 'Detailed will with provisions for complex estates and specific asset distribution.',
      category: 'wills',
      tags: ['Comprehensive', 'Detailed', 'Complex'],
      popularity: 87,
      icon: <FileText className="h-8 w-8 text-willtank-600" />,
      sample: "COMPREHENSIVE LAST WILL AND TESTAMENT\n\nI, [FULL LEGAL NAME], a resident of [CITY, STATE], being of sound mind and memory, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.\n\nARTICLE I: IDENTIFICATION OF FAMILY\nA. I am married to [SPOUSE NAME].\nB. I have [NUMBER] children: [NAMES AND DATES OF BIRTH].\n\nARTICLE II: APPOINTMENT OF FIDUCIARIES\nA. I appoint [EXECUTOR NAME] as Personal Representative of my estate.\nB. I appoint [TRUSTEE NAME] as Trustee of any trusts created under this Will.\nC. I appoint [GUARDIAN NAME] as Guardian of the person and property of my minor children.\n\nARTICLE III: SPECIFIC BEQUESTS\nI make the following specific bequests:\nA. To [BENEFICIARY]: [SPECIFIC ITEM OR AMOUNT]\nB. To [CHARITY]: [SPECIFIC AMOUNT]"
    },
    {
      id: 'living-trust',
      title: 'Revocable Living Trust',
      description: 'Create a living trust to avoid probate and manage assets during your lifetime.',
      category: 'trusts',
      tags: ['Trust', 'Revocable', 'Probate Avoidance'],
      popularity: 92,
      icon: <BookOpen className="h-8 w-8 text-willtank-600" />,
      sample: "REVOCABLE LIVING TRUST AGREEMENT\n\nThis Revocable Living Trust Agreement is made this [DATE] between [YOUR NAME] (the \"Grantor\") and [TRUSTEE NAME] (the \"Trustee\").\n\nARTICLE I: CREATION OF TRUST\nThe Grantor hereby transfers and delivers to the Trustee the property described in Schedule A, attached hereto, to be held in trust for the purposes set forth in this Agreement.\n\nARTICLE II: ADMINISTRATION DURING GRANTOR'S LIFETIME\nDuring the Grantor's lifetime, the Trustee shall distribute to or for the benefit of the Grantor such amounts of income and principal as the Grantor may direct. The Grantor reserves the right to revoke or amend this trust in whole or in part at any time."
    },
    {
      id: 'digital-assets',
      title: 'Digital Assets Will',
      description: 'Specialized will for managing digital assets, cryptocurrencies, and online accounts.',
      category: 'wills',
      tags: ['Digital', 'Cryptocurrency', 'Online'],
      popularity: 78,
      icon: <Key className="h-8 w-8 text-willtank-600" />,
      sample: "DIGITAL ASSET WILL AND TESTAMENT\n\nI, [YOUR NAME], being of sound mind, make this Will to dispose of my digital assets upon my death.\n\nDigital Assets Inventory:\n1. Email Accounts: [LIST PROVIDERS AND USERNAMES]\n2. Social Media Accounts: [LIST PLATFORMS AND USERNAMES]\n3. Cloud Storage: [LIST SERVICES]\n4. Cryptocurrency Holdings: [LIST TYPES AND APPROXIMATE AMOUNTS]\n5. Domain Names: [LIST DOMAINS]\n6. Online Financial Accounts: [LIST INSTITUTIONS]\n\nI appoint [DIGITAL EXECUTOR NAME] as my Digital Executor to manage, access, control, transfer, and dispose of my digital assets according to the instructions provided in my secure Digital Asset Management document."
    },
    {
      id: 'pet-trust',
      title: 'Pet Care Trust',
      description: 'Ensure your pets are cared for with specific provisions for their needs.',
      category: 'trusts',
      tags: ['Pets', 'Care', 'Animals'],
      popularity: 65,
      icon: <Heart className="h-8 w-8 text-willtank-600" />,
      sample: "PET TRUST AGREEMENT\n\nI, [YOUR NAME], establish this Pet Trust Agreement for the care of my pets listed below:\n\n[PET NAMES, SPECIES, BREEDS, AGES]\n\nI appoint [CARETAKER NAME] as the Caretaker for my pets. I appoint [TRUSTEE NAME] as Trustee of this Pet Trust.\n\nUpon my death, I direct my Trustee to distribute the sum of $[AMOUNT] to be held in trust for the care of my pets. The Trustee shall distribute to the Caretaker $[MONTHLY AMOUNT] per month for the care, feeding, veterinary expenses, and other needs of my pets during their lifetimes.\n\nThe Caretaker agrees to provide my pets with proper food, shelter, veterinary care, and love."
    },
    {
      id: 'business-succession',
      title: 'Business Succession Plan',
      description: 'Plan for the transition of business ownership and management.',
      category: 'business',
      tags: ['Business', 'Succession', 'Ownership'],
      popularity: 72,
      icon: <Briefcase className="h-8 w-8 text-willtank-600" />,
      sample: "BUSINESS SUCCESSION PLAN\n\nI, [YOUR NAME], owner of [BUSINESS NAME], establish this Business Succession Plan.\n\nTransfer of Ownership:\nUpon my [death/retirement/incapacity], my ownership interest in [BUSINESS NAME] shall transfer as follows:\n\n1. [SUCCESSOR NAME] shall receive [PERCENTAGE]% of my ownership interest.\n2. [SUCCESSOR NAME] shall receive [PERCENTAGE]% of my ownership interest.\n\nBuy-Sell Provisions:\nMy interest shall be valued according to the formula set forth in Article IV of this agreement. The purchase price shall be paid as follows: [PAYMENT TERMS].\n\nManagement Transition:\n[SUCCESSOR NAME] shall assume the position of [POSITION] upon my [death/retirement/incapacity]."
    },
    {
      id: 'power-attorney',
      title: 'Power of Attorney',
      description: 'Authorize someone to make decisions on your behalf if you become incapacitated.',
      category: 'legal',
      tags: ['Power of Attorney', 'Legal', 'Authority'],
      popularity: 88,
      icon: <Shield className="h-8 w-8 text-willtank-600" />,
      sample: "POWER OF ATTORNEY\n\nI, [YOUR NAME], hereby appoint [ATTORNEY NAME] as my Power of Attorney. [ATTORNEY NAME] shall have the authority to act on my behalf in the following capacities:\n\n1. [CAPACITY 1]\n2. [CAPACITY 2]\n3. [CAPACITY 3]\n\nThis Power of Attorney shall take effect upon my [death/retirement/incapacity]."
    },
    {
      id: 'healthcare-directive',
      title: 'Healthcare Directive',
      description: 'Document your wishes for medical treatment if you cannot communicate.',
      category: 'legal',
      tags: ['Healthcare', 'Medical', 'Directive'],
      popularity: 81,
      icon: <Shield className="h-8 w-8 text-willtank-600" />,
      sample: "HEALTHCARE DIRECTIVE\n\nI, [YOUR NAME], hereby appoint [ATTORNEY NAME] as my Healthcare Proxy. [ATTORNEY NAME] shall have the authority to make decisions on my behalf regarding my medical care if I am unable to communicate.\n\nThis Healthcare Directive shall take effect upon my [death/retirement/incapacity]."
    },
    {
      id: 'beneficiary-designation',
      title: 'Beneficiary Designation',
      description: 'Specify beneficiaries for specific assets, accounts, or policies.',
      category: 'legal',
      tags: ['Beneficiary', 'Designation', 'Assets'],
      popularity: 76,
      icon: <Users className="h-8 w-8 text-willtank-600" />,
      sample: "BENEFICIARY DESIGNATION\n\nI, [YOUR NAME], hereby designate the following individuals as my beneficiaries:\n\n1. [BENEFICIARY 1]\n2. [BENEFICIARY 2]\n3. [BENEFICIARY 3]\n\nThis designation shall take effect upon my [death/retirement/incapacity]."
    },
    {
      id: 'charitable-trust',
      title: 'Charitable Trust',
      description: 'Create a trust to support charitable organizations while providing tax benefits.',
      category: 'trusts',
      tags: ['Charity', 'Donation', 'Philanthropy'],
      popularity: 63,
      icon: <Heart className="h-8 w-8 text-willtank-600" />,
      sample: "CHARITABLE TRUST AGREEMENT\n\nI, [YOUR NAME], establish this Charitable Trust Agreement to support [CHARITY NAME].\n\nTrustee: [TRUSTEE NAME]\n\nI hereby transfer to the Trustee the property described in Schedule A, attached hereto, to be held in trust for the purposes set forth in this Agreement."
    },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      searchQuery === '' || 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(fav => fav !== id));
      toast({
        title: "Removed from favorites",
        description: "Template removed from your favorites list",
      });
    } else {
      setFavorites([...favorites, id]);
      toast({
        title: "Added to favorites",
        description: "Template added to your favorites list",
      });
    }
  };

  const handleSelectTemplate = (template: Template) => {
    toast({
      title: "Template Selected",
      description: `You've selected the ${template.title} template.`
    });
    navigate('/will/create', { state: { selectedTemplate: template } });
  };

  const handlePreviewTemplate = (template: Template, event: React.MouseEvent) => {
    event.stopPropagation();
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'wills', name: 'Wills' },
    { id: 'trusts', name: 'Trusts' },
    { id: 'legal', name: 'Legal Documents' },
    { id: 'business', name: 'Business' },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Legal Templates</h1>
            <p className="text-gray-600">Choose from our library of professionally crafted legal templates.</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link to="/will/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Custom Template
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search templates by name, description, or tags..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <Button variant="outline" className="w-full md:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="mb-6">
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(category => (
            <TabsContent key={category.id} value={category.id}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map(template => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-12 w-12 bg-willtank-50 rounded-lg flex items-center justify-center">
                          {template.icon}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={favorites.includes(template.id) ? "text-willtank-500" : "text-gray-400"}
                          onClick={(e) => toggleFavorite(template.id, e)}
                        >
                          <Heart className="h-5 w-5" fill={favorites.includes(template.id) ? "currentColor" : "none"} />
                        </Button>
                      </div>
                      
                      <h3 className="text-lg font-medium mb-2">{template.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {template.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-willtank-50 text-willtank-700"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-xs text-gray-500">
                            {template.popularity}% Popular
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => handlePreviewTemplate(template, e)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleSelectTemplate(template)}
                          >
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {filteredTemplates.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No templates found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                  <Button onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}>
                    Clear All Filters
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
        
        <div className="mt-12 bg-willtank-50 rounded-xl p-6 border border-willtank-100">
          <div className="flex items-start">
            <div className="h-12 w-12 rounded-full bg-willtank-100 flex items-center justify-center mr-4">
              <Check className="h-6 w-6 text-willtank-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Create Your Custom Template</h3>
              <p className="text-gray-600 mb-4">
                Need a specialized template that fits your unique situation? Our AI can help you create a custom legal document tailored to your specific needs.
              </p>
              <Link to="/will/create">
                <Button variant="default">
                  Start Creating
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.title} Preview</DialogTitle>
          </DialogHeader>
          
          {previewTemplate && (
            <div className="mt-4 border border-gray-200 rounded-lg p-6 bg-white">
              <div className="mb-6 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-willtank-500 rounded-md flex items-center justify-center mr-3">
                    <span className="text-white font-bold">W</span>
                  </div>
                  <div>
                    <p className="text-willtank-700 font-bold">WILLTANK</p>
                    <p className="text-xs text-gray-500">Legal Document</p>
                  </div>
                </div>
                <div className="border-2 border-gray-300 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-400">Document ID</p>
                  <p className="text-sm font-mono">{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                </div>
              </div>
              
              <div className="prose max-w-none mb-6">
                <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-gray-800">
                  {previewTemplate.sample}
                </pre>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowPreview(false)}>Close</Button>
            <Button onClick={() => {
              setShowPreview(false);
              if (previewTemplate) {
                handleSelectTemplate(previewTemplate);
              }
            }}>Use This Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
