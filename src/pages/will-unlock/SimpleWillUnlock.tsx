
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield, Users, FileText, Phone, ArrowRight } from 'lucide-react';
import { ContactSupportButton } from '@/components/common/ContactSupportButton';

export default function SimpleWillUnlock() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12">
      <div className="max-w-lg w-full mx-4">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-willtank-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Executor Information &amp; Will Access</h1>
          <p className="text-gray-600 mt-2 max-w-xl mx-auto">
            WillTank secures every will with human-based advanced verification.
            <br />
            <span className="font-semibold text-willtank-700">
              Executors must follow our simple, secure process to gain access.
            </span>
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Executor Verification Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-7">
              <div className="flex items-start">
                <div className="mt-1 mr-3 flex-shrink-0">
                  <FileText className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                  <strong className="block mb-1">1. Gather Required Documentation:</strong>
                  <ul className="list-disc ml-6 text-gray-700 text-sm">
                    <li>Death certificate</li>
                    <li>Photo ID (executor or solicitor)</li>
                    <li>Legal document appointing you as executor</li>
                    <li>Contact details for the deceased</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 mr-3 flex-shrink-0">
                  <Users className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                  <strong className="block mb-1">2. Human Verification:</strong>
                  <ul className="list-disc ml-6 text-gray-700 text-sm">
                    <li>
                      <span className="font-medium">Our Verification Support Team</span> will confirm details with <span className="font-medium">multiple trusted contacts</span> named in the will.
                    </li>
                    <li>
                      <span className="font-medium">No automated unlocks</span> — Every access request is personally reviewed for security and accuracy.
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 mr-3 flex-shrink-0">
                  <Phone className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                  <strong className="block mb-1">3. Contact Us to Begin:</strong>
                  <span className="text-gray-700 text-sm">
                    Start the process using the button below.
                    You’ll speak directly with a trained WillTank verification team member -- no bots!
                  </span>
                </div>
              </div>
              <div className="pt-6 flex justify-center">
                <ContactSupportButton className="w-full max-w-xs text-base py-3 px-5" />
              </div>
              <div className="pt-3 pb-2">
                <p className="text-gray-500 text-xs text-center">
                  <ArrowRight className="inline-block h-4 w-4 mr-1 align-text-bottom" /> 
                  Typically <span className="font-semibold text-gray-700">all verifications are completed in 1–3 business days.</span>
                  <br />
                  After successful verification, you’ll receive a secure ZIP file with the will and any associated media.
                </p>
                <p className="text-gray-400 text-[11px] text-center mt-2">
                  Access to these documents is strictly managed — WillTank records every step to prevent unauthorized access and ensure privacy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="text-center mt-8">
          <div className="inline-flex gap-2 bg-gray-100 rounded px-3 py-2 text-xs text-gray-700 border border-gray-200 items-center">
            <Shield className="h-4 w-4 text-willtank-600" /> 
            <span>
              This human-verified process protects everyone’s legal rights &amp; dignity.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
