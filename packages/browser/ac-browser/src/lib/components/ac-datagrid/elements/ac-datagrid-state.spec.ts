/**
 * @jest-environment jsdom
 */
import './ac-datagrid.element';
import { AcDatagridElement } from './ac-datagrid.element';
import { AC_DATAGRID_EVENT } from '../consts/ac-datagrid-event.const';
import { AcEnumSortOrder } from '@autocode-ts/autocode';
import { IAcDatagridStateChangeEvent } from '../interfaces/event-args/ac-datagrid-state-change-event.interface';

describe('AcDatagrid state get, set and stateChange event emit', () => {
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

  it('getState() synchronously returns a full state object with column details', () => {
    const api = grid.datagridApi;
    api.columnDefinitions = [
      { field: 'id', title: 'ID', width: 80, visible: true },
      { field: 'name', title: 'Name', width: 200, visible: true },
      { field: 'role', title: 'Role', width: 150, visible: false }
    ];

    api.data = [
      { id: 1, name: 'Alice', role: 'Admin' },
      { id: 2, name: 'Bob', role: 'User' }
    ];

    const state = grid.getState();
    expect(state).toBeDefined();
    expect(state.columns).toBeDefined();
    expect(state.columns!.length).toBe(3);

    const idCol = state.columns!.find((c) => c.field === 'id');
    expect(idCol).toBeDefined();
    expect(idCol!.width).toBe(80);
    expect(idCol!.isVisible).toBe(true);

    const roleCol = state.columns!.find((c) => c.field === 'role');
    expect(roleCol).toBeDefined();
    expect(roleCol!.isVisible).toBe(false);

    expect(state.pagination).toBeDefined();
    expect(state.sortOrder).toBeDefined();
  });

  it('setState() restores column widths, visibility, order, and pinned status', () => {
    const api = grid.datagridApi;
    api.columnDefinitions = [
      { field: 'id', title: 'ID', width: 100, visible: true },
      { field: 'name', title: 'Name', width: 150, visible: true },
      { field: 'city', title: 'City', width: 200, visible: true }
    ];

    api.data = [
      { id: 1, name: 'Alice', city: 'London' }
    ];

    const customState = {
      version: 1,
      columns: [
        { field: 'city', width: 350, isVisible: true, index: 0, pinnedOn: 'LEFT' as const },
        { field: 'id', width: 80, isVisible: false, index: 1 },
        { field: 'name', width: 250, isVisible: true, index: 2 }
      ],
      groupBy: ['city'],
      sidePanelOpen: true
    };

    grid.setState(customState);

    const cityCol = api.getColumn({ key: 'city' });
    expect(cityCol).toBeDefined();
    expect(cityCol!.width).toBe(350);
    expect(cityCol!.pinnedOn).toBe('LEFT');

    const idCol = api.getColumn({ key: 'id' });
    expect(idCol!.visible).toBe(false);

    const nameCol = api.getColumn({ key: 'name' });
    expect(nameCol!.width).toBe(250);

    expect(api.groupBy).toEqual(['city']);
    expect(api.sidePanelOpen).toBe(true);
  });

  it('supports round-trip state get and set via element state property', () => {
    const api = grid.datagridApi;
    api.columnDefinitions = [
      { field: 'col1', title: 'Column 1', width: 120, visible: true },
      { field: 'col2', title: 'Column 2', width: 180, visible: true }
    ];
    api.data = [{ col1: 'a', col2: 'b' }];

    const initial = grid.state;
    expect(initial.columns?.length).toBe(2);

    // Modify grid
    api.datagridColumns[0].width = 300;
    const modified = grid.state;
    expect(modified.columns?.find((c) => c.field === 'col1')?.width).toBe(300);

    // Restore initial state
    grid.state = initial;
    expect(api.datagridColumns.find((c) => c.columnDefinition.field === 'col1')?.width).toBe(120);
  });

  it('emits stateChange event with IAcDatagridStateChangeEvent payload on sort change', async () => {
    const api = grid.datagridApi;
    api.columnDefinitions = [
      { field: 'name', title: 'Name', allowSort: true }
    ];
    api.data = [{ name: 'Charlie' }, { name: 'Alice' }];

    let eventFired = false;
    let receivedArgs: IAcDatagridStateChangeEvent | undefined;

    api.on({
      event: AC_DATAGRID_EVENT.StateChange,
      callback: (args: IAcDatagridStateChangeEvent) => {
        eventFired = true;
        receivedArgs = args;
      }
    });

    const col = api.datagridColumns[0];
    api.setColumnSortOrder({ datagridColumn: col, sortOrder: AcEnumSortOrder.Ascending });

    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(eventFired).toBe(true);
    expect(receivedArgs).toBeDefined();
    expect(receivedArgs!.datagridApi).toBe(api);
    expect(receivedArgs!.datagridState).toBeDefined();
    expect(receivedArgs!.datagridState.columns).toBeDefined();
  });

  it('emits stateChange event when columns are pinned or resized', async () => {
    const api = grid.datagridApi;
    api.columnDefinitions = [
      { field: 'title', title: 'Title', width: 100 }
    ];
    api.data = [{ title: 'Book 1' }];

    let eventFired = false;
    let receivedArgs: IAcDatagridStateChangeEvent | undefined;

    api.on({
      event: AC_DATAGRID_EVENT.StateChange,
      callback: (args: IAcDatagridStateChangeEvent) => {
        eventFired = true;
        receivedArgs = args;
      }
    });

    api.pinColumn({ columnId: api.datagridColumns[0].columnId, pinnedOn: 'LEFT' });

    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(eventFired).toBe(true);
    expect(receivedArgs).toBeDefined();
    expect(receivedArgs!.datagridApi).toBe(api);
    expect(receivedArgs!.datagridState).toBeDefined();
  });
});
