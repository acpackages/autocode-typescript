/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcElementRenderer } from './ac-element-renderer';
export class AcRuntimeElement extends HTMLElement {
  /** The inner component class instance created by the generated subclass. */
  acRuntimeInstance: any;
  arrayPropertyChangeListeners: Record<string, Record<string, (args: any) => void>> = {};
  changeSubscribers: any[] = [];
  elementComponent: any;
  elementHtml!: string;
  instanceInputs: any[] = [];
  instanceOutputs: any[] = [];
  instanceViewChildren: any = {};
  propertyToListenForChanges: string[] = [];
  templateOutlets: any = {};
  templates: Record<string, { targetId: any; bindingId: string, html: string, ownerInstance: any }> = {};

  protected renderer!: AcElementRenderer;
  private isInitialized: boolean = false;
  changeListeners: Record<string, Record<string, { callback: any; binding: { expression: string; type: string }; }>> = {};
  eventCallbacks: Record<string, Record<string, { callback: any; binding: { expression: string; type: string }; }>> = {};
  changeMethodCallbacks: Record<string, any[]> = {};
  propertyListeners: any = {};
  excludeLogProperty: any[] = ['time', 'animation', 'speed', 'showLoader', 'lottieJson', 'isHostSet', 'appCheckStatus', 'container', 'adContainer'];
  includeLogProperty: any[] = [];
  elementId: string = '';

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
    if ((this.acRuntimeInstance as any).__destroy) {
      (this.acRuntimeInstance as any).__destroy();
    }
    if (this.renderer) {
      this.renderer.clearElement({ element: this });
    }
    (this.renderer as any) = null;
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
    for (const eventName of this.instanceOutputs as string[]) {
      (this.acRuntimeInstance as any)[eventName].subscribe((args: any) => {
        const event = new AcRuntimeElementEvent(eventName.toLowerCase(), args, { bubbles: true, cancelable: true, composed: true }) as any;
        this.dispatchEvent(event);
      });
    }
    this.renderer = new AcElementRenderer({ isRoot: true, rootElement: this, html: this.elementHtml, context: {} });
    this.setAttribute('ac-runtime-element', '');
    this.render().then(() => {
      this.notifyElementInit();
    });
    console.dir(this);
  }

  protected async render(): Promise<void> {
    await this.renderer.render();
  }

  protected async handleArrayPropertyChange({
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
    if (!this.excludeLogProperty.includes(key) && !this.excludeLogProperty.includes(rootKey)) {
      console.log(`[AcRuntimeElement <${this.elementId}>] handleArrayPropertyChange: key=${key}, path=${path}, type=${type}`,newValue,oldValue);
    }
    if (this.renderer) {
      const property = path;
      for (const callKey of Object.keys(this.arrayPropertyChangeListeners[property])) {
        this.arrayPropertyChangeListeners[property][callKey]({ key, oldValue, newValue, type,target,path });
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
    if (!this.excludeLogProperty.includes(key) && !this.excludeLogProperty.includes(rootKey)) {
      console.log(`[AcRuntimeElement <${this.elementId}>] handlePropertyChange: key=${key}, path=${path}, type=${type}`,newValue,oldValue);
    }
    if (this.renderer) {
      const property = path;
      if (this.includeLogProperty.includes(key) || this.includeLogProperty.includes(rootKey)) {
        console.log(`[AcRuntimeElement <${this.elementId}>] Property Change >>> Key : ${key}, Path : ${path}, Type : ${type}`, newValue, oldValue);
      }

      if (this.propertyListeners[property]) {
          for (const targetId of Object.keys(this.propertyListeners[property])) {
            await this.renderer.executeChangeListener({ targetId: targetId, bindingIds: this.propertyListeners[property][targetId] });
          }
        }

        if (this.isInitialized) {
          if (this.acRuntimeInstance.acOnChange) {
            this.acRuntimeInstance.acOnChange({ key: property, oldValue, newValue });
          }
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
                    return wrap(item, [...path, String(startIndex + i)], arrayRootKey);
                  }
                  return item;
                });
                arrayMutating = true;
                const result = Array.prototype.push.apply(obj, wrappedItems);
                arrayMutating = false;
                console.log("[AcRuntimeElement] Array Item Push",startIndex,wrappedItems);
                object.handleArrayPropertyChange({
                  type: 'arrayInsert',
                  key: prop,
                  path: arrayPath,
                  oldValue: undefined,
                  newValue: { index: startIndex, items: wrappedItems }
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
                return removed;
              };

              case 'unshift': return (...items: any[]) => {
                const wrappedItems = items.map((item, i) => {
                  if (item && typeof item === 'object' && (isPlainObject(item) || Array.isArray(item))) {
                    return wrap(item, [...path, String(i)], arrayRootKey);
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
                return removed;
              };

              case 'splice': return (start: number, deleteCount?: number, ...items: any[]) => {
                const len = obj.length;
                const actualStart = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
                const actualDeleteCount = deleteCount === undefined ? len - actualStart : Math.max(0, Math.min(deleteCount, len - actualStart));
                const wrappedItems = items.map((item, i) => {
                  if (item && typeof item === 'object' && (isPlainObject(item) || Array.isArray(item))) {
                    return wrap(item, [...path, String(actualStart + i)], arrayRootKey);
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
                  fillValue = wrap(fillValue, path, arrayRootKey);
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
            return wrap(value, [...path, String(prop)]);
          }

          return value;
        },

        set(obj: U, prop: string | symbol, value: any, receiver: any) {
          const key = String(prop);
          const oldValue = (obj as any)[key];

          if (object.includeLogProperty.includes(key) || object.includeLogProperty.includes(rootKey)) {
            console.log("[AcRuntimeElement] Set Proxy Value : ", key, oldValue, value);
          }

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

          if (cleanValue && typeof cleanValue === 'object' && (isPlainObject(cleanValue) || Array.isArray(cleanValue))) {
            cleanValue = wrap(cleanValue, [...path, key], rootKey ?? key);
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
              // Detect direct array index assignment (e.g. arr[3] = value)
              const isArrayIndex = Array.isArray(obj) && /^\d+$/.test(key);
              if (isArrayIndex) {
                const index = Number(key);
                object.handlePropertyChange({
                  type: oldValue === undefined && index >= (obj as any).length - 1 ? 'array-insert' : 'array-update',
                  key: key,
                  path: path.join('.'),
                  oldValue: { index, items: [oldValue] },
                  newValue: { index, items: [cleanValue] }
                });
              } else {
                object.handlePropertyChange({
                  type: 'set',
                  key: key,
                  path: [...path, key].join('.'),
                  oldValue,
                  newValue: cleanValue
                });
              }
            }

          }

          return success;
        },

        deleteProperty(obj, prop) {

          const key = String(prop);

          const oldValue =
            (obj as any)[key];

          const result =
            Reflect.deleteProperty(
              obj,
              prop
            );

          if (result && !arrayMutating) {
            object.handlePropertyChange({
              type: 'delete',
              target: obj,
              key: key,
              path: [...path, key].join('.'),
              oldValue,
              newValue: undefined
            });
          }

          return result;
        },

        defineProperty(
          obj,
          prop,
          descriptor
        ) {

          const key = String(prop);
          const oldValue = (obj as any)[key];
          let value = descriptor.value;
          if (value && typeof value === 'object' && (isPlainObject(value) || Array.isArray(value))) {
            value = wrap(value, [...path, key], rootKey ?? key);
            descriptor = { ...descriptor, value };
          }
          const result =
            Reflect.defineProperty(
              obj,
              prop,
              descriptor
            );
          if (result) {
            object.handlePropertyChange({
              type: 'define',
              target: obj,
              key,
              path: [...path, key].join('.'),
              oldValue,
              newValue: descriptor.value
            });
          }

          return result;
        }
      };

      const proxy = new Proxy(rawTarget, handler);
      targetCache.set(pathKey, proxy);

      return proxy;
    }

    // Force make all properties reactive when instance is created
    for (const key of Reflect.ownKeys(instance)) {
      if (typeof key === 'string') {
        const val = instance[key];
        if (val && typeof val === 'object' && (isPlainObject(val) || Array.isArray(val))) {
          instance[key] = wrap(val, [key], key);
        }
      }
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
              storedValue = wrap(storedValue, [key], key);
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
              cleanVal = wrap(cleanVal, [key], key);
            }
            if (oldValue == cleanVal) return;
            storedValue = cleanVal;
            // Only fire change notification if not already being handled by the
            // proxy set trap (which fires its own notification). This prevents
            // double notifications when the proxy calls this setter.
            if (!proxySetActive) {
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

  protected registerChangeListenerDefinition({ targetId, bindingId, definition }: { targetId: string, bindingId: string, definition: any }): void {
    if (this.changeListeners[targetId] == undefined) {
      this.changeListeners[targetId] = {};
    }
    this.changeListeners[targetId][bindingId] = definition;
  }

  registerChangeSubscriptionMethodCallback({ callback, keys }: { callback: any, keys: string[] }) {
    for (const key of keys) {
      if (this.changeMethodCallbacks[key] == undefined) {
        this.changeMethodCallbacks[key] = [];
      }
      this.changeMethodCallbacks[key].push(callback);
    }
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

  private setInputValuesFromAttributes() {
    Array.from(this.attributes).forEach((attr: Attr) => {
      if (this.instanceInputs.includes(attr.name)) {
        this.acRuntimeInstance[attr.name] = attr.value;
      }
    });
  }

  subscribeArrayPropertyChangeListeners({ bindingId,property, callback }: { bindingId:string,property: string, callback: (args: any) => void }): void {
    console.log(`[AcRuntimeElement <${this.elementId}>] subscribeArrayPropertyChangeListeners: property=${property}`);
    if(this.arrayPropertyChangeListeners[property] == undefined){
      this.arrayPropertyChangeListeners[property] = {};
    }
    this.arrayPropertyChangeListeners[property][bindingId] = callback;
  }

  unsubscribeArrayPropertyChangeListeners({ property,bindingId }: { property: string,bindingId:string}): void {
    console.log(`[AcRuntimeElement <${this.elementId}>] unsubscribeArrayPropertyChangeListeners: property=${property}`);
    if(this.arrayPropertyChangeListeners[property] != undefined){
      delete this.arrayPropertyChangeListeners[property][bindingId];
    }
  }



  // Temp Loop Listeners
  dynamicPropertyListeners: Record<string, Record<string, Record<string, (args: any) => void>>> = {};


  registerLoopChangeListener({ targetId, bindingId, property, callback }: { targetId: string, bindingId: string, property: string, callback: (args: any) => void }): void {
    console.log(`[AcRuntimeElement <${this.elementId}>] registerLoopChangeListener: targetId=${targetId}, bindingId=${bindingId}, property=${property}`);
    if (this.dynamicPropertyListeners[property] == undefined) {
      this.dynamicPropertyListeners[property] = {};
    }
    if (this.dynamicPropertyListeners[property][targetId] == undefined) {
      this.dynamicPropertyListeners[property][targetId] = {};
    }
    this.dynamicPropertyListeners[property][targetId][bindingId] = callback;
  }

  unregisterLoopChangeListener({ targetId, bindingId, property }: { targetId: string, bindingId: string, property: string }): void {
    console.log(`[AcRuntimeElement <${this.elementId}>] unregisterLoopChangeListener: targetId=${targetId}, bindingId=${bindingId}, property=${property}`);
    if (this.dynamicPropertyListeners[property] && this.dynamicPropertyListeners[property][targetId]) {
      delete this.dynamicPropertyListeners[property][targetId][bindingId];
      if (Object.keys(this.dynamicPropertyListeners[property][targetId]).length === 0) {
        delete this.dynamicPropertyListeners[property][targetId];
      }
      if (Object.keys(this.dynamicPropertyListeners[property]).length === 0) {
        delete this.dynamicPropertyListeners[property];
      }
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
