
import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/Index';
import WillCreatePage from '@/pages/will/WillCreatePage';
import TemplateWillCreationPage from '@/pages/will/TemplateWillCreationPage';
import SecureSignIn from '@/pages/auth/SecureSignIn';
import SecureSignUp from '@/pages/auth/SecureSignUp';
import SecureRecover from '@/pages/auth/SecureRecover';
import AuthResetPassword from '@/pages/auth/ResetPassword';
import AccountActivation from '@/pages/auth/AccountActivation';
import EmailVerification from '@/pages/auth/EmailVerification';
import VerifyEmailBanner from '@/pages/auth/VerifyEmailBanner';
import AuthCallback from '@/pages/auth/AuthCallback';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/will/create" element={<WillCreatePage />} />
      <Route path="/will/template-creation/:templateId" element={<TemplateWillCreationPage />} />
      
      {/* Auth routes */}
      <Route path="/auth/signin" element={<SecureSignIn />} />
      <Route path="/auth/signup" element={<SecureSignUp />} />
      <Route path="/auth/recover" element={<SecureRecover />} />
      <Route path="/auth/reset-password" element={<AuthResetPassword />} />
      <Route path="/auth/activate" element={<AccountActivation />} />
      <Route path="/auth/verification" element={<EmailVerification />} />
      <Route path="/auth/verify-email" element={<VerifyEmailBanner />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Add a fallback route to handle 404s */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;
