/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import path from 'path';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/tests/browser',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
   resolve: {
    alias: {
      // '@autocode-ts/autocode': path.resolve(__dirname, '../../packages/common/autocode/src'),
      // '@autocode-ts/ac-browser': path.resolve(__dirname, '../../packages/browser/ac-browser/src'),
      // '@autocode-ts/ac-datagrid-on-ag-grid': path.resolve(__dirname, '../../packages/browser/extensions/datagrid/ac-datagrid-on-ag-grid/src'),
      // '@autocode-ts/ac-data-dictionary': path.resolve(__dirname, '../../packages/common/ac-data-dictionary/src'),
      // add others as needed
    },
  },

  build: {
    outDir: '../../dist/tests/browser',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/tests/browser',
      provider: 'v8' as const,
    },
  },
}));
