/* eslint-disable @nx/enforce-module-boundaries */
/* eslint-disable prefer-const */
import { AcRepeaterElement, acInit, IAcRepeaterRowRendererElementArgs } from '@autocode-ts/ac-browser';
import { customersData } from './../../../../data/customers-data';

export class RepeaterOfflinePage extends HTMLElement {
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

      // Append to container

      // Set data
      const data = customersData.slice(0, 1000);
      this.repeater.repeaterApi.data = data;
      this.repeater.repeaterApi.fields = [
        {key:'first_name',label:"First Name",type:'STRING',allowFilter:true,allowSort:true}
      ]
    }
    // Custom row rendering

  }
}
