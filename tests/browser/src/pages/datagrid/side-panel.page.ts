import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDatagridElement } from "@autocode-ts/ac-browser";
import { customersData } from "../../data/customers-data";

@AcElement({
  selector: 'datagrid-side-panel-page',
  template: `
    <div class="app-page">
      <app-header [title]="'Datagrid : Collapsible Right Side-Panel'"></app-header>
      <div class="p-3 flex-fill overflow-hidden d-flex flex-column">
        <div class="d-flex align-items-center gap-2 mb-2">
          <button class="btn btn-sm btn-primary" (click)="togglePanel()">Toggle Side-Panel</button>
          <button class="btn btn-sm btn-outline-secondary" (click)="openPanel()">Open Side-Panel</button>
          <button class="btn btn-sm btn-outline-secondary" (click)="closePanel()">Close Side-Panel</button>
          <span class="text-muted ms-3">Use the right side-panel to search columns, drag to reorder, toggle visibility, and cycle multi-sort priority.</span>
        </div>
        <div class="flex-fill border rounded overflow-hidden">
          <ac-datagrid #grid class="h-100"></ac-datagrid>
        </div>
      </div>
    </div>
  `
})
export class DatagridSidePanelPage {
  @AcViewChild('#grid') grid!: AcDatagridElement;

  acOnInit() {
    const api = this.grid.datagridApi;
    api.showRowNumbers = true;
    api.allowColumnDragging = true;
    api.allowColumnResizing = true;

    api.columnDefinitions = [
      { field: 'first_name', title: "First Name", width: 140 },
      { field: 'last_name', title: "Last Name", width: 140 },
      { field: 'company', title: "Company", width: 220 },
      { field: 'city', title: "City", width: 150 },
      { field: 'country', title: "Country", width: 180 },
      { field: 'phone_1', title: "Phone Primary", width: 180, visible: false },
      { field: 'phone_2', title: "Phone Alt", width: 180, visible: false },
      { field: 'email', title: "Email", width: 220 },
      { field: 'website', title: "Website", width: 200, visible: false },
      { field: 'salary', title: "Salary ($)", width: 130 }
    ];

    api.data = customersData.slice(0, 50);

    // Open side panel initially
    setTimeout(() => {
      this.grid.datagridApi.toggleSidePanel(true);
    }, 200);
  }

  togglePanel() {
    this.grid.datagridApi.toggleSidePanel();
  }

  openPanel() {
    this.grid.datagridApi.toggleSidePanel(true);
  }

  closePanel() {
    this.grid.datagridApi.toggleSidePanel(false);
  }
}
