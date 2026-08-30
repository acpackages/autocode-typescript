/// <reference types='vitest' />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/packages/browser/ac-datetime-picker',
  plugins: [
    nxViteTsPaths(),
    nxCopyAssetsPlugin([
      '*.md',
      {
        input: 'src/lib/css',
        glob: '*.css',
        output: 'css',
      }
    ]),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],
  build: {
    outDir: '../../../dist/packages/browser/ac-datetime-picker',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: 'src/ac-datetime-picker.ts',
      name: 'ac-datetime-picker',
      fileName: 'index',
      formats: ['es' as const],
    },
    rollupOptions: {
      external: [
        '@autocode-ts/ac-browser',
        '@autocode-ts/autocode',
        '@popperjs/core',
        'air-datepicker',
      ],
    },
  },
}));
