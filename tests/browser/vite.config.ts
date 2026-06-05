import { defineConfig } from 'vite';
import path from 'path';
import { acRuntimePlugin } from '../../packages/runtime/ac-runtime-dev/src/vite-plugin';

export default defineConfig({
  plugins: [acRuntimePlugin()],
  root: __dirname,
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@autocode-ts/ac-browser': path.resolve(__dirname, '../../packages/browser/ac-browser/src/ac-browser.ts'),
      '@autocode-ts/ac-runtime': path.resolve(__dirname, '../../packages/runtime/ac-runtime/src/ac-runtime.ts'),
      '@autocode-ts/autocode': path.resolve(__dirname, '../../packages/common/autocode/src/autocode.ts'),
      '@autocode-ts/ac-datagrid-on-ag-grid': path.resolve(__dirname, '../../packages/browser/extensions/datagrid/ac-datagrid-on-ag-grid/src/ac-datagrid-on-ag-grid.ts'),
      '@autocode-ts/ac-sqlite-dao-browser': path.resolve(__dirname, '../../packages/browser/ac-sqlite-dao-browser/src/index.ts'),
      '@autocode-ts/ac-tiptap-editor-input': path.resolve(__dirname, '../../packages/browser/ac-tiptap-editor-input/src/index.ts'),
      '@autocode-ts/ac-quill-editor-input': path.resolve(__dirname, '../../packages/browser/ac-quill-editor-input/src/ac-quill-editor-input.ts'),
      '@autocode-ts/ac-ws-client': path.resolve(__dirname, '../../packages/common/ac-ws-client/src/ac-ws-client.ts'),
      '@autocode-ts/ac-sql': path.resolve(__dirname, '../../packages/common/ac-sql/src/ac-sql.ts'),
      '@autocode-ts/ac-data-dictionary': path.resolve(__dirname, '../../packages/common/ac-data-dictionary/src/ac-data-dictionary.ts'),
      '@autocode-ts/ac-report-engine': path.resolve(__dirname, '../../packages/browser/ac-report-engine/src/ac-report-engine.ts'),
      '@autocode-ts/ac-data-dictionary-components': path.resolve(__dirname, '../../packages/browser/ac-data-dictionary-components/src/ac-data-dictionary-components.ts'),
      '@autocode-ts/ac-dde-code-generator': path.resolve(__dirname, '../../packages/browser/extensions/data-dictionary-editor/ac-dde-code-generator/src/index.ts'),
      '@autocode-ts/ac-dde-browser-storage': path.resolve(__dirname, '../../packages/browser/extensions/data-dictionary-editor/ac-dde-browser-storage/src/index.ts'),

      '@autocode-ts/ac-builder': path.resolve(__dirname, '../../packages/browser/ac-builder/src/index.ts'),
      '@autocode-ts/ac-bootstrap-builder-elements': path.resolve(__dirname, '../../packages/browser/extensions/builder/ac-bootstrap-builder-elements/src/index.ts'),
      '@autocode-ts/ac-dd-builder-elements': path.resolve(__dirname, '../../packages/browser/extensions/builder/ac-dd-builder-elements/src/index.ts'),
      '@autocode-ts/ac-data-dictionary-editor': path.resolve(__dirname, '../../packages/browser/ac-data-dictionary-editor/src/index.ts'),
      '@autocode-ts/ac-icons': path.resolve(__dirname, '../../packages/browser/ac-icons/src/ac-icons.ts'),
      '@autocode-ts/ac-extensions': path.resolve(__dirname, '../../packages/common/ac-extensions/src/ac-extensions.ts'),
      '@autocode-ts/ac-pipes': path.resolve(__dirname, '../../packages/common/ac-pipes/src/ac-pipes.ts'),
      '@autocode-ts/ac-data-bridge': path.resolve(__dirname, '../../packages/common/ac-data-bridge/src/ac-data-bridge.ts'),
      '@autocode-ts/ac-runtime-router': path.resolve(__dirname, '../../packages/runtime/ac-runtime-router/src/index.ts'),
      '@autocode-ts/ac-runtime-dev': path.resolve(__dirname, '../../packages/runtime/ac-runtime-dev/src/index.ts'),
      '@autocode-ts/ac-runtime-compiler': path.resolve(__dirname, '../../packages/runtime/ac-runtime-compiler/src/index.ts'),
      '@autocode-ts/ac-reactivity': path.resolve(__dirname, '../../packages/common/ac-reactivity/src/ac-reactivity.ts'),
    },
  },
  optimizeDeps: {
    include: ['@coreui/coreui', 'bootstrap', 'reflect-metadata'],
    exclude: ['typescript']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
});
