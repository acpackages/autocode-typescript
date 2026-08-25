/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-inferrable-types */

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
  get rows(): any[] {
    return this._rows;
  }
  set rows(value: any[]) {
    if (value != this._rows) {
      this._rows = value;
    }
  }

  autoSetUniqueIdToData: boolean = false;
  dataCache!: AcDataCache;
  name: string = "";
  events: AcEvents = new AcEvents();
  extensionData: Record<string, any> = {};
  hooks: AcHooks = new AcHooks();
  uniqueRowKey: string;

  constructor({ name, rows = [], dataCache,uniqueRowKey = '__ac_row_id__',autoSetUniqueIdToData = false}: { name: string, rows?: any, dataCache: AcDataCache,uniqueRowKey?:string;autoSetUniqueIdToData?:boolean }) {
    this.autoSetUniqueIdToData = autoSetUniqueIdToData;
    this.uniqueRowKey = uniqueRowKey;
    this.rows = rows;
    this.name = name;
    this.dataCache = dataCache;
  }

  addRow({ data }: { data: any }): any {
    this.rows.push(data);
    return data;
  }

  deleteRow({ key, value, rowId, data }: { key?: string; value?: any; rowId?: string; data?: any }): any | undefined {
    let targetRow: any | undefined;
    if (rowId !== undefined) {
      targetRow = this._rows.find((r: any) => r.rowId === rowId);
    } else if (key && value !== undefined) {
      targetRow = this._rows.find((r: any) => r[key!] === value);
    } else if (data) {
      targetRow = this._rows.find((r: any) => r === data);
    }

    if (targetRow) {
      const index = this._rows.indexOf(targetRow);
      this._rows.splice(index, 1);
      return targetRow;
    }
    return undefined;
  }

  destroy(){
    this.hooks.destroy();

    this.events.destroy();

    acNullifyInstanceProperties({instance:this});
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
        }
        else {
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

    if(filterGroup.filters){
      for (const filter of filterGroup.filters) {
        results.push(this.evaluateFilter({ filter, row }));
      }
    }

    if(filterGroup.filterGroups){
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

    let filteredRows = [...this.rows];

    if (searchQuery) {
      const keys = Object.keys(filteredRows[0]);
      filteredRows = filteredRows.filter((row: any) => this.evaluateSearch(searchQuery, row, keys));
    }

    if (filters) {
      const hasFilters = (filters.filters && filters.filters.length > 0) || (filters.filterGroups && filters.filterGroups.length > 0);
      if (hasFilters) {
        filteredRows = filteredRows.filter((row: any) => this.evaluateFilterGroup({ filterGroup:filters, row }));
      }
    }

    if(sort){
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
      return { rows: filteredRows, totalCount:total };
    }
    endIndex = Math.min(startIndex + rowsCount, total);
    const rows = filteredRows.slice(startIndex, endIndex);
    return { rows, totalCount:total };
  }

  notifyRowDataChange() {
    // acSingleTimeout({callback:() => {
    //   this.hooks.execute({hook:AC_DATA_MANAGER_EVENT.DataChange});
    // },duration:10,key:this.rowId});
  }

  off({ event, callback, subscriptionId }: { event?: string, callback?: Function, subscriptionId?: string }): void {
    this.events.unsubscribe({ event, callback, subscriptionId });
  }

  on({ event, callback }: { event: string, callback: Function }): string {
    return this.events.subscribe({ event, callback });
  }

  updateRow({ key, value, rowId, data, addIfMissing = true }: { key?: string; value?: any; rowId?: string; data?: any, addIfMissing?: boolean }): any | undefined {
    let targetRow: any | undefined;
    if (rowId !== undefined) {
      targetRow = this.rows.find((r: any) => r.rowId === rowId);
    } else if (key && value !== undefined) {
      targetRow = this.rows.find((r: any) => r[key!] === value);
    } else if (data) {
      targetRow = this.rows.find((r: any) => r === data); // reference equality
    }

    if (targetRow) {
      Object.assign(targetRow, data);
      return targetRow;
    } else if (addIfMissing) {
      return this.addRow({ data });
    }
    return undefined;
  }

}
