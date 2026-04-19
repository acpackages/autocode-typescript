/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @nx/enforce-module-boundaries */
import { AcDataManager, AcEnumConditionOperator, IAcOnDemandRequestArgs } from "@autocode-ts/autocode";
import { customersData } from "../../../../data/customers-data";
import { PageHeader } from "../../components/page-header/page-header.component";
import { AcModal } from "@autocode-ts/ac-browser";

export class AcDataManagerTestPage extends HTMLElement {
  pageHeader: PageHeader = new PageHeader();
  offlineDataManager: AcDataManager = new AcDataManager();
  onDemandProxyDataManager: AcDataManager = new AcDataManager();
  onDemandDataManager: AcDataManager = new AcDataManager();
  onDemandCurrentPage:number = 0;
  onDemandStartIndex:number = 0;
  onDemandRowsCount:number = 100;

  filterKey:any = '';
  filterOperator:any = '';
  filterValue:any = '';

  connectedCallback() {
    this.prepend(this.pageHeader.element);
    this.pageHeader.pageTitle = 'Data Manager Tests';

    // OFFLINE DATA START

    this.offlineDataManager.autoSetUniqueIdToData = true;
    this.offlineDataManager.data = customersData;

    this.onDemandProxyDataManager.data = customersData;

    // OFFLINE DATA END

    // ONLINE DATA START

    this.onDemandDataManager.autoSetUniqueIdToData = true;
    this.onDemandDataManager.onDemandFunction = async (args: IAcOnDemandRequestArgs) => {
      console.log("Getting on demand data");
      console.log(args);
      if (args.filterGroup && args.filterGroup.filters && args.filterGroup.filters.length > 0) {
        this.onDemandProxyDataManager.filterGroup = args.filterGroup;
        this.onDemandProxyDataManager.processRows();
      }

      const totalCount = this.onDemandProxyDataManager.totalRows;
      const data = await this.onDemandProxyDataManager.getData({ startIndex: args.startIndex, rowsCount: args.rowsCount });
      const response = {
        totalCount,
        data
      };
      console.log(response);
      args.successCallback(response);
    };

    // ONLINE DATA END

    this.registerHeaderActions();
  }

  registerHeaderActions(){
    this.pageHeader.addMenuItem({
      label: 'Offline',
      children: [
        {
          label: 'Log',
          callback: () => {
            console.log(this.offlineDataManager);
          }
        },
        {
          label: 'Filter',
          callback: () => {
            this.openFilterModal(this.offlineDataManager);
          }
        },
      ]
    });
    this.pageHeader.addMenuItem({
      label: 'Online',
      children: [
        {
          label: 'Log',
          callback: () => {
            console.log(this.onDemandDataManager);
          }
        },
        {
          label: 'Get Rows',
          callback: () => {
            this.openGetOnDemandRowsModal();
          }
        },
        {
          label: 'Filter',
          callback: () => {
            this.openFilterModal(this.onDemandDataManager);
          }
        },
      ]
    });
  }

  openGetOnDemandRowsModal(){
    const modal = new AcModal();
    modal.innerHTML = `<div class="bg-white p-3" style="border-radius:10px">
      <div class="form-group mb-3">
        <label>Page No</label>
        <input type="number" class="form-control page-number">
      </div>
      <div class="form-group mb-3">
        <label>Rows Count</label>
        <input type="number" class="form-control rows-count">
      </div>
      <button type="button" class="btn btn-primary get-button" >Get Rows</button>
    </div>`;

    const pageInput = modal.querySelector('.page-number') as HTMLInputElement;
    const rowsInput = modal.querySelector('.rows-count') as HTMLInputElement;
    const getButton = modal.querySelector('.get-button') as HTMLButtonElement;

    pageInput.value = `${this.onDemandCurrentPage}`;
    rowsInput.value = `${this.onDemandRowsCount}`;
    getButton.addEventListener('click',()=>{
      this.onDemandCurrentPage = parseInt(pageInput.value);
      this.onDemandRowsCount = parseInt(rowsInput.value);
      this.onDemandStartIndex = this.onDemandCurrentPage * this.onDemandRowsCount;
      this.onDemandDataManager.getRows({startIndex:this.onDemandStartIndex,rowsCount:this.onDemandRowsCount});
      console.log(this.onDemandDataManager);
      modal.close();
      this.onDemandCurrentPage++;
    })

    modal.on({event:'close',callback:()=>{
      modal.remove();
    }});
    this.ownerDocument.querySelector('body')?.append(modal);
    modal.open();
    //
  }

  openFilterModal(dataManager:AcDataManager){
    const modal = new AcModal();
    modal.innerHTML = `<div class="bg-white p-3" style="border-radius:10px">
      <div class="form-group mb-3">
        <label>Key</label>
        <select class="form-control filter-key" placeholder="Select Key">
          <option>Select Key</option>
        </select>
      </div>
      <div class="form-group mb-3">
        <label>Operator</label>
        <select class="form-control filter-operator" placeholder="Select Operator">
        </select>
      </div>
      <div class="form-group mb-3">
        <label>Value</label>
        <input type="text" class="form-control filter-value" placeholder="Filter Value">
      </div>
      <button type="button" class="btn btn-primary apply-button" >Filter Rows</button>
    </div>`;

    const filterKeyInput = modal.querySelector('.filter-key') as HTMLSelectElement;
    const filterOperatorInput = modal.querySelector('.filter-operator') as HTMLSelectElement;
    const filterValueInput = modal.querySelector('.filter-value') as HTMLInputElement;
    const applyButton = modal.querySelector('.apply-button') as HTMLButtonElement;

    for(const key of Object.keys(customersData[0])){
      filterKeyInput.innerHTML += `<option value="${key}">${key}</option>`;
    }

    for(const operator of Object.values(AcEnumConditionOperator)){
      filterOperatorInput.innerHTML += `<option value="${operator}">${operator}</option>`;
    }

    filterKeyInput.value = this.filterKey;
    filterOperatorInput.value = this.filterOperator;
    filterValueInput.value = this.filterValue;

    applyButton.addEventListener('click',async ()=>{
      this.filterKey = filterKeyInput.value;
      this.filterOperator = filterOperatorInput.value;
      this.filterValue = filterValueInput.value;
      dataManager.filterGroup.setFilter({
        key:this.filterKey,
        operator:this.filterOperator,
        value:this.filterValue
      })
      console.log(dataManager);
      // const rows = await dataManager.getRows({startIndex:this.onDemandStartIndex,rowsCount:this.onDemandRowsCount});
      modal.close();
    })

    modal.on({event:'close',callback:()=>{
      modal.remove();
    }});
    this.ownerDocument.querySelector('body')?.append(modal);
    modal.open();
    //
  }
}
