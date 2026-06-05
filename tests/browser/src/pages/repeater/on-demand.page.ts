import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcRepeaterElement, IAcRepeaterRowRendererElementArgs } from "@autocode-ts/ac-browser";
import { AcDataManager, IAcOnDemandRequestArgs } from "@autocode-ts/autocode";
import { customersData } from "../../data/customers-data";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'repeater-on-demand-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AcRepeater : On-Demand Data'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="p-3 flex-fill overflow-hidden d-flex flex-column">
        <p class="text-muted small mb-3">Fetching data dynamically as you scroll. Simulates a backend API response.</p>
        <div class="flex-fill border rounded bg-white overflow-hidden">
          <ac-repeater #repeater class="h-100"></ac-repeater>
        </div>
      </div>
    </div>
  `
})
export class RepeaterOnDemandPage {
  @AcViewChild('#repeater') repeater!: AcRepeaterElement;

  dropdownItems: IAppMenuItem[] = [{ label: 'On-Demand Config', isHeader: true }];

  acOnInit() {
    const api = this.repeater.repeaterApi;

    api.usePagination = true;
    api.rowRendererFunction = (args: IAcRepeaterRowRendererElementArgs) => {
      const data = args.row.data;
      const element = document.createElement('div');
      element.className = 'p-4 border-bottom shadow-hover';
      element.innerHTML = `
        <div class="row align-items-center">
          <div class="col-auto">
            <div class="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 45px; height: 45px; font-weight: bold;">
              ${data.first_name[0]}${data.last_name[0]}
            </div>
          </div>
          <div class="col">
            <h6 class="mb-1 fw-bold">${data.first_name} ${data.last_name}</h6>
            <div class="text-muted small">
              <span class="me-3"><i class="fa-solid fa-briefcase me-1 opacity-50"></i> ${data.company}</span>
              <span><i class="fa-solid fa-hashtag me-1 opacity-50"></i> ID: ${args.row.index + 1}</span>
            </div>
          </div>
          <div class="col-auto">
             <button class="btn btn-sm btn-outline-secondary rounded-pill px-3">View Details</button>
          </div>
        </div>
      `;
      return element;
    };

    this.setOnDemandData();
  }

  setOnDemandData() {
    // Setup a proxy data manager to simulate server-side processing
    const proxyManager = new AcDataManager();
    proxyManager.data = customersData.map((row, i) => ({ ...row, index: i + 1 }));

    this.repeater.repeaterApi.dataManager.onDemandFunction = async (args: IAcOnDemandRequestArgs) => {
      console.log(`[Repeater] Requesting index ${args.startIndex} for ${args.rowsCount} rows`);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      if (args.filterGroup) proxyManager.filterGroup = args.filterGroup;
      if (args.sortOrder) proxyManager.sortOrder = args.sortOrder;

      proxyManager.searchQuery = args.searchQuery ?? '';
      proxyManager.processRows();

      const response = {
        totalCount: proxyManager.totalRows,
        data: await proxyManager.getData({ startIndex: args.startIndex, rowsCount: args.rowsCount })
      };

      args.successCallback(response);
    };
  }
}
