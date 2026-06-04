import { IAcReactivePropertyTree } from "./ac-reactive-property-tree.interface";
import { IAcReactiveChange } from "./ac-reactive-change.interface";

export interface IAcMakeReactiveOptions<T> {
    instance: T;
    properties: IAcReactivePropertyTree;
    onChange: (change: IAcReactiveChange) => void;
    batch?: boolean;
}
