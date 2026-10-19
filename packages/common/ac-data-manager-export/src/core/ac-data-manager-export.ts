import * as XLSX from "xlsx";
import { AcDataManager } from "@autocode-ts/autocode";
import { IAcDataManagerColExportDef } from "../interfaces/_interfaces.export";
import { AcDataManagerExportFormat } from "../enums/ac-data-manager-export-format.enum";
import { AcCsvExportService } from "./ac-csv-export-service";
import { AcExcelExportService } from "./ac-excel-export-service";
import { IAcCsvExportOptions } from "../interfaces/ac-csv-export-options.interface";

export class AcDataManagerExport {
    dataManager: AcDataManager;

    constructor({ dataManager }: { dataManager: AcDataManager }) {
        this.dataManager = dataManager;
    }

    async toTable(columns: IAcDataManagerColExportDef[]): Promise<any[][]> {
        if (!columns || columns.length === 0) {
            throw new Error("Export columns must not be empty.");
        }
        for (const col of columns) {
            if (!col.field && !col.valueGetter) {
                throw new Error(`Column "${col.title}" must have either a field or a valueGetter.`);
            }
        }
        return await this.buildTable(columns);
    }

    async toCsvString({
        columns,
        options
    }: {
        columns: IAcDataManagerColExportDef[];
        options?: IAcCsvExportOptions;
    }): Promise<string> {
        const table = await this.toTable(columns);
        return AcCsvExportService.tableToCsv(table, options);
    }

    async toCsvBlob({
        columns,
        options
    }: {
        columns: IAcDataManagerColExportDef[];
        options?: IAcCsvExportOptions;
    }): Promise<Blob> {
        const table = await this.toTable(columns);
        return AcCsvExportService.tableToBlob(table, options);
    }

    async toWorkbook({
        columns,
        sheetName,
        autoSizeColumns = true
    }: {
        columns: IAcDataManagerColExportDef[];
        sheetName?: string;
        autoSizeColumns?: boolean;
    }): Promise<XLSX.WorkBook> {
        const table = await this.toTable(columns);
        return AcExcelExportService.createWorkbook({
            table,
            columns,
            sheetName: sheetName ?? "Sheet1",
            autoSizeColumns
        });
    }

    async toBlob({
        columns,
        sheetName,
        format,
        autoSizeColumns = true
    }: {
        columns: IAcDataManagerColExportDef[];
        sheetName?: string;
        format?: AcDataManagerExportFormat;
        autoSizeColumns?: boolean;
    }): Promise<Blob> {
        const exportFormat = format ?? AcDataManagerExportFormat.Xlsx;
        if (exportFormat === AcDataManagerExportFormat.Csv) {
            return await this.toCsvBlob({ columns });
        }
        const workbook = await this.toWorkbook({ columns, sheetName, autoSizeColumns });
        const bookType = this.getBookType(exportFormat);
        return AcExcelExportService.toBlob(workbook, bookType);
    }

    async export({
        columns,
        fileName,
        sheetName,
        format,
        autoSizeColumns = true
    }: {
        columns: IAcDataManagerColExportDef[];
        fileName: string;
        sheetName?: string;
        format?: AcDataManagerExportFormat;
        autoSizeColumns?: boolean;
    }): Promise<void> {
        if (!fileName) {
            throw new Error("fileName must not be empty.");
        }
        const exportFormat = format ?? AcDataManagerExportFormat.Xlsx;
        const bookType = this.getBookType(exportFormat);

        if (exportFormat === AcDataManagerExportFormat.Csv && typeof window !== 'undefined') {
            const csvBlob = await this.toCsvBlob({ columns });
            const url = URL.createObjectURL(csvBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return;
        }

        const workbook = await this.toWorkbook({ columns, sheetName, autoSizeColumns });
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
        const rows = await this.dataManager.getRows({ startIndex: 0, rowsCount: this.dataManager.totalRows });
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
}
