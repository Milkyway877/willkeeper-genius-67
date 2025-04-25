
import React from 'react';
import { Link } from 'react-router-dom';
import { SignupForm } from "@/components/ui/signup-form";

export default function Signup() {
  return (
    <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center">
      <SignupForm />
      <div className="absolute bottom-8 text-center text-gray-400">
        Already have an account? <Link to="/auth/login" className="text-white hover:underline">Login here</Link>
      </div>
    </div>
  );
}
