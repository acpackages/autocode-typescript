/**
 * @jest-environment jsdom
 */

import './ac-datagrid.element';
import { AcDatagridElement } from './ac-datagrid.element';
import { IAcDatagridCellElementArgs } from '../_ac-datagrid.export';
import { IAcOnDemandRequestArgs } from '@autocode-ts/autocode';

describe('AcDatagrid cell render count verification', () => {
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

  it('renders each cell exactly once per row on initial on-demand data load', async () => {
    const api = grid.datagridApi;

    api.animateRows = false;
    api.useVirtualScrolling = false;
    api.usePagination = true;

    let srNoRenderCount = 0;

    api.columnDefinitions = [
      {
        field: 'index',
        title: 'SrNo.',
        width: 80,
        cellRendererFunction: (args: IAcDatagridCellElementArgs) => {
          srNoRenderCount++;
          const el = document.createElement('span');
          el.innerHTML = `${args.datagridCell.datagridRow?.data['index']}`;
          return el;
        }
      },
      { field: 'first_name', title: 'First Name' }
    ];

    const mockData = Array.from({ length: 500 }, (_, i) => ({
      index: i + 1,
      first_name: `First_${i + 1}`
    }));

    api.dataManager.onDemandFunction = async (args: IAcOnDemandRequestArgs) => {
      const startIndex = args.startIndex ?? 0;
      const rowsCount = args.rowsCount ?? 50;
      const data = mockData.slice(startIndex, startIndex + rowsCount);
      const totalCount = mockData.length;
      setTimeout(() => {
        args.successCallback({ data, totalCount });
      }, 50);
    };

    if (!api.usePagination) {
      api.dataManager.refreshRows();
    }

    // Wait for request and rendering to settle
    await new Promise((resolve) => setTimeout(resolve, 400));

    // For 50 loaded rows, cellRendererFunction must execute exactly 50 times (not 200)
    expect(srNoRenderCount).toBe(50);
    expect(grid.datagridBody.currentRows.length).toBe(50);
  });
});
