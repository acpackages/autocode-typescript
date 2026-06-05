// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ac-reactivity — Core Reactivity Engine
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// This file contains the ENTIRE reactivity implementation. Here is the flow:
//
//   1. makeReactive() is called with an instance, property paths, and onChange callback
//   2. For each root-level property, a getter/setter pair is installed via Object.defineProperty
//   3. The setter creates an AcSignal that detects value changes
//   4. When a nested object/array is accessed, a Proxy is lazily created to intercept mutations
//   5. When any change is detected (signal, proxy set, proxy delete, array method):
//      a. The proxy iterates its subscriptions (direct-to-root references)
//      b. For each subscription, fullPath = parentPath + "." + localKey
//      c. If the path is tracked, emitChange is called directly on the root — no traversal
//
// ARCHITECTURE DIAGRAM:
//
//   Instance (root)
//        │
//        ▼
//   Object.defineProperty()  ← installs getter/setter per root property
//        │
//        ├─ Primitive value → AcSignal stores value, detects changes
//        │
//        ├─ Object value → Proxy wraps it, intercepts nested get/set/delete
//        │
//        └─ Array value → Proxy wraps it, intercepts mutations + method calls
//             │
//             ▼
//        Change Detected
//             │
//             ▼
//        notifySubscribers()  ← iterates subscriptions, emits directly to each root
//             │
//             ▼
//        onChange callback
//

import {
    IAcMakeReactiveOptions,
    IAcReactiveChange,
    IReactiveMetadata,
    IRootMetadata,
    IProxySubscription,
    AcReactiveValueType,
    AcReactiveOperation,
} from "./types";
import { isGetterOrSetter, findGetterSetterDependencies } from "./dependency-resolver";


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 1: Metadata Store
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Every object that participates in reactivity gets metadata stored in this WeakMap.
// Using a WeakMap ensures metadata is garbage-collected when objects are no longer referenced.
//
// RAW_TARGET is a symbol stored on proxies to retrieve the original unwrapped object.
// This prevents double-wrapping: if you access proxy[RAW_TARGET], you get the original.
//

/** Symbol used to unwrap a Proxy back to its original target object. */
export const RAW_TARGET = Symbol.for("RAW_TARGET");

/**
 * Global metadata store. Maps raw (unwrapped) objects to their reactive metadata.
 * Exported for test access — not part of the public API contract.
 */
export const metadataStore = new WeakMap<object, IReactiveMetadata>();

function getOrCreateMetadata(target: object): IReactiveMetadata {
    let meta = metadataStore.get(target);
    if (!meta) {
        meta = { subscriptions: new Set() };
        metadataStore.set(target, meta);
    }
    return meta;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 2: Type Helpers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Classify a value as "primitive", "object", or "array". */
function getReactiveValueType(value: unknown): AcReactiveValueType {
    if (Array.isArray(value)) return "array";
    if (value !== null && typeof value === "object") return "object";
    return "primitive";
}

/**
 * Check if a value is a plain object (created with {} or Object.create(null)).
 * Class instances, DOM elements, etc. are NOT plain objects and should not be proxied.
 */
function isPlainObject(value: unknown): boolean {
    if (value === null || typeof value !== "object") return false;
    const proto = Object.getPrototypeOf(value);
    return proto === null || proto === Object.prototype;
}

/**
 * Determine if a value should be wrapped in a reactive Proxy.
 * Only plain objects and arrays are eligible — class instances are left as-is
 * to avoid interfering with their internal logic.
 */
export function canBeReactive(value: unknown): boolean {
    return Array.isArray(value) || isPlainObject(value);
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 3: Path Matching
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// When a change is detected at a path like "user.address.city",
// we check if it overlaps with any tracked property path.
//

/**
 * Check if a change at the given path should be reported.
 * Returns true if any tracked property path overlaps with the given path string.
 */
function isTrackedPath(properties: string[], pathStr: string): boolean {
    if (pathStr.length === 0) return true;
    return properties.some(p =>
        p === pathStr || pathStr.startsWith(p + ".") || p.startsWith(pathStr + ".")
    );
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 4: Proxy Subscriptions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Instead of parent links + findRoots() traversal, each proxy stores
// direct-to-root subscriptions. When a change occurs, the proxy iterates
// its subscriptions and emits directly to each root.
//
// Subscriptions are added when a nested object is accessed through a get trap.
// Each subscription tracks its child unsubscribe functions for cascading cleanup.
//

/**
 * Subscribe a proxy target to a root at a given path.
 * Returns an unsubscribe function that cascades to all children.
 *
 * @param target - The raw (unwrapped) object to subscribe
 * @param root - The reactive root instance
 * @param rootMetadata - Root's tracked properties, onChange, etc.
 * @param parentPath - The dot-path from root to this target (e.g. "user.address")
 */
function subscribeProxy(
    target: object,
    root: object,
    rootMetadata: IRootMetadata,
    parentPath: string,
): () => void {
    const meta = getOrCreateMetadata(target);

    // Dedup: don't add the same root+path subscription twice
    for (const sub of meta.subscriptions) {
        if (sub.root === root && sub.parentPath === parentPath) {
            return sub.childUnsubs ? () => unsubscribeProxy(meta, sub) : () => {};
        }
    }

    const sub: IProxySubscription = {
        root,
        rootMetadata,
        parentPath,
        childUnsubs: new Map(),
    };
    meta.subscriptions.add(sub);

    // Return cascading unsubscribe
    return () => unsubscribeProxy(meta, sub);
}

/**
 * Unsubscribe a subscription and cascade to all its children.
 */
function unsubscribeProxy(meta: IReactiveMetadata, sub: IProxySubscription): void {
    // Cascade: unsubscribe all children first
    for (const unsub of sub.childUnsubs.values()) {
        unsub();
    }
    sub.childUnsubs.clear();

    // Remove this subscription
    meta.subscriptions.delete(sub);
}

/**
 * Find the subscription for a given root+parentPath on a target.
 */
function findSubscription(
    target: object,
    root: object,
    parentPath: string,
): IProxySubscription | undefined {
    const meta = metadataStore.get(target);
    if (!meta) return undefined;
    for (const sub of meta.subscriptions) {
        if (sub.root === root && sub.parentPath === parentPath) {
            return sub;
        }
    }
    return undefined;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 5: Change Notification & Batching
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Batch scheduler state (module-level, shared across all roots)
const pendingBatchRoots = new Set<object>();
let isBatchMicrotaskScheduled = false;

/** Flush all pending batched changes. Called by the microtask. */
function flushBatchedChanges(): void {
    isBatchMicrotaskScheduled = false;
    const roots = Array.from(pendingBatchRoots);
    pendingBatchRoots.clear();

    for (const root of roots) {
        const meta = metadataStore.get(root);
        if (!meta?.root?.pendingChanges) continue;

        const pending = meta.root.pendingChanges;
        meta.root.pendingChanges = undefined;

        for (const change of pending.values()) {
            if (change.type === "array" || change.newValue !== change.oldValue) {
                meta.root.onChange(change);
            }
        }
    }
}

/** Schedule a batched change. Coalesces multiple changes per property into one notification. */
function scheduleBatchedChange(root: object, rootMetadata: IRootMetadata, change: IAcReactiveChange): void {
    if (!rootMetadata.pendingChanges) {
        rootMetadata.pendingChanges = new Map();
    }

    const existing = rootMetadata.pendingChanges.get(change.property);
    if (existing) {
        existing.newValue = change.newValue;
        existing.timestamp = change.timestamp;
        existing.type = change.type;
        existing.operation = change.operation;
    } else {
        rootMetadata.pendingChanges.set(change.property, { ...change });
    }

    pendingBatchRoots.add(root);

    if (!isBatchMicrotaskScheduled) {
        isBatchMicrotaskScheduled = true;
        queueMicrotask(flushBatchedChanges);
    }
}

/** Resolve a dot-separated path on an object (e.g. "user.name" → obj.user.name). */
function getValueAtPath(obj: any, path: string): any {
    let current = obj;
    for (const seg of path.split(".")) {
        if (current == null) return undefined;
        current = current[seg];
    }
    return current;
}

/**
 * Emit a change notification for a single root.
 *
 * After emitting, also checks if any computed properties (getters)
 * depend on the changed property, and recursively emits changes for those too.
 */
export function emitChange(
    root: object,
    rootMetadata: IRootMetadata,
    change: IAcReactiveChange,
    visited: Set<string> = new Set(),
): void {
    if (visited.has(change.property)) return;
    visited.add(change.property);

    // Ensure object/array values are always proxied, primitives stay raw
    change = {
        ...change,
        oldValue: ensureProxy(change.oldValue),
        newValue: ensureProxy(change.newValue),
    };

    // Deliver the change (batched or immediate)
    if (rootMetadata.batch) {
        scheduleBatchedChange(root, rootMetadata, change);
    } else {
        rootMetadata.onChange(change);
    }

    // Emit derived changes for any getter/setter dependencies.
    if (rootMetadata.dependencies) {
        const changedProp = change.property;
        for (const [depKey, dependentProps] of rootMetadata.dependencies.entries()) {
            const isRelated =
                changedProp === depKey ||
                changedProp.startsWith(depKey + ".") ||
                depKey.startsWith(changedProp + ".");
            if (!isRelated) continue;

            for (const depProp of dependentProps) {
                if (visited.has(depProp)) continue;
                const depValue = getValueAtPath(root, depProp);
                emitChange(root, rootMetadata, {
                    property: depProp,
                    rootProperty: depProp.split(".")[0],
                    oldValue: undefined,
                    newValue: depValue,
                    target: root,
                    timestamp: Date.now(),
                    type: getReactiveValueType(depValue),
                    operation: "set",
                    context: depProp.includes(".") ? "object" : "root",
                }, visited);
            }
        }
    }
}

/**
 * Notify all subscribers of a proxy about a change.
 *
 * This is the unified notification helper used by all proxy traps.
 * It directly emits to each subscribed root — no parent traversal.
 *
 * @param target - The raw object where the change occurred
 * @param localKey - The property key that changed (e.g. "city", "0", "")
 * @param oldValue - Previous value
 * @param newValue - New value
 * @param operation - What caused the change
 * @param context - Where in the tree the change occurred
 * @param type - Optional override for value type classification
 * @param skipRoot - Optional root to skip (used to avoid double-notification when
 *                   the caller already emitted to this root via emitChange)
 */
function notifySubscribers(
    target: object,
    localKey: string,
    oldValue: unknown,
    newValue: unknown,
    operation: AcReactiveOperation,
    context: "root" | "object" | "array",
    type?: AcReactiveValueType,
    skipRoot?: object,
): void {
    const meta = metadataStore.get(target);
    if (!meta || meta.subscriptions.size === 0) return;

    for (const sub of meta.subscriptions) {
        // Skip if this subscription's root was already notified by the caller
        if (skipRoot && sub.root === skipRoot) continue;

        const fullPath = localKey
            ? (sub.parentPath ? sub.parentPath + "." + localKey : localKey)
            : sub.parentPath;

        if (isTrackedPath(sub.rootMetadata.properties, fullPath)) {
            emitChange(sub.root, sub.rootMetadata, {
                property: fullPath,
                rootProperty: fullPath.split(".")[0],
                oldValue,
                newValue,
                target,
                timestamp: Date.now(),
                type: type ?? getReactiveValueType(newValue),
                operation,
                context,
            });
        }
    }
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 6: Signal (Value Cell)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class AcSignal<T> {
    public _value: T;
    private readonly _onChange?: (newValue: T, oldValue: T) => void;

    constructor(value: T, onChange?: (newValue: T, oldValue: T) => void) {
        this._value = value;
        this._onChange = onChange;
    }

    get(): T {
        return this._value;
    }

    set(value: T, oldValue: T = this._value): void {
        if (oldValue === value) return;
        this._value = value;
        if (this._onChange) {
            this._onChange(value, oldValue);
        }
    }
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 7: Proxy Creation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Proxies wrap nested objects and arrays to intercept mutations.
// They are created lazily — only when a nested property is actually accessed.
//
// PROXY IDENTITY: Each raw object gets at most ONE proxy, cached in its metadata.
//
// SUBSCRIPTIONS: When a get trap returns a child proxy, it subscribes the child
// for each of the parent's subscriptions. This ensures the child can emit directly
// to all roots that care about it. The subscription's childUnsubs map tracks these
// for cascading cleanup.
//

/** Array methods that mutate the array in place and should trigger change notifications. */
const ARRAY_MUTATING_METHODS = new Set<string>([
    "push", "pop", "shift", "unshift", "splice", "sort", "reverse", "fill", "copyWithin",
]);

/**
 * Get or create a reactive Proxy for a target object.
 * Returns a cached proxy if one already exists (ensures identity stability).
 */
function getOrCreateProxy(target: object): object {
    const meta = getOrCreateMetadata(target);
    if (meta.proxy) return meta.proxy;

    const proxy = Array.isArray(target)
        ? createArrayProxy(target)
        : createObjectProxy(target);

    meta.proxy = proxy;
    return proxy;
}

/** Wrap a value in its cached proxy if it's reactive-eligible. Returns primitives unchanged. */
function ensureProxy(value: unknown): unknown {
    if (value && canBeReactive(value)) {
        const raw = (value as any)[RAW_TARGET] || value;
        return getOrCreateProxy(raw);
    }
    return value;
}

/**
 * Subscribe a child object for each of the parent's subscriptions.
 * Each parent subscription gets a childUnsubs entry for cascading cleanup.
 *
 * @param parentTarget - The raw parent object
 * @param childTarget - The raw child object being accessed
 * @param key - The property key on the parent (e.g. "address", "0")
 */
function subscribeChildForParent(
    parentTarget: object,
    childTarget: object,
    key: string,
): void {
    const parentMeta = metadataStore.get(parentTarget);
    if (!parentMeta) return;

    for (const parentSub of parentMeta.subscriptions) {
        // Skip if this subscription already has a child sub for this key
        if (parentSub.childUnsubs.has(key)) continue;

        const childPath = parentSub.parentPath
            ? parentSub.parentPath + "." + key
            : key;

        const unsub = subscribeProxy(
            childTarget,
            parentSub.root,
            parentSub.rootMetadata,
            childPath,
        );
        parentSub.childUnsubs.set(key, unsub);
    }
}

/**
 * Cleanup child subscriptions for a key across all of the parent's subscriptions.
 * Called when a property value is replaced or deleted.
 */
function cleanupChildSubscriptions(parentTarget: object, key: string): void {
    const parentMeta = metadataStore.get(parentTarget);
    if (!parentMeta) return;

    for (const parentSub of parentMeta.subscriptions) {
        const unsub = parentSub.childUnsubs.get(key);
        if (unsub) {
            unsub(); // Cascades to grandchildren
            parentSub.childUnsubs.delete(key);
        }
    }
}

/**
 * Create a Proxy for a plain object.
 *
 * Traps:
 *   get  → returns RAW_TARGET, wraps nested reactive objects in proxies,
 *          subscribes children for each parent subscription
 *   set  → detects value changes, cleans up old child subscriptions,
 *          notifies all subscribers directly
 *   deleteProperty → detects deletions, cleans up, notifies subscribers
 */
function createObjectProxy(target: object): object {
    return new Proxy(target, {
        get(t, key, receiver) {
            if (key === RAW_TARGET) return t;

            const value = Reflect.get(t, key, receiver);
            if (typeof key === "symbol") return value;

            if (typeof value === "function") return value.bind(receiver);

            if (value && canBeReactive(value)) {
                const rawVal = (value as any)[RAW_TARGET] || value;
                // Subscribe child for each of our subscriptions
                subscribeChildForParent(t, rawVal, String(key));
                return getOrCreateProxy(rawVal);
            }
            return value;
        },

        set(t, key, value, receiver) {
            if (typeof key === "symbol") return Reflect.set(t, key, value, receiver);

            const oldValue = Reflect.get(t, key, receiver);
            if (oldValue === value) return true;

            const success = Reflect.set(t, key, value, receiver);
            if (!success) return false;

            // If this object is itself a root AND the property is a root-level tracked property,
            // skip proxy notification — the root's own signal/defineProperty handles it.
            const meta = metadataStore.get(t);
            if (meta?.root) {
                const isRootProp = meta.root.properties.some(p => p.split(".")[0] === String(key));
                if (isRootProp) return true;
            }

            // Cleanup old child subscriptions for this key (cascades)
            cleanupChildSubscriptions(t, String(key));

            // Notify all subscribers directly
            notifySubscribers(t, String(key), ensureProxy(oldValue), ensureProxy(value), "set", "object");

            return true;
        },

        deleteProperty(t, key) {
            if (typeof key === "symbol") return Reflect.deleteProperty(t, key);
            if (!Reflect.has(t, key)) return true;

            const oldValue = Reflect.get(t, key);
            const success = Reflect.deleteProperty(t, key);
            if (!success) return false;

            // Cleanup old child subscriptions for this key (cascades)
            cleanupChildSubscriptions(t, String(key));

            notifySubscribers(t, String(key), ensureProxy(oldValue), undefined, "delete", "object");

            return true;
        },
    });
}

/**
 * Create a Proxy for an array.
 *
 * In addition to the standard get/set/deleteProperty traps,
 * this proxy also intercepts mutating array methods (push, pop, splice, etc.)
 * to emit a single change notification per method call instead of per-element.
 */
function createArrayProxy(target: any[]): object {
    return new Proxy(target, {
        get(t, key, receiver) {
            if (key === RAW_TARGET) return t;

            // Intercept mutating array methods to emit a single change notification
            if (typeof key === "string" && ARRAY_MUTATING_METHODS.has(key)) {
                const originalMethod = (t as any)[key];
                return function (this: any, ...args: any[]) {
                    const meta = getOrCreateMetadata(t);
                    const snapshot = [...receiver]; // Pre-mutation state via proxy

                    // Set the isMutating semaphore to suppress per-element set trap notifications
                    meta.isMutating = (meta.isMutating || 0) + 1;
                    try {
                        return Reflect.apply(originalMethod, t, args);
                    } finally {
                        meta.isMutating!--;
                        if (meta.isMutating === 0) {
                            // Clear all numeric child subscriptions — indexes may have shifted
                            for (const sub of meta.subscriptions) {
                                for (const [subKey, unsub] of sub.childUnsubs) {
                                    if (!isNaN(Number(subKey))) {
                                        unsub();
                                        sub.childUnsubs.delete(subKey);
                                    }
                                }
                            }

                            // Eagerly subscribe all reactive items with correct indexes.
                            // This ensures newly pushed/unshifted/spliced objects are
                            // immediately subscribed to the parent root(s).
                            for (let i = 0; i < t.length; i++) {
                                const item = t[i];
                                if (item && canBeReactive(item)) {
                                    const rawItem = (item as any)[RAW_TARGET] || item;
                                    subscribeChildForParent(t, rawItem, String(i));
                                }
                            }

                            // Emit a single change notification with the method name as operation
                            // localKey = "" means the array itself changed
                            notifySubscribers(t, "", snapshot, receiver, key as AcReactiveOperation, "array", "array");
                        }
                    }
                };
            }

            const value = Reflect.get(t, key, receiver);
            if (typeof key === "symbol") return value;

            if (value && canBeReactive(value)) {
                const rawVal = (value as any)[RAW_TARGET] || value;
                subscribeChildForParent(t, rawVal, String(key));
                return getOrCreateProxy(rawVal);
            }
            return value;
        },

        set(t, key, value, receiver) {
            if (typeof key === "symbol") return Reflect.set(t, key, value, receiver);

            const meta = getOrCreateMetadata(t);

            // Suppress notifications during mutating methods (push, splice, etc.)
            if (meta.isMutating) return Reflect.set(t, key, value, receiver);

            const oldValue = Reflect.get(t, key, receiver);
            if (oldValue === value) return true;

            const success = Reflect.set(t, key, value, receiver);
            if (!success) return false;

            // Handle direct length assignment: arr.length = 1
            if (key === "length") {
                notifySubscribers(t, "length", oldValue, value, "length", "array", "array");
                return true;
            }

            // Cleanup old child subscriptions for this index
            cleanupChildSubscriptions(t, String(key));

            // Handle direct index assignment: arr[0] = newValue
            notifySubscribers(t, String(key), ensureProxy(oldValue), ensureProxy(value), "set", "array", "array");

            return true;
        },

        deleteProperty(t, key) {
            if (typeof key === "symbol") return Reflect.deleteProperty(t, key);

            const meta = getOrCreateMetadata(t);
            if (meta.isMutating) return Reflect.deleteProperty(t, key);

            if (!Reflect.has(t, key)) return true;

            const oldValue = Reflect.get(t, key);
            const success = Reflect.deleteProperty(t, key);
            if (!success) return false;

            // Cleanup old child subscriptions for this index
            cleanupChildSubscriptions(t, String(key));

            notifySubscribers(t, String(key), ensureProxy(oldValue), undefined, "delete", "array", "array");

            return true;
        },
    });
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 8: AcReactivity — Public API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class AcReactivity {
    /**
     * Make selected properties of an object instance reactive.
     *
     * This does NOT wrap the instance in a Proxy. Instead, it uses
     * Object.defineProperty to install getter/setter pairs on the instance itself.
     * This preserves prototype chains, identity, and instanceof checks.
     *
     * @returns The same instance (not a wrapper or copy)
     */
    public static makeReactive<T>(options: IAcMakeReactiveOptions<T>): T {
        const { instance, properties, onChange, batch = false } = options;

        // Guard: only objects/functions can be made reactive
        if (!instance || (typeof instance !== "object" && typeof instance !== "function")) {
            return instance;
        }

        // Unwrap if already proxied to avoid double-wrapping
        const rawInstance = (instance as any)[RAW_TARGET] || instance;
        const meta = getOrCreateMetadata(rawInstance);

        // Guard: already reactive — skip to prevent re-initialization
        if (meta.root) return instance;

        // ─── Step 1: Resolve getter/setter dependencies ────────────

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
                const deps = findGetterSetterDependencies(targetObj, propKey);
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

        // ─── Step 2: Store root metadata ───────────────────────────

        meta.root = {
            properties: Array.from(allPropertiesSet),
            onChange,
            batch,
            dependencies: dependenciesMap,
        };

        // ─── Step 3: Install getter/setter on each root property ───

        const rootKeys = new Set<string>();
        for (const path of meta.root.properties) {
            const rootKey = path.split(".")[0];
            if (rootKey) {
                const hasDeps = Array.from(dependenciesMap.values()).some(set => set.has(rootKey));
                if (!isGetterOrSetter(rawInstance, rootKey) || !hasDeps) {
                    rootKeys.add(rootKey);
                }
            }
        }

        for (const key of rootKeys) {
            defineRootProperty(rawInstance, key);
        }

        return instance;
    }
}

/**
 * Install a reactive getter/setter pair on a root-level property.
 *
 * This replaces the original property with a new getter/setter that:
 *   - Uses an AcSignal to detect value changes
 *   - Lazily wraps object/array values in reactive Proxies on read
 *   - Subscribes the proxy to this root so changes emit directly
 *   - Emits change notifications on write
 *   - Preserves original getters/setters if the property was already an accessor
 */
function defineRootProperty(instance: any, key: string): void {
    // Walk prototype chain to find existing descriptor (if any)
    let proto = instance;
    let descriptor: PropertyDescriptor | undefined;
    while (proto) {
        descriptor = Object.getOwnPropertyDescriptor(proto, key);
        if (descriptor) break;
        proto = Object.getPrototypeOf(proto);
    }

    let initialValue: any;
    let originalGet: (() => any) | undefined;
    let originalSet: ((v: any) => void) | undefined;

    if (descriptor) {
        originalGet = descriptor.get;
        originalSet = descriptor.set;
        if (!descriptor.configurable) return;
        if (!originalGet) initialValue = descriptor.value;
    }

    // Track the current subscription to the root-level proxy value.
    // When the value changes, we unsubscribe from the old and subscribe to the new.
    let currentUnsub: (() => void) | undefined;
    let subscribedRaw: object | undefined;

    const signal = new AcSignal(
        originalGet ? undefined : initialValue,
        (newValue: any, oldValue: any) => {
            // Unsubscribe from old value's proxy (cascades to all children)
            if (currentUnsub) {
                currentUnsub();
                currentUnsub = undefined;
                subscribedRaw = undefined;
            }

            // Emit root-level change
            const meta = metadataStore.get(instance);
            if (meta?.root) {
                emitChange(instance, meta.root, {
                    property: key,
                    rootProperty: key,
                    oldValue,
                    newValue,
                    target: instance,
                    timestamp: Date.now(),
                    type: getReactiveValueType(newValue),
                    operation: "set",
                    context: "root",
                });
            }

            // Also notify external subscriptions on this instance.
            // Handles the cross-root case: when this instance is independently reactive
            // but also nested in another reactive tree (e.g. a makeReactive'd object
            // pushed into a tracked array), external subscribers need to be notified.
            // Skip this instance's own root to avoid double-notification (circular refs).
            notifySubscribers(instance, key, oldValue, newValue, "set", "object", undefined, instance);
        },
    );

    // If the initial value is a reactive object, subscribe right away
    if (initialValue && canBeReactive(initialValue)) {
        const rawInit = initialValue[RAW_TARGET] || initialValue;
        const meta = metadataStore.get(instance);
        if (meta?.root) {
            currentUnsub = subscribeProxy(rawInit, instance, meta.root, key);
            subscribedRaw = rawInit;
        }
    }

    // Replace the property with a reactive getter/setter
    Object.defineProperty(instance, key, {
        configurable: true,
        enumerable: descriptor ? descriptor.enumerable : true,

        get() {
            let currentVal: any;
            if (originalGet) {
                currentVal = originalGet.call(this);
                signal._value = currentVal;
            } else {
                currentVal = signal.get();
            }

            // Lazily wrap object/array values in a reactive Proxy
            if (currentVal && canBeReactive(currentVal)) {
                const rawVal = currentVal[RAW_TARGET] || currentVal;

                // Subscribe to the proxy (re-subscribe only if raw value changed)
                if (rawVal !== subscribedRaw) {
                    if (currentUnsub) currentUnsub();
                    const meta = metadataStore.get(instance);
                    if (meta?.root) {
                        currentUnsub = subscribeProxy(rawVal, instance, meta.root, key);
                    }
                    subscribedRaw = rawVal;
                }

                return getOrCreateProxy(rawVal);
            }

            // Value became primitive — unsubscribe from old proxy
            if (currentUnsub) {
                currentUnsub();
                currentUnsub = undefined;
                subscribedRaw = undefined;
            }
            return currentVal;
        },

        set(value) {
            if (originalSet) {
                const oldValue = originalGet ? originalGet.call(this) : undefined;
                originalSet.call(this, value);
                const syncedVal = originalGet ? originalGet.call(this) : value;
                signal.set(syncedVal, oldValue);
            } else {
                signal.set(value);
            }
        },
    });
}
