import { AcExportDataType } from "../enums/ac-export-data-type.enum";

export type AcDataManagerRow = any;

export interface IAcDataManagerColExportDef {
    title: string;
    field?: string;
    type?: AcExportDataType;
    format?: string;
    valueGetter?: (row: AcDataManagerRow) => any;
    formatter?: (
        value: any,
        row: AcDataManagerRow
    ) => any;
}
