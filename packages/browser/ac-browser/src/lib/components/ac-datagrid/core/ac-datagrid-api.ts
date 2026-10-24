/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcPaginationElement } from "../../ac-pagination/elements/ac-pagination.element";
import { AcDatagridElement } from "../elements/ac-datagrid.element";
import { IAcDatagridColumnDefinition } from "../interfaces/ac-datagrid-column-definition.interface";
import { AcDataManager, AC_DATA_MANAGER_EVENT, AC_DATA_MANAGER_HOOK, AcEnumLogicalOperator, AcEnumSortOrder, AcEvents, AcHooks, AcLogger, Autocode, IAcDataManagerDataEvent, IAcFilter, IAcFilterGroup, acNullifyInstanceProperties } from "@autocode-ts/autocode";
import { AC_DATAGRID_EVENT } from "../consts/ac-datagrid-event.const";
import { IAcDatagridColumnDragPlaceholderCreatorArgs } from "../interfaces/callback-args/ac-datagrid-column-drag-placeholder-creator-args.interface";
import { IAcDatagridRowDragPlaceholderCreatorArgs } from "../interfaces/callback-args/ac-datagrid-row-drag-placeholder-creator-args.interface";
import { IAcDatagridRowPositionChangeEvent } from "../interfaces/event-args/ac-datagrid-row-position-change-event.interface";
import { IAcDatagridColumnPositionChangeEvent } from "../interfaces/event-args/ac-datagrid-column-position-change-event.interface";
import { IAcDatagridColumnSortChangeEvent } from "../interfaces/event-args/ac-datagrid-column-sort-change-event.interface";
import { IAcDatagridColumnFilterChangeEvent } from "../interfaces/event-args/ac-datagrid-column-filter-change-event.interface";
import { AC_DATAGRID_HOOK } from "../consts/ac-datagrid-hook.const";
import { AcDatagridExtension } from "./ac-datagrid-extension";
import { AcDatagridExtensionManager } from "./ac-datagrid-extension-manager";
import { IAcDatagridColDefsChangeHookArgs } from "../interfaces/hook-args/ac-datagrid-coldefs-change-hook-args.interface";
import { AcDatagridEventHandler } from "./ac-datagrid-event-handler";
import { AcEnumDataSourceType } from "../../../enums/ac-enum-data-source-type.enum";
import { IAcDatagridColumnHookArgs } from "../interfaces/hook-args/ac-datagrid-column-hook-args.interface";
import { IAcDatagridUsePaginationChangeHookArgs } from "../interfaces/hook-args/ac-datagrid-use-pagination-change-hook-args.interface";
import { AcDatagridState } from "../models/ac-datagrid-state.model";
import { IAcDatagridRowHookArgs } from "../interfaces/hook-args/ac-datagrid-row-hook-args.interface";
import { IAcDatagridExtensionEnabledHookArgs } from "../interfaces/hook-args/ac-datagrid-extension-enabled-hook-args.interface";
import { IAcDatagridRowFocusHookArgs } from "../interfaces/hook-args/ac-datagrid-row-focus-hook-args.interface";
import { IAcDatagridState } from "../interfaces/ac-datagrid-state.interface";
import { IAcDatagridStateChangeEvent } from "../interfaces/event-args/ac-datagrid-state-change-event.interface";
import { IAcDatagridColumnState } from "../interfaces/ac-datagrid-column-state.interface";
import { IAcDatagridColumnDefinitionsSetEvent } from "../interfaces/event-args/ac-datagrid-column-definitions-set-event.interface";
import { AC_DATAGRID_DEFAULT_COLUMN_DEFINITION, AcEnumDatagridColumnDataType, IAcDatagridActiveRowChangeEvent, IAcDatagridCell, IAcDatagridColumn } from "../_ac-datagrid.export";
import { isValidDateString, isValidDateTimeString } from "@autocode-ts/ac-extensions";
import { IAcDatagridRow } from "../interfaces/ac-datagrid-row.interface";
import { AcDatagridColumnSizeHelper } from "../helpers/ac-datagrid-column-size-helper";
import { IAcDatagridSizeColumnsToFitOptions } from "../interfaces/options/ac-datagrid-size-columns-to-fit-options.interface";
import { IAcDatagridAutoSizeColumnsOptions } from "../interfaces/options/ac-datagrid-auto-size-columns-options.interface";
import { AcBrowser } from "../../../core/ac-browser";
import { AcDatagridExportHelper } from "../helpers/ac-datagrid-export-helper";
import { AcExcelExportService, IAcExcelSheetExportDef } from "@autocode-ts/ac-data-manager-export";
import { IAcDatagridCsvExportParams, IAcDatagridExcelExportParams, IAcDatagridExcelExportMultipleSheetsParams } from "../interfaces/export/ac-datagrid-export-params.interface";

export class AcDatagridApi {
  private _bodyWidth: number = 0;
  get bodyWidth(): number {
    return this._bodyWidth;
  }
  set bodyWidth(value: number) {
    this._bodyWidth = value;
  }

  private _fillAvailableWidth: boolean = false;
  get fillAvailableWidth(): boolean {
    return this._fillAvailableWidth;
  }
  set fillAvailableWidth(value: boolean) {
    if (this._fillAvailableWidth !== value) {
      this._fillAvailableWidth = value;
      this.recomputeColumnLayout();
    }
  }

  private _columnDefinitions: IAcDatagridColumnDefinition[] = [];
  get columnDefinitions(): IAcDatagridColumnDefinition[] {
    this.logger.log('Getting column definitions', { count: this._columnDefinitions.length });
    return this._columnDefinitions;
  }
  set columnDefinitions(value: IAcDatagridColumnDefinition[]) {
    this.logger.log('Setting column definitions', { oldCount: this._columnDefinitions.length, newCount: value.length });
    const hookArgs: IAcDatagridColDefsChangeHookArgs = {
      columnDefinitions: value,
      datagridApi: this,
      oldColumnDefinitions: this._columnDefinitions
    };
    this.hooks.execute({ hook: AC_DATAGRID_HOOK.BeforeColumnDefinitionsChange, args: hookArgs });
    this.logger.log('Executed BeforeColumnDefinitionsChange hook');
    this._columnDefinitions = value;
    this.datagridColumns = [];
    this.logger.log('Cleared existing datagridColumns');

    const usedIndices = new Set<number>();
    const totalColumns = this._columnDefinitions.length;

    for (const col of this._columnDefinitions) {
      if (
        typeof col.index === "number" &&
        col.index >= 0 &&
        col.index < totalColumns &&
        !usedIndices.has(col.index)
      ) {
        usedIndices.add(col.index);
        this.logger.log('Valid index found for column', { field: col.field, index: col.index });
      } else {
        col.index = -1;
        this.logger.log('Invalid index reset for column', { field: col.field });
      }
    }

    let nextIndex = 0;
    for (const col of this._columnDefinitions) {
      while (usedIndices.has(nextIndex)) {
        nextIndex++;
      }
      if (col.index === -1 || col.index! >= totalColumns) {
        col.index = nextIndex++;
        usedIndices.add(col.index);
        this.logger.log('Assigned new index to column', { field: col.field, index: col.index });
      }
    }

    this._columnDefinitions.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    this.logger.log('Sorted column definitions by index');

    let displayIndex: number = -1;
    for (const colDef of this._columnDefinitions) {
      const column: IAcDatagridColumnDefinition | any = { ...this.defaultColumnDefiniation, ...colDef };
      if (column.visible) {
        displayIndex++;
      }
      let rawEditable: any;
      if (colDef.allowEdit !== undefined) {
        rawEditable = colDef.allowEdit;
      } else if (colDef.editable !== undefined) {
        rawEditable = colDef.editable;
      } else if (this.defaultColumnDefiniation?.allowEdit !== undefined) {
        rawEditable = this.defaultColumnDefiniation.allowEdit;
      } else if (this.defaultColumnDefiniation?.editable !== undefined) {
        rawEditable = this.defaultColumnDefiniation.editable;
      } else {
        rawEditable = false;
      }
      const allowEditBool = typeof rawEditable === 'function' ? true : !!rawEditable;
      column.allowEdit = allowEditBool;
      column.editable = rawEditable;

      let rawFocusable: boolean;
      if (colDef.allowFocus !== undefined) {
        rawFocusable = !!colDef.allowFocus;
      } else if ((colDef as any).suppressFocus !== undefined) {
        rawFocusable = !(colDef as any).suppressFocus;
      } else if (allowEditBool) {
        rawFocusable = true;
      } else if (this.defaultColumnDefiniation?.allowFocus !== undefined) {
        rawFocusable = this.defaultColumnDefiniation.allowFocus;
      } else {
        rawFocusable = false;
      }
      column.allowFocus = rawFocusable;

      const datagridColumn: IAcDatagridColumn = {
        columnDefinition: column,
        rawColumnDefinition: colDef,
        originalIndex: column.index!,
        isActive: false,
        dataType: AcEnumDatagridColumnDataType.Unknown,
        columnId: Autocode.uuid(),
        extensionData: {},
        allowEdit: allowEditBool,
        editable: rawEditable,
        isTreeColumn: column.isTreeColumn,
        cellClass: column.cellClass,
        headerCellClass: column.headerCellClass,
        allowFilter: column.allowFilter,
        allowFocus: rawFocusable,
        allowResize: column.allowResize,
        allowSort: column.allowSort,
        columnKey: column.field,
        isFirst: false,
        isLast: false,
        title: column.title ?? column.field,
        visible: column.visible,
        index: column.visible ? displayIndex : -1,
        width: column.width ?? this.defaultColumnDefiniation.width,
        flexSize: column.flex ?? column.flexSize,
        autoWidth: column.autoWidth,
        suppressSizeToFit: column.suppressSizeToFit,
        pinnedOn: column.pinnedOn
      };
      this.datagridColumns.push(datagridColumn);
      this.logger.log('Created and added datagridColumn', { field: colDef.field, index: column.index });

      const columnCreatedArgs: IAcDatagridColumnHookArgs = {
        datagridApi: this,
        datagridColumn
      };
      this.hooks.execute({
        hook: AC_DATAGRID_HOOK.DatagridColumnCreate,
        args: columnCreatedArgs
      });
      this.logger.log('Executed DatagridColumnCreate hook for column', { field: colDef.field });
    }

    // PERF FIX (P3): Rebuild O(1) lookup maps after columns are finalised
    this._columnByKey.clear();
    this._columnById.clear();
    for (const col of this.datagridColumns) {
      if (col.columnKey) this._columnByKey.set(col.columnKey, col);
      if (col.columnId) this._columnById.set(col.columnId, col);
    }
    this.hooks.execute({ hook: AC_DATAGRID_HOOK.ColumnDefinitionsChange, args: hookArgs });
    this.logger.log('Executed ColumnDefinitionsChange hook');
    const event: IAcDatagridColumnDefinitionsSetEvent = {
      columnDefinitions: value,
      datagridColumns: this.datagridColumns,
      datagridApi: this
    };
    this.events.execute({ event: AC_DATAGRID_EVENT.ColumnDefinitionsSet, args: event });
    this.logger.log('Executed ColumnDefinitionsSet event');
    this.recomputeColumnLayout();
  }

  get data(): any[] {
    this.logger.log('Getting data', { count: this.dataManager.data.length });
    return this.dataManager.data;
  }
  set data(value: any[]) {
    // PERF FIX (P3): setRows() (called by dataManager.data setter) already calls processRows() internally.
    // Calling it again here was a double-compute on every data assignment.
    this.dataManager.data = value;
    this.syncRowProperties();
    if (this.treeConfig) {
      this.initTreeRows();
    }
    this.hooks.execute({ hook: AC_DATAGRID_HOOK.DisplayedRowsChange, args: { datagridApi: this, displayedRows: this.displayedDatagridRows } });
    // this.events.execute({ event: AC_DATAGRID_EVENT.DataChange });
  }

  get datagridRows(): IAcDatagridRow[] {
    let result: IAcDatagridRow[] = [];
    if (this.dataManager) {
      result = this.dataManager.rows as IAcDatagridRow[];
    }
    return result;
  }

  setColumnWidth({ datagridColumn, width }: { datagridColumn: IAcDatagridColumn, width: number }) {
    if (width < 30) width = 30;
    const oldWidth = datagridColumn.width;
    datagridColumn.width = width;

    // 1. Update header cell DOM
    const headerCell = this.datagrid?.datagridHeader?.datagridHeaderCells.find(
      c => c.datagridColumn?.columnId === datagridColumn.columnId
    );
    headerCell?.setCellWidth();

    // 2. Update all corresponding cells in the body DOM
    if (this.datagrid?.datagridBody?.currentRows) {
      for (const rowEl of this.datagrid.datagridBody.currentRows) {
        const cellEl = rowEl.datagridCells.find(
          c => c.datagridCell?.datagridColumn?.columnId === datagridColumn.columnId
        );
        cellEl?.setCellWidth();
      }
    }

    // 3. Update pinned column offsets if pinned
    if (this.datagridColumns.some(c => !!c.pinnedOn)) {
      this.updatePinnedOffsets();
      this.datagrid?.datagridHeader?.refresh();
    }

    this.datagrid?.datagridHeader?.syncScrollbarSpacer?.();
    this.hooks.execute({ hook: AC_DATAGRID_HOOK.ColumnWidthChange, args: { datagridColumn, width, oldWidth, datagridApi: this } });
  }

  setColumnWidths(updates: { datagridColumn: IAcDatagridColumn; width: number }[]) {
    if (!updates || updates.length === 0) return;

    const validUpdates: { datagridColumn: IAcDatagridColumn; width: number; oldWidth: number }[] = [];
    const widthMap = new Map<string, number>();

    for (const u of updates) {
      if (!u.datagridColumn) continue;
      const w = Math.max(30, u.width);
      const oldWidth = u.datagridColumn.width;
      u.datagridColumn.width = w;
      validUpdates.push({ datagridColumn: u.datagridColumn, width: w, oldWidth });
      widthMap.set(u.datagridColumn.columnId, w);
    }

    if (validUpdates.length === 0) return;

    // 1. Update header cell DOM
    if (this.datagrid?.datagridHeader?.datagridHeaderCells) {
      for (const hCell of this.datagrid.datagridHeader.datagridHeaderCells) {
        if (hCell.datagridColumn && widthMap.has(hCell.datagridColumn.columnId)) {
          hCell.setCellWidth();
        }
      }
    }

    // 2. Update body cells DOM via direct cell iteration
    if (this.datagrid?.datagridBody?.currentRows) {
      for (const rowEl of this.datagrid.datagridBody.currentRows) {
        for (const cellEl of rowEl.datagridCells) {
          const colId = cellEl.datagridCell?.datagridColumn?.columnId;
          if (colId && widthMap.has(colId)) {
            cellEl.setCellWidth();
          }
        }
      }
    }

    // 3. Update pinned column offsets once
    if (this.datagridColumns.some(c => !!c.pinnedOn)) {
      this.updatePinnedOffsets();
      this.datagrid?.datagridHeader?.refresh();
    }

    this.datagrid?.datagridHeader?.syncScrollbarSpacer?.();

    for (const u of validUpdates) {
      this.hooks.execute({
        hook: AC_DATAGRID_HOOK.ColumnWidthChange,
        args: { datagridColumn: u.datagridColumn, width: u.width, oldWidth: u.oldWidth, datagridApi: this }
      });
    }
    this.notifyStateChange({ source: 'columnResize' });
  }

  recomputeColumnLayout() {
    if (!this.datagridColumns || this.datagridColumns.length === 0) return;
    const updates = AcDatagridColumnSizeHelper.calculateFlexAndFillWidths({
      datagridApi: this,
      fillAvailableWidth: this._fillAvailableWidth
    });
    if (updates.length > 0) {
      this.setColumnWidths(updates);
    }
  }

  sizeColumnsToFit(options?: IAcDatagridSizeColumnsToFitOptions) {
    if (!this.datagridColumns || this.datagridColumns.length === 0) return;
    const updates = AcDatagridColumnSizeHelper.calculateFlexAndFillWidths({
      datagridApi: this,
      fillAvailableWidth: true,
      options
    });
    if (updates.length > 0) {
      this.setColumnWidths(updates);
    }
  }

  get displayedDatagridRows(): IAcDatagridRow[] {
    if (this.hasTreeOrGroup && this.dataManager?.allRows && this.dataManager.allRows.length > 0) {
      // PERF FIX (1.2): cache sorted+filtered array; invalidated by _displayedRowsDirty flag
      if (this._displayedRowsDirty || !this._cachedDisplayedRows) {
        this._cachedDisplayedRows = (this.dataManager.allRows as IAcDatagridRow[])
          .filter(r => r && r.index !== -1)
          .sort((a, b) => a.index - b.index);
        this._displayedRowsDirty = false;
      }
      return this._cachedDisplayedRows;
    }
    if (this.useVirtualScrolling && this.dataManager) {
      return this.dataManager.rows as any[];
    }
    if (this.dataManager) {
      return this.dataManager.displayedRows as any[];
    }
    return [];
  }

  private _headerHeight: number = 40;
  get headerHeight(): number {
    return this._headerHeight;
  }
  set headerHeight(value: number) {
    if (value != this._headerHeight) {
      this._headerHeight = value;
      this.hooks.execute({ hook: AC_DATAGRID_HOOK.HeaderHeightChange, args: { rowHeight: this.rowHeight } });
      this.events.execute({ event: AC_DATAGRID_HOOK.HeaderHeightChange, args: { rowHeight: this.rowHeight } });
    }
  }

  private _rowHeight: number = 30;
  get rowHeight(): number {
    return this._rowHeight;
  }
  set rowHeight(value: number) {
    if (value != this._rowHeight) {
      this._rowHeight = value;
      this.updateRowHeightDOM();
      this.hooks.execute({ hook: AC_DATAGRID_HOOK.RowHeightChange, args: { rowHeight: this.rowHeight } });
      this.events.execute({ event: AC_DATAGRID_HOOK.RowHeightChange, args: { rowHeight: this.rowHeight } });
    }
  }

  updateRowHeightDOM() {
    if (this.datagrid?.datagridBody?.currentRows) {
      for (const rowEl of this.datagrid.datagridBody.currentRows) {
        (rowEl as any).applyRowHeight?.();
      }
    }
  }

  private _usePagination: boolean = true;
  get usePagination(): boolean {
    this.logger.log('Getting usePagination', { value: this._usePagination });
    return this._usePagination;
  }
  set usePagination(value: boolean) {
    this.logger.log('Setting usePagination', { oldValue: this._usePagination, newValue: value });
    const oldValue = this._usePagination;
    const hookArgs: IAcDatagridUsePaginationChangeHookArgs = {
      usePagination: value,
      datagridApi: this,
      oldUsePagination: this._usePagination
    };
    this._usePagination = value;
    if (oldValue != value) {
      this.hooks.execute({ hook: AC_DATAGRID_HOOK.UsePaginationChange, args: hookArgs });
    }
    if (this.datagrid && this.datagrid.datagridFooter) {
      this.datagrid.datagridFooter.setPagination();
    }
  }

  private _animateRows: boolean = true;
  get animateRows(): boolean {
    return this._animateRows;
  }
  set animateRows(value: boolean) {
    if (this._animateRows !== value) {
      this._animateRows = value;
      this.datagrid?.classList.toggle('ac-datagrid-animate-rows', value);
    }
  }

  private _useVirtualScrolling: boolean = false;
  get useVirtualScrolling(): boolean {
    return this._useVirtualScrolling;
  }
  set useVirtualScrolling(value: boolean) {
    if (this._useVirtualScrolling !== value) {
      this._useVirtualScrolling = value;
      this.datagrid?.classList.toggle('ac-datagrid-virtual-scroll', value);
      if (this.datagrid?.datagridBody) {
        this.datagrid.datagridBody.setDisplayedRows();
      }
    }
  }

  private _showAddButton: boolean = false;
  get showAddButton(): boolean {
    return this._showAddButton;
  }
  set showAddButton(value: boolean) {
    if (this._showAddButton != value) {
      this._showAddButton = value;
      this.pagination.showAddButton = value;
      this.hooks.execute({
        hook: AC_DATAGRID_HOOK.ShowAddButtonChange, args: {
          showAddButton: value,
          datagridApi: this
        }
      });
    }
  }

  private _showRowNumbers: boolean = true;
  get showRowNumbers(): boolean {
    return this._showRowNumbers;
  }
  set showRowNumbers(value: boolean) {
    if (this._showRowNumbers != value) {
      this._showRowNumbers = value;
      this.hooks.execute({
        hook: AC_DATAGRID_HOOK.ShowRowNumbersChange, args: {
          showRowNumbers: value,
          datagridApi: this
        }
      });
    }
  }

  private _showSearchInput: boolean = false;
  get showSearchInput(): boolean {
    return this._showSearchInput;
  }
  set showSearchInput(value: boolean) {
    if (this._showSearchInput != value) {
      this._showSearchInput = value;
      this.hooks.execute({
        hook: AC_DATAGRID_HOOK.ShowSearchInputChange, args: {
          showSearchInput: value,
          datagridApi: this
        }
      });
    }
  }

  activeDatagridRow: IAcDatagridRow | undefined;
  columnDragPlaceholderElementCreator: Function = (args: IAcDatagridColumnDragPlaceholderCreatorArgs): HTMLElement => {
    const element = document.createElement('span');
    element.innerHTML = args.datagridColumn.title;
    this.logger.log('Created column drag placeholder', { title: args.datagridColumn.title });
    return element;
  };
  rowDragPlaceholderElementCreator: Function = (args: IAcDatagridRowDragPlaceholderCreatorArgs): HTMLElement => {
    const element = document.createElement('span');
    element.innerHTML = args.datagridRow.rowId;
    this.logger.log('Created row drag placeholder', { rowId: args.datagridRow.rowId });
    return element;
  };
  activeDatagridCell?: IAcDatagridCell;
  dataTypeIdentified: boolean = false;
  datagrid!: AcDatagridElement;
  datagridColumns: IAcDatagridColumn[] = [];
  // PERF FIX (P3): O(1) column lookup maps — rebuilt in columnDefinitions setter
  private _columnByKey: Map<string, IAcDatagridColumn> = new Map();
  private _columnById: Map<string, IAcDatagridColumn> = new Map();
  // PERF FIX (1.2): Cache for tree/group displayedDatagridRows — avoids O(n log n) sort on every call
  private _cachedDisplayedRows: IAcDatagridRow[] | undefined;
  private _displayedRowsDirty = true;
  datagridState: AcDatagridState;
  dataManager: AcDataManager = new AcDataManager();
  defaultColumnDefiniation: Partial<IAcDatagridColumnDefinition> = { ...AC_DATAGRID_DEFAULT_COLUMN_DEFINITION };
  eventHandler!: AcDatagridEventHandler;
  events: AcEvents;
  extensions: Record<string, AcDatagridExtension> = {};
  hooks: AcHooks = new AcHooks();
  hoverCellId?: string;
  hoverColumnId?: string;
  hoverRowId?: string;
  lastColumnIndex: number = 0;
  logger: AcLogger = new AcLogger({ logMessages: false });
  pagination: AcPaginationElement = new AcPaginationElement();
  rowValueChangeTimeoutDuration = 250;

  // === New Capabilities State ===
  selectionMode: 'none' | 'single' | 'multiple' = 'multiple';
  allowSelection: boolean = false;
  allowMultipleSelection: boolean = true;
  selectOnRowClick: boolean = false;
  selectedRowIds: Set<string> = new Set<string>();
  lastSelectedRowIndex: number = -1;
  allowRowDragging: boolean = false;
  allowColumnResizing: boolean = true;
  allowColumnDragging: boolean = true;
  private _enterNavigatesVertically: boolean = false;
  get enterNavigatesVertically(): boolean {
    return this._enterNavigatesVertically;
  }
  set enterNavigatesVertically(value: boolean) {
    this._enterNavigatesVertically = value;
    this._enterNavigation = value;
  }

  private _enterNavigation: boolean = false;
  get enterNavigation(): boolean {
    return this._enterNavigation;
  }
  set enterNavigation(value: boolean) {
    this._enterNavigation = value;
    this._enterNavigatesVertically = value;
  }
  editMode: 'cell' | 'row' | 'none' = 'cell';
  activeEditRowId: string | null = null;
  groupBy: string[] = [];
  expandedRowIds: Set<string> = new Set<string>();
  expandedDetailRowIds: Set<string> = new Set<string>();
  loadingRowIds: Set<string> = new Set<string>();
  private _treeConfig?: { idKey: string; parentIdKey: string; childrenKey?: string; treeColumn?: string; treeLevelExpanded?: number };
  get treeConfig(): { idKey: string; parentIdKey: string; childrenKey?: string; treeColumn?: string; treeLevelExpanded?: number } | undefined {
    return this._treeConfig;
  }
  set treeConfig(value: { idKey: string; parentIdKey: string; childrenKey?: string; treeColumn?: string; treeLevelExpanded?: number } | undefined) {
    this._treeConfig = value;
    if (this.dataManager?.allRows && this.dataManager.allRows.length > 0) {
      this.initTreeRows();
      this.hooks.execute({ hook: AC_DATAGRID_HOOK.DisplayedRowsChange, args: { datagridApi: this, displayedRows: this.displayedDatagridRows } });
    }
  }
  private _masterDetailConfig?: { detailTemplate: (row: IAcDatagridRow) => HTMLElement | string };
  get masterDetailConfig(): { detailTemplate: (row: IAcDatagridRow) => HTMLElement | string } | undefined {
    return this._masterDetailConfig;
  }
  set masterDetailConfig(value: { detailTemplate: (row: IAcDatagridRow) => HTMLElement | string } | undefined) {
    this._masterDetailConfig = value;
    if (this.datagrid?.datagridHeader?.internalHeaderCell) {
      this.datagrid.datagridHeader.internalHeaderCell.applyStyles();
    }
    this.refreshInternalCells();
  }
  onDemandTreeFunction?: (args: { parentRow: IAcDatagridRow, successCallback: (children: any[]) => void, errorCallback: (err: any) => void }) => void;
  onDemandGroupFunction?: (args: { groupBy: string[], successCallback: (groups: any[]) => void, errorCallback: (err: any) => void }) => void;
  onDemandGroupExpandFunction?: (args: { groupRow: IAcDatagridRow, groupField?: string, groupValue?: any, successCallback: (children: any[]) => void, errorCallback: (err: any) => void }) => void;
  pinnedTopRowIds: string[] = [];
  pinnedBottomRowIds: string[] = [];
  sidePanelOpen: boolean = false;
  lastActiveRowIndex?: number;
  lastActiveColumnIndex?: number;
  private _stateChangeTimer: any;
  private _previousNotifiedStateJson: string = "";

  constructor({ datagrid }: { datagrid: AcDatagridElement }) {
    this.datagrid = datagrid;
    this.dataManager.logger = this.logger;
    this.events = datagrid.events;
    this.dataManager.events = this.events;
    this.dataManager.hooks.subscribeAllHooks({
      callback: (hook: string, args: any) => {
        if (hook.toLowerCase() !== AC_DATA_MANAGER_HOOK.DisplayedRowsChange.toLowerCase()) {
          this.hooks.execute({ hook, args });
        }
      }
    });
    // PERF FIX (1.2): Invalidate displayedDatagridRows cache on every DisplayedRowsChange
    this.hooks.subscribe({
      hook: AC_DATAGRID_HOOK.DisplayedRowsChange,
      callback: () => {
        this._displayedRowsDirty = true;
        this._cachedDisplayedRows = undefined;
      }
    });
    this.dataManager.on({
      event: AC_DATA_MANAGER_EVENT.DisplayedRowsChange,
      callback: () => {
        if (this.hasTreeOrGroup) {
          this.processTreeVisibility();
        }
        this._displayedRowsDirty = true;
        this._cachedDisplayedRows = undefined;
        this.hooks.execute({ hook: AC_DATAGRID_HOOK.DisplayedRowsChange, args: { datagridApi: this, displayedRows: this.displayedDatagridRows } });
      }
    });
    this.dataManager.hooks.subscribe({
      hook: AC_DATA_MANAGER_HOOK.GetOnDemandDataSuccessCallback,
      callback: () => {
        this.syncRowProperties();
        if (this.treeConfig) {
          this.initTreeRows();
        }
        if (this.hasTreeOrGroup) {
          this.processTreeVisibility();
          this.hooks.execute({ hook: AC_DATAGRID_HOOK.DisplayedRowsChange, args: { datagridApi: this, displayedRows: this.displayedDatagridRows } });
        }
      }
    });
    this.events.on({
      event: 'beforeexecute', callback: ({ event, args }: { event: string, args: any }) => {
        if (args['dataRow'] != undefined) {
          args['datagridRow'] = args['dataRow'];
        }
        args['datagridApi'] = this;
      }
    });
    this.hooks.on({
      event: 'beforeexecute', callback: ({ hook, args }: { hook: string, args: any }) => {
        if (args['dataRow'] != undefined) {
          args['datagridRow'] = args['dataRow'];
        }
        args['datagridApi'] = this;
      }
    });
    this.dataManager.on({
      event: AC_DATA_MANAGER_EVENT.DataFoundForFirstTime, callback: (args: IAcDataManagerDataEvent) => {
        const data: any = args.data;
        const pendingColumnTypes: any[] = [];
        for (const datagridColumn of this.datagridColumns) {
          const column = datagridColumn.columnDefinition;
          if (column.dataType == AcEnumDatagridColumnDataType.Unknown) {
            pendingColumnTypes.push(column.field);
            let typeSet = false;
            let inferredType: "BOOLEAN" | "CUSTOM" | "DATE" | "DATETIME" | "NUMBER" | "OBJECT" | "STRING" | "UNKNOWN" = "UNKNOWN";
            for (const row of data) {
              const value = row[column.field];
              if (value !== undefined && value !== null) {
                switch (typeof value) {
                  case 'boolean':
                    inferredType = 'BOOLEAN';
                    break;
                  case 'number':
                  case 'bigint':
                    inferredType = 'NUMBER';
                    break;
                  case 'string':
                    inferredType = 'STRING';
                    const trimmedValue = value.trim();
                    if (trimmedValue === '') {
                      inferredType = 'STRING';
                    } else {
                      if (isValidDateString(trimmedValue)) {
                        inferredType = 'DATE';
                      }
                      else if (isValidDateTimeString(trimmedValue)) {
                        inferredType = 'DATETIME';
                      }
                    }
                    break;
                  case 'object':
                    if (Array.isArray(value)) {
                      inferredType = 'OBJECT';
                    } else {
                      inferredType = 'OBJECT';
                    }
                    break;
                  default:
                    inferredType = 'UNKNOWN';
                    break;
                }
                if (inferredType !== 'UNKNOWN') {
                  column.dataType = inferredType;
                  typeSet = true;
                  break;
                }
              }
            }
            if (!typeSet) {
              column.dataType = 'UNKNOWN';
            }
          }
          datagridColumn.dataType = (column.dataType as any);
        }
      }
    });
    this.dataManager.on({
      event: AC_DATA_MANAGER_EVENT.DataRowInstanceCreate, callback: ({ dataRow }: { dataRow: IAcDatagridRow }) => {
        // dataRow.datagridApi = this;
        // this.logger.log('Assigned datagridApi to dataRow', { rowId: dataRow.rowId });
      }
    });
    this.dataManager.on({
      event: AC_DATA_MANAGER_EVENT.TotalRowsChange, callback: (args: any) => {
        if (!this.usePagination) {
          //
        }
      }
    });
    this.datagridState = new AcDatagridState({ datagridApi: this });
    this.eventHandler = new AcDatagridEventHandler();
    this.eventHandler.init({ datagridApi: this });
    this.pagination.bindDataManager({ dataManager: this.dataManager });
      this.pagination.showAddButton = this.showAddButton;
      this.pagination.addEventListener('add', () => {
        this.dataManager.addRow();
      });
        this.pagination.events.subscribe({
      event: 'pageChange', callback: () => this.notifyStateChange({ source: 'pagination' })
    });
    this.pagination.events.subscribe({
      event: 'pageSizeChange', callback: () => this.notifyStateChange({ source: 'pagination' })
    });
    if (this.dataManager.sortOrder) {
      this.dataManager.sortOrder.events.subscribe({
        event: 'change', callback: () => this.notifyStateChange({ source: 'sort' })
      });
    }
    if (this.dataManager.filterGroup) {
      this.dataManager.filterGroup.events.subscribe({
        event: 'change', callback: () => this.notifyStateChange({ source: 'filter' })
      });
    }
    AcDatagridExtensionManager.registerBuiltInExtensions();
  }

  addRow({ data, append = true, highlightCells = false, rowId, index }: { data?: any, append?: boolean, highlightCells?: boolean, rowId?: string, index?: number } = {}): IAcDatagridRow {
    if (index === undefined) {
      index = append ? this.dataManager.totalRows : 0;
    }
    const beforeRowCreateArgs: any = { datagridApi: this, data, rowId, index };
    this.hooks.execute({ hook: AC_DATAGRID_HOOK.BeforeDatagridRowCreate, args: beforeRowCreateArgs });
    if (beforeRowCreateArgs.rowId) {
      return this.dataManager.updateRow({ data, rowId: beforeRowCreateArgs.rowId }) as IAcDatagridRow;
    }
    else {
      const datagridRow = this.dataManager.addRow({ data, index }) as IAcDatagridRow;
      const hookArgs: IAcDatagridRowHookArgs = {
        datagridApi: this,
        datagridRow: datagridRow,
        highlightCells: highlightCells
      };
      this.hooks.execute({ hook: AC_DATAGRID_HOOK.DatagridRowCreate, args: hookArgs });
      return datagridRow;
    }
  }

  applyFilter({ search }: { search?: string }) {
    this.logger.log('Applying filter', { search });
    this.hooks.execute({ hook: AC_DATAGRID_HOOK.ApplyFilter, args: { search } });
    this.logger.log('Executed ApplyFilter hook');
  }

  autoResizeColumn({
    datagridColumn,
    skipHeader,
    additionalPadding
  }: {
    datagridColumn: IAcDatagridColumn | string;
    skipHeader?: boolean;
    additionalPadding?: number;
  }) {
    // PERF FIX (1.3): O(1) Map lookup instead of O(n) .find()
    const col: IAcDatagridColumn | undefined = typeof datagridColumn === 'string'
      ? (this._columnByKey.get(datagridColumn) ?? this._columnById.get(datagridColumn) ?? this.datagridColumns.find(c => c.columnDefinition.field === datagridColumn))
      : datagridColumn;
    if (!col) return;

    this.logger.log('Auto-resizing column', { field: col.columnDefinition.field });
    const calculatedWidth = AcDatagridColumnSizeHelper.calculateColumnAutoWidth({
      datagridColumn: col,
      datagridApi: this,
      skipHeader,
      additionalPadding
    });

    this.setColumnWidth({ datagridColumn: col, width: calculatedWidth });
    this.events.execute({
      event: AC_DATAGRID_EVENT.ColumnResize,
      args: {
        column: col,
        width: calculatedWidth,
        datagridApi: this
      }
    });
    this.notifyStateChange({ source: 'columnResize' });
    this.recomputeColumnLayout();
  }

  autoSizeColumns(options?: IAcDatagridAutoSizeColumnsOptions | string[]) {
    const opts: IAcDatagridAutoSizeColumnsOptions = Array.isArray(options) ? { columnKeys: options } : (options || {});
    const keys = opts.columnKeys;
    // PERF FIX (5.3): O(1) Map lookup for key-based column resolution
    const targets = keys && keys.length > 0
      ? (keys.map(k => this._columnByKey.get(k) ?? this._columnById.get(k) ?? this.datagridColumns.find(c => c.columnDefinition.field === k)).filter(Boolean) as IAcDatagridColumn[])
      : this.datagridColumns.filter(c => c.visible);

    const updates: { datagridColumn: IAcDatagridColumn; width: number }[] = [];
    for (const col of targets) {
      const width = AcDatagridColumnSizeHelper.calculateColumnAutoWidth({
        datagridColumn: col,
        datagridApi: this,
        skipHeader: opts.skipHeader,
        additionalPadding: opts.additionalPadding,
        maxSampleRows: opts.maxSampleRows
      });
      if (Math.abs(width - col.width) >= 1) {
        updates.push({ datagridColumn: col, width });
      }
    }

    if (updates.length > 0) {
      this.setColumnWidths(updates);
      for (const u of updates) {
        this.events.execute({
          event: AC_DATAGRID_EVENT.ColumnResize,
          args: {
            column: u.datagridColumn,
            width: u.width,
            datagridApi: this
          }
        });
      }
      this.recomputeColumnLayout();
    }
  }

  autoSizeAllColumns(options?: { skipHeader?: boolean; additionalPadding?: number; maxSampleRows?: number }) {
    this.autoSizeColumns({
      skipHeader: options?.skipHeader,
      additionalPadding: options?.additionalPadding,
      maxSampleRows: options?.maxSampleRows
    });
  }

  handleAutoWidthColumns() {
    const autoCols = this.datagridColumns.filter(c => c.visible && (c.autoWidth || c.columnDefinition.autoWidth));
    if (autoCols.length === 0) return;
    this.autoSizeColumns({ columnKeys: autoCols.map(c => c.columnKey) });
  }


  deleteRow({ data, rowId, key, value, highlightCells = false }: { data?: any, rowId?: string, key?: string, value?: any, highlightCells?: boolean }) {
    this.logger.log('Deleting row', { rowId, key, value: value ? '[provided]' : 'undefined', highlightCells });
    const targetRow = this.getRow({ data, rowId, key, value });
    const body = this.datagrid?.datagridBody as any;
    const resolvedRowId = rowId || targetRow?.rowId;
    const rowEl = targetRow?.element ||
      (resolvedRowId ? body?.renderedRowsMap?.get(resolvedRowId) : undefined) ||
      (resolvedRowId ? body?.currentRows?.find((r: any) => r.datagridRow?.rowId === resolvedRowId) : undefined);

    if (rowEl && this.animateRows) {
      rowEl.classList.add('ac-datagrid-row-removing');
    }

    const datagridRow: IAcDatagridRow | undefined = this.dataManager.deleteRow({ data, rowId: resolvedRowId, key, value }) as IAcDatagridRow;
    const rowToDelete = targetRow || datagridRow;

    if (rowToDelete) {
      this.logger.log('Row deleted from dataManager', { rowId: rowToDelete.rowId });
      if (this.hasTreeOrGroup) {
        this.processTreeVisibility();
      }
      if (this.animateRows && body?.deleteRowAnimated) {
        body.deleteRowAnimated({ datagridRow: rowToDelete, rowElement: rowEl });
      } else {
        if (body) {
          if (rowEl) {
            rowEl.remove();
            rowEl.destroy?.();
            this.logger.log('Removed row element from DOM');
          }
          if (rowToDelete.rowId) {
            body.renderedRowsMap?.delete(rowToDelete.rowId);
          }
          body.currentRows = body.currentRows.filter(
            (r: any) => r !== rowEl && (!rowToDelete.rowId || r.datagridRow?.rowId !== rowToDelete.rowId)
          );
          body.resequenceRows?.();
        }
      }
    } else {
      this.logger.log('No row found to delete');
    }
  }

  destroy() {
    for (const ext of Object.values(this.extensions)) {
      ext.destroy();
    }

    this.datagridState.destroy();

    this.eventHandler.destroy();

    this.dataManager.destroy();

    this.events.destroy();

    this.hooks.destroy();

    acNullifyInstanceProperties({ instance: this });
  }

  enableExtension({ extensionName }: { extensionName: string }): AcDatagridExtension | null {
    this.logger.log('Enabling extension', { extensionName });
    if (this.extensions[extensionName]) {
      this.logger.log('Extension already enabled, returning existing instance', { extensionName });
      return this.extensions[extensionName];
    }
    if (AcDatagridExtensionManager.hasExtension({ extensionName: extensionName })) {
      this.logger.log('Extension found, creating instance');
      const extensionInstance = AcDatagridExtensionManager.createInstance({ extensionName: extensionName });
      if (extensionInstance) {
        extensionInstance.datagridApi = this;
        const hookId: string = this.hooks.subscribeAllHooks({
          callback: (hook: string, args: any) => {
            extensionInstance.handleHook({ hook: hook, args: args });
          }
        });
        extensionInstance.hookId = hookId;
        this.logger.log('Subscribed hooks to extension', { hookId, extensionName });
        extensionInstance.init();
        this.logger.log('Initialized extension');
        this.extensions[extensionName] = extensionInstance;
        const hookArgs: IAcDatagridExtensionEnabledHookArgs = {
          extensionName: extensionName,
          datagridApi: this,
        };
        this.hooks.execute({ hook: AC_DATAGRID_HOOK.ExtensionEnable, args: hookArgs });
        this.logger.log('Executed ExtensionEnable hook');
        return extensionInstance;
      } else {
        this.logger.log('Failed to create extension instance');
      }
    } else {
      this.logger.log('Extension not found');
    }
    return null;
  }

  ensureRowVisible({ rowId, index, key, value }: { rowId?: string, index?: number, key?: string, value?: any }) {
    const datagridRow = this.getRow({ rowId, index, key, value });
    if (datagridRow) {
      const args: any = {
        datagridRow,
        datagridApi: this
      };
      this.hooks.execute({ hook: AC_DATAGRID_EVENT.EnsureRowVisible, args: args });
      this.events.execute({ event: AC_DATAGRID_EVENT.EnsureRowVisible, args: args });
    }
  }

  focusFirstRow({ highlightCells }: { highlightCells?: boolean } = {}) {
    this.logger.log('Focusing first row', { highlightCells });
    this.focusRow({ index: 0, highlightCells: highlightCells });
  }

  focusLastRow({ highlightCells }: { highlightCells?: boolean } = {}) {
    this.logger.log('Focusing last row', { highlightCells, totalRows: this.dataManager.totalRows });
    this.focusRow({ index: this.dataManager.totalRows - 1, highlightCells: highlightCells });
  }

  focusRow({ index, highlightCells = false }: { index: number, highlightCells?: boolean }) {
    this.logger.log('Focusing row', { index, highlightCells });
    const datagridRow = this.datagridRows[index];
    if (datagridRow) {
      const hookArgs: IAcDatagridRowFocusHookArgs = {
        datagridApi: this,
        datagridRow: datagridRow,
        index: index,
        highlightCells: highlightCells
      }
      this.hooks.execute({ hook: AC_DATAGRID_HOOK.RowFocus, args: hookArgs });
      this.logger.log('Executed RowFocus hook', { rowId: datagridRow.rowId });
    } else {
      this.logger.log('Row not found for focus', { index });
    }
  }

  getColumn({ columnId, index, originalIndex, key }: { key?: string, columnId?: string, index?: number, originalIndex?: number }): IAcDatagridColumn | undefined {
    // PERF FIX (P3): Use O(1) map lookups for key/columnId; fall back to linear scan for index/originalIndex
    if (key != undefined) return this._columnByKey.get(key);
    if (columnId != undefined) return this._columnById.get(columnId);
    // index/originalIndex lookups are less frequent — linear scan is acceptable
    for (const column of this.datagridColumns) {
      if (index != undefined && column.index == index) return column;
      if (originalIndex != undefined && column.originalIndex == originalIndex) return column;
    }
    return undefined;
  }

  getCell({ rowIndex, columnIndex, rowId, columnId, row, column, createIfMissing = true, key, value }: { row?: IAcDatagridRow, column?: IAcDatagridColumn, rowIndex?: number, columnIndex?: number, rowId?: string, columnId?: string, createIfMissing?: boolean, key?: string, value?: any }): IAcDatagridCell | undefined {
    let result: IAcDatagridCell | undefined;
    if (!row) {
      row = this.getRow({ rowId, index: rowIndex, key, value });
    }
    if (row) {
      if (!column) {
        column = this.getColumn({ index: columnIndex, columnId, key });
      }
      if (column) {
        if (row.datagridCells == undefined) {
          row.datagridCells = [];
        }
        for (const cell of row.datagridCells) {
          if (cell.datagridColumn == column) {
            result = cell;
            break;
          }
        }
        if (result == undefined && createIfMissing) {
          const cell: IAcDatagridCell = {
            datagridColumn: column,
            datagridRow: row,
            cellId: Autocode.uuid(),
          };
          row.datagridCells.push(cell);
          result = cell;
        }
      }
    }
    return result;
  }

  getRow({ data, rowId, index, key, value }: { data?: any, rowId?: string, index?: number, key?: string, value?: any }): IAcDatagridRow | undefined {
    if (rowId != undefined) {
      const cached = this.dataManager?.getRowById?.(rowId) as IAcDatagridRow | undefined;
      if (cached && cached.rowId === rowId) return cached;
    }
    const sourceRows = (this.dataManager?.allRows && this.dataManager.allRows.length > 0)
      ? (this.dataManager.allRows as IAcDatagridRow[])
      : this.datagridRows;
    for (const row of sourceRows) {
      if (!row) continue;
      if (rowId != undefined && row.rowId == rowId) return row as IAcDatagridRow;
      if (data != undefined && row.data === data) return row as IAcDatagridRow;
      if (index != undefined && row.index == index) return row as IAcDatagridRow;
      if (key != undefined && value != undefined && row.data && row.data[key] == value) return row as IAcDatagridRow;
    }
    return undefined;
  }

  getState(): IAcDatagridState {
    this.logger.log('Getting datagrid state');
    this.datagridState.refreshSync();
    this.logger.log('Refreshed datagrid state');
    const state = this.datagridState.toJson();
    this.logger.log('Retrieved state', { keys: Object.keys(state) });
    return state;
  }

  init() {
    //
  }

  off({ event, callback, subscriptionId }: { event?: string, callback?: Function, subscriptionId?: string }): boolean {
    return this.events.unsubscribe({ event, callback, subscriptionId });
  }

  on({ event, callback }: { event: string, callback: Function }): string {
    const subscriptionId = this.events.subscribe({ event: event, callback: callback });
    return subscriptionId;
  }

  refreshRows(): void {
    this.logger.log('Refreshing rows');
    this.hooks.execute({ hook: AC_DATAGRID_HOOK.RefreshRows, args: {} });
    this.logger.log('Executed RefreshRows hook');
  }

  setColumnFilter({ datagridColumn, filter, filterGroup }: { datagridColumn: IAcDatagridColumn, filter?: IAcFilter, filterGroup?: IAcFilterGroup }) {
    if (this.activeEditRowId) {
      this.cancelRowEdit();
    }
    this.activeDatagridCell = undefined;
    this.hoverRowId = undefined;
    this.hoverCellId = undefined;

    this.logger.log('Setting column filter', { field: datagridColumn.columnDefinition.field, filter: filter });
    const oldFilterGroup: IAcFilterGroup | undefined = datagridColumn.filterGroup;
    if (datagridColumn.filterGroup == undefined) {
      datagridColumn.filterGroup = {
        operator: AcEnumLogicalOperator.And
      };
    }
    if (filterGroup) {
      if (datagridColumn.filterGroup!.filterGroups == undefined) {
        datagridColumn.filterGroup.filterGroups = [];
      }
      datagridColumn.filterGroup!.filterGroups?.push(filterGroup);
    }
    if (filter) {
      if (datagridColumn.filterGroup!.filters == undefined) {
        datagridColumn.filterGroup.filters = [];
      }
      datagridColumn.filterGroup!.filters?.push(filter);
    }
    this.logger.log('Added filter to column filterGroup');
    const eventArgs: IAcDatagridColumnFilterChangeEvent = {
      datagridColumn: datagridColumn,
      oldFilterGroup: oldFilterGroup,
      filterGroup: datagridColumn.filterGroup!,
      datagridApi: this
    };
    this.hooks.execute({ hook: AC_DATAGRID_HOOK.ColumnFilterChange, args: eventArgs });
    this.logger.log('Executed ColumnFilterChange hook (datagrid level)');
    // datagridColumn.hooks.execute({ hook: AC_DATAGRID_HOOK.ColumnFilterChange, args: eventArgs });
    this.logger.log('Executed ColumnFilterChange hook (column level)');
    this.events.execute({ event: AC_DATAGRID_EVENT.ColumnFilterChange, args: eventArgs });
    this.logger.log('Executed ColumnFilterChange event');
  }

  setColumnSortOrder({ datagridColumn, sortOrder }: { datagridColumn: IAcDatagridColumn, sortOrder: AcEnumSortOrder }) {
    if (this.activeEditRowId) {
      this.cancelRowEdit();
    }
    this.activeDatagridCell = undefined;
    this.hoverRowId = undefined;
    this.hoverCellId = undefined;

    this.logger.log('Setting column sort order', { field: datagridColumn.columnDefinition.field, oldOrder: datagridColumn.sortOrder, newOrder: sortOrder });
    const oldSortOrder: AcEnumSortOrder = datagridColumn.sortOrder!;
    datagridColumn.sortOrder = sortOrder;
    if (sortOrder != AcEnumSortOrder.None) {
      this.dataManager.sortOrder.addSort({ key: datagridColumn.columnDefinition.field, order: sortOrder });
      this.logger.log('Added sort to dataManager');
    }
    else {
      this.dataManager.sortOrder.removeSort({ key: datagridColumn.columnDefinition.field });
      this.logger.log('Removed sort from dataManager');
    }
    const eventArgs: IAcDatagridColumnSortChangeEvent = {
      datagridColumn: datagridColumn,
      oldSortOrder: oldSortOrder,
      sortOrder: datagridColumn.sortOrder,
      datagridApi: this
    };
    this.hooks.execute({ hook: AC_DATAGRID_HOOK.ColumnSortChange, args: eventArgs });
    this.logger.log('Executed ColumnSortChange hook (datagrid level)');
    // datagridColumn.hooks.execute({ hook: AC_DATAGRID_HOOK.ColumnSortChange, args: eventArgs });
    this.logger.log('Executed ColumnSortChange hook (column level)');
    this.events.execute({ event: AC_DATAGRID_EVENT.ColumnSortChange, args: eventArgs });
    this.logger.log('Executed ColumnSortChange event');
    this.dataManager.processRows();
    this.logger.log('Processed rows after sort change');
  }

  setDataSourceType({ dataSourceType }: { dataSourceType: AcEnumDataSourceType }) {
    this.logger.log('Setting data source type', { dataSourceType });
    // PENDING - implementation to be added
    this.logger.log('Data source type set (pending implementation)');
  }

  setActiveCell({ rowIndex, columnIndex, datagridCell, key, value }: { rowIndex?: number, columnIndex?: number, datagridCell?: IAcDatagridCell, key?: string, value?: any }) {
    if (!datagridCell) {
      datagridCell = this.getCell({ rowIndex, columnIndex, key, value });
    }
    if (datagridCell && (this.activeDatagridCell == undefined || this.activeDatagridCell.cellId != datagridCell.cellId)) {
      let previousActiveCell: IAcDatagridCell | undefined;
      let previousActiveColumn: IAcDatagridColumn | undefined;
      let previousActiveRow: IAcDatagridRow | undefined;
      if (this.activeDatagridCell && this.activeDatagridCell != datagridCell) {
        previousActiveCell = this.activeDatagridCell;
        previousActiveColumn = this.activeDatagridCell.datagridColumn;
        previousActiveRow = this.activeDatagridCell.datagridRow;
        if (this.activeDatagridCell.element) {
          if (this.activeDatagridCell.element.isEditing) {
            this.activeDatagridCell.element.exitEditMode();
            this.logger.log('Exited edit mode for previous active cell');
          }
        }
        this.activeDatagridCell.isActive = false;
        this.logger.log('Deactivated previous active cell');
      }
      datagridCell.isActive = true;
      this.activeDatagridCell = datagridCell;
      if (datagridCell.datagridRow?.index !== undefined && datagridCell.datagridRow.index >= 0) {
        this.lastActiveRowIndex = datagridCell.datagridRow.index;
      }
      if (datagridCell.datagridColumn?.index !== undefined && datagridCell.datagridColumn.index >= 0) {
        this.lastActiveColumnIndex = datagridCell.datagridColumn.index;
      }
      if ((previousActiveCell && previousActiveCell.cellId != datagridCell.cellId) || previousActiveCell == undefined) {
        const args: any = {
          oldActiveDatagridCell: previousActiveCell,
          activeDatagridRow: datagridCell,
          datagridApi: this
        };
        this.hooks.execute({ hook: AC_DATAGRID_EVENT.ActiveCellChange, args: args });
        this.events.execute({ event: AC_DATAGRID_EVENT.ActiveCellChange, args: args });
      }
      if ((previousActiveRow && previousActiveRow.rowId != datagridCell.datagridRow.rowId) || previousActiveRow == undefined) {
        const activeEventParams: IAcDatagridActiveRowChangeEvent = {
          oldActiveDatagridRow: previousActiveRow,
          activeDatagridRow: datagridCell.datagridRow,
          datagridApi: this
        };
        this.activeDatagridRow = datagridCell.datagridRow;
        this.hooks.execute({ hook: AC_DATAGRID_EVENT.ActiveRowChange, args: activeEventParams });
        this.events.execute({ event: AC_DATAGRID_EVENT.ActiveRowChange, args: activeEventParams });
      }
      if ((previousActiveColumn && previousActiveColumn.columnId != datagridCell.datagridColumn.columnId) || previousActiveColumn == undefined) {
        const args: any = {
          oldActiveDatagridColumn: previousActiveColumn,
          activeDatagridColumn: datagridCell.datagridColumn,
          datagridApi: this
        };
        this.hooks.execute({ hook: AC_DATAGRID_EVENT.ActiveColumnChange, args: args });
        this.events.execute({ event: AC_DATAGRID_EVENT.ActiveColumnChange, args: args });
      }
      if (datagridCell.element) {
        datagridCell.element.focus();
        this.logger.log('Focused active cell element');
      }
      this.logger.log('Set new active cell', { cellId: datagridCell.cellId });
    } else {
      this.logger.log('No valid datagridCell to activate');
    }
    return datagridCell;
  }

  setState(arg: { state: IAcDatagridState } | IAcDatagridState) {
    const state: IAcDatagridState = (arg && (arg as any).state !== undefined) ? (arg as any).state : (arg as IAcDatagridState);
    this.applyState(state);
  }

  updateColumnPosition({ datagidColumn, oldDatagridColumn }: { datagidColumn: IAcDatagridColumn, oldDatagridColumn: IAcDatagridColumn }) {
    this.logger.log('Updating column position', { oldIndex: oldDatagridColumn.index, newIndex: datagidColumn.index });
    const eventArgs: IAcDatagridColumnPositionChangeEvent = {
      oldDatagridColumn: oldDatagridColumn,
      datagridColumn: datagidColumn,
      datagridApi: this
    };
    this.events.execute({ event: AC_DATAGRID_EVENT.ColumnPositionChange, args: eventArgs });
    this.logger.log('Executed ColumnPositionChange event');
  }

  updateRowPosition({ datagridRow, oldDatagridRow }: { datagridRow: IAcDatagridRow, oldDatagridRow: IAcDatagridRow }) {
    this.logger.log('Updating row position', { oldIndex: oldDatagridRow.index, newIndex: datagridRow.index });
    const eventArgs: IAcDatagridRowPositionChangeEvent = {
      oldDatagridRow: oldDatagridRow,
      datagridRow: datagridRow,
      datagridApi: this
    };
    this.events.execute({ event: AC_DATAGRID_EVENT.RowPositionChange, args: eventArgs });
    this.logger.log('Executed RowPositionChange event');
  }

  updateRow({ data, value, key, rowId, highlightCells = true, addIfMissing = false }: { data: any, value?: any, key?: string, rowId?: string, highlightCells?: boolean, addIfMissing?: boolean }): IAcDatagridRow | undefined {
    this.logger.log('Updating row', { rowId, key, addIfMissing, highlightCells, dataProvided: !!data, valueProvided: !!value });
    const datagridRow: IAcDatagridRow | undefined = this.dataManager.updateRow({ data, value, key, rowId, addIfMissing }) as IAcDatagridRow;
    if (datagridRow) {
      const rowEl: any = (datagridRow.element as any) ?? this.datagrid?.datagridBody?.currentRows?.find(r => r.datagridRow?.rowId === datagridRow.rowId);
      if (rowEl && typeof rowEl.refresh === 'function') {
        rowEl.refresh();
      } else if (datagridRow.datagridCells) {
        for (const cell of datagridRow.datagridCells) {
          if (cell.element && typeof cell.element.refresh === 'function') {
            cell.element.refresh();
          }
          this.logger.log('Refreshed cell', { cellId: cell.cellId });
        }
      }
      if (highlightCells) {
        // Flash the entire updated row
        this.flashCells({ rowIds: [datagridRow.rowId], color: 'green' });
      }
      this.logger.log('Row update complete');
    } else {
      this.logger.log('No row updated (possibly not found or addIfMissing false)');
    }
    return datagridRow;
  }

  /**
   * Visually flash one or more cells with a colour-pulse animation.
   * @param rowIds - optional list of rowIds to restrict flashing; if omitted, flashes all rows
   * @param columnKeys - optional list of column keys to restrict flashing; if omitted, flashes all columns
   * @param color - 'green' (default), 'red', or 'blue'
   * @param duration - animation duration in milliseconds (default 800)
   */
  flashCells({
    rowIds,
    columnKeys,
    color = 'green',
    duration = 800
  }: {
    rowIds?: string[];
    columnKeys?: string[];
    color?: 'green' | 'red' | 'blue';
    duration?: number;
  } = {}) {
    const flashClass = `ac-cell-flash-${color}`;
    const rows = this.datagrid?.datagridBody?.currentRows ?? [];
    for (const rowEl of rows) {
      const rowRow = (rowEl as any).datagridRow;
      if (rowIds && rowIds.length > 0 && rowRow && !rowIds.includes(rowRow.rowId)) {
        continue;
      }
      const cells = (rowEl as any).datagridCells ?? [];
      for (const cellEl of cells) {
        const cellColKey = cellEl?.datagridCell?.datagridColumn?.columnKey;
        if (columnKeys && columnKeys.length > 0 && cellColKey && !columnKeys.includes(cellColKey)) {
          continue;
        }
        const el: HTMLElement | undefined = cellEl?.element ?? cellEl;
        if (!el || typeof el.classList === 'undefined') continue;
        el.classList.remove(flashClass);
        // Force reflow to restart animation if already running
        void (el as HTMLElement).offsetWidth;
        el.classList.add(flashClass);
        setTimeout(() => {
          el.classList.remove(flashClass);
        }, duration);
      }
    }
  }

  getPinnedLeftOffset(datagridColumn: IAcDatagridColumn): number {
    let offset = this.getInternalColumnWidth();
    const columns = this.datagridColumns
      .filter(c => c.visible && c.pinnedOn === 'LEFT')
      .sort((a, b) => a.index - b.index);

    for (const col of columns) {
      if (col.columnId === datagridColumn.columnId) break;
      offset += col.width;
    }
    return offset;
  }

  getPinnedRightOffset(datagridColumn: IAcDatagridColumn): number {
    let offset = 0;
    const columns = this.datagridColumns
      .filter(c => c.visible && c.pinnedOn === 'RIGHT')
      .sort((a, b) => b.index - a.index); // Reversed for right-side pinning

    for (const col of columns) {
      if (col.columnId === datagridColumn.columnId) break;
      offset += col.width;
    }
    return offset;
  }

  openColumnCustomizer() {
    this.toggleSidePanel(true);
  }

  private _customInternalColumnWidth?: number;

  get internalColumnWidth(): number {
    return this.getInternalColumnWidth();
  }
  set internalColumnWidth(value: number) {
    this.setInternalColumnWidth(value);
  }

  setInternalColumnWidth(width: number) {
    this._customInternalColumnWidth = Math.max(30, width);
    this.updateInternalColumnDOM();
    this.notifyStateChange({ source: 'internalColumnResize', payload: { width: this._customInternalColumnWidth } });
  }

  resetInternalColumnWidth() {
    this._customInternalColumnWidth = undefined;
    this.updateInternalColumnDOM();
    this.notifyStateChange({ source: 'internalColumnReset' });
  }

  updateInternalColumnDOM() {
    this.datagrid?.datagridHeader?.internalHeaderCell?.applyStyles();
    if (this.datagrid?.datagridBody?.currentRows) {
      for (const rowEl of this.datagrid.datagridBody.currentRows) {
        (rowEl as any).internalCell?.applyStyles();
      }
    }
    this.updatePinnedOffsets();
    this.datagrid?.datagridHeader?.syncScrollbarSpacer?.();
  }

  getInternalColumnWidth(): number {
    let width = 0;
    if (this.allowRowDragging) width += 22;
    if (this.allowSelection) width += 24;
    if (this.showRowNumbers) width += 34;
    if (this.hasTreeOrGroup) width += 22;
    if (this.hasMasterDetail) width += 22;
    if (width <= 0) return 0;
    if (this._customInternalColumnWidth !== undefined) {
      return this._customInternalColumnWidth;
    }
    return Math.max(width + 8, 36);
  }

  get hasTreeOrGroup(): boolean {
    return (this.groupBy && this.groupBy.length > 0) || !!this.treeConfig || !!this.onDemandGroupExpandFunction || this.datagridRows.some((r: any) => r.hasChildren || r.isGroupHeader) || ((this.dataManager?.allRows as any[]) || []).some((r: any) => r && (r.hasChildren || r.isGroupHeader || r.data?.isGroupHeader || r.data?.hasChildren));
  }

  get hasMasterDetail(): boolean {
    return !!this.masterDetailConfig || this.datagridRows.some((r: any) => r.isMasterDetail);
  }

  notifyStateChange(info?: { source?: string, payload?: any }) {
    if (this._stateChangeTimer) {
      clearTimeout(this._stateChangeTimer);
    }
    this._stateChangeTimer = setTimeout(() => {
      this._stateChangeTimer = undefined;
      if (!this.datagridState) return;

      this.datagridState.refreshSync();
      const currentState = this.datagridState.toJson();
      const currentStateJson = JSON.stringify(currentState);

      if (currentStateJson !== this._previousNotifiedStateJson) {
        this._previousNotifiedStateJson = currentStateJson;
        const eventArgs: IAcDatagridStateChangeEvent = {
          datagridApi: this,
          datagridState: currentState,
          currentState: currentState,
          source: info?.source
        };
        this.events.execute({ event: AC_DATAGRID_EVENT.StateChange, args: eventArgs });
        this.hooks.execute({ hook: AC_DATAGRID_HOOK.StateChange, args: eventArgs });
      }
    }, 150);
  }

  isRowSelected(rowId: string): boolean {
    return this.selectedRowIds.has(rowId);
  }

  isColumnFocusable(col: IAcDatagridColumn): boolean {
    if (!col || !col.visible) return false;
    if (col.rawColumnDefinition?.allowFocus === false) return false;
    if ((col.rawColumnDefinition as any)?.suppressFocus === true) return false;
    if ((col.columnDefinition as any)?.suppressFocus === true) return false;
    if (col.allowFocus === false && !col.allowEdit && !col.columnDefinition?.allowEdit && !col.columnDefinition?.editable) return false;
    return true;
  }

  isCellEditable({ row, column }: { row: IAcDatagridRow, column: IAcDatagridColumn }): boolean {
    if (!column || !row) return false;
    if (!this.isColumnFocusable(column)) return false;
    const colDef = column.columnDefinition;
    if (!colDef) return false;

    if (typeof colDef.editable === 'function') {
      return !!colDef.editable({ row, column, datagridApi: this });
    }
    if (colDef.allowEdit !== undefined) {
      return colDef.allowEdit === true;
    }
    if (colDef.editable !== undefined) {
      return colDef.editable === true;
    }
    return column.allowEdit === true;
  }

  getActiveCellCoordinate(): { rowIndex: number, columnIndex: number } {
    const visibleCols = this.datagridColumns.filter(c => c.visible);
    if (!this.activeDatagridCell) {
      if (this.lastActiveRowIndex !== undefined && this.lastActiveRowIndex >= 0 && this.lastActiveRowIndex < this.displayedDatagridRows.length) {
        return {
          rowIndex: this.lastActiveRowIndex,
          columnIndex: this.lastActiveColumnIndex !== undefined && this.lastActiveColumnIndex >= 0 && this.lastActiveColumnIndex < visibleCols.length ? this.lastActiveColumnIndex : 0
        };
      }
      return { rowIndex: 0, columnIndex: 0 };
    }
    let rowIdx = this.displayedDatagridRows.findIndex(r => r.rowId === this.activeDatagridCell?.datagridRow?.rowId);
    if (rowIdx < 0 && this.activeDatagridRow?.rowId) {
      rowIdx = this.displayedDatagridRows.findIndex(r => r.rowId === this.activeDatagridRow.rowId);
    }
    if (rowIdx < 0 && this.activeDatagridCell?.datagridRow?.index !== undefined) {
      const idx = this.activeDatagridCell.datagridRow.index;
      if (idx >= 0 && idx < this.displayedDatagridRows.length) {
        rowIdx = idx;
      }
    }
    if (rowIdx < 0 && this.lastActiveRowIndex !== undefined && this.lastActiveRowIndex >= 0 && this.lastActiveRowIndex < this.displayedDatagridRows.length) {
      rowIdx = this.lastActiveRowIndex;
    }

    let colIdx = visibleCols.findIndex(c => c.columnId === this.activeDatagridCell?.datagridColumn?.columnId);
    if (colIdx < 0 && this.activeDatagridCell?.datagridColumn?.columnKey) {
      colIdx = visibleCols.findIndex(c => c.columnKey === this.activeDatagridCell?.datagridColumn?.columnKey);
    }
    if (colIdx < 0 && this.lastActiveColumnIndex !== undefined && this.lastActiveColumnIndex >= 0 && this.lastActiveColumnIndex < visibleCols.length) {
      colIdx = this.lastActiveColumnIndex;
    }

    const finalRowIndex = rowIdx >= 0 ? rowIdx : 0;
    const finalColIndex = colIdx >= 0 ? colIdx : 0;
    this.lastActiveRowIndex = finalRowIndex;
    this.lastActiveColumnIndex = finalColIndex;

    return {
      rowIndex: finalRowIndex,
      columnIndex: finalColIndex
    };
  }

  focusCell({ rowId, columnId }: { rowId: string, columnId: string }) {
    const row = this.getRow({ rowId });
    const col = this.getColumn({ columnId });
    if (!row || !col) return;

    if (this.datagrid?.datagridBody) {
      const rowEl = (this.datagrid.datagridBody as any).currentRows?.find((r: any) => r.datagridRow?.rowId === rowId);
      if (rowEl) {
        const cellEl = rowEl.datagridCells?.find((c: any) =>
          c.datagridCell?.datagridColumn?.columnId === columnId ||
          c.datagridCell?.datagridColumn?.columnKey === col.columnKey
        );
        if (cellEl) {
          this.setActiveCell({ datagridCell: cellEl.datagridCell });
          cellEl.focus();
          cellEl.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
          return;
        }
      }
    }
    this.setActiveCell({ rowIndex: row.index, columnIndex: col.index });
  }

  navigateCell({ rowDelta, colDelta, edit }: { rowDelta: number, colDelta: number, edit?: boolean }) {
    const visibleCols = this.datagridColumns.filter(c => c.visible);
    if (visibleCols.length === 0 || this.displayedDatagridRows.length === 0) return;

    const isEditing = edit !== undefined ? edit : (!!(this.activeDatagridCell?.element as any)?.isEditing || !!this.activeEditRowId);
    const currentCoord = this.getActiveCellCoordinate();

    // Vertical navigation (ArrowUp / ArrowDown)
    if (rowDelta !== 0 && colDelta === 0) {
      let nextRowIdx = currentCoord.rowIndex + rowDelta;
      nextRowIdx = Math.max(0, Math.min(this.displayedDatagridRows.length - 1, nextRowIdx));
      const targetRow = this.displayedDatagridRows[nextRowIdx];
      const targetCol = visibleCols[currentCoord.columnIndex];
      if (targetRow && targetCol) {
        this.focusCell({ rowId: targetRow.rowId, columnId: targetCol.columnId });
        if (isEditing && this.isCellEditable({ row: targetRow, column: targetCol })) {
          const cellEl = this.activeDatagridCell?.element as any;
          if (cellEl && !cellEl.isEditing) {
            cellEl.startEdit?.();
          }
        }
      }
      return;
    }

    // Horizontal navigation (Tab / Shift-Tab / ArrowLeft / ArrowRight)
    const step = colDelta > 0 ? 1 : -1;
    let currRow = currentCoord.rowIndex;
    let currCol = currentCoord.columnIndex;
    let found = false;

    const totalRows = this.displayedDatagridRows.length;
    const totalCols = visibleCols.length;

    while (true) {
      currCol += step;

      if (currCol >= totalCols) {
        if (currRow < totalRows - 1) {
          currRow++;
          currCol = 0;
        } else {
          break;
        }
      } else if (currCol < 0) {
        if (currRow > 0) {
          currRow--;
          currCol = totalCols - 1;
        } else {
          break;
        }
      }

      const candidateRow = this.displayedDatagridRows[currRow];
      const candidateCol = visibleCols[currCol];
      if (!candidateRow || !candidateCol) break;

      // Must be focusable
      if (!this.isColumnFocusable(candidateCol)) {
        continue;
      }

      // If in edit mode, must also be editable
      if (isEditing && !this.isCellEditable({ row: candidateRow, column: candidateCol })) {
        continue;
      }

      found = true;
      break;
    }

    if (found) {
      const targetRow = this.displayedDatagridRows[currRow];
      const targetCol = visibleCols[currCol];
      if (targetRow && targetCol) {
        this.focusCell({ rowId: targetRow.rowId, columnId: targetCol.columnId });
        if (isEditing && this.isCellEditable({ row: targetRow, column: targetCol })) {
          const cellEl = this.activeDatagridCell?.element as any;
          if (cellEl && !cellEl.isEditing) {
            cellEl.startEdit?.();
          }
        }
      }
    }
  }

  selectRow({ rowId, isSelected, event }: { rowId: string, isSelected?: boolean, event?: MouseEvent }) {
    const row = this.getRow({ rowId });
    if (!row) return;

    if (this.selectionMode === 'single' || !this.allowMultipleSelection) {
      this.selectedRowIds.clear();
      this.selectedRowIds.add(rowId);
      this.lastSelectedRowIndex = row.index;
    } else {
      if (event && event.shiftKey && this.lastSelectedRowIndex >= 0) {
        const start = Math.min(this.lastSelectedRowIndex, row.index);
        const end = Math.max(this.lastSelectedRowIndex, row.index);
        for (let i = start; i <= end; i++) {
          const r = this.displayedDatagridRows[i];
          if (r) {
            this.selectedRowIds.add(r.rowId);
          }
        }
      } else {
        const shouldSelect = isSelected !== undefined ? isSelected : !this.selectedRowIds.has(rowId);
        if (shouldSelect) {
          this.selectedRowIds.add(rowId);
        } else {
          this.selectedRowIds.delete(rowId);
        }
        this.lastSelectedRowIndex = row.index;
      }
    }

    this.events.execute({
      event: AC_DATAGRID_EVENT.RowSelectionChange,
      args: {
        selectedRowIds: Array.from(this.selectedRowIds),
        selectedRows: this.getSelectedRows(),
        selectedData: this.getSelectedData(),
        datagridApi: this
      }
    });

    this.refreshInternalCells();
    this.notifyStateChange({ source: 'selection' });
  }

  selectAll() {
    for (const row of this.displayedDatagridRows) {
      this.selectedRowIds.add(row.rowId);
    }
    this.events.execute({
      event: AC_DATAGRID_EVENT.RowSelectionChange,
      args: {
        selectedRowIds: Array.from(this.selectedRowIds),
        selectedRows: this.getSelectedRows(),
        selectedData: this.getSelectedData(),
        datagridApi: this
      }
    });
    this.refreshInternalCells();
    this.notifyStateChange({ source: 'selection' });
  }

  clearSelection() {
    this.selectedRowIds.clear();
    this.lastSelectedRowIndex = -1;
    this.events.execute({
      event: AC_DATAGRID_EVENT.RowSelectionChange,
      args: {
        selectedRowIds: [],
        selectedRows: [],
        selectedData: [],
        datagridApi: this
      }
    });
    this.refreshInternalCells();
    this.notifyStateChange({ source: 'selection' });
  }

  toggleSelectAll() {
    if (this.selectedRowIds.size === this.displayedDatagridRows.length && this.displayedDatagridRows.length > 0) {
      this.clearSelection();
    } else {
      this.selectAll();
    }
  }

  getSelectedRows(): IAcDatagridRow[] {
    return this.datagridRows.filter(r => this.selectedRowIds.has(r.rowId));
  }

  getSelectedData(): any[] {
    return this.getSelectedRows().map(r => r.data);
  }

  refreshInternalCells() {
    if (this.datagrid?.datagridHeader?.['internalHeaderCell']) {
      this.datagrid.datagridHeader['internalHeaderCell'].refresh();
    }
    if (this.datagrid?.datagridBody) {
      for (const rowEl of this.datagrid.datagridBody.currentRows) {
        rowEl.refresh();
      }
    }
  }

  toggleRow({ rowId }: { rowId: string }) {
    if (this.expandedRowIds.has(rowId)) {
      this.collapseRow({ rowId });
    } else {
      this.expandRow({ rowId });
    }
  }

  syncRowProperties() {
    const allRows = (this.dataManager?.allRows as IAcDatagridRow[]) || [];
    for (const r of allRows) {
      if (!r || !r.data) continue;
      if (r.data.isGroupHeader !== undefined) r.isGroupHeader = r.data.isGroupHeader;
      if (r.data.groupField !== undefined) r.groupField = r.data.groupField;
      if (r.data.groupValue !== undefined) r.groupValue = r.data.groupValue;
      if (r.data.groupCount !== undefined) r.groupCount = r.data.groupCount;
      if (r.data.groupAggregates !== undefined) r.groupAggregates = r.data.groupAggregates;
      if (r.data.hasChildren !== undefined) r.hasChildren = r.data.hasChildren;
      if (r.data.parentId !== undefined) r.parentId = r.data.parentId;
      if (r.data.level !== undefined) r.level = r.data.level;
    }
  }

  getDescendantRowIds(parentId: string): Set<string> {
    // PERF FIX (P3): Build a parentId -> children adjacency map in O(n) then walk it in O(descendants).
    // The old BFS re-scanned all rows once per level — O(n * depth).
    const allRows = (this.dataManager?.allRows as IAcDatagridRow[]) || [];
    const childrenOf = new Map<string, string[]>();
    for (const r of allRows) {
      if (!r || !r.parentId) continue;
      let children = childrenOf.get(r.parentId);
      if (!children) { children = []; childrenOf.set(r.parentId, children); }
      children.push(r.rowId);
    }
    const descendants = new Set<string>();
    const queue = [parentId];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      const children = childrenOf.get(curr);
      if (children) {
        for (const childId of children) {
          descendants.add(childId);
          queue.push(childId);
        }
      }
    }
    return descendants;
  }

  getVisibleChildRows(parentRow: IAcDatagridRow): IAcDatagridRow[] {
    const descendants = this.getDescendantRowIds(parentRow.rowId);
    return this.displayedDatagridRows.filter(r => descendants.has(r.rowId));
  }

  ensureIndexVisible(index: number) {
    (this.datagrid?.datagridBody as any)?.ensureIndexVisible?.(index);
  }

  expandRow({ rowId }: { rowId: string }) {
    const row = this.getRow({ rowId });
    if (!row) return;

    if (row.isGroupHeader && this.onDemandGroupExpandFunction && !this.hasChildrenLoaded(row)) {
      this.loadingRowIds.add(rowId);
      this.refreshInternalCells();
      this.onDemandGroupExpandFunction({
        groupRow: row,
        groupField: row.groupField,
        groupValue: row.groupValue,
        successCallback: (children: any[]) => {
          this.loadingRowIds.delete(rowId);
          if (!children || children.length === 0) {
            row.hasChildren = false;
            row.isExpanded = false;
            this.refreshInternalCells();
            return;
          }
          this.insertChildrenRows(row, children);
          this.expandedRowIds.add(rowId);
          row.isExpanded = true;
          this.processTreeVisibility();
          const visibleChildren = this.getVisibleChildRows(row);
          if (this.animateRows && (this.datagrid?.datagridBody as any)?.animateRowExpansion && visibleChildren.length > 0) {
            (this.datagrid!.datagridBody as any).animateRowExpansion({ parentRow: row, childRows: visibleChildren });
          } else {
            this.hooks.execute({ hook: AC_DATAGRID_HOOK.DisplayedRowsChange, args: { datagridApi: this, displayedRows: this.displayedDatagridRows } });
          }
          this.refreshInternalCells();
          this.events.execute({ event: AC_DATAGRID_EVENT.RowExpand, args: { row, datagridApi: this } });
          this.notifyStateChange({ source: 'group' });
        },
        errorCallback: (err: any) => {
          this.loadingRowIds.delete(rowId);
          this.refreshInternalCells();
          console.error('Failed to load group child rows', err);
        }
      });
      return;
    }

    if (this.onDemandTreeFunction && row.hasChildren && !this.hasChildrenLoaded(row)) {
      this.loadingRowIds.add(rowId);
      this.refreshInternalCells();
      this.onDemandTreeFunction({
        parentRow: row,
        successCallback: (children: any[]) => {
          this.loadingRowIds.delete(rowId);
          if (!children || children.length === 0) {
            row.hasChildren = false;
            row.isExpanded = false;
            this.refreshInternalCells();
            return;
          }
          this.insertChildrenRows(row, children);
          this.expandedRowIds.add(rowId);
          row.isExpanded = true;
          this.processTreeVisibility();
          const visibleChildren = this.getVisibleChildRows(row);
          if (this.animateRows && (this.datagrid?.datagridBody as any)?.animateRowExpansion && visibleChildren.length > 0) {
            (this.datagrid!.datagridBody as any).animateRowExpansion({ parentRow: row, childRows: visibleChildren });
          } else {
            this.hooks.execute({ hook: AC_DATAGRID_HOOK.DisplayedRowsChange, args: { datagridApi: this, displayedRows: this.displayedDatagridRows } });
          }
          this.refreshInternalCells();
          this.events.execute({ event: AC_DATAGRID_EVENT.RowExpand, args: { row, datagridApi: this } });
          this.notifyStateChange({ source: 'tree' });
        },
        errorCallback: (err: any) => {
          this.loadingRowIds.delete(rowId);
          this.refreshInternalCells();
          console.error('Failed to load tree child rows', err);
        }
      });
      return;
    }

    this.expandedRowIds.add(rowId);
    row.isExpanded = true;
    this.processTreeVisibility();
    const visibleChildren = this.getVisibleChildRows(row);
    if (this.animateRows && (this.datagrid?.datagridBody as any)?.animateRowExpansion && visibleChildren.length > 0) {
      (this.datagrid!.datagridBody as any).animateRowExpansion({ parentRow: row, childRows: visibleChildren });
    } else {
      this.hooks.execute({ hook: AC_DATAGRID_HOOK.DisplayedRowsChange, args: { datagridApi: this, displayedRows: this.displayedDatagridRows } });
    }
    this.refreshInternalCells();
    this.events.execute({ event: AC_DATAGRID_EVENT.RowExpand, args: { row, datagridApi: this } });
    this.notifyStateChange({ source: 'tree' });
  }

  collapseRow({ rowId }: { rowId: string }) {
    const row = this.getRow({ rowId });
    if (!row) return;
    const descendantIds = this.getDescendantRowIds(rowId);
    this.expandedRowIds.delete(rowId);
    row.isExpanded = false;
    this.processTreeVisibility();
    if (this.animateRows && (this.datagrid?.datagridBody as any)?.animateRowCollapse && descendantIds.size > 0) {
      (this.datagrid!.datagridBody as any).animateRowCollapse({ parentRow: row, childRowIds: descendantIds });
    } else {
      this.hooks.execute({ hook: AC_DATAGRID_HOOK.DisplayedRowsChange, args: { datagridApi: this, displayedRows: this.displayedDatagridRows } });
    }
    this.refreshInternalCells();
    this.events.execute({ event: AC_DATAGRID_EVENT.RowCollapse, args: { row, datagridApi: this } });
    this.notifyStateChange({ source: 'tree' });
  }

  expandAllRows() {
    const allRows = (this.dataManager?.allRows as IAcDatagridRow[]) || this.datagridRows;
    for (const row of allRows) {
      if (row.hasChildren || row.isGroupHeader) {
        this.expandedRowIds.add(row.rowId);
        row.isExpanded = true;
      }
    }
    this.processTreeVisibility();
    this.hooks.execute({ hook: AC_DATAGRID_HOOK.DisplayedRowsChange, args: { datagridApi: this, displayedRows: this.displayedDatagridRows } });
    this.refreshInternalCells();
    this.notifyStateChange({ source: 'tree' });
  }

  collapseAllRows() {
    this.expandedRowIds.clear();
    const allRows = (this.dataManager?.allRows as IAcDatagridRow[]) || this.datagridRows;
    for (const row of allRows) {
      row.isExpanded = false;
    }
    this.processTreeVisibility();
    this.hooks.execute({ hook: AC_DATAGRID_HOOK.DisplayedRowsChange, args: { datagridApi: this, displayedRows: this.displayedDatagridRows } });
    this.refreshInternalCells();
    this.notifyStateChange({ source: 'tree' });
  }

  hasChildrenLoaded(row: IAcDatagridRow): boolean {
    return (this.dataManager.allRows as IAcDatagridRow[]).some((r: any) => r && r.parentId === row.rowId);
  }

  insertChildrenRows(parentRow: IAcDatagridRow, children: any[]) {
    if (!children || children.length === 0) return;
    const allRows = this.dataManager.allRows as IAcDatagridRow[];
    const parentIdx = allRows.findIndex((r: any) => r && r.rowId === parentRow.rowId);
    if (parentIdx === -1) return;

    const idKey = this.treeConfig?.idKey || (children[0]?.['ledger_account_id'] ? 'ledger_account_id' : (children[0]?.['id'] ? 'id' : this.dataManager.uniqueIdKey));
    const childRows: IAcDatagridRow[] = children.map((c, i) => {
      const rowId = String(c[idKey] ?? c[this.dataManager.uniqueIdKey] ?? Autocode.uuid());
      return {
        rowId,
        data: c,
        index: parentRow.index + 1 + i,
        originalIndex: parentIdx + 1 + i,
        extensionData: {},
        parentId: parentRow.rowId,
        level: (parentRow.level || 0) + 1,
        hasChildren: !!(c.children && c.children.length > 0) || !!c.hasChildren
      };
    });

    allRows.splice(parentIdx + 1, 0, ...childRows);
    for (const childRow of childRows) {
      (this.dataManager as any)._rowById?.set(childRow.rowId, childRow);
    }
    parentRow.hasChildren = true;
  }

  initTreeRows() {
    if (!this.treeConfig) return;
    const idKey = this.treeConfig.idKey || 'id';
    const parentIdKey = this.treeConfig.parentIdKey || 'parentId';
    const childrenKey = this.treeConfig.childrenKey || 'children';

    const allRows = this.dataManager.allRows as IAcDatagridRow[];
    if (!allRows || allRows.length === 0) return;

    const rowMap = new Map<string, IAcDatagridRow>();
    for (const r of allRows) {
      if (!r || !r.data) continue;
      const rowId = String(r.data[idKey] ?? r.rowId);
      r.rowId = rowId;
      rowMap.set(rowId, r);
      (this.dataManager as any)._rowById?.set(rowId, r);
    }

    const childrenMap = new Map<string, IAcDatagridRow[]>();
    const rootRows: IAcDatagridRow[] = [];

    for (const r of allRows) {
      if (!r || !r.data) continue;
      const pId = r.data[parentIdKey];
      const hasValidParent = pId !== undefined && pId !== null && String(pId).trim() !== '' && String(pId) !== '0' && rowMap.has(String(pId)) && String(pId) !== r.rowId;
      r.parentId = hasValidParent ? String(pId) : undefined;
      if (r.parentId) {
        if (!childrenMap.has(r.parentId)) {
          childrenMap.set(r.parentId, []);
        }
        childrenMap.get(r.parentId)!.push(r);
      } else {
        rootRows.push(r);
      }
    }

    for (const r of allRows) {
      if (!r || !r.data) continue;
      const directChildren = childrenMap.get(r.rowId);
      const hasDirectChildren = directChildren !== undefined && directChildren.length > 0;
      const hasChildrenProp = r.data.hasChildren !== undefined
        ? !!r.data.hasChildren
        : (this.onDemandTreeFunction ? true : !!(r.data[childrenKey] && r.data[childrenKey].length > 0));
      r.hasChildren = hasDirectChildren || hasChildrenProp;

      let level = 0;
      let currParentId = r.parentId;
      const visited = new Set<string>();
      while (currParentId && !visited.has(currParentId)) {
        visited.add(currParentId);
        level++;
        const parent = rowMap.get(currParentId);
        currParentId = parent ? parent.parentId : undefined;
      }
      r.level = level;
    }

    // Sort allRows in DFS pre-order (parent, then recursively its children)
    const orderedRows: IAcDatagridRow[] = [];
    const visitedRows = new Set<string>();
    const addRowAndChildren = (row: IAcDatagridRow) => {
      if (visitedRows.has(row.rowId)) return;
      visitedRows.add(row.rowId);
      orderedRows.push(row);
      const children = childrenMap.get(row.rowId);
      if (children) {
        for (const child of children) {
          addRowAndChildren(child);
        }
      }
    };
    for (const root of rootRows) {
      addRowAndChildren(root);
    }
    for (const r of allRows) {
      if (!visitedRows.has(r.rowId)) {
        addRowAndChildren(r);
      }
    }
    allRows.splice(0, allRows.length, ...orderedRows);

    // Initial expansion by treeLevelExpanded
    const treeLevelExpanded = (this.treeConfig as any)?.treeLevelExpanded;
    if (treeLevelExpanded !== undefined && this.expandedRowIds.size === 0) {
      for (const r of allRows) {
        if (!r || !r.hasChildren) continue;
        if (treeLevelExpanded === -1 || (treeLevelExpanded > 0 && (r.level || 0) < treeLevelExpanded)) {
          this.expandedRowIds.add(r.rowId);
          r.isExpanded = true;
        }
      }
    }

    this.processTreeVisibility();
  }

  processTreeVisibility() {
    this._displayedRowsDirty = true;
    this._cachedDisplayedRows = undefined;
    this.syncRowProperties();
    if (!this.hasTreeOrGroup) {
      return;
    }
    const allRows = (this.dataManager?.allRows as IAcDatagridRow[]) || [];
    const rowMap = new Map<string, IAcDatagridRow>();
    for (const r of allRows) {
      if (r) {
        rowMap.set(r.rowId, r);
        r.isExpanded = this.expandedRowIds.has(r.rowId);
      }
    }

    let visibleIndex = 0;
    for (const r of allRows) {
      if (!r) continue;
      let isVisible = true;
      let currParentId = r.parentId;
      const visited = new Set<string>();
      while (currParentId && !visited.has(currParentId)) {
        visited.add(currParentId);
        if (!this.expandedRowIds.has(currParentId)) {
          isVisible = false;
          break;
        }
        const parent = rowMap.get(currParentId);
        currParentId = parent ? parent.parentId : undefined;
      }

      if (isVisible) {
        r.index = visibleIndex++;
      } else {
        r.index = -1;
      }
    }
    (this.dataManager as any)._totalRows = visibleIndex;
  }

  toggleDetailRow({ rowId }: { rowId: string }) {
    if (this.expandedDetailRowIds.has(rowId)) {
      this.collapseDetailRow({ rowId });
    } else {
      this.expandDetailRow({ rowId });
    }
  }

  expandDetailRow({ rowId }: { rowId: string }) {
    const row = this.getRow({ rowId });
    if (!row) return;
    this.expandedDetailRowIds.add(rowId);
    row.isDetailExpanded = true;
    if (row.element) {
      (row.element as any).renderDetail?.();
      (row.element as any).refresh?.();
    }
    this.refreshInternalCells();
    this.events.execute({ event: AC_DATAGRID_EVENT.DetailRowExpand, args: { row, datagridApi: this } });
    this.notifyStateChange({ source: 'masterDetail' });
  }

  collapseDetailRow({ rowId }: { rowId: string }) {
    const row = this.getRow({ rowId });
    if (!row) return;
    this.expandedDetailRowIds.delete(rowId);
    row.isDetailExpanded = false;
    if (row.element) {
      (row.element as any).removeDetail?.();
      (row.element as any).refresh?.();
    }
    this.refreshInternalCells();
    this.events.execute({ event: AC_DATAGRID_EVENT.DetailRowCollapse, args: { row, datagridApi: this } });
    this.notifyStateChange({ source: 'masterDetail' });
  }

  startRowEdit({ rowId }: { rowId: string }) {
    const row = this.getRow({ rowId });
    if (!row) return;
    this.activeEditRowId = rowId;
    row.isRowEditing = true;
    row.originalDataBackup = { ...row.data };
    row.isDirty = false;
    if (row.element) {
      (row.element as any).enterRowEditMode?.();
    }
    this.events.execute({ event: AC_DATAGRID_EVENT.RowEditingStart, args: { row, datagridApi: this } });
  }

  async saveRowEdit({ rowId }: { rowId: string }): Promise<boolean> {
    const row = this.getRow({ rowId });
    if (!row) return false;
    if (row.element) {
      const valid = (row.element as any).commitRowEdit?.();
      if (valid === false) return false;
    }
    row.isRowEditing = false;
    this.activeEditRowId = null;
    this.events.execute({ event: AC_DATAGRID_EVENT.RowEditSave, args: { row, data: row.data, datagridApi: this } });
    this.notifyStateChange({ source: 'rowEdit' });
    return true;
  }

  cancelRowEdit({ rowId }: { rowId?: string } = {}) {
    const targetRowId = rowId ?? this.activeEditRowId;
    if (!targetRowId) return;
    const row = this.getRow({ rowId: targetRowId });
    if (!row) {
      this.activeEditRowId = null;
      return;
    }
    if (row.originalDataBackup) {
      row.data = { ...row.originalDataBackup };
    }
    row.isRowEditing = false;
    row.isDirty = false;
    this.activeEditRowId = null;
    if (row.element) {
      (row.element as any).cancelRowEdit?.();
    }
    this.events.execute({ event: AC_DATAGRID_EVENT.RowEditCancel, args: { row, datagridApi: this } });
  }

  pinRow({ rowId, position }: { rowId: string, position: 'top' | 'bottom' | null }) {
    const row = this.getRow({ rowId });
    if (!row) return;
    this.pinnedTopRowIds = this.pinnedTopRowIds.filter(id => id !== rowId);
    this.pinnedBottomRowIds = this.pinnedBottomRowIds.filter(id => id !== rowId);
    if (position === 'top') {
      this.pinnedTopRowIds.push(rowId);
      row.pinned = 'top';
    } else if (position === 'bottom') {
      this.pinnedBottomRowIds.push(rowId);
      row.pinned = 'bottom';
    } else {
      row.pinned = undefined;
    }
    if (this.datagrid?.datagridBody) {
      (this.datagrid.datagridBody as any).renderPinnedRows?.();
    }
    this.events.execute({ event: AC_DATAGRID_EVENT.RowPinChange, args: { row, position, datagridApi: this } });
    this.notifyStateChange({ source: 'rowPin' });
  }

  getPinnedRows(): { top: IAcDatagridRow[], bottom: IAcDatagridRow[] } {
    return {
      top: this.pinnedTopRowIds.map(id => this.getRow({ rowId: id })).filter(Boolean) as IAcDatagridRow[],
      bottom: this.pinnedBottomRowIds.map(id => this.getRow({ rowId: id })).filter(Boolean) as IAcDatagridRow[]
    };
  }

  pinColumn({ columnId, pinnedOn }: { columnId: string, pinnedOn: 'LEFT' | 'RIGHT' | null }) {
    const col = this.getColumn({ columnId });
    if (!col) return;
    col.pinnedOn = pinnedOn || undefined;
    col.columnDefinition.pinnedOn = pinnedOn || undefined;
    this.updatePinnedOffsets();
    this.events.execute({ event: AC_DATAGRID_EVENT.ColumnPinChange, args: { column: col, pinnedOn, datagridApi: this } });
    this.notifyStateChange({ source: 'columnPin' });
  }

  updatePinnedOffsets() {
    if (this.datagrid?.datagridHeader) {
      this.datagrid.datagridHeader.internalHeaderCell?.applyStyles();
      for (const hCell of this.datagrid.datagridHeader.datagridHeaderCells) {
        hCell.applyPinning();
      }
    }
    if (this.datagrid?.datagridBody) {
      for (const rEl of this.datagrid.datagridBody.currentRows) {
        (rEl as any).internalCell?.applyStyles();
        for (const cEl of (rEl as any).datagridCells || []) {
          cEl.applyPinning();
        }
      }
    }
  }

  moveColumn({ fromIndex, toIndex }: { fromIndex: number, toIndex: number }) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= this.datagridColumns.length || toIndex >= this.datagridColumns.length) return;
    const [moved] = this.datagridColumns.splice(fromIndex, 1);
    this.datagridColumns.splice(toIndex, 0, moved);
    this.datagridColumns.forEach((c, idx) => {
      c.index = idx;
      c.columnDefinition.index = idx;
    });
    this.updatePinnedOffsets();
    if (this.datagrid?.datagridHeader) {
      this.datagrid.datagridHeader.render();
    }
    if (this.datagrid?.datagridBody) {
      this.datagrid.datagridBody.setDisplayedRows();
    }
    this.events.execute({ event: AC_DATAGRID_EVENT.ColumnPositionChange, args: { oldIndex: fromIndex, newIndex: toIndex, column: moved, datagridApi: this } });
    this.notifyStateChange({ source: 'columnReorder' });
  }

  moveRow({ fromIndex, toIndex }: { fromIndex: number, toIndex: number }) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    const rows = this.dataManager.allRows;
    if (fromIndex >= rows.length || toIndex >= rows.length) return;
    const [moved] = rows.splice(fromIndex, 1);
    rows.splice(toIndex, 0, moved);
    rows.forEach((r, idx) => {
      if (r) {
        r.originalIndex = idx;
        r.index = idx;
      }
    });
    this.dataManager.processRows();
    this.events.execute({ event: AC_DATAGRID_EVENT.RowPositionChange, args: { oldIndex: fromIndex, newIndex: toIndex, row: moved, datagridApi: this } });
    this.notifyStateChange({ source: 'rowReorder' });
  }

  calculateAggregates(rows: IAcDatagridRow[]): Record<string, any> {
    const result: Record<string, any> = {};
    for (const col of this.datagridColumns) {
      const aggFn = col.columnDefinition.aggregate || col.columnDefinition.groupAggregateFunction;
      if (!aggFn) continue;

      const field = col.columnDefinition.field;
      const values = rows.map(r => r.data ? r.data[field] : undefined).filter(v => v !== undefined && v !== null);
      if (typeof aggFn === 'function') {
        result[field] = aggFn(values);
      } else {
        const fnName = String(aggFn).toUpperCase();
        const numValues = values.map(Number).filter(v => !isNaN(v));
        if (fnName === 'COUNT') {
          result[field] = values.length;
        } else if (fnName === 'SUM') {
          result[field] = numValues.reduce((a, b) => a + b, 0);
        } else if (fnName === 'AVG' || fnName === 'AVERAGE') {
          result[field] = numValues.length > 0 ? numValues.reduce((a, b) => a + b, 0) / numValues.length : 0;
        } else if (fnName === 'MIN') {
          result[field] = numValues.length > 0 ? Math.min(...numValues) : 0;
        } else if (fnName === 'MAX') {
          result[field] = numValues.length > 0 ? Math.max(...numValues) : 0;
        }
      }
    }
    return result;
  }

  getAggregates({ groupKey }: { groupKey?: string } = {}): Record<string, any> {
    if (groupKey) {
      const groupRow = this.getRow({ rowId: groupKey });
      return groupRow?.groupAggregates || {};
    }
    return this.calculateAggregates(this.datagridRows);
  }

  setGroupBy({ fields }: { fields: string[] }) {
    this.groupBy = fields || [];
    if (this.groupBy.length === 0) {
      this.dataManager.processRows();
      return;
    }

    if (this.onDemandGroupFunction) {
      this.onDemandGroupFunction({
        groupBy: this.groupBy,
        successCallback: (groups: any[]) => {
          this.buildClientGroupRows();
          this.processTreeVisibility();
          this.notifyStateChange({ source: 'group' });
        },
        errorCallback: (err: any) => {
          console.error('Failed on demand group fetch', err);
        }
      });
    } else {
      this.buildClientGroupRows();
      this.processTreeVisibility();
      this.notifyStateChange({ source: 'group' });
    }
  }

  private buildClientGroupRows() {
    const rawData = this.data;
    if (!rawData || rawData.length === 0) return;

    const groupField = this.groupBy[0];
    const groupsMap = new Map<any, any[]>();
    for (const item of rawData) {
      const key = item[groupField] ?? '(Empty)';
      if (!groupsMap.has(key)) {
        groupsMap.set(key, []);
      }
      groupsMap.get(key)!.push(item);
    }

    const newAllRows: IAcDatagridRow[] = [];
    let rowIndex = 0;
    for (const [groupVal, items] of groupsMap) {
      const groupRowId = `group_${groupField}_${String(groupVal)}`;
      const childRows: IAcDatagridRow[] = items.map(d => ({
        rowId: d[this.dataManager.uniqueIdKey] || Autocode.uuid(),
        data: d,
        index: rowIndex++,
        originalIndex: rowIndex,
        extensionData: {},
        parentId: groupRowId,
        level: 1
      }));

      const groupAggregates = this.calculateAggregates(childRows);
      const groupHeaderRow: IAcDatagridRow = {
        rowId: groupRowId,
        data: { [groupField]: groupVal },
        index: rowIndex++,
        originalIndex: rowIndex,
        extensionData: {},
        isGroupHeader: true,
        groupField,
        groupValue: groupVal,
        groupCount: items.length,
        groupAggregates,
        hasChildren: true,
        isExpanded: this.expandedRowIds.has(groupRowId),
        level: 0
      };

      newAllRows.push(groupHeaderRow);
      newAllRows.push(...childRows);
    }

    for (const r of newAllRows) {
      (this.dataManager as any)._rowById?.set(r.rowId, r);
    }

    this.dataManager.allRows = newAllRows as any;
  }

  toggleSidePanel(open?: boolean) {
    this.sidePanelOpen = open !== undefined ? open : !this.sidePanelOpen;
    const sidePanel = this.datagrid?.querySelector('ac-datagrid-side-panel') as any;
    if (sidePanel) {
      if (this.sidePanelOpen) {
        sidePanel.open();
      } else {
        sidePanel.close();
      }
    }
    this.notifyStateChange({ source: 'sidePanel' });
  }

  applyState(state: IAcDatagridState) {
    if (!state) return;
    this.logger.log('Applying datagrid state', { state });

    if (state.columns && state.columns.length > 0) {
      const colMap = new Map<string, IAcDatagridColumnState>();
      for (const c of state.columns) {
        if (c.field) colMap.set(c.field, c);
      }
      for (const col of this.datagridColumns) {
        const saved = colMap.get(col.columnDefinition.field);
        if (saved) {
          if (saved.width !== undefined) col.width = saved.width;
          if (saved.flexSize !== undefined) col.flexSize = saved.flexSize;
          if (saved.isVisible !== undefined) {
            col.visible = saved.isVisible;
            col.columnDefinition.visible = saved.isVisible;
          }
          if (saved.pinnedOn !== undefined) {
            col.pinnedOn = saved.pinnedOn;
            col.columnDefinition.pinnedOn = saved.pinnedOn;
          }
          if (saved.index !== undefined) col.index = saved.index;
          if (saved.sortOrder !== undefined) col.sortOrder = saved.sortOrder;
        }
      }
      this.datagridColumns.sort((a, b) => a.index - b.index);
    }

    if (state.sortOrder) {
      if (this.dataManager && this.dataManager.sortOrder) {
        this.dataManager.sortOrder.fromJson({ jsonData: state.sortOrder });
      }
    }

    if (state.filterGroup) {
      if (this.dataManager && this.dataManager.filterGroup) {
        this.dataManager.filterGroup.fromJson({ jsonData: state.filterGroup });
      }
    }

    if (state.pagination && this.pagination) {
      if (state.pagination.activePage !== undefined) {
        this.pagination.activePage = state.pagination.activePage;
      }
      if (state.pagination.activePageSize !== undefined) {
        this.pagination.activePageSize = state.pagination.activePageSize;
      }
    }

    if (state.groupBy) {
      this.setGroupBy({ fields: state.groupBy });
    }

    if (state.expandedRowIds) {
      this.expandedRowIds = new Set(state.expandedRowIds);
      this.processTreeVisibility();
      this.hooks.execute({ hook: AC_DATAGRID_HOOK.DisplayedRowsChange, args: { datagridApi: this, displayedRows: this.displayedDatagridRows } });
      this.refreshInternalCells();
    }

    if (state.expandedDetailRowIds) {
      this.expandedDetailRowIds = new Set(state.expandedDetailRowIds);
      for (const row of this.datagridRows) {
        row.isDetailExpanded = this.expandedDetailRowIds.has(row.rowId);
      }
      this.refreshInternalCells();
    }

    if (state.pinnedRows) {
      this.pinnedTopRowIds = state.pinnedRows.top ? [...state.pinnedRows.top] : [];
      this.pinnedBottomRowIds = state.pinnedRows.bottom ? [...state.pinnedRows.bottom] : [];
      for (const row of this.datagridRows) {
        if (this.pinnedTopRowIds.includes(row.rowId)) {
          row.pinned = 'top';
        } else if (this.pinnedBottomRowIds.includes(row.rowId)) {
          row.pinned = 'bottom';
        } else {
          row.pinned = undefined;
        }
      }
      if (this.datagrid?.datagridBody) {
        (this.datagrid.datagridBody as any).renderPinnedRows?.();
      }
    }

    if (state.sidePanelOpen !== undefined) {
      this.toggleSidePanel(state.sidePanelOpen);
    }

    if (state.extensionStates && this.extensions) {
      for (const extensionName of Object.keys(state.extensionStates)) {
        if (this.extensions[extensionName] && typeof this.extensions[extensionName].setState === 'function') {
          this.extensions[extensionName].setState({ state: this.datagridState, extensionState: state.extensionStates[extensionName] });
        }
      }
    }

    this.updatePinnedOffsets();
    this.dataManager.processRows();
    if (this.hasTreeOrGroup) {
      this.processTreeVisibility();
    }
    if (this.datagrid?.datagridHeader) {
      this.datagrid.datagridHeader.render();
    }
    if (this.datagrid?.datagridBody) {
      this.datagrid.datagridBody.setDisplayedRows();
    }
    this.datagridState.refreshSync();
  }

  async getDataAsCsv(params?: IAcDatagridCsvExportParams): Promise<string> {
    this.hooks.execute({ hook: AC_DATAGRID_HOOK.BeforeExport, args: { format: 'csv', params } });
    const csv = await AcDatagridExportHelper.getDataAsCsv(this, params);
    this.hooks.execute({ hook: AC_DATAGRID_HOOK.AfterExport, args: { format: 'csv', params, content: csv } });
    return csv;
  }

  async exportDataAsCsv(params?: IAcDatagridCsvExportParams): Promise<void> {
    const content = await this.getDataAsCsv(params);
    const rawFileName = params?.fileName ?? 'export.csv';
    const filename = rawFileName.toLowerCase().endsWith('.csv') ? rawFileName : `${rawFileName}.csv`;
    AcBrowser.downloadFile({ content, filename });
  }

  async getDataAsExcel(params?: IAcDatagridExcelExportParams): Promise<Blob> {
    this.hooks.execute({ hook: AC_DATAGRID_HOOK.BeforeExport, args: { format: 'xlsx', params } });
    const blob = await AcDatagridExportHelper.getDataAsExcel(this, params);
    this.hooks.execute({ hook: AC_DATAGRID_HOOK.AfterExport, args: { format: 'xlsx', params, content: blob } });
    return blob;
  }

  async exportDataAsExcel(params?: IAcDatagridExcelExportParams): Promise<void> {
    const blob = await this.getDataAsExcel(params);
    const rawFileName = params?.fileName ?? 'export.xlsx';
    const filename = rawFileName.toLowerCase().endsWith('.xlsx') ? rawFileName : `${rawFileName}.xlsx`;
    AcBrowser.downloadFile({ content: blob, filename });
  }

  async exportMultipleSheetsAsExcel(params: IAcDatagridExcelExportMultipleSheetsParams): Promise<void> {
    if (!params || !params.sheets || params.sheets.length === 0) {
      throw new Error("exportMultipleSheetsAsExcel requires at least one sheet definition.");
    }
    const sheetDefs: IAcExcelSheetExportDef[] = [];
    for (const sheetDef of params.sheets) {
      const columns = AcDatagridExportHelper.resolveColumns(sheetDef.api, sheetDef.params);
      const rows = await AcDatagridExportHelper.resolveRows(sheetDef.api, sheetDef.params);
      const table = AcDatagridExportHelper.buildTableMatrix(sheetDef.api, columns, rows, sheetDef.params);
      const colDefs = AcDatagridExportHelper.toColExportDefs(columns);
      sheetDefs.push({
        sheetName: sheetDef.sheetName,
        table,
        columns: colDefs,
        autoSizeColumns: sheetDef.params?.autoSizeColumns !== false
      });
    }

    const workbook = AcExcelExportService.createMultiSheetWorkbook(sheetDefs);
    const blob = AcExcelExportService.toBlob(workbook, 'xlsx');
    const rawFileName = params.fileName ?? 'export.xlsx';
    const filename = rawFileName.toLowerCase().endsWith('.xlsx') ? rawFileName : `${rawFileName}.xlsx`;
    AcBrowser.downloadFile({ content: blob, filename });
  }
}

