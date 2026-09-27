import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDatagridElement, AC_DATAGRID_EVENT } from "@autocode-ts/ac-browser";
import { customersData } from "../../data/customers-data";

@AcElement({
  selector: 'datagrid-row-dragging-page',
  template: `
    <div class="app-page">
      <app-header [title]="'Datagrid : Row Dragging & Reordering'"></app-header>
      <div class="p-3 flex-fill overflow-hidden d-flex flex-column">
        <div class="alert alert-info py-2 mb-2">
          <strong>Row Dragging:</strong> Grab the drag handle (⋮⋮) in the internal column on the left and drag up or down to reorder rows (touch & pointer supported).
          <span id="row-drag-log" class="ms-3 text-muted"></span>
        </div>
        <div class="flex-fill border rounded overflow-hidden">
          <ac-datagrid #grid class="h-100"></ac-datagrid>
        </div>
      </div>
    </div>
  `
})
export class DatagridRowDraggingPage {
  @AcViewChild('#grid') grid!: AcDatagridElement;

  acOnInit() {
    const api = this.grid.datagridApi;
    api.allowRowDragging = true;
    api.showRowNumbers = true;

    api.columnDefinitions = [
      { field: 'first_name', title: "First Name", width: 150 },
      { field: 'last_name', title: "Last Name", width: 150 },
      { field: 'company', title: "Company", width: 220 },
      { field: 'city', title: "City", width: 160 },
      { field: 'country', title: "Country", width: 200 },
      { field: 'email', title: "Email", width: 250 }
    ];

    api.events.on({
      event: AC_DATAGRID_EVENT.RowPositionChange,
      callback: (args: any) => {
        const logEl = document.getElementById('row-drag-log');
        if (logEl) {
          logEl.textContent = `Moved row "${args.row?.data?.first_name} ${args.row?.data?.last_name}" from index ${args.oldIndex} to ${args.newIndex}`;
        }
      }
    });

    api.data = customersData.slice(0, 30);
  }
}
