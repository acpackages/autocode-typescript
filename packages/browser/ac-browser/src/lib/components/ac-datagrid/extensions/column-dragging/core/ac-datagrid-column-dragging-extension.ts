/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDatagridExtension } from "../../../core/ac-datagrid-extension";
import { AC_DATAGRID_EXTENSION_NAME } from "../../../consts/ac-datagrid-extension-name.const";
import { IAcDatagridExtension } from "../../../interfaces/ac-datagrid-extension.interface";
import { AcEnumDatagridColumnDraggingHook } from "../enums/ac-enum-datagrid-column-dragging-hook.enum";
import { IAcDatagridColumnDraggingHookArgs } from "../interfaces/ac-datagrid-column-dragging-hook-args.interface";


export class AcDatagridColumnDraggingExtension extends AcDatagridExtension {
  private _allowColumnDragging: boolean = true;
  get allowColumnDragging(): boolean {
    return this._allowColumnDragging;
  }
  set allowColumnDragging(value: boolean) {
    this._allowColumnDragging = value;
    if (this.datagridApi) {
      const hookArgs: IAcDatagridColumnDraggingHookArgs = {
        datagridApi: this.datagridApi,
        datagridColumnDraggingExtension: this,
        value: value
      };
      this.datagridApi.hooks.execute({ hook: AcEnumDatagridColumnDraggingHook.AllowColumnDraggingChange, args: hookArgs });
    }
  }
}

export const AC_DATAGRID_COLUMN_DRAGGING_EXTENSION: IAcDatagridExtension = {
  extensionName: 'COLUMN_DRAGGING',
  extensionClass: AcDatagridColumnDraggingExtension
}
