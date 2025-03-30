
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserProfileProvider } from '@/contexts/UserProfileContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import Dashboard from '@/pages/Dashboard';
import LandingPage from '@/pages/LandingPage';
import NotFound from '@/pages/NotFound';
import PrivateRoute from '@/components/auth/PrivateRoute';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import PasswordReset from '@/pages/auth/PasswordReset';
import ActivateAccount from '@/pages/auth/ActivateAccount';
import SecuritySettings from '@/pages/settings/SecuritySettings';
import ProfileSettings from '@/pages/settings/ProfileSettings';
import DeathVerification from '@/pages/settings/DeathVerification';
import Notifications from '@/pages/settings/Notifications';
import Will from '@/pages/will/Will';
import WillCreation from '@/pages/will/WillCreation';
import Wills from '@/pages/will/Wills';
import Executors from '@/pages/executors/Executors';
import LegacyVault from '@/pages/LegacyVault';
import Tank from '@/pages/Tank';
import FutureMessage from '@/pages/FutureMessage';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="willtank-theme">
      <AuthProvider>
        <UserProfileProvider>
          <SidebarProvider>
            <NotificationsProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="/auth/register" element={<Register />} />
                  <Route path="/auth/reset-password" element={<PasswordReset />} />
                  <Route path="/auth/activate" element={<ActivateAccount />} />
                  
                  <Route path="/dashboard" element={<PrivateRoute component={Dashboard} />} />
                  <Route path="/settings/profile" element={<PrivateRoute component={ProfileSettings} />} />
                  <Route path="/settings/security" element={<PrivateRoute component={SecuritySettings} />} />
                  <Route path="/settings/death-verification" element={<PrivateRoute component={DeathVerification} />} />
                  <Route path="/settings/notifications" element={<PrivateRoute component={Notifications} />} />
                  
                  <Route path="/will" element={<PrivateRoute component={Will} />} />
                  <Route path="/will/:id" element={<PrivateRoute component={Will} />} />
                  <Route path="/will/create" element={<PrivateRoute component={WillCreation} />} />
                  <Route path="/wills" element={<PrivateRoute component={Wills} />} />
                  
                  <Route path="/pages/executors/Executors" element={<PrivateRoute component={Executors} />} />
                  <Route path="/legacy-vault" element={<PrivateRoute component={LegacyVault} />} />
                  <Route path="/tank" element={<PrivateRoute component={Tank} />} />
                  <Route path="/tank/message/create" element={<PrivateRoute component={FutureMessage} />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </Router>
            </NotificationsProvider>
          </SidebarProvider>
        </UserProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
