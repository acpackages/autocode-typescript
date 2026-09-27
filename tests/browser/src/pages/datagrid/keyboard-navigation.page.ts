import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDatagridElement, AC_DATAGRID_EVENT } from "@autocode-ts/ac-browser";
import { customersData } from "../../data/customers-data";

@AcElement({
  selector: 'datagrid-keyboard-navigation-page',
  template: `
    <div class="app-page">
      <app-header [title]="'Datagrid : Arrow-Key & Tab Navigation'"></app-header>
      <div class="p-3 flex-fill overflow-hidden d-flex flex-column">
        <div class="alert alert-secondary py-2 mb-2">
          <strong>Keyboard Shortcuts:</strong>
          <span class="badge bg-dark ms-2">↑ ↓ ← →</span> Navigate cells
          <span class="badge bg-dark ms-2">Tab</span> Next cell (wraps)
          <span class="badge bg-dark ms-2">Shift+Tab</span> Previous cell
          <span class="badge bg-dark ms-2">Enter</span> Edit / Commit
          <span class="badge bg-dark ms-2">Esc</span> Cancel Edit
          <span class="badge bg-dark ms-2">Home / End</span> Row edges
          <span class="badge bg-dark ms-2">PgUp / PgDn</span> Jump 10 rows
          <span id="active-cell-info" class="ms-3 text-primary fw-bold"></span>
        </div>
        <div class="flex-fill border rounded overflow-hidden">
          <ac-datagrid #grid class="h-100"></ac-datagrid>
        </div>
      </div>
    </div>
  `
})
export class DatagridKeyboardNavigationPage {
  @AcViewChild('#grid') grid!: AcDatagridElement;

  acOnInit() {
    const api = this.grid.datagridApi;
    api.showRowNumbers = true;

    api.columnDefinitions = [
      { field: 'first_name', title: "First Name", width: 150, allowEdit: true },
      { field: 'last_name', title: "Last Name", width: 150, allowEdit: true },
      { field: 'company', title: "Company", width: 220, allowEdit: true },
      { field: 'city', title: "City", width: 160, allowEdit: true },
      { field: 'country', title: "Country", width: 200, allowEdit: true },
      { field: 'salary', title: "Salary", width: 140, allowEdit: true }
    ];

    api.events.on({
      event: AC_DATAGRID_EVENT.ActiveCellChange,
      callback: (args: any) => {
        const infoEl = document.getElementById('active-cell-info');
        if (infoEl && args.activeDatagridRow) {
          const col = args.activeDatagridRow.datagridColumn;
          const row = args.activeDatagridRow.datagridRow;
          infoEl.textContent = `Active: Row ${row.index + 1}, Col [${col.title || col.columnKey}]`;
        }
      }
    });

    api.data = customersData.slice(0, 50);

    // Initial focus
    setTimeout(() => {
      api.focusCell({
        rowId: api.displayedDatagridRows[0]?.rowId,
        columnId: api.datagridColumns[0]?.columnId
      });
    }, 150);
  }
}
