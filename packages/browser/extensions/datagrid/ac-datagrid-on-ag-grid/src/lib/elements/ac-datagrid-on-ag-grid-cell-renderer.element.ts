/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcDatagridApi, IAcDatagridCell, IAcDatagridColumn, IAcDatagridCellRenderer, IAcDatagridRow, IAcDatagridCellElementArgs, AC_DATAGRID_EVENT, AC_DATAGRID_HOOK } from "@autocode-ts/ac-browser";
import { AgPromise, ICellRendererComp, ICellRendererParams } from "ag-grid-community";
import { AcDatagridOnAgGridExtension } from "../core/ac-datagrid-on-ag-grid-extension";
import { AcDelayedCallback, acNullifyInstanceProperties } from "@autocode-ts/autocode";

export class AcDatagridOnAgGridCellRenderer implements ICellRendererComp {
  datagridApi?: AcDatagridApi;
  datagridCell?: IAcDatagridCell;
  datagridColumn?: IAcDatagridColumn;
  datagridRow?: IAcDatagridRow;
  agGridExtension?: AcDatagridOnAgGridExtension;
  instance?: IAcDatagridCellRenderer;
  params: any;
  element: HTMLElement = document.createElement('div');
  renderer: any;
  delayedCallback:AcDelayedCallback = new AcDelayedCallback();
  private isFocused: boolean = false;

  handleBlur: Function = () => {
    if (this.datagridCell && this.datagridCell.element) {
      this.datagridCell.element.blur();
    }
    this.delayedCallback.add({callback:() => {
      this.isFocused = false;
    }, duration:50});
  };

  handleFocus: Function = () => {
    if (!this.isFocused) {
      this.isFocused = true;
      if (this.datagridCell && this.datagridCell.element) {
        this.datagridCell.element.focus();
      }
    }
  };

  destroy(): void {
    if (this.datagridCell) {
      (this.datagridCell.element as any) = null;
    }
    if (this.params) {
      this.params.eGridCell.removeEventListener('focusout', this.handleBlur);
      this.params.eGridCell.removeEventListener('focusin', this.handleFocus);
    }
    if (this.renderer) {
      if (this.renderer.destroy != undefined) {
        this.renderer.destroy();
      }
    }
    this.element.remove();
    if(this.datagridApi){
      this.datagridApi.hooks.execute({hook:AC_DATAGRID_EVENT.CellRendererElementDestroy,args:{datagridCell:this.datagridCell}});
      this.datagridApi.events.execute({event:AC_DATAGRID_EVENT.CellRendererElementDestroy,args:{datagridCell:this.datagridCell}});
    }
    this.delayedCallback.destroy();
    acNullifyInstanceProperties({ instance: this });
  }

  getGui(): HTMLElement {
    return this.element;
  }

  init?(params: ICellRendererParams | any): AgPromise<void> | void {
    requestAnimationFrame(() => {
      this.params = params;
      this.agGridExtension = params.agGridExtension;
      this.datagridColumn = params.datagridColumn;
      this.datagridApi = params.datagridApi;
      if (!this.element) {
        this.element = document.createElement('div');
      }
      this.element.style.display = 'contents';
      this.datagridRow = this.datagridApi!.getRow({ rowId: params.data[this.agGridExtension!.rowKey] });
      if (this.datagridRow && this.datagridColumn) {
        this.datagridCell = this.datagridApi?.getCell({ row: this.datagridRow, column: this.datagridColumn });
        if (this.datagridCell) {
          const columnDefinition = this.datagridColumn.columnDefinition;
          if (columnDefinition.cellRendererElement) {
            const renderer = new columnDefinition.cellRendererElement();
            const initArgs: IAcDatagridCellElementArgs = {
              datagridApi: this.datagridApi!,
              datagridCell: this.datagridCell!
            };
            renderer.init(initArgs);
            this.renderer = renderer;
            this.element.innerHTML = '';
            this.element.append(renderer.getElement());
            this.datagridApi?.hooks.execute({ hook: AC_DATAGRID_HOOK.CellRendererElementInit, args: { renderer: this } });
            this.datagridApi?.events.execute({ event: AC_DATAGRID_EVENT.CellRendererElementInit, args: { renderer: this } });
          }
          else{
            this.element.innerText = this.datagridCell.datagridRow.data[this.datagridCell.datagridColumn.columnKey] ?? '';
          }
        }
        if (this.datagridColumn.columnDefinition.cellRendererElementAttrs) {
          const attrs: any = this.datagridColumn.columnDefinition.cellRendererElementAttrs;
          for (const key of Object.keys(attrs)) {
            this.element.setAttribute(key, attrs[key]);
          }
        }
        this.params.eGridCell.addEventListener('focusin', this.handleFocus);
        this.params.eGridCell.addEventListener('focusout', this.handleBlur);
      }
      else {
        console.warn(`Datagrid Row and Datagrid Column Not Found`, params);
      }
    });
  }

  refresh(params: ICellRendererParams<any, any, any>): boolean {
    this.init!(params);
    return true;
  }
}
