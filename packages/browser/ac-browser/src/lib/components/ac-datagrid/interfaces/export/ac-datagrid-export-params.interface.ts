import { AcDatagridApi } from "../../core/ac-datagrid-api";
import { IAcDatagridColumn } from "../ac-datagrid-column.interface";
import { IAcDatagridRow } from "../ac-datagrid-row.interface";

export type AcDatagridExportedRowsMode = 'filteredAndSorted' | 'all' | 'selected';

export interface IAcDatagridShouldRowBeSkippedParams {
  node: IAcDatagridRow;
  api: AcDatagridApi;
}

export interface IAcDatagridProcessCellForExportParams {
  value: any;
  node: IAcDatagridRow;
  column: IAcDatagridColumn;
  api: AcDatagridApi;
}

export interface IAcDatagridProcessHeaderForExportParams {
  column: IAcDatagridColumn;
  api: AcDatagridApi;
}

export interface IAcDatagridProcessGroupHeaderForExportParams {
  columnGroup: any;
  api: AcDatagridApi;
}

export interface IAcDatagridProcessRowGroupForExportParams {
  node: IAcDatagridRow;
  api: AcDatagridApi;
}

export interface IAcDatagridBaseExportParams {
  fileName?: string;
  allColumns?: boolean;
  columnKeys?: (string | IAcDatagridColumn)[];
  onlySelected?: boolean;
  onlySelectedAllPages?: boolean;
  exportedRows?: AcDatagridExportedRowsMode;
  skipColumnHeaders?: boolean;
  skipColumnGroupHeaders?: boolean;
  skipPinnedTop?: boolean;
  skipPinnedBottom?: boolean;
  shouldRowBeSkipped?: (params: IAcDatagridShouldRowBeSkippedParams) => boolean;
  processCellCallback?: (params: IAcDatagridProcessCellForExportParams) => any;
  processHeaderCallback?: (params: IAcDatagridProcessHeaderForExportParams) => string;
  processGroupHeaderCallback?: (params: IAcDatagridProcessGroupHeaderForExportParams) => string;
  processRowGroupCallback?: (params: IAcDatagridProcessRowGroupForExportParams) => string;
  prependContent?: string | any[][];
  appendContent?: string | any[][];
}

export interface IAcDatagridCsvExportParams extends IAcDatagridBaseExportParams {
  columnSeparator?: string;
  suppressQuotes?: boolean;
  useBom?: boolean;
  lineSeparator?: string;
}

export interface IAcDatagridExcelStyle {
  id: string;
  alignment?: {
    horizontal?: 'left' | 'center' | 'right' | 'fill' | 'justify';
    vertical?: 'top' | 'center' | 'bottom';
    wrapText?: boolean;
  };
  font?: {
    bold?: boolean;
    color?: string;
    fontName?: string;
    italic?: boolean;
    size?: number;
    strikeThrough?: boolean;
    underline?: boolean;
  };
  interior?: {
    color?: string;
    pattern?: 'solid' | 'none';
  };
  numberFormat?: {
    formatCode?: string;
  };
}

export interface IAcDatagridExcelExportParams extends IAcDatagridBaseExportParams {
  sheetName?: string;
  author?: string;
  autoSizeColumns?: boolean;
  headerRowHeight?: number;
  rowHeight?: number;
  excelStyles?: IAcDatagridExcelStyle[];
}

export interface IAcDatagridExcelSheetExportDef {
  sheetName: string;
  api: AcDatagridApi;
  params?: IAcDatagridExcelExportParams;
}

export interface IAcDatagridExcelExportMultipleSheetsParams {
  fileName?: string;
  sheets: IAcDatagridExcelSheetExportDef[];
}
