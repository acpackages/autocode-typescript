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
    cacheDir: '../../../node_modules/.vite/packages/browser/ac-browser',
    plugins: [
      nxViteTsPaths(),
      nxCopyAssetsPlugin([
        '*.md',
        {
          input: 'src/lib/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/icons/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-accordion/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-collapse/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-data-filter/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-data-sort/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-datagrid/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-draggable/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-drawer/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-dropdown/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-file-preview/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-filterable-elements/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-form/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-inputs/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-message/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-modal/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-pagination/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-popover/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-repeater/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-resizable/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-scroll-track/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-scrollable/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-slides/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-svg-icon/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-tabs/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-tooltip/css',
          glob: '*.css',
          output: 'css',
        },
        {
          input: 'src/lib/components/ac-virtual-scrolling/css',
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
      external: ['@autocode-ts/autocode']
    },
    build: {
      outDir: '../../../dist/packages/browser/ac-browser',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      lib: {
        // Could also be a dictionary or array of multiple entry points.
        entry: 'src/ac-browser.ts',
        name: 'acBrowser',
        fileName: (format) => {
          if (format === 'es') return 'ac-browser.js';
          if (format === 'cjs') return 'ac-browser.cjs';
          if (format === 'umd') return 'ac-browser.umd.js';
          return 'ac-browser.js';
        },
        formats: ['es' as const, 'cjs' as const, 'umd' as const],
      },
      rollupOptions: {
        // External packages that should not be bundled into your library.
        external: [
          "@autocode-ts/autocode",
          "@autocode-ts/ac-extensions",
          "@autocode-ts/ac-icons",
          "@popperjs/core"
        ],
        output: {
          globals: {
            "@autocode-ts/autocode": "autocode",
            "@autocode-ts/ac-extensions": "acExtensions",
            "@autocode-ts/ac-icons": "acIcons"
          }
        }
      },
    },
  };
});
