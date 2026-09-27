import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDatagridElement } from "@autocode-ts/ac-browser";
import { customersData } from "../../data/customers-data";

@AcElement({
  selector: 'datagrid-row-pinning-page',
  template: `
    <div class="app-page">
      <app-header [title]="'Datagrid : Row Pinning (Top & Bottom)'"></app-header>
      <div class="p-3 flex-fill overflow-hidden d-flex flex-column">
        <div class="d-flex align-items-center gap-2 mb-2">
          <button class="btn btn-sm btn-outline-primary" (click)="pinFirstTop()">Pin Row 1 to Top</button>
          <button class="btn btn-sm btn-outline-danger" (click)="pinLastBottom()">Pin Last Row to Bottom</button>
          <button class="btn btn-sm btn-outline-secondary" (click)="clearPins()">Clear All Pinned Rows</button>
          <span class="text-muted ms-3">Pinned rows remain sticky at the top/bottom while you scroll the table vertically.</span>
        </div>
        <div class="flex-fill border rounded overflow-hidden">
          <ac-datagrid #grid class="h-100"></ac-datagrid>
        </div>
      </div>
    </div>
  `
})
export class DatagridRowPinningPage {
  @AcViewChild('#grid') grid!: AcDatagridElement;

  acOnInit() {
    const api = this.grid.datagridApi;
    api.showRowNumbers = true;

    api.columnDefinitions = [
      { field: 'first_name', title: "First Name", width: 150 },
      { field: 'last_name', title: "Last Name", width: 150 },
      { field: 'company', title: "Company", width: 220 },
      { field: 'city', title: "City", width: 160 },
      { field: 'country', title: "Country", width: 200 },
      { field: 'salary', title: "Salary", width: 140 }
    ];

    api.data = customersData.slice(0, 100);

    // Initial pin
    setTimeout(() => {
      this.pinFirstTop();
    }, 100);
  }

  pinFirstTop() {
    const rows = this.grid.datagridApi.datagridRows;
    if (rows.length > 0) {
      this.grid.datagridApi.pinRow({ rowId: rows[0].rowId, position: 'top' });
    }
  }

  pinLastBottom() {
    const rows = this.grid.datagridApi.datagridRows;
    if (rows.length > 0) {
      this.grid.datagridApi.pinRow({ rowId: rows[rows.length - 1].rowId, position: 'bottom' });
    }
  }

  clearPins() {
    const { top, bottom } = this.grid.datagridApi.getPinnedRows();
    for (const r of [...top, ...bottom]) {
      this.grid.datagridApi.pinRow({ rowId: r.rowId, position: null });
    }
  }
}
