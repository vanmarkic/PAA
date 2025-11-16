import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

export default defineConfig({
  integrations: [
    preact({
      compat: true, // Enable preact/compat for React libs
    })
  ],

  output: 'static',

  build: {
    inlineStylesheets: 'auto',
  },

  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Split by machine category
            if (id.includes('/workflows/')) {
              const match = id.match(/\/workflows\/([^/]+)\//);
              if (match) {
                return `machines-${match[1]}`;
              }
              return 'machines-general';
            }

            // Separate vendor chunks
            if (id.includes('@stately/inspect')) {
              return 'stately-inspector';
            }
            if (id.includes('xstate')) {
              return 'xstate-core';
            }
          }
        }
      }
    },

    resolve: {
      alias: {
        '@workflows': '/src/workflows',
        '@lib': './src/lib',
        '@components': './src/components'
      }
    }
  }
});
