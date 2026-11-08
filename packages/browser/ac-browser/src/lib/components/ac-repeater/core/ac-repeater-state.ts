/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcJsonUtils } from "@autocode-ts/autocode";
import { AcRepeaterApi } from "./ac-repeater-api";
import { IAcRepeaterState } from "../interfaces/ac-repeater-state.interface";

export class AcRepeaterState {
  static readonly KeyExtensionStates = "extension_states";
  static readonly KeyPagination = "pagination";
  static readonly KeySortOrder = "sort_order";

  repeaterApi!: AcRepeaterApi;

  private _extensionStates: any = {};
  get extensionStates(): any {
    return this._extensionStates;
  }
  set extensionStates(value: any) {
    if (value != this._extensionStates) {
      this._extensionStates = value;
    }
  }

  private _pagination: any = {};
  get pagination(): any {
    return this._pagination;
  }
  set pagination(value: any) {
    if (value != this._pagination) {
      this._pagination = value;
    }
  }

  private _sortOrder: any = {};
  get sortOrder(): any {
    return this._sortOrder;
  }
  set sortOrder(value: any) {
    if (value != this._sortOrder) {
      this._sortOrder = value;
    }
  }

  constructor({repeaterApi}:{repeaterApi:AcRepeaterApi}){
    this.repeaterApi = repeaterApi;
  }

  apply(state: any) {
    if (state) {
      // FIX: Set applyingState flag to prevent resetPaginationToFirstPage from firing
      // while sort/filter state is being restored, which could blank the repeater body.
      this.repeaterApi.beginStateApplication();
      try {
        if (state[AcRepeaterState.KeyExtensionStates]) {
          for (const extensionName of Object.keys(state[AcRepeaterState.KeyExtensionStates])) {
            if (this.repeaterApi.extensions) {
              if (this.repeaterApi.extensions[extensionName]) {
                this.repeaterApi.extensions[extensionName].setState({state:state[AcRepeaterState.KeyExtensionStates][extensionName]});
              }
            }
          }
        }
      } finally {
        this.repeaterApi.endStateApplication();
      }
    }
  }

  refresh() {
    this.setExtensionsState();
  }

  toJson(): IAcRepeaterState {
    return {
      extension_states:this.extensionStates,
      pagination:this.pagination,
      sort_order:this.sortOrder
    };
  }

  toString(): string {
    return AcJsonUtils.prettyEncode({object:this.toJson()});
  }

  private setExtensionsState() {
    const extensions: any = {};
    for (const extensionName of Object.keys(this.repeaterApi.extensions)) {
      const extensionInstance = this.repeaterApi.extensions[extensionName];
      const extensionState = extensionInstance.getState();
      if (extensionState != undefined) {
        extensions[extensionName] = extensionState;
      }
    }
    this.extensionStates = extensions;
  }

}
