/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @nx/enforce-module-boundaries */
import { AcElement, acRouter, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDatagrid, AcDatagridApi, AcDatagridExtensionManager, AC_DATAGRID_EXTENSION_NAME, AcDatagridRowNumbersExtension, AcDatagridAutoAddNewRowExtension, AcDatagridColumnDraggingExtension, AcDatagridColumnsCustomizerExtension, AcDatagridDataExportXlsxExtension, AcDatagridRowDraggingExtension, AcDatagridRowSelectionExtension } from '@autocode-ts/ac-browser';
import { AcDatagridOnAgGridExtension, AC_DATAGRID_ON_AG_GRID_EXTENSION_NAME, AgGridOnAcDatagrid } from '@autocode-ts/ac-datagrid-on-ag-grid';
import { customersData } from './../../../../data/customers-data';
import { APP_ROUTES } from "../../shared/consts/app-routes.consts";
import { AcDelayedCallback, Autocode } from "@autocode-ts/autocode";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'aggrid-local-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AgGrid with Local Data'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="p-2 flex-fill">
        <ac-datagrid #datagrid></ac-datagrid>
      </div>
    </div>
  `
})
export class AggridLocalPage {
  @AcViewChild('#datagrid') datagrid!: AcDatagrid;
  datagridApi!: AcDatagridApi;
  agGridExtension!: AcDatagridOnAgGridExtension;
  autoAddRowExtension!: AcDatagridAutoAddNewRowExtension;
  columnDraggingExtension!: AcDatagridColumnDraggingExtension;
  columnsCustomizerExtension!: AcDatagridColumnsCustomizerExtension;
  dataExportXlsxExtension!: AcDatagridDataExportXlsxExtension;
  rowDraggingExtension!: AcDatagridRowDraggingExtension;
  rowNumbersExtension!: AcDatagridRowNumbersExtension;
  rowSelectionExtension!: AcDatagridRowSelectionExtension;

  delayedCallback: AcDelayedCallback = new AcDelayedCallback();
  dropdownItems: IAppMenuItem[] = [
    { label: 'Row Numbers',isHeader:true },
    {
      label: 'Show Row Numbers', callback: () => {
        this.rowNumbersExtension.showRowNumbers = true;
      }
    },
    {
      label: 'Hide Row Numbers', callback: () => {
        this.rowNumbersExtension.showRowNumbers = false;
        console.log(this.datagridApi);
      }
    },
    { label: 'Customization',isHeader:true },
    {
      label: 'Toggle Columns Customizer', callback: () => {
        this.columnsCustomizerExtension.toggleColumnsCustomizer();
      }
    },
    { label: 'Export',isHeader:true },
    {
      label: 'Export XLSX', callback: () => {
        this.dataExportXlsxExtension.exportData({ fileName: 'Customer Data.xlsx' });
      }
    },
    { label: 'Selection and Focus',isHeader:true },
    {
      label: 'Goto First Row', callback: () => {
        this.datagridApi.focusFirstRow({ highlightCells: true });
      }
    },
    {
      label: 'Goto Last Row', callback: () => {
        this.datagridApi.focusLastRow({ highlightCells: true });
      }
    },
    {
      label: 'Clear Selection', callback: () => {
        this.rowSelectionExtension.clearSelection();
      }
    },
    {
      label: 'Select All Rows', callback: () => {
        // this.rowSelectionExtension.setAllRowsSelection({ isSelected: true });
      }
    },
    {
      label: 'Get Selected Rows', callback: () => {
        console.log(this.rowSelectionExtension.getSelectedRows());
      }
    },
    {
      label: 'Get Selected Rows Data', callback: () => {
        console.log(this.rowSelectionExtension.getSelectedRowsData());
      }
    },
    { label: 'Miscellenous',isHeader:true },
    {
      label: 'Auto Add New Row',
      callback: () => {
        this.datagridApi.addRow({ data: { 'customer_id': Autocode.uuid() } });
      }
    }
  ];

  acOnInit() {
    AcDatagridExtensionManager.register(AgGridOnAcDatagrid);
    this.initDatagrid();
  }

  initDatagrid() {
    if (this.datagrid) {
      this.datagridApi = this.datagrid.datagridApi;
      console.log("Init Datagrid");
      this.columnDraggingExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.ColumnDragging }) as AcDatagridColumnDraggingExtension;
      this.columnsCustomizerExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.ColumnsCustomizer }) as AcDatagridColumnsCustomizerExtension;
      this.dataExportXlsxExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.DataExportXlsx }) as AcDatagridDataExportXlsxExtension;
      this.rowNumbersExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowNumbers }) as AcDatagridRowNumbersExtension;
      this.rowSelectionExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowSelection }) as AcDatagridRowSelectionExtension;
      this.rowDraggingExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowDragging }) as AcDatagridRowDraggingExtension;
      this.autoAddRowExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.AutoAddNewRow }) as AcDatagridAutoAddNewRowExtension;


      console.log("this");
      this.agGridExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_ON_AG_GRID_EXTENSION_NAME }) as AcDatagridOnAgGridExtension;

      this.datagridApi.usePagination = true;

      this.columnsCustomizerExtension.showColumnCustomizerPanel = true;

      this.rowNumbersExtension.showRowNumbers = true;

      this.rowSelectionExtension.allowSelection = true;
      this.rowSelectionExtension.allowMultipleSelection = true;
      this.autoAddRowExtension.autoAddNewRow = true;

      this.datagridApi.columnDefinitions = [
        // { field: 'action', title: "", allowSort: false, cellRendererElement: ActionsDatagridColumn, width: 65,pinnedOn:'LEFT' },
        { field: 'customer_id', title: "Id", visible: true },
        { field: 'first_name', title: "First Name", allowEdit: true },
        { field: 'last_name', title: "Last Name", allowEdit: true },
        { field: 'company', title: "Company", allowEdit: true },
        { field: 'city', title: "City", allowEdit: true },
        { field: 'country', title: "Country", allowEdit: true },
        { field: 'phone_1', title: "Phone 1" },
        { field: 'phone_2', title: "Phone 2" },
        { field: 'email', title: "Email" },
        { field: 'subscription_date', title: "Subscription Date" },
        { field: 'website', title: "Website" },

      ];

      console.log(this);
      this.setLocalData();
    }
    else {
      this.delayedCallback.add({
        callback: () => {
          this.initDatagrid();
        }, duration: 100
      });
    }

  }

  setLocalData() {
    const data: any[] = [];
    const multiplier = 1;
    let index: number = 0;
    for (let i = 0; i < multiplier; i++) {
      for (const row of customersData.splice(0, 10)) {
        index++;
        data.push({ index: index, ...row });
      }
    }
    setTimeout(() => {
      this.datagridApi.dataManager.data = data;
    }, 10);
  }

  // exportXlsx() {
  //     const ext = this.datagridApi.getExtension({name: AC_DATAGRID_EXTENSION_NAME.DataExportXlsx}) as any;
  //     ext?.exportData({ fileName: 'CustomerData.xlsx' });
  // }

  // toggleCustomizer() {
  //     const ext = this.datagridApi.getExtension({name: AC_DATAGRID_EXTENSION_NAME.ColumnsCustomizer}) as any;
  //     ext?.toggleColumnsCustomizer();
  // }
}

