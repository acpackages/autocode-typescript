/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @nx/enforce-module-boundaries */
/* eslint-disable prefer-const */
import { AcRepeaterElement, acInit, IAcRepeaterRowRendererElementArgs } from '@autocode-ts/ac-browser';
import { customersData } from './../../../../data/customers-data';
import { AcDataManager, IAcOnDemandRequestArgs } from '@autocode-ts/autocode';

export class RepeaterOnDemandPage extends HTMLElement {
  public static observedAttributes = [];
  repeater?: AcRepeaterElement;

  async connectedCallback() {
    acInit();
    const html = `
      <div class="p-3">
        <h5>Repeater : Local Data</h5>
        <p class="text-muted">A simple list rendered using AcRepeater with virtual scrolling.</p>
        <ac-repeater style="height:80vh"></ac-repeater>
      </div>
    `;
    this.innerHTML = html;

    this.repeater = this.querySelector('ac-repeater') as any;

    if (this.repeater && this.repeater.repeaterApi) {
      this.repeater.repeaterApi.usePagination = true;
      console.log(this.repeater.repeaterApi);
      this.repeater.repeaterApi.rowRendererFunction = (args: IAcRepeaterRowRendererElementArgs) => {
        const data = args.row.data;
        const element = document.createElement('div');

        element.style.padding = '15px';
        element.style.borderBottom = '1px solid #eee';
        element.style.display = 'flex';
        element.style.flexDirection = 'column';
        element.style.gap = '5px';

        element.innerHTML = `
          <div style="font-weight: bold; color: #333;">${args.row.index + 1} :  ${data.first_name} ${data.last_name}</div>
          <div style="font-size: 0.9rem; color: #666;">
            <span style="margin-right: 15px;"><i class="fa fa-building"></i> ${data.company}</span>
            <span><i class="fa fa-envelope"></i> ${data.email}</span>
          </div>
          <div style="font-size: 0.8rem; color: #999;">
            <i class="fa fa-map-marker"></i> ${data.city}, ${data.country}
          </div>
        `;
        return element;
      };

      this.setOnDemandData();
    }
    // Custom row rendering

  }

  setLocalData() {
    const data: any[] = [];
    const multiplier = 1;
    let index: number = 0;
    for (let i = 0; i < multiplier; i++) {
      for (const row of customersData) {
        index++;
        data.push({ index: index, ...row });
      }
    }
    this.repeater!.repeaterApi.dataManager.data = data;
  }

  setOnDemandData() {
    const onDemandProxyDataManager: AcDataManager = new AcDataManager();
    const data: any[] = [];
    const multiplier = 1;
    let index: number = 0;
    for (let i = 0; i < multiplier; i++) {
      for (const row of customersData.splice(0,500)) {
        index++;
        data.push({ index: index, ...row })
      }
    }
    onDemandProxyDataManager.data = data;

    this.repeater!.repeaterApi.dataManager.onDemandFunction = async (args: IAcOnDemandRequestArgs) => {
      if (args.filterGroup) {
        onDemandProxyDataManager.filterGroup = args.filterGroup;
      }
      if (args.sortOrder) {
        onDemandProxyDataManager.sortOrder = args.sortOrder;
      }
      console.log("Getting rows",args.startIndex,args.rowsCount);
      onDemandProxyDataManager.searchQuery = args.searchQuery ?? '';
      onDemandProxyDataManager.processRows();
      const totalCount = onDemandProxyDataManager.totalRows;
      const data = await onDemandProxyDataManager.getData({ startIndex: args.startIndex, rowsCount: args.rowsCount });
      const response = {
        totalCount,
        data
      };
      console.log("Returning rows",response);
      args.successCallback(response);
    };
  }
}
