import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, HelpCircle, Book, MessageSquare, FileText, Mail, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Help() {
  const { toast } = useToast();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showGuideContent, setShowGuideContent] = useState(false);
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const popularTopics = [
    {
      title: "Getting Started with WillTank",
      description: "Learn how to create your account and set up your first will.",
      icon: <Book className="h-5 w-5 text-willtank-500" />,
      slug: "getting-started",
      content: "Creating your WillTank account is the first step toward securing your future. Follow these simple steps to get started:\n\n1. Sign up with your email address\n2. Verify your identity with our secure verification process\n3. Choose your subscription plan\n4. Create your first will using our intuitive template system\n\nOur step-by-step process makes it easy to ensure your wishes are documented legally and securely."
    },
    {
      title: "Managing Your Documents",
      description: "How to update, share, and manage your estate planning documents.",
      icon: <FileText className="h-5 w-5 text-willtank-500" />,
      slug: "managing-documents",
      content: "Keeping your documents up-to-date is essential. WillTank makes document management simple with these features:\n\n• Document versioning to track changes\n• Secure sharing with authorized individuals\n• Digital signatures and timestamps\n• Document preview and export options\n\nAccess all your documents from the Documents tab in your dashboard, and make updates whenever your circumstances change."
    },
    {
      title: "Security & Privacy",
      description: "Learn about our security measures and how we protect your data.",
      icon: <HelpCircle className="h-5 w-5 text-willtank-500" />,
      slug: "security-privacy",
      content: "Your privacy and security are our top priorities. WillTank implements multiple layers of protection:\n\n• End-to-end encryption for all documents\n• Two-factor authentication\n• Regular security audits and updates\n• Compliance with global data protection regulations\n\nWe never share your information with third parties without your explicit consent. Your data remains yours."
    },
    {
      title: "Executors & Beneficiaries",
      description: "How to add and manage your executors and beneficiaries.",
      icon: <MessageSquare className="h-5 w-5 text-willtank-500" />,
      slug: "executors-beneficiaries",
      content: "Managing your executors and beneficiaries is a critical part of estate planning. With WillTank, you can:\n\n• Add multiple executors with different access levels\n• Assign specific assets to individual beneficiaries\n• Send secure notifications to executors and beneficiaries\n• Update contact information and roles as needed\n\nYour executors will receive clear instructions on how to access and execute your will when the time comes."
    },
    {
      title: "Account & Billing",
      description: "Manage your subscription, payment methods, and account settings.",
      icon: <Mail className="h-5 w-5 text-willtank-500" />,
      slug: "account-billing",
      content: "Managing your WillTank subscription is straightforward. In your account settings, you can:\n\n• Update your payment information\n• Change subscription plans\n• View billing history and download invoices\n• Set up automatic renewals\n\nWe offer flexible plans to meet your needs, from basic will creation to comprehensive estate planning services."
    },
    {
      title: "Legal Requirements by Region",
      description: "Understand the legal requirements for your will in your jurisdiction.",
      icon: <FileText className="h-5 w-5 text-willtank-500" />,
      slug: "legal-requirements",
      content: "Legal requirements for wills vary by jurisdiction. WillTank automatically adjusts to your location's requirements, including:\n\n• Witness requirements and digital witnessing options\n• Legal language specific to your region\n• Age and capacity requirements\n• Rules for valid signature and execution\n\nOur system is regularly updated to reflect changes in legal requirements across different regions."
    }
  ];

  const faqs = [
    {
      question: "How secure is WillTank?",
      answer: "WillTank uses bank-grade encryption (AES-256) to protect your documents and personal information. We implement rigorous security measures including two-factor authentication, secure data centers, and regular security audits to ensure your data remains private and protected."
    },
    {
      question: "Is my will legally binding if I create it through WillTank?",
      answer: "Yes, wills created through WillTank are designed to be legally binding when properly executed according to your jurisdiction's requirements. We provide clear guidance on witnessing, signing, and notarization based on your location. However, for complex estates, we recommend consulting with a legal professional."
    },
    {
      question: "How do I update my will after creating it?",
      answer: "You can update your will anytime by logging into your WillTank account, navigating to your documents, and selecting the will you want to modify. Click 'Edit Document' to make changes. Once finalized, you'll need to follow the proper execution procedures again (printing, signing, witnessing) to make the new version legally valid."
    },
    {
      question: "What happens to my documents if I cancel my subscription?",
      answer: "If you cancel your subscription, you'll maintain read-only access to your documents for 30 days. During this time, you can download all your documents. After 30 days, your documents will be archived but can be restored if you reactivate your account within 1 year."
    },
    {
      question: "How do my executors access my will when needed?",
      answer: "You can set up trusted contacts who will receive secure access instructions when needed. Alternatively, you can provide your executors with sealed instructions for accessing your WillTank account. We also offer a Legacy Contact feature, allowing you to designate someone who can request limited access to specific documents after providing proof of your passing."
    }
  ];

  const handleTopicClick = (slug: string) => {
    const topic = popularTopics.find(t => t.slug === slug);
    setSelectedTopic(slug);
    setShowGuideContent(true);
    
    toast({
      title: "Help Topic Selected",
      description: `Viewing guide: ${topic?.title}`,
    });
  };

  return (
    <div className="container px-4 md:px-6">
      <motion.div 
        className="text-center mb-10"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
          Find answers to your questions about using WillTank for your estate planning.
        </p>
        
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search help articles..." 
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-willtank-500 focus:border-transparent"
          />
        </div>
      </motion.div>
      
      {showGuideContent && selectedTopic && (
        <motion.div 
          className="bg-white rounded-xl shadow-md mb-10 p-6 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4"
            onClick={() => setShowGuideContent(false)}
          >
            <X size={18} />
          </Button>
          
          {popularTopics.find(t => t.slug === selectedTopic) && (
            <>
              <h2 className="text-2xl font-bold mb-4">{popularTopics.find(t => t.slug === selectedTopic)?.title}</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{popularTopics.find(t => t.slug === selectedTopic)?.content}</p>
              </div>
            </>
          )}
        </motion.div>
      )}
      
      <motion.div 
        className="mb-16"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular Topics</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularTopics.map((topic, index) => (
            <motion.div 
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => handleTopicClick(topic.slug)}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 rounded-full bg-willtank-50">
                  {topic.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">{topic.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{topic.description}</p>
                  <div 
                    className="text-sm text-willtank-600 hover:text-willtank-700 font-medium inline-flex items-center"
                  >
                    Learn more <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      <motion.div 
        className="mb-16"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
          {faqs.map((faq, index) => (
            <div key={index} className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            onClick={() => {
              toast({
                title: "FAQs",
                description: "Viewing all frequently asked questions",
              });
            }}
          >
            View All FAQs
          </Button>
        </div>
      </motion.div>
      
      <motion.div 
        className="bg-gradient-to-br from-willtank-50 to-gray-50 rounded-2xl p-8"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="md:flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Still Need Help?</h2>
            <p className="text-gray-600 mb-4 md:mb-0 max-w-xl">
              Our support team is available to assist you with any questions or concerns about your estate planning documents.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="default" 
              onClick={() => {
                toast({
                  title: "Contact Support",
                  description: "Opening support contact form",
                });
              }}
            >
              Contact Support
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                toast({
                  title: "Community",
                  description: "Joining the WillTank community forum",
                });
              }}
            >
              Join Community
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
