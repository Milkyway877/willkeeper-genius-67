
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { AuthLayout } from './components/auth/AuthLayout';
import AuthCallback from './pages/auth/AuthCallback';
import VerifyTrustedContact from './pages/VerifyTrustedContact';
import App from './App';
import { supabase } from './integrations/supabase/client';

// Lazy load pages for better code splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const SignIn = React.lazy(() => import('./pages/auth/SignIn'));
const SecureSignIn = React.lazy(() => import('./pages/auth/SecureSignIn'));
const SignUp = React.lazy(() => import('./pages/auth/SignUp'));
const ForgotPassword = React.lazy(() => import('./pages/auth/Recover'));
const ResetPassword = React.lazy(() => import('./pages/auth/ResetPassword'));
const EmailVerification = React.lazy(() => import('./pages/auth/EmailVerification'));
const VerifyEmailBanner = React.lazy(() => import('./pages/auth/VerifyEmailBanner'));

// Create placeholder pages for development
const Home = () => <div>Home Page</div>;
const About = () => <div>About Page</div>;
const Pricing = () => <div>Pricing Page</div>;
const Contact = () => <div>Contact Page</div>;
const Faq = () => <div>FAQ Page</div>;
const Terms = () => <div>Terms Page</div>;
const Privacy = () => <div>Privacy Page</div>;
const NotFound = () => <div>404 Not Found</div>;
const Settings = () => <div>Settings Page</div>;
const Will = () => <div>Will Page</div>;
const FutureMessages = () => <div>Future Messages Page</div>;
const LegacyVault = () => <div>Legacy Vault Page</div>;
const CheckIns = () => <div>Check-Ins Page</div>;
const TestDeathVerificationPage = () => <div>Test Death Verification Page</div>;
const SearchPage = () => <div>Search Page</div>;

// Loading component for Suspense
const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" replace />;
  }

  return <>{children}</>;
};

// Auth layout wrapper component that passes children to AuthLayout
const AuthLayoutWrapper = () => {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
};

function AppRouter() {
  return (
    <Router>
      <React.Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/search" element={<SearchPage />} />
            
            {/* Auth Routes */}
            <Route element={<AuthLayoutWrapper />}>
              <Route path="/auth" element={<SecureSignIn />} />
              <Route path="/auth/signin" element={<SecureSignIn />} />
              <Route path="/auth/signup" element={<SignUp />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/recover" element={<ForgotPassword />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/verification" element={<EmailVerification />} />
              <Route path="/auth/verify-email" element={<VerifyEmailBanner />} />
            </Route>
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            <Route path="/will" element={
              <ProtectedRoute>
                <Will />
              </ProtectedRoute>
            } />
            
            <Route path="/future-messages" element={
              <ProtectedRoute>
                <FutureMessages />
              </ProtectedRoute>
            } />
            
            <Route path="/legacy-vault" element={
              <ProtectedRoute>
                <LegacyVault />
              </ProtectedRoute>
            } />
            
            <Route path="/check-ins" element={
              <ProtectedRoute>
                <CheckIns />
              </ProtectedRoute>
            } />
            
            <Route path="/test-death-verification" element={
              <ProtectedRoute>
                <TestDeathVerificationPage />
              </ProtectedRoute>
            } />
  
            <Route
              path="/verify/trusted-contact/:token"
              element={<VerifyTrustedContact />}
            />
            
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default AppRouter;
