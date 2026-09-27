import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDatagridElement } from "@autocode-ts/ac-browser";

@AcElement({
  selector: 'datagrid-nested-tree-rows-page',
  template: `
    <div class="app-page">
      <app-header [title]="'Datagrid : Nested / Tree Rows (Local & On-Demand)'"></app-header>
      <div class="p-3 flex-fill overflow-hidden d-flex flex-column">
        <div class="d-flex align-items-center gap-2 mb-2">
          <button class="btn btn-sm btn-outline-primary" (click)="expandAll()">Expand All</button>
          <button class="btn btn-sm btn-outline-secondary" (click)="collapseAll()">Collapse All</button>
          <span class="text-muted ms-3">Click ▶ to expand. Root 2 loads sub-departments on demand with 600ms latency simulation.</span>
        </div>
        <div class="flex-fill border rounded overflow-hidden">
          <ac-datagrid #grid class="h-100"></ac-datagrid>
        </div>
      </div>
    </div>
  `
})
export class DatagridNestedTreeRowsPage {
  @AcViewChild('#grid') grid!: AcDatagridElement;

  acOnInit() {
    const api = this.grid.datagridApi;
    api.treeConfig = { idKey: 'id', parentIdKey: 'parentId' };
    api.showRowNumbers = true;

    api.columnDefinitions = [
      { field: 'name', title: "Department / Member", width: 260 },
      { field: 'role', title: "Role", width: 180 },
      { field: 'location', title: "Location", width: 160 },
      { field: 'budget', title: "Budget ($)", width: 140 }
    ];

    // Lazy load children on demand when requested
    api.onDemandTreeFunction = ({ parentRow, successCallback }) => {
      setTimeout(() => {
        const dummyChildren = [
          { id: `${parentRow.rowId}_sub1`, name: `${parentRow.data.name} - Team Alpha`, role: 'Sub-team', location: parentRow.data.location, budget: 150000, hasChildren: false },
          { id: `${parentRow.rowId}_sub2`, name: `${parentRow.data.name} - Team Beta`, role: 'Sub-team', location: parentRow.data.location, budget: 220000, hasChildren: false }
        ];
        successCallback(dummyChildren);
      }, 600);
    };

    api.data = [
      { id: '1', name: 'Engineering', role: 'Department', location: 'San Francisco', budget: 1200000, hasChildren: true },
      { id: '1-1', parentId: '1', name: 'Frontend Infrastructure', role: 'Team', location: 'San Francisco', budget: 450000, hasChildren: true },
      { id: '1-1-1', parentId: '1-1', name: 'Alice Developer', role: 'Staff Engineer', location: 'San Francisco', budget: 180000 },
      { id: '1-1-2', parentId: '1-1', name: 'Bob Coder', role: 'Senior Engineer', location: 'Remote', budget: 150000 },
      { id: '1-2', parentId: '1', name: 'Backend Platform', role: 'Team', location: 'New York', budget: 500000, hasChildren: true },
      { id: '1-2-1', parentId: '1-2', name: 'Charlie Architect', role: 'Lead Architect', location: 'New York', budget: 200000 },
      { id: '2', name: 'Product Operations (Lazy Loaded)', role: 'Department', location: 'London', budget: 800000, hasChildren: true },
      { id: '3', name: 'Design & UX', role: 'Department', location: 'Tokyo', budget: 600000, hasChildren: true },
      { id: '3-1', parentId: '3', name: 'Diana Designer', role: 'Design Lead', location: 'Tokyo', budget: 170000 }
    ];
  }

  expandAll() {
    this.grid.datagridApi.expandAllRows();
  }

  collapseAll() {
    this.grid.datagridApi.collapseAllRows();
  }
}
