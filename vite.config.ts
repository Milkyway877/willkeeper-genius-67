
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
    react({
      // Configure React plugin properly
      jsxRuntime: 'automatic',
      fastRefresh: true,
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Use exact paths to prevent duplicate React instances
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
  // Add SPA-friendly build options
  build: {
    // Generate SPA fallback index.html for all routes
    outDir: 'dist',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  // Ensure proper optimization to avoid duplicate React instances
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
    esbuildOptions: {
      mainFields: ['module', 'main'],
    },
  },
  // Force single instance of React
  define: {
    'process.env': process.env,
    __REACT_VERSION__: JSON.stringify(require('react').version),
  },
}));
