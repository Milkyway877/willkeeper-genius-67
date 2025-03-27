
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

// Import new pages for the sidebar navigation
import MyWills from "./pages/wills/MyWills";
import LegalTemplates from "./pages/templates/LegalTemplates";
import EncryptionKeys from "./pages/keys/EncryptionKeys";
import Beneficiaries from "./pages/beneficiaries/Beneficiaries";
import AIAssistant from "./pages/ai-assistant/AIAssistant";
import IdentitySecurity from "./pages/security/IdentitySecurity";
import Subscriptions from "./pages/subscriptions/Subscriptions";
import Notifications from "./pages/notifications/Notifications";
import HelpSupport from "./pages/help/HelpSupport";
import Settings from "./pages/settings/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Sidebar Navigation Routes */}
          <Route path="/wills" element={<MyWills />} />
          <Route path="/templates" element={<LegalTemplates />} />
          <Route path="/keys" element={<EncryptionKeys />} />
          <Route path="/beneficiaries" element={<Beneficiaries />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/security" element={<IdentitySecurity />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/help" element={<HelpSupport />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Marketing Pages */}
          <Route path="/services" element={<Services />} />
          <Route path="/business" element={<Business />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          
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
          
          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
