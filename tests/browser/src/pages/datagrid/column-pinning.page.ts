import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDatagridElement } from "@autocode-ts/ac-browser";
import { customersData } from "../../data/customers-data";

@AcElement({
  selector: 'datagrid-column-pinning-page',
  template: `
    <div class="app-page">
      <app-header [title]="'Datagrid : Column Pinning (Left & Right)'"></app-header>
      <div class="p-3 flex-fill overflow-hidden d-flex flex-column">
        <div class="d-flex align-items-center gap-2 mb-2">
          <button class="btn btn-sm btn-outline-primary" (click)="pinLeft()">Pin Name to Left</button>
          <button class="btn btn-sm btn-outline-success" (click)="pinRight()">Pin Salary to Right</button>
          <button class="btn btn-sm btn-outline-secondary" (click)="clearPins()">Reset Pinning</button>
          <span class="text-muted ms-3">Scroll horizontally to see pinned columns remain fixed with solid opaque background.</span>
        </div>
        <div class="flex-fill border rounded overflow-hidden">
          <ac-datagrid #grid class="h-100"></ac-datagrid>
        </div>
      </div>
    </div>
  `
})
export class DatagridColumnPinningPage {
  @AcViewChild('#grid') grid!: AcDatagridElement;

  acOnInit() {
    const api = this.grid.datagridApi;
    api.showRowNumbers = true;

    api.columnDefinitions = [
      { field: 'first_name', title: "First Name", width: 150, pinnedOn: 'LEFT' },
      { field: 'last_name', title: "Last Name", width: 150, pinnedOn: 'LEFT' },
      { field: 'company', title: "Company", width: 240 },
      { field: 'city', title: "City", width: 180 },
      { field: 'country', title: "Country", width: 220 },
      { field: 'phone_1', title: "Phone Primary", width: 200 },
      { field: 'phone_2', title: "Phone Secondary", width: 200 },
      { field: 'email', title: "Email Address", width: 260 },
      { field: 'website', title: "Website URL", width: 240 },
      { field: 'subscription_date', title: "Joined Date", width: 160 },
      { field: 'salary', title: "Salary ($)", width: 140, pinnedOn: 'RIGHT' }
    ];

    api.data = customersData.slice(0, 50);
  }

  pinLeft() {
    const col = this.grid.datagridApi.getColumn({ key: 'first_name' });
    if (col) this.grid.datagridApi.pinColumn({ columnId: col.columnId, pinnedOn: 'LEFT' });
  }

  pinRight() {
    const col = this.grid.datagridApi.getColumn({ key: 'salary' });
    if (col) this.grid.datagridApi.pinColumn({ columnId: col.columnId, pinnedOn: 'RIGHT' });
  }

  clearPins() {
    for (const col of this.grid.datagridApi.datagridColumns) {
      this.grid.datagridApi.pinColumn({ columnId: col.columnId, pinnedOn: null });
    }
  }
}
