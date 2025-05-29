
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import Home from '@/pages/Index';
import About from '@/pages/About';
import Pricing from '@/pages/Pricing';
import HowItWorks from '@/pages/HowItWorks';
import Business from '@/pages/Business';
import Security from '@/pages/Security';
import AuthRoutes from '@/pages/auth/AuthRoutes';
import Tank from '@/pages/tank/Tank';
import Settings from '@/pages/settings/Settings';
import Notifications from '@/pages/notifications/Notifications';
import CheckIns from '@/pages/CheckIns';
import UnlockWill from '@/pages/unlock-will/UnlockWill';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
        <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />
        <Route path="/business" element={<Layout><Business /></Layout>} />
        <Route path="/security" element={<Layout><Security /></Layout>} />
        <Route path="/auth/*" element={<AuthRoutes />} />
        <Route path="/tank" element={<Layout><Tank /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
        <Route path="/check-ins" element={<Layout><CheckIns /></Layout>} />
        <Route path="/unlock-will/:token" element={<UnlockWill />} />
      </Routes>
    </Router>
  );
}

export default App;
