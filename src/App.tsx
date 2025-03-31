
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { FloatingAssistant } from '@/components/ui/FloatingAssistant';
import { AnimatePresence } from 'framer-motion';
import { UserProfileProvider } from '@/contexts/UserProfileContext';

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
import Dashboard from './pages/Dashboard';
import WillEditor from './pages/will/WillCreation';
import WillTank from './pages/tank/Tank';
import Tank from './pages/tank/Tank';
import TankCreation from './pages/tank/TankCreation';
import TankMessageCreation from './pages/tank/TankMessageCreation';
import Settings from './pages/settings/Settings';
import Profile from './pages/settings/Profile';
import DeathVerification from './pages/settings/DeathVerification';
import Help from './pages/Help';
import Search from './pages/search/Search';
import Corporate from './pages/Corporate';
import Business from './pages/Business';
import HowItWorks from './pages/HowItWorks';
import Security from './pages/Security';
import Services from './pages/Services';
import AuthCallback from './pages/auth/AuthCallback';

// Import the Documentation pages
import Documentation from './pages/corporate/Documentation';
import GettingStarted from './pages/corporate/documentation/GettingStarted';
import UserGuides from './pages/corporate/documentation/UserGuides';
import API from './pages/corporate/documentation/API';

// Import pages for sidebar links
import Encryption from './pages/encryption/Encryption';
import Executors from './pages/executors/Executors';
import AIAssistance from './pages/ai/AIAssistance';
import AIAssistantPage from './pages/ai/AIAssistantPage';
import IDSecurity from './pages/security/IDSecurity';
import Billing from './pages/billing/Billing';
import Activity from './pages/activity/Activity';

// Add global mobile responsive styles
import './MobileStyles.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProfileProvider>
        <Toaster />
        <FloatingAssistant />
        <Router>
          <AnimatePresence mode="wait">
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
              
              {/* Auth routes - using our secure components */}
              <Route path="/auth/signin" element={<SecureSignIn />} />
              <Route path="/auth/signup" element={<SecureSignUp />} />
              <Route path="/auth/forgot-password" element={<SecureRecover />} />
              <Route path="/auth/reset-password" element={<AuthResetPassword />} />
              <Route path="/auth/activate" element={<AccountActivation />} />
              <Route path="/auth/verify-email" element={<EmailVerification />} />
              <Route path="/auth/verification-banner" element={<VerifyEmailBanner />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* Dashboard routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/will/new" element={<WillEditor />} />
              <Route path="/will/:id" element={<WillEditor />} />
              <Route path="/will/create" element={<WillEditor />} />
              <Route path="/tank" element={<WillTank />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/profile" element={<Profile />} />
              <Route path="/settings/death-verification" element={<DeathVerification />} />
              <Route path="/activity" element={<Activity />} />

              {/* Routes for sidebar links */}
              <Route path="/pages/encryption/Encryption" element={<Encryption />} />
              <Route path="/pages/executors/Executors" element={<Executors />} />
              <Route path="/pages/ai/AIAssistance" element={<AIAssistance />} />
              <Route path="/pages/ai/AIAssistantPage" element={<AIAssistantPage />} />
              <Route path="/pages/security/IDSecurity" element={<IDSecurity />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/pages/billing/Billing" element={<Billing />} />

              {/* Corporate routes */}
              <Route path="/corporate" element={<Corporate />} />
              <Route path="/corporate/documentation" element={<Documentation />} />
              
              {/* Documentation sub-pages */}
              <Route path="/corporate/documentation/getting-started" element={<GettingStarted />} />
              <Route path="/corporate/documentation/user-guides" element={<UserGuides />} />
              <Route path="/corporate/documentation/api" element={<API />} />
              
              {/* Tank routes */}
              <Route path="/tank" element={<Tank />} />
              <Route path="/tank/create" element={<TankCreation />} />
              <Route path="/tank/create-message" element={<TankMessageCreation />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
          <ReactQueryDevtools initialIsOpen={false} />
        </Router>
      </UserProfileProvider>
    </QueryClientProvider>
  );
}

export default App;
