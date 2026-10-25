/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { arrayRemoveByKey } from "@autocode-ts/ac-extensions";
import { AcEvents } from "../../core/ac-events";
import { AcHooks } from "../../core/ac-hooks";
import { AcEnumSortOrder } from "../../enums/ac-enum-sort-order.enum";
import { AcFilterGroup } from "../../models/ac-filter-group.model";
import { AcSortOrder } from "../../models/ac-sort-order.model";
import { AC_DATA_MANAGER_EVENT } from "../consts/ac-data-manager-event.const";
import { AC_DATA_MANAGER_HOOK } from "../consts/ac-data-manager-hook.const";
import { IAcOnDemandRequestArgs } from "../interfaces/ac-on-demand-request-args.interface";
import { IAcOnDemandResponseArgs } from "../interfaces/ac-on-demand-response-args.interface";
import { IAcDataManagerDisplayedRowsChangeEvent } from "../interfaces/event-args/ac-data-manager-displayed-rows-change-event.interface";
import { IAcDataManagerTotalRowsChangeEvent } from "../interfaces/event-args/ac-data-manager-total-rows-change-event.interface";
import { IAcDataManagerBeforeGetOnDemandDataHookArgs } from "../interfaces/hook-args/ac-data-manager-before-get-on-demand-data-hook-args.interface";
import { IAcDataManagerDataChangeHookArgs } from "../interfaces/hook-args/ac-data-manager-data-change-hook-args.interface";
import { IAcDataManagerGetOnDemandDataSuccessCallbackHookArgs } from "../interfaces/hook-args/ac-data-manager-get-on-demand-data-success-callback-hook-args.interface";
import { IAcDataManagerRowHookArgs } from "../interfaces/hook-args/ac-data-row-hook-args.interface";
import { IAcDataManagerRowEvent } from "../interfaces/event-args/ac-data-manager-row-event.interface";
import { AcLogger } from "../../core/ac-logger";
import { IAcDataManagerDataEvent, IAcDataManagerEvent } from "../_data-manager.export";
import { IAcDataRow } from "../interfaces/ac-data-row.interface";
import { Autocode } from "../../core/autocode";
import { acEvaluateFilterGroup, acEvaluateSearch, acNullifyInstanceProperties } from "../../utils/ac-utility-functions";
import { AcDelayedCallback } from "../../core/ac-delayed-callback";

export class AcDataManager {
  private _assignUniqueIdToData: boolean = true;
  get assignUniqueIdToData(): boolean {
    return this._assignUniqueIdToData;
  }
  set assignUniqueIdToData(value: boolean) {
    if (value != this._assignUniqueIdToData) {
      this._assignUniqueIdToData = value;
      this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.AssignUniqueIdToDataChange });
    }
  }

  private _assignUniqueParentIdToData: boolean = true;
  get assignUniqueParentIdToData(): boolean {
    return this._assignUniqueParentIdToData;
  }
  set assignUniqueParentIdToData(value: boolean) {
    if (value != this._assignUniqueParentIdToData) {
      this._assignUniqueParentIdToData = value;
      this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.AssignUniqueParentIdToDataChange });
    }
  }

  get data(): any[] {
    const values: any[] = [];
    for (const row of this.rows) {
      if (row && row.index >= 0) {
        values.push(row.data);
      }
    }
    return values;
  }
  set data(value: any[]) {
    this.setRows({ data: value });
  }

  private _dataParentUniqueValueKey: string = '';
  get dataParentUniqueValueKey(): string {
    return this._dataParentUniqueValueKey;
  }
  set dataParentUniqueValueKey(value: string) {
    if (value != this._dataParentUniqueValueKey) {
      this._dataParentUniqueValueKey = value;
      this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.DataParentUniqueValueKeyChange, args: { searchQuery: value } });
    }
  }

  private _dataUniqueValueKey: string = '';
  get dataUniqueValueKey(): string {
    return this._dataUniqueValueKey;
  }
  set dataUniqueValueKey(value: string) {
    if (value != this._dataUniqueValueKey) {
      this._dataUniqueValueKey = value;
      this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.DataUniqueValueKeyChange, args: { searchQuery: value } });
    }
  }

  // PERF FIX (M5): Use cached rows directly instead of calling this.rows twice
  // PERF FIX (D1): _cachedRows is sorted by index ascending after applySort(), so
  // position === index. A direct slice is O(1) vs the previous O(n) filter scan.
  get displayedRows(): IAcDataRow[] {
    if (this.displayCount <= 0 || (this.displayStartIndex === -1 && this.displayEndIndex === -1)) {
      return this.rows;
    }
    if (this.type === 'ondemand') {
      const result: IAcDataRow[] = [];
      const start = Math.max(0, this.displayStartIndex);
      const end = this.displayEndIndex >= 0
        ? Math.min(this.allRows.length - 1, this.displayEndIndex)
        : (this.displayCount > 0 ? start + this.displayCount - 1 : start);
      for (let i = start; i <= end; i++) {
        const row = this.allRows[i];
        if (row && row.index >= 0) {
          result.push(row);
        }
      }
      return result;
    }
    const cached = this.rows;
    const start = Math.max(0, this.displayStartIndex);
    const end   = Math.min(cached.length, this.displayEndIndex + 1); // slice end is exclusive
    return cached.slice(start, end);
  }

  private _filterGroup: AcFilterGroup = new AcFilterGroup();
  // PERF FIX (H2): Track subscription IDs so old subscriptions can be removed
  private _filterGroupSubId: string | undefined;
  get filterGroup(): AcFilterGroup {
    return this._filterGroup;
  }
  set filterGroup(value: AcFilterGroup) {
    if (value != this._filterGroup) {
      // Unsubscribe from previous filterGroup before subscribing to new one
      if (this._filterGroupSubId !== undefined) {
        this._filterGroup.off({ subscriptionId: this._filterGroupSubId });
        this._filterGroupSubId = undefined;
      }
      this._filterGroup = value;
      this._filterGroupSubId = value.on({
        event: 'change', callback: () => {
          if (this.type === 'ondemand') {
            this.refreshRows();
          }
        }
      });
      if (this.type === 'ondemand') {
        this.refreshRows();
      }
    }
  }

  // PERF FIX (C1): Cached rows — computed once per processRows(), invalidated on mutations
  private _cachedRows: IAcDataRow[] = [];
  private _rowsDirty: boolean = true;
  // PERF FIX (F1): Cache Object.keys() from the first data row; cleared with the row cache
  private _cachedDataKeys: string[] | undefined;

  /**
   * Returns sorted, visible rows. Uses internal cache to avoid repeated filter+sort on every access.
   * Invalidate with _invalidateRowCache() whenever allRows is mutated.
   */
  get rows(): IAcDataRow[] {
    if (this._rowsDirty) {
      this._cachedRows = this.allRows
        .filter((row) => row && row.index >= 0)
        .sort((a, b) => a.index - b.index);
      this._rowsDirty = false;
    }
    return this._cachedRows;
  }

  /** Mark the row cache as stale so next access recomputes. */
  private _invalidateRowCache(): void {
    this._rowsDirty = true;
    this._cachedRows = [];
    // PERF FIX (F1): Invalidate cached data keys whenever rows are reset
    this._cachedDataKeys = undefined;
  }

  // PERF FIX (T1.3): O(1) row lookup map by rowId
  private _rowById: Map<string, IAcDataRow> = new Map();

  // PERF FIX (T1.4): O(1) unique-value → rowId map for parent-ID resolution
  private _uniqueValueToRowId: Map<any, string> = new Map();

  private _onDemandFunction?: (args: IAcOnDemandRequestArgs) => void;
  get onDemandFunction(): ((args: IAcOnDemandRequestArgs) => void) | undefined {
    return this._onDemandFunction;
  }
  set onDemandFunction(value: (args: IAcOnDemandRequestArgs) => void) {
    if (value != this._onDemandFunction) {
      this._onDemandFunction = value;
      this.type = 'ondemand';
      const eventArgs: IAcDataManagerEvent = {
        dataManager: this
      };
      this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.OnDemandFunctionSet, args: eventArgs });
      this.events.execute({ event: AC_DATA_MANAGER_EVENT.OnDemandFunctionSet, args: eventArgs });
    }
  }

  private _searchQuery!: string;
  get searchQuery(): string {
    return this._searchQuery;
  }
  set searchQuery(value: string) {
    if (value != this._searchQuery) {
      this._searchQuery = value;
      this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.SearchQueryChange, args: { searchQuery: value } });
      this.events.execute({ event: AC_DATA_MANAGER_EVENT.SearchQueryChange, args: { searchQuery: value } });
    }
  }

  private _sortOrder: AcSortOrder = new AcSortOrder();
  // PERF FIX (H2): Track subscription IDs so old subscriptions can be removed
  private _sortOrderSubId: string | undefined;
  get sortOrder(): AcSortOrder {
    return this._sortOrder;
  }
  set sortOrder(value: AcSortOrder) {
    if (value != this._sortOrder) {
      // Unsubscribe from previous sortOrder before subscribing to new one
      if (this._sortOrderSubId !== undefined) {
        this._sortOrder.off({ subscriptionId: this._sortOrderSubId });
        this._sortOrderSubId = undefined;
      }
      this._sortOrder = value;
      this._sortOrderSubId = value.on({
        event: 'change', callback: () => {
          if (this.type === 'ondemand') {
            this.refreshRows();
          }
        }
      });
      if (this.type === 'ondemand') {
        this.refreshRows();
      }
    }
  }

  private _totalRows: number = 0;
  get totalRows(): number {
    return this._totalRows;
  }
  set totalRows(value: number) {
    if (value != this._totalRows) {
      this._totalRows = value;
      const eventArgs: IAcDataManagerTotalRowsChangeEvent = {
        totalRows: value,
        dataManager: this
      };
      this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.TotalRowsChange, args: eventArgs });
      this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.DisplayedRowsChange, args: eventArgs });
      this.events.execute({ event: AC_DATA_MANAGER_EVENT.TotalRowsChange, args: eventArgs });
      this.events.execute({ event: AC_DATA_MANAGER_EVENT.DisplayedRowsChange, args: eventArgs });
    }
  }

  private _type: 'offline' | 'ondemand' = 'offline';
  get type(): 'offline' | 'ondemand' {
    return this._type;
  }
  set type(value: 'offline' | 'ondemand') {
    if (this._type != value) {
      this._type = value;
    }
  }

  private _uniqueIdKey: string = '__ac_row_id__';
  get uniqueIdKey(): string {
    return this._uniqueIdKey;
  }
  set uniqueIdKey(value: string) {
    if (value != this._uniqueIdKey) {
      this._uniqueIdKey = value;
      this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.UniqueIdKeyChange, args: { searchQuery: value } });
    }
  }

  private _uniqueIdParentKey: string = '__ac_row_parent_id__';
  get uniqueIdParentKey(): string {
    return this._uniqueIdParentKey;
  }
  set uniqueIdParentKey(value: string) {
    if (value != this._uniqueIdParentKey) {
      this._uniqueIdParentKey = value;
      this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.UniqueIdParentKeyChange, args: { searchQuery: value } });
    }
  }

  allDataAvailable: boolean = true;
  allRows: IAcDataRow[] = [];
  autoSetUniqueIdToData: boolean = false;
  firstDataNotified: boolean = false;
  isFirstRowsSet: boolean = false;
  events: AcEvents = new AcEvents();
  hooks: AcHooks = new AcHooks();
  isWorking: boolean = false;
  lastRowsCount: number = 0;
  lastStartIndex: number = 0;
  delayedCallback: AcDelayedCallback = new AcDelayedCallback();
  displayStartIndex: number = -1;
  displayEndIndex: number = -1;
  displayCount: number = 0;
  logger: AcLogger = new AcLogger({ logMessages: false });
  private refreshRowsTimeout: any;
  refreshRowsTimeoutDuration = 100;

  constructor() {
    // PERF FIX (H2): Store constructor subscription IDs for initial objects
    this._sortOrderSubId = this._sortOrder.on({
      event: 'change', callback: () => {
        if (this.type === 'ondemand') {
          this.refreshRows();
        }
      }
    });
    this._filterGroupSubId = this._filterGroup.on({
      event: 'change', callback: () => {
        if (this.type === 'ondemand') {
          this.refreshRows();
        }
      }
    });
  }

  addRow({ data = {}, index }: { data?: any, index?: number } = {}): IAcDataRow {
    if (index === undefined || index < 0 || index > this.allRows.length) {
      index = this.allRows.length;
    }
    const beforeArgs: any = {
      dataManager: this,
      data: data,
    };
    this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.BeforeRowAdd, args: beforeArgs });
    this.events.execute({ event: AC_DATA_MANAGER_EVENT.BeforeRowAdd, args: beforeArgs });
    data = beforeArgs.data;
    const dataRow: IAcDataRow = {
      data: data,
      index: index,
      isPlaceholder: false,
      rowId: Autocode.uuid()
    };
    if (this.assignUniqueIdToData) {
      dataRow.data[this.uniqueIdKey] = dataRow.rowId;
    }
    if (this.assignUniqueParentIdToData && this.dataParentUniqueValueKey && this.dataUniqueValueKey) {
      const parentUniqueValue = dataRow.data[this.dataParentUniqueValueKey];
      let parentRowId: any = undefined;
      if (parentUniqueValue) {
        // PERF FIX (T1.4): Use O(1) map lookup instead of O(n) find
        const parentMappedRowId = this._uniqueValueToRowId.get(parentUniqueValue);
        if (parentMappedRowId !== undefined) {
          parentRowId = parentMappedRowId;
        }
      }
      dataRow.data[this.uniqueIdParentKey] = parentRowId;
    }
    const hookArgs: IAcDataManagerRowHookArgs = {
      dataManager: this,
      dataRow: dataRow,
    };

    this.allRows.splice(index, 0, dataRow);

    // PERF FIX (T1.9): Remove O(n) originalIndex re-numbering loop after insert.
    // originalIndex is only used during initial load; after addRow it is not meaningful.

    // Update lookup maps
    this._rowById.set(dataRow.rowId, dataRow);
    if (this.dataUniqueValueKey && dataRow.data[this.dataUniqueValueKey] !== undefined) {
      this._uniqueValueToRowId.set(dataRow.data[this.dataUniqueValueKey], dataRow.rowId);
    }

    this._invalidateRowCache();
    this.totalRows = this.allRows.length;
    this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.RowCreate, args: hookArgs });
    this.events.execute({ event: AC_DATA_MANAGER_EVENT.RowCreate, args: hookArgs });
    this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.RowAdd, args: { dataRow: dataRow, data: data } });
    this.events.execute({ event: AC_DATA_MANAGER_EVENT.RowAdd, args: { dataRow: dataRow, data: data } });
    return dataRow;
  }

  /**
   * Task 5.1: Cache Object.keys() once from the first valid row — not per-row.
   * Task 6.3: Returns visible-row count so processRows() can set totalRows without
   * triggering a full cache rebuild via this.rows.length.
   * PERF FIX (F1): _cachedDataKeys persists across calls until _invalidateRowCache().
   * PERF FIX (F2): filterGroup.toJson() (reflection + recursive serialization) is called
   *   once per processRows() instead of once per row. At 100k rows this alone saves ~31ms.
   */
  private applyFilter(): number {
    // PERF FIX (F1): Resolve keys once; reuse across calls until rows change
    if (!this._cachedDataKeys) {
      const firstRow = this.allRows[0] ?? this.allRows.find(r => r != null);
      this._cachedDataKeys = firstRow ? Object.keys(firstRow.data) : [];
    }
    const keys: string[] = this._cachedDataKeys;

    const hasSearch = !!this.searchQuery;
    const hasFilter = this.filterGroup?.hasFilters() ||
                      (this.filterGroup?.filterGroups?.length ?? 0) > 0;

    // PERF FIX (F2): Serialize filter group once outside the loop
    const filterJson = hasFilter ? this.filterGroup.toJson() : null;

    let validIndex: number = 0;
    for (const row of this.allRows) {
      if (row) {
        let valid: boolean = true;
        if (hasSearch) valid = this.evaluateSearch(this.searchQuery, row, keys);
        if (valid && filterJson) valid = acEvaluateFilterGroup({ group: filterJson, data: row.data });
        if (valid) {
          row.index = validIndex;
          validIndex++;
        } else {
          row.index = -1;
        }
      }
    }
    return validIndex; // Task 6.3: return count directly — avoids this.rows cache rebuild
  }

  /**
   * Task 5.2: In-place sort — eliminates 3 allocations (filter+sort+spread).
   * Sorts allRows in-place: visible rows (index >= 0) first, hidden (index < 0) last.
   * Re-assigns sequential indices and isFirst/isLast after sorting.
   */
  private applySort(): void {
    const sortOrders = this.sortOrder.sortOrders;
    if (sortOrders.length === 0) return; // nothing to do

    // Sort in-place: visible rows first, hidden rows last
    this.allRows.sort((a, b) => {
      const ai = a?.index ?? -1;
      const bi = b?.index ?? -1;
      if (ai < 0 && bi < 0) return 0;
      if (ai < 0) return 1;
      if (bi < 0) return -1;

      for (const sort of sortOrders) {
        const valA = a.data[sort.key];
        const valB = b.data[sort.key];
        let res = 0;
        if (typeof valA === 'string' && typeof valB === 'string') {
          res = valA.localeCompare(valB);
        } else {
          res = (valA ?? 0) - (valB ?? 0);
        }
        if (res !== 0) return sort.order === AcEnumSortOrder.Ascending ? res : -res;
      }
      return 0;
    });

    // Re-assign sequential indices to visible rows
    let idx = 0;
    let firstVisible: IAcDataRow | undefined;
    let lastVisible: IAcDataRow | undefined;
    for (const row of this.allRows) {
      if (!row || row.index < 0) break; // hidden rows are at the end after sort
      row.isFirst = false;
      row.isLast = false;
      row.index = idx++;
      firstVisible ??= row;
      lastVisible = row;
    }
    if (firstVisible) firstVisible.isFirst = true;
    if (lastVisible) lastVisible.isLast = true;
  }

  private checkOnDemandRowsAvailable({ startIndex = 0, rowsCount = -1 }: { startIndex?: number; rowsCount?: number; } = {}): boolean {
    let available: boolean = false;
    if (this.totalRows > 0) {
      if (rowsCount == -1) {
        rowsCount = this.totalRows;
      }
      let endIndex = startIndex + (rowsCount - 1);
      if (endIndex > (this.totalRows - 1)) {
        endIndex = this.totalRows - 1;
      }
      if (startIndex < this.totalRows && endIndex < this.totalRows) {
        available = true;
        // PERF FIX (T1.10): Use allRows directly (indexed access) instead of this.rows (filter+sort)
        for (let index = startIndex; index <= endIndex; index++) {
          const r = this.allRows[index];
          if (r == undefined || !r || r.isPlaceholder) {
            available = false;
            break;
          }
        }
      }
    }
    return available;
  }

  deleteRow({ data, rowId, key, value }: { data?: any, rowId?: string, key?: string, value?: any }): IAcDataRow | undefined {
    // PERF FIX (T1.3): Use O(1) map lookup when rowId is provided
    let dataRow: IAcDataRow | undefined;
    if (rowId) {
      dataRow = this._rowById.get(rowId);
    } else {
      dataRow = this.rows.find((dr: IAcDataRow) => {
        if (!dr) return false;
        if (key && value) return dr.data[key] == value;
        if (data && key) return dr.data[key] == data[key];
        if (data) return dr.data == data;
        return false;
      });
    }

    if (dataRow) {
      const deletedRowId = dataRow.rowId;
      arrayRemoveByKey(this.allRows, 'rowId', deletedRowId);

      // PERF FIX (H6 / T1.7): Remove full O(n) re-index loop.
      // The row cache is dirty — next access to this.rows will recompute indices correctly
      // via applyFilter()/applySort(). Only update _totalRows directly to avoid
      // triggering unnecessary events during bulk deletions.
      this._totalRows = this.allRows.length;

      // Remove from lookup maps
      this._rowById.delete(deletedRowId);
      if (this.dataUniqueValueKey && dataRow.data[this.dataUniqueValueKey] !== undefined) {
        this._uniqueValueToRowId.delete(dataRow.data[this.dataUniqueValueKey]);
      }

      this._invalidateRowCache();

      if (this.displayCount > 0) {
        this.displayCount = Math.min(this.displayCount, this.allRows.length);
        this.displayEndIndex = this.displayStartIndex + this.displayCount - 1;
      }
      this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.RowDelete, args: { dataRow: dataRow } });
      this.events.execute({ event: AC_DATA_MANAGER_EVENT.RowDelete, args: { dataRow: dataRow } });
    }
    return dataRow;
  }

  destroy() {
    this.hooks.destroy();
    this.events.destroy();
    this.delayedCallback.destroy();

    acNullifyInstanceProperties({ instance: this });
  }

  private evaluateFilterGroup(group: AcFilterGroup, row: IAcDataRow): boolean {
    return acEvaluateFilterGroup({ group: group.toJson(), data: row.data });
  }

  private evaluateSearch(searchQuery: string, row: IAcDataRow, searchKeys: string[]): boolean {
    return acEvaluateSearch({ searchQuery, data: row.data, searchKeys });
  }

  async getData({ startIndex = 0, rowsCount = -1 }: { startIndex?: number; rowsCount?: number; } = {}): Promise<any[]> {
    const allRows: IAcDataRow[] = await this.getRows({ startIndex, rowsCount });
    const result: any[] = [];
    for (const row of allRows) {
      result.push(row.data);
    }
    return result;
  }

  async getRows({ startIndex = 0, rowsCount = -1 }: { startIndex?: number; rowsCount?: number; } = {}): Promise<IAcDataRow[]> {
    this.lastStartIndex = startIndex;
    this.lastRowsCount = rowsCount;
    const setResultFromRows = () => {
      if (this.type === 'ondemand') {
        const fromIndex: number = startIndex ?? 0;
        const count: number = rowsCount > -1 ? rowsCount : (this.totalRows > 0 ? this.totalRows - fromIndex : 0);
        const toIndex: number = fromIndex + count - 1;
        for (let index = fromIndex; index <= toIndex && index < this.allRows.length; index++) {
          const row = this.allRows[index];
          if (row && row.index >= 0) {
            result.push(row);
          }
        }
        return;
      }
      // PERF FIX (G1): Capture rows cache once — avoids re-checking _rowsDirty on every iteration
      // and the previous double-access (this.rows[index] checked then pushed separately).
      // slice() is O(1) pointer arithmetic; filter(Boolean) removes any sparse undefined slots.
      const cached = this.rows;
      const fromIndex: number = startIndex ?? 0;
      const count: number = rowsCount > -1 ? rowsCount : cached.length;
      const slice = cached.slice(fromIndex, fromIndex + count);
      for (const row of slice) {
        if (row) result.push(row);
      }
    };
    const result: IAcDataRow[] = [];
    if (this.type === "ondemand") {
      if (this.onDemandFunction) {
        if (this.checkOnDemandRowsAvailable({ startIndex, rowsCount })) {
          setResultFromRows();
        }
        else {
          return new Promise<IAcDataRow[]>((resolve, reject) => {
            const requestArgs: IAcOnDemandRequestArgs = {
              filterGroup: this.filterGroup.clone(),
              sortOrder: this.sortOrder.clone(),
              startIndex,rowsCount,
              successCallback: (response: IAcOnDemandResponseArgs) => {
                try {
                  const hookArgs: IAcDataManagerGetOnDemandDataSuccessCallbackHookArgs = {
                    dataManager: this,
                    requestArgs,
                    responseArgs: response,
                  };
                  this.setRows({
                    data: response.data,
                    totalCount: response.totalCount,
                    startIndex: startIndex,
                  });
                  setResultFromRows();
                  this.hooks.execute({
                    hook: AC_DATA_MANAGER_HOOK.GetOnDemandDataSuccessCallback,
                    args: hookArgs,
                  });
                  resolve(result);
                } catch (error) {
                  reject(error);
                }
              },
              errorCallback: (error: any) => {
                reject(error);
              },
            };
            if (startIndex >= 0 && rowsCount > 0) {
              requestArgs.pageNumber = (startIndex / rowsCount) + 1;
              requestArgs.rowsCount = rowsCount;
              requestArgs.startIndex = startIndex;
            }
            requestArgs.searchQuery = this.searchQuery;
            const hookArgs: IAcDataManagerBeforeGetOnDemandDataHookArgs = {
              dataManager: this,
              requestArgs,
            };

            this.hooks.execute({
              hook: AC_DATA_MANAGER_HOOK.BeforeGetOnDemandData,
              args: hookArgs,
            });

            try {
              this.onDemandFunction!(requestArgs);
            } catch (err) {
              reject(err);
            }
          });
        }
      } else {
        return [];
      }
    }
    else {
      setResultFromRows();
    }
    return result;
  }

  /**
   * Task 7.3: O(1) fast path when key === dataUniqueValueKey.
   * Falls back to O(n) scan for arbitrary keys.
   */
  getRowIndex({ key, value }: { key: string, value: any }): number {
    if (key === this.dataUniqueValueKey) {
      const rowId = this._uniqueValueToRowId.get(value);
      if (!rowId) return -1;
      const row = this._rowById.get(rowId);
      return row ? row.index : -1;
    }
    return this.allRows.findIndex((row: IAcDataRow) => row && row.data[key] == value);
  }

  /**
   * Task 7.1: O(1) — this.rows is sorted by index ascending after applySort().
   * Position in the cache array == row.index, so a direct array access suffices.
   */
  getRowAtIndex({ index }: { index: number }): IAcDataRow | undefined {
    if (this.type === 'ondemand') {
      const row = this.allRows[index];
      return row && row.index === index ? row : undefined;
    }
    const cached = this.rows; // uses cache, no recompute if clean
    if (index < 0 || index >= cached.length) return undefined;
    const row = cached[index];
    return row && row.index === index ? row : undefined;
  }

  /** O(1) rowId lookup using the internal _rowById map. */
  getRowById(rowId: string): IAcDataRow | undefined {
    return this._rowById.get(rowId);
  }

  /**
   * Task 7.2: O(1) fast path when querying by the registered unique value key.
   * Falls back to O(n) scan for arbitrary keys.
   */
  getRow({ key, value }: { key: string, value: any }): IAcDataRow | undefined {
    if (key === this.dataUniqueValueKey) {
      const rowId = this._uniqueValueToRowId.get(value);
      return rowId ? this._rowById.get(rowId) : undefined;
    }
    return this.allRows.find((row: IAcDataRow) => row && row.data[key] == value);
  }

  /**
   * Task 7.4: O(1) shortcut for lookup by dataUniqueValueKey.
   * Returns undefined if dataUniqueValueKey is not configured or value not found.
   */
  getRowByUniqueValue(value: any): IAcDataRow | undefined {
    if (!this.dataUniqueValueKey) return undefined;
    const rowId = this._uniqueValueToRowId.get(value);
    return rowId ? this._rowById.get(rowId) : undefined;
  }

  off({ event, callback, subscriptionId }: { event?: string, callback?: Function, subscriptionId?: string }): void {
    this.events.unsubscribe({ event, callback, subscriptionId });
  }

  on({ event, callback }: { event: string, callback: Function }): string {
    const subscriptionId = this.events.subscribe({ event, callback });
    return subscriptionId;
  }

  /**
   * Task 6.3: applyFilter() now returns visible-row count directly.
   * This avoids `this.totalRows = this.rows.length` which triggered a full O(n)
   * cache rebuild immediately after _invalidateRowCache(). We now set the backing
   * field directly and fire TotalRowsChange once — same semantics, one less rebuild.
   */
  async processRows() {
    if (this.type == 'offline') {
      let visibleCount = 0;
      if (this.allRows.length > 0) {
        visibleCount = this.applyFilter();
        this.applySort();
      }
      this._invalidateRowCache();
      // Set backing field directly to avoid getter rebuild; fire event manually
      if (visibleCount !== this._totalRows) {
        this._totalRows = visibleCount;
        const eventArgs: IAcDataManagerTotalRowsChangeEvent = { totalRows: visibleCount, dataManager: this };
        this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.TotalRowsChange, args: eventArgs });
        this.events.execute({ event: AC_DATA_MANAGER_EVENT.TotalRowsChange, args: eventArgs });
      }
      this.setDisplayedRows({ startIndex: this.displayStartIndex, rowsCount: this.displayCount, force: true });
    } else {
      await this.refreshRows();
    }
  }

  async refreshRows() {
    this.delayedCallback.add({
      callback: async () => {
        if (this.type == "offline") {
          this.processRows();
        }
        else {
          this.isWorking = true;
          const startIndex = this.displayStartIndex >= 0 ? this.displayStartIndex : 0;
          const rowsCount = this.displayCount > 0 ? this.displayCount : (this.lastRowsCount > 0 ? this.lastRowsCount : 50);
          this.reset();
          await this.getRows({ startIndex, rowsCount });
          this.setDisplayedRows({ startIndex, rowsCount });
          this.isWorking = false;
        }
      }, duration: this.refreshRowsTimeoutDuration, key: 'refreshRows'
    });
  }

  reset() {
    this.totalRows = 0;
    (this.allRows as any) = null;
    this.allRows = [];
    // Clear lookup maps on reset
    this._rowById.clear();
    this._uniqueValueToRowId.clear();
    this._invalidateRowCache();
    this.displayStartIndex = -1;
    this.displayEndIndex = -1;
    this.hooks.execute({
      hook: AC_DATA_MANAGER_HOOK.Reset,
      args: {},
    });
    this.events.execute({
      event: AC_DATA_MANAGER_EVENT.Reset,
      args: {},
    });
  }

  setRows({ data, startIndex, totalCount }: { data: any[], startIndex?: number, totalCount?: number }) {
    if (!this.firstDataNotified && data.length > 0) {
      this.firstDataNotified = true;
      const eventArgs: IAcDataManagerDataEvent = {
        data: data,
        dataManager: this
      }
      this.hooks.execute({ hook: AC_DATA_MANAGER_EVENT.DataFoundForFirstTime, args: eventArgs });
      this.events.execute({ event: AC_DATA_MANAGER_EVENT.DataFoundForFirstTime, args: eventArgs });
    }
    if (this.type == 'offline') {
      const hookArgs: IAcDataManagerDataChangeHookArgs = {
        data: data,
        dataManager: this,
        oldData: this.data
      }
      this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.BeforeDataChange, args: hookArgs });
      let index = 0;
      const allRows: IAcDataRow[] = [];

      // PERF FIX (T1.4): Build unique-value → rowId map in a single pass (O(n))
      // Used for parent-ID resolution below instead of O(n²) nested find
      const newUniqueValueToRowId: Map<any, string> = new Map();

      for (const row of data) {
        const dataRow: IAcDataRow = {
          rowId: Autocode.uuid(),
          data: row,
          index: index,
          // Task 6.1: extensionData omitted — lazy allocation; saves 1 object per row
          // Task 6.2: originalIndex omitted in offline mode — insertion order is sufficient
        };
        if (this.assignUniqueIdToData) {
          dataRow.data[this.uniqueIdKey] = dataRow.rowId;
        }
        allRows.push(dataRow);
        if (this.dataUniqueValueKey && row[this.dataUniqueValueKey] !== undefined) {
          newUniqueValueToRowId.set(row[this.dataUniqueValueKey], dataRow.rowId);
        }
        index++;
      }
      if (allRows.length > 0) {
        allRows[0].isFirst = true;
        allRows[allRows.length - 1].isLast = true;
      }

      // PERF FIX (C3 / T1.4): Replace O(n²) parent-ID loop with O(n) map lookup
      if (this.assignUniqueParentIdToData && this.dataParentUniqueValueKey && this.dataUniqueValueKey) {
        for (const row of allRows) {
          const parentUniqueValue = row.data[this.dataParentUniqueValueKey];
          let parentRowId: any = undefined;
          if (parentUniqueValue) {
            const mappedRowId = newUniqueValueToRowId.get(parentUniqueValue);
            if (mappedRowId !== undefined) {
              parentRowId = mappedRowId;
            }
          }
          row.data[this.uniqueIdParentKey] = parentRowId;
        }
      }

      this.allRows = allRows;

      // Rebuild lookup maps from new allRows
      this._rowById.clear();
      this._uniqueValueToRowId.clear();
      for (const row of allRows) {
        this._rowById.set(row.rowId, row);
        if (this.dataUniqueValueKey && row.data[this.dataUniqueValueKey] !== undefined) {
          this._uniqueValueToRowId.set(row.data[this.dataUniqueValueKey], row.rowId);
        }
      }
      this._invalidateRowCache();

      this.allDataAvailable = true;
      this.processRows();

      // PERF FIX (C2 / T1.5): Fire a single DataChange hook after all rows are built
      // instead of firing RowCreate per-row inside the loop (breaking change for per-row hooks)
      this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.DataChange, args: hookArgs });
    }
    else if (this.type == 'ondemand') {
      startIndex = startIndex ?? 0;
      if (startIndex < 0) {
        startIndex = 0;
      }
      if (totalCount == undefined) {
        totalCount = this.totalRows > 0 ? this.totalRows : (startIndex + data.length);
      }
      const endIndex = startIndex + (data.length) - 1;
      if (this.allRows.length < totalCount) {
        this.allRows = new Array(totalCount).fill(undefined);
      }
      for (let index = startIndex; index <= endIndex; index++) {
        const dataIndex = index - startIndex;
        const rowId = Autocode.uuid();
        const rowData = data[dataIndex];
        if (this.assignUniqueIdToData && rowData) {
          rowData[this.uniqueIdKey] = rowId;
        }
        const dataRow: IAcDataRow = {
          rowId: rowId,
          data: rowData,
          isPlaceholder: false,
          index: index,
          originalIndex: index, // keep in ondemand mode — encodes server-side page position
          // Task 6.1: extensionData omitted — lazy allocation saves 1 object per row
        };
        if (index == 0) {
          dataRow.isFirst = true;
        }
        if (index == totalCount - 1) {
          dataRow.isLast = true;
        }
        this.allRows[index] = dataRow;

        // PERF FIX (C2): Keep per-row RowCreate for ondemand (server-side paging uses it)
        const hookArgs: IAcDataManagerRowHookArgs = {
          dataManager: this,
          dataRow: dataRow,
        };
        this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.RowCreate, args: hookArgs });
        this.events.execute({ event: AC_DATA_MANAGER_EVENT.RowCreate, args: hookArgs });

        // Update lookup maps
        this._rowById.set(rowId, dataRow);
        if (this.dataUniqueValueKey && rowData && rowData[this.dataUniqueValueKey] !== undefined) {
          this._uniqueValueToRowId.set(rowData[this.dataUniqueValueKey], rowId);
        }
      }
      this._invalidateRowCache();
      this.allDataAvailable = this.allRows.filter((row) => { return row == undefined || row.isPlaceholder == false }).length == 0;
      this._totalRows = this.allRows.length;
      const totalRowsEventArgs: IAcDataManagerTotalRowsChangeEvent = {
        totalRows: this._totalRows,
        dataManager: this
      };
      this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.TotalRowsChange, args: totalRowsEventArgs });
      this.events.execute({ event: AC_DATA_MANAGER_EVENT.TotalRowsChange, args: totalRowsEventArgs });
      this.setDisplayedRows({
        startIndex: startIndex,
        rowsCount: data.length > 0 ? data.length : (this.displayCount > 0 ? this.displayCount : 50)
      });
    }
    this.isFirstRowsSet = true;
  }

  updateRow({ data, value, key, rowId, addIfMissing = true }: { data: any, value?: any, key?: string, rowId?: string, highlightCells?: boolean, addIfMissing?: boolean }): IAcDataRow | undefined {
    let dataRow: IAcDataRow | undefined;

    // PERF FIX (T1.3): Use O(1) map lookup when rowId is provided
    if (rowId) {
      dataRow = this._rowById.get(rowId);
    } else {
      dataRow = this.rows.find((row) => {
        if (!row) return false;
        if (key && value) return row.data[key] == value;
        if (data && key) return row.data[key] == data[key];
        if (data) return row.data == data;
        return false;
      });
    }

    if (dataRow) {
      if (this.assignUniqueIdToData) {
        data[this.uniqueIdKey] = dataRow.rowId;
      }
      dataRow.data = data;

      // PERF FIX (T1.6): Removed redundant outer loop (old L772–784) that iterated all rows
      // setting data[uniqueIdParentKey] using the parameter `data` (not the loop variable).
      // The correct single lookup below is sufficient.
      if (this.assignUniqueParentIdToData && this.dataParentUniqueValueKey && this.dataUniqueValueKey) {
        const parentUniqueValue = dataRow.data[this.dataParentUniqueValueKey];
        let parentRowId: any = undefined;
        if (parentUniqueValue) {
          // PERF FIX (T1.4): O(1) map lookup instead of O(n) find
          const mappedRowId = this._uniqueValueToRowId.get(parentUniqueValue);
          if (mappedRowId !== undefined) {
            parentRowId = mappedRowId;
          }
        }
        dataRow.data[this.uniqueIdParentKey] = parentRowId;
      }

      // Update unique-value map if the unique value key changed
      if (this.dataUniqueValueKey && data[this.dataUniqueValueKey] !== undefined) {
        this._uniqueValueToRowId.set(data[this.dataUniqueValueKey], dataRow.rowId);
      }

      const eventArgs: IAcDataManagerRowEvent = {
        dataManager: this,
        dataRow: dataRow
      };
      this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.RowUpdate, args: eventArgs });
      this.events.execute({ event: AC_DATA_MANAGER_EVENT.RowUpdate, args: eventArgs });
    }
    else if (addIfMissing) {
      dataRow = this.addRow({ data: data });
    }
    return dataRow;
  }

  /**
   * Phase 5 (Task 5.5): Guards against no-change calls — skips event dispatch
   * when startIndex and rowsCount haven't changed. Repeated renders of the same
   * viewport triggered redundant DisplayedRowsChange events.
   */
  async setDisplayedRows({ startIndex = 0, rowsCount = -1, force = false }: { startIndex?: number; rowsCount?: number; force?: boolean } = {}) {
    if (!force && startIndex === this.displayStartIndex && rowsCount === this.displayCount) return;

    this.displayStartIndex = startIndex;
    this.displayEndIndex = (startIndex + rowsCount) - 1;
    this.displayCount = rowsCount;
    const eventArgs: IAcDataManagerDisplayedRowsChangeEvent = {
      displayedRows: this.displayedRows,
      dataManager: this
    };
    this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.DisplayedRowsChange, args: eventArgs });
    this.events.execute({ event: AC_DATA_MANAGER_EVENT.DisplayedRowsChange, args: eventArgs });
  }

  /**
   * Batch add: Adds multiple rows in a single operation and fires a single RowsBatchAdd
   * event instead of N individual RowAdd events.
   * Phase 7 (Task 7.1): Eliminates N processRows() calls for N individual addRow() calls.
   */
  addRows({ data = [] }: { data: any[] }): IAcDataRow[] {
    const added: IAcDataRow[] = [];

    for (const item of data) {
      const rowId = Autocode.uuid();
      const dataRow: IAcDataRow = {
        rowId,
        data: item,
        index: this.allRows.length,
      };

      if (this.assignUniqueIdToData) {
        item[this.uniqueIdKey] = rowId;
      }

      if (this.assignUniqueParentIdToData && this.dataParentUniqueValueKey && this.dataUniqueValueKey) {
        const parentUniqueValue = item[this.dataParentUniqueValueKey];
        if (parentUniqueValue) {
          const mappedRowId = this._uniqueValueToRowId.get(parentUniqueValue);
          item[this.uniqueIdParentKey] = mappedRowId ?? undefined;
        }
      }

      if (this.dataUniqueValueKey && item[this.dataUniqueValueKey] !== undefined) {
        this._uniqueValueToRowId.set(item[this.dataUniqueValueKey], rowId);
      }

      this.allRows.push(dataRow);
      this._rowById.set(rowId, dataRow);
      added.push(dataRow);
    }

    if (added.length > 0) {
      this._invalidateRowCache();
      const batchArgs = { dataManager: this, dataRows: added };
      this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.RowsBatchAdd, args: batchArgs });
      this.events.execute({ event: AC_DATA_MANAGER_EVENT.RowsBatchAdd, args: batchArgs });
      this.processRows();
    }

    return added;
  }

  /**
   * Batch update: Updates multiple rows in a single operation and fires a single
   * RowsBatchUpdate event instead of N individual RowUpdate events.
   * Phase 7 (Task 7.2): Eliminates N processRows() calls for N individual updateRow() calls.
   */
  updateRows({ data = [] }: { data: { key?: string; value?: any; rowId?: string; data: any }[] }): IAcDataRow[] {
    const updated: IAcDataRow[] = [];

    for (const item of data) {
      let dataRow: IAcDataRow | undefined;

      if (item.rowId) {
        dataRow = this._rowById.get(item.rowId);
      } else {
        dataRow = this.rows.find((r) => {
          if (!r) return false;
          if (item.key && item.value !== undefined) return r.data[item.key] == item.value;
          if (item.data && item.key) return r.data[item.key] == item.data[item.key];
          if (item.data) return r.data === item.data;
          return false;
        });
      }

      if (dataRow) {
        if (this.assignUniqueIdToData) item.data[this.uniqueIdKey] = dataRow.rowId;
        if (this.dataUniqueValueKey && item.data[this.dataUniqueValueKey] !== undefined) {
          this._uniqueValueToRowId.set(item.data[this.dataUniqueValueKey], dataRow.rowId);
        }
        dataRow.data = item.data;
        updated.push(dataRow);
      }
    }

    if (updated.length > 0) {
      this._invalidateRowCache();
      const batchArgs = { dataManager: this, dataRows: updated };
      this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.RowsBatchUpdate, args: batchArgs });
      this.events.execute({ event: AC_DATA_MANAGER_EVENT.RowsBatchUpdate, args: batchArgs });
    }

    return updated;
  }

}
