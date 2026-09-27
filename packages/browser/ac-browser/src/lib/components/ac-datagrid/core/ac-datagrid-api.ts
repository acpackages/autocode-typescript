/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcPaginationElement } from "../../ac-pagination/elements/ac-pagination.element";
import { AcDatagridElement } from "../elements/ac-datagrid.element";
import { IAcDatagridColumnDefinition } from "../interfaces/ac-datagrid-column-definition.interface";
import { AcDataManager, AC_DATA_MANAGER_EVENT, AcEnumLogicalOperator, AcEnumSortOrder, AcEvents, AcHooks, AcLogger, Autocode, IAcDataManagerDataEvent, IAcFilter, IAcFilterGroup, acNullifyInstanceProperties } from "@autocode-ts/autocode";
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
import { IAcDatagridColumnDefinitionsSetEvent } from "../interfaces/event-args/ac-datagrid-column-definitions-set-event.interface";
import { AC_DATAGRID_DEFAULT_COLUMN_DEFINITION, AcEnumDatagridColumnDataType, IAcDatagridActiveRowChangeEvent, IAcDatagridCell, IAcDatagridColumn } from "../_ac-datagrid.export";
import { isValidDateString, isValidDateTimeString } from "@autocode-ts/ac-extensions";
import { IAcDatagridRow } from "../interfaces/ac-datagrid-row.interface";

export class AcDatagridApi {
  private _bodyWidth: number = 0;
  get bodyWidth(): number {
    return this._bodyWidth;
  }
  set bodyWidth(value: number) {
    this._bodyWidth = value;
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
      const datagridColumn: IAcDatagridColumn = {
        columnDefinition: column,
        originalIndex: column.index!,
        isActive: false,
        dataType: AcEnumDatagridColumnDataType.Unknown,
        columnId: Autocode.uuid(),
        extensionData: {},
        allowEdit: column.allowEdit,
        allowFilter: column.allowFilter,
        allowFocus: column.allowFocus,
        allowResize: column.allowResize,
        allowSort: column.allowSort,
        columnKey: column.field,
        isFirst: false,
        isLast: false,
        title: column.title ?? column.field,
        visible: column.visible,
        index: column.visible ? displayIndex : -1,
        width: column.width ?? this.defaultColumnDefiniation.width,
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

    this.hooks.execute({ hook: AC_DATAGRID_HOOK.ColumnDefinitionsChange, args: hookArgs });
    this.logger.log('Executed ColumnDefinitionsChange hook');
    const event: IAcDatagridColumnDefinitionsSetEvent = {
      columnDefinitions: value,
      datagridColumns: this.datagridColumns,
      datagridApi: this
    };
    this.events.execute({ event: AC_DATAGRID_EVENT.ColumnDefinitionsSet, args: event });
    this.logger.log('Executed ColumnDefinitionsSet event');
  }

  get data(): any[] {
    this.logger.log('Getting data', { count: this.dataManager.data.length });
    return this.dataManager.data;
  }
  set data(value: any[]) {
    this.dataManager.data = value;
    this.dataManager.processRows();
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
      if (this.datagrid?.datagridBody?.currentRows) {
        for (const rowEl of this.datagrid.datagridBody.currentRows) {
          rowEl.refresh();
        }
      }
    }

    this.datagrid?.datagridHeader?.syncScrollbarSpacer?.();
    this.hooks.execute({ hook: AC_DATAGRID_HOOK.ColumnWidthChange, args: { datagridColumn, width, oldWidth, datagridApi: this } });
  }

  get displayedDatagridRows(): IAcDatagridRow[] {
    if (this.hasTreeOrGroup && this.dataManager?.allRows && this.dataManager.allRows.length > 0) {
      return (this.dataManager.allRows as IAcDatagridRow[]).filter(r => r && r.index !== -1);
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

  private _rowHeight: number = 36;
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

  private _useVirtualScrolling: boolean = false;
  get useVirtualScrolling(): boolean {
    return this._useVirtualScrolling;
  }
  set useVirtualScrolling(value: boolean) {
    this._useVirtualScrolling = value;
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
  datagridState: AcDatagridState;
  dataManager: AcDataManager = new AcDataManager();
  defaultColumnDefiniation: Partial<IAcDatagridColumnDefinition> = AC_DATAGRID_DEFAULT_COLUMN_DEFINITION;
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
  editMode: 'cell' | 'row' | 'none' = 'cell';
  activeEditRowId: string | null = null;
  groupBy: string[] = [];
  expandedRowIds: Set<string> = new Set<string>();
  expandedDetailRowIds: Set<string> = new Set<string>();
  loadingRowIds: Set<string> = new Set<string>();
  private _treeConfig?: { idKey: string; parentIdKey: string; childrenKey?: string };
  get treeConfig(): { idKey: string; parentIdKey: string; childrenKey?: string } | undefined {
    return this._treeConfig;
  }
  set treeConfig(value: { idKey: string; parentIdKey: string; childrenKey?: string } | undefined) {
    this._treeConfig = value;
    if (this.dataManager?.allRows && this.dataManager.allRows.length > 0) {
      this.initTreeRows();
      this.hooks.execute({ hook: AC_DATAGRID_HOOK.DisplayedRowsChange, args: { datagridApi: this, displayedRows: this.displayedDatagridRows } });
    }
  }
  masterDetailConfig?: { detailTemplate: (row: IAcDatagridRow) => HTMLElement | string };
  onDemandTreeFunction?: (args: { parentRow: IAcDatagridRow, successCallback: (children: any[]) => void, errorCallback: (err: any) => void }) => void;
  onDemandGroupFunction?: (args: { groupBy: string[], successCallback: (groups: any[]) => void, errorCallback: (err: any) => void }) => void;
  pinnedTopRowIds: string[] = [];
  pinnedBottomRowIds: string[] = [];
  sidePanelOpen: boolean = false;
  private _stateChangeTimer: any;

  constructor({ datagrid }: { datagrid: AcDatagridElement }) {
    this.datagrid = datagrid;
    this.dataManager.logger = this.logger;
    this.events = datagrid.events;
    this.dataManager.events = this.events;
    this.dataManager.hooks = this.hooks;
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

  autoResizeColumn({ datagridColumn }: { datagridColumn: IAcDatagridColumn }) {
    if (!datagridColumn) return;
    this.logger.log('Auto-resizing column', { field: datagridColumn.columnDefinition.field });
    const minWidth = datagridColumn.columnDefinition.minWidth ?? 60;
    const maxWidth = datagridColumn.columnDefinition.maxWidth ?? 800;
    const title = datagridColumn.title || datagridColumn.columnKey || '';

    let maxChars = title.length + 4;
    const field = datagridColumn.columnDefinition.field || datagridColumn.columnKey;
    const rows = this.displayedDatagridRows || [];
    for (let i = 0; i < Math.min(rows.length, 100); i++) {
      const val = rows[i]?.data?.[field];
      if (val != null) {
        const len = String(val).length;
        if (len > maxChars) {
          maxChars = len;
        }
      }
    }
    const calculatedWidth = Math.max(minWidth, Math.min(maxWidth, Math.round(maxChars * 9) + 40));
    this.setColumnWidth({ datagridColumn, width: calculatedWidth });
    this.events.execute({
      event: AC_DATAGRID_EVENT.ColumnResize,
      args: {
        column: datagridColumn,
        width: calculatedWidth,
        datagridApi: this
      }
    });
    this.notifyStateChange({ source: 'columnResize' });
  }

  deleteRow({ data, rowId, key, value, highlightCells = false }: { data?: any, rowId?: string, key?: string, value?: any, highlightCells?: boolean }) {
    this.logger.log('Deleting row', { rowId, key, value: value ? '[provided]' : 'undefined', highlightCells });
    const datagridRow: IAcDatagridRow | undefined = this.dataManager.deleteRow({ data, rowId, key, value }) as IAcDatagridRow;
    if (datagridRow) {
      this.logger.log('Row deleted from dataManager', { rowId: datagridRow.rowId });
      if (datagridRow.element) {
        datagridRow.element.remove();
        this.logger.log('Removed row element from DOM');
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
    let result: IAcDatagridColumn | undefined;
    for (const column of this.datagridColumns) {
      if (column.columnKey == key) {
        result = column;
        break;
      }
      else if (columnId != undefined && column.columnId == columnId) {
        result = column;
        break;
      }
      else if (index != undefined && column.index == index) {
        result = column;
        break;
      }
      else if (originalIndex != undefined && column.originalIndex == originalIndex) {
        result = column;
        break;
      }
    }
    return result;
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

  getRow({ rowId, index, key, value }: { rowId?: string, index?: number, key?: string, value?: any }): IAcDatagridRow | undefined {
    let result: IAcDatagridRow | undefined;
    const sourceRows = (this.dataManager?.allRows && this.dataManager.allRows.length > 0)
      ? (this.dataManager.allRows as IAcDatagridRow[])
      : this.datagridRows;
    for (const row of sourceRows) {
      if (!row) continue;
      if (rowId != undefined && row.rowId == rowId) {
        result = row;
        break;
      }
      else if (index != undefined && row.index == index) {
        result = row;
        break;
      }
      else if (key != undefined && value != undefined && row.data && row.data[key] == value) {
        result = row;
        break;
      }
    }
    return result;
  }

  getState(): IAcDatagridState {
    this.logger.log('Getting datagrid state');
    this.datagridState.refresh();
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

  setState({ state }: { state: IAcDatagridState }) {
    this.datagridState.apply(state);
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
      if (highlightCells && datagridRow.datagridCells) {
        for (const cell of datagridRow.datagridCells) {
          if (cell.element) {
            cell.element!.refresh();
          }
          this.logger.log('Refreshed cell', { cellId: cell.cellId });
        }
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
    return (this.groupBy && this.groupBy.length > 0) || !!this.treeConfig || this.datagridRows.some((r: any) => r.hasChildren || r.isGroupHeader);
  }

  get hasMasterDetail(): boolean {
    return !!this.masterDetailConfig || this.datagridRows.some((r: any) => r.isMasterDetail);
  }

  notifyStateChange(info?: { source?: string, payload?: any }) {
    if (this._stateChangeTimer) {
      clearTimeout(this._stateChangeTimer);
    }
    this._stateChangeTimer = setTimeout(() => {
      if (this.datagridState) {
        this.datagridState.refresh();
      }
    }, 150);
  }

  isRowSelected(rowId: string): boolean {
    return this.selectedRowIds.has(rowId);
  }

  getActiveCellCoordinate(): { rowIndex: number, columnIndex: number } {
    const visibleCols = this.datagridColumns.filter(c => c.visible);
    if (!this.activeDatagridCell) {
      return { rowIndex: 0, columnIndex: 0 };
    }
    const rowIdx = this.displayedDatagridRows.findIndex(r => r.rowId === this.activeDatagridCell?.datagridRow.rowId);
    const colIdx = visibleCols.findIndex(c => c.columnId === this.activeDatagridCell?.datagridColumn.columnId);
    return {
      rowIndex: rowIdx >= 0 ? rowIdx : 0,
      columnIndex: colIdx >= 0 ? colIdx : 0
    };
  }

  focusCell({ rowId, columnId }: { rowId: string, columnId: string }) {
    const row = this.getRow({ rowId });
    const col = this.getColumn({ columnId });
    if (!row || !col) return;

    if (this.datagrid?.datagridBody) {
      const rowEl = (this.datagrid.datagridBody as any).currentRows?.find((r: any) => r.datagridRow?.rowId === rowId);
      if (rowEl) {
        const cellEl = rowEl.datagridCells?.find((c: any) => c.datagridCell?.datagridColumn?.columnId === columnId);
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

  navigateCell({ rowDelta, colDelta }: { rowDelta: number, colDelta: number }) {
    const visibleCols = this.datagridColumns.filter(c => c.visible);
    if (visibleCols.length === 0 || this.displayedDatagridRows.length === 0) return;

    const currentCoord = this.getActiveCellCoordinate();
    let nextRowIdx = currentCoord.rowIndex + rowDelta;
    let nextColIdx = currentCoord.columnIndex + colDelta;

    if (nextColIdx >= visibleCols.length) {
      if (nextRowIdx < this.displayedDatagridRows.length - 1) {
        nextColIdx = 0;
        nextRowIdx++;
      } else {
        nextColIdx = visibleCols.length - 1;
      }
    } else if (nextColIdx < 0) {
      if (nextRowIdx > 0) {
        nextColIdx = visibleCols.length - 1;
        nextRowIdx--;
      } else {
        nextColIdx = 0;
      }
    }

    nextRowIdx = Math.max(0, Math.min(this.displayedDatagridRows.length - 1, nextRowIdx));

    const targetRow = this.displayedDatagridRows[nextRowIdx];
    const targetCol = visibleCols[nextColIdx];
    if (targetRow && targetCol) {
      this.focusCell({ rowId: targetRow.rowId, columnId: targetCol.columnId });
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

  expandRow({ rowId }: { rowId: string }) {
    const row = this.getRow({ rowId });
    if (!row) return;

    if (this.onDemandTreeFunction && row.hasChildren && !this.hasChildrenLoaded(row)) {
      this.loadingRowIds.add(rowId);
      this.refreshInternalCells();
      this.onDemandTreeFunction({
        parentRow: row,
        successCallback: (children: any[]) => {
          this.loadingRowIds.delete(rowId);
          this.insertChildrenRows(row, children);
          this.expandedRowIds.add(rowId);
          row.isExpanded = true;
          this.processTreeVisibility();
          this.hooks.execute({ hook: AC_DATAGRID_HOOK.DisplayedRowsChange, args: { datagridApi: this, displayedRows: this.displayedDatagridRows } });
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
    this.hooks.execute({ hook: AC_DATAGRID_HOOK.DisplayedRowsChange, args: { datagridApi: this, displayedRows: this.displayedDatagridRows } });
    this.refreshInternalCells();
    this.events.execute({ event: AC_DATAGRID_EVENT.RowExpand, args: { row, datagridApi: this } });
    this.notifyStateChange({ source: 'tree' });
  }

  collapseRow({ rowId }: { rowId: string }) {
    const row = this.getRow({ rowId });
    if (!row) return;
    this.expandedRowIds.delete(rowId);
    row.isExpanded = false;
    this.processTreeVisibility();
    this.hooks.execute({ hook: AC_DATAGRID_HOOK.DisplayedRowsChange, args: { datagridApi: this, displayedRows: this.displayedDatagridRows } });
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

    const idKey = this.treeConfig?.idKey || 'id';
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
      const pId = r.data[parentIdKey];
      r.parentId = pId != null ? String(pId) : undefined;
      rowMap.set(rowId, r);
    }

    for (const r of allRows) {
      if (!r || !r.data) continue;
      const hasDirectChildren = allRows.some(child => child && child.parentId === r.rowId);
      const hasChildrenProp = !!r.data.hasChildren || !!(r.data[childrenKey] && r.data[childrenKey].length > 0);
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

    this.processTreeVisibility();
  }

  processTreeVisibility() {
    if (!this.hasTreeOrGroup) {
      return;
    }
    const allRows = (this.dataManager?.allRows as IAcDatagridRow[]) || [];
    const rowMap = new Map<string, IAcDatagridRow>();
    for (const r of allRows) {
      if (r) rowMap.set(r.rowId, r);
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
    this.dataManager.totalRows = visibleIndex;
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

  cancelRowEdit({ rowId }: { rowId: string }) {
    const row = this.getRow({ rowId });
    if (!row) return;
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
    if (state.columns && state.columns.length > 0) {
      const colMap = new Map<string, any>();
      for (const c of state.columns) {
        if (c.field) colMap.set(c.field, c);
      }
      for (const col of this.datagridColumns) {
        const saved = colMap.get(col.columnDefinition.field);
        if (saved) {
          if (saved.width !== undefined) col.width = saved.width;
          if (saved.isVisible !== undefined) col.visible = saved.isVisible;
          if (saved.pinnedOn !== undefined) col.pinnedOn = saved.pinnedOn;
          if (saved.index !== undefined) col.index = saved.index;
        }
      }
      this.datagridColumns.sort((a, b) => a.index - b.index);
    }

    if (state.groupBy) {
      this.setGroupBy({ fields: state.groupBy });
    }

    if (state.expandedRowIds) {
      this.expandedRowIds = new Set(state.expandedRowIds);
      this.processTreeVisibility();
    }

    if (state.sidePanelOpen !== undefined) {
      this.toggleSidePanel(state.sidePanelOpen);
    }

    this.updatePinnedOffsets();
    if (this.datagrid?.datagridHeader) {
      this.datagrid.datagridHeader.render();
    }
    if (this.datagrid?.datagridBody) {
      this.datagrid.datagridBody.setDisplayedRows();
    }
  }
}
