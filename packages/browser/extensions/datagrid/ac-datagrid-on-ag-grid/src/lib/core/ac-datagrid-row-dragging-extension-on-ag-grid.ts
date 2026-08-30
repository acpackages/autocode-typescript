/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDatagridApi, AcDatagridRowDraggingExtension, AcDatagridTreeTableExtension, AC_DATAGRID_EXTENSION_NAME, AC_DATAGRID_HOOK, AcEnumDatagridRowDraggingHook, IAcDatagridExtensionEnabledHookArgs } from "@autocode-ts/ac-browser";
import { AcDatagridOnAgGridExtension } from "./ac-datagrid-on-ag-grid-extension";
import { ColDef, GridApi, RowDragCancelEvent, RowDragEndEvent, RowDragEnterEvent, RowDragLeaveEvent, RowDragMoveEvent } from "ag-grid-community";
import { AcEnumDatagridOnAgGridHook } from "../enums/ac-enum-datagrid-on-ag-grid-hook.enum";
import { IAcDatagriOnAgGridColDefsChangeHookArgs } from "../interfaces/ac-datagrid-on-ag-grid-col-defs-set-hook-args.interface";
import { acNullifyInstanceProperties } from "@autocode-ts/autocode";

export class AcDatagridRowDraggingExtensionOnAgGrid {
  agGridExtension?: AcDatagridOnAgGridExtension | null;
  allowRowDragging: boolean = false;
  datagridApi?: AcDatagridApi | null;
  gridApi?: GridApi | null;
  private previousGroupChildIndex: number = -1;
  private previousIndex:number = -1;
  rowDraggingExtension?: AcDatagridRowDraggingExtension | null;
  treeTableExtension?: AcDatagridTreeTableExtension | null;
  private draggingRow: any;

  private handleHook:Function = (hook: string, args: any): void => {
    if (hook === AC_DATAGRID_HOOK.ExtensionEnable) {
      this.handleExtensionEnabled(args);
    } else if (hook === AcEnumDatagridRowDraggingHook.AllowRowDraggingChange) {
      this.setAllowRowDragging();
    } else if (hook === AcEnumDatagridOnAgGridHook.BeforeColDefsChange) {
      this.handleBeforeColDefsChange(args);
    }
  }

  private onRowDragEnter = (event: RowDragEnterEvent) => {
    this.handleAgGridRowDragStart(event);
  };

  private onRowDragEnd = (event: RowDragEndEvent) => {
    this.handleAgGridRowDragEnd(event);
  };

  private onRowDragCancel = (event: RowDragCancelEvent) => {
    const datagridRow = this.agGridExtension?.getDatagridRowFromEvent({ event });
    if (datagridRow && this.rowDraggingExtension && this.rowDraggingExtension.rowDraggingEventHandler) {
      // this.rowDraggingExtension.rowDraggingEventHandler.handleRowDragCancel({ datagridRow, event: event.event });
    }
  };

  private onRowDragLeave = (event: RowDragLeaveEvent) => {
    const datagridRow = this.agGridExtension?.getDatagridRowFromEvent({ event });
    if (datagridRow && this.rowDraggingExtension && this.rowDraggingExtension.rowDraggingEventHandler) {
      // this.rowDraggingExtension.rowDraggingEventHandler.handleRowDragLeave({ datagridRow, event: event.event });
    }
  };

  private onRowDragMove = (event: RowDragMoveEvent) => {
    const datagridRow = this.agGridExtension?.getDatagridRowFromEvent({ event });
    if (datagridRow && this.rowDraggingExtension && this.rowDraggingExtension.rowDraggingEventHandler) {
      // this.rowDraggingExtension.rowDraggingEventHandler.handleRowDragOver({ datagridRow, event: event.event });
    }
  };

  destroy() {
    this.removeListeners();
    acNullifyInstanceProperties({instance:this});
  }

  private handleAgGridRowDragEnd(event: RowDragEndEvent) {
    const node = event.node;
    let currentGroupChildIndex: number = -1;

    if (this.agGridExtension && this.treeTableExtension && this.treeTableExtension.isTreeTable) {
      const oldParentId = node.data[this.treeTableExtension.treeDataParentKey];
      let newIntParentId: any = null;
      let newParentId: any = null;

      if (node.parent) {
        const parentNode = node.parent;
        if (parentNode.data) {
          newIntParentId = parentNode.data[this.agGridExtension.rowKey];
          newParentId = parentNode.data[this.treeTableExtension.treeDataParentKey];
        }
        if (parentNode.childrenAfterGroup) {
          let index = 0;
          for (const child of parentNode.childrenAfterGroup) {
            if (child.data && child.data[this.agGridExtension.rowKey] === node.data[this.agGridExtension.rowKey]) {
              currentGroupChildIndex = index;
              break;
            }
            index++;
          }
        }
      }

      if (node.data[this.treeTableExtension.treeDataChildKey] !== newParentId) {
        node.data[this.treeTableExtension.treeDataChildKey] = newParentId;
        node.data[this.agGridExtension.rowParentKey] = newIntParentId;
      }

      this.draggingRow = null;

      // eventParams object was created but not used in original code – preserved behavior
      const eventParams = {
        currentGroupChildIndex,
        data: node.data,
        event,
        newParentId,
        oldParentId,
        previousGroupChildIndex: this.previousGroupChildIndex
      };
    }

    if (this.agGridExtension){
      const datagridRow = this.agGridExtension.getDatagridRowFromEvent({ event });
      if (datagridRow && this.rowDraggingExtension && this.rowDraggingExtension.rowDraggingEventHandler) {
        this.rowDraggingExtension.rowDraggingEventHandler!.handleRowDragEnd({ datagridRow, event: {...event.event,oldIndex:this.previousIndex,newIndex:event.overIndex} });
      }
    }
  }

  private handleAgGridRowDragStart(event: RowDragEnterEvent) {
    this.draggingRow = event;
    const node = event.node;
    this.previousGroupChildIndex = -1;
    this.previousIndex = event.node.rowIndex;

    if (node.parent && node.parent.childrenAfterGroup) {
      let index = 0;
      for (const child of node.parent.childrenAfterGroup) {
        if (child.data && child.data[this.agGridExtension!.rowKey] === node.data[this.agGridExtension!.rowKey]) {
          this.previousGroupChildIndex = index;
          break;
        }
        index++;
      }
    }

    const datagridRow = this.agGridExtension!.getDatagridRowFromEvent({ event });
    if (datagridRow && this.rowDraggingExtension && this.rowDraggingExtension.rowDraggingEventHandler) {
      // this.rowDraggingExtension.rowDraggingEventHandler.handleRowDragStart({ datagridRow, event: event.event });
    }
  }

  private handleBeforeColDefsChange(event: IAcDatagriOnAgGridColDefsChangeHookArgs) {
    if (this.allowRowDragging) {
      const internalActionColumns: ColDef = {
        rowDrag: this.allowRowDragging,
        field: '_ac_internal_actions',
        headerName: '',
        sortable: false,
        filter: false,
        pinned: true,
        suppressHeaderMenuButton: true,
        suppressHeaderContextMenu: true,
        width: 50,
        resizable: false
      };
      event.colDefs.push(internalActionColumns);
    }
  }

  private handleExtensionEnabled(args: IAcDatagridExtensionEnabledHookArgs) {
    if (args.extensionName === AC_DATAGRID_EXTENSION_NAME.RowDragging) {
      this.setExtension();
    } else if (args.extensionName === AC_DATAGRID_EXTENSION_NAME.TreeTable) {
      this.treeTableExtension = this.datagridApi!.extensions[AC_DATAGRID_EXTENSION_NAME.TreeTable] as AcDatagridTreeTableExtension;
    }
  }

  init({ agGridExtension }: { agGridExtension: AcDatagridOnAgGridExtension }) {
    this.removeListeners();
    this.agGridExtension = agGridExtension;
    this.datagridApi = agGridExtension.datagridApi;
    this.datagridApi!.hooks.subscribeAllHooks({callback: this.handleHook});
    this.datagridApi.hooks.subscribe({hook:AcEnumDatagridRowDraggingHook.AllowRowDraggingChange,callback:()=>{
      this.setExtension();
    }});
    this.gridApi = this.agGridExtension.gridApi;
    if (this.datagridApi!.extensions[AC_DATAGRID_EXTENSION_NAME.TreeTable]) {
      this.treeTableExtension = this.datagridApi!.extensions[AC_DATAGRID_EXTENSION_NAME.TreeTable] as AcDatagridTreeTableExtension;
    }
  }

  removeListeners(){
    if(this.datagridApi){
      this.datagridApi.hooks.unsubscribeAllHooks({callback:this.handleHook});
    }

    if (this.gridApi) {
      this.gridApi.removeEventListener('rowDragEnter', this.onRowDragEnter);
      this.gridApi.removeEventListener('rowDragEnd', this.onRowDragEnd);
      this.gridApi.removeEventListener('rowDragCancel', this.onRowDragCancel);
      this.gridApi.removeEventListener('rowDragLeave', this.onRowDragLeave);
      this.gridApi.removeEventListener('rowDragMove', this.onRowDragMove);
    }
  }

  setAllowRowDragging() {
    if (this.rowDraggingExtension) {
        this.gridApi.setGridOption('rowDragManaged', true);
        this.gridApi.setGridOption('rowDragEntireRow', true);
        this.gridApi.setGridOption('suppressMoveWhenRowDragging', true);
        this.gridApi.addEventListener('rowDragEnter', this.onRowDragEnter);
        this.gridApi.addEventListener('rowDragEnd', this.onRowDragEnd);
        this.gridApi.addEventListener('rowDragCancel', this.onRowDragCancel);
        this.gridApi.addEventListener('rowDragLeave', this.onRowDragLeave);
        this.gridApi.addEventListener('rowDragMove', this.onRowDragMove);
    //   }
    }
  }

  setExtension() {
    if (this.datagridApi && this.datagridApi.extensions[AC_DATAGRID_EXTENSION_NAME.RowDragging]) {
      this.rowDraggingExtension = this.datagridApi.extensions[AC_DATAGRID_EXTENSION_NAME.RowDragging] as AcDatagridRowDraggingExtension;
      this.allowRowDragging = this.rowDraggingExtension.allowRowDragging;
      this.agGridExtension.setColumnDefs();
      if(this.allowRowDragging){
        this.setAllowRowDragging();
      }

    }
  }

}
