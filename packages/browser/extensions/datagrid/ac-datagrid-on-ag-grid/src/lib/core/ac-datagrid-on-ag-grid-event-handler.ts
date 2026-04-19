/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDatagridApi, IAcDatagridCell, IAcDatagridColumn } from "@autocode-ts/ac-browser";
import { AcDatagridOnAgGridExtension } from "./ac-datagrid-on-ag-grid-extension";
import {
  CellClickedEvent,
  GridApi,
  CellDoubleClickedEvent,
  CellEditingStartedEvent,
  CellEditingStoppedEvent,
  CellKeyDownEvent,
  CellMouseDownEvent,
  FullWidthCellKeyDownEvent,
  CellMouseOutEvent,
  CellMouseOverEvent,
  CellValueChangedEvent,
  ColumnHeaderClickedEvent,
  ColumnMovedEvent,
  ColumnResizedEvent,
  ColumnValueChangedEvent,
  ColumnVisibleEvent,
  PaginationChangedEvent,
  RowClickedEvent,
  RowDataUpdatedEvent,
  RowDoubleClickedEvent,
  RowEditingStartedEvent,
  RowEditingStoppedEvent,
  RowSelectedEvent,
  RowValueChangedEvent,
  SortChangedEvent,
  CellFocusedEvent,
  StateUpdatedEvent,
  ViewportChangedEvent,
  AsyncTransactionsFlushedEvent,
  DisplayedRowsChangedEvent,
  FilterChangedEvent
} from "ag-grid-community";
import { AcDelayedCallback, AcEnumSortOrder, acNullifyInstanceProperties } from "@autocode-ts/autocode";

export class AcDatagridOnAgGridEventHandler {
  agGridExtension?: AcDatagridOnAgGridExtension | null;
  datagridApi?: AcDatagridApi | null;
  gridApi?: GridApi;
  focusedDatagridCell?: IAcDatagridCell;
  pauseEvents: boolean = false;
  private get ignoreEvents(): boolean {
    return this.pauseEvents || this.agGridExtension == undefined || this.agGridExtension == null;
  };
  previousState: boolean = false;
  delayedCallback: AcDelayedCallback = new AcDelayedCallback();

  private onCellClicked = (event: CellClickedEvent) => {
    if (this.ignoreEvents) return;
    if (!this.checkEventHasColumnDetail(event)) return;

    const datagridCell = this.agGridExtension!.getDatagridCellFromEvent({ event });
    if (datagridCell && this.datagridApi) {
      this.datagridApi.eventHandler.handleCellClick({ datagridCell, event: event.event as any });
    }
  };

  private onAsyncTransactionsFlushed = (event: AsyncTransactionsFlushedEvent) => {
    console.log("Async Transaction Flushed");
  };

  private onCellDoubleClicked = (event: CellDoubleClickedEvent) => {
    if (this.ignoreEvents) return;
    if (!this.checkEventHasColumnDetail(event)) return;

    const datagridCell = this.agGridExtension!.getDatagridCellFromEvent({ event });
    if (datagridCell && this.datagridApi) {
      this.datagridApi.eventHandler.handleCellDoubleClick({ datagridCell, event: event.event as any });
    }
  };

  private onCellEditingStarted = (event: CellEditingStartedEvent) => {
    if (this.ignoreEvents) return;
    if (!this.checkEventHasColumnDetail(event)) return;

    const datagridCell = this.agGridExtension!.getDatagridCellFromEvent({ event });
    if (datagridCell && this.datagridApi) {
      this.datagridApi.eventHandler.handleCellEditingStart({ datagridCell, event: event.event as any });
    }
  };

  private onCellEditingStopped = (event: CellEditingStoppedEvent) => {
    if (this.ignoreEvents) return;
    if (!this.checkEventHasColumnDetail(event)) return;

    const datagridCell = this.agGridExtension!.getDatagridCellFromEvent({ event });
    if (datagridCell && this.datagridApi) {
      this.datagridApi.eventHandler.handleCellEditingStop({ datagridCell, event: event.event as any });
    }
  };

  private onCellFocused = (event: CellFocusedEvent) => {
    if (this.delayedCallback) {
      this.delayedCallback.add({
        callback: () => {
          if (this.ignoreEvents) return;
          if (!this.checkEventHasColumnDetail(event)) return;
          const datagridCell = this.agGridExtension!.getDatagridCellFromEvent({ event });
          if (datagridCell && this.datagridApi) {
            this.datagridApi.setActiveCell({ datagridCell });
          }
        }, duration: 300, key: 'cellFocused'
      });
    }

  };

  private onCellKeyDown = (event: CellKeyDownEvent | FullWidthCellKeyDownEvent) => {
    if (this.ignoreEvents) return;
    if (!this.checkEventHasColumnDetail(event)) return;

    const datagridCell = this.agGridExtension!.getDatagridCellFromEvent({ event });
    if (datagridCell && this.datagridApi) {
      this.datagridApi.eventHandler.handleCellKeyDown({ datagridCell, event: event.event as any });
    }
  };

  private onCellMouseDown = (event: CellMouseDownEvent) => {
    if (this.ignoreEvents) return;
    if (!this.checkEventHasColumnDetail(event)) return;

    const datagridCell = this.agGridExtension!.getDatagridCellFromEvent({ event });
    if (datagridCell && this.datagridApi) {
      this.datagridApi.eventHandler.handleCellMouseDown({ datagridCell, event: event.event as any });
    }
  };

  private onCellMouseOut = (event: CellMouseOutEvent) => {
    if (this.ignoreEvents) return;
    if (!this.checkEventHasColumnDetail(event)) return;

    const datagridCell = this.agGridExtension!.getDatagridCellFromEvent({ event });
    if (datagridCell && this.datagridApi) {
      this.datagridApi.eventHandler.handleCellMouseLeave({ datagridCell, event: event.event as any });
    }
  };

  private onCellMouseOver = (event: CellMouseOverEvent) => {
    if (this.ignoreEvents) return;
    if (!this.checkEventHasColumnDetail(event)) return;

    const datagridCell = this.agGridExtension!.getDatagridCellFromEvent({ event });
    if (datagridCell && this.datagridApi) {
      this.datagridApi.eventHandler.handleCellMouseOver({ datagridCell, event: event.event as any });
    }
  };

  private onCellValueChanged = (event: CellValueChangedEvent) => {
    if (this.ignoreEvents) return;
    if (!this.checkEventHasColumnDetail(event)) return;

    const datagridCell = this.agGridExtension!.getDatagridCellFromEvent({ event });
    if (datagridCell) {
      // this.datagridApi!.eventHandler.handleCellValueChange({ datagridCell, event: event.event as any });
    }
  };

  private onColumnHeaderClicked = (event: ColumnHeaderClickedEvent) => {
    if (this.ignoreEvents) return;
    if (!this.checkEventHasColumnDetail(event)) return;

    const datagridColumn = this.agGridExtension!.getDatagridColumnFromEvent({ event });
    if (datagridColumn && this.datagridApi) {
      this.datagridApi.eventHandler.handleColumnHeaderClick({ datagridColumn });
    }
  };

  private onColumnMoved = (event: ColumnMovedEvent) => {
    if (this.ignoreEvents) return;
    if (!this.checkEventHasColumnDetail(event)) return;

    const datagridColumn = this.agGridExtension!.getDatagridColumnFromEvent({ event });
    if (datagridColumn && this.datagridApi) {
      this.datagridApi.eventHandler.handleColumnPositionChange({ datagridColumn });
    }
  };

  private onColumnResized = (event: ColumnResizedEvent) => {
    if (this.ignoreEvents) return;
    if (!this.checkEventHasColumnDetail(event)) return;

    const datagridColumn = this.agGridExtension!.getDatagridColumnFromEvent({ event });
    if (datagridColumn && this.datagridApi && event.column) {
      datagridColumn.width = event.column.getActualWidth();
      this.datagridApi.eventHandler.handleColumnResize({ datagridColumn });
    }
  };

  private onColumnValueChanged = (event: ColumnValueChangedEvent) => {
    if (this.ignoreEvents) return;
    if (!this.checkEventHasColumnDetail(event)) return;

    const datagridColumn = this.agGridExtension!.getDatagridColumnFromEvent({ event });
    if (datagridColumn && this.datagridApi) {
      this.datagridApi.eventHandler.handleColumnDataChange({ datagridColumn });
    }
  };

  private onColumnVisible = (event: ColumnVisibleEvent) => {
    if (this.ignoreEvents) return;
    if (!this.checkEventHasColumnDetail(event)) return;

    const datagridColumn = this.agGridExtension!.getDatagridColumnFromEvent({ event });
    if (datagridColumn && this.datagridApi) {
      this.datagridApi.eventHandler.handleColumnVisibilityChange({ datagridColumn });
    }
  };

  private onDisplayedRowsChanged = (event: DisplayedRowsChangedEvent) => {
    console.log('Displayed rows updated');
  }

  private onFilterChanged = (event: FilterChangedEvent) => {
    if (this.datagridApi && this.agGridExtension && this.gridApi) {
      if (!this.agGridExtension.isClientSideData) {
        this.datagridApi.dataManager.reset();
        this.gridApi.refreshServerSide({ purge: true });
      }
    }
  }

  private onPaginationChanged = (event: PaginationChangedEvent) => {
    if (this.ignoreEvents) return;
    if (!this.datagridApi?.pagination || !this.gridApi) return;

    this.datagridApi.pagination.activePageSize = this.gridApi.paginationGetPageSize();
    this.datagridApi.pagination.activePage = this.gridApi.paginationGetCurrentPage() + 1;
    this.datagridApi.eventHandler.handlePaginationChange();
  };

  private onRowClicked = (event: RowClickedEvent) => {
    if (this.ignoreEvents) return;

    const datagridRow = this.agGridExtension!.getDatagridRowFromEvent({ event });
    if (datagridRow && this.datagridApi) {
      this.datagridApi.eventHandler.handleRowClick({ datagridRow, event: event.event as any });
    }
  };

  private onRowDataUpdated = (event: RowDataUpdatedEvent) => {
    if (this.datagridApi) {
      this.datagridApi.datagrid.afterRowsContainer.style.visibility = 'hidden';
    }
    if (this.ignoreEvents) return;
    const datagridRow = this.agGridExtension!.getDatagridRowFromEvent({ event });
    if (datagridRow && this.datagridApi) {
      this.datagridApi.eventHandler.handleRowDataChange({ datagridRow, event: event as any });
    }
  };

  private onRowDoubleClicked = (event: RowDoubleClickedEvent) => {
    if (this.ignoreEvents) return;

    const datagridRow = this.agGridExtension!.getDatagridRowFromEvent({ event });
    if (datagridRow && this.datagridApi) {
      this.datagridApi.eventHandler.handleRowDoubleClick({ datagridRow, event: event.event as any });
    }
  };

  private onRowEditingStarted = (event: RowEditingStartedEvent) => {
    if (this.ignoreEvents) return;

    const datagridRow = this.agGridExtension!.getDatagridRowFromEvent({ event });
    if (datagridRow && this.datagridApi) {
      this.datagridApi.eventHandler.handleRowEditingStart({ datagridRow, event: event.event as any });
    }
  };

  private onRowEditingStopped = (event: RowEditingStoppedEvent) => {
    if (this.ignoreEvents) return;

    const datagridRow = this.agGridExtension!.getDatagridRowFromEvent({ event });
    if (datagridRow && this.datagridApi) {
      this.datagridApi.eventHandler.handleRowEditingStop({ datagridRow, event: event.event as any });
    }
  };

  private onRowSelected = (event: RowSelectedEvent) => {
    if (this.ignoreEvents) return;

    const datagridRow = this.agGridExtension!.getDatagridRowFromEvent({ event });
    if (datagridRow && this.datagridApi) {
      this.datagridApi.eventHandler.handleRowSelectionChange({ datagridRow, event: event.event as any });
    }
  };

  private onRowValueChanged = (event: RowValueChangedEvent) => {
    if (this.ignoreEvents) return;

    const datagridRow = this.agGridExtension!.getDatagridRowFromEvent({ event });
    if (datagridRow && this.datagridApi) {
      this.datagridApi.eventHandler.handleRowDataChange({ datagridRow, event: event.event as any });
    }
  };

  private onSortChanged = (event: SortChangedEvent) => {
    if (this.ignoreEvents) return;
    if (!event.columns || event.columns.length === 0) return;
    if (this.agGridExtension!.isClientSideData) return;

    const column: any = event.columns[0];
    let order: AcEnumSortOrder = AcEnumSortOrder.None;
    if (column.sort === 'asc') {
      order = AcEnumSortOrder.Ascending;
    } else if (column.sort === 'desc') {
      order = AcEnumSortOrder.Descending;
    }

    if (this.datagridApi && this.gridApi) {
      this.datagridApi.dataManager.sortOrder.addSort({ key: column.colDef.field!, order });
      this.datagridApi.dataManager.reset();
      this.gridApi.refreshServerSide({ purge: true });
    }
  };

  private onStateUpdated = (event: StateUpdatedEvent) => {
    if (this.ignoreEvents) return;
    if (this.datagridApi) {
      this.datagridApi.datagridState.refresh();
    }
  };

  private onViewportChanged = (event: ViewportChangedEvent) => {
    console.log("Viewport updated");
    if (this.datagridApi) {
      this.datagridApi.datagrid.afterRowsContainer.style.visibility = '';
    }
  };

  private checkEventHasColumnDetail(event: any): boolean {
    let isValid: boolean = false;
    if (event.colDef && event.colDef.field && event.colDef.field !== '_ac_internal_actions') {
      isValid = true;
    } else if (event.column && event.column.colDef && event.column.colDef.field && event.column.colDef.field !== '_ac_internal_actions') {
      isValid = true;
    }
    return isValid;
  }

  destroy() {
    this.removeListeners();
    this.delayedCallback.destroy();
    acNullifyInstanceProperties({ instance: this });
  }

  init({ agGridExtension }: { agGridExtension: AcDatagridOnAgGridExtension }) {
    this.removeListeners();
    this.agGridExtension = agGridExtension;
    this.datagridApi = agGridExtension.datagridApi;
    if (this.agGridExtension.gridApi) {
      this.gridApi = agGridExtension.gridApi;
      if (this.gridApi) {
        this.gridApi.addEventListener('asyncTransactionsFlushed', this.onAsyncTransactionsFlushed);
        this.gridApi.addEventListener('cellClicked', this.onCellClicked);
        this.gridApi.addEventListener('cellDoubleClicked', this.onCellDoubleClicked);
        this.gridApi.addEventListener('cellEditingStarted', this.onCellEditingStarted);
        this.gridApi.addEventListener('cellEditingStopped', this.onCellEditingStopped);
        this.gridApi.addEventListener('cellFocused', this.onCellFocused);
        this.gridApi.addEventListener('cellKeyDown', this.onCellKeyDown);
        this.gridApi.addEventListener('cellMouseDown', this.onCellMouseDown);
        this.gridApi.addEventListener('cellMouseOut', this.onCellMouseOut);
        this.gridApi.addEventListener('cellMouseOver', this.onCellMouseOver);
        this.gridApi.addEventListener('cellValueChanged', this.onCellValueChanged);
        this.gridApi.addEventListener('columnHeaderClicked', this.onColumnHeaderClicked);
        this.gridApi.addEventListener('columnMoved', this.onColumnMoved);
        this.gridApi.addEventListener('columnResized', this.onColumnResized);
        this.gridApi.addEventListener('columnValueChanged', this.onColumnValueChanged);
        this.gridApi.addEventListener('columnVisible', this.onColumnVisible);
        this.gridApi.addEventListener('filterChanged', this.onFilterChanged);
        this.gridApi.addEventListener('paginationChanged', this.onPaginationChanged);
        this.gridApi.addEventListener('rowClicked', this.onRowClicked);
        this.gridApi.addEventListener('rowDataUpdated', this.onRowDataUpdated);
        this.gridApi.addEventListener('rowDoubleClicked', this.onRowDoubleClicked);
        this.gridApi.addEventListener('rowEditingStarted', this.onRowEditingStarted);
        this.gridApi.addEventListener('rowEditingStopped', this.onRowEditingStopped);
        this.gridApi.addEventListener('rowSelected', this.onRowSelected);
        this.gridApi.addEventListener('rowValueChanged', this.onRowValueChanged);
        this.gridApi.addEventListener('sortChanged', this.onSortChanged);
        this.gridApi.addEventListener('stateUpdated', this.onStateUpdated);
        // this.gridApi.addEventListener('viewportChanged', this.onViewportChanged);
      }
    }
  }

  removeListeners() {
    if (this.gridApi) {
      this.gridApi.removeEventListener('cellClicked', this.onCellClicked);
      this.gridApi.removeEventListener('cellDoubleClicked', this.onCellDoubleClicked);
      this.gridApi.removeEventListener('cellEditingStarted', this.onCellEditingStarted);
      this.gridApi.removeEventListener('cellEditingStopped', this.onCellEditingStopped);
      this.gridApi.removeEventListener('cellFocused', this.onCellFocused);
      this.gridApi.removeEventListener('cellKeyDown', this.onCellKeyDown);
      this.gridApi.removeEventListener('cellMouseDown', this.onCellMouseDown);
      this.gridApi.removeEventListener('cellMouseOut', this.onCellMouseOut);
      this.gridApi.removeEventListener('cellMouseOver', this.onCellMouseOver);
      this.gridApi.removeEventListener('cellValueChanged', this.onCellValueChanged);
      this.gridApi.removeEventListener('columnHeaderClicked', this.onColumnHeaderClicked);
      this.gridApi.removeEventListener('columnMoved', this.onColumnMoved);
      this.gridApi.removeEventListener('columnResized', this.onColumnResized);
      this.gridApi.removeEventListener('columnValueChanged', this.onColumnValueChanged);
      this.gridApi.removeEventListener('columnVisible', this.onColumnVisible);
      this.gridApi.removeEventListener('filterChanged', this.onFilterChanged);
      this.gridApi.removeEventListener('paginationChanged', this.onPaginationChanged);
      this.gridApi.removeEventListener('rowClicked', this.onRowClicked);
      this.gridApi.removeEventListener('rowDataUpdated', this.onRowDataUpdated);
      this.gridApi.removeEventListener('rowDoubleClicked', this.onRowDoubleClicked);
      this.gridApi.removeEventListener('rowEditingStarted', this.onRowEditingStarted);
      this.gridApi.removeEventListener('rowEditingStopped', this.onRowEditingStopped);
      this.gridApi.removeEventListener('rowSelected', this.onRowSelected);
      this.gridApi.removeEventListener('rowValueChanged', this.onRowValueChanged);
      this.gridApi.removeEventListener('sortChanged', this.onSortChanged);
      this.gridApi.removeEventListener('stateUpdated', this.onStateUpdated);
      this.gridApi.removeEventListener('viewportChanged', this.onViewportChanged);
    }
  }
}
