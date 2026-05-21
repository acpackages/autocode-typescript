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
  elementHtml!:string;
  protected renderer!:AcElementRenderer;

  /** Prevents double initialization when connectedCallback fires multiple times. */
  private isInitialized: boolean = false;

  /**
   * Registry of change listeners keyed by a unique binding ID.
   * Each entry tracks the callback, binding metadata, and last-known value
   * for dirty-checking.
   */

  changeListeners: Record<
    string,
    {
      callback: any;
      binding: { expression: string; type: string };
    }
  > = {};

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
      this.isInitialized = true;
      this.style.display = 'contents';
      this.render();
      if ((this.acRuntimeInstance as any).acOnInit) {
        (this.acRuntimeInstance as any).acOnInit();
      }
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

  init(){
    this.renderer = new AcElementRenderer({isRoot:true,rootElement:this,html:this.elementHtml,context:this.acRuntimeInstance});
  }

  // ─── Template Rendering (overridden by generated subclass) ──────────────────

  /**
   * Render the component template and execute initial change listeners.
   * Generated subclasses override this to set `innerHTML` with the compiled
   * template and trigger initial binding evaluation.
   */
  protected async render(): Promise<void> {
    //
    this.renderer.render();
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
        const callKey = this.propertyListeners[key][targetId];
        await this.renderer.executeChangeListener({ key: callKey });
      }
    }
  }

  /**
   * Install a property interceptor on the component instance via
   * `Object.defineProperty`. When the property is set, it triggers
   * `handlePropertyChange` and lifecycle hooks (`acOnChange`, `acOnPropertyChange`).
   */
  protected registerPropertyListener(key: string): void {
    let value = (this.acRuntimeInstance as any)[key];
    Object.defineProperty(this.acRuntimeInstance, key, {
      get: () => {
        return value;
      },
      set: (newValue) => {
        if (Object.is(value, newValue)) {
          return;
        }
        const oldValue = value;
        value = newValue;
        this.handlePropertyChange({ key, oldValue, newValue });
        const changes = {
          key,
          oldValue,
          newValue,
          firstChange: false,
        };
        if ((this.acRuntimeInstance as any).acOnChange) {
          (this.acRuntimeInstance as any).acOnChange(changes);
        }
        if ((this.acRuntimeInstance as any).acOnPropertyChange) {
          (this.acRuntimeInstance as any).acOnPropertyChange(changes);
        }
      },
      configurable: true,
      enumerable: true,
    });
  }

}
