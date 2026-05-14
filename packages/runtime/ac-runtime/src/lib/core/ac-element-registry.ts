export interface IAcElementDef {
  selector: string;
  constructor: any;
  metadata: any;
}

class AcElementRegistry {
  private elements = new Map<string, IAcElementDef>();
  private instances = new Map<string, any>();

  register(selector: string, constructor: any, metadata: any) {
    // Split by comma for multiple selectors
    const selectors = selector.split(',').map(s => s.trim());

    selectors.forEach(sel => {
      const normalizedSelector = this.normalizeSelector(sel);

      this.elements.set(normalizedSelector, {
        selector: normalizedSelector,
        constructor,
        metadata
      });
    });
  }

  get(selector: string): IAcElementDef | undefined {
    const normalizedSelector = this.normalizeSelector(selector);
    return this.elements.get(normalizedSelector);
  }

  getInstance({ uuid }: { uuid: string }): any {
    if (this.instances.has(uuid)) {
      return this.instances.get(uuid);
    }
  }

  getByTagName(tagName: string): IAcElementDef | undefined {
    return this.elements.get(tagName.toLowerCase());
  }

  getByAttribute(attrName: string): IAcElementDef | undefined {
    return this.elements.get(attrName.toLowerCase());
  }

  getByElement(el: HTMLElement): IAcElementDef | undefined {
    const tagName = el.tagName.toLowerCase();
    let registration = this.getByTagName(tagName);

    if (!registration) {
      for (const attr of Array.from(el.attributes)) {
        const attrRegistration = this.getByAttribute(attr.name);
        if (attrRegistration) {
          registration = attrRegistration;
          break;
        }
      }
    }
    return registration;
  }

  getByType(type: any): IAcElementDef | undefined {
    for(const elType of this.elements.values()){
      if(type.name == elType.constructor.name){
        return elType;
      }
    }
    return undefined;
  }

  private normalizeSelector(selector: string): string {
    const trimmed = selector.trim();
    if (trimmed.startsWith('#')) {
      return trimmed; // Keep ID selectors with #
    }
    // Remove brackets for attribute selectors: [app-child] -> app-child
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      return trimmed.slice(1, -1).toLowerCase();
    }
    return trimmed.toLowerCase();
  }

  getAllElements(): IAcElementDef[] {
    return Array.from(this.elements.values());
  }

  registerInstance({ instance, uuid }: { instance: any, uuid: string }) {
    this.instances.set(uuid, instance);
  }

  removeInstance({ uuid }: { uuid: string }) {
    this.instances.delete(uuid);
  }
}

// Global singleton instance
export const acElementRegistry = new AcElementRegistry();
