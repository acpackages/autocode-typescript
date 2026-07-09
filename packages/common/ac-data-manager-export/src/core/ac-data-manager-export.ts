import * as XLSX from "xlsx";
import { AcDataManager } from "@autocode-ts/autocode";
import { IAcDataManagerColExportDef } from "../interfaces/_interfaces.export";
import { AcDataManagerExportFormat } from "../enums/ac-data-manager-export-format.enum";
import { AcExportDataType } from "../enums/ac-export-data-type.enum";

export class AcDataManagerExport {
    dataManager:AcDataManager;

    constructor({dataManager}:{dataManager: AcDataManager}){
      this.dataManager = dataManager;
    }

    async toWorkbook({
        columns,
        sheetName
    }: {
        columns: IAcDataManagerColExportDef[];
        sheetName?: string;
    }): Promise<XLSX.WorkBook> {
        if (!columns || columns.length === 0) {
            throw new Error("Export columns must not be empty.");
        }
        for (const col of columns) {
            if (!col.field && !col.valueGetter) {
                throw new Error(`Column "${col.title}" must have either a field or a valueGetter.`);
            }
        }

        const table = await this.buildTable(columns);
        const worksheet = XLSX.utils.aoa_to_sheet(table, { cellDates: true });
        this.applyFormatting(worksheet, columns);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            sheetName ?? "Sheet1"
        );

        return workbook;
    }

    async export({
        columns,
        fileName,
        sheetName,
        format
    }: {
        columns: IAcDataManagerColExportDef[];
        fileName: string;
        sheetName?: string;
        format?: AcDataManagerExportFormat;
    }): Promise<void> {
        if (!fileName) {
            throw new Error("fileName must not be empty.");
        }
        const workbook =await this.toWorkbook({ columns, sheetName });
        const exportFormat = format ?? AcDataManagerExportFormat.Xlsx;
        const bookType = this.getBookType(exportFormat);

        XLSX.writeFile(
            workbook,
            `${fileName}.${bookType}`,
            {
                bookType
            }
        );
    }

    private async buildTable(columns: IAcDataManagerColExportDef[]): Promise<any[][]> {
        const table: any[][] = [];
        // Header row
        const headers = columns.map(c => c.title);
        table.push(headers);

        // Data rows
        const rows = await this.dataManager.getRows({startIndex:0,rowsCount:this.dataManager.totalRows});
        for (const row of rows) {
            const tableRow: any[] = [];
            for (const col of columns) {
                tableRow.push(this.resolveValue(row, col));
            }
            table.push(tableRow);
        }
        return table;
    }

    private resolveValue(row: any, col: IAcDataManagerColExportDef): any {
        const rawData = row && typeof row === "object" && "data" in row ? row.data : row;
        let value = col.valueGetter ? col.valueGetter(rawData) : (col.field ? rawData[col.field] : undefined);
        if (col.formatter) {
            value = col.formatter(value, rawData);
        }
        return value;
    }

    private getBookType(format: AcDataManagerExportFormat): XLSX.BookType {
        switch (format) {
            case AcDataManagerExportFormat.Xlsx: return "xlsx";
            case AcDataManagerExportFormat.Xlsb: return "xlsb";
            case AcDataManagerExportFormat.Xls: return "biff8";
            case AcDataManagerExportFormat.Csv: return "csv";
            case AcDataManagerExportFormat.Tsv: return "txt";
            case AcDataManagerExportFormat.Ods: return "ods";
            case AcDataManagerExportFormat.Html: return "html";
            case AcDataManagerExportFormat.Xml: return "xlml";
            case AcDataManagerExportFormat.Dif: return "dif";
            case AcDataManagerExportFormat.Slk: return "slk";
            case AcDataManagerExportFormat.Prn: return "prn";
            default: return "xlsx";
        }
    }

    private applyFormatting(worksheet: XLSX.WorkSheet, columns: IAcDataManagerColExportDef[]): void {
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
                            numFmt = '0.00';
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
