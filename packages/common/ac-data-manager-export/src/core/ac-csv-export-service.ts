import { IAcCsvExportOptions } from "../interfaces/ac-csv-export-options.interface";

export class AcCsvExportService {
  /**
   * Formats a single cell value for CSV following RFC 4180 rules.
   */
  static formatCell(value: any, separator: string = ',', suppressQuotes: boolean = false): string {
    if (value === null || value === undefined) {
      return '';
    }

    let str: string;
    if (value instanceof Date) {
      str = value.toISOString();
    } else if (typeof value === 'object') {
      try {
        str = JSON.stringify(value);
      } catch {
        str = String(value);
      }
    } else {
      str = String(value);
    }

    const containsSpecialChars =
      str.includes(separator) ||
      str.includes('"') ||
      str.includes('\n') ||
      str.includes('\r');

    if (containsSpecialChars) {
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    }

    if (!suppressQuotes && (str.startsWith(' ') || str.endsWith(' '))) {
      return `"${str}"`;
    }

    return str;
  }

  /**
   * Converts a 2D matrix (rows and columns) into a standard CSV formatted string.
   */
  static tableToCsv(table: any[][], options?: IAcCsvExportOptions): string {
    if (!table || table.length === 0) {
      return (options?.useBom !== false) ? '\uFEFF' : '';
    }

    const separator = options?.columnSeparator ?? ',';
    const suppressQuotes = options?.suppressQuotes ?? false;
    const lineSeparator = options?.lineSeparator ?? '\r\n';
    const useBom = options?.useBom !== false;

    const rowStrings = table.map(row => {
      if (!row || !Array.isArray(row)) {
        return '';
      }
      return row.map(cell => this.formatCell(cell, separator, suppressQuotes)).join(separator);
    });

    const body = rowStrings.join(lineSeparator);
    return useBom ? `\uFEFF${body}` : body;
  }

  /**
   * Creates a Blob from a 2D matrix formatted as CSV.
   */
  static tableToBlob(table: any[][], options?: IAcCsvExportOptions): Blob {
    const csvString = this.tableToCsv(table, options);
    return new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  }
}
