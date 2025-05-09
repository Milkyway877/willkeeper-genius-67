
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet, Navigate } from 'react-router-dom';
import { SignIn, SignUp, UserProfile, useAuth } from "@clerk/clerk-react";
import { AuthLayout } from './components/auth/AuthLayout';
import { ClerkProtectedRoute } from './components/auth/ClerkProtectedRoute';
import Documentation from './pages/Documentation';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import API from './pages/API';
import FAQ from './pages/FAQ';
import VerifyTrustedContact from './pages/VerifyTrustedContact';

// Create placeholder pages for development
const Home = () => <Index />;
const About = () => <div>About Page</div>;
const Pricing = () => <div>Pricing Page</div>;
const Terms = () => <div>Terms Page</div>;
const Privacy = () => <div>Privacy Page</div>;
const Help = () => <div>Help Center</div>;
const NotFoundPage = () => <NotFound />;
const Dashboard = () => <div>Dashboard Page</div>;
const Settings = () => <div>Settings Page</div>;
const Will = () => <div>Will Page</div>;
const FutureMessages = () => <div>Future Messages Page</div>;
const LegacyVault = () => <div>Legacy Vault Page</div>;
const CheckIns = () => <div>Check-Ins Page</div>;
const TestDeathVerificationPage = () => <div>Test Death Verification Page</div>;
const SearchPage = () => <div>Search Page</div>;

// Auth layout wrapper component that passes children to AuthLayout
const AuthLayoutWrapper = ({ children }) => {
  return (
    <AuthLayout
      title="Access Your Account"
      subtitle="Secure authentication with Clerk"
    >
      {children}
    </AuthLayout>
  );
};

// Protected route that requires authentication
const ProtectedRoute = ({ children }) => {
  const { isLoaded, userId, isSignedIn } = useAuth();
  
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }
  
  return <>{children}</>;
};

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/api" element={<API />} />
        <Route path="/help" element={<Help />} />
        
        {/* Clerk Authentication Routes */}
        <Route path="/sign-in" element={
          <AuthLayoutWrapper>
            <SignIn routing="path" path="/sign-in" />
          </AuthLayoutWrapper>
        } />
        <Route path="/sign-up" element={
          <AuthLayoutWrapper>
            <SignUp routing="path" path="/sign-up" />
          </AuthLayoutWrapper>
        } />
        <Route path="/user-profile" element={
          <ProtectedRoute>
            <UserProfile routing="path" path="/user-profile" />
          </ProtectedRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/will" element={
          <ProtectedRoute>
            <Will />
          </ProtectedRoute>
        } />
        <Route path="/future-messages" element={
          <ProtectedRoute>
            <FutureMessages />
          </ProtectedRoute>
        } />
        <Route path="/legacy-vault" element={
          <ProtectedRoute>
            <LegacyVault />
          </ProtectedRoute>
        } />
        <Route path="/check-ins" element={
          <ProtectedRoute>
            <CheckIns />
          </ProtectedRoute>
        } />
        <Route path="/test-death-verification" element={
          <ProtectedRoute>
            <TestDeathVerificationPage />
          </ProtectedRoute>
        } />

        <Route
          path="/verify/trusted-contact/:token"
          element={<VerifyTrustedContact />}
        />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
