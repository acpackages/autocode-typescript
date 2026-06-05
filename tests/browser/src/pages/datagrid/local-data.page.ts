import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDatagridElement,AC_DATAGRID_EXTENSION_NAME,AC_DATAGRID_HOOK} from "@autocode-ts/ac-browser";
import { customersData } from "../../data/customers-data";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'datagrid-local-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AcDatagridElement : Local Data'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="p-3 flex-fill overflow-hidden d-flex flex-column">
        <div class="mb-3">
          <input type="text" class="form-control" placeholder="Search rows..." (input)="onSearch($event)">
        </div>
        <div class="flex-fill border rounded overflow-hidden">
          <ac-datagrid #grid class="h-100"></ac-datagrid>
        </div>
      </div>
    </div>
  `
})
export class DatagridLocalPage {
  @AcViewChild('#grid') grid!: AcDatagridElement;

  dropdownItems: IAppMenuItem[] = [
    { label: 'Grid Actions', isHeader: true },
    { label: 'Refresh Data', callback: () => this.loadData() },
    { label: 'Add Static Row', callback: () => this.addStaticRow() }
  ];

  acOnInit() {
    const api = this.grid.datagridApi;

    // Enable Extensions
    api.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowDragging });
    api.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.KeyboardActions });

    api.usePagination = true;

    // Setup Hooks
    api.hooks.subscribe({
      hook: AC_DATAGRID_HOOK.FooterInit,
      callback: () => {
        // We can add custom buttons to footer if needed
        console.log('Grid Footer Initialized');
      }
    });

    api.columnDefinitions = [
      { field: 'index', title: "SrNo.", width: 80 },
      { field: 'first_name', title: "First Name", allowEdit: true },
      { field: 'last_name', title: "Last Name", allowEdit: true },
      { field: 'company', title: "Company" },
      { field: 'city', title: "City" },
      { field: 'country', title: "Country" },
      { field: 'email', title: "Email" },
      { field: 'website', title: "Website", visible: false }
    ];

    this.loadData();
  }

  loadData() {
    const data = customersData.map((row, i) => ({ index: i + 1, ...row }));
    this.grid.datagridApi.data = data;
  }

  onSearch(event: any) {
    this.grid.datagridApi.dataManager.searchQuery = event.target.value;
  }

  addStaticRow() {
    const api = this.grid.datagridApi;
    api.addRow({
      data: {
        index: api.dataManager.totalRows + 1,
        first_name: 'New',
        last_name: 'User',
        company: 'AutoCode',
        city: 'Mumbai',
        country: 'India'
      }
    });
  }
}
