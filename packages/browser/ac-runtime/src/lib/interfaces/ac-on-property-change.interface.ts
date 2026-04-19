import { IAcChangeArgs } from "./ac-change-args.interface";

export interface IAcOnPropertyChange {
    acOnPropertyChange(change: IAcChangeArgs): void;
}
