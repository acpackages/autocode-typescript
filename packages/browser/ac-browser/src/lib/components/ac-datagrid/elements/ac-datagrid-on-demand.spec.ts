/**
 * @jest-environment jsdom
 */

import './ac-datagrid.element';
import { AcDatagridElement } from './ac-datagrid.element';
import { IAcOnDemandRequestArgs } from '@autocode-ts/autocode';

describe('AcDatagridElement - On-Demand Data', () => {
  let grid: AcDatagridElement;

  beforeEach(() => {
    grid = document.createElement('ac-datagrid') as AcDatagridElement;
    document.body.appendChild(grid);
  });

  afterEach(() => {
    grid.remove();
  });

  it('should switch dataManager to ondemand type when onDemandFunction is assigned', () => {
    const api = grid.datagridApi;
    expect(api.dataManager.type).toBe('offline');

    api.dataManager.onDemandFunction = (args: IAcOnDemandRequestArgs) => {
      args.successCallback({ data: [], totalCount: 0 });
    };

    expect(api.dataManager.type).toBe('ondemand');
  });

  it('should request and render rows via onDemandFunction', async () => {
    const api = grid.datagridApi;
    api.usePagination = true;
    api.columnDefinitions = [
      { field: 'id', title: 'ID' },
      { field: 'name', title: 'Name' }
    ];

    const mockServerData = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Charlie' }
    ];

    const requests: IAcOnDemandRequestArgs[] = [];

    api.dataManager.onDemandFunction = (args: IAcOnDemandRequestArgs) => {
      requests.push(args);
      const start = args.startIndex ?? 0;
      const count = args.rowsCount ?? 10;
      const slice = mockServerData.slice(start, start + count);
      args.successCallback({
        data: slice,
        totalCount: mockServerData.length
      });
    };

    // The pagination extension automatically requests page 1 on onDemandFunction set
    expect(requests.length).toBeGreaterThanOrEqual(1);
    expect(api.dataManager.totalRows).toBe(3);

    // Fetch specific slice
    api.dataManager.reset();
    await api.dataManager.getRows({ startIndex: 0, rowsCount: 2 });

    const lastReq = requests[requests.length - 1];
    expect(lastReq.startIndex).toBe(0);
    expect(lastReq.rowsCount).toBe(2);

    api.dataManager.setDisplayedRows({ startIndex: 0, rowsCount: 2 });
    expect(api.displayedDatagridRows.length).toBe(2);
    expect(api.displayedDatagridRows[0].data.name).toBe('Alice');
    expect(api.displayedDatagridRows[1].data.name).toBe('Bob');
  });

  it('should pass searchQuery to onDemandFunction when refreshed', async () => {
    const api = grid.datagridApi;
    let receivedQuery = '';

    api.dataManager.onDemandFunction = (args: IAcOnDemandRequestArgs) => {
      receivedQuery = args.searchQuery ?? '';
      args.successCallback({ data: [{ id: '1', name: 'Filtered' }], totalCount: 1 });
    };

    api.dataManager.searchQuery = 'Alice';
    api.dataManager.reset();
    await api.dataManager.getRows({ startIndex: 0, rowsCount: 10 });

    expect(receivedQuery).toBe('Alice');
  });

  it('should display rows when directly navigating to the last page', async () => {
    const api = grid.datagridApi;
    api.usePagination = true;
    api.columnDefinitions = [
      { field: 'id', title: 'ID' },
      { field: 'name', title: 'Name' }
    ];

    // 150 items, page size 50 -> 3 pages
    const mockServerData = Array.from({ length: 150 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Person ${i + 1}`
    }));

    api.dataManager.onDemandFunction = (args: IAcOnDemandRequestArgs) => {
      const start = args.startIndex ?? 0;
      const count = args.rowsCount ?? 50;
      const slice = mockServerData.slice(start, start + count);
      args.successCallback({
        data: slice,
        totalCount: mockServerData.length
      });
    };

    // Wait for initial page (page 1) to load
    await new Promise((r) => setTimeout(r, 50));
    expect(api.pagination.totalPages).toBe(3);
    expect(api.pagination.activePage).toBe(1);
    expect(api.displayedDatagridRows.length).toBe(50);

    // Directly navigate to last page (page 3) without loading page 2
    api.pagination.activePage = 3;
    await new Promise((r) => setTimeout(r, 50));

    expect(api.pagination.activePage).toBe(3);
    expect(api.displayedDatagridRows.length).toBe(50);
    expect(api.displayedDatagridRows[0].data.name).toBe('Person 101');
    expect(api.displayedDatagridRows[49].data.name).toBe('Person 150');

    const domRows = grid.querySelectorAll('ac-datagrid-row');
    expect(domRows.length).toBe(50);
  });
});
