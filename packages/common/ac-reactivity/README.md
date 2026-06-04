# @autocode-ts/ac-reactivity

A production-grade, high-performance hybrid reactivity engine for the AutoCode ecosystem. 

It makes selected properties of existing class instances reactive **without** wrapping the root instance in a Proxy, preserving native performance, prototype chains, descriptor accessors, and object identities.

## Key Features

- **No Root Proxy Wrapping**: Root properties use JIT-optimized getters/setters via `Object.defineProperty` for maximum execution speed, preserving prototype inheritance and descriptors.
- **Deep Proxy Reactivity**: Automatically wraps child objects/arrays in deep lazy reactive Proxies.
- **O(1) Signal Baselines**: Internally routes primitives using an optimized `AcSignal` cell structure.
- **Runtime Type Switching**: Automatically transitions tracking rules when properties shift between primitives, objects, arrays, and null.
- **Coalesced Batching**: Uses microtask queue scheduling (`queueMicrotask`) to avoid redundant layout cycles.
- **Zero Memory Leaks**: Self-cleaning parent-child WeakMap storage prevents leaks on dynamically removed properties.

## Architecture

```
                       Class Instance (Root)
                                ↓
                     Object.defineProperty()
                     /          |          \
           [Primitive]       [Object]       [Array]
                ↓               ↓              ↓
            AcSignal         Proxy          Proxy
```

## Getting Started

### Installation

```bash
npm install @autocode-ts/ac-reactivity
```

### Basic Usage

```typescript
import { AcReactivity } from "@autocode-ts/ac-reactivity";

class UserState {
    public count = 0;
    public name = "John";
    public profile = {
        city: "New York"
    };
    public items: string[] = [];
}

const state = new UserState();

// Register reactivity
AcReactivity.makeReactive({
    instance: state,
    properties: {
        count: true,
        name: true,
        profile: {
            city: true
        },
        items: true
    },
    onChange(change) {
        console.log("Mutation detected:", change);
    },
    batch: true
});

// Mutate properties normally!
state.count = 1; // Emits primitive set change
state.profile.city = "Boston"; // Emits nested object change
state.items.push("A"); // Emits array push mutation
```

## API Reference

### `AcReactivity.makeReactive`

```typescript
static makeReactive<T>(options: IAcMakeReactiveOptions<T>): T;
```

**Options**:
- `instance`: The class instance to make reactive.
- `properties`: The compiled `IAcReactivePropertyTree` specifying which properties should be tracked.
- `onChange`: Callback function fired when mutations occur.
- `batch` (optional): Set to `true` to coalesce multiple mutations in the same event loop frame using `queueMicrotask`.
