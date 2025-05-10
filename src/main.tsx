
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './App.css';
import './MobileStyles.css';
import RouterLegacy from './RouterLegacy';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogArticle from './pages/BlogArticle';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import Security from './pages/Security';
import Privacy from './pages/Privacy';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import { Toaster } from "@/components/ui/sonner";

// Death verification pages
import TestDeathVerification from './pages/TestDeathVerification';
import StatusResponse from './pages/verify/StatusResponse';
import InvitationResponse from './pages/verify/InvitationResponse';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/about',
    element: <About />,
  },
  {
    path: '/blog',
    element: <Blog />,
  },
  {
    path: '/blog/:id',
    element: <BlogArticle />,
  },
  {
    path: '/security',
    element: <Security />,
  },
  {
    path: '/privacy',
    element: <Privacy />,
  },
  {
    path: '/signin',
    element: <SignIn />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  // Add death verification pages
  {
    path: '/test-death-verification',
    element: <TestDeathVerification />,
  },
  {
    path: '/verify/status-response',
    element: <StatusResponse />,
  },
  {
    path: '/verify/invitation-response',
    element: <InvitationResponse />,
  },
  // Legacy router = need to be last to handle other routes
  {
    path: '*',
    element: <RouterLegacy />,
  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App>
      <RouterProvider router={router} />
    </App>
  </React.StrictMode>
);
