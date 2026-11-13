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
        tsconfigPath: path.join(__dirname, tsconfig),
      }),
    ],
    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },
    // Configuration for building your library.
    // See: https://vitejs.dev/guide/build.html#library-mode
    resolve: {
      preserveSymlinks: true,
      external: ['@autocode-ts/ac-browser']
    },
    build: {
      outDir: '../../../dist/packages/browser/ac-datetime-picker',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      lib: {
        // Could also be a dictionary or array of multiple entry points.
        entry: 'src/ac-datetime-picker.ts',
        name: 'acDatetimePicker',
        fileName: (format) => {
          if (format === 'es') return 'ac-datetime-picker.js';
          if (format === 'cjs') return 'ac-datetime-picker.cjs';
          if (format === 'umd') return 'ac-datetime-picker.umd.js';
          return 'ac-datetime-picker.js';
        },
        formats: ['es' as const, 'cjs' as const, 'umd' as const],
      },
      rollupOptions: {
        // External packages that should not be bundled into your library.
        external: [
          "@autocode-ts/ac-browser",
          "@popperjs/core"
        ],
        output: {
          globals: {
            "@autocode-ts/ac-browser": "acBrowser",
          }
        }
      },
    },
  };
});
