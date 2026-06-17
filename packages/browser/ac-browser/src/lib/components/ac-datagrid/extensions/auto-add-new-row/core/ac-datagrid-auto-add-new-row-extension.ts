/* eslint-disable @typescript-eslint/no-inferrable-types */
import { stringEqualsIgnoreCase } from "@autocode-ts/ac-extensions";
// import { IAcDatagridCell, IAcDatagridRow, AC_DATAGRID_HOOK, AC_DATAGRID_EXTENSION_NAME, AcDatagridExtension, AcEnumDatagridAutoAddNewRowHook, IAcDatagridAutoAddNewRowHookArgs, IAcDatagridExtension } from "@autocode-ts/ac-browser";
import { AcDelayedCallback } from "@autocode-ts/autocode";
import { AcDatagridExtension } from "../../../core/ac-datagrid-extension";
import { IAcDatagridAutoAddNewRowHookArgs } from "../interfaces/ac-datagrid-auto-add-new-row-hook-args.interface";
import { AcEnumDatagridAutoAddNewRowHook } from "../enums/ac-enum-datagrid-auto-add-new-row-hook.enum";
import { AC_DATAGRID_HOOK } from "../../../consts/ac-datagrid-hook.const";
import { IAcDatagridCell } from "../../../interfaces/ac-datagrid-cell.interface";
import { IAcDatagridRow } from "../../../interfaces/ac-datagrid-row.interface";
import { IAcDatagridExtension } from "../../../interfaces/ac-datagrid-extension.interface";
import { AC_DATAGRID_EXTENSION_NAME } from "../../../consts/ac-datagrid-extension-name.const";

export class AcDatagridAutoAddNewRowExtension extends AcDatagridExtension {
  private _autoAddNewRow: boolean = false;
  get autoAddNewRow(): boolean {
    return this._autoAddNewRow;
  }
  set autoAddNewRow(value: boolean) {
    this._autoAddNewRow = value;
    if (this.datagridApi) {
      const hookArgs: IAcDatagridAutoAddNewRowHookArgs = {
        datagridApi: this.datagridApi,
        datagridAutoAddNewRowExtension: this,
        value: value
      };
      this.datagridApi.hooks.execute({ hook: AcEnumDatagridAutoAddNewRowHook.AutoAddNewRowValueChange, args: hookArgs });
    }
  }
  autoAddNewRowData: any = {};
  private lastAutoAddRowId?: string;
  private delayedCallback: AcDelayedCallback = new AcDelayedCallback();

  private addRow() {
    if (this.autoAddNewRow) {
      // console.trace();
      this.delayedCallback.add({
        callback: () => {
          const lastRow = this.datagridApi.addRow({ data: { ...this.autoAddNewRowData }, rowId: '___auto_add_row___' });
          this.lastAutoAddRowId = lastRow.rowId;
        }, duration: 10,key:'addRow'
      });
    }
  }

  override destroy(): void {
    this.delayedCallback.destroy();
    super.destroy();
  }

  override handleHook({ hook, args }: { hook: string; args: any; }): void {
    if (this.autoAddNewRow) {
      if (this.datagridApi && stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.DataChange)) {
        this.addRow();
      }
      else if (this.datagridApi && stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.CellValueChange)) {
        const datagridCell: IAcDatagridCell = args.datagridCell;
        const datagridRow: IAcDatagridRow = datagridCell.datagridRow;
        if (datagridRow.index == this.datagridApi.dataManager.totalRows - 1) {
          this.addRow();
        }
      }
      else if (this.datagridApi && stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.BeforeDatagridRowCreate)) {
        if (args.rowId != "___auto_add_row___") {
          args.rowId = this.lastAutoAddRowId;
          this.addRow();
        }
        else {
          args.rowId = undefined;
        }
      }
    }
  }
}

export const AC_DATAGRID_AUTO_ADD_NEW_ROW_EXTENSION: IAcDatagridExtension = {
  extensionName: AC_DATAGRID_EXTENSION_NAME.AutoAddNewRow,
  extensionClass: AcDatagridAutoAddNewRowExtension
}
