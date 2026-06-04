import { AcReactiveValueType } from "../types/ac-reactive-value-type.type";
import { AcReactiveOperation } from "../types/ac-reactive-operation.type";

export interface IAcReactiveChange {
    property: string;
    rootProperty: string;
    oldValue: unknown;
    newValue: unknown;
    target: unknown;
    timestamp: number;
    type: AcReactiveValueType;
    operation: AcReactiveOperation;
}
