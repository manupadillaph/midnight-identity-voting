import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import path from 'path';

export default defineConfig({
  cacheDir: './.vite',
  build: {
    target: 'esnext',
    minify: false,
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  plugins: [
    react(),
    viteCommonjs({
      skipPreBuild: true
    })
  ],
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
      platform: 'browser',
      supported: { 
        bigint: true 
      }
    },
    include: [
      '@midnight-kyc-demo/contract'
    ]
  },
  resolve: {
    alias: {
      '@midnight-kyc-demo/contract': path.resolve(__dirname, '../contract/dist/index.js')
    }
  }
});