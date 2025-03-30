
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Handle redirects from 404.html
const maybeRedirect = () => {
  const redirectPath = sessionStorage.getItem('redirect_path');
  if (redirectPath) {
    sessionStorage.removeItem('redirect_path');
    window.history.replaceState(null, '', redirectPath);
  }
};

// Try to handle redirect before rendering
maybeRedirect();

// Mount the React application
createRoot(document.getElementById("root")!).render(<App />);
