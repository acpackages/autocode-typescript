/// <reference types='vitest' />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(({command}) => {
  const tsconfig = command === 'build' ? 'tsconfig.lib.build.json' : 'tsconfig.lib.json';
  return {
    root: __dirname,
    cacheDir:
      '../../../../../node_modules/.vite/packages/browser/extensions/datagrid/ac-datagrid-on-ag-grid',
    plugins: [
      nxViteTsPaths(),
      nxCopyAssetsPlugin(['*.md',
        {
          input: 'src/lib/css',
          glob: '**/*.css',
          output: 'css',
        }]),
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
      outDir: '../../../../../dist/packages/browser/extensions/datagrid/ac-datagrid-on-ag-grid',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      lib: {
        // Could also be a dictionary or array of multiple entry points.
        entry: 'src/ac-datagrid-on-ag-grid.ts',
        name: 'acDatagridOnAgGrid',
        fileName: 'ac-datagrid-on-ag-grid',
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
          "ag-charts-community",
          "ag-charts-types",
          "ag-grid-community",
          "ag-grid-enterprise"
        ],
      },
    },
    test: {
      watch: false,
      globals: true,
      environment: 'node',
      include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      reporters: ['default'],
      coverage: {
        reportsDirectory:
          '../../../coverage/packages/browser/extensions/datagrid/ac-datagrid-on-ag-grid',
        provider: 'v8' as const,
      },
    },
  };
});
