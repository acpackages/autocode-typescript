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
    this.hooks.execute({ hook: AC_DATAGRID_HOOK.ColumnWidthChange, args: { datagridColumn, width, oldWidth, datagridApi: this } });
  }

  get displayedDatagridRows(): IAcDatagridRow[] {
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

  private _rowHeight: number = 40;
  get rowHeight(): number {
    return this._rowHeight;
  }
  set rowHeight(value: number) {
    if (value != this._rowHeight) {
      this._rowHeight = value;
      this.hooks.execute({ hook: AC_DATAGRID_HOOK.RowHeightChange, args: { rowHeight: this.rowHeight } });
      this.events.execute({ event: AC_DATAGRID_HOOK.RowHeightChange, args: { rowHeight: this.rowHeight } });
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
    this.logger.log('Auto-resizing column', { field: datagridColumn.columnDefinition.field });
    // let maxWidth: number = 0;
    // for (const datagridRow of this.datagridRows) {
    //   if (datagridRow.element) {
    //     // for (const datagridCell of datagridRow.element.datagridCells) {
    //     //   if (datagridCell.datagridColumn.columnId == datagridColumn.columnId) {
    //     //     const cellWidth = datagridCell.containerWidth;
    //     //     if (cellWidth > maxWidth) {
    //     //       maxWidth = cellWidth;
    //     //       this.logger.log('Updated maxWidth for cell', { rowId: datagridRow.rowId, width: maxWidth });
    //     //     }
    //     //   }
    //     // }
    //   }
    // }
    // if (maxWidth > 0) {
    //   datagridColumn.width = maxWidth + 10;
    //   this.logger.log('Set column width', { field: datagridColumn.columnDefinition.field, width: datagridColumn.width });
    // } else {
    //   this.logger.log('No valid width found, skipping resize');
    // }
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
    for (const row of this.datagridRows) {
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
      }
      this.logger.log('Row update complete');
    } else {
      this.logger.log('No row updated (possibly not found or addIfMissing false)');
    }
    return datagridRow;
  }

  getPinnedLeftOffset(datagridColumn: IAcDatagridColumn): number {
    let offset = 0;
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
    let customizer = this.datagrid.querySelector('ac-datagrid-column-customizer') as any;
    if (customizer) {
      customizer.style.display = customizer.style.display === 'none' ? 'flex' : 'none';
      if (customizer.style.display !== 'none') {
        customizer.render();
      }
    } else {
      customizer = document.createElement('ac-datagrid-column-customizer') as any;
      customizer.bindDatagridApi({ datagridApi: this });
      this.datagrid.append(customizer);
    }
  }
}
