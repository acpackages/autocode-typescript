/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcElementRenderer } from './ac-element-renderer';
export class AcRuntimeElement extends HTMLElement {
  /** The inner component class instance created by the generated subclass. */
  acRuntimeInstance: any;
  arrayPropertyChangeListeners: Record<string, Record<string, (args: any) => void>> = {};
  changeSubscribers: any[] = [];
  elementHtml!: string;
  instanceInputs: any[] = [];
  instanceOutputs: any[] = [];
  instanceViewChildren: any = {};
  propertyToListenForChanges: string[] = [];
  templateOutlets: any = {};
  templates: Record<string, { targetId: any; bindingId: string, html: string, ownerInstance: any }> = {};

  pathSubscriptions: Record<string, Set<() => void>> = {};
  private pendingUpdates = new Set<() => void>();
  private isBatchScheduled = false;

  viewChildren:any = {};
  protected elementRenderer!: AcElementRenderer;
  private isInitialized: boolean = false;
  changeMethodCallbacks: Record<string, any[]> = {};
  propertyListeners: any = {};
  elementId: string = '';

  subscribePath(path: string, callback: () => void): () => void {
    if (!this.pathSubscriptions[path]) {
      this.pathSubscriptions[path] = new Set();
    }
    this.pathSubscriptions[path].add(callback);
    return () => {
      if (this.pathSubscriptions[path]) {
        this.pathSubscriptions[path].delete(callback);
        if (this.pathSubscriptions[path].size === 0) {
          delete this.pathSubscriptions[path];
        }
      }
    };
  }

  scheduleUpdate(callback: () => void) {
    this.pendingUpdates.add(callback);
    if (!this.isBatchScheduled) {
      this.isBatchScheduled = true;
      queueMicrotask(() => {
        this.isBatchScheduled = false;
        const updates = Array.from(this.pendingUpdates);
        this.pendingUpdates.clear();
        for (const update of updates) {
          update();
        }
      });
    }
  }

  connectedCallback(): void {
    if (!this.isInitialized) {
      this.elementId = this.getAttribute('ac-ref') || this.id || this.tagName;
      this.isInitialized = true;
      this.init();
    }
  }

  disconnectedCallback(): void {
    if ((this.acRuntimeInstance as any).acOnDestroy) {
      (this.acRuntimeInstance as any).acOnDestroy();
    }
    if (this.elementRenderer) {
      this.elementRenderer.destroy();
    }
    (this.elementRenderer as any) = null;
  }

  generateHexId(): string {
    const bytes = new Uint8Array(4);

    crypto.getRandomValues(bytes);

    return Array.from(bytes, b =>
      b.toString(16).padStart(2, '0')
    ).join('');
  }

  init() {
    this.setInputValuesFromAttributes();
    for (const key of this.instanceInputs) {
          if ((this as any)[key] != undefined) {
            this.acRuntimeInstance[key] = (this as any)[key];
          }
        }
    for (const eventName of this.instanceOutputs as string[]) {
      (this.acRuntimeInstance as any)[eventName].subscribe((args: any) => {
        const event = new AcRuntimeElementEvent(eventName.toLowerCase(), args, { bubbles: true, cancelable: true, composed: true }) as any;
        this.dispatchEvent(event);
      });
    }
    this.setAttribute('ac-runtime-element', '');
    this.render().then(() => {
      if ((this.acRuntimeInstance as any).acOnInit) {
        (this.acRuntimeInstance as any).acOnInit();
      }
    });
  }

  protected async render(): Promise<void> {
    await this.elementRenderer.render();
  }

  protected async handleArrayPropertyChange({
    key,
    type,
    rootKey,
    target,
    path,
    oldValue,
    newValue,
    index,
    fullPath
  }: {
    key: string;
    rootKey?: string;
    target?: any,
    path: string,
    type: string,
    oldValue: any;
    newValue: any;
    index?: number;
    fullPath?: string;
  }): Promise<void> {
    if (this.elementRenderer) {
      const property = path;
      if (this.arrayPropertyChangeListeners[property]) {
        for (const callKey of Object.keys(this.arrayPropertyChangeListeners[property])) {
          this.arrayPropertyChangeListeners[property][callKey]({ key, oldValue, newValue, type, target, path, index, fullPath });
        }
      }

      for (const subPath of Object.keys(this.pathSubscriptions)) {
        if (property === subPath || property.startsWith(subPath + '.') || subPath.startsWith(property + '.')) {
          const cbs = this.pathSubscriptions[subPath];
          if (cbs) {
            for (const cb of cbs) {
              this.scheduleUpdate(cb);
            }
          }
        }
      }
    }
  }

  protected async handlePropertyChange({
    key,
    type,
    rootKey,
    target,
    path,
    oldValue,
    newValue,
  }: {
    key: string;
    rootKey?: string;
    target?: any,
    path: string,
    type: string,
    oldValue: any;
    newValue: any;
  }): Promise<void> {
    if (this.elementRenderer) {
      const property = path;

      for (const listenerProp of Object.keys(this.propertyListeners)) {
        if (property === listenerProp || property.startsWith(listenerProp + '.')) {
          for (const targetId of Object.keys(this.propertyListeners[listenerProp])) {
            this.elementRenderer.executeChangeListener({ targetId: targetId, bindingIds: this.propertyListeners[listenerProp][targetId] });
          }
        }
      }

      for (const subPath of Object.keys(this.pathSubscriptions)) {
        if (property === subPath || property.startsWith(subPath + '.') || subPath.startsWith(property + '.')) {
          const cbs = this.pathSubscriptions[subPath];
          if (cbs) {
            for (const cb of cbs) {
              this.scheduleUpdate(cb);
            }
          }
        }
      }

      if (this.acRuntimeInstance.acOnChange) {
          this.acRuntimeInstance.acOnChange({ key: property, oldValue, newValue });
        }
      if (this.isInitialized && this.changeMethodCallbacks[property]) {
        for (const callback of this.changeMethodCallbacks[property]) {
          callback({ key: path || key, oldValue, newValue });
        }
      }
    }
  }

  makeReactive(instance: any) {
    const object = this;
    const proxyMap = new WeakMap<object, Map<string, any>>();
    const IS_REACTIVE = '__is_reactive__';
    let proxySetActive = false;
    let arrayMutating = false;

    function isPlainObject(obj: any): boolean {
      if (obj === null || typeof obj !== 'object') return false;
      return Object.getPrototypeOf(obj) === Object.prototype;
    }

    function isPathReactive(path: string[]): boolean {
      if (path.length === 0) return true;

      const isNumeric = (seg: string) => /^\d+$/.test(seg);
      const firstNumericIdx = path.findIndex(isNumeric);

      if (firstNumericIdx !== -1) {
        const arrayPath = path.slice(0, firstNumericIdx);
        return isPathReactive(arrayPath);
      }

      const pathStr = path.join('.');
      return object.propertyToListenForChanges.some(prop =>
        prop === pathStr || prop.startsWith(pathStr + '.') || pathStr.startsWith(prop + '.')
      );
    }

    function wrap<U extends object>(target: U, path: string[] = [], rootKey?: string): U {
      let rawTarget: any = target;
      if (target && (target as any)[IS_REACTIVE] && (target as any).__rawTarget__) {
        rawTarget = (target as any).__rawTarget__;
      }
      if (rawTarget && !isPlainObject(rawTarget) && !Array.isArray(rawTarget) && rawTarget != instance) {
        return target;
      }
      const pathKey = path.join('.');
      let targetCache = proxyMap.get(rawTarget);
      if (!targetCache) {
        targetCache = new Map<string, any>();
        proxyMap.set(rawTarget, targetCache);
      }
      if (targetCache.has(pathKey)) return targetCache.get(pathKey);

      const handler: ProxyHandler<U> = {
        get(obj: U, prop: string | symbol, receiver: any) {
          if (prop === IS_REACTIVE) return true;
          // Transparently unwrap if the raw object is requested
          if (prop === '__rawTarget__') return obj;

          // Intercept array mutating methods to fire semantic change notifications
          if (Array.isArray(obj) && typeof prop === 'string') {
            const arrayPath = path.join('.');
            const arrayRootKey = rootKey ?? path[0];

            switch (prop) {
              case 'push': return (...items: any[]) => {
                const startIndex = obj.length;
                const wrappedItems = items.map((item, i) => {
                  if (item && typeof item === 'object' && (isPlainObject(item) || Array.isArray(item))) {
                    const itemPath = [...path, String(startIndex + i)];
                    if (isPathReactive(itemPath)) {
                      return wrap(item, itemPath, arrayRootKey);
                    }
                  }
                  return item;
                });
                arrayMutating = true;
                const result = Array.prototype.push.apply(obj, wrappedItems);
                arrayMutating = false;
                object.handleArrayPropertyChange({
                  type: 'arrayInsert',
                  key: prop,
                  path: arrayPath,
                  oldValue: undefined,
                  newValue: { index: startIndex, items: wrappedItems }
                });
                object.handlePropertyChange({
                  key: 'length',
                  path: `${arrayPath}.length`,
                  type: 'set',
                  oldValue: undefined,
                  newValue: undefined
                });
                return result;
              };

              case 'pop': return () => {
                if (obj.length === 0) return undefined;
                const removedIndex = obj.length - 1;
                const removed = obj[removedIndex];
                arrayMutating = true;
                Array.prototype.pop.call(obj);
                arrayMutating = false;
                object.handleArrayPropertyChange({
                  type: 'arrayDelete',
                  key: prop,
                  path: arrayPath,
                  oldValue: { index: removedIndex, items: [removed] },
                  newValue: undefined
                });
                object.handlePropertyChange({
                  key: 'length',
                  path: `${arrayPath}.length`,
                  type: 'set',
                  oldValue: undefined,
                  newValue: undefined
                });
                return removed;
              };

              case 'unshift': return (...items: any[]) => {
                const wrappedItems = items.map((item, i) => {
                  if (item && typeof item === 'object' && (isPlainObject(item) || Array.isArray(item))) {
                    const itemPath = [...path, String(i)];
                    if (isPathReactive(itemPath)) {
                      return wrap(item, itemPath, arrayRootKey);
                    }
                  }
                  return item;
                });
                arrayMutating = true;
                const result = Array.prototype.unshift.apply(obj, wrappedItems);
                arrayMutating = false;
                object.handleArrayPropertyChange({
                  type: 'arrayInsert',
                  key: prop,
                  path: arrayPath,
                  oldValue: undefined,
                  newValue: { index: 0, items: wrappedItems }
                });
                object.handlePropertyChange({
                  key: 'length',
                  path: `${arrayPath}.length`,
                  type: 'set',
                  oldValue: undefined,
                  newValue: undefined
                });
                return result;
              };

              case 'shift': return () => {
                if (obj.length === 0) return undefined;
                const removed = obj[0];
                arrayMutating = true;
                Array.prototype.shift.call(obj);
                arrayMutating = false;
                object.handleArrayPropertyChange({
                  type: 'arrayDelete',
                  key: prop,
                  path: arrayPath,
                  oldValue: { index: 0, items: [removed] },
                  newValue: undefined
                });
                object.handlePropertyChange({
                  key: 'length',
                  path: `${arrayPath}.length`,
                  type: 'set',
                  oldValue: undefined,
                  newValue: undefined
                });
                return removed;
              };

              case 'splice': return (start: number, deleteCount?: number, ...items: any[]) => {
                const len = obj.length;
                const actualStart = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
                const actualDeleteCount = deleteCount === undefined ? len - actualStart : Math.max(0, Math.min(deleteCount, len - actualStart));
                const wrappedItems = items.map((item, i) => {
                  if (item && typeof item === 'object' && (isPlainObject(item) || Array.isArray(item))) {
                    const itemPath = [...path, String(actualStart + i)];
                    if (isPathReactive(itemPath)) {
                      return wrap(item, itemPath, arrayRootKey);
                    }
                  }
                  return item;
                });
                arrayMutating = true;
                const removed = Array.prototype.splice.apply(obj, [actualStart, actualDeleteCount, ...wrappedItems] as any);
                arrayMutating = false;
                object.handleArrayPropertyChange({
                  type: 'arraySplice',
                  key: prop,
                  path: arrayPath,
                  oldValue: { index: actualStart, items: removed },
                  newValue: { index: actualStart, items: wrappedItems }
                });
                object.handlePropertyChange({
                  key: 'length',
                  path: `${arrayPath}.length`,
                  type: 'set',
                  oldValue: undefined,
                  newValue: undefined
                });
                return removed;
              };

              case 'sort': return (compareFn?: (a: any, b: any) => number) => {
                const snapshot = [...obj];
                arrayMutating = true;
                Array.prototype.sort.call(obj, compareFn);
                arrayMutating = false;
                object.handleArrayPropertyChange({
                  type: 'arraySort',
                  key: prop,
                  path: arrayPath,
                  oldValue: snapshot,
                  newValue: [...obj]
                });
                return receiver;
              };

              case 'reverse': return () => {
                const snapshot = [...obj];
                arrayMutating = true;
                Array.prototype.reverse.call(obj);
                arrayMutating = false;
                object.handleArrayPropertyChange({
                  type: 'arrayReverse',
                  key: prop,
                  path: arrayPath,
                  oldValue: snapshot,
                  newValue: [...obj]
                });
                return receiver;
              };

              case 'fill': return (value: any, start?: number, end?: number) => {
                const snapshot = [...obj];
                let fillValue = value;
                if (fillValue && typeof fillValue === 'object' && (isPlainObject(fillValue) || Array.isArray(fillValue))) {
                  if (isPathReactive(path)) {
                    fillValue = wrap(fillValue, path, arrayRootKey);
                  }
                }
                arrayMutating = true;
                Array.prototype.fill.call(obj, fillValue, start, end);
                arrayMutating = false;
                object.handleArrayPropertyChange({
                  type: 'arrayFill',
                  key: prop,
                  path: arrayPath,
                  oldValue: snapshot,
                  newValue: [...obj]
                });
                object.handlePropertyChange({
                  key: 'length',
                  path: `${arrayPath}.length`,
                  type: 'set',
                  oldValue: undefined,
                  newValue: undefined
                });
                return receiver;
              };

              case 'copyWithin': return (target: number, start?: number, end?: number) => {
                const snapshot = [...obj];
                arrayMutating = true;
                Array.prototype.copyWithin.call(obj, target, start ?? 0, end);
                arrayMutating = false;
                object.handleArrayPropertyChange({
                  type: 'arrayCopyWithin',
                  key: prop,
                  path: arrayPath,
                  oldValue: snapshot,
                  newValue: [...obj]
                });
                object.handlePropertyChange({
                  key: 'length',
                  path: `${arrayPath}.length`,
                  type: 'set',
                  oldValue: undefined,
                  newValue: undefined
                });
                return receiver;
              };
            }
          }

          let value;
          let prototype = obj;
          let getter: (() => any) | undefined = undefined;
          while (prototype) {
            const desc = Object.getOwnPropertyDescriptor(prototype, prop);
            if (desc) {
              getter = desc.get;
              break;
            }
            prototype = Object.getPrototypeOf(prototype);
          }
          if (getter) {
            value = getter.call(receiver);
          } else {
            value = Reflect.get(obj, prop, receiver);
          }

          if (typeof value === 'function') {
            const bound = value.bind(receiver);
            // Copy static properties of the original function/class to the bound function
            // so that static properties (like enum/class values) are not lost when bound.
            for (const key of Reflect.ownKeys(value)) {
              if (key !== 'length' && key !== 'name' && key !== 'prototype' && key !== 'arguments' && key !== 'caller') {
                try {
                  Object.defineProperty(bound, key, Object.getOwnPropertyDescriptor(value, key)!);
                } catch (e) {
                  // Ignore if property is read-only or couldn't be defined
                }
              }
            }
            return bound;
          }

          if (typeof value === 'object' && value !== null && (isPlainObject(value) || Array.isArray(value))) {
            const nextPath = [...path, String(prop)];
            if (isPathReactive(nextPath)) {
              return wrap(value, nextPath);
            }
          }

          return value;
        },

        set(obj: U, prop: string | symbol, value: any, receiver: any) {
          const key = String(prop);
          const oldValue = (obj as any)[key];

          if (oldValue == value) {
            return true;
          }

          const isArrayLength = Array.isArray(obj) && key === 'length';
          if (isArrayLength && key !== 'length') {
            return Reflect.set(obj, prop, value);
          }
          // Unwrap value if a proxy is being assigned to prevent deep nested circular proxying.
          // However, do not unwrap if it's not a plain object or array (e.g. custom element acRuntimeInstance proxy).
          let cleanValue = value != undefined && value != null && value.__rawTarget__
            ? (isPlainObject(value.__rawTarget__) || Array.isArray(value.__rawTarget__) ? value.__rawTarget__ : value)
            : value;

          const nextPath = [...path, key];
          if (cleanValue && typeof cleanValue === 'object' && (isPlainObject(cleanValue) || Array.isArray(cleanValue))) {
            if (isPathReactive(nextPath)) {
              cleanValue = wrap(cleanValue, nextPath, rootKey ?? key);
            }
          }

          let prototype = obj;
          let setter: ((v: any) => void) | undefined = undefined;
          while (prototype) {
            const desc = Object.getOwnPropertyDescriptor(prototype, prop);
            if (desc) {
              setter = desc.set;
              break;
            }
            prototype = Object.getPrototypeOf(prototype);
          }

          let success = false;
          proxySetActive = true;
          try {
            if (setter) {
              setter.call(receiver, cleanValue);
              success = true;
            } else {
              success = Reflect.set(obj, prop, cleanValue);
            }
          } finally {
            proxySetActive = false;
          }

          if (success && !isArrayLength && !arrayMutating) {
            if (oldValue != value) {
              const isArrayIndex = Array.isArray(obj) && /^\d+$/.test(key);
              if (isArrayIndex) {
                const index = Number(key);
                object.handleArrayPropertyChange({
                  type: oldValue === undefined && index >= (obj as any).length - 1 ? 'arrayInsert' : 'arrayUpdate',
                  key: key,
                  path: path.join('.'),
                  oldValue: { index, items: [oldValue] },
                  newValue: { index, items: [cleanValue] }
                });
              } else {
                const isArrayItemChange = path.some(seg => /^\d+$/.test(seg));
                if (isArrayItemChange) {
                  const numericIdx = path.findIndex(seg => /^\d+$/.test(seg));
                  const index = Number(path[numericIdx]);
                  object.handleArrayPropertyChange({
                    type: 'arrayUpdate',
                    key: key,
                    path: path.slice(0, numericIdx).join('.'),
                    oldValue,
                    newValue: cleanValue,
                    index: index,
                    fullPath: [...path, key].join('.')
                  });
                } else {
                  const targetPath = [...path, key].join('.');
                  if (object.arrayPropertyChangeListeners[targetPath]) {
                    object.handleArrayPropertyChange({
                      type: 'arrayReplace',
                      key: key,
                      path: targetPath,
                      oldValue,
                      newValue: Array.isArray(cleanValue) ? cleanValue : []
                    });
                  }
                  object.handlePropertyChange({
                    type: 'set',
                    key: key,
                    path: targetPath,
                    oldValue,
                    newValue: cleanValue
                  });
                }
              }
            }
          }

          return success;
        },

        deleteProperty(obj, prop) {
          const key = String(prop);
          const oldValue = (obj as any)[key];
          const result = Reflect.deleteProperty(obj, prop);

          if (result && !arrayMutating) {
            const isArrayIndex = Array.isArray(obj) && /^\d+$/.test(key);
            if (isArrayIndex) {
              const index = Number(key);
              object.handleArrayPropertyChange({
                type: 'arrayDelete',
                key: key,
                path: path.join('.'),
                oldValue: { index, items: [oldValue] },
                newValue: undefined
              });
            } else {
              const isArrayItemChange = path.some(seg => /^\d+$/.test(seg));
              if (isArrayItemChange) {
                const numericIdx = path.findIndex(seg => /^\d+$/.test(seg));
                const index = Number(path[numericIdx]);
                object.handleArrayPropertyChange({
                  type: 'arrayUpdate',
                  key: key,
                  path: path.slice(0, numericIdx).join('.'),
                  oldValue,
                  newValue: undefined,
                  index: index,
                  fullPath: [...path, key].join('.')
                });
              } else {
                object.handlePropertyChange({
                  type: 'delete',
                  target: obj,
                  key: key,
                  path: [...path, key].join('.'),
                  oldValue,
                  newValue: undefined
                });
              }
            }
          }

          return result;
        },

        defineProperty(obj, prop, descriptor) {
          const key = String(prop);
          const oldValue = (obj as any)[key];
          let value = descriptor.value;
          const nextPath = [...path, key];
          if (value && typeof value === 'object' && (isPlainObject(value) || Array.isArray(value))) {
            if (isPathReactive(nextPath)) {
              value = wrap(value, nextPath, rootKey ?? key);
              descriptor = { ...descriptor, value };
            }
          }
          const result = Reflect.defineProperty(obj, prop, descriptor);
          if (result) {
            const isArrayItemChange = path.some(seg => /^\d+$/.test(seg));
            if (isArrayItemChange) {
              const numericIdx = path.findIndex(seg => /^\d+$/.test(seg));
              const index = Number(path[numericIdx]);
              object.handleArrayPropertyChange({
                type: 'arrayUpdate',
                key,
                path: path.slice(0, numericIdx).join('.'),
                oldValue,
                newValue: descriptor.value,
                index: index,
                fullPath: [...path, key].join('.')
              });
            } else {
              object.handlePropertyChange({
                type: 'define',
                target: obj,
                key,
                path: [...path, key].join('.'),
                oldValue,
                newValue: descriptor.value
              });
            }
          }

          return result;
        }
      };

      const proxy = new Proxy(rawTarget, handler);
      targetCache.set(pathKey, proxy);

      return proxy;
    }

    const proxyInstance = wrap(instance);

    // Install reactive getter/setter pairs on the raw instance for all own data
    // properties that hold plain objects or arrays. Arrow function property
    // initializers capture the raw `this` (not the proxy), so any method called
    // from such callbacks accesses the raw instance directly, bypassing the
    // proxy's get/set traps. These getter/setter pairs ensure that even direct
    // access on the raw instance auto-wraps values and fires change notifications.
    for (const key of Reflect.ownKeys(instance)) {
      if (typeof key !== 'string') continue;
      if (!isPathReactive([key])) continue;
      const desc = Object.getOwnPropertyDescriptor(instance, key);
      // Skip existing accessors (e.g. `get record()` / `set record()`)
      if (!desc || desc.get || desc.set) continue;
      const val = desc.value;
      if (val && typeof val === 'object' && (isPlainObject(val) || Array.isArray(val))) {
        let storedValue = val; // already wrapped from the loop above
        Object.defineProperty(instance, key, {
          configurable: true,
          enumerable: desc.enumerable,
          get() {
            // If the stored value is a raw plain object/array, wrap it
            if (storedValue && typeof storedValue === 'object'
              && (isPlainObject(storedValue) || Array.isArray(storedValue))
              && !(storedValue as any)[IS_REACTIVE]) {
              if (isPathReactive([key])) {
                storedValue = wrap(storedValue, [key], key);
              }
            }
            return storedValue;
          },
          set(newVal: any) {
            const oldValue = storedValue;
            // Unwrap if proxy
            let cleanVal = newVal != undefined && newVal != null && newVal.__rawTarget__
              ? (isPlainObject(newVal.__rawTarget__) || Array.isArray(newVal.__rawTarget__) ? newVal.__rawTarget__ : newVal)
              : newVal;
            // Wrap plain objects/arrays
            if (cleanVal && typeof cleanVal === 'object' && (isPlainObject(cleanVal) || Array.isArray(cleanVal))) {
              if (isPathReactive([key])) {
                cleanVal = wrap(cleanVal, [key], key);
              }
            }
            if (oldValue == cleanVal) return;
            storedValue = cleanVal;
            // Only fire change notification if not already being handled by the
            // proxy set trap (which fires its own notification). This prevents
            // double notifications when the proxy calls this setter.
            if (!proxySetActive) {
              if (object.arrayPropertyChangeListeners[key]) {
                object.handleArrayPropertyChange({
                  type: 'arrayReplace',
                  key: key,
                  path: key,
                  oldValue,
                  newValue: Array.isArray(cleanVal) ? cleanVal : []
                });
              }
              object.handlePropertyChange({
                type: 'set',
                key: key,
                path: key,
                oldValue,
                newValue: cleanVal
              });
            }
          }
        });
      }
    }

    return proxyInstance;
  }

  notifyElementInit() {
    if (!this.hasAttribute('ac-el-has-inputs')) {
      if ((this.acRuntimeInstance as any).acOnInit) {
        (this.acRuntimeInstance as any).acOnInit();
      }
    }
  }

  registerChangeSubscriptionMethodCallback({ callback, keys }: { callback: any, keys: string[] }) {
    for (const key of keys) {
      if (this.changeMethodCallbacks[key] == undefined) {
        this.changeMethodCallbacks[key] = [];
      }
      this.changeMethodCallbacks[key].push(callback);
    }
  }

  private setInputValuesFromAttributes() {
    Array.from(this.attributes).forEach((attr: Attr) => {
      const matchingInput = this.instanceInputs.find(
        (inputName) => inputName.toLowerCase() === attr.name.toLowerCase()
      );
      if (matchingInput) {
        this.acRuntimeInstance[matchingInput] = attr.value;
      }
    });
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    if (this.acRuntimeInstance && this.instanceInputs) {
      const matchingInput = this.instanceInputs.find(
        (inputName) => inputName.toLowerCase() === name.toLowerCase()
      );
      if (matchingInput) {
        this.acRuntimeInstance[matchingInput] = newValue;
      }
    }
  }

  subscribeArrayPropertyChangeListeners({ bindingId, property, callback }: { bindingId: string, property: string, callback: (args: any) => void }): void {
    if (this.arrayPropertyChangeListeners[property] == undefined) {
      this.arrayPropertyChangeListeners[property] = {};
    }
    this.arrayPropertyChangeListeners[property][bindingId] = callback;
  }

  unsubscribeArrayPropertyChangeListeners({ property, bindingId }: { property: string, bindingId: string }): void {
    if (this.arrayPropertyChangeListeners[property] != undefined) {
      delete this.arrayPropertyChangeListeners[property][bindingId];
    }
  }
}

export class AcRuntimeElementEvent extends Event {
  // Allow any dynamic property to be read directly from the instance
  args: any;

  constructor(type: string, args: any, options?: EventInit) {
    super(type, options);
    this.args = args;
  }
}
