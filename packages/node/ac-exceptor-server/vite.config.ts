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
    cacheDir: '../../../node_modules/.vite/packages/node/ac-exceptor-server',
    plugins: [
      nxViteTsPaths(),
      nxCopyAssetsPlugin(['*.md']),
      dts({
        entryRoot: 'src',
        tsconfigPath: path.join(__dirname, tsconfig),
      }),
    ],
    resolve: {
      preserveSymlinks: true,
    },
    build: {
      outDir: '../../../dist/packages/node/ac-exceptor-server',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      lib: {
        entry: 'src/ac-exceptor-server.ts',
        name: 'acExceptorServer',
        fileName: (format) => {
          if (format === 'es') return 'ac-exceptor-server.js';
          if (format === 'cjs') return 'ac-exceptor-server.cjs';
          return 'ac-exceptor-server.js';
        },
        formats: ['es' as const, 'cjs' as const],
      },
      rollupOptions: {
        external: [
          '@autocode-ts/autocode',
          '@autocode-ts/ac-web',
          '@autocode-ts/ac-data-dictionary',
          '@autocode-ts/ac-sql',
          '@autocode-ts/ac-sql-node',
          'tslib',
          'crypto',
        ],
        output: {
          globals: {
            '@autocode-ts/autocode': 'autocode',
            '@autocode-ts/ac-web': 'acWeb',
            '@autocode-ts/ac-data-dictionary': 'acDataDictionary',
            '@autocode-ts/ac-sql': 'acSql',
            '@autocode-ts/ac-sql-node': 'acSqlNode',
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'node',
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
    },
  };
});
