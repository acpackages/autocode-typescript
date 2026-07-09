/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDatagridExtension } from "../../../core/ac-datagrid-extension";
import { AC_DATAGRID_EXTENSION_NAME } from "../../../consts/ac-datagrid-extension-name.const";
import { IAcDatagridExtension } from "../../../interfaces/ac-datagrid-extension.interface";
import { AcEnumDatagridDataExportXlsxHook } from "../enums/ac-enum-datagrid-data-export-xlsx-hook.enum";
import { IAcDatagridDataExportXlsxExportCallArgs } from "../interfaces/ac-datagrid-data-export-xlsx-export-call-args.interface";
import { IAcDatagridDataExportXlsxHookArgs } from "../interfaces/ac-datagrid-data-export-xlsx-hook-args.interface";
import { IAcDataRow } from "@autocode-ts/autocode";
import { AcEnumDatagridColumnDataType } from "../../../enums/ac-enum-datagrid-column-data-type.enum";
import { AcDataManagerExport, AcDataManagerExportFormat, AcExportDataType } from '@autocode-ts/ac-data-manager-export';

export class AcDatagridDataExportXlsxExtension extends AcDatagridExtension {
  private _allowXlsxExport: boolean = false;
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

  fileName:string = "export";

  async exportData() {
    if (this.datagridApi) {
    const columns = this.datagridApi.datagridColumns
      .filter(col => col.visible)
      .map(col => {
        let exportType: AcExportDataType | undefined;
        switch (col.dataType) {
          case AcEnumDatagridColumnDataType.Boolean:
            exportType = AcExportDataType.Boolean;
            break;
          case AcEnumDatagridColumnDataType.Date:
            exportType = AcExportDataType.Date;
            break;
          case AcEnumDatagridColumnDataType.Datetime:
            exportType = AcExportDataType.DateTime;
            break;
          case AcEnumDatagridColumnDataType.Number:
            exportType = AcExportDataType.Number;
            break;
          case AcEnumDatagridColumnDataType.String:
            exportType = AcExportDataType.Text;
            break;
        }

        return {
          title: col.title,
          field: col.columnKey,
          type: exportType,
          format: col.columnDefinition.format
        };
      });

    new AcDataManagerExport({dataManager:this.datagridApi.dataManager}).export({
      columns,
      fileName: this.fileName,
      sheetName:this.fileName,
      format: AcDataManagerExportFormat.Xlsx
    });
    }
  }
}

export const AC_DATAGRID_DATA_EXPORT_XLSX_EXTENSION: IAcDatagridExtension = {
  extensionName: AC_DATAGRID_EXTENSION_NAME.DataExportXlsx,
  extensionClass: AcDatagridDataExportXlsxExtension
}
