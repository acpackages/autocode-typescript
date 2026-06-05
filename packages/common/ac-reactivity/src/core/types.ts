// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ac-reactivity — Type Definitions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// All public and internal type definitions for the reactivity system.
// Grouped into: value types, change events, public API options, and internal metadata.
//

// ─── Value Types ──────────────────────────────────────────

/** Classifies the kind of value stored in a reactive property. */
export type AcReactiveValueType = "primitive" | "object" | "array";

/**
 * Identifies which operation caused a reactive change.
 * - "set" / "delete": standard property operations
 * - Array method names: triggered by mutating array methods
 * - "length": triggered by direct length assignment on an array
 */
export type AcReactiveOperation =
    | "set"
    | "delete"
    | "push"
    | "pop"
    | "shift"
    | "unshift"
    | "splice"
    | "sort"
    | "reverse"
    | "fill"
    | "copyWithin"
    | "length";

/** A single segment in a property path — either a string key or a numeric array index. */
export type AcPathSegmentType = string | number;

// ─── Change Event ─────────────────────────────────────────

/**
 * Emitted whenever a tracked reactive property changes.
 * This is the primary public event type that consumers receive via the onChange callback.
 */
export interface IAcReactiveChange {
    /** The full dot-separated path of the changed property (e.g. "user.address.city"). */
    property: string;
    /** The top-level root property name (e.g. "user" for path "user.address.city"). */
    rootProperty: string;
    /** The previous value before the change. */
    oldValue: unknown;
    /** The new value after the change. */
    newValue: unknown;
    /** The object that was directly mutated. */
    target: unknown;
    /** Timestamp (Date.now()) when the change was detected. */
    timestamp: number;
    /** Whether the new value is a primitive, object, or array. */
    type: AcReactiveValueType;
    /** What operation caused the change (set, delete, push, etc.). */
    operation: AcReactiveOperation;
    /** Where in the object tree the change occurred. */
    context: "root" | "object" | "array";
}

// ─── Public API Options ───────────────────────────────────

/**
 * Options for AcReactivity.makeReactive().
 * This is the only public entry point for making an instance reactive.
 */
export interface IAcMakeReactiveOptions<T> {
    /** The class instance to make reactive. */
    instance: T;
    /** Dot-separated property paths to track (e.g. ["name", "user.address.city"]). */
    properties: string[];
    /** Callback fired whenever a tracked property changes. */
    onChange: (change: IAcReactiveChange) => void;
    /** If true, coalesce multiple changes in the same microtask into one notification per property. */
    batch?: boolean;
}

// ─── Internal Metadata ────────────────────────────────────

/**
 * Tracks one parent→child relationship in the object graph.
 * Used by findRoots() to walk upward from a nested object to all reactive roots.
 * key = -1 is a special sentinel for array items (the actual index is resolved at notification time).
 */
export interface IParentLink {
    readonly parent: object;
    readonly key: string | number;
}

/**
 * Metadata stored on a reactive root instance (the object passed to makeReactive).
 * Contains the tracked property list, onChange callback, and batching state.
 */
export interface IRootMetadata {
    readonly properties: string[];
    readonly onChange: (change: IAcReactiveChange) => void;
    readonly batch: boolean;
    /** Accumulates changes during batched mode. Cleared after microtask flush. */
    pendingChanges?: Map<string, IAcReactiveChange>;
    /** Maps a dependency property path to the set of computed/getter properties that depend on it. */
    dependencies?: Map<string, Set<string>>;
}

/**
 * Per-object metadata stored in the global WeakMap.
 * Every object that participates in reactivity (root, nested object, or array) gets one of these.
 */
export interface IReactiveMetadata {
    /** Links to parent objects that contain this object as a property value. */
    parents: IParentLink[];
    /** Present only on root instances — the instance passed to makeReactive(). */
    root?: IRootMetadata;
    /** Cached proxy for this object (ensures proxy identity stability). */
    proxy?: object;
    /** Semaphore > 0 while an array mutating method (push, splice, etc.) is executing. */
    isMutating?: number;
}
