import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Force all packages to use the same React instance
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
    // Dedupe ensures only one copy of React exists in the bundle
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
  build: {
    // Enable minification with esbuild (built-in, no extra dependency)
    minify: 'esbuild',
    // Code splitting configuration
    rollupOptions: {
      output: {
        // Manual chunks for optimal caching
        manualChunks: {
          // Core React ecosystem
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI framework - split into critical (login needs) and deferred
          'vendor-ui-core': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-label',
          ],
          'vendor-ui-extra': [
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-accordion',
          ],
          // Data & state management
          'vendor-data': ['@tanstack/react-query', '@supabase/supabase-js'],
          // Charts - heavy, only needed on dashboard
          'vendor-charts': ['recharts'],
          // Animation - deferred, not needed on login
          'vendor-motion': ['framer-motion'],
          // Utilities
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge', 'zod'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,
    commonjsOptions: {
      // Ensure React is treated as a singleton in production builds
      include: [/node_modules/],
    },
  },
}));
