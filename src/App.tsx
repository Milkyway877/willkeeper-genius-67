
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';
import './MobileStyles.css';
import Dashboard from './pages/Dashboard';
import Home from './pages/Index';
import Settings from './pages/settings/Settings';
import Confirm from './pages/auth/Confirm';
import CheckIn from './pages/auth/CheckIn';
import AccessWill from './pages/auth/AccessWill';
import { NotificationsProvider } from './contexts/NotificationsContext';
import Will from './pages/will/Will';
import WillCreation from './pages/will/WillCreation';
import Wills from './pages/wills/Wills';

function App() {
  return (
    <Router>
      <NotificationsProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/settings/*" element={<Settings />} />
          <Route path="/confirm" element={<Confirm />} />
          <Route path="/decline" element={<Confirm />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/access-will" element={<AccessWill />} />
          <Route path="/will" element={<Will />} />
          <Route path="/will/:id" element={<Will />} />
          <Route path="/will/create" element={<WillCreation />} />
          <Route path="/will/edit/:id" element={<Will />} />
          <Route path="/wills" element={<Wills />} />
        </Routes>
      </NotificationsProvider>
    </Router>
  );
}

export default App;
