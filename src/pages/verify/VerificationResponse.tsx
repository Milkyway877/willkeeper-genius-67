
import React from 'react';

interface VerificationResponseProps {
  invitationType: 'invitation' | 'status';
}

const VerificationResponse: React.FC<VerificationResponseProps> = ({ invitationType }) => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        {invitationType === 'invitation' ? 'Invitation Response' : 'Status Check Response'}
      </h1>
      <p>
        {invitationType === 'invitation' 
          ? 'Please respond to the invitation you received.' 
          : 'Please confirm the status of the person who added you as a contact.'}
      </p>
      {/* Verification response form will be implemented here */}
    </div>
  );
};

export default VerificationResponse;
