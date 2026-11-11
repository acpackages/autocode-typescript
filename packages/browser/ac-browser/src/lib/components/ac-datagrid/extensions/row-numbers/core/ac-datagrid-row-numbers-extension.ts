/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDatagridExtension } from "../../../core/ac-datagrid-extension";
import { AC_DATAGRID_EXTENSION_NAME } from "../../../consts/ac-datagrid-extension-name.const";
import { AC_DATAGRID_HOOK } from "../../../consts/ac-datagrid-hook.const";
import { IAcDatagridExtension } from "../../../interfaces/ac-datagrid-extension.interface";
import { IAcDatagridHeaderHookArgs } from "../../../interfaces/hook-args/ac-datagrid-header-hook-args.interface";
import { IAcDatagridRowHookArgs } from "../../../interfaces/hook-args/ac-datagrid-row-hook-args.interface";
import { AcDatagridInternalColumn } from "../../../models/ac-datagrid-internal-column.model";
import { AcDatagridRowNumberCell } from "../elements/ac-row-number-cell.element";
import { AcDatagridRowNumberHeaderCell } from "../elements/ac-row-number-header-cell.element";
import { AcEnumDatagridRowNumbersHook } from "../enums/ac-enum-datagrid-row-numbers-hook.enum";
import { IAcDatagridRowNumbersHookArgs } from "../interfaces/ac-datagrid-row-numbers-hook-args.interface";

export class AcDatagridRowNumbersExtension extends AcDatagridExtension {
  private _showRowNumbers: boolean = true;
  get showRowNumbers(): boolean {
    return this._showRowNumbers;
  }
  set showRowNumbers(value: boolean) {
    this._showRowNumbers = value;
    if (this.datagridApi) {
      const hookArgs: IAcDatagridRowNumbersHookArgs = {
        datagridApi: this.datagridApi,
        datagridRowNumbersExtension: this,
        value: value
      };
      this.datagridApi.hooks.execute({ hook: AcEnumDatagridRowNumbersHook.ShowRowNumbersChange, args: hookArgs });
    }
  }

  datagridInternalColumn: AcDatagridInternalColumn = new AcDatagridInternalColumn({
    width: 35,
  });

  override handleHook({ hook, args }: { hook: string; args: any; }): void {
    if (this.datagridApi) {
      if (hook == AC_DATAGRID_HOOK.BeforeRowCellsCreate) {
        this.handleBeforeRowCellsCreated(args);
      }
      else if (hook == AC_DATAGRID_HOOK.BeforeHeaderColumnCellsCreate) {
        this.handleBeforeHeaderColumnCellsCreated(args);
      }
    }
  }

  handleBeforeHeaderColumnCellsCreated(args: IAcDatagridHeaderHookArgs) {
    const datagridApi = args.datagridApi;
    const datagridHeader = args.datagridHeader;
    // const datagriRowNumberCell = new AcDatagridRowNumberHeaderCell({ datagridApi: datagridApi, datagridInternalColumn: this.datagridInternalColumn });
    // datagridHeader.append(datagriRowNumberCell.element);
    // }
  }

  handleBeforeRowCellsCreated(args: IAcDatagridRowHookArgs) {
    const datagridApi = args.datagridApi;
    const datagridRow = args.datagridRow;
    if (datagridRow.element) {
      // const datagriRowNumberCell = new AcDatagridRowNumberCell({ datagridApi: datagridApi, datagridRow: datagridRow, datagridInternalColumn: this.datagridInternalColumn });
      // datagridRow.element.append(datagriRowNumberCell.element);
    }
  }

}

export const AC_DATAGRID_ROW_NUMBERS_EXTENSION: IAcDatagridExtension = {
  extensionName: 'ROW_NUMBERS',
  extensionClass: AcDatagridRowNumbersExtension
}
