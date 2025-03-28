
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CreditCard, Calendar, Clock, Download, ArrowUp, CheckCircle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Billing() {
  const invoices = [
    { id: "#INV-001", date: "Jun 1, 2023", amount: "$79.99", status: "Paid" },
    { id: "#INV-002", date: "May 1, 2023", amount: "$79.99", status: "Paid" },
    { id: "#INV-003", date: "Apr 1, 2023", amount: "$79.99", status: "Paid" },
  ];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Subscriptions & Billing</h1>
            <p className="text-gray-600">Manage your subscription plan and payment methods.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-medium">Current Plan</h3>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="bg-willtank-100 text-willtank-800 text-xs font-medium px-2.5 py-0.5 rounded-full">PREMIUM PLAN</span>
                  <h2 className="text-2xl font-bold mt-2">$79.99 <span className="text-sm font-normal text-gray-500">/month</span></h2>
                </div>
                
                <Button>
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <CheckCircle className="text-willtank-500 mt-0.5 mr-2" size={16} />
                  <span className="text-sm">Unlimited will creation and updates</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-willtank-500 mt-0.5 mr-2" size={16} />
                  <span className="text-sm">Advanced legal document templates</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-willtank-500 mt-0.5 mr-2" size={16} />
                  <span className="text-sm">AI-powered document generation</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-willtank-500 mt-0.5 mr-2" size={16} />
                  <span className="text-sm">Priority customer support</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-willtank-500 mt-0.5 mr-2" size={16} />
                  <span className="text-sm">Secure document storage with encryption</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex items-center">
                  <Calendar className="text-gray-500 mr-2" size={18} />
                  <span className="text-sm">Your next billing date is <strong>July 1, 2023</strong></span>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-medium">Payment Method</h3>
            </div>
            
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                  <CreditCard className="text-gray-600" size={20} />
                </div>
                <div>
                  <p className="font-medium">Visa ending in 4242</p>
                  <p className="text-sm text-gray-500">Expires 04/25</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                Update Payment Method
              </Button>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-medium">Billing History</h3>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download All
            </Button>
          </div>
          
          <div className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="py-3 px-6 text-left">Invoice</th>
                  <th className="py-3 px-6 text-left">Date</th>
                  <th className="py-3 px-6 text-left">Amount</th>
                  <th className="py-3 px-6 text-left">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((invoice, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium">{invoice.id}</td>
                    <td className="py-4 px-6 text-gray-600">{invoice.date}</td>
                    <td className="py-4 px-6 font-medium">{invoice.amount}</td>
                    <td className="py-4 px-6">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
