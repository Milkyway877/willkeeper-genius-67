
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function Confirm() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Confirmation Successful</h1>
            <p className="mt-2 text-gray-600">Your action has been confirmed successfully.</p>
            <div className="mt-6">
              <Link to="/dashboard">
                <Button className="w-full">Return to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
