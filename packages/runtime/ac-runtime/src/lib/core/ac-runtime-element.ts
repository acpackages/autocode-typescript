/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/**
 * @module ac-element-base
 *
 * Shared base class for all AC Runtime generated Web Components.
 *
 * Previously, the {@link ComponentCompiler} inlined ~300 lines of shared
 * HTMLElement wrapper methods into every generated component file. This
 * base class extracts those shared methods so each generated component
 * only needs to provide its constructor (creating the inner class instance,
 * wiring bindings, registering property listeners) and a `render()` override.
 *
 * Generated components extend this class:
 * ```ts
 * class $$$MyComponent extends AcRuntimeElement {
 *   constructor() {
 *     super();
 *     this.acRuntimeInstance = new MyComponent();
 *     // ... bindings, viewChildren, property listeners ...
 *     (this.acRuntimeInstance as any).element = this;
 *   }
 *   protected async render() {
 *     this.innerHTML = `<div>...</div>`;
 *     // ... execute change listeners ...
 *   }
 * }
 * ```
 */
import { randomBytes } from 'crypto';
import { AcElementRenderer } from './ac-element-renderer';

/**
 * Base HTMLElement class for all AC Runtime compiled components.
 *
 * Provides shared lifecycle management, expression evaluation,
 * property change tracking, and DOM utility methods.
 */
export class AcRuntimeElement extends HTMLElement {
  /** The inner component class instance created by the generated subclass. */
  acRuntimeInstance: any;
  elementComponent: any;
  elementHtml!: string;
  changeSubscribers: any[] = [];
  instanceInputs: any[] = [];
  instanceOutputs: any[] = [];
  instanceViewChildren: any = {};
  propertyToListenForChanges:string[] = [];
  protected renderer!: AcElementRenderer;

  /** Prevents double initialization when connectedCallback fires multiple times. */
  private isInitialized: boolean = false;

  /**
   * Registry of change listeners keyed by a unique binding ID.
   * Each entry tracks the callback, binding metadata, and last-known value
   * for dirty-checking.
   */

  changeListeners: Record<string, Record<string, { callback: any; binding: { expression: string; type: string }; }>> = {};
  eventCallbacks: Record<string, Record<string, { callback: any; binding: { expression: string; type: string }; }>> = {};

  /**
   * Maps property names to the binding target IDs that depend on them.
   * When a property changes, we look up which bindings need re-evaluation.
   *
   * Structure: `{ propertyName: { targetId: callbackKey, ... }, ... }`
   *
   * Populated by the generated subclass constructor.
   */
  protected propertyListeners: any = {};

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  connectedCallback(): void {
    if (!this.isInitialized) {
      this.init();
    }
  }

  disconnectedCallback(): void {
    if ((this.acRuntimeInstance as any).acOnDestroy) {
      (this.acRuntimeInstance as any).acOnDestroy();
    }
    if ((this.acRuntimeInstance as any).__destroy) {
      (this.acRuntimeInstance as any).__destroy();
    }
  }

  protected generateHexId(): string {
    const bytes = new Uint8Array(4);

    crypto.getRandomValues(bytes);

    return Array.from(bytes, b =>
      b.toString(16).padStart(2, '0')
    ).join('');
  }

  init() {
    this.renderer = new AcElementRenderer({ isRoot: true, rootElement: this, html: this.elementHtml, context: this.acRuntimeInstance });
    this.isInitialized = true;
    this.style.display = 'contents';
    this.render().then(() => {
      if ((this.acRuntimeInstance as any).acOnInit) {
        (this.acRuntimeInstance as any).acOnInit();
      }
    });

  }

  // ─── Template Rendering (overridden by generated subclass) ──────────────────

  /**
   * Render the component template and execute initial change listeners.
   * Generated subclasses override this to set `innerHTML` with the compiled
   * template and trigger initial binding evaluation.
   */
  protected async render(): Promise<void> {
    //
    await this.renderer.render();
  }

  // ─── Change Detection ──────────────────────────────────────────────────────

  /**
   * Execute one or more change listeners by key, re-evaluating the expression
   * and invoking the callback if the value has changed (or if forced).
   */


  /**
   * Handle a property value change by dispatching to all registered
   * change listeners that depend on the changed property.
   */
  protected async handlePropertyChange({
    key,
    oldValue,
    newValue,
  }: {
    key: string;
    oldValue: any;
    newValue: any;
  }): Promise<void> {
    if (this.propertyListeners[key]) {
      for (const targetId of Object.keys(this.propertyListeners[key])) {
        await this.renderer.executeChangeListener({ targetId: targetId, bindingIds: this.propertyListeners[key][targetId] });
      }
    }
    if(this.propertyToListenForChanges.includes(key)){
      if (this.acRuntimeInstance.acOnChange) {
        this.acRuntimeInstance.acOnChange({key,oldValue,newValue});
      }
    }
  }

  /**
   * Install a property interceptor on the component instance via
   * `Object.defineProperty`. When the property is set, it triggers
   * `handlePropertyChange` and lifecycle hooks (`acOnChange`, `acOnPropertyChange`).
   */
  makeReactive(instance: any) {
    const object = this;
    const proxyMap = new WeakMap<object, any>();
    const IS_REACTIVE = '__is_reactive__';

    function isPlainObject(obj: any): boolean {
      if (obj === null || typeof obj !== 'object') return false;
      return Object.getPrototypeOf(obj) === Object.prototype;
    }

    function wrap<U extends object>(target: U, path: string[] = []): U {
      if (target && !isPlainObject(target) && !Array.isArray(target) && target != instance) {
        return target;
      }
      if ((target as any)[IS_REACTIVE]) return target;
      if (proxyMap.has(target)) return proxyMap.get(target);

      const handler: ProxyHandler<U> = {
        get(obj: U, prop: string | symbol, receiver: any) {
           if (prop === IS_REACTIVE) return true;
          // Transparently unwrap if the raw object is requested
          if (prop === '__rawTarget__') return obj;

          const value = Reflect.get(obj, prop, receiver);

          if (typeof value === 'function') {
            const key = String(prop);

            // UNIVERSAL NATIVE DETECTOR:
            // Check if the method belongs to a native runtime object (HTMLElement, Window, Event, Map, etc.)
            // by verifying if the method's owner constructor is native code.
            const isNativeMethod =
              obj.constructor &&
              obj.constructor.toString().includes('[native code]') &&
              !(key in obj); // Ensure it's not overridden by custom code

            const isDOMMethod = obj instanceof HTMLElement && key in HTMLElement.prototype;

            if (isNativeMethod || isDOMMethod) {
              // Native platform code demands the actual object context to prevent 'Illegal invocation'
              return value.bind(obj);
            }

            // Custom business logic methods get bound to the proxy wrapper
            // to ensure internal `this.xxx = yyy` statements hit the SET trap.
            return value.bind(receiver);
          }

          if (typeof value === 'object' && value !== null && isPlainObject(value)) {
            console.log("Wrapping value as reactive",value,prop);
            return wrap(value, [...path, String(prop)]);
          }

          return value;
        },

        set(obj: U, prop: string | symbol, value: any, receiver: any) {
          const key = String(prop);
          const oldValue = (obj as any)[key];



          if (oldValue === value && key !== 'length') {
            return Reflect.set(obj, prop, value, receiver);
          }

          const isArrayLength = Array.isArray(obj) && key === 'length';

          // Unwrap value if a proxy is being assigned to prevent deep nested circular proxying
          const cleanValue = value && value.__rawTarget__ ? value.__rawTarget__ : value;
          const success = Reflect.set(obj, prop, cleanValue, receiver);

          if (success && !isArrayLength) {
            if (oldValue != value) {
              object.handlePropertyChange({
                key,
                // path: [...path, key].join('.'),
                oldValue,
                newValue: cleanValue
              });
            }

          }

          return success;
        }
      };

      const proxy = new Proxy(target, handler);
      proxyMap.set(target, proxy);
      return proxy;
    }

    return wrap(instance);
  }

  protected registerChangeListenerDefinition({ targetId, bindingId, definition }: { targetId: string, bindingId: string, definition: any }): void {
    if (this.changeListeners[targetId] == undefined) {
      this.changeListeners[targetId] = {};
    }
    this.changeListeners[targetId][bindingId] = definition;
  }

  protected registerEventDefinition({ targetId, bindingId, definition }: { targetId: string, bindingId: string, definition: any }): void {
    if (this.eventCallbacks[targetId] == undefined) {
      this.eventCallbacks[targetId] = {};
    }
    this.eventCallbacks[targetId][bindingId] = definition;
  }

  protected registerPropertyListenerKey({ targetId, bindingId, property }: { targetId: string, bindingId: string, property: string }): void {
    if (this.propertyListeners[property] == undefined) {
      this.propertyListeners[property] = {};
    }
    if (this.propertyListeners[property][targetId] == undefined) {
      this.propertyListeners[property][targetId] = [];
    }
    if (!this.propertyListeners[property][targetId].includes(bindingId)) {
      this.propertyListeners[property][targetId].push(bindingId);
    }
  }

}
