
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

// Add the test route to the router
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "check-ins",
        element: <CheckIns />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "test-death-verification",
        element: <TestDeathVerification />,
      },
    ],
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
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
