import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDatagridElement, AC_DATAGRID_EVENT } from "@autocode-ts/ac-browser";
import { customersData } from "../../data/customers-data";

@AcElement({
  selector: 'datagrid-cell-editing-page',
  template: `
    <div class="app-page">
      <app-header [title]="'Datagrid : Cell Editing'"></app-header>
      <div class="p-3 flex-fill overflow-hidden d-flex flex-column">
        <div class="alert alert-info py-2 mb-2">
          <strong>Cell Editing:</strong> Double-click any editable cell or press Enter to edit. Type new value, press Enter to commit (or Escape to cancel). Salary must be >= 10,000 (validated).
          <span id="edit-log" class="ms-3 text-success"></span>
        </div>
        <div class="flex-fill border rounded overflow-hidden">
          <ac-datagrid #grid class="h-100"></ac-datagrid>
        </div>
      </div>
    </div>
  `
})
export class DatagridCellEditingPage {
  @AcViewChild('#grid') grid!: AcDatagridElement;

  acOnInit() {
    const api = this.grid.datagridApi;
    api.editMode = 'cell';
    api.showRowNumbers = true;

    api.columnDefinitions = [
      { field: 'first_name', title: "First Name (Editable)", width: 160, allowEdit: true },
      { field: 'last_name', title: "Last Name (Editable)", width: 160, allowEdit: true },
      { field: 'company', title: "Company", width: 220, allowEdit: false },
      { field: 'city', title: "City (Editable)", width: 160, allowEdit: true },
      {
        field: 'salary',
        title: "Salary (Validated >= 10k)",
        width: 180,
        allowEdit: true,
        validator: (val: any) => {
          const num = Number(val);
          return !isNaN(num) && num >= 10000;
        }
      },
      { field: 'email', title: "Email", width: 240 }
    ];

    api.events.on({
      event: AC_DATAGRID_EVENT.CellValueChange,
      callback: (args: any) => {
        const logEl = document.getElementById('edit-log');
        if (logEl) {
          logEl.textContent = `Saved ${args.datagridCell?.datagridColumn?.columnDefinition?.field} = "${args.datagridCell?.value}"`;
        }
      }
    });

    api.data = customersData.slice(0, 30);
  }
}
