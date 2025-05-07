
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
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
import SecureSignIn from './pages/auth/SecureSignIn';
import SecureSignUp from './pages/auth/SecureSignUp';
import SecureRecover from './pages/auth/SecureRecover';
import AuthResetPassword from './pages/auth/ResetPassword';
import AccountActivation from './pages/auth/AccountActivation';
import EmailVerification from './pages/auth/EmailVerification';
import VerifyEmailBanner from './pages/auth/VerifyEmailBanner';
import AuthCallback from './pages/auth/AuthCallback';
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

// Create a QueryClient instance
const queryClient = new QueryClient();

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
        path: "/api",
        element: <API />,
      },
      {
        path: "/faq",
        element: <FAQ />,
      },
      {
        path: "/auth/signin",
        element: <SecureSignIn />,
      },
      {
        path: "/auth/signup",
        element: <SecureSignUp />,
      },
      {
        path: "/auth/verification",
        element: <EmailVerification />,
      },
      {
        path: "/auth/forgot-password",
        element: <SecureRecover />,
      },
      {
        path: "/auth/reset-password",
        element: <AuthResetPassword />,
      },
      {
        path: "/auth/activate",
        element: <AccountActivation />,
      },
      {
        path: "/auth/verify-email",
        element: <VerifyEmailBanner />,
      },
      {
        path: "/auth/callback",
        element: <AuthCallback />,
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
    <QueryClientProvider client={queryClient}>
      <NotificationsProvider>
        <RouterProvider router={router} />
      </NotificationsProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
