import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/auth/SignUp";
import SignIn from "./pages/auth/SignIn";
import Recover from "./pages/auth/Recover";
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
import Templates from "./pages/templates/Templates";
import Encryption from "./pages/encryption/Encryption";
import Executors from "./pages/executors/Executors";
import AIAssistance from "./pages/ai/AIAssistance";
import IDSecurity from "./pages/security/IDSecurity";
import Billing from "./pages/billing/Billing";
import Notifications from "./pages/notifications/Notifications";
import Settings from "./pages/settings/Settings";
import Tank from "./pages/Tank";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/security" element={<Security />} />
          <Route path="/business" element={<Business />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Dashboard Pages */}
          <Route path="/will" element={<Will />} />
          <Route path="/will/creation" element={<WillCreation />} />
          <Route path="/tank" element={<Tank />} />
          <Route path="/executors" element={<Executors />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/encryption" element={<Encryption />} />
          <Route path="/id-security" element={<IDSecurity />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/help" element={<Help />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Footer Pages - Company Section */}
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/careers" element={<Careers />} />
          
          {/* Footer Pages - Resources Section */}
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/api" element={<API />} />
          <Route path="/community" element={<Community />} />
          
          {/* Footer Pages - Legal Section */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/gdpr" element={<GDPR />} />
          
          {/* Auth Routes */}
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/recover" element={<Recover />} />
          
          {/* Auth Short Routes */}
          <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />
          <Route path="/signin" element={<Navigate to="/auth/signin" replace />} />
          <Route path="/recover" element={<Navigate to="/auth/recover" replace />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
