
import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Shield, FileText, Users, Key } from 'lucide-react';

export default function Home() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to WillTank</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your trusted platform for secure will creation and legacy management.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/auth/signin">
              <Button size="lg">Sign In</Button>
            </Link>
            <Link to="/auth/signup">
              <Button variant="outline" size="lg">Create Account</Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center mr-3">
                <FileText className="text-willtank-600" size={20} />
              </div>
              <h3 className="font-medium">Will Creation</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Create and manage your will with easy-to-use templates and guidance.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center mr-3">
                <Users className="text-willtank-600" size={20} />
              </div>
              <h3 className="font-medium">Executor Setup</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Designate trusted executors to handle your estate with clear instructions.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center mr-3">
                <Shield className="text-willtank-600" size={20} />
              </div>
              <h3 className="font-medium">Secure Storage</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Your documents are encrypted and securely stored with industry-leading protection.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center mr-3">
                <Key className="text-willtank-600" size={20} />
              </div>
              <h3 className="font-medium">Death Verification</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Multiple verification layers ensure your will is only accessed when needed.
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">Ready to secure your legacy?</h2>
          <Link to="/auth/signup">
            <Button size="lg">Get Started Today</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
