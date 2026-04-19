/* eslint-disable @nx/enforce-module-boundaries */
import { AcDatagrid, AcDatagridApi, AcDatagridExtensionManager, AcDatagridRowSelectionExtension, AC_DATAGRID_EXTENSION_NAME, AcDatagridRowDraggingExtension, AcDatagridRowNumbersExtension, AC_DATAGRID_EVENT, IAcDatagridCellRendererElementInitEvent, AcDatagridColumnDraggingExtension, AcDatagridColumnsCustomizerExtension, AcDatagridDataExportXlsxExtension, AcDatagridAutoAddNewRowExtension } from '@autocode-ts/ac-browser';
import { AcDatagridOnAgGridExtension, AC_DATAGRID_ON_AG_GRID_EXTENSION_NAME, AgGridOnAcDatagrid } from '@autocode-ts/ac-datagrid-on-ag-grid';
import { PageHeader } from '../../components/page-header/page-header.component';
import { ActionsDatagridColumn } from '../../components/actions-datagrid-column/actions-datagrid-column.component';
import { customersData } from './../../../../data/customers-data';
import { Autocode } from '@autocode-ts/autocode';

export class AggridLocalData extends HTMLElement {
  datagrid!: AcDatagrid;
  datagridApi!: AcDatagridApi;
  pageHeader: PageHeader = new PageHeader();
  agGridExtension!: AcDatagridOnAgGridExtension;
  autoAddRowExtension!: AcDatagridAutoAddNewRowExtension;
  columnDraggingExtension!: AcDatagridColumnDraggingExtension;
  columnsCustomizerExtension!: AcDatagridColumnsCustomizerExtension;
  dataExportXlsxExtension!: AcDatagridDataExportXlsxExtension;
  rowDraggingExtension!: AcDatagridRowDraggingExtension;
  rowNumbersExtension!: AcDatagridRowNumbersExtension;
  rowSelectionExtension!: AcDatagridRowSelectionExtension;
  async connectedCallback() {
    const html = `
      <div id="aggridContainer" class="aggrid-container" style="height:calc(100vh - 60px);">
      <ac-datagrid id="datagrid"></ac-datagrid>
      </div>
    `;
    this.innerHTML = html;
    this.style.height = '100vh;'
    this.prepend(this.pageHeader.element);
    this.pageHeader.pageTitle = 'AGGrid on AcDatagrid : Offline Data';
    this.initDatagrid();
  }

  async initDatagrid() {
    this.datagrid = document.querySelector<AcDatagrid>('#datagrid')!;
    AcDatagridExtensionManager.register(AgGridOnAcDatagrid);
    this.datagridApi = this.datagrid.datagridApi;

    this.agGridExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_ON_AG_GRID_EXTENSION_NAME }) as AcDatagridOnAgGridExtension;
    this.columnDraggingExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.ColumnDragging }) as AcDatagridColumnDraggingExtension;
    this.columnsCustomizerExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.ColumnsCustomizer }) as AcDatagridColumnsCustomizerExtension;
    this.dataExportXlsxExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.DataExportXlsx }) as AcDatagridDataExportXlsxExtension;
    this.rowNumbersExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowNumbers }) as AcDatagridRowNumbersExtension;
    this.rowSelectionExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowSelection }) as AcDatagridRowSelectionExtension;
    this.rowDraggingExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowDragging }) as AcDatagridRowDraggingExtension;
    this.autoAddRowExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.AutoAddNewRow }) as AcDatagridAutoAddNewRowExtension;

    this.datagridApi.usePagination = true;

    this.columnsCustomizerExtension.showColumnCustomizerPanel = true;

    this.rowNumbersExtension.showRowNumbers = true;

    this.rowSelectionExtension.allowSelection = true;
    this.rowSelectionExtension.allowMultipleSelection = true;
    this.autoAddRowExtension.autoAddNewRow = true;
    console.log(this.datagridApi);

    // this.getElementsByClassName("aggrid-container")[0].append(this.datagrid.element);
    this.datagridApi.columnDefinitions = [
      { field: 'action', title: "", allowSort: false, cellRendererElement: ActionsDatagridColumn, width: 65,pinnedOn:'LEFT' },
      { field: 'customer_id', title: "Id" ,visible:true},
      { field: 'first_name', title: "First Name", allowEdit: true },
      { field: 'last_name', title: "Last Name", allowEdit: true },
      { field: 'company', title: "Company", allowEdit: true },
      { field: 'city', title: "City", allowEdit: true },
      { field: 'country', title: "Country" , allowEdit: true},
      { field: 'phone_1', title: "Phone 1" },
      { field: 'phone_2', title: "Phone 2" },
      { field: 'email', title: "Email" },
      { field: 'subscription_date', title: "Subscription Date" },
      { field: 'website', title: "Website" },

    ];

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

      ]
    });

    this.pageHeader.addMenuItem({
      label: 'Miscellenous',
      children: [
        {
          label: 'Auto Add New Row',
          callback: () => {
            this.datagridApi.addRow({data:{'customer_id':Autocode.uuid()}});
          }
        },
      ]
    });
    this.datagridApi.events.subscribeAllEvents({
      callback: (eventName: string, args: any) => {
        const skipEvents: any[] = [
          AC_DATAGRID_EVENT.CellRendererElementInit
        ];
        if (!skipEvents.includes(eventName)) {
          // console.log(`Found event : ${eventName}`, args);
        }
      }
    });

    this.setLocalData();
  }

  setLocalData() {
      const data: any[] = [];
      const multiplier = 1;
      let index: number = 0;
      for (let i = 0; i < multiplier; i++) {
        for (const row of customersData.splice(0,10)) {
          index++;
          data.push({ index: index, ...row });
        }
      }
      setTimeout(() => {
        this.datagridApi.dataManager.data = data;
      }, 10);
    }
}
