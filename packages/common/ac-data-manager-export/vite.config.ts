/// <reference types='vitest' />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/packages/common/ac-data-manager-export',
  plugins: [
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],
  build: {
    outDir: '../../../dist/packages/common/ac-data-manager-export',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: 'src/ac-data-manager-export.ts',
      name: 'acDataManagerExport',
      fileName: (format) => {
        if (format === 'es') return 'ac-data-manager-export.js';
        if (format === 'cjs') return 'ac-data-manager-export.cjs';
        if (format === 'umd') return 'ac-data-manager-export.umd.js';
        return 'ac-data-manager-export.js';
      },
      formats: ['es' as const, 'cjs' as const, 'umd' as const],
    },
    rollupOptions: {
      external: [
        "@autocode-ts/autocode",
        "xlsx",
      ],
      output: {
        globals: {
          xlsx: "XLSX",
          "@autocode-ts/autocode": "autocode",
        }
      }
    },
  },
}));
