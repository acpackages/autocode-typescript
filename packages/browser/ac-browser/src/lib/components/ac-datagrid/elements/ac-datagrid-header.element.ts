/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcElementBase } from "../../../core/ac-element-base";
import { acClearElement, acGetParentElementWithTag, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DATAGRID_TAG, AcDatagridElement, AcDatagridInternalHeaderCellElement, IAcDatagridColumn } from "../_ac-datagrid.export";
import { AcDatagridApi } from "../core/ac-datagrid-api";
import { AC_DATAGRID_EVENT } from "../consts/ac-datagrid-event.const";
import { AC_DATAGRID_HOOK } from "../consts/ac-datagrid-hook.const";
import { IAcDatagridHeaderHookArgs } from "../interfaces/hook-args/ac-datagrid-header-hook-args.interface";
import { AcDatagridHeaderCellElement } from "./ac-datagrid-header-cell.element";


export class AcDatagridHeaderElement extends AcElementBase {
  datagridHeaderCells: AcDatagridHeaderCellElement[] = [];
  datagridApi?: AcDatagridApi;
  private hookSubscriptionIds: string[] = [];
  private internalHeaderCell:AcDatagridInternalHeaderCellElement;

  private autoBindDatagrid() {
    if (this.isConnected) {
      const datagrid = acGetParentElementWithTag({ element: this, tag: AC_DATAGRID_TAG.datagrid });
      if (datagrid) {
        this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.HeaderInit });
        if (this.datagridApi.datagridColumns.length > 0) {
          this.render();
        }
        this.datagridApi = (datagrid as AcDatagridElement).datagridApi;
        this.hookSubscriptionIds.push(this.datagridApi.hooks.subscribe({
          hook: AC_DATAGRID_HOOK.ColumnDefinitionsChange,
          callback: (event: any) => {
            this.render();
          }
        }));
      }
    }
    else {
      this.delayedCallback.add({
        callback: () => {
          this.autoBindDatagrid();
        }, duration: 50, key: 'autoInit'
      });
    }
  }

  private clearHeader() {
    if(this.internalHeaderCell){
      this.internalHeaderCell.remove();
      this.internalHeaderCell.destroy();
      (this.internalHeaderCell as any) = null;
    }
    for (let cell of this.datagridHeaderCells) {
      cell.remove();
      cell.destroy();
      (cell as any) = null;
    }
    acClearElement({ element: this });
    (this.datagridHeaderCells as any) = null;
    this.datagridHeaderCells = [];
  }

  override destroy(): void {
    this.clearHeader();
    this.datagridApi.hooks.unsubscribe({ subscriptionIds: this.hookSubscriptionIds });
    super.destroy();
  }

  override init(): void {
    super.init();
    this.autoBindDatagrid();
  }

  refresh() {
    for (const cell of this.datagridHeaderCells) {
      cell.refresh();
    }
  }

  render() {
    this.clearHeader();
    const hookArgs: IAcDatagridHeaderHookArgs = {
      datagridHeader: this,
      datagridApi: this.datagridApi
    };
    this.datagridHeaderCells = [];
    this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.BeforeHeaderColumnCellsCreate, args: hookArgs });

    this.internalHeaderCell = new AcDatagridInternalHeaderCellElement();
    this.append(this.internalHeaderCell);
    for (const column of this.datagridApi.datagridColumns) {

      if (column.visible) {
        const headerCell = this.ownerDocument.createElement('ac-datagrid-header-cell') as AcDatagridHeaderCellElement;
        headerCell.setHeaderCell({ datagridColumn: column, datagridApi: this.datagridApi });
        this.append(headerCell);
        this.datagridHeaderCells.push(headerCell);
      }
    }
    this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.HeaderColumnCellsCreate, args: hookArgs });
  }

  setFlexColumnWidth() {
    const flexColumns: IAcDatagridColumn[] = [];
    let currentTotalWidth: number = 0;
    for (const column of this.datagridApi.datagridColumns) {
      if (column.visible) {
        if (column.columnDefinition.flexSize != undefined) {
          flexColumns.push(column);
        }
        else {
          currentTotalWidth += column.width;
        }
      }
    }
    const bodyWidth = this.datagridApi.bodyWidth || this.getBoundingClientRect().width || 1000;
    const fillWidth = bodyWidth - currentTotalWidth - 20;
    if (fillWidth > 0) {
      for (const column of flexColumns) {
        column.width = fillWidth * column.columnDefinition.flexSize!;
      }
    }
  }
}

acRegisterCustomElement({ tag: 'ac-datagrid-header', type: AcDatagridHeaderElement });
