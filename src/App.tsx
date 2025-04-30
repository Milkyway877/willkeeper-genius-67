
import { Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import ProfilePage from '@/pages/user/ProfilePage';
import SettingsPage from '@/pages/user/SettingsPage';
import WillCreatePage from '@/pages/will/WillCreatePage';
import WillEditPage from '@/pages/will/WillEditPage';
import WillViewPage from '@/pages/will/WillViewPage';
import WillGuidePage from '@/pages/will/WillGuidePage';
import WillListPage from '@/pages/will/WillListPage';
import WillDashboardPage from '@/pages/will/WillDashboardPage';
import WillExecutorPage from '@/pages/will/WillExecutorPage';
import WillBeneficiaryPage from '@/pages/will/WillBeneficiaryPage';
import ChatCreationPage from '@/pages/will/ChatCreationPage';
import TemplateWillCreationPage from '@/pages/will/TemplateWillCreationPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/will/create" element={<WillCreatePage />} />
      <Route path="/will/edit/:id" element={<WillEditPage />} />
      <Route path="/will/view/:id" element={<WillViewPage />} />
      <Route path="/will/guide" element={<WillGuidePage />} />
      <Route path="/will/list" element={<WillListPage />} />
      <Route path="/will/dashboard" element={<WillDashboardPage />} />
      <Route path="/will/executor/:id" element={<WillExecutorPage />} />
      <Route path="/will/beneficiary/:id" element={<WillBeneficiaryPage />} />
      <Route path="/will/chat-creation/:templateId" element={<ChatCreationPage />} />
      <Route path="/will/template-creation/:templateId" element={<TemplateWillCreationPage />} />
    </Routes>
  );
}

export default App;
