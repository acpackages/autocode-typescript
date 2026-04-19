/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { acScrollIntoViewIfHidden } from "../../../../../utils/ac-element-functions";
import { IAcDatagridCell, IAcDatagridColumn, IAcDatagridRow } from "../../../_ac-datagrid.export";
import { AcDatagridExtension } from "../../../core/ac-datagrid-extension";
import { AC_DATAGRID_EXTENSION_NAME } from "../../../consts/ac-datagrid-extension-name.const";
import { IAcDatagridExtension } from "../../../interfaces/ac-datagrid-extension.interface";

export class AcDatagridKeyboardActionsExtension extends AcDatagridExtension {
  private navigate: boolean = false;

  private handleCellKeyDown(event: KeyboardEvent) {
    if (event && this.datagridApi && this.datagridApi.activeDatagridCell) {
      if (this.navigate && event && event.key) {
        const datagridCell: IAcDatagridCell = this.datagridApi.activeDatagridCell;
        const datagridRow: IAcDatagridRow = datagridCell.datagridRow;
        const datagridColumn: IAcDatagridColumn = datagridCell.datagridColumn;
        let newColumnIndex = datagridColumn.index;
        let newRowIndex = datagridRow.index;
        // switch (event.key) {
        //   case 'ArrowUp':
        //     if (datagridCell.rowIndex > 0) {
        //       newRowIndex--;
        //     }
        //     break;
        //   case 'ArrowDown':
        //     if (!datagridRow.isLast) {
        //       newRowIndex++;
        //     }
        //     break;
        //   case 'ArrowLeft':
        //     if (datagridColumn.isFirst) {
        //       if (!datagridRow.isFirst) {
        //         // newColumnIndex = datagridRow.getLastColumn()!.index;
        //         newRowIndex--;
        //       }
        //     }
        //     else {
        //       // newColumnIndex = datagridColumn.getPreviousColumn()!.index
        //     }
        //     break;
        //   case 'ArrowRight':
        //   case 'Tab':
        //     if (datagridColumn.isLast) {
        //       if (!datagridRow.isLast) {
        //         // newColumnIndex = datagridRow.getFirstColumn()!.index;
        //         newRowIndex++;
        //       }
        //     }
        //     else {
        //       // newColumnIndex = datagridColumn.getNextColumn()!.index
        //     }
        //     break;
        //   default:
        //     return; // Allow other keys (e.g., typing in editable cells)
        // }
        if (newColumnIndex != datagridColumn.index || newRowIndex != datagridRow.index) {
          event.preventDefault();
          this.datagridApi.setActiveCell({ rowIndex: newRowIndex, columnIndex: newColumnIndex });
          if (this.datagridApi.activeDatagridCell.element) {
            acScrollIntoViewIfHidden({ element: this.datagridApi.activeDatagridCell.element });
          }
        }
      }
    }
  }

  // override handleHook({ hook, args }: { hook: string; args: any; }): void {
  //   if (stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.CellKeyDown)) {
  //     this.handleCellKeyUp(args);
  //   }
  //   else if (hook == AC_DATAGRID_HOOK.CellFocus) {
  //     this.navigate = true;
  //   }
  // }

  override init(): void {
    if (this.datagridApi) {
      this.datagridApi.datagrid.datagridBody!.addEventListener('mouseover', (event: MouseEvent) => {
        this.navigate = true;
      });
      this.datagridApi.datagrid.datagridBody!.addEventListener('mouseenter', (event: MouseEvent) => {
        this.navigate = true;
      });
      this.datagridApi.datagrid.datagridBody!.addEventListener('mouseleave', (event: MouseEvent) => {
        this.navigate = false;
      });
      this.datagridApi.datagrid.ownerDocument.addEventListener('keydown', (event: KeyboardEvent) => {
        this.handleCellKeyDown(event);
      });
    }
  }

}

export const AC_DATAGRID_KEYBOARD_ACTIONS_EXTENSION: IAcDatagridExtension = {
  extensionName: AC_DATAGRID_EXTENSION_NAME.KeyboardActions,
  extensionClass: AcDatagridKeyboardActionsExtension
}
