import { IAcReactiveChange } from "../interfaces/ac-reactive-change.interface";

export interface IParentLink {
    readonly parent: object;
    readonly key: string | number;
}

export interface IRootMetadata {
    readonly properties: string[];
    readonly onChange: (change: IAcReactiveChange) => void;
    readonly batch: boolean;
    pendingChanges?: Map<string, IAcReactiveChange>;
    dependencies?: Map<string, Set<string>>;
}

export interface IReactiveMetadata {
    parents: IParentLink[];
    root?: IRootMetadata;
    proxy?: object;
    isMutating?: number;
}

export const RAW_TARGET = Symbol.for("RAW_TARGET");

export const metadataStore = new WeakMap<object, IReactiveMetadata>();

export class AcMetadataStore {
    public static getOrCreate(options: { target: object }): IReactiveMetadata {
        const { target } = options;
        let meta = metadataStore.get(target);
        if (!meta) {
            meta = { parents: [] };
            metadataStore.set(target, meta);
        }
        return meta;
    }

    public static get(options: { target: object }): IReactiveMetadata | undefined {
        const { target } = options;
        return metadataStore.get(target);
    }

    public static has(options: { target: object }): boolean {
        const { target } = options;
        return metadataStore.has(target);
    }
}
