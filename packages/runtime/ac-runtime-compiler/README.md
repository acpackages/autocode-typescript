# AC Runtime Compiler

> Build-time compiler that transforms `@AcElement`-decorated TypeScript classes into native Web Components.

## Overview

The compiler reads TypeScript source files, finds classes decorated with `@AcElement()`, and generates self-contained Web Component code using an IIFE (Immediately Invoked Function Expression) pattern with a built-in signal-based reactivity system.

## Installation

```bash
npm install @autocode-ts/ac-runtime-compiler
```

## Architecture

```
TypeScript Source (.ts)
  │
  ├─ Parse with TypeScript AST
  ├─ Find @AcElement-decorated classes
  ├─ For each component:
  │   ├─ Extract metadata (selector, template, styles)
  │   ├─ Compile template (TemplateCompiler → HTML + Bindings)
  │   ├─ Classify properties (reactive vs static)
  │   ├─ Prefix template expressions (bare identifiers → this.identifier)
  │   └─ Generate IIFE with:
  │       ├─ Signal system (createSignal, createEffect)
  │       ├─ Inner component class with signal-backed properties
  │       ├─ HTMLElement wrapper (customElements.define)
  │       └─ Style injection with reference counting
  └─ Output: imports + IIFE + trailing code
```

## API

### `ComponentCompiler`

Main entry point. Takes TypeScript source code and produces compiled Web Component code.

```typescript
import { ComponentCompiler } from '@autocode-ts/ac-runtime-compiler';

const compiler = new ComponentCompiler();
const results = compiler.compile(sourceCode, filePath, resolveImport);

for (const result of results) {
  console.log(result.selector); // 'my-component' or null
  console.log(result.code);     // Generated TypeScript IIFE
}
```

### `TemplateCompiler`

Parses HTML templates and extracts reactive bindings. Used internally by `ComponentCompiler` but also available for direct use.

```typescript
import { TemplateCompiler } from '@autocode-ts/ac-runtime-compiler';

const tc = new TemplateCompiler();
const result = tc.compile('<div>Hello {{name}}</div>');

console.log(result.html);      // '<div>Hello <span ac-ref="ac-a1b2c3d4"></span></div>'
console.log(result.bindings);  // [{ type: 'text', expression: '`Hello ${name}`', ... }]
console.log(result.idMap);     // { refName: 'ac-...' }
```

## Generated Code Structure

For a component like:

```typescript
@AcElement({ selector: 'my-counter', template: '<span>{{count}}</span>' })
export class MyCounter {
  count = 0;
  increment() { this.count++; }
}
```

The compiler generates:

```typescript
export const MyCounter = (function() {
  // 1. Scoped signal system
  function createSignal<T>(value: T) { /* ... */ }
  function createEffect(fn: () => void) { /* ... */ }

  // 2. Inner component class (your code + reactive properties)
  class MyCounter {
    static selector = 'my-counter';
    element!: HTMLElement;

    constructor() {
      (this as any).count = 0;
      const [countSig, setcountSig] = createSignal((this as any).count);
      Object.defineProperty(this, 'count', {
        get: () => countSig(),
        set: (v) => setcountSig(v),
        configurable: true
      });
    }

    render() {
      this.element.innerHTML = '<span ac-ref="ac-..."></span>';
      createEffect(() => { /* update textContent */ });
    }

    increment() { this.count++; }
  }

  // 3. HTMLElement wrapper
  class MyCounterElement extends HTMLElement {
    acRuntimeInstance: MyCounter;
    constructor() { super(); this.acRuntimeInstance = new MyCounter(); }
    connectedCallback() { this.acRuntimeInstance.render(); }
    disconnectedCallback() { /* cleanup */ }
  }

  // 4. Registration
  customElements.define('my-counter', MyCounterElement);
  return MyCounter;
})();
```

## CLI

```bash
npx ac-compiler src/components/my-component.ts
# Output: src/components/my-component.compiled.js
```

## Testing

```bash
npx vitest run
```

The test suite covers: text interpolation, `@AcInput`/`@AcOutput`, `ac:if`, `ac:for`, `ac:model`, class/style/attribute bindings, `@AcViewChild`, `<ac-container>`, inheritance, and non-component passthrough.
