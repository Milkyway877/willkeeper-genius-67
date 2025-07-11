
import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export function FloatingHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Don't render on desktop
  if (!isMobile) {
    return null;
  }
  
  const helpItems = [
    { 
      title: 'Getting Started',
      content: 'Learn how to create your first will and set up your account.',
      slug: 'getting-started'
    },
    { 
      title: 'Adding Executors', 
      content: 'Find out how to add and manage the executors of your will.',
      slug: 'executors-beneficiaries'
    },
    { 
      title: 'Security Features',
      content: 'Learn about our bank-grade security features and how to use them.',
      slug: 'security-privacy'
    },
    { 
      title: 'Contact Support',
      content: 'Get in touch with our support team for personalized assistance.',
      slug: 'account-billing'
    }
  ];

  const handleHelpItemClick = (slug: string) => {
    setIsOpen(false);
    // Navigate to the help page with the specific guide pre-selected
    navigate(`/help?topic=${slug}`);
  };
  
  return (
    <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50">
      {isOpen ? (
        <div className="flex flex-col bg-white rounded-lg shadow-hard w-80 h-auto overflow-hidden animate-scale-in">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-medium">Help Center</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto">
            <div className="space-y-3">
              {helpItems.map((item, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-lg border border-gray-200 hover:border-willtank-200 hover:bg-willtank-50 cursor-pointer transition-all"
                  onClick={() => handleHelpItemClick(item.slug)}
                >
                  <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-600">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)} 
          className="p-3 rounded-full bg-white text-willtank-600 shadow-soft hover:shadow-medium transition-all"
        >
          <HelpCircle size={20} />
        </button>
      )}
    </div>
  );
}
