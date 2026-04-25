import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: __dirname,
  server: {
    port: 3001,
  },
  resolve: {
    alias: {
      '@autocode-ts/ac-runtime': path.resolve(__dirname, '../../packages/browser/ac-runtime/src/ac-runtime.ts'),
      '@autocode-ts/autocode': path.resolve(__dirname, '../../packages/common/autocode/src/autocode.ts'),
    },
  },
  optimizeDeps: {
    include: ['reflect-metadata', '@vue/reactivity'],
  },
});
