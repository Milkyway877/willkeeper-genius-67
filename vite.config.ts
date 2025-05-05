
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Add this to ensure all routes redirect to index.html for SPA routing
    historyApiFallback: true,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add SPA-friendly build options
  build: {
    // Generate SPA fallback index.html for all routes
    outDir: 'dist',
    sourcemap: mode !== 'production',
  },
  // Define environment variables for production based on Vercel's environment
  define: mode === 'production' ? {
    // We don't need to define anything here as Vercel will inject the variables
  } : {},
}));
