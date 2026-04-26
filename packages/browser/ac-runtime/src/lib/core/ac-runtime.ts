import { acNullifyInstanceProperties } from "@autocode-ts/autocode";
import { AC_RUNTIME_CONFIG } from "../consts/ac-runtime-config.const";
import { AcElementManager } from "./ac-element-manager";
import { acElementRegistry } from "./ac-element-registry";

let isGlobalObserverStarted = false;

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
  await acInstanciateExistingElements(document.body);

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
          await acInstanciateExistingElements(node);
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

export async function acAutoBootstrap(el: HTMLElement): Promise<any> {
  const existingId = el.getAttribute('ac-engine-element');
  if (existingId && acElementRegistry.getInstance({ uuid: existingId })) return null;

  const registration = acElementRegistry.getByElement(el);
  if (registration) {
    // If it was previously destroyed/removed, clear the stale ID to trigger a fresh bootstrap with new UUID
    if (existingId) el.removeAttribute('ac-engine-element');

    const instance = new registration.constructor();
    const manager = new AcElementManager({ instance, element: el });
    await manager.bootstrap();
    return instance;
  }
  return null;
}

export async function acInitRuntimeElementInstance(instance: any) {
  if (typeof instance.acOnInit === 'function') {
    try {
      instance.acOnInit();
    }
    catch (ex) {
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

export async function acInstanciateExistingElements(element: HTMLElement) {
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
      await acInstanciateExistingElements(child);
    }
  }
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
        const manager = (instance as any).__ac_manager__;
        if (manager && typeof manager.destroy === 'function') {
          await manager.destroy();
        }
        acNullifyInstanceProperties({instance:instance});
        acElementRegistry.removeInstance({ uuid: instanceId });
      }
    }
  }
}
