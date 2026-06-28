/**
 * @module interfaces
 *
 * Barrel export for all AC Runtime interfaces and type contracts.
 *
 * These interfaces fall into two categories:
 *
 * **Metadata shapes** — describe the structure of decorator arguments
 * and internal compiler data:
 * - {@link IAcElementMetadata} — `@AcElement()` config.
 * - {@link IAcElementViewChildMetadata} — Internal `@AcViewChild` mapping.
 * - {@link IAcChangeArgs} — Payload for change notifications.
 *
 * **Lifecycle hooks** — implement these on your component class to
 * receive notifications at specific points in the component lifecycle:
 * - {@link IAcOnInit} — After first render (`connectedCallback`).
 * - {@link IAcOnDestroy} — Before removal (`disconnectedCallback`).
 * - {@link IAcOnConnected} — Element inserted into the DOM.
 * - {@link IAcOnDisconnected} — Element removed from the DOM.
 * - {@link IAcOnChange} — Any reactive property changed.
 * - {@link IAcOnPropertyChange} — A specific property changed.
 */
export * from './ac-change-args.interface';
export * from './ac-element-metadata.interface';
export * from './ac-element-view-child-metadata.interface';
export * from './ac-on-change.interface';
export * from './ac-on-connected.interface';
export * from './ac-on-destroy.interface';
export * from './ac-on-disconnected.interface';
export * from './ac-on-init.interface';
export * from './ac-on-property-change.interface';
export * from './ac-value-accessor.interface';