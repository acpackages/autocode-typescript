/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AcJsonUtils, acNullifyInstanceProperties } from "@autocode-ts/autocode";
import { AcDatagridApi, IAcDatagridColumnState, IAcDatagridState } from "../_ac-datagrid.export";

export class AcDatagridState {
  static readonly KeyColumns = "columns";
  static readonly KeyExtensionStates = "extensionStates";
  static readonly KeyPagination = "pagination";
  static readonly KeySortOrder = "sortOrder";
  static readonly KeyGroupBy = "groupBy";
  static readonly KeyFilterGroup = "filterGroup";
  static readonly KeySearchQuery = "searchQuery";
  static readonly KeyPinnedRows = "pinnedRows";
  static readonly KeyExpandedRowIds = "expandedRowIds";
  static readonly KeyExpandedDetailRowIds = "expandedDetailRowIds";
  static readonly KeySidePanelOpen = "sidePanelOpen";
  static readonly KeyVersion = "version";

  datagridApi!: AcDatagridApi;

  private _version: number = 1;
  get version(): number {
    return this._version;
  }
  set version(value: number) {
    this._version = value;
  }

  private _columns: IAcDatagridColumnState[] = [];
  get columns(): IAcDatagridColumnState[] {
    return this._columns;
  }
  set columns(value: IAcDatagridColumnState[]) {
    this._columns = value;
  }

  private _extensionStates: Record<string, any> = {};
  get extensionStates(): Record<string, any> {
    return this._extensionStates;
  }
  set extensionStates(value: Record<string, any>) {
    this._extensionStates = value;
  }

  private _pagination: any = {};
  get pagination(): any {
    return this._pagination;
  }
  set pagination(value: any) {
    this._pagination = value;
  }

  private _sortOrder: any = {};
  get sortOrder(): any {
    return this._sortOrder;
  }
  set sortOrder(value: any) {
    this._sortOrder = value;
  }

  private _groupBy: string[] = [];
  get groupBy(): string[] {
    return this._groupBy;
  }
  set groupBy(value: string[]) {
    this._groupBy = value;
  }

  private _filterGroup: any = {};
  get filterGroup(): any {
    return this._filterGroup;
  }
  set filterGroup(value: any) {
    this._filterGroup = value;
  }

  private _searchQuery: string = '';
  get searchQuery(): string {
    return this._searchQuery;
  }
  set searchQuery(value: string) {
    this._searchQuery = value;
  }

  private _pinnedRows: { top?: string[]; bottom?: string[] } = {};
  get pinnedRows(): { top?: string[]; bottom?: string[] } {
    return this._pinnedRows;
  }
  set pinnedRows(value: { top?: string[]; bottom?: string[] }) {
    this._pinnedRows = value;
  }

  private _expandedRowIds: string[] = [];
  get expandedRowIds(): string[] {
    return this._expandedRowIds;
  }
  set expandedRowIds(value: string[]) {
    this._expandedRowIds = value;
  }

  private _expandedDetailRowIds: string[] = [];
  get expandedDetailRowIds(): string[] {
    return this._expandedDetailRowIds;
  }
  set expandedDetailRowIds(value: string[]) {
    this._expandedDetailRowIds = value;
  }

  private _sidePanelOpen: boolean = false;
  get sidePanelOpen(): boolean {
    return this._sidePanelOpen;
  }
  set sidePanelOpen(value: boolean) {
    this._sidePanelOpen = value;
  }

  constructor({ datagridApi }: { datagridApi: AcDatagridApi }) {
    this.datagridApi = datagridApi;
  }

  apply(state: any) {
    if (!state) return;
    this.datagridApi.applyState(state);
  }

  destroy() {
    acNullifyInstanceProperties({ instance: this });
  }

  refresh() {
    this.refreshSync();
  }

  refreshSync() {
    if (!this.datagridApi) return;
    this.setColumnsState();
    this.setExtensionsState();
    this.setPaginationState();
    this.setSortOrderState();
    this.setFilterGroupState();
    this.setOtherStates();
  }

  toJson(): IAcDatagridState {
    const json: IAcDatagridState = {
      version: this.version,
      columns: this.columns,
      extensionStates: this.extensionStates,
      pagination: this.pagination,
      sortOrder: this.sortOrder
    };
    if (this.groupBy && this.groupBy.length > 0) {
      json.groupBy = [...this.groupBy];
    }
    if (this.filterGroup && Object.keys(this.filterGroup).length > 0) {
      json.filterGroup = this.filterGroup;
    }
    if (this.searchQuery) {
      json.searchQuery = this.searchQuery;
    }
    if (this.pinnedRows && ((this.pinnedRows.top && this.pinnedRows.top.length > 0) || (this.pinnedRows.bottom && this.pinnedRows.bottom.length > 0))) {
      json.pinnedRows = {
        top: this.pinnedRows.top ? [...this.pinnedRows.top] : [],
        bottom: this.pinnedRows.bottom ? [...this.pinnedRows.bottom] : []
      };
    }
    if (this.expandedRowIds && this.expandedRowIds.length > 0) {
      json.expandedRowIds = [...this.expandedRowIds];
    }
    if (this.expandedDetailRowIds && this.expandedDetailRowIds.length > 0) {
      json.expandedDetailRowIds = [...this.expandedDetailRowIds];
    }
    if (this.sidePanelOpen !== undefined) {
      json.sidePanelOpen = this.sidePanelOpen;
    }
    return json;
  }

  toString(): string {
    return AcJsonUtils.prettyEncode({ object: this.toJson() });
  }

  private setColumnsState() {
    const columns: IAcDatagridColumnState[] = [];
    if (this.datagridApi.datagridColumns) {
      for (const datagridColumn of this.datagridApi.datagridColumns) {
        const columnState: IAcDatagridColumnState = {
          field: datagridColumn.columnDefinition?.field,
          width: datagridColumn.width,
          flexSize: datagridColumn.flexSize ?? datagridColumn.columnDefinition?.flexSize,
          index: datagridColumn.index,
          isVisible: datagridColumn.visible,
          pinnedOn: datagridColumn.pinnedOn,
          sortOrder: datagridColumn.sortOrder,
          sortPriority: (datagridColumn as any).sortPriority
        };
        columns.push(columnState);
      }
    }
    this.columns = columns;
  }

  private setExtensionsState() {
    const extensions: Record<string, any> = {};
    if (this.datagridApi.extensions) {
      for (const extensionName of Object.keys(this.datagridApi.extensions)) {
        const extensionInstance = this.datagridApi.extensions[extensionName];
        if (extensionInstance && typeof extensionInstance.getState === 'function') {
          const extensionState = extensionInstance.getState({ state: this });
          if (extensionState !== undefined) {
            extensions[extensionName] = extensionState;
          }
        }
      }
    }
    this.extensionStates = extensions;
  }

  private setPaginationState() {
    if (this.datagridApi.pagination && this.datagridApi.usePagination) {
      this.pagination = {
        activePage: this.datagridApi.pagination.activePage,
        activePageSize: this.datagridApi.pagination.activePageSize,
        usePagination: this.datagridApi.usePagination
      };
    } else {
      this.pagination = {
        usePagination: !!this.datagridApi.usePagination
      };
    }
  }

  private setSortOrderState() {
    if (this.datagridApi.dataManager?.sortOrder) {
      this.sortOrder = this.datagridApi.dataManager.sortOrder.toJson();
    } else {
      this.sortOrder = {};
    }
  }

  private setFilterGroupState() {
    if (this.datagridApi.dataManager?.filterGroup && typeof this.datagridApi.dataManager.filterGroup.hasFilters === 'function' && this.datagridApi.dataManager.filterGroup.hasFilters()) {
      this.filterGroup = this.datagridApi.dataManager.filterGroup.toJson();
    } else {
      this.filterGroup = {};
    }
  }

  private setOtherStates() {
    this.groupBy = this.datagridApi.groupBy ? [...this.datagridApi.groupBy] : [];
    this.expandedRowIds = this.datagridApi.expandedRowIds ? Array.from(this.datagridApi.expandedRowIds) : [];
    this.expandedDetailRowIds = this.datagridApi.expandedDetailRowIds ? Array.from(this.datagridApi.expandedDetailRowIds) : [];
    this.sidePanelOpen = !!this.datagridApi.sidePanelOpen;
    this.pinnedRows = {
      top: this.datagridApi.pinnedTopRowIds ? [...this.datagridApi.pinnedTopRowIds] : [],
      bottom: this.datagridApi.pinnedBottomRowIds ? [...this.datagridApi.pinnedBottomRowIds] : []
    };
  }
}
