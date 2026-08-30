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

  get displayedRows(): IAcDataRow[] {
    return this.rows.filter((row) => {
      return row && row.index >= this.displayStartIndex && row.index <= this.displayEndIndex;
    });
  }

  private _filterGroup: AcFilterGroup = new AcFilterGroup();
  get filterGroup(): AcFilterGroup {
    return this._filterGroup;
  }
  set filterGroup(value: AcFilterGroup) {
    if (value != this._filterGroup) {
      this._filterGroup = value;
      value.on({
        event: 'change', callback: () => {
          //
        }
      });
    }
  }

  get rows(): IAcDataRow[] {
    return this.allRows.filter((row) => {
      return row && row.index >= 0;
    });
  }

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
  get sortOrder(): AcSortOrder {
    return this._sortOrder;
  }
  set sortOrder(value: AcSortOrder) {
    if (value != this._sortOrder) {
      value.on({
        event: 'change', callback: () => {
          // SortOrder change detected, triggering refreshRows (comment kept for context)
        }
      });
      this._sortOrder = value;
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
      originalIndex: index,
      extensionData: {},
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
        const parentRow: any = this.allRows.find((val) => {
          return val.data[this.dataUniqueValueKey] == parentUniqueValue;
        });
        if (parentRow) {
          parentRowId = parentRow.rowId;
        }
      }
      dataRow.data[this.uniqueIdParentKey] = parentRowId;
    }
    const hookArgs: IAcDataManagerRowHookArgs = {
      dataManager: this,
      dataRow: dataRow,
    };

    this.allRows.splice(index, 0, dataRow);
    for (let i = index + 1; i < this.allRows.length; i++) {
      if(this.allRows[i]){
        this.allRows[i].originalIndex = i;
      }
    }
    this.totalRows = this.allRows.length;
    this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.RowCreate, args: hookArgs });
    this.events.execute({ event: AC_DATA_MANAGER_EVENT.RowCreate, args: hookArgs });
    this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.RowAdd, args: { dataRow: dataRow, data: data } });
    this.events.execute({ event: AC_DATA_MANAGER_EVENT.RowAdd, args: { dataRow: dataRow, data: data } });
    return dataRow;
  }

  private applyFilter() {
    let validIndex: number = 0;
    for (const row of this.allRows) {
      if (row) {
        const keys: any = Object.keys(row.data);
        let valid: boolean = true;
        if (this.searchQuery) {
          valid = this.evaluateSearch(this.searchQuery, row, keys);
        }
        if (valid && this.filterGroup && (this.filterGroup.hasFilters() || this.filterGroup.filterGroups.length > 0)) {
          valid = this.evaluateFilterGroup(this.filterGroup, row)
        }
        if (valid) {
          row.index = validIndex;
          validIndex++;
        }
        else {
          row.index = -1;
        }
      }
    }
  }

  private applySort() {
    const rows = this.allRows.filter((row) => { return row && row.index >= 0 });
    rows.sort((a: IAcDataRow, b: IAcDataRow): number => {
      let index = 0;
      for (const sort of this.sortOrder.sortOrders) {
        const field = sort.key;
        const valA: any = a.data[field];
        const valB: any = b.data[field];
        let result = 0;

        if (typeof valA === "string" && typeof valB === "string") {
          result = valA.localeCompare(valB);
        } else {
          result = (valA ?? 0) - (valB ?? 0);
        }

        if (result !== 0) {
          index = sort.order == AcEnumSortOrder.Ascending ? result : -result;
          break;
        }
      }
      return index;
    });
    let index: number = 0;
    for (const row of rows) {
      row.index = index;
      row.isFirst = false;
      row.isLast = false;
      index++;
    }
    if (rows.length > 0) {
      rows[0].isFirst = true;
      rows[rows.length - 1].isLast = true;
    }
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
        for (let index = startIndex; index <= endIndex; index++) {
          if (available) {
            if (this.rows[index] == undefined) {
              available = false;
              break;
            }
            else if (!this.rows[index]) {
              available = false;
              break;
            }
            else if (this.rows[index].isPlaceholder) {
              available = false;
              break;
            }
          }
        }
      }
    }
    return available;
  }

  deleteRow({ data, rowId, key, value }: { data?: any, rowId?: string, key?: string, value?: any }): IAcDataRow | undefined {
    const dataRow: IAcDataRow | undefined = this.rows.find((dataRow: IAcDataRow) => {
      let valid: boolean = false;
      if (dataRow) {
        if (rowId) {
          valid = dataRow.rowId == rowId;
        }
        else if (key && value) {
          valid = dataRow.data[key] == value;
        }
        else if (data && key) {
          valid = dataRow.data[key] == data[key];
        }
        else if (data) {
          valid = dataRow.data == data;
        }
      }
      return valid;
    });
    if (dataRow) {
      const row = { ...dataRow };
      arrayRemoveByKey(this.allRows, 'rowId', dataRow.rowId);
      this.totalRows--;
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
      const fromIndex: number = startIndex ?? 0;
      const toIndex: number = fromIndex + ((rowsCount > -1 ? rowsCount : this.totalRows) - 1);
      for (let index = fromIndex; index <= toIndex && index < this.totalRows; index++) {
        if (this.rows[index]) {
          result.push(this.rows[index]);
        }
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

  getRowIndex({ key, value }: { key: string, value: any }): number {
    const index = this.allRows.findIndex((row: IAcDataRow) => {
      return row && row.data[key] == value;
    });
    return index;
  }

  getRowAtIndex({ index }: { index: number }): IAcDataRow | undefined {
    const row = this.allRows.find((row: IAcDataRow) => {
      return row && row.index == index;
    });
    return row;
  }

  getRow({ key, value }: { key: string, value: any }): IAcDataRow | undefined {
    const row = this.allRows.find((row: IAcDataRow) => {
      return row && row.data[key] == value;
    });
    return row;
  }

  off({ event, callback, subscriptionId }: { event?: string, callback?: Function, subscriptionId?: string }): void {
    this.events.unsubscribe({ event, callback, subscriptionId });
  }

  on({ event, callback }: { event: string, callback: Function }): string {
    const subscriptionId = this.events.subscribe({ event, callback });
    return subscriptionId;
  }

  async processRows() {
    if (this.type == 'offline') {
      if (this.allRows.length > 0) {
        this.applyFilter();
        this.applySort();
      }
      this.totalRows = this.rows.length;
    }
    this.setDisplayedRows({ startIndex: this.displayStartIndex, rowsCount: this.displayCount });
  }

  async refreshRows() {
    this.delayedCallback.add({
      callback: async () => {
        if (this.type == "offline") {
          this.processRows();
        }
        else {
          this.isWorking = true;
          this.reset();
          await this.getRows({ rowsCount: this.lastRowsCount });
          this.setDisplayedRows({ startIndex: this.displayStartIndex, rowsCount: this.displayCount });
          this.isWorking = false;
        }
      }, duration: this.refreshRowsTimeoutDuration, key: 'refreshRows'
    });
  }

  reset() {
    this.totalRows = 0;
    (this.allRows as any) = null;
    this.allRows = [];
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
      const allRows = [];
      for (const row of data) {
        const dataRow: IAcDataRow = {
          rowId: Autocode.uuid(),
          data: row,
          originalIndex: index,
          index: index,
          extensionData: {}
        };
        if (this.assignUniqueIdToData) {
          dataRow.data[this.uniqueIdKey] = dataRow.rowId;
        }
        allRows.push(dataRow);
        const hookArgs: IAcDataManagerRowHookArgs = {
          dataManager: this,
          dataRow: dataRow,
        };
        this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.RowCreate, args: hookArgs });
        this.events.execute({ event: AC_DATA_MANAGER_EVENT.RowCreate, args: hookArgs });
        index++;
      }
      if (allRows.length > 0) {
        allRows[0].isFirst = true;
        allRows[allRows.length - 1].isLast = true;
      }
      if (this.assignUniqueParentIdToData && this.dataParentUniqueValueKey && this.dataUniqueValueKey) {
        for (const row of allRows) {
          const parentUniqueValue = row.data[this.dataParentUniqueValueKey];
          let parentRowId: any = undefined;
          if (parentUniqueValue) {
            const parentRow: any = allRows.find((val) => {
              return val.data[this.dataUniqueValueKey] == parentUniqueValue;
            });
            if (parentRow) {
              parentRowId = parentRow.rowId;
            }
          }
          row.data[this.uniqueIdParentKey] = parentRowId;
        }
      }
      this.allRows = allRows;
      this.allDataAvailable = true;
      this.processRows();
      this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.DataChange, args: hookArgs });
    }
    else if (this.type == 'ondemand') {
      if (totalCount == undefined) {
        totalCount = this.totalRows;
      }
      startIndex = startIndex ?? 0;
      const endIndex = startIndex + (data.length) - 1;
      if (this.allRows.length < totalCount) {
        this.allRows = new Array(totalCount).fill(undefined);
      }
      for (let index = startIndex; index <= endIndex; index++) {
        const dataIndex = index - startIndex;
        if (this.allRows[index] == undefined) {
          this.allRows[index] = {
            rowId: Autocode.uuid(),
            data: {},
            isPlaceholder: false,
            index: index,
            originalIndex: index,
            extensionData: {}
          };
          if (index == 0) {
            this.allRows[index].isFirst = true;
          }
          if (index == totalCount - 1) {
            this.allRows[index].isLast = true;
          }
        }
        const rowData = data[dataIndex];
        if (this.assignUniqueIdToData) {
          rowData[this.uniqueIdKey] = this.allRows[index].rowId;
        }
        this.allRows[index].data = rowData;
        this.allRows[index].isPlaceholder = false;
        const hookArgs: IAcDataManagerRowHookArgs = {
          dataManager: this,
          dataRow: this.allRows[index],
        };
        this.hooks.execute({ hook: AC_DATA_MANAGER_HOOK.RowCreate, args: hookArgs });
        this.events.execute({ event: AC_DATA_MANAGER_EVENT.RowCreate, args: hookArgs });
      }
      this.allDataAvailable = this.allRows.filter((row) => { return row == undefined || row.isPlaceholder == false }).length == 0;
      this.totalRows = this.allRows.length;
      this.processRows();
    }
    this.isFirstRowsSet = true;
  }

  updateRow({ data, value, key, rowId, addIfMissing = true }: { data: any, value?: any, key?: string, rowId?: string, highlightCells?: boolean, addIfMissing?: boolean }): IAcDataRow | undefined {
    let dataRow: IAcDataRow | undefined = this.rows.find((row) => {
      let valid: boolean = false;
      if (row) {
        if (rowId) {
          valid = row.rowId == rowId;
        }
        else if (key && value) {
          valid = row.data[key] == value;
        }
        else if (data && key) {
          valid = row.data[key] == data[key];
        }
        else if (data) {
          valid = row.data == data;
        }
      }
      return valid;
    });
    if (dataRow) {
      if (this.assignUniqueIdToData) {
        data[this.uniqueIdKey] = dataRow.rowId;
      }
      if (this.assignUniqueParentIdToData && this.dataParentUniqueValueKey && this.dataUniqueValueKey) {
        for (const row of this.allRows) {
          const parentUniqueValue = data[this.dataParentUniqueValueKey];
          let parentRowId: any = undefined;
          if (parentUniqueValue) {
            const parentRow: any = this.allRows.find((val) => {
              return val.data[this.dataUniqueValueKey] == parentUniqueValue;
            });
            if (parentRow) {
              parentRowId = parentRow.rowId;
            }
          }
          data[this.uniqueIdParentKey] = parentRowId;
        }
      }
      dataRow.data = data;
      if (this.assignUniqueParentIdToData && this.dataParentUniqueValueKey && this.dataUniqueValueKey) {
        const parentUniqueValue = dataRow.data[this.dataParentUniqueValueKey];
        let parentRowId: any = undefined;
        if (parentUniqueValue) {
          const parentRow: any = this.allRows.find((val) => {
            return val.data[this.dataUniqueValueKey] == parentUniqueValue;
          });
          if (parentRow) {
            parentRowId = parentRow.rowId;
          }
        }
        dataRow.data[this.uniqueIdParentKey] = parentRowId;
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

  async setDisplayedRows({ startIndex = 0, rowsCount = -1 }: { startIndex?: number; rowsCount?: number; } = {}) {
    const oldStartIndex = this.displayStartIndex;
    const oldEndIndex = this.displayEndIndex;
    const oldDisplayCount = this.displayCount;
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

}
