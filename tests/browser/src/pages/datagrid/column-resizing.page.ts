import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDatagridElement, AC_DATAGRID_EVENT } from "@autocode-ts/ac-browser";
import { customersData } from "../../data/customers-data";

@AcElement({
  selector: 'datagrid-column-resizing-page',
  template: `
    <div class="app-page">
      <app-header [title]="'Datagrid : Column Resizing'"></app-header>
      <div class="p-3 flex-fill overflow-hidden d-flex flex-column">
        <div class="alert alert-info py-2 mb-2">
          <strong>Column Resizing:</strong> Drag the right edge of any header cell to resize (works on mouse & touch). Double-click a resize handle to auto-fit.
          <span id="resize-log" class="ms-3 text-muted"></span>
        </div>
        <div class="flex-fill border rounded overflow-hidden">
          <ac-datagrid #grid class="h-100"></ac-datagrid>
        </div>
      </div>
    </div>
  `
})
export class DatagridColumnResizingPage {
  @AcViewChild('#grid') grid!: AcDatagridElement;

  acOnInit() {
    const api = this.grid.datagridApi;
    api.allowColumnResizing = true;
    api.showRowNumbers = true;

    api.columnDefinitions = [
      { field: 'first_name', title: "First Name", width: 140, minWidth: 80, maxWidth: 300 },
      { field: 'last_name', title: "Last Name", width: 140, minWidth: 80, maxWidth: 300 },
      { field: 'company', title: "Company", width: 220, minWidth: 100 },
      { field: 'city', title: "City", width: 160 },
      { field: 'country', title: "Country", width: 200 },
      { field: 'email', title: "Email", width: 250 },
      { field: 'salary', title: "Salary", width: 120 }
    ];

    api.events.on({
      event: AC_DATAGRID_EVENT.ColumnResize,
      callback: (args: any) => {
        const logEl = document.getElementById('resize-log');
        if (logEl) {
          logEl.textContent = `Resized ${args.column?.title || args.column?.columnKey} to ${args.width}px`;
        }
      }
    });

    api.data = customersData.slice(0, 50);
  }
}
