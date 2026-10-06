import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDatagridElement, AC_DATAGRID_EVENT } from "@autocode-ts/ac-browser";
import { customersData } from "../../data/customers-data";

@AcElement({
  selector: 'datagrid-column-resizing-page',
  template: `
    <div class="app-page">
      <app-header [title]="'Datagrid : Column Resizing, Fill Width & Auto-Fit'"></app-header>
      <div class="p-3 flex-fill overflow-hidden d-flex flex-column">
        <div class="d-flex align-items-center gap-2 mb-2 flex-wrap bg-light p-2 rounded border">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" (click)="toggleFillWidth()">
              Toggle Fill Available Width (<span id="fill-status">OFF</span>)
            </button>
            <button class="btn btn-outline-success" (click)="sizeToFit()">
              Size Columns To Fit
            </button>
            <button class="btn btn-outline-info" (click)="autoSizeAll()">
              Auto-Size All Columns
            </button>
            <button class="btn btn-outline-secondary" (click)="resetWidths()">
              Reset Widths
            </button>
          </div>
          <span id="resize-log" class="ms-auto text-muted small"></span>
        </div>

        <div class="alert alert-info py-2 mb-2 small">
          <strong>Features:</strong>
          • <strong>Fill Available Width:</strong> Dynamically fills viewport width using flex proportions.
          • <strong>Auto-Fit:</strong> Double-click any header resize handle or click "Auto-Size All Columns" to shrink/expand columns to content.
          • <strong>Header Overflow:</strong> Narrow a column to observe title truncation with ellipsis, native tooltip on hover, and graceful icon hiding below 70px/48px.
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

  private initialColumnDefs: any[] = [
    { field: 'first_name', title: "First Name", autoWidth: true, minWidth: 80, maxWidth: 300 },
    { field: 'last_name', title: "Last Name", width: 130, minWidth: 80, maxWidth: 300 },
    { field: 'company', title: "Company Name (Flex 2)", flexSize: 2, minWidth: 120 },
    { field: 'city', title: "City", width: 140 },
    { field: 'country', title: "Country (Fixed)", width: 130, suppressSizeToFit: true },
    { field: 'email', title: "Email Address (Flex 1)", flexSize: 1, minWidth: 150 },
    { field: 'salary', title: "Salary", width: 110 }
  ];

  acOnInit() {
    const api = this.grid.datagridApi;
    api.allowColumnResizing = true;
    api.showRowNumbers = true;

    api.columnDefinitions = JSON.parse(JSON.stringify(this.initialColumnDefs));

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

  toggleFillWidth() {
    const api = this.grid.datagridApi;
    api.fillAvailableWidth = !api.fillAvailableWidth;
    const statusEl = document.getElementById('fill-status');
    if (statusEl) {
      statusEl.textContent = api.fillAvailableWidth ? 'ON' : 'OFF';
    }
  }

  sizeToFit() {
    this.grid.datagridApi.sizeColumnsToFit();
  }

  autoSizeAll() {
    this.grid.datagridApi.autoSizeAllColumns();
  }

  resetWidths() {
    const api = this.grid.datagridApi;
    api.fillAvailableWidth = false;
    const statusEl = document.getElementById('fill-status');
    if (statusEl) {
      statusEl.textContent = 'OFF';
    }
    api.columnDefinitions = JSON.parse(JSON.stringify(this.initialColumnDefs));
  }
}

