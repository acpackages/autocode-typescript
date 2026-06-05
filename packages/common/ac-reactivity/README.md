# @autocode-ts/ac-reactivity

A production-grade hybrid reactivity engine for the AutoCode ecosystem.

It makes selected properties of existing class instances reactive **without** wrapping the root instance in a Proxy, preserving native performance, prototype chains, descriptor accessors, and object identities.

---

## Overview

`ac-reactivity` lets you track changes to specific properties on any object. When a tracked property (or anything nested inside it) changes, your callback fires with a detailed change event.

```typescript
import { AcReactivity } from "@autocode-ts/ac-reactivity";

const state = { count: 0, user: { name: "Alice" }, items: [1, 2] };

AcReactivity.makeReactive({
    instance: state,
    properties: ["count", "user.name", "items"],
    onChange(change) {
        console.log(`${change.property} changed:`, change.oldValue, "→", change.newValue);
    }
});

state.count = 1;           // → "count changed: 0 → 1"
state.user.name = "Bob";   // → "user.name changed: Alice → Bob"
state.items.push(3);       // → "items changed: [1,2] → [1,2,3]"
```

---

## Core Concepts

| Concept | What it is |
|---|---|
| **Reactive Instance** | Any object passed to `makeReactive()`. Properties are intercepted via `Object.defineProperty()` — the object itself is NOT wrapped in a Proxy. |
| **Signal** | An internal value cell for root-level properties. Stores the current value and detects changes. |
| **Proxy** | A `Proxy` wrapper around nested objects and arrays. Lazily created on first access. Intercepts `get`, `set`, and `delete` operations. |
| **Change Event** | An `IAcReactiveChange` object emitted to your `onChange` callback whenever a tracked property mutates. |
| **Parent Link** | An internal mapping from child object → parent object. Used to walk upward through the object tree to find reactive roots. |
| **Batching** | Optional mode that coalesces multiple changes in the same microtask into a single notification per property. |

---

## Reactivity Flow

Step-by-step lifecycle from property assignment to notification:

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. makeReactive() is called                                      │
│    ↓                                                             │
│ 2. For each root property, Object.defineProperty() installs      │
│    a getter/setter pair backed by an AcSignal                    │
│    ↓                                                             │
│ 3. When a property is READ:                                      │
│    ├─ Primitive → return value directly from AcSignal            │
│    └─ Object/Array → lazily wrap in a Proxy, cache it, return   │
│    ↓                                                             │
│ 4. When a property is WRITTEN:                                   │
│    ├─ Root property → AcSignal detects change, fires callback   │
│    └─ Nested property → Proxy set trap detects change           │
│       ↓                                                          │
│ 5. Change detected → updateParentLink() maintains the graph     │
│    ↓                                                             │
│ 6. findRoots() walks parent links upward to all reactive roots  │
│    ↓                                                             │
│ 7. isTrackedPath() checks if the path matches a tracked property│
│    ↓                                                             │
│ 8. emitChange() delivers the notification:                       │
│    ├─ batch=false → onChange() called immediately                 │
│    └─ batch=true  → queued, flushed in next microtask            │
│    ↓                                                             │
│ 9. If the changed property is a dependency of a getter,          │
│    the getter's change is also emitted                           │
└──────────────────────────────────────────────────────────────────┘
```

---

## Array Flow

Arrays are wrapped in a specialized Proxy that intercepts both direct mutations and method calls.

### Mutating Methods (push, pop, splice, etc.)

```
arr.push(item)
  ↓
Proxy GET trap intercepts "push" → returns a wrapper function
  ↓
Wrapper function:
  1. Snapshots the array (oldValue = arr.slice())
  2. Sets isMutating semaphore (suppresses per-element set trap notifications)
  3. Calls the real push()
  4. Clears semaphore
  5. Rebuilds parent links for all items
  6. Emits ONE change with operation="push"
```

### Direct Index Assignment

```
arr[0] = newValue
  ↓
Proxy SET trap:
  1. Checks isMutating (skip if inside a method call)
  2. Reads old value
  3. Sets new value via Reflect.set()
  4. Updates parent links
  5. Emits change with operation="set", context="array"
```

### Length Changes

```
arr.length = 1
  ↓
Proxy SET trap:
  1. Checks isMutating
  2. Sets length via Reflect.set()
  3. Emits change with operation="length", context="array"
```

---

## Nested Object Flow

Nested objects are tracked through parent links.

```
instance.user.address.city = "New York"
  ↓
1. instance.user → root getter returns Proxy(user)
  ↓
2. Proxy(user).address → GET trap returns Proxy(address)
  ↓
3. Proxy(address).city = "New York" → SET trap fires
  ↓
4. findRoots(addressObj, ["city"]):
   walks: address → user → instance
   builds path: ["user", "address", "city"]
  ↓
5. isTrackedPath(["user.address.city"], ["user","address","city"]) → true
  ↓
6. emitChange → onChange({ property: "user.address.city", ... })
```

---

## Signal Flow

Signals are internal value cells used for root-level properties.

```
1. makeReactive() creates one AcSignal per root property
2. The signal stores the current value
3. On write:
   - signal.set(newValue) compares with old value
   - If different, calls the onChange callback
4. On read:
   - signal.get() returns the stored value
   - If the value is an object/array, the root getter wraps it in a Proxy
5. For original getters/setters:
   - The original getter is called, and signal._value is synced
   - The original setter is called, then signal.set() is called with the result
```

---

## Change Types

Every `IAcReactiveChange` includes a `context` field indicating where the change occurred:

| Context | When |
|---|---|
| `"root"` | A root-level property was directly assigned |
| `"object"` | A property on a nested object was changed |
| `"array"` | An array was mutated (method call, index set, length change) |

And an `operation` field indicating what triggered it:

| Operation | Trigger |
|---|---|
| `"set"` | Property assignment (`obj.x = y` or `arr[i] = y`) |
| `"delete"` | Property deletion (`delete obj.x`) |
| `"push"` | `arr.push(...)` |
| `"pop"` | `arr.pop()` |
| `"shift"` | `arr.shift()` |
| `"unshift"` | `arr.unshift(...)` |
| `"splice"` | `arr.splice(...)` |
| `"sort"` | `arr.sort()` |
| `"reverse"` | `arr.reverse()` |
| `"fill"` | `arr.fill(...)` |
| `"copyWithin"` | `arr.copyWithin(...)` |
| `"length"` | Direct length assignment (`arr.length = n`) |

---

## File Structure

```
src/
├── ac-reactivity.ts              Entry point (re-exports)
└── core/
    ├── types.ts                  All interfaces and type aliases
    ├── reactivity.ts             Complete reactivity engine
    └── dependency-resolver.ts    Getter/setter dependency extraction
```

---

## API Reference

### `AcReactivity.makeReactive<T>(options): T`

Makes selected properties of an object reactive.

**Options:**
- `instance: T` — The object to make reactive
- `properties: string[]` — Dot-separated paths to track (e.g. `["name", "user.address.city"]`)
- `onChange: (change: IAcReactiveChange) => void` — Callback for changes
- `batch?: boolean` — Coalesce changes per microtask (default: `false`)

**Returns:** The same instance (not a copy or wrapper).

**Key behaviors:**
- Preserves prototype chain, `instanceof`, and method access
- Only plain objects and arrays get Proxy-wrapped — class instances are left as-is
- Getter/setter properties are preserved and their dependencies are auto-tracked
- Safe with circular references
