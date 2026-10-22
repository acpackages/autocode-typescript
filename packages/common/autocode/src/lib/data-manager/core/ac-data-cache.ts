/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AcEvents } from "../../core/ac-events";
import { AcHooks } from "../../core/ac-hooks";
import { IAcFilterGroup } from "../../interfaces/ac-filter-group.interface";
import { IAcSortOrder } from "../../interfaces/ac-sort-order.interface";
import { acNullifyInstanceProperties } from "../../utils/ac-utility-functions";
import { IAcDataCacheGetResult } from "../interfaces/ac-data-cache-get-result.interface";
import { IAcOnDemandRequestArgs } from "../interfaces/ac-on-demand-request-args.interface";
import { IAcOnDemandResponseArgs } from "../interfaces/ac-on-demand-response-args.interface";
import { AcDataCacheCollection } from "../models/ac-data-cache-collection.model";

export class AcDataCache {
  private _onDemandFunction?: ({ collection, args }: { collection: string, args: IAcOnDemandRequestArgs }) => void;
  get onDemandFunction(): (({ collection, args }: { collection: string, args: IAcOnDemandRequestArgs }) => void) | undefined {
    return this._onDemandFunction;
  }
  set onDemandFunction(value: ({ collection, args }: { collection: string, args: IAcOnDemandRequestArgs }) => void) {
    if (value != this._onDemandFunction) {
      this._onDemandFunction = value;
    }
  }

  private collections: Map<string, AcDataCacheCollection> = new Map();
  events: AcEvents = new AcEvents();
  hooks: AcHooks = new AcHooks();

  addRow({ collection, data }: { collection: string, data: any }): any {
    const cacheCollection = this.collections.get(collection);
    if (!cacheCollection) {
      throw new Error(`Collection ${collection} not found`);
    }
    const result = cacheCollection.addRow({ data });
    return result;
  }

  /**
   * Clears all rows from every registered collection.
   * Phase 8 (Task 8.2): Fixed bug — Object.keys() on a Map always returns [].
   * Now iterates Map.values() correctly.
   */
  clearAllCollections(): void {
    for (const collection of this.collections.values()) {
      collection.rows = [];
    }
  }

  clearCollection({ collection }: { collection: string }){
    if(this.hasCollection({collection})){
      const cacheCollection = this.collections.get(collection)!;
      cacheCollection.rows = [];
    }
  }

  deleteRow({ collection, key, value, rowId, data }: { collection: string, key?: string; value?: any; rowId?: string; data?: any }): any | undefined {
    const cacheCollection = this.collections.get(collection);
    if (!cacheCollection) {
      throw new Error(`Collection ${collection} not found`);
    }
    const result = cacheCollection.deleteRow({ key, value, rowId, data });
    return result;
  }

  destroy(){
    this.hooks.destroy();

    this.events.destroy();

    this.collections.forEach((collection:AcDataCacheCollection)=>{
      collection.destroy();
    });

    acNullifyInstanceProperties({instance:this});
  }

  async getRows({ collection, filters, sort, searchQuery, startIndex, rowsCount, endIndex, pageNumber, pageSize }: {
    collection: string,
    filters?: IAcFilterGroup;
    sort?: IAcSortOrder;
    searchQuery?: string;
    startIndex?: number;
    rowsCount?: number;
    endIndex?: number;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<IAcDataCacheGetResult> {
    const cacheCollection = this.collections.get(collection);
    if (!cacheCollection) {
      throw new Error(`Collection ${collection} not found`);
    }
    const result = await cacheCollection.getRows({ filters, sort, searchQuery, startIndex, rowsCount, endIndex, pageNumber, pageSize });
    return result;
  }

  hasCollection({ collection }: { collection: string }): boolean {
    const exists = this.collections.has(collection);
    return exists;
  }

  /**
   * Clears and repopulates a collection via the onDemandFunction.
   * Phase 8 (Task 8.5): Fixed async contract — the returned Promise now resolves
   * only after successCallback fires, and rejects on error. Previously the method
   * resolved immediately (fire-and-forget), causing silent data loss with async impls.
   */
  async refreshCollection({ collection }: { collection: string }): Promise<void> {
    const cacheCollection = this.collections.get(collection);
    if (!cacheCollection) {
      throw new Error(`Collection ${collection} not found`);
    }
    if (!this.onDemandFunction) return;

    cacheCollection.rows = [];

    return new Promise<void>((resolve, reject) => {
      const requestArgs: IAcOnDemandRequestArgs = {
        successCallback: (response: IAcOnDemandResponseArgs) => {
          cacheCollection.rows = response.data;
          resolve();
        },
        errorCallback: (error: any) => {
          reject(error);
        }
      };
      try {
        this.onDemandFunction!({ collection, args: requestArgs });
      } catch (err) {
        reject(err);
      }
    });
  }

  registerCollection({ collection, uniqueRowKey,rows }: { collection: string, uniqueRowKey: string,rows?:any[] }) {
    if (this.collections.has(collection)) {
      throw new Error(`Collection ${collection} already initialized`);
    }
    const cacheCollection:AcDataCacheCollection = new AcDataCacheCollection({dataCache:this,name:collection,uniqueRowKey:uniqueRowKey});
    this.collections.set(collection, cacheCollection);
    if(rows!=undefined){
      cacheCollection.rows = rows;
    }
    else{
      this.refreshCollection({collection:collection});
    }
    return cacheCollection;
  }

  setRows({ collection,rows }: { collection: string,rows:any[] }){
    const cacheCollection = this.collections.get(collection);
    if (!cacheCollection) {
      throw new Error(`Collection ${collection} not found`);
    }
    cacheCollection.rows = rows;
  }

  updateRow({ collection, key, value, rowId, data, addIfMissing = true }: { collection: string, key?: string; value?: any; rowId?: string; data?: any, addIfMissing?: boolean }): any | undefined {
    const cacheCollection = this.collections.get(collection);
    if (!cacheCollection) {
      throw new Error(`Collection ${collection} not found`);
    }
    const result = cacheCollection.updateRow({key,value,rowId,data,addIfMissing});
    return result;
  }
}
