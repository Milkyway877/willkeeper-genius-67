
import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
      {isOpen ? (
        <div className="flex flex-col bg-white rounded-lg shadow-hard w-80 md:w-96 h-96 overflow-hidden animate-scale-in">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-willtank-500 text-white">
            <h3 className="font-medium text-sm">AI Assistant</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/10"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="bg-gray-100 p-3 rounded-lg mb-4 text-sm">
              <p>Hello! I'm your WillTank AI assistant. How can I help you with your estate planning today?</p>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Type your message..."
                className="flex-1 py-2 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-willtank-500/50 focus:border-willtank-500"
              />
              <button className="p-2 rounded-lg bg-willtank-500 text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)} 
          className="p-3 rounded-full bg-willtank-500 text-white shadow-blue-glow hover:bg-willtank-600 transition-all"
        >
          <MessageCircle size={20} />
        </button>
      )}
    </div>
  );
}
