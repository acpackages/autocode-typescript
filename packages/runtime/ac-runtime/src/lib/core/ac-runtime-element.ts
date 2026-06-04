/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcElementRenderer } from './ac-element-renderer';
import { AcReactivity } from '@autocode-ts/ac-reactivity';
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
  private _evaluationContextProxy: any;
  get evaluationContext(): any {
    if (!this._evaluationContextProxy) {
      const self = this;
      this._evaluationContextProxy = new Proxy(this.acRuntimeInstance, {
        has(t, key) {
          return key in t || (self.viewChildren && key in self.viewChildren);
        },
        get(t, key, receiver) {
          if (key in t) {
            const val = Reflect.get(t, key, receiver);
            return typeof val === 'function' ? val.bind(t) : val;
          }
          if (self.viewChildren && key in self.viewChildren) {
            return self.viewChildren[key as string];
          }
          return undefined;
        }
      });
    }
    return this._evaluationContextProxy;
  }
  protected elementRenderer!: AcElementRenderer;
  private isInitialized: boolean = false;
  changeMethodCallbacks: Record<string, any[]> = {};
  propertyListeners: any = {};
  elementId: string = '';
  excludeLogProperty: any[] = ['time', 'animation', 'speed', 'showLoader', 'lottieJson', 'isHostSet', 'appCheckStatus', 'container', 'adContainer'];
  includeLogProperty: any[] = ['summaryData'];

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
      if (!this.excludeLogProperty.includes(key) && !this.excludeLogProperty.includes(rootKey)) {
      console.log(`[AcRuntimeElement] handlePropertyChange for ${key}`,newValue,oldValue,type,rootKey,path,target);
    }
      if (this.arrayPropertyChangeListeners[property]) {
        for (const callKey of Object.keys(this.arrayPropertyChangeListeners[property])) {
          this.arrayPropertyChangeListeners[property][callKey]({ key, oldValue, newValue, type, target, path, index, fullPath });
        }
      }

      // for (const subPath of Object.keys(this.pathSubscriptions)) {
      //   if (property === subPath || property.startsWith(subPath + '.') || subPath.startsWith(property + '.')) {
      //     const cbs = this.pathSubscriptions[subPath];
      //     if (cbs) {
      //       for (const cb of cbs) {
      //         this.scheduleUpdate(cb);
      //       }
      //     }
      //   }
      // }
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
      console.log(`[AcRuntimeElement] handlePropertyChange for ${key}`,newValue,oldValue,type,rootKey,path,target);
    }
    if (this.elementRenderer) {
      const property = path;

      const cbs = this.pathSubscriptions[property];
          if (cbs) {
            for (const cb of cbs) {
              this.scheduleUpdate(cb);
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
    const properties = this.propertyToListenForChanges;
    const result = AcReactivity.makeReactive({
      instance,
      properties,
      onChange: (change) => {
        const { property, rootProperty, oldValue, newValue, type, operation, target, context } = change;
        if(!this.excludeLogProperty.includes(property)){
          console.log(`[AcRuntimeElement] Change`,change);
        }

        if (context === "array") {
          const segments = property.split('.');
          const isArrayLength = segments[segments.length - 1] === "length" || operation === "length";
          console.log(`[AcRuntimeElement] IsArrayLength`,isArrayLength);
          if (isArrayLength) {
            object.handlePropertyChange({
              key: "length",
              path: property,
              type: "set",
              oldValue,
              newValue
            });
          } else if (operation === "set") {
            const indexSeg = segments[segments.length - 1];
            const index = Number(indexSeg);
            const arrayPath = segments.slice(0, -1).join('.');

            object.handleArrayPropertyChange({
              type: oldValue === undefined ? "arrayInsert" : "arrayUpdate",
              key: indexSeg,
              path: arrayPath,
              oldValue: { index, items: [oldValue] },
              newValue: { index, items: [newValue] }
            });
          } else if (operation === "delete") {
            const indexSeg = segments[segments.length - 1];
            const index = Number(indexSeg);
            const arrayPath = segments.slice(0, -1).join('.');

            object.handleArrayPropertyChange({
              type: "arrayDelete",
              key: indexSeg,
              path: arrayPath,
              oldValue: { index, items: [oldValue] },
              newValue: undefined
            });
          } else {
            let arrayType = "arrayUpdate";
            let mappedOldValue = oldValue;
            let mappedNewValue = newValue;

            if (operation === "push" || operation === "unshift") {
              arrayType = "arrayInsert";
              const items = operation === "push"
                ? (newValue as any[]).slice((oldValue as any[]).length)
                : (newValue as any[]).slice(0, (newValue as any[]).length - (oldValue as any[]).length);
              const index = operation === "push" ? (oldValue as any[]).length : 0;
              mappedNewValue = { index, items };
            } else if (operation === "pop" || operation === "shift") {
              arrayType = "arrayDelete";
              const items = operation === "pop"
                ? [(oldValue as any[])[(oldValue as any[]).length - 1]]
                : [(oldValue as any[])[0]];
              const index = operation === "pop" ? (oldValue as any[]).length - 1 : 0;
              mappedOldValue = { index, items };
            } else if (operation === "splice") {
              arrayType = "arraySplice";
              const oldArr = oldValue as any[];
              const newArr = newValue as any[];
              let start = 0;
              while (start < oldArr.length && start < newArr.length && oldArr[start] === newArr[start]) {
                start++;
              }
              let oldEnd = oldArr.length - 1;
              let newEnd = newArr.length - 1;
              while (oldEnd >= start && newEnd >= start && oldArr[oldEnd] === newArr[newEnd]) {
                oldEnd--;
                newEnd--;
              }
              const removed = oldArr.slice(start, oldEnd + 1);
              const added = newArr.slice(start, newEnd + 1);
              mappedOldValue = { index: start, items: removed };
              mappedNewValue = { index: start, items: added };
            } else if (operation === "sort") {
              arrayType = "arraySort";
            } else if (operation === "reverse") {
              arrayType = "arrayReverse";
            } else if (operation === "fill") {
              arrayType = "arrayFill";
            } else if (operation === "copyWithin") {
              arrayType = "arrayCopyWithin";
            }

            object.handleArrayPropertyChange({
              type: arrayType,
              key: operation,
              path: property,
              oldValue: mappedOldValue,
              newValue: mappedNewValue
            });

            if (Array.isArray(oldValue) && Array.isArray(newValue) && oldValue.length !== newValue.length) {
              object.handlePropertyChange({
                key: "length",
                path: `${property}.length`,
                type: "set",
                oldValue: oldValue.length,
                newValue: newValue.length
              });
            }
          }
        } else {
          const segments = property.split('.');
          const numericIdx = segments.findIndex(seg => /^\d+$/.test(seg));

          if (numericIdx !== -1) {
            const index = Number(segments[numericIdx]);
            const arrayPath = segments.slice(0, numericIdx).join('.');
            const key = segments[segments.length - 1];

            object.handleArrayPropertyChange({
              type: "arrayUpdate",
              key,
              path: arrayPath,
              oldValue,
              newValue,
              index,
              fullPath: property
            });
          } else {
            object.handlePropertyChange({
              key: segments[segments.length - 1],
              rootKey: rootProperty,
              target,
              path: property,
              type: operation === "delete" ? "delete" : "set",
              oldValue,
              newValue
            });
          }
        }
      }
    });
    return result;
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
