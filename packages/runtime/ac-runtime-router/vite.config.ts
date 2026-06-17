/// <reference types='vitest' />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/packages/runtime/ac-runtime-router',
  plugins: [
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    outDir: '../../../dist/packages/runtime/ac-runtime-router',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/ac-runtime-router.ts',
      name: 'acRuntimeRouter',
      fileName: (format) => {
        if (format === 'es') return 'ac-runtime-router.js';
        if (format === 'cjs') return 'ac-runtime-router.cjs';
        if (format === 'umd') return 'ac-runtime-router.umd.js';
        return 'ac-runtime-router.js';
      },
      formats: ['es' as const, 'cjs' as const, 'umd' as const],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [
      ],
        output: {
          globals: {
          }
        }
    },
  },
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../coverage/packages/runtime/ac-runtime-router',
      provider: 'v8' as const,
    },
  },
}));
