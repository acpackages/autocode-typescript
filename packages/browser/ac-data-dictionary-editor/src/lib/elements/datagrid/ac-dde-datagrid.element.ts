/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcDatagridElement, AcDatagridAfterRowsFooterExtension, AcDatagridApi, AcDatagridAutoAddNewRowExtension, AcDatagridColumnDraggingExtension, AcDatagridColumnsCustomizerExtension, AcDatagridDataExportXlsxExtension, AcDatagridRowDraggingExtension, AcDatagridRowNumbersExtension, AcDatagridRowSelectionExtension, AC_DATAGRID_EVENT, AC_DATAGRID_EXTENSION_NAME, AC_DATAGRID_HOOK, IAcDatagridColumnDefinition, AcElementBase, acGetParentElementWithTag } from "@autocode-ts/ac-browser";
import { AcDDEApi } from "../../core/ac-dde-api";
import { AC_DDE_TAG } from "../../consts/ac-dde-tag.const";
import { AcDataDictionaryEditorElement } from "../core/ac-data-dictionary-editor.element";
import { AcDDEElementBase } from "../core/ac-dde-element-base.element";
import { AC_DATAGRID_ON_AG_GRID_EXTENSION_NAME, AcDatagridOnAgGridExtension } from "@autocode-ts/ac-datagrid-on-ag-grid";

export class AcDDEDatagridElement extends AcDDEElementBase {
  datagridApi!: AcDatagridApi;

  private afterRowsExtension!: AcDatagridAfterRowsFooterExtension;
  private autoAddNewRowExtension!: AcDatagridAutoAddNewRowExtension;
  private columnDraggingExtension!: AcDatagridColumnDraggingExtension;
  private columnsCustomizerExtension!: AcDatagridColumnsCustomizerExtension;
  private exportXlsxExtension!: AcDatagridDataExportXlsxExtension;
  private rowNumbersExtension!: AcDatagridRowNumbersExtension;
  private rowSelectionExtension!: AcDatagridRowSelectionExtension;
  private rowDraggingExtension!: AcDatagridRowDraggingExtension;
  private agGridExtension!: AcDatagridOnAgGridExtension;

  newRowDataFunction: Function = () => {
    return {};
  };



  override init(): void {
    super.init();
    this.innerHTML = '<ac-datagrid></ac-datagrid>';
    const datagrid = this.querySelector('ac-datagrid') as AcDatagridElement;
    this.datagridApi = datagrid.datagridApi;
    this.initDatagrid();
  }

  initDatagrid() {
      this.datagridApi.defaultColumnDefiniation.allowEdit = true;
      this.datagridApi.usePagination = true;
      this.datagridApi.showAddButton = true;
      this.datagridApi.showSearchInput = true;
      this.datagridApi.hooks.subscribe({
        hook: AC_DATAGRID_HOOK.FooterInit, callback: () => {
          const addNewButton: HTMLElement = this.ownerDocument.createElement('button');
          addNewButton.setAttribute('class', 'btn btn-primary btn-add-new py-0');
          addNewButton.setAttribute('type', 'button');
          addNewButton.setAttribute('style', 'height:28px;');
          addNewButton.innerHTML = 'Add New';
          // this.datagrid!.datagridFooter?.append(addNewButton);
          // addNewButton.addEventListener('click', (event: MouseEvent) => {
          //   this.datagridApi!.addRow({ data: this.newRowDataFunction() });
          // });
        }
      });
      this.datagridApi.on({
        event: AC_DATAGRID_EVENT.RowDataChange, callback: (args: any) => {
          //
        }
      });
      this.datagridApi.rowHeight = 30;
      this.datagridApi.headerHeight = 30;
      this.classList.add("ac-dde-datagrid")

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
      this.delayedCallback.add({
        callback: () => {

          // this.afterRowsExtension.footerElement = this.footerElement;
          this.datagridApi!.on({
            event: AC_DATAGRID_EVENT.StateChange, callback: (args: any) => {
              //
            }
          })
        }, duration: 500
      });
  }


}
