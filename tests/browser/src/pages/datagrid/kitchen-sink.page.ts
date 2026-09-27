import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDatagridElement, IAcDatagridRow, AC_DATAGRID_EVENT } from "@autocode-ts/ac-browser";
import { customersData } from "../../data/customers-data";

@AcElement({
  selector: 'datagrid-kitchen-sink-page',
  template: `
    <div class="app-page">
      <app-header [title]="'Datagrid : Complete Capabilities Kitchen Sink'"></app-header>
      <div class="p-3 flex-fill overflow-hidden d-flex flex-column">
        <!-- Control Toolbar -->
        <div class="d-flex align-items-center gap-2 mb-2 flex-wrap bg-light p-2 rounded border">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" (click)="toggleSidePanel()">Columns Panel</button>
            <button class="btn btn-outline-primary" (click)="groupByCountry()">Group: Country</button>
            <button class="btn btn-outline-primary" (click)="groupByCompany()">Group: Company</button>
            <button class="btn btn-outline-secondary" (click)="clearGrouping()">Clear Group</button>
          </div>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-success" (click)="pinTopRow()">Pin Row Top</button>
            <button class="btn btn-outline-danger" (click)="pinBottomRow()">Pin Row Bottom</button>
            <button class="btn btn-outline-secondary" (click)="clearRowPins()">Clear Row Pins</button>
          </div>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-dark" (click)="expandAll()">Expand All</button>
            <button class="btn btn-outline-dark" (click)="collapseAll()">Collapse All</button>
          </div>
          <div class="ms-auto d-flex align-items-center gap-2">
            <span id="kitchen-sink-status" class="badge bg-primary">Ready</span>
          </div>
        </div>

        <!-- Datagrid Element -->
        <div class="flex-fill border rounded overflow-hidden">
          <ac-datagrid #grid class="h-100"></ac-datagrid>
        </div>
      </div>
    </div>
  `
})
export class DatagridKitchenSinkPage {
  @AcViewChild('#grid') grid!: AcDatagridElement;

  acOnInit() {
    const api = this.grid.datagridApi;

    // Feature Flags
    api.allowSelection = true;
    api.allowMultipleSelection = true;
    api.selectionMode = 'multiple';
    api.allowColumnResizing = true;
    api.allowColumnDragging = true;
    api.allowRowDragging = true;
    api.showRowNumbers = true;
    api.editMode = 'cell';

    // Master / Detail Template
    api.masterDetailConfig = {
      detailTemplate: (row: IAcDatagridRow) => {
        const d = row.data;
        const div = document.createElement('div');
        div.innerHTML = `
          <div class="row g-2 p-2 bg-light border rounded">
            <div class="col-md-4">
              <strong class="text-primary">Contact:</strong> ${d.first_name} ${d.last_name} (${d.email})
              <br><small class="text-muted">Primary Phone: ${d.phone_1}</small>
            </div>
            <div class="col-md-4 border-start">
              <strong class="text-secondary">Location:</strong> ${d.city}, ${d.country}
              <br><small class="text-muted">Company: ${d.company}</small>
            </div>
            <div class="col-md-4 border-start">
              <strong class="text-success">Financials:</strong> Salary $${(d.salary || 0).toLocaleString()}
              <br><small class="text-muted">Website: ${d.website || 'N/A'}</small>
            </div>
          </div>
        `;
        return div;
      }
    };

    // Columns Definition
    api.columnDefinitions = [
      { field: 'first_name', title: "First Name", width: 140, pinnedOn: 'LEFT', allowEdit: true, aggregate: 'count' },
      { field: 'last_name', title: "Last Name", width: 140, pinnedOn: 'LEFT', allowEdit: true },
      { field: 'company', title: "Company", width: 220, allowEdit: true },
      { field: 'city', title: "City", width: 160, allowEdit: true },
      { field: 'country', title: "Country", width: 180, allowEdit: true },
      { field: 'phone_1', title: "Phone Primary", width: 180, visible: false },
      { field: 'phone_2', title: "Phone Alt", width: 180, visible: false },
      { field: 'email', title: "Email", width: 240, allowEdit: true },
      { field: 'website', title: "Website", width: 200, visible: false },
      {
        field: 'salary',
        title: "Salary ($)",
        width: 150,
        pinnedOn: 'RIGHT',
        allowEdit: true,
        aggregate: 'sum',
        validator: (val: any) => {
          const num = Number(val);
          return !isNaN(num) && num >= 1000;
        }
      }
    ];

    // Event Logging
    api.events.on({
      event: AC_DATAGRID_EVENT.RowSelectionChange,
      callback: (args: any) => {
        const el = document.getElementById('kitchen-sink-status');
        if (el) el.textContent = `Selected: ${args.selectedRowIds?.length || 0} rows`;
      }
    });

    api.events.on({
      event: AC_DATAGRID_EVENT.CellValueChange,
      callback: (args: any) => {
        const el = document.getElementById('kitchen-sink-status');
        if (el) el.textContent = `Edited ${args.datagridCell?.datagridColumn?.columnDefinition?.field}`;
      }
    });

    const data = customersData.slice(0, 100).map((c, i) => ({
      ...c,
      isMasterDetail: true,
      salary: c.salary || (50000 + (i * 1250))
    }));

    api.data = data;
  }

  toggleSidePanel() {
    this.grid.datagridApi.toggleSidePanel();
  }

  groupByCountry() {
    this.grid.datagridApi.setGroupBy({ fields: ['country'] });
  }

  groupByCompany() {
    this.grid.datagridApi.setGroupBy({ fields: ['company'] });
  }

  clearGrouping() {
    this.grid.datagridApi.setGroupBy({ fields: [] });
  }

  pinTopRow() {
    const rows = this.grid.datagridApi.datagridRows;
    if (rows.length > 0) {
      this.grid.datagridApi.pinRow({ rowId: rows[0].rowId, position: 'top' });
    }
  }

  pinBottomRow() {
    const rows = this.grid.datagridApi.datagridRows;
    if (rows.length > 0) {
      this.grid.datagridApi.pinRow({ rowId: rows[rows.length - 1].rowId, position: 'bottom' });
    }
  }

  clearRowPins() {
    const { top, bottom } = this.grid.datagridApi.getPinnedRows();
    for (const r of [...top, ...bottom]) {
      this.grid.datagridApi.pinRow({ rowId: r.rowId, position: null });
    }
  }

  expandAll() {
    this.grid.datagridApi.expandAllRows();
  }

  collapseAll() {
    this.grid.datagridApi.collapseAllRows();
  }
}
