import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDatagridElement, AC_DATAGRID_EVENT, IAcDatagridState } from "@autocode-ts/ac-browser";
import { customersData } from "../../data/customers-data";

@AcElement({
  selector: 'datagrid-state-persistence-page',
  template: `
    <div class="app-page">
      <app-header [title]="'Datagrid : State Emitting & Restoration'"></app-header>
      <div class="p-3 flex-fill overflow-hidden d-flex flex-column">
        <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
          <button class="btn btn-sm btn-primary" (click)="saveState()">Save State to LocalStorage</button>
          <button class="btn btn-sm btn-success" (click)="restoreState()">Restore Saved State</button>
          <button class="btn btn-sm btn-outline-danger" (click)="clearState()">Clear Stored State</button>
          <span id="state-status" class="text-success ms-3"></span>
        </div>
        <div class="mb-2">
          <small class="text-muted">Live Serialized State JSON:</small>
          <pre id="state-json-preview" class="p-2 bg-light border rounded mb-0" style="max-height: 100px; overflow: auto; font-size: 11px;">{}</pre>
        </div>
        <div class="flex-fill border rounded overflow-hidden">
          <ac-datagrid #grid class="h-100"></ac-datagrid>
        </div>
      </div>
    </div>
  `
})
export class DatagridStatePersistencePage {
  @AcViewChild('#grid') grid!: AcDatagridElement;
  private savedStateKey = 'ac-datagrid-saved-state';

  acOnInit() {
    const api = this.grid.datagridApi;
    api.allowSelection = true;
    api.allowColumnResizing = true;
    api.allowColumnDragging = true;
    api.showRowNumbers = true;

    api.columnDefinitions = [
      { field: 'first_name', title: "First Name", width: 140 },
      { field: 'last_name', title: "Last Name", width: 140 },
      { field: 'company', title: "Company", width: 220 },
      { field: 'city', title: "City", width: 160 },
      { field: 'country', title: "Country", width: 180 },
      { field: 'salary', title: "Salary", width: 140 }
    ];

    api.events.on({
      event: AC_DATAGRID_EVENT.StateChange,
      callback: (args: any) => {
        const preview = document.getElementById('state-json-preview');
        if (preview && args.datagridState) {
          preview.textContent = JSON.stringify(args.datagridState, null, 2);
        }
      }
    });

    api.data = customersData.slice(0, 40);
  }

  saveState() {
    const state = this.grid.datagridApi.datagridState.toJson();
    localStorage.setItem(this.savedStateKey, JSON.stringify(state));
    const status = document.getElementById('state-status');
    if (status) status.textContent = `State saved at ${new Date().toLocaleTimeString()}!`;
  }

  restoreState() {
    const raw = localStorage.getItem(this.savedStateKey);
    const status = document.getElementById('state-status');
    if (!raw) {
      if (status) status.textContent = 'No saved state found in localStorage!';
      return;
    }
    const state: IAcDatagridState = JSON.parse(raw);
    this.grid.datagridApi.applyState(state);
    if (status) status.textContent = `State restored successfully!`;
  }

  clearState() {
    localStorage.removeItem(this.savedStateKey);
    const status = document.getElementById('state-status');
    if (status) status.textContent = 'Stored state cleared!';
  }
}
