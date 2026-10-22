import { GridOptions } from "ag-grid-community";

export const AC_DATAGRID_AGGRID_DEFAULT_OPTIONS: GridOptions = {
  alwaysMultiSort: true,
  pagination: true,
  // suppressPaginationPanel: true,
  suppressContextMenu: true,
  // PERF FIX: Disable row animation to avoid per-row DOM transition cost on large datasets
  animateRows: false,
  enterNavigatesVertically: false,
  enterNavigatesVerticallyAfterEdit: false,
  // PERF FIX: Server-side row model block settings - 50 rows/block, max 10 blocks in cache
  cacheBlockSize: 50,
  maxBlocksInCache: 10,
  // PERF FIX: Debounce block load requests by 150ms to avoid hammering the server during fast scroll
  blockLoadDebounceMillis: 150,
  // suppressColumnVirtualisation:false,
  // cellFadeDuration:0,
  // suppressAnimationFrame:false
  // suppressCellFocus:true,
};
