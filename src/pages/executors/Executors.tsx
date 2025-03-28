
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Mail, AlertCircle, Check, Trash2, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Executors() {
  const [executors, setExecutors] = useState([
    {
      name: "Jamie Morgan",
      email: "jamie.morgan@example.com",
      relationship: "Spouse",
      status: "Verified",
      primary: true
    },
    {
      name: "Casey Morgan",
      email: "casey.morgan@example.com",
      relationship: "Sibling",
      status: "Pending",
      primary: false
    }
  ]);
  
  const [beneficiaries, setBeneficiaries] = useState([
    {
      name: "Taylor Morgan",
      relationship: "Child",
      allocation: "50%",
      status: "Primary"
    },
    {
      name: "Riley Morgan",
      relationship: "Child",
      allocation: "50%",
      status: "Primary"
    },
    {
      name: "Alex Foundation",
      relationship: "Charity",
      allocation: "Contingent",
      status: "Secondary"
    }
  ]);

  const resendInvitation = (email: string) => {
    // Logic to resend invitation
    console.log(`Resending invitation to ${email}`);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Beneficiaries & Executors</h1>
            <p className="text-gray-600">Manage the people who will receive your assets and execute your will.</p>
          </div>
          
          <div className="flex gap-2">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Person
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Executors Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center mb-4">
              <Users className="text-willtank-700 mr-2" size={20} />
              <h2 className="text-xl font-semibold">Will Executors</h2>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {executors.map((executor, index) => (
                <div 
                  key={index} 
                  className={`p-6 ${index !== executors.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium">{executor.name}</h3>
                        {executor.primary && (
                          <span className="ml-2 px-2 py-0.5 bg-willtank-100 text-willtank-800 rounded-full text-xs font-medium">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm">{executor.relationship}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center">
                    <Mail className="text-gray-400 mr-2" size={16} />
                    <span className="text-sm">{executor.email}</span>
                  </div>
                  
                  {executor.status === "Verified" ? (
                    <div className="mt-4 flex items-center text-green-600">
                      <Check size={16} className="mr-1" />
                      <span className="text-sm font-medium">Verified</span>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center text-amber-600">
                        <AlertCircle size={16} className="mr-1" />
                        <span className="text-sm font-medium">Pending Verification</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => resendInvitation(executor.email)}
                      >
                        Resend Invitation
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Beneficiaries Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center mb-4">
              <Users className="text-willtank-700 mr-2" size={20} />
              <h2 className="text-xl font-semibold">Beneficiaries</h2>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 grid grid-cols-4 gap-4 font-medium text-sm text-gray-500 border-b border-gray-100 bg-gray-50">
                <div>Name</div>
                <div>Relationship</div>
                <div>Allocation</div>
                <div>Status</div>
              </div>
              
              {beneficiaries.map((beneficiary, index) => (
                <div 
                  key={index}
                  className={`p-4 grid grid-cols-4 gap-4 items-center ${index !== beneficiaries.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="font-medium">{beneficiary.name}</div>
                  <div className="text-gray-600 text-sm">{beneficiary.relationship}</div>
                  <div className="text-gray-600 text-sm">{beneficiary.allocation}</div>
                  <div>
                    <span 
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        beneficiary.status === "Primary" 
                          ? "bg-willtank-100 text-willtank-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {beneficiary.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
