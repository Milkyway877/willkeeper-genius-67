import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import CheckIns from './pages/CheckIns.tsx';
import Settings from './pages/settings/Settings.tsx';
import TestDeathVerification from './pages/TestDeathVerification.tsx';
import VerificationResponse from './pages/verify/VerificationResponse.tsx';
import VerificationPortal from './pages/verify/VerificationPortal.tsx';
import UnifiedVerificationPage from './pages/verify/UnifiedVerificationPage.tsx';
import VerifyTrustedContact from './pages/VerifyTrustedContact.tsx';
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
import SecureSignIn from './pages/auth/SecureSignIn';
import SecureSignUp from './pages/auth/SecureSignUp';
import ClerkSignIn from './pages/auth/ClerkSignIn';
import ClerkSignUp from './pages/auth/ClerkSignUp';
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
import WillUnlockPage from './pages/will-unlock/WillUnlockPage';
import ExecutorAccessPage from './pages/will-unlock/ExecutorAccessPage';
import Notifications from './pages/notifications/Notifications';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Documentation from './pages/Documentation';
import API from './pages/API';
import FAQ from './pages/FAQ';
import SimpleWillUnlock from '@/pages/will-unlock/SimpleWillUnlock';

// Import all documentation sub-pages
import GettingStarted from './pages/documentation/GettingStarted';
import UserGuides from './pages/documentation/UserGuides';
import ApiReference from './pages/documentation/ApiReference';
import SecurityDocs from './pages/documentation/Security';
import Integrations from './pages/documentation/Integrations';
import UpdatesArchive from './pages/documentation/UpdatesArchive';

// Create a QueryClient instance
const queryClient = new QueryClient();

// Get Clerk publishable key from environment
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Choose auth components based on Clerk availability
const SignInComponent = CLERK_PUBLISHABLE_KEY ? ClerkSignIn : SecureSignIn;
const SignUpComponent = CLERK_PUBLISHABLE_KEY ? ClerkSignUp : SecureSignUp;

// Create router without Clerk Provider first
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
      {
        path: "/auth/signin",
        element: <SignInComponent />,
      },
      {
        path: "/auth/signup",
        element: <SignUpComponent />,
      },
      {
        path: "/auth/recover",
        element: <SignInComponent />,
      },
      {
        path: "/auth/2fa-verification",
        element: <SignInComponent />,
      },
      {
        path: "/auth/verification",
        element: <SignInComponent />,
      },
      {
        path: "/auth/forgot-password",
        element: <SignInComponent />,
      },
      {
        path: "/auth/reset-password",
        element: <SignInComponent />,
      },
      {
        path: "/auth/activate",
        element: <SignInComponent />,
      },
      {
        path: "/auth/verify-email",
        element: <SignInComponent />,
      },
      {
        path: "/auth/callback",
        element: <SignInComponent />,
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
        path: "/verify/:type/:token",
        element: <UnifiedVerificationPage />,
      },
      {
        path: "/verify/trusted-contact/:token",
        element: <VerifyTrustedContact />,
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
        path: "/will-unlock/:verificationId",
        element: <WillUnlockPage />,
      },
      {
        path: "/test/death-verification",
        element: <TestDeathVerification />,
      },
      {
        path: "/test-death-verification",
        element: <TestDeathVerification />,
      },
      {
        path: "/will-unlock",
        element: <SimpleWillUnlock />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

// Render with conditional Clerk Provider
const AppWithProviders = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationsProvider>
        {CLERK_PUBLISHABLE_KEY ? (
          <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
            <RouterProvider router={router} />
          </ClerkProvider>
        ) : (
          <RouterProvider router={router} />
        )}
      </NotificationsProvider>
    </QueryClientProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWithProviders />
  </React.StrictMode>,
)

// IMPORTANT: main.tsx is long and should be refactored for maintainability.
