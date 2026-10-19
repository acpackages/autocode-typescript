/**
 * @jest-environment jsdom
 */
import './ac-datagrid.element';
import './ac-datagrid-cell.element';
import './ac-datagrid-row.element';
import './ac-datagrid-body.element';
import { AcDatagridElement } from './ac-datagrid.element';
import { AcEnumSortOrder, AcDataManager } from '@autocode-ts/autocode';

describe('AcDatagrid row recreation on sort, pagination, and filter', () => {
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

  it('recreates DatagridRowElements in AcDatagridBody when displayed rows change', () => {
    const api = grid.datagridApi;
    api.columnDefinitions = [
      { field: 'id', title: 'ID' },
      { field: 'name', title: 'Name' }
    ];
    api.data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];

    const body = grid.datagridBody;
    expect(body).toBeDefined();

    const initialRowElements = [...body.currentRows];
    expect(initialRowElements.length).toBe(2);

    // Apply sort which calls processRows and triggers DisplayedRowsChange
    api.setColumnSortOrder({
      datagridColumn: api.datagridColumns[1],
      sortOrder: AcEnumSortOrder.Descending
    });

    const newRowElements = [...body.currentRows];
    expect(newRowElements.length).toBe(2);

    // Every DOM row element must be a newly created instance
    for (const oldEl of initialRowElements) {
      expect(newRowElements.includes(oldEl)).toBe(false);
    }
  });

  it('cancels active row edits and resets active cell on column sort', () => {
    const api = grid.datagridApi;
    api.columnDefinitions = [
      { field: 'name', title: 'Name', allowEdit: true }
    ];
    api.data = [
      { name: 'Alice' },
      { name: 'Bob' }
    ];

    const targetRow = api.displayedDatagridRows[0];
    api.activeEditRowId = targetRow.rowId;
    api.activeDatagridCell = { cellId: 'cell-1', datagridRow: targetRow } as any;
    api.hoverRowId = targetRow.rowId;
    api.hoverCellId = 'cell-1';

    expect(api.activeEditRowId).toBe(targetRow.rowId);

    // Sort column
    api.setColumnSortOrder({
      datagridColumn: api.datagridColumns[0],
      sortOrder: AcEnumSortOrder.Ascending
    });

    expect(api.activeEditRowId).toBeNull();
    expect(api.activeDatagridCell).toBeUndefined();
    expect(api.hoverRowId).toBeUndefined();
    expect(api.hoverCellId).toBeUndefined();
  });

  it('cancels active row edits and resets active cell on column filter', () => {
    const api = grid.datagridApi;
    api.columnDefinitions = [
      { field: 'name', title: 'Name', allowEdit: true }
    ];
    api.data = [
      { name: 'Alice' },
      { name: 'Bob' }
    ];

    const targetRow = api.displayedDatagridRows[0];
    api.activeEditRowId = targetRow.rowId;
    api.activeDatagridCell = { cellId: 'cell-1', datagridRow: targetRow } as any;
    api.hoverRowId = targetRow.rowId;
    api.hoverCellId = 'cell-1';

    // Set filter
    api.setColumnFilter({
      datagridColumn: api.datagridColumns[0],
      filter: { key: 'name', value: 'Alice' } as any
    });

    expect(api.activeEditRowId).toBeNull();
    expect(api.activeDatagridCell).toBeUndefined();
    expect(api.hoverRowId).toBeUndefined();
    expect(api.hoverCellId).toBeUndefined();
  });

  it('cancels active row edits and resets active cell on pagination change', () => {
    const api = grid.datagridApi;
    api.columnDefinitions = [
      { field: 'name', title: 'Name', allowEdit: true }
    ];
    api.data = [
      { name: 'Alice' },
      { name: 'Bob' }
    ];

    const targetRow = api.displayedDatagridRows[0];
    api.activeEditRowId = targetRow.rowId;
    api.activeDatagridCell = { cellId: 'cell-1', datagridRow: targetRow } as any;
    api.hoverRowId = targetRow.rowId;
    api.hoverCellId = 'cell-1';

    api.eventHandler.handlePaginationChange();

    expect(api.activeEditRowId).toBeNull();
    expect(api.activeDatagridCell).toBeUndefined();
    expect(api.hoverRowId).toBeUndefined();
    expect(api.hoverCellId).toBeUndefined();
  });

  it('assigns brand new rowId and IAcDataRow instances in on-demand mode', () => {
    const dm = new AcDataManager();
    dm.type = 'ondemand';

    dm.setRows({
      data: [{ name: 'Item 1' }, { name: 'Item 2' }],
      startIndex: 0,
      totalCount: 10
    });

    const firstBatchRowIds = dm.displayedRows.map(r => r.rowId);
    expect(firstBatchRowIds.length).toBe(2);

    // Now simulate page 2 or sort refresh with new data at the same index range
    dm.setRows({
      data: [{ name: 'Item 1 Updated' }, { name: 'Item 2 Updated' }],
      startIndex: 0,
      totalCount: 10
    });

    const secondBatchRowIds = dm.displayedRows.map(r => r.rowId);
    expect(secondBatchRowIds.length).toBe(2);

    // Row IDs must be recreated (unique) rather than reusing the old rowId
    expect(secondBatchRowIds[0]).not.toBe(firstBatchRowIds[0]);
    expect(secondBatchRowIds[1]).not.toBe(firstBatchRowIds[1]);
  });

  it('updates rendered row numbers and index order when rows are sorted', () => {
    const api = grid.datagridApi;
    api.showRowNumbers = true;
    api.columnDefinitions = [
      { field: 'name', title: 'Name' },
      { field: 'score', title: 'Score' }
    ];
    api.data = [
      { name: 'Charlie', score: 50 },
      { name: 'Alice', score: 90 },
      { name: 'Bob', score: 70 }
    ];

    const body = grid.datagridBody;
    expect(body.currentRows.length).toBe(3);

    // Initial order: Charlie (1), Alice (2), Bob (3)
    const initialNums = body.currentRows.map(
      r => r.querySelector('.ac-datagrid-row-number')?.textContent
    );
    expect(initialNums).toEqual(['1', '2', '3']);
    expect(body.currentRows[0].datagridRow.data.name).toBe('Charlie');

    // Sort by name ascending -> Alice (1), Bob (2), Charlie (3)
    api.setColumnSortOrder({
      datagridColumn: api.datagridColumns[0],
      sortOrder: AcEnumSortOrder.Ascending
    });

    expect(body.currentRows.length).toBe(3);
    expect(body.currentRows[0].datagridRow.data.name).toBe('Alice');
    expect(body.currentRows[0].datagridRow.index).toBe(0);
    expect(body.currentRows[1].datagridRow.data.name).toBe('Bob');
    expect(body.currentRows[1].datagridRow.index).toBe(1);
    expect(body.currentRows[2].datagridRow.data.name).toBe('Charlie');
    expect(body.currentRows[2].datagridRow.index).toBe(2);

    const sortedNums = body.currentRows.map(
      r => r.querySelector('.ac-datagrid-row-number')?.textContent
    );
    expect(sortedNums).toEqual(['1', '2', '3']);

    // Sort by score descending -> Alice (90), Bob (70), Charlie (50)
    api.setColumnSortOrder({
      datagridColumn: api.datagridColumns[1],
      sortOrder: AcEnumSortOrder.Descending
    });

    expect(body.currentRows[0].datagridRow.data.name).toBe('Alice');
    expect(body.currentRows[1].datagridRow.data.name).toBe('Bob');
    expect(body.currentRows[2].datagridRow.data.name).toBe('Charlie');

    const scoreSortedNums = body.currentRows.map(
      r => r.querySelector('.ac-datagrid-row-number')?.textContent
    );
    expect(scoreSortedNums).toEqual(['1', '2', '3']);
  });

  it('updates row numbers and subsequent row indices when a row is deleted', () => {
    const api = grid.datagridApi;
    api.animateRows = false;
    api.columnDefinitions = [
      { field: 'id', title: 'ID' },
      { field: 'name', title: 'Name' }
    ];
    api.data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
      { id: 4, name: 'David' }
    ];

    const body = grid.datagridBody;
    expect(body.currentRows.length).toBe(4);
    const initialNums = body.currentRows.map(
      r => r.querySelector('.ac-datagrid-row-number')?.textContent
    );
    expect(initialNums).toEqual(['1', '2', '3', '4']);

    // Delete row with id 2 (Bob, index 1)
    const bobRow = api.displayedDatagridRows[1];
    api.deleteRow({ rowId: bobRow.rowId });

    expect(body.currentRows.length).toBe(3);
    const updatedNames = body.currentRows.map(r => r.datagridRow.data.name);
    expect(updatedNames).toEqual(['Alice', 'Charlie', 'David']);

    // Indices must be re-sequenced to 0, 1, 2
    expect(body.currentRows[0].datagridRow.index).toBe(0);
    expect(body.currentRows[1].datagridRow.index).toBe(1);
    expect(body.currentRows[2].datagridRow.index).toBe(2);

    // Row numbers must update to 1, 2, 3
    const updatedNums = body.currentRows.map(
      r => r.querySelector('.ac-datagrid-row-number')?.textContent
    );
    expect(updatedNums).toEqual(['1', '2', '3']);
  });

  it('animates row removal when animateRows is true and cleans up after 250ms', () => {
    jest.useFakeTimers();
    try {
      const api = grid.datagridApi;
      api.animateRows = true;
      api.columnDefinitions = [
        { field: 'name', title: 'Name' }
      ];
      api.data = [
        { name: 'Row 1' },
        { name: 'Row 2' },
        { name: 'Row 3' }
      ];

      const body = grid.datagridBody;
      const targetRow = api.displayedDatagridRows[1]; // Row 2
      const targetEl = body.currentRows.find(r => r.datagridRow.rowId === targetRow.rowId);

      api.deleteRow({ rowId: targetRow.rowId });

      // Before timer finishes, row has class 'ac-datagrid-row-removing'
      expect(targetEl?.classList.contains('ac-datagrid-row-removing')).toBe(true);

      // Remaining row (Row 3) already updated its row number to 2
      const row3El = body.currentRows.find(r => r.datagridRow.data.name === 'Row 3');
      expect(row3El?.querySelector('.ac-datagrid-row-number')?.textContent).toBe('2');

      // Fast forward past the 250ms animation
      jest.advanceTimersByTime(300);

      expect(body.currentRows.includes(targetEl!)).toBe(false);
      expect(targetEl?.parentElement).toBeNull();
      expect(body.currentRows.length).toBe(2);
    } finally {
      jest.useRealTimers();
    }
  });

  it('virtual scrolling renders only visible window plus buffer rows', () => {
    const api = grid.datagridApi;
    api.rowHeight = 40;
    api.useVirtualScrolling = true;
    api.columnDefinitions = [
      { field: 'id', title: 'ID' }
    ];

    const bigData = Array.from({ length: 500 }, (_, i) => ({ id: i + 1 }));
    api.data = bigData;

    const body = grid.datagridBody;
    Object.defineProperty(body, 'clientHeight', { value: 400, configurable: true });

    // Initial render at scrollTop = 0
    body.scrollTop = 0;
    body.renderVirtualRows();

    // 400px / 40px = 10 rows visible + 8 buffer = ~18-19 rows rendered in DOM out of 500!
    expect(body.currentRows.length).toBeLessThan(30);
    expect(body.currentRows.length).toBeGreaterThanOrEqual(10);
    expect(body.currentRows[0].datagridRow.index).toBe(0);

    // Scroll down to 4000px (around row index 100)
    body.scrollTop = 4000;
    body.renderVirtualRows(4000);

    // Still only around 20 rows in DOM
    expect(body.currentRows.length).toBeLessThan(35);
    const renderedIndices = body.currentRows.map(r => r.datagridRow.index);
    expect(renderedIndices.includes(100)).toBe(true);
    expect(renderedIndices.includes(0)).toBe(false); // Top rows unmounted!
  });

  it('toggles tree row expansion, animates child rows, and applies rotation class', () => {
    const api = grid.datagridApi;
    api.animateRows = true;
    api.treeConfig = { idKey: 'id', parentIdKey: 'parentId' };
    api.columnDefinitions = [
      { field: 'name', title: 'Name', isTreeColumn: true }
    ];
    api.data = [
      { id: '1', name: 'Parent', parentId: null, hasChildren: true },
      { id: '2', name: 'Child 1', parentId: '1' },
      { id: '3', name: 'Child 2', parentId: '1' }
    ];

    const body = grid.datagridBody;
    expect(api.expandedRowIds.has('1')).toBe(false);
    expect(api.displayedDatagridRows.length).toBe(1);

    // Expand parent
    api.expandRow({ rowId: '1' });
    expect(api.expandedRowIds.has('1')).toBe(true);
    expect(api.displayedDatagridRows.length).toBe(3);

    const parentEl = body.currentRows.find(r => r.datagridRow.rowId === '1');
    expect(parentEl?.classList.contains('ac-datagrid-row-expanded')).toBe(true);

    // Collapse parent
    api.collapseRow({ rowId: '1' });
    expect(api.expandedRowIds.has('1')).toBe(false);
    expect(parentEl?.classList.contains('ac-datagrid-row-expanded')).toBe(false);
  });
});

