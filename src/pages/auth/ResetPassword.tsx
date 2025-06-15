
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function ResetPassword() {
  const navigate = useNavigate();
  useEffect(() => {
    // No longer supported (token-based), always redirect to /auth/recover
    navigate('/auth/recover');
  }, [navigate]);
  return null;
}
