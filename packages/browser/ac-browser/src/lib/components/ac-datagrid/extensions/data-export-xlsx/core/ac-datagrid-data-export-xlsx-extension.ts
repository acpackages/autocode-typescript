/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDatagridExtension } from "../../../core/ac-datagrid-extension";
import { AC_DATAGRID_EXTENSION_NAME } from "../../../consts/ac-datagrid-extension-name.const";
import { IAcDatagridExtension } from "../../../interfaces/ac-datagrid-extension.interface";
import { AcEnumDatagridDataExportXlsxHook } from "../enums/ac-enum-datagrid-data-export-xlsx-hook.enum";
import { IAcDatagridDataExportXlsxHookArgs } from "../interfaces/ac-datagrid-data-export-xlsx-hook-args.interface";
import {
  IAcDatagridCsvExportParams,
  IAcDatagridExcelExportParams
} from "../../../interfaces/export/ac-datagrid-export-params.interface";

export class AcDatagridDataExportXlsxExtension extends AcDatagridExtension {
  private _allowXlsxExport: boolean = true;
  get allowXlsxExport(): boolean {
    return this._allowXlsxExport;
  }
  set allowXlsxExport(value: boolean) {
    this._allowXlsxExport = value;
    if (this.datagridApi) {
      const hookArgs: IAcDatagridDataExportXlsxHookArgs = {
        datagridApi: this.datagridApi,
        datagridDataExportXlsxExtension: this,
        value: value
      };
      this.datagridApi.hooks.execute({ hook: AcEnumDatagridDataExportXlsxHook.AllowXlsxExportChange, args: hookArgs });
    }
  }

  private _allowCsvExport: boolean = true;
  get allowCsvExport(): boolean {
    return this._allowCsvExport;
  }
  set allowCsvExport(value: boolean) {
    this._allowCsvExport = value;
    if (this.datagridApi) {
      const hookArgs: IAcDatagridDataExportXlsxHookArgs = {
        datagridApi: this.datagridApi,
        datagridDataExportXlsxExtension: this,
        value: value
      };
      this.datagridApi.hooks.execute({ hook: AcEnumDatagridDataExportXlsxHook.AllowCsvExportChange, args: hookArgs });
    }
  }

  fileName: string = "export";

  async exportData(params?: IAcDatagridExcelExportParams): Promise<void> {
    if (this.datagridApi) {
      await this.datagridApi.exportDataAsExcel({
        fileName: this.fileName,
        ...params
      });
    }
  }

  async exportDataAsCsv(params?: IAcDatagridCsvExportParams): Promise<void> {
    if (this.datagridApi) {
      await this.datagridApi.exportDataAsCsv({
        fileName: this.fileName,
        ...params
      });
    }
  }

  async getDataAsCsv(params?: IAcDatagridCsvExportParams): Promise<string> {
    if (this.datagridApi) {
      return await this.datagridApi.getDataAsCsv(params);
    }
    return '';
  }

  async getDataAsExcel(params?: IAcDatagridExcelExportParams): Promise<Blob | undefined> {
    if (this.datagridApi) {
      return await this.datagridApi.getDataAsExcel(params);
    }
    return undefined;
  }
}

export const AC_DATAGRID_DATA_EXPORT_XLSX_EXTENSION: IAcDatagridExtension = {
  extensionName: AC_DATAGRID_EXTENSION_NAME.DataExportXlsx,
  extensionClass: AcDatagridDataExportXlsxExtension
};

export const AC_DATAGRID_DATA_EXPORT_EXTENSION: IAcDatagridExtension = {
  extensionName: AC_DATAGRID_EXTENSION_NAME.DataExport,
  extensionClass: AcDatagridDataExportXlsxExtension
};

export const AC_DATAGRID_DATA_EXPORT_CSV_EXTENSION: IAcDatagridExtension = {
  extensionName: AC_DATAGRID_EXTENSION_NAME.DataExportCsv,
  extensionClass: AcDatagridDataExportXlsxExtension
};
