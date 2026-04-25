/* eslint-disable @typescript-eslint/no-this-alias */
import { AC_RUNTIME_CONFIG } from '../consts/ac-runtime-config.const';
import { getAcInputMetadata, getAcOutputMetadata, getAcViewChildMetadata } from '../decorators/_decorators.export';

export type EffectFn = () => (Promise<void> | void | (() => void));

interface Subscriber {
  notify(): void;
  dependencies: Set<Set<Subscriber>>;
}

let activeSubscriber: Subscriber | null = null;
const subscriberStack: Subscriber[] = [];

/**
 * Dependency tracking maps:
 * targetMap: object -> property key -> Set of effects
 * proxyMap: object -> its proxy (to reuse proxies)
 */
export const targetMap = new WeakMap<object, Map<string | symbol, Set<Subscriber>>>();
export const proxyMap = new WeakMap<object, any>();
const IS_REACTIVE = '__is_reactive__';

/**
 * Tracks access to a property.
 */
export function acTrack(target: object, key: string | symbol) {
  if (!activeSubscriber) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  dep.add(activeSubscriber);
  activeSubscriber.dependencies.add(dep);
}

/**
 * Triggers all effects dependent on a property.
 */
export function acTrigger(target: object, key: string | symbol) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (dep) {
    // Run a copy of the set to avoid infinite loops during mutation
    const subscribersToRun = new Set(dep);
    subscribersToRun.forEach((subscriber) => {
      subscriber.notify();
    });
  }
}

/**
 * Microtask-based effect batch scheduler.
 * Multiple triggers within the same synchronous frame are deduplicated —
 * each effect runs at most once per microtask flush.
 */
const pendingEffects = new Set<Effect>();
let isFlushing = false;
let isFlushScheduled = false;

function scheduleEffect(effect: Effect) {
  pendingEffects.add(effect);
  if (!isFlushScheduled) {
    isFlushScheduled = true;
    queueMicrotask(flushEffects);
  }
}

function flushEffects() {
  if (isFlushing) return;
  isFlushing = true;
  try {
    // Iterate a snapshot; effects added during flush are picked up in a follow-up
    const effects = Array.from(pendingEffects);
    pendingEffects.clear();
    isFlushScheduled = false;
    for (const effect of effects) {
      effect.execute();
    }
    // If new effects were scheduled during this flush, schedule another
    if (pendingEffects.size > 0 && !isFlushScheduled) {
      isFlushScheduled = true;
      queueMicrotask(flushEffects);
    }
  } finally {
    isFlushing = false;
  }
}

/**
 * Effect class that manages subscription and re-execution.
 * Uses microtask batching to deduplicate multiple triggers per tick.
 */
export class Effect implements Subscriber {
  private cleanupFn?: () => void;
  dependencies = new Set<Set<Subscriber>>();

  constructor(private fn: EffectFn) {
    // Initial run is synchronous (not batched) to ensure DOM is ready on first render
    this.run();
  }

  notify() {
    // Prevent recursive triggers from within the same effect
    if (subscriberStack.includes(this)) {
      return;
    }
    // Queue into the microtask batch instead of running immediately
    scheduleEffect(this);
  }

  /** Called by the batch scheduler */
  execute() {
    this.run();
  }

  private run() {
    this.cleanup();

    try {
      subscriberStack.push(this);
      activeSubscriber = this;
      const result = this.fn();
      if (typeof result === 'function') {
        this.cleanupFn = result;
      }
    } finally {
      subscriberStack.pop();
      activeSubscriber = subscriberStack[subscriberStack.length - 1] || null;
    }
  }

  private cleanup() {
    if (this.cleanupFn) {
      try {
        this.cleanupFn();
      } catch (e) {
        AC_RUNTIME_CONFIG.logError('Error during effect cleanup:', e);
      }
      this.cleanupFn = undefined;
    }

    this.dependencies.forEach(dep => dep.delete(this));
    this.dependencies.clear();
  }

  public destroy() {
    this.cleanup();
  }
}

/**
 * Creates a reactive effect.
 */
export function acEffect(fn: EffectFn) {
  return new Effect(fn);
}

/**
 * Sets reactive descriptors (getter/setter) on a target object's existing properties.
 * This bridges the gap for updates made via the raw instance (e.g. from arrow functions).
 */
function acSetReactiveDescriptors(target: any) {
  if (!target || typeof target !== 'object' || Array.isArray(target) || target[IS_REACTIVE]) return;

  const keys = Object.getOwnPropertyNames(target);
  for (const key of keys) {
    if (key.startsWith('__')) continue;

    const desc = Object.getOwnPropertyDescriptor(target, key);
    if (desc && desc.configurable && !desc.get && !desc.set && typeof desc.value !== 'function') {
      let val = desc.value;
      Object.defineProperty(target, key, {
        get() { return val; },
        set(newVal) {
          if (val !== newVal || (newVal && typeof newVal === 'object')) {
            val = newVal;
            acTrigger(target, key);
          }
        },
        enumerable: desc.enumerable,
        configurable: true
      });
    }
  }
}

/**
 * Creates a reactive proxy for an object or array.
 * Supports deep reactivity via lazy wrapping on access.
 * Maintains rootTarget and rootKey for acOnPropertyChange reporting.
 */
export function acProxyReactive<T extends object>(target: T, rootTarget?: object, rootKey?: string, force = false): T {
  if (target === null || typeof target !== 'object') return target;
  if ((target as any)[IS_REACTIVE]) return target;

  const existingProxy = proxyMap.get(target);
  if (existingProxy) return existingProxy;

  // Only make plain objects, arrays, or forced targets (components) reactive
  if (!force && !isPlainObject(target) && !Array.isArray(target)) {
    return target;
  }

  // Set reactive descriptors on the raw object to bridge raw instance updates (arrow functions)
  acSetReactiveDescriptors(target);

  const resolvedRoot = rootTarget || target;

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      if (key === IS_REACTIVE) return true;

      const res = Reflect.get(target, key, receiver);

      // Skip tracking for symbols/private properties
      if (typeof key !== 'symbol' && !String(key).startsWith('__')) {
        acTrack(target, key);
      }

      // bind methods so `this` === proxy
      // if (typeof res === 'function') {
      //   return res.bind(receiver);
      // }

      // Deep reactivity: wrap nested objects/arrays lazily on request
      if (isPlainObject(res) || Array.isArray(res)) {
        const fullPath = rootKey ? `${rootKey}.${String(key)}` : String(key);
        return acProxyReactive(res as object, resolvedRoot, fullPath);
      }

      return res;
    },

    set(target, key, value, receiver) {
      const isArray = Array.isArray(target);
      const oldLength = isArray ? target.length : 0;
      const oldValue = (target as any)[key];

      // Trigger if value has changed OR if it's an object/array (potential internal mutation)
      if (value !== oldValue || (value && typeof value === 'object')) {
        const res = Reflect.set(target, key, value, receiver);

        if (res && typeof key !== 'symbol' && !String(key).startsWith('__')) {
          acTrigger(target, key);

          // Trigger acOnPropertyChange hook on root
          if (
            resolvedRoot &&
            typeof (resolvedRoot as any).acOnPropertyChange === 'function' &&
            typeof key === 'string' &&
            !(resolvedRoot as any).__is_executing_on_changes__
          ) {
            (resolvedRoot as any).__is_executing_on_changes__ = true;
            try {
              (resolvedRoot as any).acOnPropertyChange({
                key: rootKey ? `${rootKey}` : key,
                oldValue,
                newValue: value,
                property: rootKey ? key : undefined,
              });
            } finally {
              (resolvedRoot as any).__is_executing_on_changes__ = false;
            }
          }

          if (isArray && target.length !== oldLength && key !== 'length') {
            acTrigger(target, 'length');
          }
        }
        return res;
      }
      return true;
    },

    deleteProperty(target, key) {
      const isArray = Array.isArray(target);
      const oldLength = isArray ? target.length : 0;
      const hasKey = Object.prototype.hasOwnProperty.call(target, key);
      const oldValue = (target as any)[key];
      const res = Reflect.deleteProperty(target, key);

      if (hasKey && res) {
        acTrigger(target, key);
        const ITERATE_KEY = Symbol('iterate');
        acTrigger(target, ITERATE_KEY);
        if (isArray && target.length !== oldLength) {
          acTrigger(target, 'length');
        }
        if (
          resolvedRoot &&
          (resolvedRoot as any).__ac_initialized__ &&
          typeof (resolvedRoot as any).acOnPropertyChange === 'function' &&
          typeof key === 'string' &&
          !(resolvedRoot as any).__is_executing_on_changes__
        ) {
          (resolvedRoot as any).__is_executing_on_changes__ = true;
          try {
            (resolvedRoot as any).acOnPropertyChange({
              key: rootKey ? `${rootKey}` : key,
              oldValue,
              newValue: undefined,
              property: rootKey ? key : undefined,
            });
          } finally {
            (resolvedRoot as any).__is_executing_on_changes__ = false;
          }
        }
      }
      return res;
    }
  });

  proxyMap.set(target, proxy);
  return proxy as T;
}

/**
 * Makes a component instance or object reactive.
 * Binds methods to ensure 'this' always points to the proxy.
 */
export function acMakeReactive<T extends object>(target: T): T {
  if (target === null || typeof target !== 'object') return target;
  if ((target as any)[IS_REACTIVE]) return target;

  const constructor = target.constructor as any;
  const isPlainOrArray = isPlainObject(target) || Array.isArray(target);
  const isComponent = !isPlainOrArray && constructor && constructor !== Object;

  // Components are forced to be reactive even if they are class instances
  const proxy = acProxyReactive(target, undefined, undefined, true);

  if (isComponent) {
    // Re-initialize metadata props if missing (e.g. uninitialized @AcInput)
    const inputs = getAcInputMetadata(constructor);
    const outputs = getAcOutputMetadata(constructor);
    const viewChildren = getAcViewChildMetadata(constructor);

    [inputs, outputs, viewChildren].forEach(meta => {
      Object.keys(meta).forEach(key => {
        if (!(key in target)) {
          (target as any)[key] = undefined;
        }
      });
    });

    // Auto-bind all proto methods to the Proxy
    let proto = Object.getPrototypeOf(target);
    while (proto && proto !== Object.prototype) {
      Object.getOwnPropertyNames(proto).forEach(name => {
        if (name === 'constructor') return;
        const desc = Object.getOwnPropertyDescriptor(proto, name);
        if (desc && typeof desc.value === 'function') {
          if (!Object.prototype.hasOwnProperty.call(target, name)) {
            (target as any)[name] = desc.value.bind(proxy);
          }
        }
      });
      proto = Object.getPrototypeOf(proto);
    }
  }
  return proxy;
}

/**
 * Helper to check for plain objects.
 */
function isPlainObject(obj: any): boolean {
  if (obj === null || typeof obj !== 'object') return false;
  return Object.getPrototypeOf(obj) === Object.prototype;
}