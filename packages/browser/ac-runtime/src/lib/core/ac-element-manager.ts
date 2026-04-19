/* eslint-disable @typescript-eslint/no-inferrable-types */
import { acMakeReactive } from './reactive';
import { AcTemplateEngine } from './../engine/_engine.export';
import { Autocode } from '@autocode-ts/autocode';
import { AC_RUNTIME_CONFIG } from '../consts/ac-runtime-config.const';
import { AC_ELEMENT_METADATA_KEY } from '../consts/symbols.const';
import { acElementRegistry } from './ac-element-registry';
import { getAcViewChildMetadata } from '../decorators/_decorators.export';
import { IAcElementMetadata } from '../interfaces/ac-element-metadata.interface';

export class AcElementManager {
  private element!: HTMLElement;
  private metadata: IAcElementMetadata;
  instance: any;
  private templateEngine!: AcTemplateEngine;
  private uuid!: string;
  private parentEngine?:AcTemplateEngine;

  constructor({instance,element,parentEngine}:{instance: any, element?: HTMLElement,parentEngine?:AcTemplateEngine}) {
    this.instance = instance;
    this.parentEngine = parentEngine;
    this.metadata = (instance.constructor as any)[AC_ELEMENT_METADATA_KEY];
    if (!this.metadata) {
      throw new Error(`No metadata found for ${instance.constructor.name}. Did you forget @AcElement decorator?`);
    }
    if (element) {
      this.element = element;
    }
  }

  public async bootstrap() {
    if (!this.element) {
      this.element = document.querySelector(this.metadata.selector) as HTMLElement;
      if (!this.element) {
        throw new Error(`Selector ${this.metadata.selector} not found for element ${this.instance.constructor.name}`);
      }
    }
    // Initialize reactivity
    this.instance = acMakeReactive(this.instance);
    this.setUUID();

    // Initialize template engine with reactive instance
    this.templateEngine = new AcTemplateEngine({context:this.instance,parentEngine:this.parentEngine});

    if (this.metadata.templateUrl) {
      const response = await fetch(this.metadata.templateUrl);
      this.metadata.template = await response.text();
    }

    // Inject host element reference if the component class has 'element' property
    // This allows components (like Router) to manipulate their own DOM
    Object.defineProperty(this.instance, 'element', {
      value: this.element,
      enumerable: false,
      writable: true,
      configurable: true
    });

    if (this.metadata.styles) {
      this.applyStyles(this.metadata.styles);
    }

    if (this.metadata.styleUrls) {
      await this.loadStyleUrls(this.metadata.styleUrls);
    }

    this.render();

    // Resolve ViewChild references BEFORE acOnInit
    AcElementManager.resolveViewChild(this.instance, this.templateEngine);

    await acInitRuntimeElementInstance(this.instance);
    // Trigger connected hook immediately after init if bootstrapped manually or during scan
    await acInitRuntimeElementConnected(this.instance);

    acElementRegistry.registerInstance({ instance: this.instance, uuid: this.uuid })
  }

  public static resolveViewChild(instance: any, templateEngine: AcTemplateEngine) {
    const viewChildMetadata = getAcViewChildMetadata(instance.constructor);
    if (Object.keys(viewChildMetadata).length > 0) {
      const childElements = templateEngine.getChildElements();
      const templates = templateEngine.getTemplates();

      for (const [propertyKey, selector] of Object.entries(viewChildMetadata)) {
        // 1. Try to find in templates first (case-insensitive)
        const templateName = selector.startsWith('#') ? selector.slice(1).toLowerCase() : selector.toLowerCase();
        let found = false;

        for (const [name, template] of templates.entries()) {
          if (name.toLowerCase() === templateName) {
            instance[propertyKey] = template;
            found = true;
            break;
          }
        }
        if (found) continue;

        // 2. Find matching child element instance or reference (case-insensitive)
        for (const [el, childInstance] of childElements.entries()) {
          const elAttrs = Array.from(el.attributes);

          // Check if selector matches a reference attribute (e.g. #myRef)
          const hasRef = elAttrs.some(attr => attr.name.toLowerCase() === `#${templateName}` || attr.name.toLowerCase() === selector.toLowerCase());

          if (hasRef) {
            instance[propertyKey] = (el as any).acInstance || childInstance;
            break;
          }

          // Check if selector matches tag name (simple fallback)
          if (el.tagName.toLowerCase() === selector.toLowerCase()) {
            instance[propertyKey] = (el as any).acInstance || childInstance;
            break;
          }
        }
      }
    }
  }

  private applyStyles(styles: string | string[]) {
    acSetEngineElementStyles(styles, this.uuid);
  }

  private async loadStyleUrls(urls: string[]) {
    const promises = urls.map(async (url) => {
      const response = await fetch(url);
      return await response.text();
    });
    const styles = await Promise.all(promises);
    this.applyStyles(styles);
  }

  private render(): void {
    const template = this.metadata.template || '';
    for (let child of this.element.childNodes) {
      child.remove();
      (child as any) = null;
    }
    this.element.innerHTML = template;

    // Use the preserved templateEngine
    this.templateEngine.compile(this.element);
  }

  private setUUID() {
    const uuid = acSetEngineElementEngineUUID(this.element, this.instance);
    if (uuid) {
      this.uuid = uuid;
    }
  }
}

/**
 * Automatically detects if an element is a registered AcElement and bootstraps it.
 * @param el The host element to bootstrap
 * @returns The component instance if bootstrapped, otherwise null
 */
export async function acAutoBootstrap(el: HTMLElement): Promise<any> {
  const existingId = el.getAttribute('ac-engine-element');
  if (existingId && acElementRegistry.getInstance({ uuid: existingId })) return null;

  const registration = acElementRegistry.getByElement(el);
  if (registration) {
    // If it was previously destroyed/removed, clear the stale ID to trigger a fresh bootstrap with new UUID
    if (existingId) el.removeAttribute('ac-engine-element');

    const instance = new registration.constructor();
    const manager = new AcElementManager({instance, element:el});
    await manager.bootstrap();
    return instance;
  }
  return null;
}

let isGlobalObserverStarted = false;

/**
 * Automatically bootstraps all registered components found in the DOM and starts a global observer.
 * Call this once after importing your components.
 */
export async function acBootstrapElements() {
  if (isGlobalObserverStarted) return;
  isGlobalObserverStarted = true;

  const components = acElementRegistry.getAllElements();

  // Initial scan and bootstrap
  for (const registration of components) {
    const elements = document.querySelectorAll(registration.selector);
    for (const el of Array.from(elements)) {
      await acAutoBootstrap(el as HTMLElement);
    }
  }

  // Call connected hook for all elements initially in the DOM
  await acCheckAndCallConnected(document.body);

  // Start global observer for any future elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(async node => {
        if (node instanceof HTMLElement) {
          // 1. Try to bootstrap the node itself
          await acAutoBootstrap(node);

          // 2. Also check all its children in case of bulk insertion (like innerHTML or fragments)
          const childElements = node.querySelectorAll('*');
          for (const child of Array.from(childElements)) {
            await acAutoBootstrap(child as HTMLElement);
          }

          // Call connected for existing or new instances
          await acCheckAndCallConnected(node);
        }
      });
      mutation.removedNodes.forEach(async node => {
        if (node instanceof HTMLElement) {
          await acCheckAndCallDisconnected(node);

          // Delayed destruction check:
          // If the element is re-inserted in the same task (a "move"), isConnected will be true
          // and we skip destruction, keeping the state intact.
          setTimeout(async () => {
            if (!node.isConnected) {
              await acCheckAndDestroyElementInstances(node);
            }
          }, 0);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

export async function acCheckAndDestroyElementInstances(element: HTMLElement) {
  for (const child of Array.from(element.children)) {
    if (child instanceof HTMLElement) {
      await acCheckAndDestroyElementInstances(child);
    }
  }
  if (element.hasAttribute('ac-engine-element')) {
    const instanceId = element.getAttribute('ac-engine-element');
    if (instanceId) {
      const instance = acElementRegistry.getInstance({ uuid: instanceId });
      if (instance) {
        const manager = (instance as any).__ac_manager__;
        if (manager && typeof manager.destroy === 'function') {
          await manager.destroy();
        } else {
          // Fallback cleanup if manager is not available
          if (instance.__ac_destroyed__) return;
          await acInitRuntimeElementDisconnected(instance);
          if (typeof instance.acOnDestroy === 'function') {
            instance.acOnDestroy();
          }
          Object.defineProperty(instance, '__ac_destroyed__', {
            value: true,
            enumerable: false,
            writable: true,
            configurable: true
          });
          acElementRegistry.removeInstance({ uuid: instanceId });
        }
      }
    }
  }
}

export async function acInitRuntimeElementInstance(instance: any) {
  if (typeof instance.acOnInit === 'function') {
    try {
      instance.acOnInit();
    }
    catch (ex) {
      // console.log(instance);
      AC_RUNTIME_CONFIG.logError(ex);
    }
  }
  Object.defineProperty(instance, '__ac_initialized__', {
    value: true,
    enumerable: false,
    writable: true,
    configurable: true
  });
}

export async function acInitRuntimeElementConnected(instance: any) {
  if (instance.__ac_connected__) return;
  if (typeof instance.acOnConnected === 'function') {
    try {
      instance.acOnConnected();
    }
    catch (ex) {
      AC_RUNTIME_CONFIG.logError(ex);
    }
  }
  Object.defineProperty(instance, '__ac_connected__', {
    value: true,
    enumerable: false,
    writable: true,
    configurable: true
  });
}

export async function acInitRuntimeElementDisconnected(instance: any) {
  if (!instance.__ac_connected__) return;
  if (typeof instance.acOnDisconnected === 'function') {
    try {
      instance.acOnDisconnected();
    }
    catch (ex) {
      AC_RUNTIME_CONFIG.logError(ex);
    }
  }
  instance.__ac_connected__ = false;
}

export async function acCheckAndCallConnected(element: HTMLElement) {
  if (element.hasAttribute('ac-engine-element')) {
    const instanceId = element.getAttribute('ac-engine-element');
    if (instanceId) {
      const instance = acElementRegistry.getInstance({ uuid: instanceId });
      if (instance) {
        await acInitRuntimeElementConnected(instance);
      }
    }
  }
  for (const child of Array.from(element.children)) {
    if (child instanceof HTMLElement) {
      await acCheckAndCallConnected(child);
    }
  }
}

export async function acCheckAndCallDisconnected(element: HTMLElement) {
  if (element.hasAttribute('ac-engine-element')) {
    const instanceId = element.getAttribute('ac-engine-element');
    if (instanceId) {
      const instance = acElementRegistry.getInstance({ uuid: instanceId });
      if (instance) {
        await acInitRuntimeElementDisconnected(instance);
      }
    }
  }
  for (const child of Array.from(element.children)) {
    if (child instanceof HTMLElement) {
      await acCheckAndCallDisconnected(child);
    }
  }
}

export function acSetEngineElementEngineUUID(element: HTMLElement, instance: any): string | undefined {
  if (element && !element.hasAttribute('ac-engine-element')) {
    const uuid = Autocode.uuid();
    element.setAttribute('ac-engine-element', uuid);
    (element as any).acInstance = instance; // Attach instance to element
    const customEvent: CustomEvent = new CustomEvent('acRuntimeElementIdAttached', { detail: { 'instance': instance } });
    element.dispatchEvent(customEvent);
    return uuid;
  }
  return undefined;
}

export function acSetEngineElementStyles(styles: string | string[], uuid: string) {
  let styleContent: string = '';
  if (typeof styles == 'string') {
    styleContent = styles;
  }
  else {
    styleContent = styles.join('\n');
  }
  if (styleContent != '') {
    styleContent = styleContent.replace(/:host\((.*?)\)/g, `&$1`).replace(/:host\b/g, '&');
    const styleEl = document.createElement('style');
    styleEl.setAttribute('ac-engine-style-for', uuid);
    document.head.appendChild(styleEl);
    styleEl.textContent = `[ac-engine-element="${uuid}"]{\n${styleContent}\n}`;
  }
}
