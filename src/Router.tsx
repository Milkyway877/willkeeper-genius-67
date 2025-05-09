import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { UserProfile, SignIn, SignUp, ClerkLoaded, ClerkLoading } from "@clerk/clerk-react";
import { ClerkProtectedRoute } from './components/auth/ClerkProtectedRoute';
import Documentation from './pages/Documentation';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import API from './pages/API';
import FAQ from './pages/FAQ';
import VerifyTrustedContact from './pages/VerifyTrustedContact';
import VerifyEmail from './pages/auth/VerifyEmail';

// Import actual implemented pages instead of placeholders
import Dashboard from './pages/Dashboard';
import Wills from './pages/wills/Wills';
import Will from './pages/will/Will';
import Tank from './pages/tank/Tank';
import CheckIns from './pages/CheckIns';
import Settings from './pages/settings/Settings';
import IDSecurity from './pages/security/IDSecurity';
import TestDeathVerificationPage from './pages/TestDeathVerification';

// Create placeholder pages for development (only keeping what's still needed)
const Home = () => <Index />;
const About = () => <div>About Page</div>;
const Pricing = () => <div>Pricing Page</div>;
const Terms = () => <div>Terms Page</div>;
const Privacy = () => <div>Privacy Page</div>;
const Help = () => <div>Help Center</div>;
const NotFoundPage = () => <NotFound />;
const SearchPage = () => <div>Search Page</div>;
const Billing = () => <div>Billing Page</div>;
const Corporate = () => <div>For Corporations Page</div>;

// Define Clerk Components for routes
const SignInPage = () => (
  <>
    <ClerkLoading>
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    </ClerkLoading>
    <ClerkLoaded>
      <SignIn redirectUrl="/dashboard" />
    </ClerkLoaded>
  </>
);

const SignUpPage = () => (
  <>
    <ClerkLoading>
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    </ClerkLoading>
    <ClerkLoaded>
      <SignUp redirectUrl="/dashboard" />
    </ClerkLoaded>
  </>
);

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
        
        {/* Direct routes for Clerk's default paths */}
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        
        {/* Redirect legacy auth routes to Clerk's default paths */}
        <Route path="/auth/signin" element={<Navigate to="/sign-in" replace />} />
        <Route path="/auth/signup" element={<Navigate to="/sign-up" replace />} />
        <Route path="/auth/verify-email-address" element={<Navigate to="/verify-email" replace />} />
        <Route path="/auth/signup/verify-email-address" element={<Navigate to="/verify-email" replace />} />
        
        {/* Let Clerk handle all auth routes */}
        <Route path="/user-profile" element={
          <ClerkProtectedRoute>
            <UserProfile />
          </ClerkProtectedRoute>
        } />
        
        {/* Protected Routes with actual implemented components */}
        <Route path="/dashboard" element={
          <ClerkProtectedRoute>
            <Dashboard />
          </ClerkProtectedRoute>
        } />
        <Route path="/settings" element={
          <ClerkProtectedRoute>
            <Settings />
          </ClerkProtectedRoute>
        } />
        <Route path="/wills" element={
          <ClerkProtectedRoute>
            <Wills />
          </ClerkProtectedRoute>
        } />
        <Route path="/will" element={
          <ClerkProtectedRoute>
            <Will />
          </ClerkProtectedRoute>
        } />
        <Route path="/will/:id" element={
          <ClerkProtectedRoute>
            <Will />
          </ClerkProtectedRoute>
        } />
        <Route path="/will/create" element={
          <ClerkProtectedRoute>
            <Will />
          </ClerkProtectedRoute>
        } />
        <Route path="/will/edit/:id" element={
          <ClerkProtectedRoute>
            <Will />
          </ClerkProtectedRoute>
        } />
        <Route path="/security" element={
          <ClerkProtectedRoute>
            <IDSecurity />
          </ClerkProtectedRoute>
        } />
        <Route path="/tank" element={
          <ClerkProtectedRoute>
            <Tank />
          </ClerkProtectedRoute>
        } />
        <Route path="/future-messages" element={
          <ClerkProtectedRoute>
            <Tank />
          </ClerkProtectedRoute>
        } />
        <Route path="/check-ins" element={
          <ClerkProtectedRoute>
            <CheckIns />
          </ClerkProtectedRoute>
        } />
        <Route path="/billing" element={
          <ClerkProtectedRoute>
            <Billing />
          </ClerkProtectedRoute>
        } />
        <Route path="/corporate" element={
          <ClerkProtectedRoute>
            <Corporate />
          </ClerkProtectedRoute>
        } />
        <Route path="/test-death-verification" element={
          <ClerkProtectedRoute>
            <TestDeathVerificationPage />
          </ClerkProtectedRoute>
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
