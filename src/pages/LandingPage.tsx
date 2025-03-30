
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6 flex justify-between items-center">
        <div className="text-2xl font-bold">WillTank</div>
        <div className="space-x-4">
          <Link to="/auth/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link to="/auth/register">
            <Button>Register</Button>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl text-center px-6">
          <h1 className="text-5xl font-bold mb-6">Welcome to WillTank</h1>
          <p className="text-xl mb-8">The most advanced will storage and legacy management platform.</p>
          <div className="flex justify-center space-x-4">
            <Link to="/auth/register">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline">Learn More</Button>
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="p-6 text-center text-gray-600">
        &copy; {new Date().getFullYear()} WillTank. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
