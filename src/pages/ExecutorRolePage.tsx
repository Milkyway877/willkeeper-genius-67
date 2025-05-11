
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ExecutorRolePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Executor Information</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-willtank-600" />
            Understanding Your Role as an Executor
          </CardTitle>
          <CardDescription>
            Important information about your responsibilities as a will executor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            As an executor named in a WillTank user's will, you have important legal and ethical 
            responsibilities. When the WillTank user passes away, you will be responsible for 
            carrying out their final wishes as documented in their will.
          </p>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              You will only be contacted if a WillTank user has missed their check-ins and 
              trusted contacts have confirmed their passing.
            </AlertDescription>
          </Alert>
          
          <h3 className="font-medium text-lg mt-6">What to expect:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="font-medium">Initial Contact:</span> You may be contacted by one or 
              more trusted contacts if they believe the WillTank user has passed away.
            </li>
            <li>
              <span className="font-medium">Verification Process:</span> If you need to access the 
              user's will, you will go through a secure verification process involving the trusted 
              contacts.
            </li>
            <li>
              <span className="font-medium">Document Access:</span> Once verified, you will receive 
              temporary access to download the will and related documents.
            </li>
            <li>
              <span className="font-medium">Time Limitation:</span> Your access will be temporary and 
              will expire after the documents are downloaded.
            </li>
          </ul>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-willtank-600" />
            Verification Process
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-willtank-100 rounded-full p-2 mr-4">
                <Clock className="h-5 w-5 text-willtank-600" />
              </div>
              <div>
                <h4 className="font-medium">Step 1: Contact with Trusted Contacts</h4>
                <p className="text-gray-600">
                  After a user misses check-ins, trusted contacts will attempt to verify their status. If they confirm 
                  the person has passed away, they should contact you as the executor.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-willtank-100 rounded-full p-2 mr-4">
                <Shield className="h-5 w-5 text-willtank-600" />
              </div>
              <div>
                <h4 className="font-medium">Step 2: Executor Login</h4>
                <p className="text-gray-600">
                  Visit the executor login page and enter your email and the WillTank user's name. 
                  This will trigger an email to all trusted contacts.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-willtank-100 rounded-full p-2 mr-4">
                <AlertCircle className="h-5 w-5 text-willtank-600" />
              </div>
              <div>
                <h4 className="font-medium">Step 3: PIN Collection</h4>
                <p className="text-gray-600">
                  Each trusted contact will receive a unique PIN. You will need to collect all these PINs 
                  (typically 10) from the trusted contacts.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-willtank-100 rounded-full p-2 mr-4">
                <CheckCircle2 className="h-5 w-5 text-willtank-600" />
              </div>
              <div>
                <h4 className="font-medium">Step 4: Document Access</h4>
                <p className="text-gray-600">
                  After entering all PINs correctly, you will gain temporary access to download the will 
                  and related documents. This access is revoked after the download is complete.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Alert className="mb-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Legal Responsibility</AlertTitle>
        <AlertDescription>
          As an executor, you have a fiduciary duty to act in the best interests of the 
          estate and its beneficiaries. Please consult with a legal professional for guidance 
          on executing your duties properly.
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default ExecutorRolePage;
