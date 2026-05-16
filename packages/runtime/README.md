# AC Runtime

> A lightweight, decorator-driven Web Component framework with compile-time reactivity.

## Packages

| Package | Description |
|---------|-------------|
| [`ac-runtime`](./ac-runtime/) | Core decorators, interfaces, lifecycle hooks, event emitter, and router. |
| [`ac-runtime-compiler`](./ac-runtime-compiler/) | Build-time compiler that transforms `@AcElement` classes into Web Components. |
| [`ac-runtime-dev`](./ac-runtime-dev/) | Vite plugin and standalone dev server with live reload. |
| [`ac-runtime-router`](./ac-runtime-router/) | Client-side router with outlets, links, and route guards. |

## How It Works

```
Developer writes:                    Compiler produces:
┌──────────────────────┐             ┌──────────────────────────────────┐
│ @AcElement({         │             │ export const MyComp = (function()│
│   selector: 'my-el', │   compile   │   function createSignal(v) {...} │
│   template: '...'    │ ─────────►  │   class MyComp {                 │
│ })                   │             │     // signal-backed properties   │
│ class MyComp {       │             │     render() { /* bindings */ }   │
│   count = 0;         │             │   }                              │
│ }                    │             │   customElements.define(...)      │
└──────────────────────┘             └──────────────────────────────────┘
```

1. **Author** components using TypeScript classes + AC decorators.
2. **Compile** via the Vite plugin (dev) or CLI (production).
3. **Run** as native Web Components in any browser — no runtime framework needed.

## Quick Start

### 1. Install

```bash
npm install @autocode-ts/ac-runtime @autocode-ts/ac-runtime-compiler @autocode-ts/ac-runtime-dev
```

### 2. Configure Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { acRuntimePlugin } from '@autocode-ts/ac-runtime-dev';

export default defineConfig({
  plugins: [acRuntimePlugin()],
});
```

### 3. Create a Component

```typescript
// src/components/counter.element.ts
import { AcElement, AcInput, IAcOnInit } from '@autocode-ts/ac-runtime';

@AcElement({
  selector: 'app-counter',
  template: `
    <div>
      <h2>{{title}}</h2>
      <span>Count: {{count}}</span>
      <button (click)="increment()">+</button>
      <button (click)="decrement()">-</button>
      <div ac:if="count > 10" style="color: red;">
        Warning: count is high!
      </div>
    </div>
  `,
  styles: ':host { display: block; padding: 16px; }'
})
export class CounterElement implements IAcOnInit {
  @AcInput() title = 'Counter';
  count = 0;

  acOnInit() {
    console.log('Counter mounted');
  }

  increment() { this.count++; }
  decrement() { this.count--; }
}
```

### 4. Use It

```html
<!-- index.html -->
<app-counter title="My Counter"></app-counter>
```

## Template Syntax Reference

| Syntax | Type | Example |
|--------|------|---------|
| `{{expr}}` | Text interpolation | `{{user.name}}` |
| `[prop]="expr"` | Property binding | `[value]="count"` |
| `(event)="expr"` | Event binding | `(click)="save()"` |
| `ac:model="prop"` | Two-way binding | `ac:model="query"` |
| `[class.name]="expr"` | Class toggle | `[class.active]="isOn"` |
| `[style.prop]="expr"` | Style binding | `[style.color]="color"` |
| `ac:bind:attr="expr"` | Attribute binding | `ac:bind:title="tip"` |
| `ac:if="expr"` | Conditional | `ac:if="isVisible"` |
| `ac:for="x of list"` | Loop | `ac:for="item of items"` |
| `#refName` | Template ref | `#myInput` |
| `<ac-container>` | Virtual wrapper | Groups children without a DOM node |

## Architecture

```
ac-runtime (authoring API)
    │
    ▼
ac-runtime-compiler (AST transformation)
    │
    ├──► ac-runtime-dev/vite-plugin (Vite integration)
    └──► ac-runtime-dev/dev-server  (standalone)

ac-runtime-router (SPA navigation — optional)
```

## Development

```bash
# Run compiler tests
cd packages/runtime/ac-runtime-compiler
npx vitest run

# Start dev server for a project
cd your-project
npx vite
```
