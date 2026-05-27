/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcElementRenderer } from './ac-element-renderer';
export class AcRuntimeElement extends HTMLElement {
  /** The inner component class instance created by the generated subclass. */
  acRuntimeInstance: any;
  changeSubscribers: any[] = [];
  elementComponent: any;
  elementHtml!: string;
  instanceInputs: any[] = [];
  instanceOutputs: any[] = [];
  instanceViewChildren: any = {};
  propertyToListenForChanges:string[] = [];
  templateOutlets:any = {};
  templates:Record<string, { targetId: any; bindingId: string, html:string,ownerInstance:any }> = {};

  protected renderer!: AcElementRenderer;
  private isInitialized: boolean = false;
  changeListeners: Record<string, Record<string, { callback: any; binding: { expression: string; type: string }; }>> = {};
  eventCallbacks: Record<string, Record<string, { callback: any; binding: { expression: string; type: string }; }>> = {};
  propertyListeners: any = {};

  connectedCallback(): void {
    if (!this.isInitialized) {
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
    if(this.renderer){
      this.renderer.clearElement({element:this});
    }
    (this.renderer as any) = null;
  }

  protected generateHexId(): string {
    const bytes = new Uint8Array(4);

    crypto.getRandomValues(bytes);

    return Array.from(bytes, b =>
      b.toString(16).padStart(2, '0')
    ).join('');
  }

  init() {
    this.setInputValuesFromAttributes();
    for(const eventName of this.instanceOutputs as string[]){
      (this.acRuntimeInstance as any)[eventName].subscribe((args:any)=>{
        const event = new AcRuntimeElementEvent(eventName.toLowerCase(), args,{bubbles: true,cancelable: true,composed: true}) as any;
        this.dispatchEvent(event);
      });
    }
    this.renderer = new AcElementRenderer({ isRoot: true, rootElement: this, html: this.elementHtml, context: {} });
    this.style.display = 'contents';
    this.render().then(() => {
      this.notifyElementInit();
    });

  }

  protected async render(): Promise<void> {
    await this.renderer.render();
  }

  protected async handlePropertyChange({
    key,
    type,
    target,
    path,
    oldValue,
    newValue,
  }: {
    key: string;
    target?:any,
    path:string,
    type:string,
    oldValue: any;
    newValue: any;
  }): Promise<void> {
    if(this.renderer){
      const keysToNotify = new Set<string>();
      if (key) {
        keysToNotify.add(key);
      }
      if (path) {
        const rootKey = path.split('.')[0];
        if (rootKey) {
          keysToNotify.add(rootKey);
        }
      }
      for (const k of keysToNotify) {
        if (this.propertyListeners[k]) {
          for (const targetId of Object.keys(this.propertyListeners[k])) {
            await this.renderer.executeChangeListener({ targetId: targetId, bindingIds: this.propertyListeners[k][targetId] });
          }
        }
      }
      if(this.isInitialized && this.propertyToListenForChanges.includes(key)){
        if (this.acRuntimeInstance.acOnChange) {
          this.acRuntimeInstance.acOnChange({key,oldValue,newValue});
        }
      }
    }
  }

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

          if (typeof value === 'object' && value !== null && isPlainObject(value)) {
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

          // Unwrap value if a proxy is being assigned to prevent deep nested circular proxying.
          // However, do not unwrap if it's not a plain object or array (e.g. custom element acRuntimeInstance proxy).
          const cleanValue = value && value.__rawTarget__
            ? (isPlainObject(value.__rawTarget__) || Array.isArray(value.__rawTarget__) ? value.__rawTarget__ : value)
            : value;
          const success = Reflect.set(obj, prop, cleanValue, receiver);

          if (success && !isArrayLength) {
            if (oldValue != value) {
              object.handlePropertyChange({
                type: 'set',
                key,
                path: [...path, key].join('.'),
                // path: [...path, key].join('.'),
                oldValue,
                newValue: cleanValue
              });
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

        if (result) {
          object.handlePropertyChange({
            type: 'delete',
            target: obj,
            key,
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

        const oldValue =
          (obj as any)[key];

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

      const proxy = new Proxy(target, handler);
      proxyMap.set(target, proxy);
      return proxy;
    }

    return wrap(instance);
  }

  notifyElementInit(){
    if(!this.hasAttribute('ac-el-has-inputs')){
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

  private setInputValuesFromAttributes(){
    Array.from(this.attributes).forEach((attr: Attr) => {
      if(this.instanceInputs.includes(attr.name)){
        this.acRuntimeInstance[attr.name] = attr.value;
      }
  });
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
