
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { UserProfile } from "@clerk/clerk-react";
import { ClerkProtectedRoute } from './components/auth/ClerkProtectedRoute';
import Documentation from './pages/Documentation';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import API from './pages/API';
import FAQ from './pages/FAQ';
import VerifyTrustedContact from './pages/VerifyTrustedContact';
import SignInPage from './pages/auth/SignIn';
import SignUpPage from './pages/auth/SignUp';
import Dashboard from './pages/Dashboard';
import WillsPage from './pages/wills/Wills';
import TankPage from './pages/tank/Tank';
import CheckInsPage from './pages/CheckIns';
import IDSecurityPage from './pages/security/IDSecurity';
import BillingPage from './pages/billing/Billing';
import Settings from './pages/settings/Settings';
import Help from './pages/Help';
import Corporate from './pages/Corporate';

// Import will-related components
import Will from './pages/will/Will';
import WillCreation from './pages/will/WillCreation';
import TemplateWillCreationPage from './pages/will/TemplateWillCreationPage';
import { WillVideoCreation } from './pages/will/WillVideoCreation';

// Import tank-related components
import TankCreation from './pages/tank/TankCreation';
import TankMessageDetail from './pages/tank/TankMessageDetail';

// Create placeholder pages for development
const Home = () => <Index />;
const About = () => <div>About Page</div>;
const Pricing = () => <div>Pricing Page</div>;
const Terms = () => <div>Terms Page</div>;
const Privacy = () => <div>Privacy Page</div>;
const NotFoundPage = () => <NotFound />;
const TestDeathVerificationPage = () => <div>Test Death Verification Page</div>;
const SearchPage = () => <div>Search Page</div>;

function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
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
        <Route path="/corporate" element={<Corporate />} />
        
        {/* Auth routes */}
        <Route path="/auth/signin" element={<SignInPage />} />
        <Route path="/auth/signin/*" element={<SignInPage />} />
        <Route path="/auth/signup" element={<SignUpPage />} />
        <Route path="/auth/signup/*" element={<SignUpPage />} />
        <Route path="/auth/signup/verify-email-address" element={<SignUpPage />} />
        
        {/* Verification routes */}
        <Route path="/verify/trusted-contact/:token" element={<VerifyTrustedContact />} />
        
        {/* Protected routes - now rendered directly */}
        <Route 
          path="/user-profile" 
          element={
            <ClerkProtectedRoute>
              <UserProfile routing="path" path="/user-profile" />
            </ClerkProtectedRoute>
          } 
        />
        <Route path="/dashboard" element={<ClerkProtectedRoute><Dashboard /></ClerkProtectedRoute>} />
        <Route path="/settings" element={<ClerkProtectedRoute><Settings /></ClerkProtectedRoute>} />
        
        {/* Wills section routes */}
        <Route path="/wills" element={<ClerkProtectedRoute><WillsPage /></ClerkProtectedRoute>} />
        <Route path="/will/:id" element={<ClerkProtectedRoute><Will /></ClerkProtectedRoute>} />
        <Route path="/will/create" element={<ClerkProtectedRoute><WillCreation /></ClerkProtectedRoute>} />
        <Route path="/will/edit/:id" element={<ClerkProtectedRoute><WillCreation /></ClerkProtectedRoute>} />
        <Route path="/will/template/:templateId" element={<ClerkProtectedRoute><TemplateWillCreationPage /></ClerkProtectedRoute>} />
        <Route path="/will/video-creation/:willId" element={<ClerkProtectedRoute><WillVideoCreation /></ClerkProtectedRoute>} />
        
        {/* Tank section routes */}
        <Route path="/tank" element={<ClerkProtectedRoute><TankPage /></ClerkProtectedRoute>} />
        <Route path="/tank/create" element={<ClerkProtectedRoute><TankCreation /></ClerkProtectedRoute>} />
        <Route path="/tank/message/:id" element={<ClerkProtectedRoute><TankMessageDetail /></ClerkProtectedRoute>} />
        
        {/* Security routes */}
        <Route path="/pages/security/IDSecurity" element={<ClerkProtectedRoute><IDSecurityPage /></ClerkProtectedRoute>} />
        <Route path="/check-ins" element={<ClerkProtectedRoute><CheckInsPage /></ClerkProtectedRoute>} />
        <Route path="/pages/billing/Billing" element={<ClerkProtectedRoute><BillingPage /></ClerkProtectedRoute>} />
        <Route path="/test-death-verification" element={<ClerkProtectedRoute><TestDeathVerificationPage /></ClerkProtectedRoute>} />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
