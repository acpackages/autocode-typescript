/* eslint-disable @typescript-eslint/no-inferrable-types */
import { acNullifyInstanceProperties, Autocode } from '@autocode-ts/autocode';
import { AC_ELEMENT_METADATA_KEY } from '../consts/symbols.const';
import { acElementRegistry, IAcElementDef } from './ac-element-registry';
import { getAcViewChildMetadata } from '../decorators/_decorators.export';
import { IAcElementMetadata } from '../interfaces/ac-element-metadata.interface';
import { clearElement } from '../utils/functions';
import { acInitRuntimeElementInstance } from './ac-runtime';
import { acMakeReactive, proxyMap, targetMap } from '../reactivity/ac-reactivity';
import { AcElementRenderer } from './ac-element-renderer';

export class AcElementManager {
  private element!: HTMLElement;
  private metadata: IAcElementMetadata;
  private elementDef: IAcElementDef;
  instance: any;
  private templateEngine!: AcElementRenderer;
  private uuid!: string;
  private parentEngine?: AcElementRenderer;
  private orgInstance: any;

  constructor({ instance, element, parentEngine,elementDef }: { instance: any, element?: HTMLElement, parentEngine?: AcElementRenderer,elementDef:IAcElementDef  }) {
    this.elementDef = elementDef;
    this.orgInstance = instance;
    this.instance = acMakeReactive(instance);
    this.parentEngine = parentEngine;
    this.instance['__ac_manager__'] = this;
    this.metadata = (this.orgInstance.constructor as any)[AC_ELEMENT_METADATA_KEY];
    if (!this.metadata) {
      throw new Error(`No metadata found for ${this.orgInstance.constructor.name}. Did you forget @AcElement decorator?`);
    }
    if (element) {
      this.element = element;
    }
  }

  private applyStyles(styles: string | string[]) {
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
      styleEl.setAttribute('ac-engine-style-for', this.uuid);
      document.head.appendChild(styleEl);
      styleEl.textContent = `[ac-engine-element="${this.uuid}"]{\n${styleContent}\n}`;
    }
  }

  public async bootstrap() {
    if (!this.element) {
      this.element = document.querySelector(this.metadata.selector) as HTMLElement;
      if (!this.element) {
        throw new Error(`Selector ${this.metadata.selector} not found for element ${this.instance.constructor.name}`);
      }
    }

    if (this.element && !this.element.hasAttribute('ac-engine-element')) {
      const uuid = Autocode.uuid();
      this.element.setAttribute('ac-engine-element', uuid);
      (this.element as any).acInstance = this; // Attach instance to element
      const customEvent: CustomEvent = new CustomEvent('acRuntimeElementIdAttached', { detail: { 'instance': this } });
      this.element.dispatchEvent(customEvent);
      this.uuid = uuid;
    }

    acElementRegistry.registerInstance({ instance: this.instance, uuid: this.uuid });
    // Initialize template engine with reactive instance
    this.templateEngine = new AcElementRenderer({ context: this.instance, parentEngine: this.parentEngine, elementManager: this });

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
    this.resolveViewChild();

    await acInitRuntimeElementInstance(this.instance);
  }

  destroy() {
    if (this.element) {
      (this.element as any).acInstance = null;
      this.element.remove();
      clearElement(this.element);
    }
    if (this.templateEngine) {
      this.templateEngine.destroy();
    }
    proxyMap.delete(this.orgInstance);
    targetMap.delete(this.orgInstance);
    proxyMap.delete(this.instance);
    targetMap.delete(this.instance);
    acElementRegistry.removeInstance({ uuid: this.uuid });
    acNullifyInstanceProperties({ instance: this });
  }

  private async loadStyleUrls(urls: string[]) {
    const promises = urls.map(async (url) => {
      const response = await fetch(url);
      return await response.text();
    });
    const styles = await Promise.all(promises);
    this.applyStyles(styles);
  }

  public resolveViewChild() {
    const viewChildMetadata = getAcViewChildMetadata(this.orgInstance.constructor);
    if (Object.keys(viewChildMetadata).length > 0) {
      const templates = this.templateEngine.templates;

      for (const [propertyKey, selector] of Object.entries(viewChildMetadata)) {
        if (this.instance[propertyKey] == undefined) {
          const templateName = selector.startsWith('#') ? selector.slice(1).toLowerCase() : selector.toLowerCase();
          let found = false;
          const refElement = this.element.querySelector(`[ac-element-ref=${templateName}]`);
          if (refElement) {
            if ((refElement as any).acInstance) {
              this.instance[propertyKey] = (refElement as any).acInstance;
            }
            else {
              this.instance[propertyKey] = refElement;
            }
          }
          for (const [name, template] of templates.entries()) {
            if (name.toLowerCase() === templateName) {
              this.instance[propertyKey] = template;
              found = true;
              break;
            }
          }
          if (found) continue;
        }

      }
    }
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
}
