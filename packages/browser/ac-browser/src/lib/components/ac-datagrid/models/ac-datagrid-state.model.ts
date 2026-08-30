/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDelayedCallback, AcJsonUtils, acNullifyInstanceProperties } from "@autocode-ts/autocode";
import { AC_DATAGRID_EVENT, AcDatagridApi, IAcDatagridColumnState, IAcDatagridState } from "../_ac-datagrid.export";

export class AcDatagridState {
  static readonly KeyColumns = "columns";
  static readonly KeyExtensionStates = "extensionStates";
  static readonly KeyPagination = "pagination";
  static readonly KeySortOrder = "sortOrder";

  datagridApi!: AcDatagridApi;

  private _columns: IAcDatagridColumnState[] = [];
  get columns(): IAcDatagridColumnState[] {
    return this._columns;
  }
  set columns(value: IAcDatagridColumnState[]) {
    if (value != this._columns) {
      this._columns = value;
    }
  }

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

  private refreshNotifyTimeout: any;
  private delayedCallback:AcDelayedCallback = new AcDelayedCallback();

  constructor({ datagridApi }: { datagridApi: AcDatagridApi }) {
    this.datagridApi = datagridApi;
  }

  apply(state: any) {
    if (state) {
      if (state[AcDatagridState.KeyColumns]) {
        this.columns = state[AcDatagridState.KeyColumns];
        for (const column of this.columns) {
          // const datagridColumn: AcDatagridColumn | undefined = this.datagridApi.datagridColumns.find((col) => {
          //   return col.columnDefinition.field == column.field;
          // });
          // if (datagridColumn) {
          //   datagridColumn.width = column.width;
          //   datagridColumn.index = column.index;
          // }
        }
      }
      if (state[AcDatagridState.KeyExtensionStates]) {
        for (const extensionName of Object.keys(state[AcDatagridState.KeyExtensionStates])) {
          if (this.datagridApi.extensions) {
            if (this.datagridApi.extensions[extensionName]) {
              this.datagridApi.extensions[extensionName].setState({ state:this,extensionState:state[AcDatagridState.KeyExtensionStates][extensionName] });
            }
          }
        }
      }
    }
  }

  destroy() {
    this.delayedCallback.destroy();
    acNullifyInstanceProperties({instance:this});
  }

  refresh() {
    if (this.refreshNotifyTimeout) {
      clearTimeout(this.refreshNotifyTimeout);
    }
    this.refreshNotifyTimeout = this.delayedCallback.add({callback:() => {
      clearTimeout(this.refreshNotifyTimeout);
      const previousState = this.toJson();
      this.setColumnsState();
      this.setExtensionsState();
      const currentState: IAcDatagridState = this.toJson();
      if (JSON.stringify(previousState) != JSON.stringify(currentState)) {
        this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.StateChange, args: { currentState } });
        this.datagridApi.hooks.execute({ hook: AC_DATAGRID_EVENT.StateChange, args: { currentState } });
      }
    }, duration:300});
  }

  toJson(): IAcDatagridState {
    return {
      columns: this.columns,
      extensionStates: this.extensionStates,
      pagination: this.pagination,
      sortOrder: this.sortOrder
    };
  }

  toString(): string {
    return AcJsonUtils.prettyEncode({object:this.toJson()});
  }

  private setColumnsState() {
    const columns: any[] = [];
    for (const datagridColumn of this.datagridApi.datagridColumns) {
      const columnState: IAcDatagridColumnState = {
        field: datagridColumn.columnDefinition.field,
        width: datagridColumn.width,
        index: datagridColumn.index,
        isVisible:datagridColumn.visible
      };
      columns.push(columnState)
    }
    this.columns = columns;
  }

  private setExtensionsState() {
    const extensions: any = {};
    for (const extensionName of Object.keys(this.datagridApi.extensions)) {
      const extensionInstance = this.datagridApi.extensions[extensionName];
      const extensionState = extensionInstance.getState({state:this});
      if (extensionState != undefined) {
        extensions[extensionName] = extensionState;
      }
    }
    this.extensionStates = extensions;
  }

}
