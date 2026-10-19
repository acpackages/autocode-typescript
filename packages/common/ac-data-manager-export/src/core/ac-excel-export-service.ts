import * as XLSX from "xlsx";
import { IAcDataManagerColExportDef } from "../interfaces/ac-data-manager-col-export-def.interface";
import { IAcExcelSheetExportDef, IAcExcelExportOptions } from "../interfaces/ac-excel-export-options.interface";
import { AcExportDataType } from "../enums/ac-export-data-type.enum";

export class AcExcelExportService {
  /**
   * Builds an XLSX Worksheet from a 2D table and optional column definitions.
   */
  static tableToWorksheet({
    table,
    columns,
    autoSizeColumns = true
  }: {
    table: any[][];
    columns?: IAcDataManagerColExportDef[];
    autoSizeColumns?: boolean;
  }): XLSX.WorkSheet {
    const worksheet = XLSX.utils.aoa_to_sheet(table, { cellDates: true });

    if (columns && columns.length > 0) {
      this.applyFormatting(worksheet, columns);
    }

    if (autoSizeColumns && table.length > 0) {
      worksheet['!cols'] = this.calculateColumnWidths(table, columns);
    }

    return worksheet;
  }

  /**
   * Creates an XLSX WorkBook with a single worksheet.
   */
  static createWorkbook({
    table,
    columns,
    sheetName = "Sheet1",
    autoSizeColumns = true
  }: {
    table: any[][];
    columns?: IAcDataManagerColExportDef[];
    sheetName?: string;
    autoSizeColumns?: boolean;
  }): XLSX.WorkBook {
    const worksheet = this.tableToWorksheet({ table, columns, autoSizeColumns });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || "Sheet1");
    return workbook;
  }

  /**
   * Creates an XLSX WorkBook containing multiple sheets.
   */
  static createMultiSheetWorkbook(
    sheets: IAcExcelSheetExportDef[],
    options?: IAcExcelExportOptions
  ): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();

    if (options?.author) {
      workbook.Props = {
        Author: options.author
      };
    }

    const usedSheetNames = new Set<string>();

    for (const sheetDef of sheets) {
      let sheetName = sheetDef.sheetName || "Sheet";
      let counter = 1;
      while (usedSheetNames.has(sheetName)) {
        sheetName = `${sheetDef.sheetName || "Sheet"} (${counter++})`;
      }
      usedSheetNames.add(sheetName);

      const worksheet = this.tableToWorksheet({
        table: sheetDef.table,
        columns: sheetDef.columns,
        autoSizeColumns: sheetDef.autoSizeColumns ?? options?.autoSizeColumns ?? true
      });

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    return workbook;
  }

  /**
   * Converts an XLSX WorkBook into a Blob for browser downloading or transfer.
   */
  static toBlob(workbook: XLSX.WorkBook, bookType: XLSX.BookType = 'xlsx'): Blob {
    const buffer = XLSX.write(workbook, { bookType, type: 'array' });
    const mimeType = bookType === 'csv'
      ? 'text/csv;charset=utf-8;'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    return new Blob([buffer], { type: mimeType });
  }

  /**
   * Calculates reasonable column widths based on maximum character length.
   */
  static calculateColumnWidths(table: any[][], columns?: IAcDataManagerColExportDef[]): { wch: number }[] {
    const maxCols = Math.max(...table.map(r => (r ? r.length : 0)), columns?.length ?? 0);
    const colWidths: number[] = new Array(maxCols).fill(10);

    // Initial check from column titles
    if (columns) {
      columns.forEach((col, idx) => {
        if (col && col.title) {
          colWidths[idx] = Math.max(colWidths[idx], String(col.title).length + 3);
        }
      });
    }

    // Measure cell content
    for (const row of table) {
      if (!row || !Array.isArray(row)) continue;
      for (let c = 0; c < row.length; c++) {
        const val = row[c];
        if (val !== null && val !== undefined) {
          const len = String(val).length;
          colWidths[c] = Math.max(colWidths[c], len + 2);
        }
      }
    }

    // Constrain width between 8 and 60 characters
    return colWidths.map(w => ({ wch: Math.min(Math.max(w, 8), 60) }));
  }

  /**
   * Applies data types and number formatting to cells based on column definitions.
   */
  static applyFormatting(worksheet: XLSX.WorkSheet, columns: IAcDataManagerColExportDef[]): void {
    const ref = worksheet['!ref'];
    if (!ref) return;

    const range = XLSX.utils.decode_range(ref);
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const colDef = columns[C];
        if (!colDef) continue;

        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (!cell) continue;

        let numFmt = colDef.format;
        if (!numFmt && colDef.type !== undefined) {
          switch (colDef.type) {
            case AcExportDataType.Number:
              numFmt = '#,##0.00';
              break;
            case AcExportDataType.Currency:
              numFmt = '$#,##0.00';
              break;
            case AcExportDataType.Percentage:
              numFmt = '0.00%';
              break;
            case AcExportDataType.Date:
              numFmt = 'yyyy-mm-dd';
              if (cell.v instanceof Date) {
                cell.t = 'd';
              }
              break;
            case AcExportDataType.DateTime:
              numFmt = 'yyyy-mm-dd hh:mm:ss';
              if (cell.v instanceof Date) {
                cell.t = 'd';
              }
              break;
            case AcExportDataType.Time:
              numFmt = 'hh:mm:ss';
              break;
            case AcExportDataType.Boolean:
              cell.t = 'b';
              break;
            case AcExportDataType.Text:
              cell.t = 's';
              break;
          }
        }

        if (numFmt) {
          cell.z = numFmt;
        }
      }
    }
  }
}
