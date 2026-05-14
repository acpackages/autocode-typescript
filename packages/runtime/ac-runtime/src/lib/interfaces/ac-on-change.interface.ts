import { IAcChangeArgs } from "./ac-change-args.interface";

export interface IAcOnChange {
    acOnChange(change: IAcChangeArgs): void;
}