/* eslint-disable @nx/enforce-module-boundaries */
import { AcDatagridOnAgGridExtension, AC_DATAGRID_ON_AG_GRID_EXTENSION_NAME, AgGridOnAcDatagrid } from '@autocode-ts/ac-datagrid-on-ag-grid';
import './../../../../../packages/browser/ac-browser/src/lib/components/ac-datagrid/css/ac-datagrid.css';
import './../../../../../packages/browser/ac-browser/src/lib/components/ac-pagination/css/ac-pagination.css';
import { AcDatagrid, AcDatagridApi, AcDatagridExtensionManager, AcDatagridTreeTableExtension, AC_DATAGRID_EXTENSION_NAME, AcDatagridRowSelectionExtension, AcDatagridRowDraggingExtension, AcDatagridRowNumbersExtension, AcDatagridColumnDraggingExtension, AcDatagridDataExportXlsxExtension, AcDatagridColumnsCustomizerExtension, AC_DATAGRID_EVENT } from '@autocode-ts/ac-browser';
import { PageHeader } from '../../components/page-header/page-header.component';

export class AggridLocalDataTree extends HTMLElement {
  datagrid!: AcDatagrid;
  datagridApi!: AcDatagridApi;
  pageHeader: PageHeader = new PageHeader();
  agGridExtension!: AcDatagridOnAgGridExtension;
  columnDraggingExtension!: AcDatagridColumnDraggingExtension;
  columnsCustomizerExtension!: AcDatagridColumnsCustomizerExtension;
  dataExportXlsxExtension!: AcDatagridDataExportXlsxExtension;
  rowDraggingExtension!: AcDatagridRowDraggingExtension;
  rowNumbersExtension!: AcDatagridRowNumbersExtension;
  rowSelectionExtension!: AcDatagridRowSelectionExtension;
  treeTableExtension!: AcDatagridTreeTableExtension;
  async connectedCallback() {
    const html = `
        <div id="aggridContainer" class="aggrid-container" style="height:calc(100vh - 60px);"></div>
      `;
    this.innerHTML = html;
    this.style.height = '100vh;'
    this.prepend(this.pageHeader.element);
    this.pageHeader.pageTitle = 'AGGrid on AcDatagrid : Offline Data';
    this.initDatagrid();
  }

  async initDatagrid() {
    const gridDiv = document.querySelector<HTMLElement>('#aggridContainer');
    if (gridDiv) {
      AcDatagridExtensionManager.register(AgGridOnAcDatagrid);
      this.datagrid = new AcDatagrid();
      this.datagridApi = this.datagrid.datagridApi;

      this.columnDraggingExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.ColumnDragging }) as AcDatagridColumnDraggingExtension;
      this.columnsCustomizerExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.ColumnsCustomizer }) as AcDatagridColumnsCustomizerExtension;
      this.dataExportXlsxExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.DataExportXlsx }) as AcDatagridDataExportXlsxExtension;
      this.rowNumbersExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowNumbers }) as AcDatagridRowNumbersExtension;
      this.treeTableExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.TreeTable }) as AcDatagridTreeTableExtension;
      this.rowSelectionExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowSelection }) as AcDatagridRowSelectionExtension;
      this.rowDraggingExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowDragging }) as AcDatagridRowDraggingExtension;
      this.agGridExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_ON_AG_GRID_EXTENSION_NAME }) as AcDatagridOnAgGridExtension;

      this.datagridApi.usePagination = false;

      this.rowDraggingExtension.allowRowDragging = true;

      this.rowSelectionExtension.allowSelection = true;
      this.rowSelectionExtension.allowMultipleSelection = true;

      this.treeTableExtension.treeDataParentKey = 'category_id';
      this.treeTableExtension.treeDataChildKey = 'parent_category_id';
      this.treeTableExtension.treeDataDisplayKey = 'name';

      this.getElementsByClassName("aggrid-container")[0].append(this.datagrid.element);
      this.datagridApi.columnDefinitions = [
        { field: 'name', title: "Name", width: 300 },
        { field: 'description', title: "Description", width: 900 },
        { field: 'category_id', title: "Id" },
        { field: 'parent_category_id', title: "Parent Id" },
        { field: 'level', title: "Level" }
      ];
      const res = await fetch('http://autocode.localhost/tests/ac-web/mvc-test/api/product_categories/get?page_size=1500');
      if (res.ok) {
        const response = await res.json();
        this.datagridApi.data = response.rows;
      }

      this.pageHeader.addMenuItem({
        label: 'Row Numbers',
        children: [
          {
            label: 'Show Row Numbers',
            callback: () => {
              this.rowNumbersExtension.showRowNumbers = true;
            }
          },
          {
            label: 'Hide Row Numbers',
            callback: () => {
              this.rowNumbersExtension.showRowNumbers = false;
              console.log(this.datagridApi);
            }
          },
        ]
      });
      this.pageHeader.addMenuItem({
        label: 'Customize & Export',
        children: [
          {
            label: 'Toggle Columns Customizer',
            callback: () => {
              this.columnsCustomizerExtension.toggleColumnsCustomizer();
            }
          },
          {
            label: 'Export XLSX',
            callback: () => {
              this.dataExportXlsxExtension.exportData({ fileName: 'Customer Data.xlsx' });
            }
          },
        ]
      });
      this.pageHeader.addMenuItem({
        label: 'Data & Selection',
        children: [
          {
            label: 'Goto First Row',
            callback: () => {
              this.datagridApi.focusFirstRow({ highlightCells: true });
            }
          },
          {
            label: 'Goto Last Row',
            callback: () => {
              this.datagridApi.focusLastRow({ highlightCells: true });
            }
          },
          {
            label: 'Clear Selection',
            callback: () => {
              this.rowSelectionExtension.clearSelection();
            }
          },
          {
            label: 'Select All Rows',
            callback: () => {
              this.rowSelectionExtension.setAllRowsSelection({ isSelected: true });
            }
          },
          {
            label: 'Get Selected Rows',
            callback: () => {
              console.log(this.rowSelectionExtension.getSelectedRows());
            }
          },
          {
            label: 'Get Selected Rows Data',
            callback: () => {
              console.log(this.rowSelectionExtension.getSelectedRowsData());
            }
          },
          {
            label: 'Log Data in Tree Format',
            callback: () => {
              console.log(this.treeTableExtension.getNestedDataTree({ childrenKey: 'sub_categories' }));
            }
          },

        ]
      });

      this.datagridApi.events.subscribeAllEvents({callback:(eventName:string,args:any)=>{
              const identifiedEvents:any[] = [
                AC_DATAGRID_EVENT.CellClick,
                AC_DATAGRID_EVENT.CellDoubleClick,
                AC_DATAGRID_EVENT.CellEditingStart,
                AC_DATAGRID_EVENT.CellEditingStop,
                AC_DATAGRID_EVENT.CellFocus,
                AC_DATAGRID_EVENT.CellKeyDown,
                AC_DATAGRID_EVENT.CellMouseDown,
                AC_DATAGRID_EVENT.CellMouseLeave,
                AC_DATAGRID_EVENT.CellMouseOver,
                AC_DATAGRID_EVENT.CellRendererElementInit,
                AC_DATAGRID_EVENT.CellValueChange,
                AC_DATAGRID_EVENT.ColumnHeaderClick,
                AC_DATAGRID_EVENT.PaginationChange,
                AC_DATAGRID_EVENT.RowClick,
                AC_DATAGRID_EVENT.RowDoubleClick,
                AC_DATAGRID_EVENT.SortOrderChange
              ];
              if(!identifiedEvents.includes(eventName)){
                console.log(`Found event : ${eventName}`,args);
              }
            }});
    }
  }

}
