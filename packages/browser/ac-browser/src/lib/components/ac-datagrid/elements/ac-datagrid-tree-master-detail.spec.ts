/** @jest-environment jsdom */
import './ac-datagrid.element';
import './ac-datagrid-cell.element';
import './ac-datagrid-row.element';
import './ac-datagrid-body.element';
import { AcDatagridElement } from "./ac-datagrid.element";
import { IAcDatagridRow } from "../interfaces/ac-datagrid-row.interface";
import { AC_DATAGRID_CLASS_NAME } from "../consts/ac-datagrid-css-class-name.const";

describe('AcDatagrid Tree and Master-Detail Expand/Collapse', () => {
  let grid: AcDatagridElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    grid = document.createElement('ac-datagrid') as AcDatagridElement;
    document.body.appendChild(grid);
  });

  afterEach(() => {
    grid.remove();
    document.body.innerHTML = '';
  });

  describe('Tree rows', () => {
    it('initializes tree hierarchy and expands/collapses properly', () => {
      const api = grid.datagridApi;
      api.animateRows = false;
      api.treeConfig = { idKey: 'id', parentIdKey: 'parentId' };
      api.columnDefinitions = [
        { field: 'name', title: 'Name', isTreeColumn: true },
        { field: 'dept', title: 'Dept' }
      ];
      api.data = [
        { id: '1', name: 'Engineering', hasChildren: true },
        { id: '1-1', parentId: '1', name: 'Frontend' },
        { id: '1-2', parentId: '1', name: 'Backend' },
        { id: '2', name: 'Marketing', hasChildren: true },
        { id: '2-1', parentId: '2', name: 'SEO' }
      ];

      // Initially only root rows are visible (Engineering, Marketing)
      expect(api.displayedDatagridRows.length).toBe(2);
      expect(api.displayedDatagridRows.map(r => r.rowId)).toEqual(['1', '2']);
      expect(api.expandedRowIds.has('1')).toBe(false);

      // Expand Engineering
      api.expandRow({ rowId: '1' });
      expect(api.expandedRowIds.has('1')).toBe(true);
      expect(api.displayedDatagridRows.length).toBe(4);
      expect(api.displayedDatagridRows.map(r => r.rowId)).toEqual(['1', '1-1', '1-2', '2']);

      const body = grid.datagridBody;
      const row1El = body.currentRows.find(r => r.datagridRow.rowId === '1');
      expect(row1El?.classList.contains('ac-datagrid-row-expanded')).toBe(true);

      // Toggle row 1 to collapse
      api.toggleRow({ rowId: '1' });
      expect(api.expandedRowIds.has('1')).toBe(false);
      expect(api.displayedDatagridRows.length).toBe(2);
      expect(row1El?.classList.contains('ac-datagrid-row-expanded')).toBe(false);

      // Expand all
      api.expandAllRows();
      expect(api.expandedRowIds.has('1')).toBe(true);
      expect(api.expandedRowIds.has('2')).toBe(true);
      expect(api.displayedDatagridRows.length).toBe(5);

      // Collapse all
      api.collapseAllRows();
      expect(api.expandedRowIds.size).toBe(0);
      expect(api.displayedDatagridRows.length).toBe(2);
    });

    it('clicking tree toggle in cell toggles tree expansion', () => {
      const api = grid.datagridApi;
      api.animateRows = false;
      api.treeConfig = { idKey: 'id', parentIdKey: 'parentId' };
      api.columnDefinitions = [
        { field: 'name', title: 'Name', isTreeColumn: true }
      ];
      api.data = [
        { id: '1', name: 'Engineering', hasChildren: true },
        { id: '1-1', parentId: '1', name: 'Frontend' }
      ];

      const body = grid.datagridBody;
      const row1El = body.currentRows.find(r => r.datagridRow.rowId === '1');
      const toggle = row1El?.querySelector('.ac-datagrid-cell-tree-toggle') as HTMLElement;
      expect(toggle).not.toBeNull();

      // Click to expand
      toggle.click();
      expect(api.expandedRowIds.has('1')).toBe(true);
      expect(api.displayedDatagridRows.length).toBe(2);

      // Click to collapse
      toggle.click();
      expect(api.expandedRowIds.has('1')).toBe(false);
      expect(api.displayedDatagridRows.length).toBe(1);
    });

    it('saves and applies tree expanded state through getState and applyState', () => {
      const api = grid.datagridApi;
      api.animateRows = false;
      api.treeConfig = { idKey: 'id', parentIdKey: 'parentId' };
      api.columnDefinitions = [
        { field: 'name', title: 'Name', isTreeColumn: true }
      ];
      api.data = [
        { id: '1', name: 'Engineering', hasChildren: true },
        { id: '1-1', parentId: '1', name: 'Frontend' },
        { id: '2', name: 'Marketing', hasChildren: true },
        { id: '2-1', parentId: '2', name: 'SEO' }
      ];

      api.expandRow({ rowId: '1' });
      const state = api.getState();
      expect(state.expandedRowIds).toEqual(['1']);

      // Collapse row 1
      api.collapseAllRows();
      expect(api.displayedDatagridRows.length).toBe(2);

      // Re-apply state
      api.applyState(state);
      expect(api.expandedRowIds.has('1')).toBe(true);
      expect(api.displayedDatagridRows.length).toBe(3);
    });
  });

  describe('Master-Detail rows', () => {
    it('renders master-detail expand icon and toggles detail drawer', () => {
      const api = grid.datagridApi;
      api.showRowNumbers = true;
      api.masterDetailConfig = {
        detailTemplate: (row: IAcDatagridRow) => {
          const div = document.createElement('div');
          div.className = 'custom-detail-content';
          div.textContent = `Details for: ${row.data.name}`;
          return div;
        }
      };
      api.columnDefinitions = [
        { field: 'name', title: 'Name' },
        { field: 'role', title: 'Role' }
      ];
      api.data = [
        { id: '101', name: 'Alice', role: 'Engineer' },
        { id: '102', name: 'Bob', role: 'Designer' }
      ];

      expect(api.hasMasterDetail).toBe(true);
      const body = grid.datagridBody;
      expect(body.currentRows.length).toBe(2);

      const row1El = body.currentRows[0];
      const detailIcon = row1El.querySelector(`.${AC_DATAGRID_CLASS_NAME.acDatagridDetailExpandIcon}`) as HTMLElement;
      expect(detailIcon).not.toBeNull();
      expect(detailIcon.textContent).toBe('+');
      expect(row1El.querySelector(`.${AC_DATAGRID_CLASS_NAME.acDatagridDetailRow}`)).toBeNull();
      expect(row1El.classList.contains('ac-datagrid-row-detail-expanded')).toBe(false);

      // Expand detail for row 1 via API
      api.expandDetailRow({ rowId: row1El.datagridRow.rowId });
      expect(api.expandedDetailRowIds.has(row1El.datagridRow.rowId)).toBe(true);
      expect(row1El.classList.contains('ac-datagrid-row-detail-expanded')).toBe(true);
      expect(row1El.style.height).toBe('auto');

      const detailEl = row1El.querySelector(`.${AC_DATAGRID_CLASS_NAME.acDatagridDetailRow}`);
      expect(detailEl).not.toBeNull();
      expect(detailEl?.textContent).toContain('Details for: Alice');
      expect(detailIcon.textContent).toBe('−');

      // Collapse detail via click on icon
      detailIcon.click();
      expect(api.expandedDetailRowIds.has(row1El.datagridRow.rowId)).toBe(false);
      expect(row1El.classList.contains('ac-datagrid-row-detail-expanded')).toBe(false);
      expect(row1El.querySelector(`.${AC_DATAGRID_CLASS_NAME.acDatagridDetailRow}`)).toBeNull();
      expect(detailIcon.textContent).toBe('+');

      // Toggle detail back open via toggleDetailRow
      api.toggleDetailRow({ rowId: row1El.datagridRow.rowId });
      expect(api.expandedDetailRowIds.has(row1El.datagridRow.rowId)).toBe(true);
      expect(row1El.classList.contains('ac-datagrid-row-detail-expanded')).toBe(true);
      expect(row1El.querySelector(`.${AC_DATAGRID_CLASS_NAME.acDatagridDetailRow}`)).not.toBeNull();
    });

    it('persists and restores master-detail expanded state', () => {
      const api = grid.datagridApi;
      api.showRowNumbers = true;
      api.masterDetailConfig = {
        detailTemplate: (row: IAcDatagridRow) => `<span>Profile: ${row.data.name}</span>`
      };
      api.columnDefinitions = [
        { field: 'name', title: 'Name' }
      ];
      api.data = [
        { id: '201', name: 'John' },
        { id: '202', name: 'Jane' }
      ];

      const rowId = api.displayedDatagridRows[0].rowId;
      api.expandDetailRow({ rowId });

      const state = api.getState();
      expect(state.expandedDetailRowIds).toEqual([rowId]);

      // Collapse
      api.collapseDetailRow({ rowId });
      expect(api.expandedDetailRowIds.has(rowId)).toBe(false);

      // Re-apply
      api.applyState(state);
      expect(api.expandedDetailRowIds.has(rowId)).toBe(true);
      const row0 = api.getRow({ rowId });
      expect(row0?.isDetailExpanded).toBe(true);
    });
  });
});
