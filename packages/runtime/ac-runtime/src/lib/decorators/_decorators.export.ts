/**
 * @module decorators
 *
 * Barrel export for all AC Runtime decorators.
 *
 * These decorators are **compile-time markers** — their runtime bodies
 * are intentionally empty. The {@link ComponentCompiler} reads them via
 * the TypeScript AST during compilation and generates the corresponding
 * Web Component boilerplate.
 *
 * | Decorator       | Purpose                                      |
 * |-----------------|----------------------------------------------|
 * | `@AcElement`    | Marks a class as an AC component              |
 * | `@AcInput`      | Marks a property as an external input (attr)  |
 * | `@AcOutput`     | Marks a property as an event emitter          |
 * | `@AcViewChild`  | Provides a reference to a template element    |
 */
export * from './ac-element.decorator';
export * from './ac-input.decorator';
export * from './ac-output.decorator';
export * from './ac-view-child.decorator';
export * from './ac-subscribe-change.decorator';
export * from './ac-listen-changes.decorator';