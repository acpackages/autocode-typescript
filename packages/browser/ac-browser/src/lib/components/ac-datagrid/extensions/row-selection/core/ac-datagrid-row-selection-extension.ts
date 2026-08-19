/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDatagridExtension } from "../../../core/ac-datagrid-extension";
import { AC_DATAGRID_EXTENSION_NAME } from "../../../consts/ac-datagrid-extension-name.const";
import { IAcDatagridExtension } from "../../../interfaces/ac-datagrid-extension.interface";
import { IAcDatagridRow } from "../../../interfaces/ac-datagrid-row.interface";
import { AcDatagridInternalColumn } from "../../../models/ac-datagrid-internal-column.model";
import { AcEnumDatagridRowSelectionEvent } from "../enums/ac-enum-datagrid-row-selection-event.enum";
import { AcEnumDatagridRowSelectionHook } from "../enums/ac-enum-datagrid-row-selection-hook.enum";
import { IAcDatagridRowSelectionChangeEvent } from "../interfaces/ac-datagrid-row-selection-change-event.interface";
import { IAcDatagridRowSelectionHookArgs } from "../interfaces/ac-datagrid-row-selection-hook-args.interface";

export class AcDatagridRowSelectionExtension extends AcDatagridExtension {
  private _allowMultipleSelection: boolean = true;
  get allowMultipleSelection(): boolean {
    return this._allowMultipleSelection;
  }
  set allowMultipleSelection(value: boolean) {
    this._allowMultipleSelection = value;
    if (this.datagridApi) {
      const hookArgs: IAcDatagridRowSelectionHookArgs = {
        datagridApi: this.datagridApi,
        datagridRowSelectionExtension: this,
        value: value
      };
      this.datagridApi.hooks.execute({ hook: AcEnumDatagridRowSelectionHook.AllowMultipleSelectionChange, args: hookArgs });
    }
  }

  private _allowSelection: boolean = true;
  get allowSelection(): boolean {
    return this._allowSelection;
  }
  set allowSelection(value: boolean) {
    this._allowSelection = value;
    if (this.datagridApi) {
      const hookArgs: IAcDatagridRowSelectionHookArgs = {
        datagridApi: this.datagridApi,
        datagridRowSelectionExtension: this,
        value: value
      };
      this.datagridApi.hooks.execute({ hook: AcEnumDatagridRowSelectionHook.AllowSelectionChange, args: hookArgs });
    }
  }

  datagridInternalColumn: AcDatagridInternalColumn = new AcDatagridInternalColumn({
    width: 35,
  });

  clearSelection() {
    // this.setAllRowsSelection({ isSelected: false });
  }

  getSelectedRows(): IAcDatagridRow[] {
    const selectedRows: IAcDatagridRow[] = [];
    if (this.datagridApi) {
    for (const row of this.datagridApi.datagridRows) {
      if (row.extensionData[AC_DATAGRID_EXTENSION_NAME.RowSelection] && row.extensionData[AC_DATAGRID_EXTENSION_NAME.RowSelection].isSelected) {
        selectedRows.push(row);
      }
    }
  }
    return selectedRows;
  }

  getSelectedRowsData(): any[] {
    const selectedData: any[] = [];
    if (this.datagridApi) {
    for (const row of this.datagridApi.datagridRows) {
      if (row.extensionData[AC_DATAGRID_EXTENSION_NAME.RowSelection] && row.extensionData[AC_DATAGRID_EXTENSION_NAME.RowSelection].isSelected) {
        selectedData.push(row.data);
      }
    }
  }
    return selectedData;
  }

  getSelectedRowsDataKeyValues({ key }: { key: string }): any[] {
    const selectedKeyValues: any[] = [];
    if (this.datagridApi) {
    for (const row of this.datagridApi.datagridRows) {
      if (row.extensionData[AC_DATAGRID_EXTENSION_NAME.RowSelection] && row.extensionData[AC_DATAGRID_EXTENSION_NAME.RowSelection].isSelected && row.data[key] != undefined) {
        selectedKeyValues.push(row.data[key]);
      }
    }
  }
    return selectedKeyValues;
  }

  setRowSelection({ datagridRow, isSelected, rowId, key, value }: { datagridRow?: IAcDatagridRow, rowId?: string, key?: string, value?: any, isSelected: boolean }) {
    if (datagridRow == undefined && rowId) {
      datagridRow = this.datagridApi.getRow({ rowId: rowId });
    }
    else if (datagridRow == undefined && key && value) {
      datagridRow = this.datagridApi.getRow({ key: key, value: value });
    }
    if (datagridRow) {
      if(!datagridRow.extensionData[AC_DATAGRID_EXTENSION_NAME.RowSelection]){
        datagridRow.extensionData[AC_DATAGRID_EXTENSION_NAME.RowSelection] = {};
      }
      datagridRow.extensionData[AC_DATAGRID_EXTENSION_NAME.RowSelection].isSelected = isSelected;
      if (this.datagridApi) {
      const eventArgs: IAcDatagridRowSelectionChangeEvent = {
        datagridApi: this.datagridApi,
        datagridRow: datagridRow,
        isSelected: isSelected,
        datagridRowSelectionExtension: this
      };
      this.datagridApi.hooks.execute({ hook: AcEnumDatagridRowSelectionHook.RowSelectionChange, args: eventArgs });
      this.datagridApi.events.execute({ event: AcEnumDatagridRowSelectionEvent.RowSelectionChange, args: eventArgs });
    }
    }
  }

}

export const AC_DATAGRID_ROW_SELECTION_EXTENSION: IAcDatagridExtension = {
  extensionName: AC_DATAGRID_EXTENSION_NAME.RowSelection,
  extensionClass: AcDatagridRowSelectionExtension
}
