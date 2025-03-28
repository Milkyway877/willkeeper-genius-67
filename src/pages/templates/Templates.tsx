
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { TemplateCard } from '@/pages/will/components/TemplateCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, FileText, ArrowRight, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

interface Template {
  id: string;
  name: string;
  description: string;
  type: 'will' | 'trust' | 'power' | 'living';
  complexity: 'simple' | 'standard' | 'complex';
  preview: string;
  popularity: number;
}

export default function Templates() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  const templates: Template[] = [
    {
      id: '1',
      name: 'Simple Will',
      description: 'Basic will for individuals with straightforward assets and beneficiaries.',
      type: 'will',
      complexity: 'simple',
      preview: `LAST WILL AND TESTAMENT OF [YOUR NAME]

I, [YOUR NAME], a resident of [YOUR COUNTY], [YOUR STATE], being of sound mind, declare this to be my Last Will and Testament.

ARTICLE I: REVOCATION
I revoke all wills and codicils previously made by me.

ARTICLE II: PERSONAL REPRESENTATIVE
I appoint [EXECUTOR NAME] as Personal Representative of my estate.

ARTICLE III: DEBTS AND EXPENSES
I direct my Personal Representative to pay all of my just debts, funeral expenses, and the expenses of administering my estate.

ARTICLE IV: SPECIFIC BEQUESTS
I give and bequeath [SPECIFIC ITEM] to [RECIPIENT NAME].

ARTICLE V: RESIDUARY ESTATE
I give all the rest and residue of my estate to [BENEFICIARY NAME].

ARTICLE VI: CONTINGENT BENEFICIARY
If [BENEFICIARY NAME] does not survive me, I give my residuary estate to [CONTINGENT BENEFICIARY].`,
      popularity: 450
    },
    {
      id: '2',
      name: 'Living Trust',
      description: 'Comprehensive living trust to avoid probate and manage assets.',
      type: 'trust',
      complexity: 'complex',
      preview: `REVOCABLE LIVING TRUST AGREEMENT

This Trust Agreement is made this [DATE] between [YOUR NAME] (the "Grantor") and [TRUSTEE NAME] (the "Trustee").

ARTICLE I: DECLARATION OF TRUST
The Grantor hereby declares that the Trustee shall hold all property transferred to this trust, as set forth in Schedule A attached hereto (the "Trust Estate"), subject to the terms of this Agreement.

ARTICLE II: NAME OF TRUST
This trust shall be known as the [TRUST NAME].

ARTICLE III: AMENDMENT AND REVOCATION
During the Grantor's lifetime, the Grantor reserves the right to amend or revoke this Agreement, in whole or in part, by delivering to the Trustee an instrument in writing duly executed by the Grantor.

ARTICLE IV: DISTRIBUTIONS DURING GRANTOR'S LIFETIME
During the Grantor's lifetime, the Trustee shall pay to or apply for the benefit of the Grantor such amounts of income and principal as the Grantor may direct from time to time.`,
      popularity: 320
    },
    {
      id: '3',
      name: 'Power of Attorney',
      description: 'Designate someone to make financial decisions on your behalf.',
      type: 'power',
      complexity: 'standard',
      preview: `DURABLE POWER OF ATTORNEY

I, [YOUR NAME], currently residing at [YOUR ADDRESS], hereby designate and appoint [AGENT NAME], currently residing at [AGENT ADDRESS], as my Agent (Attorney-in-Fact).

AUTHORITY
I grant my Agent full power and authority to act on my behalf in all matters relating to my personal and financial affairs, including but not limited to:

1. Real Estate Transactions: To buy, sell, lease, or mortgage any real property I own.
2. Banking Transactions: To conduct any banking transactions on my behalf.
3. Business Operations: To continue or participate in any business I may own.
4. Tax Matters: To prepare and file tax returns, pay taxes, and represent me before tax authorities.
5. Legal Actions: To commence, defend, or settle legal actions on my behalf.

DURABILITY
This Power of Attorney shall not be affected by my subsequent disability or incapacity.`,
      popularity: 285
    },
    {
      id: '4',
      name: 'Living Will',
      description: 'Document your medical care preferences if you become incapacitated.',
      type: 'living',
      complexity: 'simple',
      preview: `LIVING WILL / ADVANCE DIRECTIVE

I, [YOUR NAME], being of sound mind, willfully and voluntarily make this declaration as a directive to be followed if I become unable to participate in decisions regarding my medical care.

LIFE-SUSTAINING TREATMENT
If I should have an incurable and irreversible condition that has been diagnosed by two physicians and that will result in my death within a relatively short time without the administration of life-sustaining treatment or has produced a coma or persistent vegetative state from which there is no reasonable probability of recovery, I direct that life-sustaining treatment be withheld or withdrawn.

ARTIFICIAL NUTRITION AND HYDRATION
In the circumstances described above, I also direct that artificial nutrition and hydration be withheld or withdrawn when the application of such would serve only to prolong artificially the process of my dying.

PAIN RELIEF
I direct that treatment for alleviation of pain or discomfort be provided at all times, even if it hastens my death.`,
      popularity: 215
    },
    {
      id: '5',
      name: 'Family Trust',
      description: 'Protect assets for your family and provide for minor children.',
      type: 'trust',
      complexity: 'complex',
      preview: `FAMILY TRUST AGREEMENT

This Trust Agreement, dated [DATE], is between [YOUR NAME] (the "Grantor") and [TRUSTEE NAME] (the "Trustee").

ARTICLE I: ESTABLISHMENT OF TRUST
The Grantor hereby transfers to the Trustee the property described in Schedule A, to be held in trust for the benefit of the Grantor's family under the terms of this Agreement.

ARTICLE II: ADMINISTRATION DURING GRANTOR'S LIFETIME
During the Grantor's lifetime, the Trustee shall distribute to or apply for the benefit of the Grantor such amounts of the net income and principal as the Grantor may direct from time to time.

ARTICLE III: ADMINISTRATION AFTER GRANTOR'S DEATH
Upon the Grantor's death, the Trustee shall divide the trust estate into separate shares, one for each of the Grantor's children then living, and one for the then living descendants, collectively, of each of the Grantor's deceased children.`,
      popularity: 180
    },
    {
      id: '6',
      name: 'Healthcare Directive',
      description: 'Comprehensive medical directive including HIPAA authorization.',
      type: 'living',
      complexity: 'standard',
      preview: `HEALTHCARE DIRECTIVE AND HIPAA AUTHORIZATION

I, [YOUR NAME], make this Healthcare Directive to exercise my right to determine the course of my health care and to provide clear and convincing proof of my treatment decisions when I cannot communicate my wishes.

PART 1: APPOINTMENT OF HEALTHCARE AGENT
I appoint [AGENT NAME] as my Healthcare Agent, with full authority to make decisions for me regarding my health care.

PART 2: INSTRUCTIONS FOR HEALTHCARE
If I am unable to make or communicate decisions regarding my health care, and I have an incurable and irreversible condition that will result in my death within a relatively short time, or I become unconscious and, to a reasonable degree of medical certainty, will not regain consciousness, or the risks and burdens of treatment outweigh the expected benefits, I direct that my healthcare providers administer only comfort care.

PART 3: HIPAA AUTHORIZATION
I authorize any healthcare provider, medical facility, pharmacy, insurance company, and any other covered entity under HIPAA to disclose and release complete copies of my protected health information to my Healthcare Agent.`,
      popularity: 150
    }
  ];
  
  // Filter templates based on active tab and search query
  const filteredTemplates = templates.filter(template => {
    const matchesTab = activeTab === 'all' || template.type === activeTab;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });
  
  // Handle template preview
  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };
  
  // Handle template selection (would navigate to creation page with template)
  const handleUseTemplate = (template: Template) => {
    navigate('/will/create', { state: { template } });
  };
  
  return (
    <Layout>
      <div className="container max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Legal Templates</h1>
        <p className="text-gray-600 mb-8">
          Browse and use our professionally crafted legal templates for your estate planning.
        </p>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              type="search" 
              placeholder="Search templates..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">All Templates</TabsTrigger>
              <TabsTrigger value="will">Wills</TabsTrigger>
              <TabsTrigger value="trust">Trusts</TabsTrigger>
              <TabsTrigger value="power">Power of Attorney</TabsTrigger>
              <TabsTrigger value="living">Living Wills</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <motion.div 
              key={template.id}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <TemplateCard
                title={template.name}
                description={template.description}
                complexity={template.complexity}
                popularity={template.popularity}
                onUse={() => handleUseTemplate(template)}
                onPreview={() => handlePreview(template)}
              />
            </motion.div>
          ))}
        </div>
        
        {filteredTemplates.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No templates found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
        
        {/* Template Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTemplate?.name}</DialogTitle>
              <DialogDescription>
                {selectedTemplate?.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="my-4">
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200 font-mono text-sm whitespace-pre-wrap">
                {selectedTemplate?.preview}
              </div>
            </div>
            
            <DialogFooter>
              <div className="flex justify-between w-full">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setShowPreview(false);
                  handleUseTemplate(selectedTemplate as Template);
                }}>
                  Use This Template <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
