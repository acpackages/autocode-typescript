/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @nx/enforce-module-boundaries */
import './../../../../../packages/browser/ac-browser/src/lib/components/ac-datagrid/css/ac-datagrid.css';
import './../../../../../packages/browser/ac-browser/src/lib/components/ac-pagination/css/ac-pagination.css';
import { AcDatagrid, AcDatagridApi, AcDatagridExtensionManager, AC_DATAGRID_EXTENSION_NAME, AC_DATAGRID_HOOK } from '@autocode-ts/ac-browser';
import { customersData } from './../../../../data/customers-data';
import { AcDataManager, IAcOnDemandRequestArgs } from '@autocode-ts/autocode';
import { ACI_SVG_SOLID } from '@autocode-ts/ac-icons';
import { AC_DATAGRID_ON_AG_GRID_EXTENSION_NAME, AcDatagridOnAgGridExtension, AgGridOnAcDatagrid } from '@autocode-ts/ac-datagrid-on-ag-grid';

export class DatagridLocalData extends HTMLElement {
  public static observedAttributes = [];
  datagrid!: AcDatagrid;
  datagridApi!: AcDatagridApi;
  addNewButton: HTMLElement = document.createElement('button');

  async connectedCallback() {
    const html = `
      <h5>Datagrid : Offline Data</h5>
      <input type="text" class="form-control filter-input" placheolder="Serach"/>
      <div class="local-datagrid-container" style="height:80vh;"></div>
    `;
    this.innerHTML = html;
    const filterInput:HTMLInputElement = this.querySelector('.filter-input') as HTMLInputElement;

    this.datagrid = new AcDatagrid();
    this.datagridApi = this.datagrid.datagridApi;
    this.datagridApi.hooks.subscribe({
      hook: AC_DATAGRID_HOOK.FooterInit, callback: () => {
        this.addNewButton.setAttribute('class', 'btn btn-dark btn-add-new py-0 ms-1');
        this.addNewButton.setAttribute('type', 'button');
        this.addNewButton.setAttribute('style', 'height:28px;');
        this.addNewButton.innerHTML = `<ac-svg-icon>${ACI_SVG_SOLID.plus}</ac-svg-icon> Add Row`;
        this.datagrid.datagridFooter.append(this.addNewButton);
        this.addNewButton.addEventListener('click', (event: MouseEvent) => {
          this.datagridApi.addRow({data:{index:this.datagridApi.dataManager.totalRows}});
          console.log("Add clicked",this.datagridApi.dataManager);
        });
      }
    });
    filterInput?.addEventListener('input',()=>{
      console.log(filterInput.value);
      this.datagridApi.dataManager.searchQuery = filterInput.value;
    });
    console.log(this.datagridApi);
    AcDatagridExtensionManager.register(AgGridOnAcDatagrid);
    this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_ON_AG_GRID_EXTENSION_NAME });
    // const selectionExtension:AcDatagridRowSelectionExtension = this.datagridApi.enableExtension({extensionName:AC_DATAGRID_EXTENSION_NAME.RowSelection})!;
    this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowDragging });
    this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.KeyboardActions });
    this.datagridApi.usePagination = true;
    // this.datagridApi.allowRowSelect = true;
    // console.log(this.getElementsByClassName("local-datagrid-container"));
    this.getElementsByClassName("local-datagrid-container")[0].append(this.datagrid);
    this.datagridApi.columnDefinitions = [
      { field: 'index', title: "SrNo.",autoWidth:true,allowEdit:true},
      { field: 'first_name', title: "First Name",autoWidth:true,allowEdit:true},
      { field: 'last_name', title: "Last Name",autoWidth:true,allowEdit:true},
      { field: 'company', title: "Company" },
      { field: 'city', title: "City" },
      { field: 'country', title: "Country" },
      { field: 'phone_1', title: "Phone 1" },
      { field: 'phone_2', title: "Phone 2" },
      { field: 'email', title: "Email" },
      { field: 'subscription_date', title: "Subscription Date",allowEdit:false },
      { field: 'website', title: "Website" },
      { field: 'customer_id', title: "Id",index:2,visible:false },
    ];
    // this.setLocalData();
    this.setOnDemandData();

    // setTimeout(() => {
    //   // this.datagrid.datagridApi.setRowSelection({key:"customer_id",value:'fa51d247-f53c-4f25-8436-9de299bb9160',isSelected:true});
    //   // console.log("Set selection true");
    //   // this.element.checked != this.datagridRow.isSelected
    //   selectionExtension.setAllRowsSelection({isSelected:true});
    //   setTimeout(() => {
    //   // this.datagrid.datagridApi.setRowSelection({key:"customer_id",value:'fa51d247-f53c-4f25-8436-9de299bb9160',isSelected:true});
    //   // console.log("Set selection true");
    //   // this.element.checked != this.datagridRow.isSelected
    //   selectionExtension.setAllRowsSelection({isSelected:false});
    // }, 2500);
    // }, 2500);

    // console.log(this.datagrid);
  }

  // setAddButton(){
  // }

  setLocalData() {
    const data: any[] = [];
    const multiplier = 1;
    let index: number = 0;
    for (let i = 0; i < multiplier; i++) {
      for (const row of customersData) {
        index++;
        data.push({ index: index, ...row })
      }
    }
    this.datagridApi.data = data;
  }

  setOnDemandData() {
    const onDemandProxyDataManager: AcDataManager = new AcDataManager();
    onDemandProxyDataManager.logger.logMessages = false;
    const data: any[] = [];
    const multiplier = 1;
    let index: number = 0;
    for (let i = 0; i < multiplier; i++) {
      for (const row of customersData) {
        index++;
        data.push({ index: index, ...row })
      }
    }
    onDemandProxyDataManager.data = data;

    this.datagridApi.dataManager.onDemandFunction = async (args: IAcOnDemandRequestArgs) => {
      console.log("Getting on demand data");
      console.log(args);
      console.trace();
      if (args.filterGroup) {
        onDemandProxyDataManager.filterGroup = args.filterGroup;
      }
      if (args.sortOrder) {
        onDemandProxyDataManager.sortOrder = args.sortOrder;
      }
      onDemandProxyDataManager.searchQuery = args.searchQuery ?? '';
      onDemandProxyDataManager.processRows();
      const totalCount = onDemandProxyDataManager.totalRows;
      const data = await onDemandProxyDataManager.getData({ startIndex: args.startIndex, rowsCount: args.rowsCount });
      const response = {
        totalCount,
        data
      };
      console.log(response);
      args.successCallback(response);
    };
    // this.datagridApi.dataManager.getRows({rowsCount:50});
  }
}
