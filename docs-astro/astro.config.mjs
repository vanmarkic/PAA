import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // Set output to static for SSG (Static Site Generation)
  output: 'static',

  // GitHub Pages deployment configuration
  // Base path: /PAA for GitHub Pages (only in production builds)
  base: process.env.NODE_ENV === 'production' ? '/PAA' : '/',

  // Site URL for production
  site: 'https://vanmarkic.github.io',

  // Server configuration for development
  server: {
    port: 4444,
    host: true
  },

  // Build configuration
  build: {
    // Directory for the built files
    assets: 'assets',
    // Inline small CSS for better performance
    inlineStylesheets: 'auto',
  },

  // Integrations
  integrations: [
    react(),
    tailwind({
      // Tailwind v4 configuration
      applyBaseStyles: false, // We'll handle base styles ourselves for v4
    }),
  ],

  // Vite configuration
  vite: {
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },

    ssr: {
      noExternal: ['@radix-ui/*'],
    },

    server: {
      fs: {
        // Allow serving files from the parent project
        allow: ['..']
      }
    },

    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Separate Radix UI components
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }

            // Separate React ecosystem
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }

            // XState and state management
            if (id.includes('xstate')) {
              return 'xstate-core';
            }

            // Chart libraries
            if (id.includes('recharts')) {
              return 'charts';
            }

            // Other UI libraries
            if (id.includes('lucide-react') || id.includes('sonner') || id.includes('cmdk')) {
              return 'ui-libs';
            }
          }
        }
      }
    },

    resolve: {
      alias: {
        '@components': './src/components',
        '@layouts': './src/layouts',
        '@lib': './src/lib',
        '@utils': './src/utils'
      }
    }
  }
});
