import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">My Wills</h2>
            <p className="text-gray-600 mb-4">Manage and view all your will documents.</p>
            <Link to="/wills">
              <Button className="w-full">View My Wills</Button>
            </Link>
          </div>
          
          {/* Add other dashboard cards as needed */}
        </div>
      </div>
    </Layout>
  );
}
