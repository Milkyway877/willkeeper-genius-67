
import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed right-4 bottom-4 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-4 max-w-sm w-full border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">AI Assistant</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              How can I help you today with your will or documents?
            </p>
            <div className="flex">
              <input
                type="text"
                placeholder="Ask a question..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button className="bg-black text-white dark:bg-white dark:text-black px-3 py-2 rounded-r-md text-sm font-medium">
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black text-white dark:bg-white dark:text-black p-3 rounded-full shadow-lg hover:opacity-90 transition-opacity"
      >
        <Bot size={24} />
      </button>
    </div>
  );
}
