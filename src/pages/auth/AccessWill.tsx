
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Key, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function AccessWill() {
  const [accessCode, setAccessCode] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle access code verification here
    console.log('Verify access code:', accessCode);
  };
  
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
          <div className="text-center mb-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-willtank-50">
              <Key className="h-8 w-8 text-willtank-600" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Access a Will</h1>
            <p className="mt-2 text-gray-600">
              Enter the access code provided to you to view the will.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="accessCode" className="text-sm font-medium">
                Access Code
              </label>
              <Input
                id="accessCode"
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter the access code"
                className="w-full"
                required
              />
            </div>
            
            <Button type="submit" className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              Access Will
            </Button>
            
            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-willtank-600 hover:underline">
                Return to Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
