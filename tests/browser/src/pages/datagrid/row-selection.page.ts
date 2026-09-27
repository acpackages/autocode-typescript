import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDatagridElement, AC_DATAGRID_EVENT } from "@autocode-ts/ac-browser";
import { customersData } from "../../data/customers-data";

@AcElement({
  selector: 'datagrid-row-selection-page',
  template: `
    <div class="app-page">
      <app-header [title]="'Datagrid : Row Selection (Single, Multi, Shift+Click, Select All)'"></app-header>
      <div class="p-3 flex-fill overflow-hidden d-flex flex-column">
        <div class="d-flex align-items-center gap-2 mb-2">
          <label class="form-label mb-0 fw-bold">Selection Mode:</label>
          <button class="btn btn-sm" [class.btn-primary]="isMulti" [class.btn-outline-primary]="!isMulti" (click)="setMulti()">Multi Selection</button>
          <button class="btn btn-sm" [class.btn-primary]="!isMulti" [class.btn-outline-primary]="isMulti" (click)="setSingle()">Single Selection</button>
          <button class="btn btn-sm btn-outline-secondary" (click)="selectAll()">Select All</button>
          <button class="btn btn-sm btn-outline-secondary" (click)="clearSelection()">Clear Selection</button>
          <span id="selected-summary" class="ms-auto text-primary fw-bold">Selected: 0 rows</span>
        </div>
        <div class="flex-fill border rounded overflow-hidden">
          <ac-datagrid #grid class="h-100"></ac-datagrid>
        </div>
      </div>
    </div>
  `
})
export class DatagridRowSelectionPage {
  @AcViewChild('#grid') grid!: AcDatagridElement;
  isMulti: boolean = true;

  acOnInit() {
    const api = this.grid.datagridApi;
    api.allowSelection = true;
    api.allowMultipleSelection = true;
    api.selectionMode = 'multiple';
    api.showRowNumbers = true;
    api.selectOnRowClick = true;

    api.columnDefinitions = [
      { field: 'first_name', title: "First Name", width: 150 },
      { field: 'last_name', title: "Last Name", width: 150 },
      { field: 'company', title: "Company", width: 220 },
      { field: 'city', title: "City", width: 160 },
      { field: 'country', title: "Country", width: 200 },
      { field: 'salary', title: "Salary", width: 140 }
    ];

    api.events.on({
      event: AC_DATAGRID_EVENT.RowSelectionChange,
      callback: (args: any) => {
        const el = document.getElementById('selected-summary');
        if (el) {
          el.textContent = `Selected: ${args.selectedRowIds?.length || 0} rows`;
        }
      }
    });

    api.data = customersData.slice(0, 40);
  }

  setMulti() {
    this.isMulti = true;
    this.grid.datagridApi.selectionMode = 'multiple';
    this.grid.datagridApi.allowMultipleSelection = true;
    this.grid.datagridApi.clearSelection();
    this.grid.datagridHeader?.render();
    this.grid.datagridBody?.setDisplayedRows();
  }

  setSingle() {
    this.isMulti = false;
    this.grid.datagridApi.selectionMode = 'single';
    this.grid.datagridApi.allowMultipleSelection = false;
    this.grid.datagridApi.clearSelection();
    this.grid.datagridHeader?.render();
    this.grid.datagridBody?.setDisplayedRows();
  }

  selectAll() {
    this.grid.datagridApi.selectAll();
  }

  clearSelection() {
    this.grid.datagridApi.clearSelection();
  }
}
