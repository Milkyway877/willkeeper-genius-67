
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import TestDeathVerificationFlow from '@/components/death-verification/TestDeathVerificationFlow';

export default function TestDeathVerificationPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Death Verification System Testing</h1>
          <p className="text-gray-600">
            Use this page to test the death verification flow in a controlled environment.
          </p>
        </div>
        
        <TestDeathVerificationFlow />
      </div>
    </Layout>
  );
}
