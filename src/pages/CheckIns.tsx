
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RedirectFromCheckIns() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard since check-ins functionality has been removed
    navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting...</p>
    </div>
  );
}
