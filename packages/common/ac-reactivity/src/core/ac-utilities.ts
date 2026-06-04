import { IAcReactiveChange } from "../interfaces/ac-reactive-change.interface";
import { IRootMetadata, metadataStore, RAW_TARGET, AcMetadataStore } from "./ac-metadata-store";
import { AcReactiveValueType } from "../types/ac-reactive-value-type.type";
import { AcBatchScheduler } from "./ac-batch-scheduler";

export interface IPathInfo {
    readonly root: object;
    readonly rootMetadata: IRootMetadata;
    readonly segments: (string | number)[];
    readonly rootProperty: string;
}

export function getReactiveValueType(options: { value: unknown }): AcReactiveValueType {
    const { value } = options;
    if (Array.isArray(value)) {
        return "array";
    }
    if (value !== null && typeof value === "object") {
        return "object";
    }
    return "primitive";
}

export function addParent(options: { target: object; parent: object; key: string | number }): void {
    const { target, parent, key } = options;
    const meta = AcMetadataStore.getOrCreate({ target });
    const exists = meta.parents.some(p => p.parent === parent && p.key === key);
    if (!exists) {
        meta.parents.push({ parent, key });
    }
}

export function removeParent(options: { target: object; parent: object; key: string | number }): void {
    const { target, parent, key } = options;
    const meta = metadataStore.get(target);
    if (meta) {
        meta.parents = meta.parents.filter(p => !(p.parent === parent && p.key === key));
    }
}

export function updateParentLink(options: {
    parent: object;
    key: string | number;
    oldValue: unknown;
    newValue: unknown;
}): void {
    const { parent, key, oldValue, newValue } = options;
    if (oldValue === newValue) return;

    if (oldValue && (typeof oldValue === "object" || typeof oldValue === "function")) {
        const rawOld = (oldValue as any)[RAW_TARGET] || oldValue;
        removeParent({ target: rawOld, parent, key });
    }

    if (newValue && (typeof newValue === "object" || typeof newValue === "function")) {
        const rawNew = (newValue as any)[RAW_TARGET] || newValue;
        addParent({ target: rawNew, parent, key });
    }
}

export function findRoots(options: {
    target: object;
    currentPath?: (string | number)[];
    visited?: Set<object>;
}): IPathInfo[] {
    const { target, currentPath = [], visited = new Set<object>() } = options;
    const results: IPathInfo[] = [];

    if (visited.has(target)) {
        return results;
    }
    visited.add(target);

    const meta = metadataStore.get(target);
    if (!meta) return results;

    if (meta.root) {
        const segments = currentPath.slice().reverse();
        const rootProperty = String(segments[0] || "");
        results.push({
            root: target,
            rootMetadata: meta.root,
            segments,
            rootProperty
        });
    }

    for (const link of meta.parents) {
        let key = link.key;
        if (key === -1 && Array.isArray(link.parent)) {
            const index = link.parent.indexOf(target);
            if (index !== -1) {
                key = index;
            }
        }
        currentPath.push(key);
        results.push(...findRoots({ target: link.parent, currentPath, visited }));
        currentPath.pop();
    }

    visited.delete(target);
    return results;
}

export function emitChange(options: {
    root: object;
    rootMetadata: IRootMetadata;
    change: IAcReactiveChange;
}): void {
    const { root, rootMetadata, change } = options;
    if (rootMetadata.batch) {
        AcBatchScheduler.schedule({ root, rootMetadata, change });
    } else {
        rootMetadata.onChange(change);
    }
}
