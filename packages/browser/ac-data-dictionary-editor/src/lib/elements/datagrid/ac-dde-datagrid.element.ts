import { AcDatagridElement, AcDatagridAfterRowsFooterExtension, AcDatagridApi, AcDatagridAutoAddNewRowExtension, AcDatagridColumnDraggingExtension, AcDatagridColumnsCustomizerExtension, AcDatagridDataExportXlsxExtension, AcDatagridRowDraggingExtension, AcDatagridRowNumbersExtension, AcDatagridRowSelectionExtension, AC_DATAGRID_EVENT, AC_DATAGRID_EXTENSION_NAME, AC_DATAGRID_HOOK, IAcDatagridColumnDefinition } from "@autocode-ts/ac-browser";
import { AcDDEApi } from "../../core/ac-dde-api";
import { AC_DATAGRID_ON_AG_GRID_EXTENSION_NAME, AcDatagridOnAgGridExtension } from "@autocode-ts/ac-datagrid-on-ag-grid";
import { AcDelayedCallback } from "@autocode-ts/autocode";

export class AcDDEDatagrid {
  get columnDefinitions(): IAcDatagridColumnDefinition[] {
    return this.datagridApi.columnDefinitions;
  }
  set columnDefinitions(value: IAcDatagridColumnDefinition[]) {
    this.datagridApi.columnDefinitions = value;
  }

  datagrid!: AcDatagridElement;
  datagridApi!: AcDatagridApi;
  editorApi!: AcDDEApi;
  element!: HTMLElement;
  footerElement: HTMLElement = document.createElement('div');

  private afterRowsExtension!: AcDatagridAfterRowsFooterExtension;
  private autoAddNewRowExtension!: AcDatagridAutoAddNewRowExtension;
  private columnDraggingExtension!: AcDatagridColumnDraggingExtension;
  private columnsCustomizerExtension!: AcDatagridColumnsCustomizerExtension;
  private exportXlsxExtension!: AcDatagridDataExportXlsxExtension;
  private rowNumbersExtension!: AcDatagridRowNumbersExtension;
  private rowSelectionExtension!: AcDatagridRowSelectionExtension;
  private rowDraggingExtension!: AcDatagridRowDraggingExtension;
  private agGridExtension!: AcDatagridOnAgGridExtension;
  private delayedCallback:AcDelayedCallback = new AcDelayedCallback();

  newRowDataFunction: Function = () => {
    return {};
  };

  constructor({ editorApi }: { editorApi: AcDDEApi }) {
    this.editorApi = editorApi;
    this.datagrid = new AcDatagridElement();
    this.datagridApi = this.datagrid.datagridApi;
    this.datagridApi.defaultColumnDefiniation.allowEdit = true;
    this.datagridApi.showAddButton = true;
    this.datagridApi.showSearchInput = true;
    this.datagridApi.hooks.subscribe({
      hook: AC_DATAGRID_HOOK.FooterInit, callback: () => {
        const addNewButton: HTMLElement = this.datagrid.ownerDocument.createElement('button');
        addNewButton.setAttribute('class', 'btn btn-primary btn-add-new py-0');
        addNewButton.setAttribute('type', 'button');
        addNewButton.setAttribute('style', 'height:28px;');
        addNewButton.innerHTML = 'Add New';
        this.datagrid.datagridFooter?.append(addNewButton);
        addNewButton.addEventListener('click', (event: MouseEvent) => {
          this.datagridApi.addRow({ data: this.newRowDataFunction() });
        });
      }
    });
    this.datagridApi.on({event:AC_DATAGRID_EVENT.RowDataChange,callback:(args:any)=>{
      //
    }});
    this.element = this.datagrid;
    this.datagrid.datagridApi.rowHeight = 30;
    this.datagrid.datagridApi.headerHeight = 30;
    this.element.classList.add("ac-dde-datagrid")

    this.afterRowsExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.AfterRowsFooter }) as AcDatagridAfterRowsFooterExtension;
    this.autoAddNewRowExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.AutoAddNewRow }) as AcDatagridAutoAddNewRowExtension;
    this.columnDraggingExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.ColumnDragging }) as AcDatagridColumnDraggingExtension;
    this.columnsCustomizerExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.ColumnsCustomizer }) as AcDatagridColumnsCustomizerExtension;
    this.exportXlsxExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.DataExportXlsx }) as AcDatagridDataExportXlsxExtension;
    this.rowNumbersExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowNumbers }) as AcDatagridRowNumbersExtension;
    this.rowSelectionExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowSelection }) as AcDatagridRowSelectionExtension;
    this.rowDraggingExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowDragging }) as AcDatagridRowDraggingExtension;
    this.autoAddNewRowExtension.autoAddNewRow = false;
    this.agGridExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_ON_AG_GRID_EXTENSION_NAME }) as AcDatagridOnAgGridExtension;
    this.delayedCallback.add({callback:() => {

      this.afterRowsExtension.footerElement = this.footerElement;
      this.datagridApi.on({
        event: AC_DATAGRID_EVENT.StateChange, callback: (args: any) => {
          //
        }
      })
    }, duration:500});

    //
  }



}
