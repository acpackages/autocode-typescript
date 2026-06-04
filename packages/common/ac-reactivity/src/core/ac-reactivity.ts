import { IAcMakeReactiveOptions } from "../interfaces/ac-make-reactive-options.interface";
import { AcMetadataStore, RAW_TARGET } from "./ac-metadata-store";
import { AcSignal } from "./ac-signal";
import { updateParentLink, getReactiveValueType, emitChange, canBeReactive } from "./ac-utilities";
import { AcProxyFactory } from "./ac-proxy-factory";

export class AcReactivity {
  public static makeReactive<T>(options: IAcMakeReactiveOptions<T>): T {
    const { instance, properties, onChange, batch = false } = options;

    if (!instance || (typeof instance !== "object" && typeof instance !== "function")) {
      return instance;
    }

    const rawInstance = (instance as any)[RAW_TARGET] || instance;
    const meta = AcMetadataStore.getOrCreate({ target: rawInstance });

    if (meta.root) {
      return instance;
    }

    // Resolve dependencies of properties recursively
    const allPropertiesSet = new Set<string>(properties);
    const dependenciesMap = new Map<string, Set<string>>();
    const queue = [...properties];
    const processed = new Set<string>();

    while (queue.length > 0) {
      const currentProp = queue.shift()!;
      if (processed.has(currentProp)) continue;
      processed.add(currentProp);

      const segments = currentProp.split(".");
      let targetObj = rawInstance;
      let pathSegments: string[] = [];
      let stop = false;
      for (let i = 0; i < segments.length - 1; i++) {
        if (targetObj) {
          pathSegments.push(segments[i]);
          targetObj = targetObj[segments[i]];
          if (targetObj && (Array.isArray(targetObj) || !canBeReactive(targetObj))) {
            stop = true;
            break;
          }
        }
      }

      if (stop) {
        const truncatedPath = pathSegments.join(".");
        if (!dependenciesMap.has(truncatedPath)) {
          dependenciesMap.set(truncatedPath, new Set());
        }
        dependenciesMap.get(truncatedPath)!.add(currentProp);

        if (!allPropertiesSet.has(truncatedPath)) {
          allPropertiesSet.add(truncatedPath);
          queue.push(truncatedPath);
        }
        continue;
      }

      const propKey = segments[segments.length - 1];
      if (targetObj && (typeof targetObj === "object" || typeof targetObj === "function")) {
        const deps = AcReactivity._findDependencies(targetObj, propKey);
        for (const dep of deps) {
          const parentPath = segments.slice(0, -1);
          const fullDepPath = parentPath.length > 0 ? `${parentPath.join(".")}.${dep}` : dep;

          if (!dependenciesMap.has(fullDepPath)) {
            dependenciesMap.set(fullDepPath, new Set());
          }
          dependenciesMap.get(fullDepPath)!.add(currentProp);

          if (!allPropertiesSet.has(fullDepPath)) {
            allPropertiesSet.add(fullDepPath);
            queue.push(fullDepPath);
          }
        }
      }
    }

    meta.root = {
      properties: Array.from(allPropertiesSet),
      onChange,
      batch,
      dependencies: dependenciesMap
    };

    const rootKeys = new Set<string>();
    for (const path of meta.root!.properties) {
      const rootKey = path.split(".")[0];
      if (rootKey) {
        // If it's a getter/setter and has dependencies, do not run Object.defineProperty on it
        const hasDeps = Array.from(dependenciesMap.values()).some(set => set.has(rootKey));
        if (!AcReactivity._isGetterOrSetter(rawInstance, rootKey) || !hasDeps) {
          rootKeys.add(rootKey);
        }
      }
    }
    for (const key of rootKeys) {
      AcReactivity._defineRootProperty({ instance: rawInstance, key });
    }

    return instance;
  }

  private static _isGetterOrSetter(instance: any, property: string): boolean {
    let targetProto = instance;
    while (targetProto) {
      const descriptor = Object.getOwnPropertyDescriptor(targetProto, property);
      if (descriptor && (descriptor.get || descriptor.set)) {
        return true;
      }
      targetProto = Object.getPrototypeOf(targetProto);
    }
    return false;
  }

  private static _findDependencies(instance: any, property: string): string[] {
    let targetProto = instance;
    let descriptor: PropertyDescriptor | undefined;
    while (targetProto) {
      descriptor = Object.getOwnPropertyDescriptor(targetProto, property);
      if (descriptor) break;
      targetProto = Object.getPrototypeOf(targetProto);
    }

    const deps = new Set<string>();
    if (descriptor) {
      if (descriptor.get) {
        AcReactivity._extractReferencedProperties(descriptor.get).forEach(d => deps.add(d));
      }
      if (descriptor.set) {
        AcReactivity._extractReferencedProperties(descriptor.set).forEach(d => deps.add(d));
      }
    }
    return Array.from(deps);
  }

  private static _extractReferencedProperties(fn: Function): string[] {
    const code = fn.toString();
    const deps = new Set<string>();

    const aliasRegex = /\b(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*this\b/g;
    const aliases = new Set<string>(["this"]);
    let match;
    while ((match = aliasRegex.exec(code)) !== null) {
      aliases.add(match[1]);
    }

    for (const alias of aliases) {
      const dotRegex = new RegExp(`\\b${alias}\\.([a-zA-Z_$][a-zA-Z0-9_$]*(?:\\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)`, "g");
      while ((match = dotRegex.exec(code)) !== null) {
        deps.add(match[1]);
      }

      const bracketRegex = new RegExp(`\\b${alias}\\s*\\[\\s*['"\`]([a-zA-Z_$][a-zA-Z0-9_$]*)['"\`](?:\\s*\\]|\\s*\\.\\s*([a-zA-Z_$][a-zA-Z0-9_$]*(?:\\.[a-zA-Z_$][a-zA-Z0-9_$]*)*))`, "g");
      while ((match = bracketRegex.exec(code)) !== null) {
        if (match[2]) {
          deps.add(`${match[1]}.${match[2]}`);
        } else {
          deps.add(match[1]);
        }
      }

      const destructureRegex = new RegExp(`\\b(?:const|let|var)\\s*\\{\\s*([^}]+)\\s*\\}\\s*=\\s*${alias}\\b`, "g");
      while ((match = destructureRegex.exec(code)) !== null) {
        const varsStr = match[1];
        const parts = varsStr.split(",");
        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed) continue;
          const namePart = trimmed.split(":")[0].trim();
          if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(namePart)) {
            deps.add(namePart);
          }
        }
      }
    }

    return Array.from(deps);
  }

  private static _defineRootProperty(options: { instance: any; key: string }): void {
    const { instance, key } = options;
    let targetProto = instance;
    let descriptor: PropertyDescriptor | undefined;
    while (targetProto) {
      descriptor = Object.getOwnPropertyDescriptor(targetProto, key);
      if (descriptor) break;
      targetProto = Object.getPrototypeOf(targetProto);
    }

    let initialValue: any;
    let originalGet: (() => any) | undefined;
    let originalSet: ((v: any) => void) | undefined;

    if (descriptor) {
      originalGet = descriptor.get;
      originalSet = descriptor.set;
      if (!descriptor.configurable) {
        return;
      }
      if (!originalGet) {
        initialValue = descriptor.value;
      }
    }

    const signal = new AcSignal({
      value: originalGet ? undefined : initialValue,
      onChange: (newValue, oldValue) => {
        const rawOld = oldValue && (oldValue as any)[RAW_TARGET] || oldValue;
        const rawNew = newValue && (newValue as any)[RAW_TARGET] || newValue;
        updateParentLink({ parent: instance, key, oldValue: rawOld, newValue: rawNew });

        const meta = AcMetadataStore.get({ target: instance });
        if (meta && meta.root) {
          emitChange({
            root: instance,
            rootMetadata: meta.root,
            change: {
              property: key,
              rootProperty: key,
              oldValue,
              newValue,
              target: instance,
              timestamp: Date.now(),
              type: getReactiveValueType({ value: newValue }),
              operation: "set",
              context: "root"
            }
          });
        }
      }
    });

    if (initialValue && typeof initialValue === "object") {
      const rawInitVal = initialValue[RAW_TARGET] || initialValue;
      updateParentLink({ parent: instance, key, oldValue: null, newValue: rawInitVal });
    }

    Object.defineProperty(instance, key, {
      configurable: true,
      enumerable: descriptor ? descriptor.enumerable : true,
      get() {
        let currentVal: any;
        if (originalGet) {
          currentVal = originalGet.call(this);
          (signal as any)._value = currentVal;
        } else {
          currentVal = signal.get();
        }

        if (currentVal && canBeReactive(currentVal)) {
          const rawVal = currentVal[RAW_TARGET] || currentVal;
          updateParentLink({ parent: this, key, oldValue: null, newValue: rawVal });
          return AcProxyFactory.create({ target: rawVal });
        }

        return currentVal;
      },
      set(value) {
        if (originalSet) {
          const oldValue = originalGet ? originalGet.call(this) : undefined;
          originalSet.call(this, value);
          const syncedVal = originalGet ? originalGet.call(this) : value;
          signal.set({ value: syncedVal, oldValue });
        } else {
          signal.set({ value });
        }
      }
    });
  }
}
