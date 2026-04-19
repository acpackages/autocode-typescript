/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @nx/enforce-module-boundaries */
import { AcDataCache, AcEnumConditionOperator, AcEnumLogicalOperator, AcFilterGroup, IAcFilterGroup, IAcOnDemandRequestArgs } from "@autocode-ts/autocode";
import { customersData } from "../../../../data/customers-data";
import { PageHeader } from "../../components/page-header/page-header.component";
import { AcModal } from "@autocode-ts/ac-browser";

export class AcDataCacheTestPage extends HTMLElement {
  pageHeader: PageHeader = new PageHeader();
  dataCache: AcDataCache = new AcDataCache();

  filterKey: any = '';
  filterOperator: any = '';
  filterValue: any = '';

  getCurrentPage: number = 0;
  getStartIndex: number = 0;
  getRowsCount: number = 100;

  connectedCallback() {
    this.prepend(this.pageHeader.element);
    this.pageHeader.pageTitle = 'Data Cache Tests';
    this.dataCache.onDemandFunction = async ({ collection, args }: { collection: string, args: IAcOnDemandRequestArgs }) => {
      const response = {
        totalCount: customersData.length,
        data: customersData
      };
      console.log(response);
      args.successCallback(response);
    };
    this.dataCache.registerCollection({ collection: 'customers', 'uniqueRowKey': 'customer_id' });

    // ONLINE DATA END

    this.registerHeaderActions();
  }

  registerHeaderActions() {
    this.pageHeader.addMenuItem({
      label: 'Actions',
      children: [
        {
          label: 'Log',
          callback: () => {
            console.log(this.dataCache);
          }
        },
        {
          label: 'Filter',
          callback: () => {
            this.openFilterModal();
          }
        },
        {
          label: 'Get Rows',
          callback: () => {
            this.openGetOnDemandRowsModal();
          }
        },
        {
          label: 'Refresh Rows',
          callback: () => {
            this.dataCache.refreshCollection({ collection: 'customers' });
          }
        }
      ]
    });
  }

  openGetOnDemandRowsModal() {
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

    pageInput.value = `${this.getCurrentPage}`;
    rowsInput.value = `${this.getRowsCount}`;
    getButton.addEventListener('click', async () => {
      this.getCurrentPage = parseInt(pageInput.value);
      this.getRowsCount = parseInt(rowsInput.value);
      const response = await this.dataCache.getRows({ collection: 'customers', pageSize: this.getRowsCount, pageNumber: this.getCurrentPage });
      console.log(response);
      modal.close();
    })

    modal.on({
      event: 'close', callback: () => {
        modal.remove();
      }
    });
    this.ownerDocument.querySelector('body')?.append(modal);
    modal.open();
    //
  }

  openFilterModal() {
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

    for (const key of Object.keys(customersData[0])) {
      filterKeyInput.innerHTML += `<option value="${key}">${key}</option>`;
    }

    for (const operator of Object.values(AcEnumConditionOperator)) {
      filterOperatorInput.innerHTML += `<option value="${operator}">${operator}</option>`;
    }

    filterKeyInput.value = this.filterKey;
    filterOperatorInput.value = this.filterOperator;
    filterValueInput.value = this.filterValue;

    applyButton.addEventListener('click', async () => {
      this.filterKey = filterKeyInput.value;
      this.filterOperator = filterOperatorInput.value;
      this.filterValue = filterValueInput.value;
      const filterGroup: IAcFilterGroup = {
        operator: AcEnumLogicalOperator.And,
        filters: [
          {
            key: this.filterKey,
            operator: this.filterOperator,
            value: this.filterValue
          }
        ]
      };
      console.log(filterGroup);
      const rows = await this.dataCache.getRows({ collection: 'customers', filters: filterGroup });
      console.log(rows);
      // const rows = await dataManager.getRows({startIndex:this.onDemandStartIndex,rowsCount:this.onDemandRowsCount});
      modal.close();
    })

    modal.on({
      event: 'close', callback: () => {
        modal.remove();
      }
    });
    this.ownerDocument.querySelector('body')?.append(modal);
    modal.open();
    //
  }
}
