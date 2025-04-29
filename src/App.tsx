
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { Toaster } from '@/components/ui/toaster';
import { FloatingAssistant } from '@/components/ui/FloatingAssistant';

// Import pages
import Home from './pages/Index';
import About from './pages/About';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import NotFound from './pages/NotFound';
import Blog from './pages/Blog';
import BlogArticle from './pages/BlogArticle';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';

// Import secure auth components
import SecureSignIn from './pages/auth/SecureSignIn';
import SecureSignUp from './pages/auth/SecureSignUp';
import SecureRecover from './pages/auth/SecureRecover';
import AuthResetPassword from './pages/auth/ResetPassword';
import AccountActivation from './pages/auth/AccountActivation';
import EmailVerification from './pages/auth/EmailVerification';
import VerifyEmailBanner from './pages/auth/VerifyEmailBanner';
import AuthCallback from './pages/auth/AuthCallback';
import Dashboard from './pages/Dashboard';
import Settings from './pages/settings/Settings';
import Help from './pages/Help';
import Search from './pages/search/Search';
import Corporate from './pages/Corporate';
import Business from './pages/Business';
import HowItWorks from './pages/HowItWorks';
import Security from './pages/Security';
import Services from './pages/Services';

// Import pages for sidebar links
import IDSecurity from './pages/security/IDSecurity';
import Billing from './pages/billing/Billing';
import Activity from './pages/activity/Activity';

// Import verification portal
import VerificationPortal from './pages/verify/VerificationPortal';
import VerificationResponse from './pages/verify/VerificationResponse';

// Add global mobile responsive styles
import './MobileStyles.css';

import Tank from './pages/tank/Tank';
import TankCreation from './pages/tank/TankCreation';
import TankMessageDetail from './pages/tank/TankMessageDetail';
import CheckIns from './pages/CheckIns';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogArticle />} />
        <Route path="/help" element={<Help />} />
        <Route path="/search" element={<Search />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/security" element={<Security />} />
        <Route path="/services" element={<Services />} />
        <Route path="/business" element={<Business />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
        
        {/* Public verification portal - accessible without authentication */}
        <Route path="/verify/:token" element={<VerificationPortal />} />
        
        {/* Auth routes - using our secure components */}
        <Route path="/auth/signin" element={<SecureSignIn />} />
        <Route path="/auth/signup" element={<SecureSignUp />} />
        <Route path="/auth/verification" element={<EmailVerification />} />
        <Route path="/auth/forgot-password" element={<SecureRecover />} />
        <Route path="/auth/reset-password" element={<AuthResetPassword />} />
        <Route path="/auth/activate" element={<AccountActivation />} />
        <Route path="/auth/verify-email" element={<VerifyEmailBanner />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Dashboard routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/check-ins" element={<CheckIns />} />

        {/* Routes for sidebar links */}
        <Route path="/pages/security/IDSecurity" element={<IDSecurity />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/pages/billing/Billing" element={<Billing />} />

        {/* Corporate routes */}
        <Route path="/corporate" element={<Corporate />} />
        
        <Route path="/tank" element={<Tank />} />
        <Route path="/tank/create" element={<TankCreation />} />
        <Route path="/tank/message/:id" element={<TankMessageDetail />} />
        <Route path="/tank/edit/:id" element={<TankCreation />} />

        {/* Verification routes */}
        <Route path="/verify/invitation/:token" element={<VerificationResponse invitationType="invitation" />} />
        <Route path="/verify/status/:token" element={<VerificationResponse invitationType="status" />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <FloatingAssistant />
      <ReactQueryDevtools initialIsOpen={false} />
    </BrowserRouter>
  );
}
