import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDatagridElement, AC_DATAGRID_EVENT } from "@autocode-ts/ac-browser";
import { customersData } from "../../data/customers-data";

@AcElement({
  selector: 'datagrid-column-dragging-page',
  template: `
    <div class="app-page">
      <app-header [title]="'Datagrid : Column Dragging & Reordering'"></app-header>
      <div class="p-3 flex-fill overflow-hidden d-flex flex-column">
        <div class="alert alert-info py-2 mb-2">
          <strong>Column Dragging:</strong> Click and drag any header column to reorder columns with touch-friendly pointer tracking and blue drop line indicator.
          <span id="drag-log" class="ms-3 text-muted"></span>
        </div>
        <div class="flex-fill border rounded overflow-hidden">
          <ac-datagrid #grid class="h-100"></ac-datagrid>
        </div>
      </div>
    </div>
  `
})
export class DatagridColumnDraggingPage {
  @AcViewChild('#grid') grid!: AcDatagridElement;

  acOnInit() {
    const api = this.grid.datagridApi;
    api.allowColumnDragging = true;
    api.showRowNumbers = true;

    api.columnDefinitions = [
      { field: 'first_name', title: "First Name", width: 140 },
      { field: 'last_name', title: "Last Name", width: 140 },
      { field: 'company', title: "Company", width: 220 },
      { field: 'city', title: "City", width: 160 },
      { field: 'country', title: "Country", width: 200 },
      { field: 'email', title: "Email", width: 240 },
      { field: 'salary', title: "Salary", width: 120 }
    ];

    api.events.on({
      event: AC_DATAGRID_EVENT.ColumnPositionChange,
      callback: (args: any) => {
        const logEl = document.getElementById('drag-log');
        if (logEl) {
          logEl.textContent = `Moved column from index ${args.oldIndex} to ${args.newIndex}`;
        }
      }
    });

    api.data = customersData.slice(0, 50);
  }
}
