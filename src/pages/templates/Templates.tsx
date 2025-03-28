
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Plus, Search, Filter, ArrowRight, Download, 
  BookOpen, Heart, Briefcase, Shield, Key, Users, 
  Folder, Check, Tag, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Define template categories and templates
type Template = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  popularity: number;
  icon: React.ReactNode;
};

export default function Templates() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Template data
  const templates: Template[] = [
    {
      id: 'basic-will',
      title: 'Basic Will & Testament',
      description: 'A straightforward will for simple estates with standard provisions.',
      category: 'wills',
      tags: ['Basic', 'Simple', 'Standard'],
      popularity: 95,
      icon: <FileText className="h-8 w-8 text-willtank-600" />,
    },
    {
      id: 'comprehensive-will',
      title: 'Comprehensive Will',
      description: 'Detailed will with provisions for complex estates and specific asset distribution.',
      category: 'wills',
      tags: ['Comprehensive', 'Detailed', 'Complex'],
      popularity: 87,
      icon: <FileText className="h-8 w-8 text-willtank-600" />,
    },
    {
      id: 'living-trust',
      title: 'Revocable Living Trust',
      description: 'Create a living trust to avoid probate and manage assets during your lifetime.',
      category: 'trusts',
      tags: ['Trust', 'Revocable', 'Probate Avoidance'],
      popularity: 92,
      icon: <BookOpen className="h-8 w-8 text-willtank-600" />,
    },
    {
      id: 'digital-assets',
      title: 'Digital Assets Will',
      description: 'Specialized will for managing digital assets, cryptocurrencies, and online accounts.',
      category: 'wills',
      tags: ['Digital', 'Cryptocurrency', 'Online'],
      popularity: 78,
      icon: <Key className="h-8 w-8 text-willtank-600" />,
    },
    {
      id: 'pet-trust',
      title: 'Pet Care Trust',
      description: 'Ensure your pets are cared for with specific provisions for their needs.',
      category: 'trusts',
      tags: ['Pets', 'Care', 'Animals'],
      popularity: 65,
      icon: <Heart className="h-8 w-8 text-willtank-600" />,
    },
    {
      id: 'business-succession',
      title: 'Business Succession Plan',
      description: 'Plan for the transition of business ownership and management.',
      category: 'business',
      tags: ['Business', 'Succession', 'Ownership'],
      popularity: 72,
      icon: <Briefcase className="h-8 w-8 text-willtank-600" />,
    },
    {
      id: 'power-attorney',
      title: 'Power of Attorney',
      description: 'Authorize someone to make decisions on your behalf if you become incapacitated.',
      category: 'legal',
      tags: ['Power of Attorney', 'Legal', 'Authority'],
      popularity: 88,
      icon: <Shield className="h-8 w-8 text-willtank-600" />,
    },
    {
      id: 'healthcare-directive',
      title: 'Healthcare Directive',
      description: 'Document your wishes for medical treatment if you cannot communicate.',
      category: 'legal',
      tags: ['Healthcare', 'Medical', 'Directive'],
      popularity: 81,
      icon: <Shield className="h-8 w-8 text-willtank-600" />,
    },
    {
      id: 'beneficiary-designation',
      title: 'Beneficiary Designation',
      description: 'Specify beneficiaries for specific assets, accounts, or policies.',
      category: 'legal',
      tags: ['Beneficiary', 'Designation', 'Assets'],
      popularity: 76,
      icon: <Users className="h-8 w-8 text-willtank-600" />,
    },
    {
      id: 'charitable-trust',
      title: 'Charitable Trust',
      description: 'Create a trust to support charitable organizations while providing tax benefits.',
      category: 'trusts',
      tags: ['Charity', 'Donation', 'Philanthropy'],
      popularity: 63,
      icon: <Heart className="h-8 w-8 text-willtank-600" />,
    },
  ];

  // Filter templates by search query and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      searchQuery === '' || 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Toggle favorite status for a template
  const toggleFavorite = (id: string) => {
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

  // Handle template selection
  const handleSelectTemplate = (template: Template) => {
    toast({
      title: "Template Selected",
      description: `You've selected the ${template.title} template.`
    });
    navigate('/will/create', { state: { selectedTemplate: template } });
  };

  // Categories for filtering
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
                    className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
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
                          onClick={() => toggleFavorite(template.id)}
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
                            onClick={() => toast({
                              title: "Preview Available",
                              description: "Opening template preview"
                            })}
                          >
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
    </Layout>
  );
}
