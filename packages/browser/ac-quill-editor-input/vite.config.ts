/// <reference types='vitest' />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir:
    '../../../node_modules/.vite/packages/browser/ac-quill-editor-input',
  plugins: [
    nxViteTsPaths(),
    nxCopyAssetsPlugin([
      '*.md',
      {
        input: 'src/lib/css',
        glob: '*.css',
        output: 'css',
      },
    ]),
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
    outDir: '../../../dist/packages/browser/ac-quill-editor-input',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/ac-quill-editor-input.ts',
      name: 'acQuillEditorInput',
        fileName: (format) => {
          if (format === 'es') return 'ac-quill-editor-input.js';
          if (format === 'cjs') return 'ac-quill-editor-input.cjs';
          if (format === 'umd') return 'ac-quill-editor-input.umd.js';
          return 'ac-quill-editor-input.js';
        },
        formats: ['es' as const, 'cjs' as const, 'umd' as const],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [
        "@autocode-ts/ac-browser",
        "@autocode-ts/ac-extensions",
        "@autocode-ts/autocode",
        "quill"
      ],
      output: {
          globals: {
            "@autocode-ts/autocode": "autocode",
            "@autocode-ts/ac-browser": "acBrowser",
            "@autocode-ts/ac-extensions": "acExtensions"
          }
        }
    },
  },
}));
