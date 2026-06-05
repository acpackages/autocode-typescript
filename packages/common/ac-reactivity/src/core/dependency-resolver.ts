// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ac-reactivity — Getter/Setter Dependency Resolver
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// PURPOSE:
//   When a property is a getter (e.g. `get total() { return this.list.length; }`),
//   we need to know which other properties it reads from so that changes to those
//   dependencies also trigger a change notification for the getter.
//
// HOW IT WORKS:
//   We convert the getter/setter function to its source string and use regex
//   to find all `this.someProperty` references. This is a static analysis
//   heuristic — it doesn't execute the function.
//
// LIMITATIONS:
//   - Only detects direct property access patterns (this.x, this['x'], destructuring)
//   - Cannot detect computed property access (this[someVariable])
//   - Cannot detect properties accessed through function calls
//

/**
 * Check if a property on an object (or its prototype chain) is defined as a getter or setter.
 */
export function isGetterOrSetter(instance: any, property: string): boolean {
    let proto = instance;
    while (proto) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, property);
        if (descriptor && (descriptor.get || descriptor.set)) {
            return true;
        }
        proto = Object.getPrototypeOf(proto);
    }
    return false;
}

/**
 * Find all property names that a getter/setter reads from.
 *
 * Walks the prototype chain to find the property descriptor, then extracts
 * referenced properties from the getter and setter source code.
 *
 * @returns Array of dot-separated property paths (e.g. ["list", "name.first"])
 */
export function findGetterSetterDependencies(instance: any, property: string): string[] {
    // Walk prototype chain to find the descriptor
    let proto = instance;
    let descriptor: PropertyDescriptor | undefined;
    while (proto) {
        descriptor = Object.getOwnPropertyDescriptor(proto, property);
        if (descriptor) break;
        proto = Object.getPrototypeOf(proto);
    }

    if (!descriptor) return [];

    const deps = new Set<string>();
    if (descriptor.get) {
        for (const dep of extractReferencedProperties(descriptor.get)) {
            deps.add(dep);
        }
    }
    if (descriptor.set) {
        for (const dep of extractReferencedProperties(descriptor.set)) {
            deps.add(dep);
        }
    }
    return Array.from(deps);
}

/**
 * Extract property names referenced via `this` from a function's source code.
 *
 * Detects three patterns:
 * 1. Dot access:       this.propName  or  self.propName.nested
 * 2. Bracket access:   this['propName']  or  this["propName"]
 * 3. Destructuring:    const { propA, propB } = this
 *
 * Also tracks local aliases of `this` (e.g. `const self = this`).
 */
export function extractReferencedProperties(fn: Function): string[] {
    const code = fn.toString();
    const deps = new Set<string>();

    // Step 1: Find all local aliases for `this` (e.g. `const self = this`)
    const aliasRegex = /\b(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*this\b/g;
    const aliases = new Set<string>(["this"]);
    let match;
    while ((match = aliasRegex.exec(code)) !== null) {
        aliases.add(match[1]);
    }

    // Step 2: For each alias (including `this`), find property references
    for (const alias of aliases) {
        // Pattern 1: Dot access — alias.prop or alias.prop.nested
        const dotRegex = new RegExp(`\\b${alias}\\.([a-zA-Z_$][a-zA-Z0-9_$]*(?:\\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)`, "g");
        while ((match = dotRegex.exec(code)) !== null) {
            deps.add(match[1]);
        }

        // Pattern 2: Bracket access — alias['prop'] or alias["prop"]
        const bracketRegex = new RegExp(`\\b${alias}\\s*\\[\\s*['"\`]([a-zA-Z_$][a-zA-Z0-9_$]*)['"\`](?:\\s*\\]|\\s*\\.\\s*([a-zA-Z_$][a-zA-Z0-9_$]*(?:\\.[a-zA-Z_$][a-zA-Z0-9_$]*)*))`, "g");
        while ((match = bracketRegex.exec(code)) !== null) {
            if (match[2]) {
                deps.add(`${match[1]}.${match[2]}`);
            } else {
                deps.add(match[1]);
            }
        }

        // Pattern 3: Destructuring — const { propA, propB } = alias
        const destructureRegex = new RegExp(`\\b(?:const|let|var)\\s*\\{\\s*([^}]+)\\s*\\}\\s*=\\s*${alias}\\b`, "g");
        while ((match = destructureRegex.exec(code)) !== null) {
            const parts = match[1].split(",");
            for (const part of parts) {
                const trimmed = part.trim();
                if (!trimmed) continue;
                // Handle renaming: `propName: localName` — we want propName
                const namePart = trimmed.split(":")[0].trim();
                if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(namePart)) {
                    deps.add(namePart);
                }
            }
        }
    }

    return Array.from(deps);
}
