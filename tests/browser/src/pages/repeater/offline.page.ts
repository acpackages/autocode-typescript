import { acCreateRuntimeInstance, AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcRepeaterElement, IAcRepeaterRowRendererElementArgs } from "@autocode-ts/ac-browser";
import { customersData } from "../../../../data/customers-data";
import { IAppMenuItem } from "src/shared/interfaces/app-menu-item.interface";
import { RepeaterListItem } from "./repeater-list-item.element";

@AcElement({
  selector: 'repeater-offline-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AcRepeater : Local Data'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="p-3 flex-fill overflow-hidden d-flex flex-column">
        <p class="text-muted small mb-3">A high-performance list using virtual scrolling for local datasets.</p>
        <div class="flex-fill border rounded bg-white overflow-hidden">
          <ac-repeater #repeater class="h-100"></ac-repeater>
        </div>
      </div>
    </div>
  `
})
export class RepeaterOfflinePage {
  @AcViewChild('#repeater') repeater!: AcRepeaterElement;

  dropdownItems: IAppMenuItem[] = [
    { label: 'Repeater Actions', isHeader: true },
    { label: 'Refresh Data', callback: () => this.loadData() }
  ];

  acOnInit() {
    const api = this.repeater.repeaterApi;

    api.usePagination = true;
    api.rowRendererFunction = (args: IAcRepeaterRowRendererElementArgs) => {
      const data = args.row.data;
      // const instance = acCreateRuntimeInstance({type:RepeaterListItem});
      // console.log(instance);
      const element = document.createElement('div');
      element.className = 'p-3 border-bottom hover-bg-light transition-all';
      element.style.cursor = 'default';

      element.innerHTML = `
        <div class="d-flex align-items-center mb-1">
          <span class="badge bg-secondary me-2" style="width: 28px;">#${args.row.index + 1}</span>
          <span class="fw-bold text-dark">${data.first_name} ${data.last_name}</span>
        </div>
        <div class="text-muted small d-flex flex-wrap gap-3">
          <span><i class="fa-solid fa-building me-1 opacity-50"></i> ${data.company}</span>
          <span><i class="fa-solid fa-envelope me-1 opacity-50"></i> ${data.email}</span>
          <span><i class="fa-solid fa-location-dot me-1 opacity-50"></i> ${data.city}, ${data.country}</span>
        </div>
      `;
      return element;
    };

    this.loadData();
  }

  loadData() {
    this.repeater.repeaterApi.data = customersData.slice(0, 1000);
  }
}
