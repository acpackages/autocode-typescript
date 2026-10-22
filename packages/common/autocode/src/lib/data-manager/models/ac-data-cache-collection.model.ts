/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AcEvents } from "../../core/ac-events";
import { AcHooks } from "../../core/ac-hooks";
import { AcEnumConditionOperator } from "../../enums/ac-enum-condition-operator.enum";
import { AcEnumLogicalOperator } from "../../enums/ac-enum-logical-operator.enum";
import { AcEnumSortOrder } from "../../enums/ac-enum-sort-order.enum";
import { IAcFilter, IAcFilterGroup, IAcSortOrder } from "../../interfaces/_interfaces.export";
import { acNullifyInstanceProperties } from "../../utils/ac-utility-functions";
import { AcDataCache } from "../core/ac-data-cache";
import { IAcDataCacheGetResult } from "../interfaces/ac-data-cache-get-result.interface";

export class AcDataCacheCollection {

  private dataChangeCallback: Function = (args: any) => {
    this.notifyRowDataChange();
  };

  private _rows: any[] = [];

  // Phase 5 (Task 5.7) / Phase 8 (Tasks 8.3, 8.4):
  // O(1) lookup index: uniqueRowKey value → row reference.
  // Kept in sync on every mutation (addRow, deleteRow, updateRow, rows setter).
  private _rowIndex: Map<any, any> = new Map();

  // Cached field keys from the first row — avoids Object.keys() on every getRows() call.
  private _cachedKeys: string[] | undefined;

  get rows(): any[] {
    return this._rows;
  }
  set rows(value: any[]) {
    if (value !== this._rows) {
      this._rows = value;
      this._rebuildIndex();
    }
  }

  autoSetUniqueIdToData: boolean = false;
  dataCache!: AcDataCache;
  name: string = "";
  events: AcEvents = new AcEvents();
  extensionData: Record<string, any> = {};
  hooks: AcHooks = new AcHooks();
  uniqueRowKey: string;

  constructor({ name, rows = [], dataCache, uniqueRowKey = '__ac_row_id__', autoSetUniqueIdToData = false }: {
    name: string;
    rows?: any;
    dataCache: AcDataCache;
    uniqueRowKey?: string;
    autoSetUniqueIdToData?: boolean;
  }) {
    this.autoSetUniqueIdToData = autoSetUniqueIdToData;
    this.uniqueRowKey = uniqueRowKey;
    this.rows = rows;
    this.name = name;
    this.dataCache = dataCache;
  }

  /**
   * Rebuilds the entire _rowIndex from _rows.
   * Called when rows is set via the setter (full replace).
   * Individual mutations (addRow, deleteRow, updateRow) update the index incrementally.
   */
  private _rebuildIndex(): void {
    this._rowIndex.clear();
    this._cachedKeys = undefined;
    for (const r of this._rows) {
      if (r != null && r[this.uniqueRowKey] != null) {
        this._rowIndex.set(r[this.uniqueRowKey], r);
      }
    }
  }

  /**
   * Appends a row and incrementally updates the index.
   * Phase 8 (Task 8.3): Bypasses the rows setter to avoid a full O(n) index rebuild per call.
   */
  addRow({ data }: { data: any }): any {
    this._rows.push(data);
    // Incremental index update — no full rebuild
    if (data != null && data[this.uniqueRowKey] != null) {
      this._rowIndex.set(data[this.uniqueRowKey], data);
    }
    this._cachedKeys = undefined;
    return data;
  }

  /**
   * Deletes a row. Uses _rowIndex for O(1) lookup when rowId or unique key is provided.
   * Phase 5 (Task 5.7) / Phase 8 (Task 8.3): Index-aware deletion.
   */
  deleteRow({ key, value, rowId, data }: { key?: string; value?: any; rowId?: string; data?: any }): any | undefined {
    let targetRow: any | undefined;

    if (rowId !== undefined) {
      // O(1) via index
      targetRow = this._rowIndex.get(rowId);
    } else if (key === this.uniqueRowKey && value !== undefined) {
      // O(1) via index for unique key queries
      targetRow = this._rowIndex.get(value);
    } else if (key && value !== undefined) {
      // O(n) for non-unique key
      targetRow = this._rows.find((r: any) => r[key!] === value);
    } else if (data) {
      targetRow = this._rows.find((r: any) => r === data);
    }

    if (targetRow) {
      const index = this._rows.indexOf(targetRow);
      if (index >= 0) {
        this._rows.splice(index, 1);
      }
      const uniqueVal = targetRow[this.uniqueRowKey];
      if (uniqueVal != null) {
        this._rowIndex.delete(uniqueVal);
      }
      return targetRow;
    }
    return undefined;
  }

  destroy() {
    this.hooks.destroy();
    this.events.destroy();
    acNullifyInstanceProperties({ instance: this });
  }

  private evaluateFilter({ filter, row }: { filter: IAcFilter, row: any }): boolean {
    const field = filter.key;
    if (!field) return true;

    const value = row[field];
    const filterValue = filter.value;
    const op = filter.operator;

    const normalize = (v: any): any => typeof v === "string" ? v.toLowerCase().trim() : v;

    switch (op) {
      case AcEnumConditionOperator.EqualTo:
        return normalize(value) == normalize(filterValue);
      case AcEnumConditionOperator.NotEqualTo:
        return normalize(value) != normalize(filterValue);
      case AcEnumConditionOperator.GreaterThan:
        return Number(value) > Number(filterValue);
      case AcEnumConditionOperator.GreaterThanEqualTo:
        return Number(value) >= Number(filterValue);
      case AcEnumConditionOperator.LessThan:
        return Number(value) < Number(filterValue);
      case AcEnumConditionOperator.LessThanEqualTo:
        return Number(value) <= Number(filterValue);
      case AcEnumConditionOperator.Contains:
        return value != null && filterValue != null && value.toString().toLowerCase().includes(filterValue.toString().toLowerCase());
      case AcEnumConditionOperator.NotContains:
        return value == null || filterValue == null || !value.toString().toLowerCase().includes(filterValue.toString().toLowerCase());
      case AcEnumConditionOperator.StartsWith:
        return value != null && filterValue != null && value.toString().toLowerCase().startsWith(filterValue.toString().toLowerCase());
      case AcEnumConditionOperator.EndsWith:
        return value != null && filterValue != null && value.toString().toLowerCase().endsWith(filterValue.toString().toLowerCase());
      case AcEnumConditionOperator.In:
        return Array.isArray(filterValue) ? filterValue.map(normalize).includes(normalize(value)) : false;
      case AcEnumConditionOperator.NotIn:
        return Array.isArray(filterValue) ? !filterValue.map(normalize).includes(normalize(value)) : true;
      case AcEnumConditionOperator.Between:
        if (!Array.isArray(filterValue) || filterValue.length !== 2) {
          return true;
        } else {
          const [min, max] = filterValue;
          if (min == null || min === "" || max == null || max === "" || value == null) {
            return true;
          }
          const valNum = Number(value);
          const minNum = Number(min);
          const maxNum = Number(max);
          if (!isNaN(valNum) && !isNaN(minNum) && !isNaN(maxNum)) {
            return valNum >= minNum && valNum <= maxNum;
          }
          const valDate = Date.parse(value);
          const minDate = Date.parse(min);
          const maxDate = Date.parse(max);
          if (!isNaN(valDate) && !isNaN(minDate) && !isNaN(maxDate)) {
            return valDate >= minDate && valDate <= maxDate;
          }
          return value >= min && value <= max;
        }
      case AcEnumConditionOperator.IsNull:
        return value === null || value === undefined;
      case AcEnumConditionOperator.IsNotNull:
        return value !== null && value !== undefined;
      case AcEnumConditionOperator.IsEmpty:
        return value === null || value === undefined || value === "";
      case AcEnumConditionOperator.IsNotEmpty:
        return value !== null && value !== undefined && value !== "";
      default:
        return true;
    }
  }

  private evaluateFilterGroup({ filterGroup, row }: { filterGroup: IAcFilterGroup, row: any }): boolean {
    if ((filterGroup.filters && filterGroup.filters.length === 0) && (filterGroup.filterGroups && filterGroup.filterGroups.length === 0)) return true;

    const results: boolean[] = [];

    if (filterGroup.filters) {
      for (const filter of filterGroup.filters) {
        results.push(this.evaluateFilter({ filter, row }));
      }
    }

    if (filterGroup.filterGroups) {
      for (const subGroup of filterGroup.filterGroups) {
        results.push(this.evaluateFilterGroup({ filterGroup: subGroup, row }));
      }
    }

    return filterGroup.operator === AcEnumLogicalOperator.Or ? results.some(Boolean) : results.every(Boolean);
  }

  private evaluateSearch(searchQuery: string, row: any, searchKeys: string[]): boolean {
    if (!searchQuery) return true;
    return searchKeys.some(field => {
      const value = row[field];
      return value != null && value.toString().toLowerCase().includes(searchQuery.toLowerCase());
    });
  }

  /**
   * Returns filtered, sorted, and paginated rows.
   * Phase 5 (Task 5.7):
   *  - Removed upfront [...this.rows] spread (was copying entire dataset before any filtering)
   *  - Cached key list to avoid Object.keys() on every call
   *  - Guard on empty rows before Object.keys()
   */
  async getRows({ filters, sort, searchQuery, startIndex, rowsCount, endIndex, pageNumber, pageSize }: {
    filters?: IAcFilterGroup;
    sort?: IAcSortOrder;
    searchQuery?: string;
    startIndex?: number;
    rowsCount?: number;
    endIndex?: number;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<IAcDataCacheGetResult> {
    startIndex = startIndex ?? 0;
    rowsCount = rowsCount ?? -1;
    if (pageNumber !== undefined && pageSize !== undefined) {
      startIndex = (pageNumber - 1) * pageSize;
      rowsCount = pageSize;
    } else if (endIndex !== undefined) {
      rowsCount = endIndex! - startIndex + 1;
    }
    if (rowsCount === -1) rowsCount = Infinity;

    // Phase 5 (Task 5.7): No upfront spread — operate on _rows directly.
    // Each filter() creates a new array only when actually needed.
    let filteredRows: any[] = this._rows;

    if (searchQuery && filteredRows.length > 0) {
      // Cache keys from first row; invalidated when rows change
      const keys = this._cachedKeys ??= Object.keys(filteredRows[0]);
      const q = searchQuery.toLowerCase();
      filteredRows = filteredRows.filter((row: any) => this.evaluateSearch(q, row, keys));
    }

    if (filters) {
      const hasFilters = (filters.filters && filters.filters.length > 0) || (filters.filterGroups && filters.filterGroups.length > 0);
      if (hasFilters) {
        filteredRows = filteredRows.filter((row: any) => this.evaluateFilterGroup({ filterGroup: filters, row }));
      }
    }

    if (sort) {
      if (sort.sortOrders.length > 0) {
        filteredRows.sort((a: any, b: any): number => {
          for (const sortDetails of sort.sortOrders) {
            const valA = a[sortDetails.key];
            const valB = b[sortDetails.key];
            let result = 0;
            if (valA == null && valB == null) {
              result = 0;
            } else if (valA == null) {
              result = -1;
            } else if (valB == null) {
              result = 1;
            } else if (typeof valA === "string" && typeof valB === "string") {
              result = valA.localeCompare(valB);
            } else {
              result = Number(valA) - Number(valB);
            }
            if (result !== 0) {
              return sortDetails.order === AcEnumSortOrder.Ascending ? result : -result;
            }
          }
          return 0;
        });
      }
    }

    const total = filteredRows.length;
    if (rowsCount === Infinity) {
      return { rows: filteredRows, totalCount: total };
    }
    endIndex = Math.min(startIndex + rowsCount, total);
    const rows = filteredRows.slice(startIndex, endIndex);
    return { rows, totalCount: total };
  }

  notifyRowDataChange() {
    // Reserved for future use
  }

  off({ event, callback, subscriptionId }: { event?: string, callback?: Function, subscriptionId?: string }): void {
    this.events.unsubscribe({ event, callback, subscriptionId });
  }

  on({ event, callback }: { event: string, callback: Function }): string {
    return this.events.subscribe({ event, callback });
  }

  /**
   * Updates a row in-place. Uses _rowIndex for O(1) lookup by rowId or unique key.
   * Phase 8 (Task 8.4): Index-aware update — handles unique key value changes.
   */
  updateRow({ key, value, rowId, data, addIfMissing = true }: {
    key?: string;
    value?: any;
    rowId?: string;
    data?: any;
    addIfMissing?: boolean;
  }): any | undefined {
    let targetRow: any | undefined;

    if (rowId !== undefined) {
      // O(1) via index
      targetRow = this._rowIndex.get(rowId);
    } else if (key === this.uniqueRowKey && value !== undefined) {
      // O(1) via index for unique key queries
      targetRow = this._rowIndex.get(value);
    } else if (key && value !== undefined) {
      targetRow = this._rows.find((r: any) => r[key!] === value); // O(n) for non-unique key
    } else if (data) {
      targetRow = this._rows.find((r: any) => r === data); // reference equality
    }

    if (targetRow) {
      // Track unique key before mutation — if it changes, update index
      const oldUniqueVal = targetRow[this.uniqueRowKey];
      Object.assign(targetRow, data);
      const newUniqueVal = targetRow[this.uniqueRowKey];

      if (oldUniqueVal !== newUniqueVal) {
        if (oldUniqueVal != null) this._rowIndex.delete(oldUniqueVal);
        if (newUniqueVal != null) this._rowIndex.set(newUniqueVal, targetRow);
      }

      return targetRow;
    } else if (addIfMissing) {
      return this.addRow({ data });
    }
    return undefined;
  }
}
