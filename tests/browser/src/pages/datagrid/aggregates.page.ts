import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDatagridElement } from "@autocode-ts/ac-browser";
import { customersData } from "../../data/customers-data";

@AcElement({
  selector: 'datagrid-aggregates-page',
  template: `
    <div class="app-page">
      <app-header [title]="'Datagrid : Aggregate Functions'"></app-header>
      <div class="p-3 flex-fill overflow-hidden d-flex flex-column">
        <div class="alert alert-info py-2 mb-2">
          <strong>Aggregates:</strong> Columns calculate and display aggregate metrics (SUM, AVG, MIN, MAX, COUNT) in the footer bar and update automatically when rows change or are edited.
        </div>
        <div class="flex-fill border rounded overflow-hidden">
          <ac-datagrid #grid class="h-100"></ac-datagrid>
        </div>
      </div>
    </div>
  `
})
export class DatagridAggregatesPage {
  @AcViewChild('#grid') grid!: AcDatagridElement;

  acOnInit() {
    const api = this.grid.datagridApi;
    api.showRowNumbers = true;

    api.columnDefinitions = [
      { field: 'first_name', title: "First Name", width: 140, aggregate: 'count' },
      { field: 'last_name', title: "Last Name", width: 140 },
      { field: 'company', title: "Company", width: 220 },
      { field: 'country', title: "Country", width: 180 },
      { field: 'salary', title: "Salary ($)", width: 150, allowEdit: true, aggregate: 'sum' },
      { field: 'bonus', title: "Bonus ($)", width: 150, allowEdit: true, aggregate: 'avg' }
    ];

    const data = customersData.slice(0, 40).map(c => ({
      ...c,
      salary: c.salary || Math.floor(Math.random() * 80000 + 40000),
      bonus: Math.floor(Math.random() * 20000 + 5000)
    }));

    api.data = data;
  }
}
