/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDatagridExtension, AC_DATAGRID_EXTENSION_NAME, AC_DATAGRID_HOOK, IAcDatagridColumn, IAcDatagridExtension, IAcDatagridExtensionEnabledHookArgs, AcDatagridRowNumbersExtension, AcEnumDatagridRowNumbersHook, AcDatagridColumnsCustomizerExtension, AcEnumDatagridColumnsCustomizerHook, AcDatagridColumnDraggingExtension, AcEnumDatagridColumnDraggingHook, IAcDatagridColumnsCustomizerHookArgs, AcDatagridDataExportXlsxExtension, AcEnumDatagridDataExportXlsxHook, IAcDatagridRowFocusHookArgs, IAcDatagridRowUpdateHookArgs, IAcDatagridRowDeleteHookArgs, AcDatagridApi, IAcDatagridCell, IAcDatagridRow, IAcDatagridDataSourceTypeChangeHookArgs, AcEnumDataSourceType, IAcDatagridBeforeGetOnDemandDataHookArgs, IAcDatagridGetOnDemandDataSuccessCallbackHookArgs, AcDatagridCssClassName, AcDatagridAfterRowsFooterExtension, IAcDatagridDataExportXlsxExportCallHookArgs, IAcDatagridRowAddHookArgs, AcDatagridTreeTableExtension, IAcDatagridCellElementArgs } from '@autocode-ts/ac-browser';
import { ColDef, createGrid, ModuleRegistry, AllCommunityModule, GridApi, GetRowIdParams, GridOptions, IRowNode, IServerSideGetRowsParams, IServerSideDatasource, SuppressKeyboardEventParams, ClientSideRowModelModule, IServerSideGetRowsRequest, TextFilterModule, NumberFilterModule, DateFilterModule } from 'ag-grid-community';
import { AllEnterpriseModule, ServerSideRowModelModule, TreeDataModule } from 'ag-grid-enterprise';
import { AcDatagridRowSelectionExtensionOnAgGrid } from './ac-datagrid-row-selection-extension-on-ag-grid';
import { IAcDatagriOnAgGridColDefsChangeHookArgs } from '../interfaces/ac-datagrid-on-ag-grid-col-defs-set-hook-args.interface';
import { AcEnumDatagridOnAgGridHook } from '../enums/ac-enum-datagrid-on-ag-grid-hook.enum';
import { AcDatagridTreeTableExtensionOnAgGrid } from './ac-datagrid-tree-table-extension-on-ag-grid';
import { AcDatagridRowDraggingExtensionOnAgGrid } from './ac-datagrid-row-dragging-extension-on-ag-grid';
import { IAcDatagriOnAgGridRowAddHookArgs } from '../interfaces/ac-datagrid-on-ag-grid-row-add-hook-args.interface';
import { IAcDatagriOnAgGridRowUpdateHookArgs } from '../interfaces/ac-datagrid-on-ag-grid-row-update-hook-args.interface';
import { AcEnumConditionOperator, AC_DATA_MANAGER_HOOK, AcEnumLogicalOperator, AcFilterGroup, AcLogger, AcSortOrder, IAcOnDemandRequestArgs, IAcOnDemandResponseArgs, acNullifyInstanceProperties, AcDelayedCallback } from '@autocode-ts/autocode';
import { AcDatagridOnAgGridEventHandler } from './ac-datagrid-on-ag-grid-event-handler';
import { stringEqualsIgnoreCase } from '@autocode-ts/ac-extensions';
import { AC_DATAGRID_AGGRID_DEFAULT_OPTIONS } from '../const/ac-datagrid-aggrid-default-options.const';
import { acGetColDefFromAcDataGridColumn } from '../helpers/col-def-helper';
import { AcDatagridOnAgGridCellRenderer } from '../elements/ac-datagrid-on-ag-grid-cell-renderer.element';
import { AcDatagridOnAgGridCellEditor } from '../elements/ac-datagrid-on-ag-grid-cell-editor.element';
import { IAcDatagriOnAgGridDataChangeHookArgs } from '../interfaces/ac-datagrid-on-ag-grid-data-set-hook-args.interface';
import { ACI_SVG_SOLID } from '@autocode-ts/ac-icons';

export function initAgGrid() {
  ModuleRegistry.registerModules([
    AllCommunityModule,
    AllEnterpriseModule,
    ClientSideRowModelModule,
    ServerSideRowModelModule,
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    TreeDataModule
  ]);
}

export class AcDatagridOnAgGridExtension extends AcDatagridExtension {
  agGridElement = document.createElement('div');
  allowColumnDragging: boolean = false;
  colDefs: ColDef[] = [];
  gridApi?: GridApi;
  gridOptions: GridOptions;
  isClientSideData: boolean = true;
  private lastOnDemandParams: IAcOnDemandRequestArgs | undefined;
  navigate: boolean = true;
  onDemandDataSource: IServerSideDatasource = {
    getRows: async (params: IServerSideGetRowsParams) => {
      if (!this.datagridApi) {
        params.fail();
        return;
      }
      const agGridRequest: IServerSideGetRowsRequest = params.request;
      let startIndex: number = 0;
      let rowsCount: number = 100;
      if (agGridRequest.startRow != undefined && agGridRequest.endRow != undefined) {
        startIndex = agGridRequest.startRow;
        const pageSize: number = agGridRequest.endRow - agGridRequest.startRow;
        rowsCount = pageSize;
      }
      const filterGroup: AcFilterGroup = new AcFilterGroup();
      filterGroup.operator = AcEnumLogicalOperator.And;
      if (agGridRequest.filterModel) {
        const filterColumns: string[] = Object.keys(agGridRequest.filterModel);
        if (filterColumns.length > 0) {
          for (const column of filterColumns) {
            const filterModel = (agGridRequest.filterModel as any)[column];
            if (filterModel.conditions) {
              const columnFilterGroup: AcFilterGroup = new AcFilterGroup();
              columnFilterGroup.operator = AcEnumLogicalOperator.And;
              for (const condition of filterModel.conditions) {
                columnFilterGroup.addFilter({ key: column, value: condition.value, operator: this.getConditionOperator({ agGridOperator: condition.type }) });
              }
              filterGroup.addFilterGroupModel({ filterGroup: columnFilterGroup });
            }
            else {
              filterGroup.addFilter({ key: column, value: filterModel.filter, operator: this.getConditionOperator({ agGridOperator: filterModel.type }) });
            }
          }
        }
      }
      this.datagridApi.dataManager.filterGroup = filterGroup;
      const sortOrder: AcSortOrder = new AcSortOrder();
      if (agGridRequest.sortModel) {
        if (agGridRequest.sortModel.length > 0) {
          for (const sortModel of agGridRequest.sortModel) {
            sortOrder.addSort({ key: sortModel.colId, order: (sortModel.sort as any) });
          }
        }
      }
      this.datagridApi.dataManager.sortOrder = sortOrder;
      const rows = await this.datagridApi.dataManager.getData({ startIndex, rowsCount });
      params.success({ rowData: rows, rowCount: this.datagridApi.dataManager.totalRows });
    }
  };
  onDemandRequestParams?: IServerSideGetRowsParams;
  rowKey: string = "__ac_row_id__";
  rowParentKey: string = "__ac_row_parent_id__";
  afterRowsFooterExtension?: AcDatagridAfterRowsFooterExtension;
  columnsCustomizerExtension?: AcDatagridColumnsCustomizerExtension;
  columnDraggingExtension?: AcDatagridColumnDraggingExtension;
  dataExportXlsxExtension?: AcDatagridDataExportXlsxExtension;
  rowNumbersExtension?: AcDatagridRowNumbersExtension;
  treeTableExtension?: AcDatagridTreeTableExtension;
  ignoreNextGetData: boolean = false;
  logger: AcLogger = new AcLogger({ logMessages: false });
  searchInputContainer?: HTMLElement;
  addButtonContainer?: HTMLElement;
  columnsCustomizerButtonContainer?: HTMLElement;
  isColumnsCustomizerOpen: boolean = false;
  isFirstDataRendered: boolean = false;
  leftFooterContainer?: HTMLElement;
  rightFooterContainer?: HTMLElement;
  delayedCallback: AcDelayedCallback = new AcDelayedCallback();

  private agGridEventHandler = new AcDatagridOnAgGridEventHandler();
  private agGridRowDragExt = new AcDatagridRowDraggingExtensionOnAgGrid();
  private agGridSelectionExt = new AcDatagridRowSelectionExtensionOnAgGrid();
  private agGridTreeTableExt = new AcDatagridTreeTableExtensionOnAgGrid();

  private searchInputTimeout: any;
  private state: any;

  constructor() {
    super();
    this.registerModules();
    this.agGridElement.style.display = 'contents';
    this.gridOptions = { ...AC_DATAGRID_AGGRID_DEFAULT_OPTIONS };
    this.gridOptions.getRowId = (params: GetRowIdParams) => {
      return params.data[this.rowKey];
    };
    this.gridOptions['onFirstDataRendered'] = () => {
      this.isFirstDataRendered = true;
    };
    this.gridOptions['rowModelType'] = 'serverSide';
    this.gridOptions['serverSideDatasource'] = this.onDemandDataSource;
    this.gridOptions['onGridReady'] = () => {
      if (this.state) {
        this.setState({ state: this.state });
      }
    };
  }

  override destroy(): void {
    this.agGridElement.innerHTML = '';
    clearTimeout(this.searchInputTimeout);

    if (this.gridApi) {
      this.gridApi.destroy();
    }

    this.agGridEventHandler.destroy();

    this.agGridRowDragExt.destroy();

    this.agGridSelectionExt.destroy();

    this.agGridTreeTableExt.destroy();

    super.destroy();
  }

  private handleCellKeyUp(args: SuppressKeyboardEventParams) {
    if (args.event) {
      const event: KeyboardEvent = args.event;
      const KEY_A = "A";
      const KEY_C = "C";
      const KEY_V = "V";
      const KEY_D = "D";
      const KEY_PAGE_UP = "PageUp";
      const KEY_PAGE_DOWN = "PageDown";
      const KEY_TAB = "Tab";
      const KEY_LEFT = "ArrowLeft";
      const KEY_UP = "ArrowUp";
      const KEY_RIGHT = "ArrowRight";
      const KEY_DOWN = "ArrowDown";
      const KEY_F2 = "F2";
      const KEY_BACKSPACE = "Backspace";
      const KEY_ESCAPE = "Escape";
      const KEY_SPACE = " ";
      const KEY_DELETE = "Delete";
      const KEY_PAGE_HOME = "Home";
      const KEY_PAGE_END = "End";
      const key = event.key;
      let keysToSuppress = [
        KEY_PAGE_UP,
        KEY_PAGE_DOWN,
        KEY_TAB,
        KEY_F2,
        KEY_ESCAPE,
      ];
      const editingKeys = [
        KEY_LEFT,
        KEY_RIGHT,
        KEY_UP,
        KEY_DOWN,
        KEY_BACKSPACE,
        KEY_DELETE,
        KEY_SPACE,
        KEY_PAGE_HOME,
        KEY_PAGE_END,
      ];
      if (event.ctrlKey || event.metaKey) {
        keysToSuppress.push(KEY_A);
        keysToSuppress.push(KEY_V);
        keysToSuppress.push(KEY_C);
        keysToSuppress.push(KEY_D);
      }
      if (this.navigate) {
        keysToSuppress = keysToSuppress.concat(editingKeys);
      }
      const isNavigationKey = keysToSuppress.some(function (suppressedKey) {
        return suppressedKey === key || key.toUpperCase() === suppressedKey;
      });
      if (this.navigate && !isNavigationKey) {
        this.navigate = false;
      }
      if (this.navigate && key.toLowerCase() == KEY_ESCAPE.toLowerCase()) {
        this.navigate = true;
      }
    }
    const suppressResult = !this.navigate;
    return suppressResult;
  }

  private getConditionOperator({ agGridOperator }: { agGridOperator: string }): AcEnumConditionOperator {
    let result: AcEnumConditionOperator = AcEnumConditionOperator.EqualTo;
    switch (agGridOperator) {
      case "blank":
      case "empty":
        result = AcEnumConditionOperator.IsEmpty;
        break;
      case "contains":
        result = AcEnumConditionOperator.Contains;
        break;
      case "endsWith":
        result = AcEnumConditionOperator.EndsWith;
        break;
      case "equals":
        result = AcEnumConditionOperator.EqualTo;
        break;
      case "greaterThan":
        result = AcEnumConditionOperator.GreaterThan;
        break;
      case "greaterThanOrEqual":
        result = AcEnumConditionOperator.GreaterThanEqualTo;
        break;
      case "inRange":
        result = AcEnumConditionOperator.Between;
        break;
      case "lessThan":
        result = AcEnumConditionOperator.LessThan;
        break;
      case "lessThanOrEqual":
        result = AcEnumConditionOperator.LessThanEqualTo;
        break;
      case "notBlank":
        break;
      case "notEqual":
        result = AcEnumConditionOperator.NotEqualTo;
        break;
      case "notContains":
        break;
      case "startsWith":
        result = AcEnumConditionOperator.StartsWith;
        break;
      default:
    }
    return result;
  }

  getDatagridCellFromEvent({ event }: { event: any }): IAcDatagridCell | undefined {
    if (!this.datagridApi) return undefined;

    const datagridRow: IAcDatagridRow | undefined = this.getDatagridRowFromEvent({ event: event });
    const datagridColumn: IAcDatagridColumn | undefined = this.getDatagridColumnFromEvent({ event: event });
    if (datagridRow && datagridColumn) {
      return this.datagridApi.getCell({ column: datagridColumn, row: datagridRow });
    }
    return undefined;
  }

  getDatagridColumnFromEvent({ event }: { event: any }): IAcDatagridColumn | undefined {
    if (!this.datagridApi) return undefined;

    let field: string = '';
    if (event.colDef) {
      field = event.colDef.field ?? '';
    }
    else if (event.column) {
      field = event.column.colDef.field ?? '';
    }
    if (field === '') {
      console.error(event);
      return undefined;
    }
    return this.datagridApi.getColumn({ key: field }) ?? undefined;
  }

  getDatagridRowFromEvent({ event }: { event: any }): IAcDatagridRow | undefined {
    if (!this.datagridApi) return undefined;

    let datagridRow: IAcDatagridRow | undefined;
    if (event.data) {
      datagridRow = this.datagridApi.getRow({ rowId: event.data[this.rowKey] }) ?? undefined;
    }
    else if (event.node && event.node.data) {
      datagridRow = this.datagridApi.getRow({ rowId: event.node.data[this.rowKey] }) ?? undefined;
    }
    else if (event.rowIndex >= 0) {
      datagridRow = this.datagridApi.getRow({ index: event.rowIndex }) ?? undefined;
    }
    return datagridRow;
  }

  override getState() {
    if (this.gridApi) {
      const state = this.gridApi.getState();
      return {
        columnGroup: state.columnGroup,
        columnOrder: state.columnOrder,
        columnPinning: state.columnPinning,
        columnSizing: state.columnSizing,
        columnVisibility: state.columnVisibility,
        version: state.version
      };
    }
    return null;
  }

  private handleApplyFilter(args: any) {
    // if(args.search){
    // }
    // if (this.isClientSideData) {
    // this.gridApi.applyTransaction({ remove: [args.datagridRow.data] });
    // }
    // else {
    // this.gridApi.applyServerSideTransaction({ remove: [args.datagridRow.data] });
    // }
  }

  private handleBeforeGetOnDemandData(args: IAcDatagridBeforeGetOnDemandDataHookArgs) {
    if (!this.datagridApi) return;

    const requestArgs: IAcOnDemandRequestArgs = args.requestArgs;
    if (this.onDemandRequestParams && this.onDemandRequestParams.request) {
      const agGridRequest: IServerSideGetRowsRequest = this.onDemandRequestParams.request;
      if (agGridRequest.startRow != undefined && agGridRequest.endRow != undefined) {
        requestArgs.startIndex = agGridRequest.startRow;
        const pageSize: number = agGridRequest.endRow - agGridRequest.startRow;
        requestArgs.rowsCount = pageSize;
        requestArgs.pageNumber = (agGridRequest.startRow / pageSize) + 1;
      }
      else {
        requestArgs.allRows = true;
      }
      const filterGroup: AcFilterGroup = new AcFilterGroup();
      filterGroup.operator = AcEnumLogicalOperator.And;
      if (agGridRequest.filterModel) {
        const filterColumns: string[] = Object.keys(agGridRequest.filterModel);
        if (filterColumns.length > 0) {
          for (const column of filterColumns) {
            const filterModel = (agGridRequest.filterModel as any)[column];
            if (filterModel.conditions) {
              const columnFilterGroup: AcFilterGroup = new AcFilterGroup();
              columnFilterGroup.operator = AcEnumLogicalOperator.And;
              for (const condition of filterModel.conditions) {
                columnFilterGroup.addFilter({ key: column, value: condition.value, operator: this.getConditionOperator({ agGridOperator: condition.type }) });
              }
              filterGroup.addFilterGroupModel({ filterGroup: columnFilterGroup });
            }
            else {
              filterGroup.addFilter({ key: column, value: filterModel.filter, operator: this.getConditionOperator({ agGridOperator: filterModel.type }) });
            }
          }
          requestArgs.filterGroup = filterGroup;
        }
      }
      if (agGridRequest.sortModel) {
        if (agGridRequest.sortModel.length > 0) {
          const sortOrder: AcSortOrder = new AcSortOrder();
          for (const sortModel of agGridRequest.sortModel) {
            sortOrder.addSort({ key: sortModel.colId, order: (sortModel.sort as any) });
          }
          requestArgs.sortOrder = sortOrder;
        }
      }
      this.lastOnDemandParams = requestArgs;
    }
  }

  private handleColumnsCustomizerToggle(args: IAcDatagridColumnsCustomizerHookArgs) {
    if (this.gridApi) {
      if (args.value) {
        this.gridApi.openToolPanel('columns');
      } else {
        this.gridApi.closeToolPanel();
      }
    }
  }

  private handleDataChange() {
    if (!this.datagridApi || !this.gridApi) return;

    const data: any[] = this.datagridApi.data;
    const hookArgs: IAcDatagriOnAgGridDataChangeHookArgs = {
      data: data
    }
    this.datagridApi.hooks.execute({ hook: AcEnumDatagridOnAgGridHook.DataChange, args: hookArgs });
    if (this.isClientSideData) {
      this.gridOptions['rowData'] = data;
      this.gridApi.setGridOption('rowData', data);
    }
  }

  private handleDataExportXlsx(args: IAcDatagridDataExportXlsxExportCallHookArgs) {
    if (!this.gridApi) return;

    if (this.isClientSideData) {
      this.gridApi.exportDataAsExcel({ fileName: args.args.fileName });
    }
    else {
      const getAllDataArgs: any = { ...(this.lastOnDemandParams ?? {}) };
      getAllDataArgs.successCallback = (response: IAcOnDemandResponseArgs) => {
        if (!this.gridApi) return;
        if (!Array.isArray(response.data)) {
          response.data = [];
        }
        this.gridApi.applyServerSideRowData({ successParams: { rowData: response.data, rowCount: response.totalCount } });
      };
      if (this.datagridApi?.dataManager.onDemandFunction) {
        this.datagridApi.dataManager.onDemandFunction(getAllDataArgs);
      }
      this.gridApi.exportDataAsExcel({ fileName: args.args.fileName });
    }
  }

  private handleDataSourceTypeChange(args: IAcDatagridDataSourceTypeChangeHookArgs) {
    this.setDataSourceType();
  }

  private handleExtensionEnabled(args: IAcDatagridExtensionEnabledHookArgs) {
    if (args.extensionName == AC_DATAGRID_EXTENSION_NAME.AfterRowsFooter) {
      this.setAfterRowsFooterExtension();
    }
    else if (args.extensionName == AC_DATAGRID_EXTENSION_NAME.RowNumbers) {
      this.setRowNumbersExtension();
    }
    else if (args.extensionName == AC_DATAGRID_EXTENSION_NAME.ColumnDragging) {
      this.setColumnDraggingExtension();
    }
    else if (args.extensionName == AC_DATAGRID_EXTENSION_NAME.DataExportXlsx) {
      this.setDataExportXlsxExtension();
    }
    else if (args.extensionName == AC_DATAGRID_EXTENSION_NAME.RowDragging) {
      this.setColumnDefs();
    }

  }

  override handleHook({ hook, args }: { hook: string; args: any; }): void {
    if (!this.datagridApi) return;

    if (stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.ActiveCellChange)) {
      if (this.gridApi && this.datagridApi) {
        const activeDatagridCell = this.datagridApi.activeDatagridCell as IAcDatagridCell;
        if (activeDatagridCell?.datagridRow && activeDatagridCell?.datagridColumn) {
          this.gridApi.setFocusedCell(activeDatagridCell.datagridRow.index, activeDatagridCell.datagridColumn.columnKey);
        }
      }
    }
    else if (stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.BeforeGetOnDemandData)) {
      this.handleBeforeGetOnDemandData(args);
    }
    else if (stringEqualsIgnoreCase(hook, AC_DATA_MANAGER_HOOK.OnDemandFunctionSet)) {
      this.setDataSourceType();
    }
    else if (stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.CellFocus)) {
      this.navigate = true;
    }
    else if (stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.ColumnDefinitionsChange)) {
      this.setColumnDefs();
    }
    else if (stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.DatagridInit)) {
      this.datagridApi.datagrid.innerHTML = "";
      this.datagridApi.datagrid.append(this.agGridElement);
    }
    else if (stringEqualsIgnoreCase(hook, AC_DATA_MANAGER_HOOK.DataChange)) {
      this.handleDataChange();
    }
    else if (stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.DataSourceTypeChange)) {
      this.handleDataSourceTypeChange(args);
    }
    else if (stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.EnsureRowVisible)) {
      if (this.gridApi) {
        let timeout: any;
        const handleEnsureRow: Function = () => {
          if (this.isFirstDataRendered) {
            if (this.gridApi && args.datagridRow) {
              const datagridRow = args.datagridRow as IAcDatagridRow;
              const pageSize = this.gridApi.paginationGetPageSize();
              const page = Math.floor(datagridRow.index / pageSize);
              this.gridApi.paginationGoToPage(page);
              if (this.delayedCallback) {
                this.delayedCallback.add({
                  callback: () => {
                    if (this.gridApi) {
                      this.gridApi!.ensureIndexVisible(datagridRow.index);
                    }
                  }
                });
              }
            }
          }
          else {
            if (this.delayedCallback) {
              timeout = this.delayedCallback.add({
                callback: () => {
                  handleEnsureRow();
                }, duration: 10
              });
            }
          }
        }
        handleEnsureRow();
      }
    }
    else if (stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.ExtensionEnable)) {
      this.handleExtensionEnabled(args);
    }
    else if (stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.RowHeightChange)) {
      if (this.gridApi) {
        this.gridApi.updateGridOptions({ 'headerHeight': this.datagridApi.headerHeight });
      }
    }
    if (stringEqualsIgnoreCase(hook, AC_DATA_MANAGER_HOOK.Reset)) {
      if (this.isClientSideData) {
        // this.gridApi.doFilterAction(args.search);
      }
      else if (this.gridApi) {
        this.ignoreNextGetData = true;
        this.gridApi.refreshServerSide({ purge: true });
      }
    }
    else if (stringEqualsIgnoreCase(hook, AC_DATA_MANAGER_HOOK.RefreshRows)) {
      this.refreshRows();
    }
    else if (stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.RowAdd)) {
      this.handleRowAdd(args);
    }
    else if (stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.RowDelete)) {
      this.handleRowDelete(args);
    }
    else if (stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.RowFocus)) {
      this.handleRowFocus(args);
    }
    else if (stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.RowHeightChange)) {
      if (this.gridApi) {
        this.gridApi.updateGridOptions({ 'rowHeight': this.datagridApi.rowHeight });
      }
    }
    else if (stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.RowUpdate)) {
      this.handleRowUpdate(args);
    }
    else if (stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.UsePaginationChange)) {
      this.handleUsePaginationChange();
    }
    else if (stringEqualsIgnoreCase(hook, AcEnumDatagridRowNumbersHook.ShowRowNumbersChange)) {
      this.setColumnDefs();
    }
    else if (stringEqualsIgnoreCase(hook, AC_DATA_MANAGER_HOOK.SearchQueryChange)) {
      this.refreshRows();
    }
    else if (stringEqualsIgnoreCase(hook, AcEnumDatagridColumnsCustomizerHook.ShowColumnsCustomizerPanelChange)) {
      this.setColumnsCustomizerExtension();
    }
    else if (stringEqualsIgnoreCase(hook, AcEnumDatagridColumnsCustomizerHook.ToggleColumnsCustomizerPanel)) {
      this.handleColumnsCustomizerToggle(args);
    }
    else if (stringEqualsIgnoreCase(hook, AcEnumDatagridColumnDraggingHook.AllowColumnDraggingChange)) {
      this.setColumnDragging();
    }
    else if (stringEqualsIgnoreCase(hook, AcEnumDatagridDataExportXlsxHook.ExportData)) {
      this.handleDataExportXlsx(args);
    }

  }

  private handleRowAdd(args: any) {
    if (!this.gridApi || !this.datagridApi) return;

    const data: any = args.datagridRow?.data;
    if (!data) return;

    const rowIndex = args.datagridRow.index;
    if (this.isClientSideData) {
      const hookArgs: IAcDatagriOnAgGridRowAddHookArgs = {
        data: data
      };

      this.datagridApi.hooks.execute({ hook: AcEnumDatagridOnAgGridHook.BeforeRowAdd, args: hookArgs });
      this.gridApi.applyTransaction({ add: [data], addIndex: rowIndex });
      const rowNode: any = this.gridApi.getDisplayedRowAtIndex(rowIndex);
      this.gridApi.refreshCells({ rowNodes: [rowNode], force: true });
    }
    else {
      this.gridApi.applyServerSideTransaction({ add: [data], addIndex: rowIndex });
    }
    if (args.highlightCells) {
      const rowNode: any = this.gridApi.getDisplayedRowAtIndex(rowIndex);
      this.gridApi.flashCells({
        rowNodes: [rowNode], fadeDuration: 1000, flashDuration: 1000
      });
    }
    this.gridApi.refreshCells({
      columns: ['__internal_ac_datagrid__'],
      force: true
    });
  }

  private handleRowDelete(args: any) {
    if (!this.gridApi || !args.datagridRow?.data) return;

    if (this.isClientSideData) {
      this.gridApi.applyTransaction({ remove: [args.datagridRow.data] });
    }
    else {
      this.gridApi.applyServerSideTransaction({ remove: [args.datagridRow.data] });
    }
    this.gridApi.refreshCells({
      columns: ['__internal_ac_datagrid__'],
      force: true
    });
  }

  private handleRowFocus(args: IAcDatagridRowFocusHookArgs) {
    if (!this.gridApi) return;

    const pageSize = this.gridApi.paginationGetPageSize();
    const newIndex = args.index;
    let targetPage = 1;
    if (newIndex >= 0) {
      targetPage = Math.floor(newIndex / pageSize);
    }
    const activePage = this.gridApi.paginationGetCurrentPage();
    if (activePage != targetPage) {
      this.gridApi.paginationGoToPage(targetPage);
    }
    this.gridApi.ensureIndexVisible(newIndex, 'middle');
    if (args.highlightCells) {
      const node = this.gridApi.getDisplayedRowAtIndex(newIndex);
      if (node) {
        this.gridApi.flashCells({ rowNodes: [node] });
      }
    }
  }

  private handleRowUpdate(args: IAcDatagridRowUpdateHookArgs | any) {
    if (!this.gridApi || !args.datagridRow || !this.datagridApi) return;

    const data = args.datagridRow.data;
    const hookArgs: IAcDatagriOnAgGridRowUpdateHookArgs = {
      data: data
    };
    this.datagridApi.hooks.execute({ hook: AcEnumDatagridOnAgGridHook.BeforeRowUpdate, args: hookArgs });
    let rowNode: any;
    this.gridApi.forEachNode((node: IRowNode, index: number) => {
      if (node.data[this.rowKey] == args.datagridRow.rowId) {
        rowNode = node;
      }
    });
    if (rowNode) {
      if (this.isClientSideData) {
        rowNode.setData(data);
      }
      else {
        this.gridApi.applyServerSideTransaction({ update: [data] });
        rowNode.setData(data);
      }
      if (args.forceRefresh) {
        this.gridApi.refreshCells({ rowNodes: [rowNode], force: true });
      }
      if (args.highlightCells) {
        this.gridApi.flashCells({
          rowNodes: [rowNode], fadeDuration: 1000, flashDuration: 1000
        });
      }
    }
  }

  private handleUsePaginationChange() {
    if (!this.datagridApi) return;

    this.gridOptions['pagination'] = this.datagridApi.usePagination;
    if (this.gridApi) {
      this.gridApi.setGridOption('pagination', this.datagridApi.usePagination);
    }
  }

  override init(): void {
    if (!this.datagridApi) return;
    const datagrid = this.datagridApi.datagrid;
    datagrid.afterRowsContainer.setAttribute('style', "position:absolute;bottom:0px;height:0px;");
    this.datagridApi.dataManager.assignUniqueIdToData = true;
    this.rowKey = this.datagridApi.dataManager.uniqueIdKey;
    this.rowParentKey = this.datagridApi.dataManager.uniqueIdParentKey;
    this.leftFooterContainer = this.datagridApi.datagrid.ownerDocument.createElement('div');
    this.leftFooterContainer.style.display = 'flex';
    this.leftFooterContainer.classList.add("ac-datagrid-footer-left-container");
    this.rightFooterContainer = this.datagridApi.datagrid.ownerDocument.createElement('div');
    this.rightFooterContainer.style.display = 'flex';
    this.rightFooterContainer.classList.add("ac-datagrid-footer-right-container");
    datagrid.afterRowsContainer.classList.add("ac-datagrid-after-rows-container");

    this.columnsCustomizerButtonContainer = this.datagridApi.datagrid.ownerDocument.createElement('div');
    this.columnsCustomizerButtonContainer.innerHTML = `<button type="button" class="btn-ac-datagrid-columns-customizer"><ac-svg-icon>${ACI_SVG_SOLID.gear}</ac-svg-icon></button>`;
    (this.columnsCustomizerButtonContainer.querySelector('button') as HTMLElement).addEventListener('click', (event: any) => {
      this.isColumnsCustomizerOpen = !this.isColumnsCustomizerOpen;
      if (this.isColumnsCustomizerOpen) {
        this.gridApi?.openToolPanel('columns');
      }
      else {
        this.gridApi?.closeToolPanel();
      }
    });

    this.addButtonContainer = this.datagridApi.datagrid.ownerDocument.createElement('div');
    this.addButtonContainer.innerHTML = `<button type="button" class="btn-ac-datagrid-add">+ Add</button>`;
    (this.addButtonContainer.querySelector('button') as HTMLElement).addEventListener('click', (event: any) => {
      if (this.datagridApi) {
        this.datagridApi.dataManager.addRow();
      }
    });

    this.searchInputContainer = this.datagridApi.datagrid.ownerDocument.createElement('div');
    this.searchInputContainer.innerHTML = `<input type="text" class="input-ac-datagrid-search" placeholder="Search..."/>`;
    const searchInput: HTMLInputElement = this.searchInputContainer.querySelector('input') as HTMLInputElement;
    searchInput.addEventListener('input', (event: any) => {
      this.delayedCallback.add({
        callback: () => {
          if (this.datagridApi) {
            this.datagridApi.dataManager.searchQuery = searchInput.value;
          }
        }, duration: 300, key: 'searchInput'
      });
    });

    this.setDataSourceType();
    this.setAfterRowsFooterExtension();
    this.setColumnsCustomizerExtension();
    this.setColumnDraggingExtension();
    this.setRowNumbersExtension();
    this.setAddButtonDisplay();
    this.setSearchInputDisplay();
  }

  private initAgGrid() {
    if (!this.datagridApi) {
      return;
    }
    const modelType = this.datagridApi.dataManager.type == 'ondemand' ? 'serverSide' : 'clientSide';
    this.datagridApi.datagrid.innerHTML = "";
    this.datagridApi.datagrid.append(this.agGridElement);
    this.setRowNumbersExtension();
    this.agGridTreeTableExt.init({ agGridExtension: this });
    this.gridOptions['rowModelType'] = modelType;
    this.gridOptions['headerHeight'] = this.datagridApi.headerHeight;
    this.gridOptions['rowHeight'] = this.datagridApi.rowHeight;
    if (modelType == 'serverSide') {
      this.gridOptions['serverSideDatasource'] = this.onDemandDataSource;
    }
    if (this.gridApi) {
      this.gridApi.destroy();
      (this.gridApi as any) = null;
    }
    this.agGridElement.innerHTML = "";
    this.registerModules();
    this.gridApi = createGrid(this.agGridElement, this.gridOptions);
    this.agGridTreeTableExt.gridApi = this.gridApi;
    const pagingPanel = this.agGridElement.querySelector('.ag-paging-panel') as HTMLElement;
    if (pagingPanel) {
      this.leftFooterContainer!.innerHTML = '';
      this.leftFooterContainer?.appendChild(pagingPanel.querySelector('.ag-paging-page-summary-panel')!);
      this.leftFooterContainer?.appendChild(pagingPanel.querySelector('.ag-paging-row-summary-panel')!);
      this.leftFooterContainer?.appendChild(pagingPanel.querySelector('.ag-paging-page-size')!);
      pagingPanel.innerHTML = '';
      this.leftFooterContainer!.append(this.addButtonContainer!);
      this.leftFooterContainer!.append(this.searchInputContainer!);
      this.rightFooterContainer!.append(this.columnsCustomizerButtonContainer!);
      pagingPanel.append(this.leftFooterContainer!);
      pagingPanel.append(this.rightFooterContainer!);
    }
    const fullWidthContainer = this.agGridElement.querySelector('.ag-full-width-container') as HTMLElement;
    fullWidthContainer.append(this.datagridApi.datagrid.afterRowsContainer!);
    this.agGridEventHandler.init({ agGridExtension: this });
    this.agGridRowDragExt.init({ agGridExtension: this });
    this.agGridSelectionExt.init({ agGridExtension: this });
    if (this.state) {
      this.setState({ state: this.state });
    }
  }

  refreshRows() {
    if (!this.gridApi || !this.datagridApi) return;

    if (this.isClientSideData) {
      this.gridApi.setGridOption('quickFilterText', this.datagridApi?.dataManager.searchQuery ?? '');
    }
    else {
      this.datagridApi?.dataManager.reset();
      this.gridApi.refreshServerSide({ purge: true });
    }
  }

  private registerModules() {
    initAgGrid();
  }

  setAddButtonDisplay() {
    if (this.addButtonContainer && this.datagridApi) {
      if (this.datagridApi.showAddButton) {
        this.addButtonContainer.style.display = '';
      }
      else {
        this.addButtonContainer.style.display = 'none';
      }
    }
  }

  setAfterRowsFooterExtension() {
    if (this.datagridApi?.extensions[AC_DATAGRID_EXTENSION_NAME.AfterRowsFooter]) {
      this.afterRowsFooterExtension = this.datagridApi.extensions[AC_DATAGRID_EXTENSION_NAME.AfterRowsFooter] as AcDatagridAfterRowsFooterExtension;
      this.setAfterRowsFooter();
    }
  }

  setAfterRowsFooter() {
    if (this.afterRowsFooterExtension && this.datagridApi?.datagrid && this.afterRowsFooterExtension.footerElement) {
      let retryOperation: boolean = true;
      const containerElement = this.datagridApi.datagrid.querySelector(".ag-center-cols-viewport");
      if (containerElement) {
        retryOperation = false;
        containerElement.append(this.afterRowsFooterExtension.footerElement);
      }
      if (retryOperation) {
        this.delayedCallback.add({
          callback: () => {
            this.setAfterRowsFooter();
          }, duration: 100
        });
      }
    }
  }

  setColumnDefs() {
    const colDefs: ColDef[] = [];
    if (this.rowNumbersExtension && this.rowNumbersExtension.showRowNumbers == true) {
      colDefs.push({
        field: '__internal_ac_datagrid__',
        headerName: '',
        editable: false,
        sortable: false,
        suppressHeaderMenuButton: true,
        filter: false,
        valueGetter: 'node.rowIndex + 1',
        width: 32,
        pinned: 'left',
        cellClass: 'ag-row-number-cell',
        lockPosition: 'left',
        lockPinned: true,
        suppressSizeToFit: false,
        lockVisible: true,
        suppressNavigable: true,
        suppressMovable: true,
        cellStyle: { paddingLeft: 0, paddingRight: 0 }
      });
    }
    const beforeHookArgs: IAcDatagriOnAgGridColDefsChangeHookArgs = {
      colDefs: colDefs
    }
    this.datagridApi?.hooks.execute({ hook: AcEnumDatagridOnAgGridHook.BeforeColDefsChange, args: beforeHookArgs });
    if (this.datagridApi) {
      for (const column of this.datagridApi.datagridColumns) {
        const colDef: ColDef = acGetColDefFromAcDataGridColumn({ datagridColDef: column.columnDefinition });
        if (column.columnDefinition.cellRendererElement || column.columnDefinition.cellRendererFunction) {
          if (column.columnDefinition.cellRendererFunction) {
            colDef.cellRenderer = (params: any) => {
              if (this.datagridApi) {
                const datagridColumn = params.datagridColumn;
                const datagridCell = this.datagridApi?.getCell({ rowId: params.data[this.rowKey], column: datagridColumn }) as any;
                const args: IAcDatagridCellElementArgs = {
                  datagridApi: this.datagridApi!,
                  datagridCell: datagridCell
                }
                return column.columnDefinition.cellRendererFunction(args);
              }
              return '';
            };
          }
          else {
            colDef.cellRenderer = AcDatagridOnAgGridCellRenderer;
          }
          colDef.cellRendererParams = {
            agGridExtension: this,
            datagridColumn: column,
            datagridApi: this.datagridApi,
          };
        }

        if (column.columnDefinition.allowEdit) {
          if (column.columnDefinition.useCellEditorForRenderer) {
            colDef.editable = false;
            if (column.columnDefinition.cellEditorFunction) {
              colDef.cellRenderer = (params: any) => {
                if (this.datagridApi) {
                  const datagridColumn = params.datagridColumn;
                  const datagridCell = this.datagridApi?.getCell({ rowId: params.data[this.rowKey], column: datagridColumn }) as any;
                  const args: IAcDatagridCellElementArgs = {
                    datagridApi: this.datagridApi!,
                    datagridCell: datagridCell
                  }
                  return column.columnDefinition.cellEditorFunction(args);
                }
                return '';
              };
            }
            else {
              colDef.cellRenderer = AcDatagridOnAgGridCellEditor;
            }
            colDef.cellRendererParams = {
              agGridExtension: this,
              datagridColumn: column,
              datagridApi: this.datagridApi,
            };
          }
          else {
            colDef.cellEditor = AcDatagridOnAgGridCellEditor;
            colDef.cellEditorParams = {
              agGridExtension: this,
              datagridColumn: column,
              datagridApi: this.datagridApi,
            };
          }
        }
        colDefs.push(colDef);
      }
    }
    this.colDefs = colDefs;
    const hookArgs: IAcDatagriOnAgGridColDefsChangeHookArgs = {
      colDefs: colDefs
    }
    this.datagridApi?.hooks.execute({ hook: AcEnumDatagridOnAgGridHook.ColDefsChange, args: hookArgs });
    this.gridOptions['columnDefs'] = this.colDefs;
    if (this.gridApi) {
      this.gridApi.setGridOption('columnDefs', this.colDefs);
    }
  }

  setColumnDraggingExtension() {
    if (this.datagridApi?.extensions[AC_DATAGRID_EXTENSION_NAME.ColumnDragging]) {
      this.columnDraggingExtension = this.datagridApi.extensions[AC_DATAGRID_EXTENSION_NAME.ColumnDragging] as AcDatagridColumnDraggingExtension;
      this.setColumnDragging();
    }
  }

  setColumnDragging() {
    if (this.columnDraggingExtension) {
      this.allowColumnDragging = this.columnDraggingExtension.allowColumnDragging;
      this.setColumnDefs();
    }
  }

  setColumnsCustomizerExtension() {
    if (this.datagridApi?.extensions[AC_DATAGRID_EXTENSION_NAME.ColumnsCustomizer]) {
      this.columnsCustomizerExtension = this.datagridApi.extensions[AC_DATAGRID_EXTENSION_NAME.ColumnsCustomizer] as AcDatagridColumnsCustomizerExtension;
      this.setShowColumnsCustomizer();
    }
  }

  setDataSourceType() {
    if (!this.datagridApi) return;

    if (this.datagridApi.dataManager.type == 'offline') {
      this.isClientSideData = true;
      this.gridOptions['rowModelType'] = 'clientSide';
      this.gridOptions['rowData'] = this.datagridApi.dataManager.data;
    }
    else {
      this.isClientSideData = false;
      this.gridOptions['rowModelType'] = 'serverSide';
      this.gridOptions['serverSideDatasource'] = this.onDemandDataSource;
    }
    this.initAgGrid();
  }

  setDataExportXlsxExtension() {
    if (this.datagridApi && this.datagridApi.extensions[AC_DATAGRID_EXTENSION_NAME.DataExportXlsx]) {
      this.dataExportXlsxExtension = this.datagridApi.extensions[AC_DATAGRID_EXTENSION_NAME.DataExportXlsx] as AcDatagridDataExportXlsxExtension;
    }
  }

  setRowNumbersExtension() {
    if (this.datagridApi?.extensions[AC_DATAGRID_EXTENSION_NAME.RowNumbers]) {
      this.rowNumbersExtension = this.datagridApi.extensions[AC_DATAGRID_EXTENSION_NAME.RowNumbers] as AcDatagridRowNumbersExtension;
      this.setColumnDefs();
    }
  }

  setSearchInputDisplay() {
    if (this.searchInputContainer && this.datagridApi) {
      if (this.datagridApi.showSearchInput) {
        this.searchInputContainer.style.display = '';
      }
      else {
        this.searchInputContainer.style.display = 'none';
      }
    }
  }

  setShowColumnsCustomizer() {
    let sideBarOptions: any = undefined;
    if (this.columnsCustomizerExtension && this.columnsCustomizerExtension.showColumnCustomizerPanel == true) {
      sideBarOptions = {
        toolPanels: [
          {
            id: 'columns',
            labelDefault: 'Columns',
            labelKey: 'columns',
            iconKey: 'columns',
            toolPanel: 'agColumnsToolPanel',
            toolPanelParams: {
              suppressPivotMode: true,
              suppressRowGroups: true,
              suppressValues: true,
              suppressPivots: true,
            }
          }
        ],
        defaultToolPanel: '',
      };
    }
    this.gridOptions['sideBar'] = sideBarOptions;
    if (this.gridApi) {
      this.gridApi.setGridOption('sideBar', sideBarOptions);
    }
  }

  override setState({ state }: { state: any; }): void {
    this.state = state;
    if (state && this.gridApi) {
      this.agGridEventHandler.pauseEvents = true;
      this.gridApi.setState(state);
      this.delayedCallback.add({
        callback: () => {
          this.agGridEventHandler.pauseEvents = false;
        }, duration: 100
      });
    }
  }

  setTreeTableExtension() {
    if (this.datagridApi && this.datagridApi.extensions[AC_DATAGRID_EXTENSION_NAME.TreeTable]) {
      this.treeTableExtension = this.datagridApi.extensions[AC_DATAGRID_EXTENSION_NAME.TreeTable] as AcDatagridTreeTableExtension;
    }
  }
}
export const AC_DATAGRID_ON_AG_GRID_EXTENSION_NAME = 'agGridOnAcDatagrid';
export const AgGridOnAcDatagrid: IAcDatagridExtension = {
  extensionName: AC_DATAGRID_ON_AG_GRID_EXTENSION_NAME,
  extensionClass: AcDatagridOnAgGridExtension
}
