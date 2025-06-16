
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
import AccountManagement from './pages/account/AccountManagement';

// Import all documentation sub-pages
import GettingStarted from './pages/documentation/GettingStarted';
import UserGuides from './pages/documentation/UserGuides';
import ApiReference from './pages/documentation/ApiReference';
import SecurityDocs from './pages/documentation/Security';
import Integrations from './pages/documentation/Integrations';
import UpdatesArchive from './pages/documentation/UpdatesArchive';

// Create a QueryClient instance
const queryClient = new QueryClient();

// Use the test Clerk publishable key
const CLERK_PUBLISHABLE_KEY = 'pk_test_cHJvdWQtc2VhaG9yc2UtMjAuY2xlcmsuYWNjb3VudHMuZGV2JA';

// Create router with Clerk-only authentication
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
      // CLERK AUTHENTICATION ROUTES - Updated to use Clerk components only
      {
        path: "/auth/signin",
        element: <ClerkSignIn />,
      },
      {
        path: "/auth/signup",
        element: <ClerkSignUp />,
      },
      {
        path: "/auth/recover",
        element: <ClerkSignIn />,
      },
      {
        path: "/auth/2fa-verification",
        element: <ClerkSignIn />,
      },
      {
        path: "/auth/verification",
        element: <ClerkSignIn />,
      },
      {
        path: "/auth/forgot-password",
        element: <ClerkSignIn />,
      },
      {
        path: "/auth/reset-password",
        element: <ClerkSignIn />,
      },
      {
        path: "/auth/activate",
        element: <ClerkSignIn />,
      },
      {
        path: "/auth/verify-email",
        element: <ClerkSignIn />,
      },
      {
        path: "/auth/callback",
        element: <ClerkSignIn />,
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
        path: "/account",
        element: <AccountManagement />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

// Render with single ClerkProvider at the root level
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NotificationsProvider>
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
          <RouterProvider router={router} />
        </ClerkProvider>
      </NotificationsProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
