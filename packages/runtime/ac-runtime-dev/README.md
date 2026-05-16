# AC Runtime Dev

> Development tooling for AC Runtime applications — Vite plugin and standalone dev server.

## Overview

This package provides two development tools:

1. **Vite Plugin** (`acRuntimePlugin`) — Integrates AC Runtime compilation into Vite's dev server and build pipeline.
2. **Standalone Dev Server** (`DevServer`) — Express-based server with file watching, live reload, and error overlay.

## Installation

```bash
npm install @autocode-ts/ac-runtime-dev
```

## Vite Plugin

The recommended way to develop AC Runtime applications.

### Setup

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { acRuntimePlugin } from '@autocode-ts/ac-runtime-dev';

export default defineConfig({
  plugins: [acRuntimePlugin()],
});
```

### How It Works

1. **Build start** — Recursively discovers all `.ts` files from `src/main.ts`, following imports and `import.meta.glob` patterns.
2. **Compilation** — Each file is compiled through `ComponentCompiler` and written to `.ac-runtime-cache/`.
3. **Import rewriting** — Import paths are rewritten to serve cached (compiled) files instead of raw source.
4. **File watching** — On `.ts` file changes, the file is re-compiled and a full HMR reload is triggered.
5. **CSS handling** — CSS/SCSS import paths are rewritten to root-relative paths for Vite resolution.

### Cache Structure

```
project-root/
  ├─ src/                    ← Original source files
  └─ .ac-runtime-cache/     ← Compiled output (mirrors src/ structure)
      └─ src/
          └─ components/
              └─ my-comp.ts  ← Compiled IIFE
```

> **Note:** Add `.ac-runtime-cache/` to your `.gitignore`.

## Standalone Dev Server

For projects that don't use Vite.

### CLI Usage

```bash
npx ac-dev-server [watch-dir] [port]

# Examples:
npx ac-dev-server ./src 4000    # Custom directory and port
npx ac-dev-server               # Defaults: cwd, port 3000
```

### Programmatic Usage

```typescript
import { DevServer } from '@autocode-ts/ac-runtime-dev';

const server = new DevServer({
  port: 3000,
  watchDir: './src',
});

server.start();
```

### Features

| Feature | Description |
|---------|-------------|
| **File watching** | Watches `.ts`, `.html`, `.css` files via chokidar. |
| **Auto-compilation** | Re-compiles on file change and transpiles to JS. |
| **Live reload** | WebSocket-based browser refresh (port + 1). |
| **Error overlay** | In-browser compilation error display with file path and stack trace. |
| **Dual cache** | In-memory `Map` + disk cache for fast JS serving. |
| **Co-located files** | HTML/CSS changes trigger recompilation of sibling `.ts` files. |
