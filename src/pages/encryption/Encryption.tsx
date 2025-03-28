
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Key, Download, RefreshCw, ShieldCheck, AlertTriangle, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Encryption() {
  const encryptionKeys = [
    {
      name: "Primary Encryption Key",
      type: "AES-256",
      status: "Active",
      lastRotated: "2 months ago",
      id: "aes-256-prim-89af3"
    },
    {
      name: "Recovery Key",
      type: "RSA-4096",
      status: "Active",
      lastRotated: "2 months ago",
      id: "rsa-4096-recov-23bc7"
    },
    {
      name: "Document Signing Key",
      type: "Ed25519",
      status: "Active",
      lastRotated: "2 months ago",
      id: "ed-25519-sign-34cd9"
    }
  ];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Encryption Keys</h1>
            <p className="text-gray-600">Manage the encryption keys that secure your sensitive data.</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Rotate Keys
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Backup Keys
            </Button>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start">
            <div className="mr-4 mt-1">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium text-yellow-800 mb-2">Important Security Notice</h3>
              <p className="text-yellow-700 text-sm">
                Your encryption keys secure all your sensitive documents. It's critical to back them up in a safe location. 
                If you lose access to these keys, you may not be able to decrypt your documents. We recommend downloading 
                a backup and storing it securely.
              </p>
            </div>
          </div>
        </motion.div>
        
        <div className="space-y-6">
          {encryptionKeys.map((key, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center">
                  <Key className="text-willtank-700 mr-2" size={18} />
                  <h3 className="font-medium">{key.name}</h3>
                </div>
                <div className="flex items-center">
                  <ShieldCheck className="text-green-500 mr-1" size={16} />
                  <span className="text-xs font-medium text-green-600">{key.status}</span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Key Type</p>
                    <p className="font-medium">{key.type}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Last Rotated</p>
                    <p className="font-medium">{key.lastRotated}</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Key ID</p>
                    <div className="flex items-center">
                      <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono mr-2">
                        {key.id}
                      </code>
                      <button className="text-willtank-500 hover:text-willtank-700 transition-colors">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button variant="outline" size="sm">Download Key</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
