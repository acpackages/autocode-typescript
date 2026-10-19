import { AcDatagridApi } from "../core/ac-datagrid-api";
import { IAcDatagridColumn } from "../interfaces/ac-datagrid-column.interface";
import { IAcDatagridRow } from "../interfaces/ac-datagrid-row.interface";
import {
  IAcDatagridBaseExportParams,
  IAcDatagridCsvExportParams,
  IAcDatagridExcelExportParams
} from "../interfaces/export/ac-datagrid-export-params.interface";
import { AcEnumDatagridColumnDataType } from "../enums/ac-enum-datagrid-column-data-type.enum";
import {
  AcCsvExportService,
  AcExcelExportService,
  AcExportDataType,
  IAcDataManagerColExportDef
} from "@autocode-ts/ac-data-manager-export";
import { acResolveCellValue } from "./ac-datagrid-value-helper";
import * as XLSX from "xlsx";

export class AcDatagridExportHelper {
  /**
   * Resolves columns to be included in export based on columnKeys, allColumns, or visibility.
   */
  static resolveColumns(api: AcDatagridApi, params?: IAcDatagridBaseExportParams): IAcDatagridColumn[] {
    const allCols = api.datagridColumns;
    if (!allCols || allCols.length === 0) {
      return [];
    }

    // Helper to check if a column is a standard data column (not internal selection/drag/rownumber)
    const isDataColumn = (col: IAcDatagridColumn): boolean => {
      if (!col) return false;
      const key = col.columnKey || col.columnDefinition?.field || '';
      if (key === '__ac_row_selection__' || key === '__ac_row_dragging__' || key === '__ac_row_number__') {
        return false;
      }
      return !!(col.columnDefinition?.field || col.columnKey || col.columnDefinition?.valueGetter);
    };

    if (params?.columnKeys && params.columnKeys.length > 0) {
      const resolved: IAcDatagridColumn[] = [];
      for (const keyOrCol of params.columnKeys) {
        if (typeof keyOrCol === 'string') {
          const found = allCols.find(c => c.columnDefinition?.field === keyOrCol || c.columnKey === keyOrCol);
          if (found) {
            resolved.push(found);
          }
        } else if (keyOrCol && typeof keyOrCol === 'object') {
          resolved.push(keyOrCol);
        }
      }
      return resolved;
    }

    if (params?.allColumns === true) {
      return allCols.filter(isDataColumn);
    }

    return allCols.filter(col => isDataColumn(col) && col.visible !== false);
  }

  /**
   * Resolves all rows to be exported by querying the dataManager for the full dataset
   * matching current sort and filter criteria before generation.
   */
  static async resolveRows(api: AcDatagridApi, params?: IAcDatagridBaseExportParams): Promise<IAcDatagridRow[]> {
    let rows: IAcDatagridRow[] = [];

    if (params?.onlySelected === true || params?.exportedRows === 'selected') {
      if (api.getSelectedRows) {
        rows = api.getSelectedRows();
      } else if (api.dataManager?.allRows) {
        rows = (api.dataManager.allRows as IAcDatagridRow[]).filter(r => api.selectedRowIds?.has(r.rowId));
      }
    } else if (params?.exportedRows === 'all') {
      if (api.dataManager?.allRows && api.dataManager.allRows.length > 0) {
        rows = api.dataManager.allRows as IAcDatagridRow[];
      } else if (api.dataManager) {
        rows = await api.dataManager.getRows({ startIndex: 0, rowsCount: api.dataManager.totalRows });
      } else {
        rows = api.datagridRows || [];
      }
    } else {
      // Default: filteredAndSorted across all pages/records
      if (api.dataManager) {
        const totalRows = api.dataManager.totalRows;
        if (totalRows > 0) {
          rows = await api.dataManager.getRows({ startIndex: 0, rowsCount: totalRows });
        } else if (api.dataManager.rows && api.dataManager.rows.length > 0) {
          rows = api.dataManager.rows as IAcDatagridRow[];
        } else {
          rows = api.datagridRows || [];
        }
      } else {
        rows = api.datagridRows || [];
      }
    }

    if (params?.shouldRowBeSkipped) {
      rows = rows.filter(row => !params.shouldRowBeSkipped!({ node: row, api }));
    }

    return rows;
  }

  /**
   * Maps datagrid column data type to AcExportDataType.
   */
  static mapColumnDataType(dataType?: AcEnumDatagridColumnDataType): AcExportDataType | undefined {
    switch (dataType) {
      case AcEnumDatagridColumnDataType.Boolean:
        return AcExportDataType.Boolean;
      case AcEnumDatagridColumnDataType.Date:
        return AcExportDataType.Date;
      case AcEnumDatagridColumnDataType.Datetime:
        return AcExportDataType.DateTime;
      case AcEnumDatagridColumnDataType.Number:
        return AcExportDataType.Number;
      case AcEnumDatagridColumnDataType.String:
        return AcExportDataType.Text;
      default:
        return undefined;
    }
  }

  /**
   * Converts columns into export definition objects for formatting.
   */
  static toColExportDefs(columns: IAcDatagridColumn[]): IAcDataManagerColExportDef[] {
    return columns.map(col => ({
      title: col.title || col.columnDefinition?.field || col.columnKey || '',
      field: col.columnDefinition?.field || col.columnKey,
      type: this.mapColumnDataType(col.dataType),
      format: col.columnDefinition?.format
    }));
  }

  /**
   * Builds the 2D table matrix (headers, rows, custom content).
   */
  static buildTableMatrix(
    api: AcDatagridApi,
    columns: IAcDatagridColumn[],
    rows: IAcDatagridRow[],
    params?: IAcDatagridBaseExportParams
  ): any[][] {
    const table: any[][] = [];

    // Prepend Content
    if (params?.prependContent) {
      if (Array.isArray(params.prependContent)) {
        for (const row of params.prependContent) {
          table.push(Array.isArray(row) ? row : [row]);
        }
      } else if (typeof params.prependContent === 'string') {
        const lines = params.prependContent.split(/\r?\n/);
        for (const line of lines) {
          table.push([line]);
        }
      }
    }

    // Column Headers
    if (!params?.skipColumnHeaders) {
      const headerRow: any[] = [];
      for (const col of columns) {
        if (params?.processHeaderCallback) {
          headerRow.push(params.processHeaderCallback({ column: col, api }));
        } else {
          headerRow.push(col.title ?? col.columnDefinition?.field ?? col.columnKey ?? '');
        }
      }
      table.push(headerRow);
    }

    // Data Rows
    for (const row of rows) {
      if ((row as any).isGroupHeader && params?.processRowGroupCallback) {
        const groupText = params.processRowGroupCallback({ node: row, api });
        table.push([groupText]);
        continue;
      }

      const tableRow: any[] = [];

      for (const col of columns) {
        const { rawValue, formattedValue } = acResolveCellValue({
          row,
          column: col,
          datagridApi: api
        });

        let value = (typeof col.columnDefinition?.valueFormatter === 'function')
          ? formattedValue
          : rawValue;

        if (params?.processCellCallback) {
          value = params.processCellCallback({
            value,
            node: row,
            column: col,
            api
          });
        }

        tableRow.push(value);
      }
      table.push(tableRow);
    }

    // Append Content
    if (params?.appendContent) {
      if (Array.isArray(params.appendContent)) {
        for (const row of params.appendContent) {
          table.push(Array.isArray(row) ? row : [row]);
        }
      } else if (typeof params.appendContent === 'string') {
        const lines = params.appendContent.split(/\r?\n/);
        for (const line of lines) {
          table.push([line]);
        }
      }
    }

    return table;
  }

  /**
   * Generates a CSV string representation of the grid after retrieving all rows.
   */
  static async getDataAsCsv(api: AcDatagridApi, params?: IAcDatagridCsvExportParams): Promise<string> {
    const columns = this.resolveColumns(api, params);
    const rows = await this.resolveRows(api, params);
    const table = this.buildTableMatrix(api, columns, rows, params);
    return AcCsvExportService.tableToCsv(table, {
      columnSeparator: params?.columnSeparator ?? ',',
      suppressQuotes: params?.suppressQuotes ?? false,
      useBom: params?.useBom !== false,
      lineSeparator: params?.lineSeparator ?? '\r\n'
    });
  }

  /**
   * Generates an Excel XLSX Workbook of the grid after retrieving all rows.
   */
  static async getWorkbook(api: AcDatagridApi, params?: IAcDatagridExcelExportParams): Promise<XLSX.WorkBook> {
    const columns = this.resolveColumns(api, params);
    const rows = await this.resolveRows(api, params);
    const table = this.buildTableMatrix(api, columns, rows, params);
    const colDefs = this.toColExportDefs(columns);

    return AcExcelExportService.createWorkbook({
      table,
      columns: colDefs,
      sheetName: params?.sheetName || "Sheet1",
      autoSizeColumns: params?.autoSizeColumns !== false
    });
  }

  /**
   * Generates an Excel XLSX Blob of the grid after retrieving all rows.
   */
  static async getDataAsExcel(api: AcDatagridApi, params?: IAcDatagridExcelExportParams): Promise<Blob> {
    const workbook = await this.getWorkbook(api, params);
    return AcExcelExportService.toBlob(workbook, 'xlsx');
  }
}
