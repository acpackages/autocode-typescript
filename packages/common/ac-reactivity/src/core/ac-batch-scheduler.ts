import { IAcReactiveChange } from "../interfaces/ac-reactive-change.interface";
import { metadataStore } from "./ac-metadata-store";


export class AcBatchScheduler {
    private static readonly _pendingRoots = new Set<object>();
    private static _isMicrotaskScheduled = false;

    public static schedule(options: {
        root: object;
        rootMetadata: any;
        change: IAcReactiveChange;
    }): void {
        const { root, rootMetadata, change } = options;

        if (!rootMetadata.pendingChanges) {
            rootMetadata.pendingChanges = new Map<string, IAcReactiveChange>();
        }

        const pending = rootMetadata.pendingChanges;
        const existing = pending.get(change.property);

        if (existing) {
            existing.newValue = change.newValue;
            existing.timestamp = change.timestamp;
            existing.type = change.type;
            existing.operation = change.operation;
        } else {
            pending.set(change.property, { ...change });
        }

        AcBatchScheduler._pendingRoots.add(root);

        if (!AcBatchScheduler._isMicrotaskScheduled) {
            AcBatchScheduler._isMicrotaskScheduled = true;
            queueMicrotask(() => {
                AcBatchScheduler._flush();
            });
        }
    }

    private static _flush(): void {
        AcBatchScheduler._isMicrotaskScheduled = false;
        const roots = Array.from(AcBatchScheduler._pendingRoots);
        AcBatchScheduler._pendingRoots.clear();

        for (const root of roots) {
            const meta = metadataStore.get(root);
            if (!meta || !meta.root || !meta.root.pendingChanges) {
                continue;
            }

            const rootMeta = meta.root;
            const pending = rootMeta.pendingChanges;
            if (pending) {
                rootMeta.pendingChanges = undefined;
                for (const change of pending.values()) {
                    if (change.type === "array" || change.newValue !== change.oldValue) {
                        rootMeta.onChange(change);
                    }
                }
            }
        }
    }
}
