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

## Module Structure

The compiler is organized into focused, single-responsibility modules:

```
src/
├── index.ts                        ← Public API exports
├── cli.ts                          ← CLI entry point
└── lib/
    ├── types.ts                    ← All shared interfaces
    ├── constants.ts                ← GLOBAL_IDENTIFIERS, VOID_ELEMENTS
    ├── pipes.ts                    ← Pipe expression parsing (|)
    ├── expression-prefixer.ts      ← this. prefix rewriting via TS AST
    ├── ast-helpers.ts              ← TypeScript AST utilities
    ├── code-generator.ts           ← IIFE Web Component assembly
    ├── template-compiler.ts        ← HTML template parsing → bindings
    ├── component-compiler.ts       ← Main orchestrator
    └── bindings/
        ├── index.ts                ← Binding dispatcher
        ├── text-binding.ts         ← {{expression}} interpolation
        ├── property-binding.ts     ← [prop]="expr" binding
        ├── event-binding.ts        ← (event)="handler" binding
        ├── class-binding.ts        ← [class.name]="expr" toggle
        ├── style-binding.ts        ← [style.prop]="expr" binding
        ├── model-binding.ts        ← ac:model two-way binding
        ├── attribute-binding.ts    ← ac:bind:attr="expr" binding
        ├── if-binding.ts           ← ac:if conditional rendering
        ├── for-binding.ts          ← ac:for list rendering
        └── template-outlet-binding.ts ← Template injection
```

### Module Descriptions

| Module | Purpose |
|--------|---------|
| `types.ts` | Central type definitions (`Binding`, `CompileResult`, `ReactiveProperty`, etc.) |
| `constants.ts` | Global identifiers that skip `this.` prefixing; HTML void elements |
| `pipes.ts` | Parses `{{ value \| currency:'INR' }}` into `__acPipe()` calls |
| `expression-prefixer.ts` | Uses TypeScript AST transforms to rewrite `count` → `this.count` |
| `ast-helpers.ts` | Extracts `@AcElement` metadata, collects identifiers, finds template-used props |
| `code-generator.ts` | Assembles the complete IIFE (signals, inner class, HTMLElement wrapper) |
| `template-compiler.ts` | Parses HTML templates into clean HTML + binding descriptors |
| `component-compiler.ts` | Main orchestrator — delegates to all other modules |
| `bindings/*` | One file per binding type — each generates the runtime `createEffect()` code |

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

## Template Syntax

| Syntax | Type | Example |
|--------|------|---------|
| `{{expr}}` | Text interpolation | `<span>{{count}}</span>` |
| `[prop]="expr"` | Property binding | `<div [items]="myArray">` |
| `(event)="handler"` | Event binding | `<button (click)="onClick()">` |
| `[class.name]="expr"` | Class toggle | `<div [class.active]="isActive">` |
| `[style.prop]="expr"` | Style binding | `<div [style.color]="textColor">` |
| `ac:model="expr"` | Two-way binding | `<input ac:model="name">` |
| `ac:bind:attr="expr"` | Attribute binding | `<div ac:bind:title="tooltip">` |
| `ac:if="expr"` | Conditional render | `<div ac:if="isVisible">` |
| `ac:for="x of xs"` | List render | `<li ac:for="item of items">` |
| `#refName` | Template reference | `<div #myDiv>` |

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
