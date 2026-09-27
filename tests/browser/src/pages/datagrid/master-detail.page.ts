import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDatagridElement, IAcDatagridRow } from "@autocode-ts/ac-browser";
import { customersData } from "../../data/customers-data";

@AcElement({
  selector: 'datagrid-master-detail-page',
  template: `
    <div class="app-page">
      <app-header [title]="'Datagrid : Master / Detail Rows'"></app-header>
      <div class="p-3 flex-fill overflow-hidden d-flex flex-column">
        <div class="d-flex align-items-center gap-2 mb-2">
          <button class="btn btn-sm btn-outline-primary" (click)="expandFirst()">Toggle Row 1 Detail</button>
          <span class="text-muted ms-3">Click (+) in the internal column on any row to expand rich nested customer details.</span>
        </div>
        <div class="flex-fill border rounded overflow-hidden">
          <ac-datagrid #grid class="h-100"></ac-datagrid>
        </div>
      </div>
    </div>
  `
})
export class DatagridMasterDetailPage {
  @AcViewChild('#grid') grid!: AcDatagridElement;

  acOnInit() {
    const api = this.grid.datagridApi;
    api.showRowNumbers = true;

    api.masterDetailConfig = {
      detailTemplate: (row: IAcDatagridRow) => {
        const d = row.data;
        const div = document.createElement('div');
        div.innerHTML = `
          <div class="d-flex gap-4 p-2 bg-light rounded border">
            <div>
              <h6 class="mb-1 text-primary">Customer Profile: ${d.first_name} ${d.last_name}</h6>
              <div><strong>Email:</strong> ${d.email}</div>
              <div><strong>Primary Phone:</strong> ${d.phone_1}</div>
              <div><strong>Alt Phone:</strong> ${d.phone_2 || 'N/A'}</div>
            </div>
            <div class="border-start ps-4">
              <h6 class="mb-1 text-secondary">Organization & Location</h6>
              <div><strong>Company:</strong> ${d.company}</div>
              <div><strong>City:</strong> ${d.city}</div>
              <div><strong>Country:</strong> ${d.country}</div>
              <div><strong>Website:</strong> <a href="${d.website}" target="_blank">${d.website}</a></div>
            </div>
            <div class="border-start ps-4">
              <h6 class="mb-1 text-success">Financials</h6>
              <div><strong>Annual Compensation:</strong> $${(d.salary || 100000).toLocaleString()}</div>
              <div><strong>Member Since:</strong> ${d.subscription_date || '2021'}</div>
              <button class="btn btn-xs btn-primary mt-2">Send Statement</button>
            </div>
          </div>
        `;
        return div;
      }
    };

    api.columnDefinitions = [
      { field: 'first_name', title: "First Name", width: 160 },
      { field: 'last_name', title: "Last Name", width: 160 },
      { field: 'company', title: "Company", width: 220 },
      { field: 'city', title: "City", width: 160 },
      { field: 'country', title: "Country", width: 200 }
    ];

    api.data = customersData.slice(0, 30);
  }

  expandFirst() {
    const rows = this.grid.datagridApi.displayedDatagridRows;
    if (rows.length > 0) {
      this.grid.datagridApi.toggleDetailRow({ rowId: rows[0].rowId });
    }
  }
}
