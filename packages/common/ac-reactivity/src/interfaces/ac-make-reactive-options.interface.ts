import { IAcReactiveChange } from "./ac-reactive-change.interface";

export interface IAcMakeReactiveOptions<T> {
    instance: T;
    properties: string[];
    onChange: (change: IAcReactiveChange) => void;
    batch?: boolean;
}

