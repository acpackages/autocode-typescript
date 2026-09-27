import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDatagridElement, AC_DATAGRID_EVENT } from "@autocode-ts/ac-browser";
import { customersData } from "../../data/customers-data";

@AcElement({
  selector: 'datagrid-row-editing-page',
  template: `
    <div class="app-page">
      <app-header [title]="'Datagrid : Row Editing'"></app-header>
      <div class="p-3 flex-fill overflow-hidden d-flex flex-column">
        <div class="d-flex align-items-center gap-2 mb-2">
          <button class="btn btn-sm btn-primary" (click)="editFirstRow()">Edit Row 1</button>
          <button class="btn btn-sm btn-success" (click)="saveActiveRow()">Save Active Row</button>
          <button class="btn btn-sm btn-secondary" (click)="cancelActiveRow()">Cancel</button>
          <span id="row-edit-status" class="ms-3 text-muted">Double-click any row to enter row edit mode.</span>
        </div>
        <div class="flex-fill border rounded overflow-hidden">
          <ac-datagrid #grid class="h-100"></ac-datagrid>
        </div>
      </div>
    </div>
  `
})
export class DatagridRowEditingPage {
  @AcViewChild('#grid') grid!: AcDatagridElement;

  acOnInit() {
    const api = this.grid.datagridApi;
    api.editMode = 'row';
    api.showRowNumbers = true;

    api.columnDefinitions = [
      { field: 'first_name', title: "First Name", width: 160, allowEdit: true },
      { field: 'last_name', title: "Last Name", width: 160, allowEdit: true },
      { field: 'company', title: "Company", width: 220, allowEdit: true },
      { field: 'city', title: "City", width: 160, allowEdit: true },
      { field: 'country', title: "Country", width: 180, allowEdit: true },
      { field: 'salary', title: "Salary", width: 140, allowEdit: true }
    ];

    api.events.on({
      event: AC_DATAGRID_EVENT.RowEditingStart,
      callback: (args: any) => {
        const el = document.getElementById('row-edit-status');
        if (el) el.textContent = `Editing Row (ID: ${args.row?.rowId})`;
      }
    });

    api.events.on({
      event: AC_DATAGRID_EVENT.RowEditSave,
      callback: (args: any) => {
        const el = document.getElementById('row-edit-status');
        if (el) el.textContent = `Saved Row: ${args.data?.first_name} ${args.data?.last_name}`;
      }
    });

    api.events.on({
      event: AC_DATAGRID_EVENT.RowEditCancel,
      callback: () => {
        const el = document.getElementById('row-edit-status');
        if (el) el.textContent = `Cancelled row edit.`;
      }
    });

    api.data = customersData.slice(0, 25);
  }

  editFirstRow() {
    const first = this.grid.datagridApi.displayedDatagridRows[0];
    if (first) {
      this.grid.datagridApi.startRowEdit({ rowId: first.rowId });
    }
  }

  saveActiveRow() {
    if (this.grid.datagridApi.activeEditRowId) {
      this.grid.datagridApi.saveRowEdit({ rowId: this.grid.datagridApi.activeEditRowId });
    }
  }

  cancelActiveRow() {
    if (this.grid.datagridApi.activeEditRowId) {
      this.grid.datagridApi.cancelRowEdit({ rowId: this.grid.datagridApi.activeEditRowId });
    }
  }
}
