
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Dashboard content */}
          
          {/* Death Verification Testing Card */}
          <div className="border rounded-lg shadow-sm p-6 bg-white">
            <div className="flex items-center mb-4">
              <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
              <h3 className="font-medium text-lg">Death Verification</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Test the death verification flow to ensure your will is properly protected and can be accessed when needed.
            </p>
            <Link to="/test-death-verification">
              <Button variant="outline" className="w-full">
                Test Death Verification Flow
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
