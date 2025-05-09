import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import CheckIns from './pages/CheckIns.tsx';
import Settings from './pages/settings/Settings.tsx';
import TestDeathVerification from './pages/TestDeathVerification.tsx';
import VerificationResponse from './pages/verify/VerificationResponse.tsx';
import VerificationPortal from './pages/verify/VerificationPortal.tsx';
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
import Dashboard from './pages/Dashboard';
import Help from './pages/Help';
import Search from './pages/search/Search';
import Corporate from './pages/Corporate';
import Business from './pages/Business';
import HowItWorks from './pages/HowItWorks';
import Security from './pages/Security';
import Services from './pages/Services';
import IDSecurity from './pages/security/IDSecurity';
import Billing from './pages/billing/Billing';
import Activity from './pages/activity/Activity';
import Tank from './pages/tank/Tank';
import TankCreation from './pages/tank/TankCreation';
import TankMessageDetail from './pages/tank/TankMessageDetail';
import Wills from './pages/wills/Wills';
import Will from './pages/will/Will';
import WillCreatePage from './pages/will/WillCreatePage';
import TemplateWillCreationPage from './pages/will/TemplateWillCreationPage';
import { WillVideoCreation } from './pages/will/WillVideoCreation';
import Notifications from './pages/notifications/Notifications';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Documentation from './pages/Documentation';
import API from './pages/API';
import FAQ from './pages/FAQ';
import GettingStarted from './pages/documentation/GettingStarted';
import UserGuides from './pages/documentation/UserGuides';
import ApiReference from './pages/documentation/ApiReference';
import SecurityDocs from './pages/documentation/Security';
import Integrations from './pages/documentation/Integrations';
import UpdatesArchive from './pages/documentation/UpdatesArchive';

// New auth components with Clerk
import ClerkSignIn from './pages/auth/ClerkSignIn';
import ClerkSignUp from './pages/auth/ClerkSignUp';
import ClerkRecover from './pages/auth/ClerkRecover';
import ClerkResetPassword from './pages/auth/ClerkResetPassword';
import ClerkEmailVerification from './pages/auth/ClerkEmailVerification';

// Import the Clerk-Supabase AuthProvider
import { ClerkSupabaseProvider } from './contexts/ClerkSupabaseContext';

// Create a QueryClient instance
const queryClient = new QueryClient();

// Get the Clerk publishable key from environment
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "MISSING_CLERK_PUBLISHABLE_KEY";

if (!CLERK_PUBLISHABLE_KEY || CLERK_PUBLISHABLE_KEY === "MISSING_CLERK_PUBLISHABLE_KEY") {
  console.error("VITE_CLERK_PUBLISHABLE_KEY is missing. Please add it to your Supabase secrets.");
}

// Create a unified router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/pricing",
        element: <Pricing />,
      },
      {
        path: "/blog",
        element: <Blog />,
      },
      {
        path: "/blog/:id",
        element: <BlogArticle />,
      },
      {
        path: "/help",
        element: <Help />,
      },
      {
        path: "/search",
        element: <Search />,
      },
      {
        path: "/how-it-works",
        element: <HowItWorks />,
      },
      {
        path: "/security",
        element: <Security />,
      },
      {
        path: "/services",
        element: <Services />,
      },
      {
        path: "/business",
        element: <Business />,
      },
      {
        path: "/privacy",
        element: <Privacy />,
      },
      {
        path: "/terms",
        element: <Terms />,
      },
      {
        path: "/cookies",
        element: <Cookies />,
      },
      {
        path: "/documentation",
        element: <Documentation />,
      },
      {
        path: "/documentation/getting-started",
        element: <GettingStarted />,
      },
      {
        path: "/documentation/user-guides",
        element: <UserGuides />,
      },
      {
        path: "/documentation/api",
        element: <ApiReference />,
      },
      {
        path: "/documentation/security",
        element: <SecurityDocs />,
      },
      {
        path: "/documentation/integrations",
        element: <Integrations />,
      },
      {
        path: "/documentation/updates",
        element: <UpdatesArchive />,
      },
      {
        path: "/api",
        element: <API />,
      },
      {
        path: "/faq",
        element: <FAQ />,
      },
      // Updated auth routes to use Clerk components
      {
        path: "/auth/signin",
        element: <ClerkSignIn />,
      },
      {
        path: "/auth/signup",
        element: <ClerkSignUp />,
      },
      {
        path: "/auth/verification",
        element: <ClerkEmailVerification />,
      },
      {
        path: "/auth/forgot-password",
        element: <ClerkRecover />,
      },
      {
        path: "/auth/reset-password",
        element: <ClerkResetPassword />,
      },
      // Keep the existing paths for backward compatibility
      {
        path: "/auth/activate",
        element: <ClerkEmailVerification />,
      },
      {
        path: "/auth/verify-email",
        element: <ClerkEmailVerification />,
      },
      {
        path: "/auth/callback",
        element: <Dashboard />,  // Redirect to dashboard after auth
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/activity",
        element: <Activity />,
      },
      {
        path: "/check-ins",
        element: <CheckIns />,
      },
      {
        path: "/pages/security/IDSecurity",
        element: <IDSecurity />,
      },
      {
        path: "/billing",
        element: <Billing />,
      },
      {
        path: "/pages/billing/Billing",
        element: <Billing />,
      },
      {
        path: "/corporate",
        element: <Corporate />,
      },
      {
        path: "/tank",
        element: <Tank />,
      },
      {
        path: "/tank/create",
        element: <TankCreation />,
      },
      {
        path: "/tank/message/:id",
        element: <TankMessageDetail />,
      },
      {
        path: "/tank/edit/:id",
        element: <TankCreation />,
      },
      {
        path: "/verify/:token",
        element: <VerificationPortal />,
      },
      {
        path: "/verify/invitation/:token",
        element: <VerificationResponse />,
      },
      {
        path: "/verify/status/:token",
        element: <VerificationResponse />,
      },
      {
        path: "/test-death-verification",
        element: <TestDeathVerification />,
      },
      {
        path: "/wills",
        element: <Wills />,
      },
      {
        path: "/will/:id",
        element: <Will />,
      },
      {
        path: "/will/create",
        element: <WillCreatePage />,
      },
      {
        path: "/will/template-creation/:templateId",
        element: <TemplateWillCreationPage />,
      },
      {
        path: "/will/video-creation/:willId",
        element: <WillVideoCreation />,
      },
      {
        path: "/notifications",
        element: <Notifications />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <ClerkSupabaseProvider>
          <NotificationsProvider>
            <RouterProvider router={router} />
          </NotificationsProvider>
        </ClerkSupabaseProvider>
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>,
);
