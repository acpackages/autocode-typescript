import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDatagridElement } from "@autocode-ts/ac-browser";
import { customersData } from "../../data/customers-data";

@AcElement({
  selector: 'datagrid-row-grouping-page',
  template: `
    <div class="app-page">
      <app-header [title]="'Datagrid : Row Grouping (Client & On-Demand)'"></app-header>
      <div class="p-3 flex-fill overflow-hidden d-flex flex-column">
        <div class="d-flex align-items-center gap-2 mb-2">
          <label class="form-label mb-0 fw-bold">Group By:</label>
          <button class="btn btn-sm btn-outline-primary" (click)="groupByCountry()">Country</button>
          <button class="btn btn-sm btn-outline-primary" (click)="groupByCompany()">Company</button>
          <button class="btn btn-sm btn-outline-secondary" (click)="clearGrouping()">Clear Grouping</button>
          <button class="btn btn-sm btn-outline-success ms-auto" (click)="expandAll()">Expand All</button>
          <button class="btn btn-sm btn-outline-warning" (click)="collapseAll()">Collapse All</button>
        </div>
        <div class="flex-fill border rounded overflow-hidden">
          <ac-datagrid #grid class="h-100"></ac-datagrid>
        </div>
      </div>
    </div>
  `
})
export class DatagridRowGroupingPage {
  @AcViewChild('#grid') grid!: AcDatagridElement;

  acOnInit() {
    const api = this.grid.datagridApi;
    api.showRowNumbers = true;

    api.columnDefinitions = [
      { field: 'first_name', title: "First Name", width: 140 },
      { field: 'last_name', title: "Last Name", width: 140 },
      { field: 'company', title: "Company", width: 220 },
      { field: 'city', title: "City", width: 150 },
      { field: 'country', title: "Country", width: 180 },
      { field: 'salary', title: "Salary ($)", width: 140, aggregate: 'sum' }
    ];

    api.data = customersData.slice(0, 60);
    this.groupByCountry();
  }

  groupByCountry() {
    this.grid.datagridApi.setGroupBy({ fields: ['country'] });
  }

  groupByCompany() {
    this.grid.datagridApi.setGroupBy({ fields: ['company'] });
  }

  clearGrouping() {
    this.grid.datagridApi.setGroupBy({ fields: [] });
  }

  expandAll() {
    this.grid.datagridApi.expandAllRows();
  }

  collapseAll() {
    this.grid.datagridApi.collapseAllRows();
  }
}
