/**
 * @jest-environment jsdom
 */
import './ac-datagrid.element';
import './ac-datagrid-cell.element';
import './ac-datagrid-row.element';
import { AcDatagridElement } from './ac-datagrid.element';
import { AcDatagridCellElement } from './ac-datagrid-cell.element';
import { AC_DATAGRID_EVENT } from '../consts/ac-datagrid-event.const';

describe('AcDatagrid cell editing with allowEdit', () => {
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

  it('marks cell as editable when allowEdit is set to true on column', () => {
    const api = grid.datagridApi;
    api.columnDefinitions = [
      { field: 'first_name', title: 'First Name', allowEdit: true },
      { field: 'last_name', title: 'Last Name', allowEdit: false },
      { field: 'email', title: 'Email' } // default false
    ];

    expect(api.datagridColumns[0].allowEdit).toBe(true);
    expect(api.datagridColumns[1].allowEdit).toBe(false);
    expect(api.datagridColumns[2].allowEdit).toBe(false);

    api.data = [
      { first_name: 'John', last_name: 'Doe', email: 'john@example.com' }
    ];

    const row = api.displayedDatagridRows[0];
    const cell0 = api.getCell({ rowIndex: 0, columnIndex: 0 })!;
    const cell1 = api.getCell({ rowIndex: 0, columnIndex: 1 })!;
    const cell2 = api.getCell({ rowIndex: 0, columnIndex: 2 })!;

    const cellEl0 = new AcDatagridCellElement();
    cellEl0.setCell({ datagridCell: cell0, datagridApi: api });
    const cellEl1 = new AcDatagridCellElement();
    cellEl1.setCell({ datagridCell: cell1, datagridApi: api });
    const cellEl2 = new AcDatagridCellElement();
    cellEl2.setCell({ datagridCell: cell2, datagridApi: api });

    expect(cellEl0.isEditable()).toBe(true);
    expect(cellEl1.isEditable()).toBe(false);
    expect(cellEl2.isEditable()).toBe(false);
  });

  it('enters edit mode on startEdit when allowEdit is true and commits changes', () => {
    const api = grid.datagridApi;
    api.editMode = 'cell';
    api.columnDefinitions = [
      { field: 'first_name', title: 'First Name', allowEdit: true }
    ];
    api.data = [
      { first_name: 'Alice' }
    ];

    const cell = api.getCell({ rowIndex: 0, columnIndex: 0 })!;
    const cellEl = new AcDatagridCellElement();
    cellEl.setCell({ datagridCell: cell, datagridApi: api });

    expect(cellEl.isEditing).toBe(false);

    cellEl.startEdit();
    expect(cellEl.isEditing).toBe(true);
    expect(cellEl.classList.contains('ac-datagrid-cell-editing')).toBe(true);

    const input = cellEl.querySelector('input');
    expect(input).not.toBeNull();
    expect(input?.value).toBe('Alice');
    expect(input?.getAttribute('ac-cell-editor-row-id')).toBe(api.displayedDatagridRows[0].rowId);
    expect(input?.getAttribute('ac-cell-editor-column-key')).toBe('first_name');

    // Change input value
    input!.value = 'Bob';

    let eventFired = false;
    api.events.subscribe({
      event: AC_DATAGRID_EVENT.CellValueChange,
      callback: (args: any) => {
        eventFired = true;
        expect(args.newValue).toBe('Bob');
      }
    });

    // Commit edit
    cellEl.commitEdit();
    expect(cellEl.isEditing).toBe(false);
    expect(api.displayedDatagridRows[0].data.first_name).toBe('Bob');
    expect(eventFired).toBe(true);
  });

  it('supports functional editable callback and respects allowEdit precedence', () => {
    const api = grid.datagridApi;
    api.columnDefinitions = [
      {
        field: 'status',
        title: 'Status',
        editable: (params: any) => params.row.data.canEdit === true
      }
    ];
    api.data = [
      { status: 'Open', canEdit: true },
      { status: 'Closed', canEdit: false }
    ];

    const cell0 = api.getCell({ rowIndex: 0, columnIndex: 0 })!;
    const cell1 = api.getCell({ rowIndex: 1, columnIndex: 0 })!;

    const cellEl0 = new AcDatagridCellElement();
    cellEl0.setCell({ datagridCell: cell0, datagridApi: api });
    const cellEl1 = new AcDatagridCellElement();
    cellEl1.setCell({ datagridCell: cell1, datagridApi: api });

    expect(cellEl0.isEditable()).toBe(true);
    expect(cellEl1.isEditable()).toBe(false);
  });

  it('defaults to false and does not enter edit mode on startEdit when allowEdit is not set to true', () => {
    const api = grid.datagridApi;
    api.editMode = 'cell';
    api.columnDefinitions = [
      { field: 'notes', title: 'Notes' } // allowEdit omitted -> must default to false
    ];
    api.data = [{ notes: 'Read only notes' }];

    const cell = api.getCell({ rowIndex: 0, columnIndex: 0 })!;
    const cellEl = new AcDatagridCellElement();
    cellEl.setCell({ datagridCell: cell, datagridApi: api });

    expect(cellEl.isEditable()).toBe(false);
    cellEl.startEdit();
    expect(cellEl.isEditing).toBe(false);
    expect(cellEl.querySelector('input')).toBeNull();
  });

  it('isolates defaultColumnDefiniation per AcDatagridApi instance', () => {
    const grid2 = document.createElement('ac-datagrid') as AcDatagridElement;
    document.body.appendChild(grid2);

    grid.datagridApi.defaultColumnDefiniation.allowEdit = true;
    expect(grid.datagridApi.defaultColumnDefiniation.allowEdit).toBe(true);
    expect(grid2.datagridApi.defaultColumnDefiniation.allowEdit).toBe(false);

    grid2.remove();
  });

  it('does not navigate to the next row on Enter by default (Enter navigation disabled)', () => {
    const api = grid.datagridApi;
    api.editMode = 'cell';
    api.columnDefinitions = [
      { field: 'first_name', title: 'First Name', allowEdit: true }
    ];
    api.data = [
      { first_name: 'Alice' },
      { first_name: 'Bob' }
    ];

    expect(api.enterNavigation).toBe(false);
    expect(api.enterNavigatesVertically).toBe(false);

    const cell = api.getCell({ rowIndex: 0, columnIndex: 0 })!;
    const cellEl = new AcDatagridCellElement();
    cellEl.setCell({ datagridCell: cell, datagridApi: api });
    cell.element = cellEl;
    api.activeDatagridCell = cell;

    cellEl.startEdit();
    expect(cellEl.isEditing).toBe(true);

    const navigateSpy = jest.spyOn(api, 'navigateCell');

    const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    api.eventHandler.handleKeyDown(event);

    expect(event.defaultPrevented).toBe(true);
    expect(cellEl.isEditing).toBe(false);
    expect(navigateSpy).not.toHaveBeenCalled();
    navigateSpy.mockRestore();
  });

  it('navigates to next row on Enter when enterNavigation or enterNavigatesVertically is enabled', () => {
    const api = grid.datagridApi;
    api.editMode = 'cell';
    api.columnDefinitions = [
      { field: 'first_name', title: 'First Name', allowEdit: true }
    ];
    api.data = [
      { first_name: 'Alice' },
      { first_name: 'Bob' }
    ];

    api.enterNavigation = true;
    expect(api.enterNavigatesVertically).toBe(true);

    const cell = api.getCell({ rowIndex: 0, columnIndex: 0 })!;
    const cellEl = new AcDatagridCellElement();
    cellEl.setCell({ datagridCell: cell, datagridApi: api });
    cell.element = cellEl;
    api.activeDatagridCell = cell;

    cellEl.startEdit();
    expect(cellEl.isEditing).toBe(true);

    const navigateSpy = jest.spyOn(api, 'navigateCell');

    const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    api.eventHandler.handleKeyDown(event);

    expect(event.defaultPrevented).toBe(true);
    expect(cellEl.isEditing).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith({ rowDelta: 1, colDelta: 0 });
    navigateSpy.mockRestore();
  });

  it('preserves active cell, edit state, and focus when rows are recreated on DisplayedRowsChange', () => {
    const api = grid.datagridApi;
    api.editMode = 'cell';
    api.columnDefinitions = [
      { field: 'first_name', title: 'First Name', allowEdit: true },
      { field: 'last_name', title: 'Last Name', allowEdit: true }
    ];
    api.data = [
      { first_name: 'Alice', last_name: 'Smith' },
      { first_name: 'Bob', last_name: 'Jones' }
    ];

    const body = grid.datagridBody!;
    expect(body.currentRows.length).toBe(2);

    // Focus and start editing Bob's first_name (row 1, col 0)
    api.focusCell({ rowId: api.displayedDatagridRows[1].rowId, columnId: api.datagridColumns[0].columnId });
    expect(api.activeDatagridCell).toBeDefined();
    expect(api.activeDatagridCell?.datagridRow.rowId).toBe(api.displayedDatagridRows[1].rowId);

    const activeCellEl = api.activeDatagridCell?.element as AcDatagridCellElement;
    expect(activeCellEl).toBeDefined();
    expect(activeCellEl.isEditing).toBe(true);

    const oldRowEl = body.currentRows[1];

    // Add a row to dataManager, which triggers DisplayedRowsChange and recreates rows in body
    api.addRow({ data: { first_name: 'Charlie', last_name: 'Brown' } });

    expect(body.currentRows.length).toBe(3);
    expect(body.currentRows[1]).not.toBe(oldRowEl); // Rows were recreated

    // Active cell must be restored to the newly created cell instance on row 1
    expect(api.activeDatagridCell).toBeDefined();
    expect(api.activeDatagridCell?.datagridRow.rowId).toBe(api.displayedDatagridRows[1].rowId);
    expect(api.activeDatagridCell?.element).toBeDefined();
    expect((api.activeDatagridCell?.element as AcDatagridCellElement).isEditing).toBe(true);
    expect(body.currentRows[1].datagridCells[0].isEditing).toBe(true);
  });

  it('navigates to next cell and wraps to next row on Tab without jumping to row 0', () => {
    const api = grid.datagridApi;
    api.editMode = 'cell';
    api.columnDefinitions = [
      { field: 'action', title: 'Action', allowFocus: false, allowEdit: false },
      { field: 'first_name', title: 'First Name', allowEdit: true },
      { field: 'last_name', title: 'Last Name', allowEdit: true }
    ];
    api.data = [
      { action: 'del', first_name: 'Alice', last_name: 'Smith' },
      { action: 'del', first_name: 'Bob', last_name: 'Jones' }
    ];

    // Start editing row 0, first_name (col 1)
    api.focusCell({ rowId: api.displayedDatagridRows[0].rowId, columnId: api.datagridColumns[1].columnId });
    expect(api.getActiveCellCoordinate()).toEqual({ rowIndex: 0, columnIndex: 1 });

    // Press Tab -> should navigate to last_name (col 2)
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
    api.eventHandler.handleKeyDown(tabEvent);

    expect(tabEvent.defaultPrevented).toBe(true);
    expect(api.getActiveCellCoordinate()).toEqual({ rowIndex: 0, columnIndex: 2 });
    expect(api.activeDatagridCell?.datagridColumn.columnKey).toBe('last_name');

    // Press Tab on last_name (col 2) -> should wrap to row 1, skipping non-focusable action (col 0) to first_name (col 1)
    const tabEvent2 = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
    api.eventHandler.handleKeyDown(tabEvent2);

    expect(tabEvent2.defaultPrevented).toBe(true);
    expect(api.getActiveCellCoordinate()).toEqual({ rowIndex: 1, columnIndex: 1 });
    expect(api.activeDatagridCell?.datagridRow.rowId).toBe(api.displayedDatagridRows[1].rowId);
    expect(api.activeDatagridCell?.datagridColumn.columnKey).toBe('first_name');
  });

  it('keeps focus on active row and navigates properly on Tab after auto-add new row triggers', () => {
    const api = grid.datagridApi;
    api.editMode = 'cell';
    api.columnDefinitions = [
      { field: 'action', title: 'Action', allowFocus: false, allowEdit: false },
      { field: 'first_name', title: 'First Name', allowEdit: true },
      { field: 'last_name', title: 'Last Name', allowEdit: true }
    ];
    api.data = [
      { action: 'del', first_name: 'Alice', last_name: 'Smith' },
      { action: 'del', first_name: 'Bob', last_name: 'Jones' }
    ];

    const body = grid.datagridBody!;
    expect(body.currentRows.length).toBe(2);

    // Focus last row (row 1, col 1: first_name)
    api.focusCell({ rowId: api.displayedDatagridRows[1].rowId, columnId: api.datagridColumns[1].columnId });
    expect(api.getActiveCellCoordinate()).toEqual({ rowIndex: 1, columnIndex: 1 });

    // Simulate editing cell value which triggers row add (like AutoAddNewRow extension)
    const cellEl = api.activeDatagridCell?.element as AcDatagridCellElement;
    expect(cellEl).toBeDefined();

    // Trigger row addition (recreating displayed rows in body)
    api.addRow({ data: { action: 'del', first_name: '', last_name: '' } });
    expect(body.currentRows.length).toBe(3);

    // Active cell was preserved on row 1
    expect(api.getActiveCellCoordinate()).toEqual({ rowIndex: 1, columnIndex: 1 });

    // Press Tab -> should move to row 1, col 2 (last_name), NOT jumping to row 0!
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
    api.eventHandler.handleKeyDown(tabEvent);

    expect(api.getActiveCellCoordinate()).toEqual({ rowIndex: 1, columnIndex: 2 });
    expect(api.activeDatagridCell?.datagridColumn.columnKey).toBe('last_name');

    // Press Tab again -> should wrap to the newly added row 2, col 1 (first_name), NOT row 0!
    const tabEvent2 = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
    api.eventHandler.handleKeyDown(tabEvent2);

    expect(api.getActiveCellCoordinate()).toEqual({ rowIndex: 2, columnIndex: 1 });
    expect(api.activeDatagridCell?.datagridColumn.columnKey).toBe('first_name');
  });
});

