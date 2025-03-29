
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { Toaster } from '@/components/ui/toaster';

// Import pages
import Home from './pages/Index';
import About from './pages/About';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import NotFound from './pages/NotFound';
import Blog from './pages/Blog';
import BlogArticle from './pages/BlogArticle';
import AuthSignIn from './pages/auth/SignIn';
import AuthSignUp from './pages/auth/SignUp';
import AuthForgotPassword from './pages/auth/Recover';
import AuthResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import WillDashboard from './pages/will/Will';
import WillEditor from './pages/will/WillCreation';
import WillTemplates from './pages/templates/Templates';
import WillTank from './pages/tank/Tank';
import Settings from './pages/settings/Settings';
import Help from './pages/Help';
import Search from './pages/search/Search';
import Corporate from './pages/Corporate';
import AccountActivation from './pages/auth/AccountActivation';

// Import the Documentation pages
import Documentation from './pages/corporate/Documentation';
import GettingStarted from './pages/corporate/documentation/GettingStarted';
import UserGuides from './pages/corporate/documentation/UserGuides';
import API from './pages/corporate/documentation/API';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <NotificationsProvider>
          <Toaster />
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
            
            {/* Auth routes */}
            <Route path="/auth/signin" element={<AuthSignIn />} />
            <Route path="/auth/signup" element={<AuthSignUp />} />
            <Route path="/auth/forgot-password" element={<AuthForgotPassword />} />
            <Route path="/auth/reset-password" element={<AuthResetPassword />} />
            <Route path="/auth/activate" element={<AccountActivation />} />
            
            {/* Dashboard routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/will" element={<WillDashboard />} />
            <Route path="/will/:id" element={<WillEditor />} />
            <Route path="/templates" element={<WillTemplates />} />
            <Route path="/tank" element={<WillTank />} />
            <Route path="/settings" element={<Settings />} />

            {/* Corporate routes */}
            <Route path="/corporate" element={<Corporate />} />
            <Route path="/corporate/documentation" element={<Documentation />} />
            
            {/* Documentation sub-pages */}
            <Route path="/corporate/documentation/getting-started" element={<GettingStarted />} />
            <Route path="/corporate/documentation/user-guides" element={<UserGuides />} />
            <Route path="/corporate/documentation/api" element={<API />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ReactQueryDevtools initialIsOpen={false} />
        </NotificationsProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
