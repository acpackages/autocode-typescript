/// <reference types='vitest' />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir:
    '../../../node_modules/.vite/packages/browser/ac-tiptap-editor-input',
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
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    outDir: '../../../dist/packages/browser/ac-tiptap-editor-input',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: 'ac-tiptap-editor-input',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es' as const],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [
        "@autocode-ts/autocode",
        "@autocode-ts/ac-browser",
        "@autocode-ts/ac-extensions",
        "@tiptap/core",
        "@tiptap/extension-highlight",
        "@tiptap/extension-image",
        "@tiptap/extension-placeholder",
        "@tiptap/extension-task-item",
        "@tiptap/extension-task-list",
        "@tiptap/extension-text-align",
        "@tiptap/extension-underline",
        "@tiptap/pm",
        "@tiptap/starter-kit"
      ],
    },
  },
}));
