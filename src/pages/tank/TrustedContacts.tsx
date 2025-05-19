
import React, { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { TrustedContacts as TrustedContactsComponent } from '@/components/death-verification/TrustedContacts';
import { useNavigate } from 'react-router-dom';

export default function TrustedContacts() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the trusted contacts tab in the Tank page
    navigate('/tank', { 
      replace: true,
      state: { activeTab: 'trusted-contacts' } 
    });
  }, [navigate]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Trusted Contacts</h1>
        <TrustedContactsComponent onContactsChange={() => {}} />
      </div>
    </Layout>
  );
}
