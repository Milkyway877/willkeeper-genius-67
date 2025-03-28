
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/auth/SignUp";
import SignIn from "./pages/auth/SignIn";
import Recover from "./pages/auth/Recover";
import AuthCallback from "./pages/auth/AuthCallback";
import Services from "./pages/Services";
import Security from "./pages/Security";
import Business from "./pages/Business";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import Documentation from "./pages/Documentation";
import Help from "./pages/Help";
import API from "./pages/API";
import Community from "./pages/Community";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import GDPR from "./pages/GDPR";
import Will from "./pages/will/Will";
import WillCreation from "./pages/will/WillCreation";
import Wills from "./pages/wills/Wills";  
import Templates from "./pages/templates/Templates";
import Encryption from "./pages/encryption/Encryption";
import Executors from "./pages/executors/Executors";
import AIAssistance from "./pages/ai/AIAssistance";
import IDSecurity from "./pages/security/IDSecurity";
import Billing from "./pages/billing/Billing";
import Notifications from "./pages/notifications/Notifications";
import Settings from "./pages/settings/Settings";
import DeathVerification from "./pages/settings/DeathVerification";
import Tank from "./pages/tank/Tank";
import TankCreation from "./pages/tank/TankCreation";
import Search from "./pages/search/Search";

const initSupabaseStorage = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
    
    if (!avatarBucketExists) {
      await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 1024 * 1024 * 2, // 2MB limit
      });
      console.log('Created avatars storage bucket');
    }
  } catch (error) {
    console.error('Error initializing Supabase storage:', error);
  }
};

const queryClient = new QueryClient();

const RouteHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const handle404 = () => {
      console.log('Handling potential 404 for route:', location.pathname);
    };
    
    handle404();
  }, [location.pathname, navigate]);
  
  return null;
};

const AppWithProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <UserProfileProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {children}
      </TooltipProvider>
    </UserProfileProvider>
  </QueryClientProvider>
);

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initSupabaseStorage();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session ? "session exists" : "no session");
        setSession(session);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session ? "session exists" : "no session");
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AppWithProviders>
      <BrowserRouter>
        <NotificationsProvider>
          {!loading && (
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth/signup" element={session ? <Navigate to="/dashboard" replace /> : <SignUp />} />
              <Route path="/auth/signin" element={session ? <Navigate to="/dashboard" replace /> : <SignIn />} />
              <Route path="/auth/recover" element={session ? <Navigate to="/dashboard" replace /> : <Recover />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              <Route 
                path="/dashboard" 
                element={session ? <Dashboard /> : <Navigate to="/auth/signin" replace />} 
              />
              
              <Route path="/services" element={<Services />} />
              <Route path="/security" element={<Security />} />
              <Route path="/business" element={<Business />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/contact" element={<Contact />} />
              
              <Route path="/will" element={session ? <Will /> : <Navigate to="/auth/signin" replace />} />
              <Route path="/will/:id" element={session ? <Will /> : <Navigate to="/auth/signin" replace />} />
              <Route path="/will/edit/:id" element={session ? <WillCreation /> : <Navigate to="/auth/signin" replace />} />
              <Route path="/will/create" element={session ? <WillCreation /> : <Navigate to="/auth/signin" replace />} />
              <Route path="/wills" element={session ? <Wills /> : <Navigate to="/auth/signin" replace />} />
              <Route path="/templates" element={session ? <Templates /> : <Navigate to="/auth/signin" replace />} />
              <Route path="/encryption" element={session ? <Encryption /> : <Navigate to="/auth/signin" replace />} />
              <Route path="/executors" element={session ? <Executors /> : <Navigate to="/auth/signin" replace />} />
              <Route path="/ai-assistance" element={session ? <AIAssistance /> : <Navigate to="/auth/signin" replace />} />
              <Route path="/id-security" element={session ? <IDSecurity /> : <Navigate to="/auth/signin" replace />} />
              <Route path="/billing" element={session ? <Billing /> : <Navigate to="/auth/signin" replace />} />
              <Route path="/notifications" element={session ? <Notifications /> : <Navigate to="/auth/signin" replace />} />
              <Route path="/search" element={session ? <Search /> : <Navigate to="/auth/signin" replace />} />
              <Route path="/help" element={<Help />} />
              <Route path="/settings" element={session ? <Settings /> : <Navigate to="/auth/signin" replace />} />
              <Route path="/settings/death-verification" element={session ? <DeathVerification /> : <Navigate to="/auth/signin" replace />} />
              
              <Route path="/tank" element={session ? <Tank /> : <Navigate to="/auth/signin" replace />} />
              <Route path="/tank/create" element={session ? <TankCreation /> : <Navigate to="/auth/signin" replace />} />
              
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/careers" element={<Careers />} />
              
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/api" element={<API />} />
              <Route path="/community" element={<Community />} />
              
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/gdpr" element={<GDPR />} />
              
              <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />
              <Route path="/signin" element={<Navigate to="/auth/signin" replace />} />
              <Route path="/recover" element={<Navigate to="/auth/recover" replace />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
          
          <RouteHandler />
        </NotificationsProvider>
      </BrowserRouter>
    </AppWithProviders>
  );
};

export default App;
