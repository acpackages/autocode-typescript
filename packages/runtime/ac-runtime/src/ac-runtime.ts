/**
 * @module ac-runtime
 *
 * Public API surface for the AC Runtime framework.
 *
 * This barrel file re-exports everything a consumer needs to author
 * AC Runtime components:
 *
 * - **Decorators** — `@AcElement`, `@AcInput`, `@AcOutput`, `@AcViewChild`
 *   Mark classes and properties so the {@link ComponentCompiler} can
 *   transform them into native Web Components at build time.
 *
 * - **Interfaces** — Lifecycle hooks (`IAcOnInit`, `IAcOnDestroy`, …) and
 *   metadata shapes (`IAcElementMetadata`, `IAcChangeArgs`, …) that
 *   provide type-safe contracts for component authors.
 *
 * - **Runtime helpers** — `AcEventEmitter<T>` for typed event output.
 *
 * - **Router** — `acRouter` singleton, `AcRouterElement`, and `IAcRoute`
 *   for client-side navigation within AC Runtime applications.
 *
 * @example
 * ```ts
 * import { AcElement, AcInput, IAcOnInit } from 'ac-runtime';
 *
 * @AcElement({ selector: 'my-card', template: '<div>{{title}}</div>' })
 * export class MyCard implements IAcOnInit {
 *   @AcInput() title = '';
 *   acOnInit() { console.log('mounted'); }
 * }
 * ```
 */
export * from './lib/decorators/_decorators.export';
export * from './lib/interfaces/_interfaces.export';
export * from './lib/runtime-helpers';
export * from './lib/core/ac-element-renderer';
export * from './lib/core/ac-element-loop-renderer';
export * from './lib/core/ac-runtime-element';
export * from './lib/router';
