// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ac-reactivity — Core Reactivity Engine
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// This file contains the ENTIRE reactivity implementation. Here is the flow:
//
//   1. makeReactive() is called with an instance, property paths, and onChange callback
//   2. For each root-level property, a getter/setter pair is installed via Object.defineProperty
//   3. The setter creates an AcSignal that detects value changes
//   4. When a nested object/array is accessed, a Proxy is lazily created to intercept mutations
//   5. When any change is detected (signal, proxy set, proxy delete, array method):
//      a. Parent links are updated (for new object values)
//      b. All reactive roots are found by walking parent links upward
//      c. The property path is checked against tracked paths
//      d. If tracked, onChange is called (directly or batched via microtask)
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
//        notifyRoots()  ← walks parent links upward to all reactive roots
//             │
//             ▼
//        onChange callback  ← or batched via microtask for coalesced delivery
//

import {
    IAcMakeReactiveOptions,
    IAcReactiveChange,
    IReactiveMetadata,
    IRootMetadata,
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
        meta = { parents: [] };
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
// A path is considered tracked if:
//   - It exactly matches a tracked path ("user.address.city" == "user.address.city")
//   - It is a prefix of a tracked path ("user" is a prefix of "user.address.city")
//   - A tracked path is a prefix of it ("user.address" tracks "user.address.city")
//

/**
 * Check if a change at the given path should be reported.
 * Returns true if any tracked property path overlaps with the given segments.
 */
function isTrackedPath(properties: string[], segments: (string | number)[]): boolean {
    if (segments.length === 0) return true;
    const pathStr = segments.join(".");
    return properties.some(p =>
        p === pathStr || pathStr.startsWith(p + ".") || p.startsWith(pathStr + ".")
    );
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 4: Parent-Child Link Tracking
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// When a nested object is assigned as a property value, we record a
// "parent link" from child → parent. This creates an upward graph that
// findRoots() traverses to propagate changes to all reactive roots.
//
// Example: instance.user = { name: "John" }
//   → The object { name: "John" } gets a parent link: { parent: instance, key: "user" }
//
// When instance.user is replaced with a new object, the old object's
// parent link is removed (cleanup to prevent stale notifications).
//

/** Record that `target` is stored at `parent[key]`. */
function addParentLink(target: object, parent: object, key: string | number): void {
    const meta = getOrCreateMetadata(target);
    const alreadyLinked = meta.parents.some(p => p.parent === parent && p.key === key);
    if (!alreadyLinked) {
        meta.parents.push({ parent, key });
    }
}

/** Remove the record that `target` was stored at `parent[key]`. */
function removeParentLink(target: object, parent: object, key: string | number): void {
    const meta = metadataStore.get(target);
    if (meta) {
        meta.parents = meta.parents.filter(p => !(p.parent === parent && p.key === key));
    }
}

/**
 * Update parent links when a property value changes.
 * Removes the link from the old value and adds a link to the new value.
 * Only applies to object/function values (primitives don't have parent links).
 */
export function updateParentLink(
    parent: object,
    key: string | number,
    oldValue: unknown,
    newValue: unknown,
): void {
    if (oldValue === newValue) return;

    if (oldValue && (typeof oldValue === "object" || typeof oldValue === "function")) {
        const raw = (oldValue as any)[RAW_TARGET] || oldValue;
        removeParentLink(raw, parent, key);
    }

    if (newValue && (typeof newValue === "object" || typeof newValue === "function")) {
        const raw = (newValue as any)[RAW_TARGET] || newValue;
        addParentLink(raw, parent, key);
    }
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 5: Root Discovery
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// When a change occurs deep in the object tree, we need to find all
// reactive roots that should be notified. We walk upward through
// parent links until we find objects that have `root` metadata.
//
// Example object graph:
//   rootA.user.address = sharedObj
//   rootB.config.addr  = sharedObj  (same object, shared)
//
// A change to sharedObj.city should notify both rootA and rootB.
//
// The `visited` set prevents infinite loops from circular references
// (e.g. instance.self = instance).
//

/** Result of walking parent links upward to a reactive root. */
interface IRootPath {
    /** The root object (the one passed to makeReactive). */
    root: object;
    /** Root metadata containing tracked properties, onChange, etc. */
    rootMetadata: IRootMetadata;
    /** Full path segments from root down to the changed property. */
    segments: (string | number)[];
    /** The first segment — the root-level property name. */
    rootProperty: string;
}

/**
 * Walk parent links upward from `target` to find all reactive roots.
 * Builds the full property path as it traverses.
 *
 * @param target - The object where the change occurred
 * @param currentPath - Path segments accumulated so far (built bottom-up, reversed at root)
 * @param visited - Prevents infinite loops from circular references
 */
export function findRoots(
    target: object,
    currentPath: (string | number)[] = [],
    visited: Set<object> = new Set(),
): IRootPath[] {
    const results: IRootPath[] = [];

    // Guard against circular references
    if (visited.has(target)) return results;
    visited.add(target);

    const meta = metadataStore.get(target);
    if (!meta) return results;

    // If this object is itself a reactive root, record it
    if (meta.root) {
        const segments = currentPath.slice().reverse();
        results.push({
            root: target,
            rootMetadata: meta.root,
            segments,
            rootProperty: String(segments[0] || ""),
        });
    }

    // Walk upward through all parent links
    for (const link of meta.parents) {
        let key = link.key;
        // For array items, the stored key is -1 (sentinel).
        // Resolve to the actual index by searching the parent array.
        if (key === -1 && Array.isArray(link.parent)) {
            const index = link.parent.indexOf(target);
            if (index !== -1) {
                key = index;
            }
        }
        currentPath.push(key);
        results.push(...findRoots(link.parent, currentPath, visited));
        currentPath.pop();
    }

    visited.delete(target);
    return results;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 6: Change Notification & Batching
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// NOTIFICATION FLOW:
//   1. A change is detected (signal, proxy trap, or array method)
//   2. emitChange() is called with the root, metadata, and change details
//   3. If batching is enabled:
//      - The change is accumulated in pendingChanges (keyed by property path)
//      - A microtask is scheduled (if not already scheduled)
//      - When the microtask fires, all pending changes are flushed to onChange
//   4. If batching is disabled:
//      - onChange is called immediately
//   5. After emitting, dependency-triggered changes are also emitted
//      (e.g., if "list" changed and "count" getter depends on "list", emit "count" too)
//

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
            // Skip changes where the value didn't actually change (unless array mutation)
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
        // Update the existing pending change with the latest values
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
 *
 * @param visited - Prevents infinite loops when dependencies form cycles
 */
export function emitChange(
    root: object,
    rootMetadata: IRootMetadata,
    change: IAcReactiveChange,
    visited: Set<string> = new Set(),
): void {
    if (visited.has(change.property)) return;
    visited.add(change.property);

    // Deliver the change (batched or immediate)
    if (rootMetadata.batch) {
        scheduleBatchedChange(root, rootMetadata, change);
    } else {
        rootMetadata.onChange(change);
    }

    // Emit derived changes for any getter/setter dependencies.
    // For example, if "list" changed and a "count" getter reads from "this.list",
    // we also emit a change for "count".
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
 * Notify all reactive roots about a change to a nested object or array.
 *
 * This is the unified notification helper used by all proxy traps.
 * It encapsulates the repeated pattern of:
 *   1. Update parent links
 *   2. Find all roots via parent traversal
 *   3. Check if the path is tracked
 *   4. Emit change for each matching root
 */
function notifyRoots(
    target: object,
    pathSegments: (string | number)[],
    oldValue: unknown,
    newValue: unknown,
    operation: AcReactiveOperation,
    context: "root" | "object" | "array",
    type?: AcReactiveValueType,
): void {
    const roots = findRoots(target, pathSegments.length > 0 ? [...pathSegments] : undefined);
    for (const r of roots) {
        if (isTrackedPath(r.rootMetadata.properties, r.segments)) {
            emitChange(r.root, r.rootMetadata, {
                property: r.segments.join("."),
                rootProperty: r.rootProperty,
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
// SECTION 7: Signal (Value Cell)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// A Signal is a simple value container that detects changes.
// It stores a single value and calls an onChange callback when the value changes.
//
// Signals are used for root-level properties to efficiently track
// primitive values without needing a Proxy.
//

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
// SECTION 8: Proxy Creation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Proxies wrap nested objects and arrays to intercept mutations.
// They are created lazily — only when a nested property is actually accessed.
//
// PROXY IDENTITY: Each raw object gets at most ONE proxy, cached in its metadata.
// This ensures that `instance.user === instance.user` returns true (referential stability).
//
// TWO PROXY TYPES:
//   1. Object proxy — intercepts get, set, deleteProperty
//   2. Array proxy — same traps plus intercepts mutating methods (push, pop, splice, etc.)
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

/**
 * Create a Proxy for a plain object.
 *
 * Traps:
 *   get  → returns RAW_TARGET, wraps nested reactive objects in proxies
 *   set  → detects value changes, notifies all roots
 *   deleteProperty → detects deletions, notifies all roots
 */
function createObjectProxy(target: object): object {
    return new Proxy(target, {
        // GET TRAP: Intercepts property reads.
        // Why: To return RAW_TARGET for unwrapping, bind methods to the proxy,
        //      and lazily wrap nested reactive objects in proxies.
        get(t, key, receiver) {
            // Allow unwrapping the proxy back to the original object
            if (key === RAW_TARGET) return t;

            const value = Reflect.get(t, key, receiver);
            if (typeof key === "symbol") return value;

            // Bind functions to the proxy so `this` works correctly inside methods
            if (typeof value === "function") return value.bind(receiver);

            // If the value is a reactive-eligible object, wrap it in a proxy.
            // Only wrap if the path from this object to a root is actually tracked.
            if (value && canBeReactive(value)) {
                const roots = findRoots(t, [key]);
                const isTracked = roots.some(r =>
                    isTrackedPath(r.rootMetadata.properties, r.segments)
                );
                if (isTracked) {
                    const rawVal = (value as any)[RAW_TARGET] || value;
                    updateParentLink(t, key, null, rawVal);
                    return getOrCreateProxy(rawVal);
                }
            }
            return value;
        },

        // SET TRAP: Intercepts property assignments.
        // Why: To detect value changes on nested objects and propagate
        //      change notifications up to reactive roots.
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

            // Update parent links and notify all roots
            const rawOld = oldValue && (oldValue as any)[RAW_TARGET] || oldValue;
            const rawNew = value && (value as any)[RAW_TARGET] || value;
            updateParentLink(t, key, rawOld, rawNew);
            notifyRoots(t, [key], oldValue, value, "set", "object");

            return true;
        },

        // DELETE TRAP: Intercepts `delete obj.prop`.
        // Why: To detect property removals and notify all roots.
        deleteProperty(t, key) {
            if (typeof key === "symbol") return Reflect.deleteProperty(t, key);
            if (!Reflect.has(t, key)) return true;

            const oldValue = Reflect.get(t, key);
            const success = Reflect.deleteProperty(t, key);
            if (!success) return false;

            const rawOld = oldValue && (oldValue as any)[RAW_TARGET] || oldValue;
            updateParentLink(t, key, rawOld, null);
            notifyRoots(t, [key], oldValue, undefined, "delete", "object");

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
        // GET TRAP: Same as object proxy, plus intercepts mutating array methods.
        // Why: Array methods like push() trigger multiple internal set/length operations.
        //      We wrap them to emit a single notification with the method name as the operation.
        get(t, key, receiver) {
            if (key === RAW_TARGET) return t;

            // Intercept mutating array methods to emit a single change notification
            if (typeof key === "string" && ARRAY_MUTATING_METHODS.has(key)) {
                const originalMethod = (t as any)[key];
                return function (this: any, ...args: any[]) {
                    const meta = getOrCreateMetadata(t);
                    const snapshot = t.slice(); // Capture pre-mutation state

                    // Set the isMutating semaphore to suppress per-element set trap notifications
                    meta.isMutating = (meta.isMutating || 0) + 1;
                    try {
                        return Reflect.apply(originalMethod, t, args);
                    } finally {
                        meta.isMutating!--;
                        if (meta.isMutating === 0) {
                            // Rebuild parent links: remove old items, add new items
                            for (const item of snapshot) {
                                if (item && typeof item === "object") {
                                    updateParentLink(t, -1, (item as any)[RAW_TARGET] || item, null);
                                }
                            }
                            for (const item of t) {
                                if (item && typeof item === "object") {
                                    updateParentLink(t, -1, null, (item as any)[RAW_TARGET] || item);
                                }
                            }

                            // Emit a single change notification with the method name as operation
                            notifyRoots(t, [], snapshot, t, key as AcReactiveOperation, "array", "array");
                        }
                    }
                };
            }

            const value = Reflect.get(t, key, receiver);
            if (typeof key === "symbol") return value;

            // Wrap reactive-eligible array elements in proxies
            if (value && canBeReactive(value)) {
                const indexKey = isNaN(Number(key)) ? key : Number(key);
                const roots = findRoots(t, [indexKey]);
                const isTracked = roots.some(r =>
                    isTrackedPath(r.rootMetadata.properties, r.segments)
                );
                if (isTracked) {
                    const rawVal = (value as any)[RAW_TARGET] || value;
                    updateParentLink(t, -1, null, rawVal);
                    return getOrCreateProxy(rawVal);
                }
            }
            return value;
        },

        // SET TRAP: Intercepts index assignment (arr[0] = x) and length changes.
        // Why: Direct index writes and length truncation need change notifications.
        //      During mutating methods (push, splice), per-element sets are suppressed
        //      by the isMutating semaphore — the method wrapper handles notification.
        set(t, key, value, receiver) {
            if (typeof key === "symbol") return Reflect.set(t, key, value, receiver);

            const meta = getOrCreateMetadata(t);

            // Suppress notifications during mutating methods (push, splice, etc.)
            // The method wrapper in the get trap handles notification after completion.
            if (meta.isMutating) return Reflect.set(t, key, value, receiver);

            const oldValue = Reflect.get(t, key, receiver);
            if (oldValue === value) return true;

            const success = Reflect.set(t, key, value, receiver);
            if (!success) return false;

            // Handle direct length assignment: arr.length = 1
            if (key === "length") {
                notifyRoots(t, ["length"], oldValue, value, "length", "array", "array");
                return true;
            }

            // Handle direct index assignment: arr[0] = newValue
            const indexKey = isNaN(Number(key)) ? key : Number(key);
            const rawOld = oldValue && (oldValue as any)[RAW_TARGET] || oldValue;
            const rawNew = value && (value as any)[RAW_TARGET] || value;
            updateParentLink(t, -1, rawOld, rawNew);
            notifyRoots(t, [indexKey], oldValue, value, "set", "array", "array");

            return true;
        },

        // DELETE TRAP: Intercepts `delete arr[index]`.
        // Why: Element deletion needs change notification.
        deleteProperty(t, key) {
            if (typeof key === "symbol") return Reflect.deleteProperty(t, key);

            const meta = getOrCreateMetadata(t);
            if (meta.isMutating) return Reflect.deleteProperty(t, key);

            if (!Reflect.has(t, key)) return true;

            const oldValue = Reflect.get(t, key);
            const success = Reflect.deleteProperty(t, key);
            if (!success) return false;

            const indexKey = isNaN(Number(key)) ? key : Number(key);
            const rawOld = oldValue && (oldValue as any)[RAW_TARGET] || oldValue;
            updateParentLink(t, -1, rawOld, null);
            notifyRoots(t, [indexKey], oldValue, undefined, "delete", "array", "array");

            return true;
        },
    });
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 9: AcReactivity — Public API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// The only public class. Has a single static method: makeReactive().
//
// LIFECYCLE:
//   1. Resolve getter/setter dependencies (which properties does a getter read from?)
//   2. Store root metadata (tracked properties, onChange, batch, dependencies)
//   3. Install getter/setter on each root-level property via Object.defineProperty
//   4. Each getter lazily wraps object/array values in reactive Proxies
//   5. Each setter uses an AcSignal to detect and notify changes
//

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
        //
        // For each tracked property that is a getter, find which other
        // properties it references (e.g. `get count() { return this.list.length }` → depends on "list").
        // These dependencies are stored so that when "list" changes, we also emit a change for "count".

        const allPropertiesSet = new Set<string>(properties);
        const dependenciesMap = new Map<string, Set<string>>();
        const queue = [...properties];
        const processed = new Set<string>();

        while (queue.length > 0) {
            const currentProp = queue.shift()!;
            if (processed.has(currentProp)) continue;
            processed.add(currentProp);

            // Navigate to the object that owns this property
            const segments = currentProp.split(".");
            let targetObj = rawInstance;
            let pathSegments: string[] = [];
            let stop = false;
            for (let i = 0; i < segments.length - 1; i++) {
                if (targetObj) {
                    pathSegments.push(segments[i]);
                    targetObj = targetObj[segments[i]];
                    // Stop if we hit an array or non-reactive object — can't resolve deeper
                    if (targetObj && (Array.isArray(targetObj) || !canBeReactive(targetObj))) {
                        stop = true;
                        break;
                    }
                }
            }

            if (stop) {
                // Truncate the path and register dependency from the truncated path to the full path
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

            // Check if this property is a getter/setter and find its dependencies
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
                // Don't override getters/setters that have dependencies — their dependencies
                // are tracked instead, and they are re-evaluated when dependencies change.
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
 *   - Emits change notifications on write
 *   - Preserves original getters/setters if the property was already an accessor
 *
 * @param instance - The raw (unwrapped) root instance
 * @param key - The property name to make reactive
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
        if (!descriptor.configurable) return; // Can't redefine non-configurable properties
        if (!originalGet) initialValue = descriptor.value;
    }

    // Create a signal to track the current value and detect changes.
    // The signal's onChange fires whenever the value actually changes.
    const signal = new AcSignal(
        originalGet ? undefined : initialValue,
        (newValue: any, oldValue: any) => {
            // Update parent links when the value changes
            const rawOld = oldValue && (oldValue as any)[RAW_TARGET] || oldValue;
            const rawNew = newValue && (newValue as any)[RAW_TARGET] || newValue;
            updateParentLink(instance, key, rawOld, rawNew);

            // Emit change for this root
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

            // Also notify any other roots that contain this instance as a nested object
            const roots = findRoots(instance, [key]);
            for (const r of roots) {
                if (r.root === instance) continue; // Already handled above
                if (isTrackedPath(r.rootMetadata.properties, r.segments)) {
                    emitChange(r.root, r.rootMetadata, {
                        property: r.segments.join("."),
                        rootProperty: r.rootProperty,
                        oldValue,
                        newValue,
                        target: instance,
                        timestamp: Date.now(),
                        type: getReactiveValueType(newValue),
                        operation: "set",
                        context: r.segments.length > 1 ? "object" : "root",
                    });
                }
            }
        },
    );

    // If the initial value is an object, establish parent link right away
    if (initialValue && typeof initialValue === "object") {
        const rawInit = initialValue[RAW_TARGET] || initialValue;
        updateParentLink(instance, key, null, rawInit);
    }

    // Replace the property with a reactive getter/setter
    Object.defineProperty(instance, key, {
        configurable: true,
        enumerable: descriptor ? descriptor.enumerable : true,

        get() {
            let currentVal: any;
            if (originalGet) {
                // Preserve original getter — call it and sync the signal
                currentVal = originalGet.call(this);
                signal._value = currentVal;
            } else {
                currentVal = signal.get();
            }

            // Lazily wrap object/array values in a reactive Proxy
            if (currentVal && canBeReactive(currentVal)) {
                const rawVal = currentVal[RAW_TARGET] || currentVal;
                updateParentLink(this, key, null, rawVal);
                return getOrCreateProxy(rawVal);
            }

            return currentVal;
        },

        set(value) {
            if (originalSet) {
                // Preserve original setter — call it, then sync signal with actual value
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
