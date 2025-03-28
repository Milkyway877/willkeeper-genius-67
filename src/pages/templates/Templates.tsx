
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { FileCode, Plus, Download, Copy, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Templates() {
  const templates = [
    {
      title: "Basic Will",
      description: "A simple will that covers fundamental estate distribution and executor appointment.",
      tags: ["Beginner", "Essential"],
      lastUpdated: "2 weeks ago"
    },
    {
      title: "Digital Assets Will",
      description: "Specialized will focused on digital asset management and digital executors.",
      tags: ["Digital", "Modern"],
      lastUpdated: "1 month ago"
    },
    {
      title: "Family Trust Will",
      description: "Comprehensive will with trust provisions for family members and dependents.",
      tags: ["Family", "Trust"],
      lastUpdated: "2 months ago"
    },
    {
      title: "Business Owner Will",
      description: "Will template designed for business owners with company succession plans.",
      tags: ["Business", "Advanced"],
      lastUpdated: "3 weeks ago"
    },
    {
      title: "Living Will",
      description: "Advanced healthcare directive for medical decisions if you become incapacitated.",
      tags: ["Healthcare", "Medical"],
      lastUpdated: "1 week ago"
    },
    {
      title: "International Assets Will",
      description: "Will template for individuals with assets in multiple countries.",
      tags: ["International", "Complex"],
      lastUpdated: "1 month ago"
    }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Legal Templates</h1>
            <p className="text-gray-600">Use these professionally designed templates to create your legal documents.</p>
          </div>
          
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Custom Template
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center">
                  <FileCode className="text-willtank-700 mr-2" size={18} />
                  <h3 className="font-medium">{template.title}</h3>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex} 
                      className="px-2 py-1 bg-willtank-50 text-willtank-700 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="text-xs text-gray-500 flex items-center mb-6">
                  <Clock size={14} className="mr-1" />
                  Last updated {template.lastUpdated}
                </div>
                
                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm">
                    <Copy className="mr-2 h-3 w-3" />
                    Preview
                  </Button>
                  
                  <Button variant="default" size="sm">
                    Use Template
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
