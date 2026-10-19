import { IAcDataManagerColExportDef } from "./ac-data-manager-col-export-def.interface";

export interface IAcExcelSheetExportDef {
  sheetName: string;
  table: any[][];
  columns?: IAcDataManagerColExportDef[];
  autoSizeColumns?: boolean;
}

export interface IAcExcelExportOptions {
  author?: string;
  bookType?: 'xlsx' | 'xlsb' | 'biff8' | 'ods';
  autoSizeColumns?: boolean;
}
