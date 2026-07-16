/// <reference types='vitest' />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(({ command }) => {
  const tsconfig = command === 'build' ? 'tsconfig.lib.build.json' : 'tsconfig.lib.json';
  return {
    root: __dirname,
    cacheDir:
      '../../../node_modules/.vite/packages/browser/ac-data-dictionary-components',
    plugins: [
      nxViteTsPaths(),
      nxCopyAssetsPlugin(['*.md']),
      dts({
        entryRoot: 'src',
        tsconfigPath: path.join(__dirname, tsconfig),
      }),
    ],
    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },
    // Configuration for building your library.
    // See: https://vitejs.dev/guide/build.html#library-mode
    build: {
      outDir: '../../../dist/packages/browser/ac-data-dictionary-components',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      lib: {
        // Could also be a dictionary or array of multiple entry points.
        entry: 'src/ac-data-dictionary-components.ts',
        name: 'ac-data-dictionary-components',
        fileName: (format) => {
          if (format === 'es') return 'ac-data-dictionary-components.js';
          if (format === 'cjs') return 'ac-data-dictionary-components.cjs';
          if (format === 'umd') return 'ac-data-dictionary-components.umd.js';
          return 'ac-data-dictionary-components.js';
        },
        formats: ['es' as const, 'cjs' as const, 'umd' as const],
      },
      rollupOptions: {
        // External packages that should not be bundled into your library.
        external: [
          "@autocode-ts/autocode",
          "@autocode-ts/ac-browser",
          "@autocode-ts/ac-data-dictionary",
          "@autocode-ts/ac-extensions"
        ],
        output: {
          globals: {
            "@autocode-ts/autocode": "autocode",
            "@autocode-ts/ac-browser": "acBrowser",
            "@autocode-ts/ac-data-dictionary": "acDataDictionary",
            "@autocode-ts/ac-extensions": "acExtensions",
          }
        }
      },
    },
  };
});

