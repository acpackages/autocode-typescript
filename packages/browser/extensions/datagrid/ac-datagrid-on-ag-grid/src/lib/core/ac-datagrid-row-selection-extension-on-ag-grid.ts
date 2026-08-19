/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDatagridApi, AcDatagridRowSelectionExtension, AC_DATAGRID_EXTENSION_NAME, AC_DATAGRID_HOOK, AcEnumDatagridRowSelectionHook, IAcDatagridExtensionEnabledHookArgs, IAcDatagridRowSelectionChangeEvent, IAcDatagridSelectionMultipleRowsChangeEvent } from "@autocode-ts/ac-browser";
import { AcDatagridOnAgGridExtension } from "./ac-datagrid-on-ag-grid-extension";
import { GridApi, IRowNode, RowSelectedEvent, RowSelectionOptions } from "ag-grid-community";
import { acNullifyInstanceProperties } from "@autocode-ts/autocode";

export class AcDatagridRowSelectionExtensionOnAgGrid {
  agGridExtension?: AcDatagridOnAgGridExtension | null;
  allowRowSelection: boolean = false;
  datagridApi?: AcDatagridApi | null;
  gridApi?: GridApi | null;
  rowSelectionExtension?: AcDatagridRowSelectionExtension | null;

  private handleHook:Function = (hook: string, args: any): void => {
    if (hook === AC_DATAGRID_HOOK.ExtensionEnable) {
      this.handleExtensionEnabled(args);
    } else if (hook === AcEnumDatagridRowSelectionHook.RowSelectionChange) {
      this.handleRowSelectionChange(args);
    } else if (hook === AcEnumDatagridRowSelectionHook.MultipleRowSelectionChange) {
      this.handleMultipleRowSelectionChange(args);
    } else if ([
      AcEnumDatagridRowSelectionHook.AllowMultipleSelectionChange,
      AcEnumDatagridRowSelectionHook.AllowSelectionChange
    ].includes(hook)) {
      this.setExtension();
    }
  }

  private onRowSelected = (event: RowSelectedEvent) => {
    this.handleAgGridRowSelected(event);
  };

   private clearSelection() {
    this.rowSelectionExtension = this.datagridApi!.extensions[AC_DATAGRID_EXTENSION_NAME.RowSelection] as AcDatagridRowSelectionExtension;
    const selectionOption: Partial<RowSelectionOptions>  = {};
    if (this.gridApi) {
      if (this.rowSelectionExtension) {
        if (this.rowSelectionExtension.allowSelection) {
          selectionOption.mode = this.rowSelectionExtension.allowMultipleSelection ? 'multiRow' : 'singleRow';
          this.gridApi.addEventListener('rowSelected', this.onRowSelected);
        }
      }
      this.gridApi.setGridOption('rowSelection', selectionOption as any);
      this.gridApi.setGridOption('selectionColumnDef',{
        sortable: true,
        resizable: false,
        minWidth: 25,
        maxWidth: 25,
        width: 25,
        suppressHeaderMenuButton: true,
        headerStyle:{paddingLeft:'2.5px',paddingRight:'2.5px'},
        cellStyle:{paddingLeft:'2.5px',paddingRight:'2.5px'}
    });
    }
  }

  destroy() {
    this.removeListeners();
    acNullifyInstanceProperties({instance:this});
  }

  private handleExtensionEnabled(args: IAcDatagridExtensionEnabledHookArgs) {
    if (args.extensionName === AC_DATAGRID_EXTENSION_NAME.RowSelection) {
      this.setExtension();
    }
  }

  private handleAgGridRowSelected(event: RowSelectedEvent) {
    if (this.rowSelectionExtension) {
      this.rowSelectionExtension.setRowSelection({
        isSelected: event.rowIndex != undefined && event.rowIndex != null && event.node.isSelected() === true,
        rowId: event.data[this.agGridExtension!.rowKey]
      });
    }
  }

  private handleMultipleRowSelectionChange(args: IAcDatagridSelectionMultipleRowsChangeEvent) {
    if (this.gridApi) {
      const nodes: IRowNode[] = [];
      for (const datagridRow of args.datagridRows) {
        const rowNode = this.gridApi.getRowNode(datagridRow.rowId);
        if (rowNode) {
          nodes.push(rowNode);
        }
      }
      if (nodes.length > 0) {
        this.gridApi.setNodesSelected({ newValue: args.isSelected, nodes });
      }
    }
  }

  private handleRowSelectionChange(args: IAcDatagridRowSelectionChangeEvent) {
    if (this.gridApi) {
      const rowNode = this.gridApi.getRowNode(args.datagridRow.rowId);
      if (rowNode) {
        this.gridApi.setNodesSelected({ newValue: args.isSelected, nodes: [rowNode] });
      }
    }
  }

  init({ agGridExtension }: { agGridExtension: AcDatagridOnAgGridExtension }) {
    this.removeListeners();
    this.agGridExtension = agGridExtension;
    this.datagridApi = agGridExtension.datagridApi;
    this.datagridApi!.hooks.subscribeAllHooks({callback: this.handleHook});
    if (this.agGridExtension.gridApi) {
      this.gridApi = this.agGridExtension.gridApi;
      this.setExtension();
    }
  }

  private removeListeners(){
    if(this.datagridApi){
      this.datagridApi.hooks.unsubscribeAllHooks({callback:this.handleHook});
    }
    if (this.gridApi) {
      this.gridApi.removeEventListener('rowSelected', this.onRowSelected);
    }
  }

  private setExtension() {
    this.rowSelectionExtension = this.datagridApi!.extensions[AC_DATAGRID_EXTENSION_NAME.RowSelection] as AcDatagridRowSelectionExtension;
    const selectionOption: Partial<RowSelectionOptions>  = {};
    if (this.gridApi) {
      if (this.rowSelectionExtension) {
        if (this.rowSelectionExtension.allowSelection) {
          selectionOption.mode = this.rowSelectionExtension.allowMultipleSelection ? 'multiRow' : 'singleRow';
          this.gridApi.addEventListener('rowSelected', this.onRowSelected);
        }
      }
      this.gridApi.setGridOption('rowSelection', selectionOption as any);
      this.gridApi.setGridOption('selectionColumnDef',{
        sortable: true,
        resizable: false,
        minWidth: 25,
        maxWidth: 25,
        width: 25,
        suppressHeaderMenuButton: true,
        headerStyle:{paddingLeft:'2.5px',paddingRight:'2.5px'},
        cellStyle:{paddingLeft:'2.5px',paddingRight:'2.5px'}
    });
    }
  }


}
