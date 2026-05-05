/// <reference types='vitest' />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/packages/node/ac-web-on-ws',
  plugins: [
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],
  build: {
    outDir: '../../../dist/packages/node/ac-web-on-ws',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: 'src/ac-web-on-ws.ts',
      name: 'acWebOnWs',
      fileName: (format) => {
        if (format === 'es') return 'ac-web-on-ws.js';
        if (format === 'cjs') return 'ac-web-on-ws.cjs';
        if (format === 'umd') return 'ac-web-on-ws.umd.js';
        return 'ac-web-on-ws.js';
      },
      formats: ['es' as const, 'cjs' as const, 'umd' as const],
    },
    rollupOptions: {
      external: [
        '@autocode-ts/ac-web',
        '@autocode-ts/ac-web-socket',
        '@autocode-ts/ac-extensions',
        '@autocode-ts/autocode'
      ],
    },
  },
  test: {
    globals: true,
    cache: {
      dir: '../../../node_modules/.vitest',
    },
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../coverage/packages/node/ac-web-on-ws',
      provider: 'v8',
    },
  },
}));
