import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Toaster } from 'sonner';

// Import pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import NotFound from './pages/NotFound';
import Blog from './pages/Blog';
import BlogArticle from './pages/BlogArticle';
import AuthSignIn from './pages/auth/SignIn';
import AuthSignUp from './pages/auth/SignUp';
import AuthForgotPassword from './pages/auth/ForgotPassword';
import AuthResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/dashboard/Dashboard';
import WillDashboard from './pages/dashboard/WillDashboard';
import WillEditor from './pages/dashboard/WillEditor';
import WillTemplates from './pages/dashboard/WillTemplates';
import WillTank from './pages/dashboard/WillTank';
import Settings from './pages/dashboard/Settings';
import Help from './pages/Help';
import Search from './pages/Search';
import Corporate from './pages/Corporate';

// Import the new Documentation page
import Documentation from './pages/corporate/Documentation';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Toaster position="bottom-right" />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogArticle />} />
          <Route path="/help" element={<Help />} />
          <Route path="/search" element={<Search />} />
          
          {/* Auth routes */}
          <Route path="/auth/signin" element={<AuthSignIn />} />
          <Route path="/auth/signup" element={<AuthSignUp />} />
          <Route path="/auth/forgot-password" element={<AuthForgotPassword />} />
          <Route path="/auth/reset-password" element={<AuthResetPassword />} />
          
          {/* Dashboard routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/will" element={<WillDashboard />} />
          <Route path="/will/:id" element={<WillEditor />} />
          <Route path="/templates" element={<WillTemplates />} />
          <Route path="/tank" element={<WillTank />} />
          <Route path="/settings" element={<Settings />} />

          {/* Corporate routes */}
          <Route path="/corporate" element={<Corporate />} />
          <Route path="/corporate/documentation" element={<Documentation />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
