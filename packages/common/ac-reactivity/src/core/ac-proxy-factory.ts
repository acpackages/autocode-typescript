import { RAW_TARGET, AcMetadataStore } from "./ac-metadata-store";
import { AcPropertyTree } from "./ac-property-tree";
import { getReactiveValueType, updateParentLink, findRoots, emitChange, canBeReactive } from "./ac-utilities";
import { AcReactiveOperation } from "../types/ac-reactive-operation.type";

export class AcProxyFactory {
    private static readonly _arrayMutatingMethods = new Set<string>([
        "push",
        "pop",
        "shift",
        "unshift",
        "splice",
        "sort",
        "reverse",
        "fill",
        "copyWithin"
    ]);

    public static create(options: { target: object }): object {
        const { target } = options;
        const meta = AcMetadataStore.getOrCreate({ target });
        if (meta.proxy) {
            return meta.proxy;
        }

        const proxy = Array.isArray(target)
            ? AcProxyFactory._createArrayProxy({ target })
            : AcProxyFactory._createObjectProxy({ target });

        meta.proxy = proxy;
        return proxy;
    }

    private static _createObjectProxy(options: { target: object }): object {
        const { target } = options;
        return new Proxy(target, {
            get(t, key, receiver) {
                if (key === RAW_TARGET) return t;

                const value = Reflect.get(t, key, receiver);
                if (typeof key === "symbol") return value;
                if (typeof value === "function") return value.bind(receiver);

                if (value && canBeReactive(value)) {
                    const roots = findRoots({ target: t, currentPath: [key] });
                    let isReactive = false;
                    for (const r of roots) {
                        if (AcPropertyTree.checkPath({ properties: r.rootMetadata.properties, segments: r.segments })) {
                            isReactive = true;
                            break;
                        }
                    }
                    if (isReactive) {
                        const rawVal = (value as any)[RAW_TARGET] || value;
                        updateParentLink({ parent: t, key, oldValue: null, newValue: rawVal });
                        return AcProxyFactory.create({ target: rawVal });
                    }
                }
                return value;
            },

            set(t, key, value, receiver) {
                if (typeof key === "symbol") {
                    return Reflect.set(t, key, value, receiver);
                }

                const oldValue = Reflect.get(t, key, receiver);
                if (oldValue === value) return true;

                const success = Reflect.set(t, key, value, receiver);
                if (!success) return false;

                const meta = AcMetadataStore.get({ target: t });
                if (meta && meta.root) {
                    const isRootProp = meta.root.properties.some(p => p.split(".")[0] === String(key));
                    if (isRootProp) {
                        return true;
                    }
                }

                const roots = findRoots({ target: t, currentPath: [key] });
                if (roots.length > 0) {
                    const rawOldValue = oldValue && (oldValue as any)[RAW_TARGET] || oldValue;
                    const rawNewValue = value && (value as any)[RAW_TARGET] || value;
                    updateParentLink({ parent: t, key, oldValue: rawOldValue, newValue: rawNewValue });

                    for (const r of roots) {
                        if (AcPropertyTree.checkPath({ properties: r.rootMetadata.properties, segments: r.segments })) {
                            emitChange({
                                root: r.root,
                                rootMetadata: r.rootMetadata,
                                change: {
                                    property: r.segments.join("."),
                                    rootProperty: r.rootProperty,
                                    oldValue,
                                    newValue: value,
                                    target: t,
                                    timestamp: Date.now(),
                                    type: getReactiveValueType({ value }),
                                    operation: "set",
                                    context: "object"
                                }
                            });
                        }
                    }
                }
                return true;
            },

            deleteProperty(t, key) {
                if (typeof key === "symbol") return Reflect.deleteProperty(t, key);

                const hasProperty = Reflect.has(t, key);
                if (!hasProperty) return true;

                const oldValue = Reflect.get(t, key);
                const success = Reflect.deleteProperty(t, key);
                if (!success) return false;

                const roots = findRoots({ target: t, currentPath: [key] });
                if (roots.length > 0) {
                    const rawOldValue = oldValue && (oldValue as any)[RAW_TARGET] || oldValue;
                    updateParentLink({ parent: t, key, oldValue: rawOldValue, newValue: null });

                    for (const r of roots) {
                        if (AcPropertyTree.checkPath({ properties: r.rootMetadata.properties, segments: r.segments })) {
                            emitChange({
                                root: r.root,
                                rootMetadata: r.rootMetadata,
                                change: {
                                    property: r.segments.join("."),
                                    rootProperty: r.rootProperty,
                                    oldValue,
                                    newValue: undefined,
                                    target: t,
                                    timestamp: Date.now(),
                                    type: getReactiveValueType({ value: oldValue }),
                                    operation: "delete",
                                    context: "object"
                                }
                            });
                        }
                    }
                }
                return true;
            }
        });
    }

    private static _createArrayProxy(options: { target: any[] }): object {
        const { target } = options;
        return new Proxy(target, {
            get(t, key, receiver) {
                if (key === RAW_TARGET) return t;

                if (typeof key === "string" && AcProxyFactory._arrayMutatingMethods.has(key)) {
                    const originalMethod = (t as any)[key];
                    return function (this: any, ...args: any[]) {
                        const meta = AcMetadataStore.getOrCreate({ target: t });
                        const oldValue = t.slice();

                        meta.isMutating = (meta.isMutating || 0) + 1;
                        try {
                            return Reflect.apply(originalMethod, t, args);
                        } finally {
                            meta.isMutating!--;
                            if (meta.isMutating === 0) {
                                for (const item of oldValue) {
                                    if (item && typeof item === "object") {
                                        const rawItem = item[RAW_TARGET] || item;
                                        updateParentLink({ parent: t, key: -1, oldValue: rawItem, newValue: null });
                                    }
                                }
                                for (const item of t) {
                                    if (item && typeof item === "object") {
                                        const rawItem = item[RAW_TARGET] || item;
                                        updateParentLink({ parent: t, key: -1, oldValue: null, newValue: rawItem });
                                    }
                                }

                                const roots = findRoots({ target: t });
                                for (const r of roots) {
                                    if (AcPropertyTree.checkPath({ properties: r.rootMetadata.properties, segments: r.segments })) {
                                        emitChange({
                                            root: r.root,
                                            rootMetadata: r.rootMetadata,
                                            change: {
                                                property: r.segments.join("."),
                                                rootProperty: r.rootProperty,
                                                oldValue,
                                                newValue: t,
                                                target: t,
                                                timestamp: Date.now(),
                                                type: "array",
                                                operation: key as AcReactiveOperation,
                                                context: "array"
                                            }
                                        });
                                    }
                                }
                            }
                        }
                    };
                }

                const value = Reflect.get(t, key, receiver);
                if (typeof key === "symbol") return value;

                if (value && canBeReactive(value)) {
                    const indexKey = isNaN(Number(key)) ? key : Number(key);
                    const roots = findRoots({ target: t, currentPath: [indexKey] });
                    let isReactive = false;
                    for (const r of roots) {
                        if (AcPropertyTree.checkPath({ properties: r.rootMetadata.properties, segments: r.segments })) {
                            isReactive = true;
                            break;
                        }
                    }
                    if (isReactive) {
                        const rawVal = (value as any)[RAW_TARGET] || value;
                        updateParentLink({ parent: t, key: -1, oldValue: null, newValue: rawVal });
                        return AcProxyFactory.create({ target: rawVal });
                    }
                }
                return value;
            },

            set(t, key, value, receiver) {
                if (typeof key === "symbol") return Reflect.set(t, key, value, receiver);

                const meta = AcMetadataStore.getOrCreate({ target: t });
                if (meta.isMutating) {
                    return Reflect.set(t, key, value, receiver);
                }

                const oldValue = Reflect.get(t, key, receiver);
                if (oldValue === value) return true;

                const success = Reflect.set(t, key, value, receiver);
                if (!success) return false;

                if (key === "length") {
                    const roots = findRoots({ target: t, currentPath: ["length"] });
                    for (const r of roots) {
                        if (AcPropertyTree.checkPath({ properties: r.rootMetadata.properties, segments: r.segments })) {
                            emitChange({
                                root: r.root,
                                rootMetadata: r.rootMetadata,
                                change: {
                                    property: r.segments.join("."),
                                    rootProperty: r.rootProperty,
                                    oldValue,
                                    newValue: value,
                                    target: t,
                                    timestamp: Date.now(),
                                    type: "array",
                                    operation: "length",
                                    context: "array"
                                }
                            });
                        }
                    }
                    return true;
                }

                const indexKey = isNaN(Number(key)) ? key : Number(key);
                const roots = findRoots({ target: t, currentPath: [indexKey] });
                if (roots.length > 0) {
                    const rawOldValue = oldValue && (oldValue as any)[RAW_TARGET] || oldValue;
                    const rawNewValue = value && (value as any)[RAW_TARGET] || value;
                    updateParentLink({ parent: t, key: -1, oldValue: rawOldValue, newValue: rawNewValue });

                    for (const r of roots) {
                        if (AcPropertyTree.checkPath({ properties: r.rootMetadata.properties, segments: r.segments })) {
                            emitChange({
                                root: r.root,
                                rootMetadata: r.rootMetadata,
                                change: {
                                    property: r.segments.join("."),
                                    rootProperty: r.rootProperty,
                                    oldValue,
                                    newValue: value,
                                    target: t,
                                    timestamp: Date.now(),
                                    type: "array",
                                    operation: "set",
                                    context: "array"
                                }
                            });
                        }
                    }
                }
                return true;
            },

            deleteProperty(t, key) {
                if (typeof key === "symbol") return Reflect.deleteProperty(t, key);

                const meta = AcMetadataStore.getOrCreate({ target: t });
                if (meta.isMutating) return Reflect.deleteProperty(t, key);

                const hasProperty = Reflect.has(t, key);
                if (!hasProperty) return true;

                const oldValue = Reflect.get(t, key);
                const success = Reflect.deleteProperty(t, key);
                if (!success) return false;

                const indexKey = isNaN(Number(key)) ? key : Number(key);
                const roots = findRoots({ target: t, currentPath: [indexKey] });
                if (roots.length > 0) {
                    const rawOldValue = oldValue && (oldValue as any)[RAW_TARGET] || oldValue;
                    updateParentLink({ parent: t, key: -1, oldValue: rawOldValue, newValue: null });

                    for (const r of roots) {
                        if (AcPropertyTree.checkPath({ properties: r.rootMetadata.properties, segments: r.segments })) {
                            emitChange({
                                root: r.root,
                                rootMetadata: r.rootMetadata,
                                change: {
                                    property: r.segments.join("."),
                                    rootProperty: r.rootProperty,
                                    oldValue,
                                    newValue: undefined,
                                    target: t,
                                    timestamp: Date.now(),
                                    type: "array",
                                    operation: "delete",
                                    context: "array"
                                }
                            });
                        }
                    }
                }
                return true;
            }
        });
    }
}
