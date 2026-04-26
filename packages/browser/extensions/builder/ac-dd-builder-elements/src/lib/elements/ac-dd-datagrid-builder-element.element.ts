import { AcBuilderElement, IAcBuilderElement, IAcBuilderElementInitArgs } from "@autocode-ts/ac-builder";
import { AcDatagridElement, AcDatagridApi, AcDatagridColumnDraggingExtension, AcDatagridColumnsCustomizerExtension, AcDatagridDataExportXlsxExtension, AcDatagridExtensionManager, AcDatagridOnDemandDataSource, AcDatagridRowDraggingExtension, AcDatagridRowNumbersExtension, AcDatagridRowSelectionExtension, AC_DATAGRID_EXTENSION_NAME } from "@autocode-ts/ac-browser";
import { ACI_SVG_SOLID } from "@autocode-ts/ac-icons";
import { AcDDDatagridElement } from "@autocode-ts/ac-data-dictionary-components";
import { AcDatagridOnAgGridExtension, AC_DATAGRID_ON_AG_GRID_EXTENSION_NAME, AgGridOnAcDatagrid } from '@autocode-ts/ac-datagrid-on-ag-grid';
import { IAcOnDemandRequestArgs } from "@autocode-ts/autocode";

export class AcDDDatagridBuilderElement extends AcBuilderElement {

  get data(): any[] {
    return this.ddDatagrid.data;
  }
  set data(value: any[]) {
    this.ddDatagrid.data = value;
  }

  get dataDictionary(): string {
    return this.ddDatagrid.dataDictionary;
  }
  set dataDictionary(value: string) {
    this.ddDatagrid.dataDictionary = value;
  }

  get columns(): any {
    return {
      "columnDefinitions": this.ddDatagrid.columnDefinitions,
      "excludeColumns": this.ddDatagrid.excludeColumns,
      "includeColumns": this.ddDatagrid.includeColumns,
    }
  }
  set columns(value: any) {
    if (value) {
      if (value['columnDefinitions']) {
        this.ddDatagrid.columnDefinitions = value['columnDefinitions'];
      }
      if (value['excludeColumns']) {
        this.ddDatagrid.excludeColumns = value['excludeColumns'];
      }
      if (value['includeColumns']) {
        this.ddDatagrid.includeColumns = value['includeColumns'];
      }
    }
    else {
      this.ddDatagrid.columnDefinitions = [];
      this.ddDatagrid.excludeColumns = [];
      this.ddDatagrid.includeColumns = [];
    }
  }

  get sourceType(): string {
    return this.ddDatagrid.sourceType;
  }
  set sourceType(value: string) {
    this.ddDatagrid.sourceType = value;
    this.setDatagridDisplay();
  }

  get sourceValue(): string | null {
    return this.ddDatagrid.sourceValue;
  }
  set sourceValue(value: string) {
    this.ddDatagrid.sourceValue = value;
    this.setDatagridDisplay();
  }

  get onDemandFunction(): any {
    return this.ddDatagrid.onDemandFunction;
  };
  set onDemandFunction(value: (args: IAcOnDemandRequestArgs) => void) {
    this.ddDatagrid.onDemandFunction = value;
    this.dataSource = this.datagridApi.dataSource;
    this.datagridApi.dataSource.getData();
  }

  ddDatagrid: AcDDDatagridElement = new AcDDDatagridElement();
  datagridApi: AcDatagridApi;
  datagrid:AcDatagridElement;

  agGridExtension!: AcDatagridOnAgGridExtension;
  columnDraggingExtension!: AcDatagridColumnDraggingExtension;
  columnsCustomizerExtension!: AcDatagridColumnsCustomizerExtension;
  dataExportXlsxExtension!: AcDatagridDataExportXlsxExtension;
  dataSource!: AcDatagridOnDemandDataSource;
  rowDraggingExtension!: AcDatagridRowDraggingExtension;
  rowNumbersExtension!: AcDatagridRowNumbersExtension;
  rowSelectionExtension!: AcDatagridRowSelectionExtension;

  constructor() {
    super();
    this.element = this.ddDatagrid;
    this.datagrid = this.ddDatagrid.datagrid;
    this.datagridApi = this.ddDatagrid.datagridApi;
    AcDatagridExtensionManager.register(AgGridOnAcDatagrid)
    this.columnDraggingExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.ColumnDragging }) as AcDatagridColumnDraggingExtension;
    this.columnsCustomizerExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.ColumnsCustomizer }) as AcDatagridColumnsCustomizerExtension;
    this.dataExportXlsxExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.DataExportXlsx }) as AcDatagridDataExportXlsxExtension;
    this.rowNumbersExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowNumbers }) as AcDatagridRowNumbersExtension;
    this.rowSelectionExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowSelection }) as AcDatagridRowSelectionExtension;
    this.rowDraggingExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowDragging }) as AcDatagridRowDraggingExtension;
    this.agGridExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_ON_AG_GRID_EXTENSION_NAME }) as AcDatagridOnAgGridExtension;
    this.datagridApi.events.subscribeAllEvents({callback:(event:string,args:any)=>{
      this.events.execute({event,args});
    }});
  }

  override initBuilder({ args }: { args?: IAcBuilderElementInitArgs; }): void {
    this.element.style.height = "100%";
  }

  override init({ args }: { args: IAcBuilderElementInitArgs }): void {
    this.element.style.height = "100%";
    this.setDatagridDisplay();
  }

  private setDatagridDisplay() {
    if (this.ddDatagrid.sourceType && this.ddDatagrid.sourceValue) {
      this.element.innerHTML = '';
      this.element.appendChild(this.ddDatagrid);
      this.datagridApi.dataSource.getData();
    }
    else {
      this.element.innerHTML = "Data Dictionary Datagrid";
    }
  }


}

export const AC_BUILDER_DD_DATAGRID_ELEMENT: IAcBuilderElement = {
  category: "Data Dictionary",
  name: "ddDatagrid",
  tag: "div",
  title: "Datagrid",
  keepHtml: false,
  events: [
    { name: 'activeRowChange', title: 'Active Row Change', category: 'Datagrid' },
    { name: 'cellBlur', title: 'Cell Blur', category: 'Datagrid' },
    { name: 'cellClick', title: 'Cell Click', category: 'Datagrid' },
    { name: 'cellDoubleClick', title: 'Cell Double Click', category: 'Datagrid' },
    { name: 'cellDrag', title: 'Cell Drag', category: 'Datagrid' },
    { name: 'cellDragEnd', title: 'Cell Drag End', category: 'Datagrid' },
    { name: 'cellDragEnter', title: 'Cell Drag Enter', category: 'Datagrid' },
    { name: 'cellDragLeave', title: 'Cell Drag Leave', category: 'Datagrid' },
    { name: 'cellDragOver', title: 'Cell Drag Over', category: 'Datagrid' },
    { name: 'cellDragStart', title: 'Cell Drag Start', category: 'Datagrid' },
    { name: 'cellDragDrop', title: 'Cell Drag Drop', category: 'Datagrid' },
    { name: 'cellEditorElementInit', title: 'Cell Editor Element Init', category: 'Datagrid' },
    { name: 'cellEditingStart', title: 'Cell Editing Start', category: 'Datagrid' },
    { name: 'cellEditingStop', title: 'Cell Editing Stop', category: 'Datagrid' },
    { name: 'cellFocus', title: 'Cell Focus', category: 'Datagrid' },
    { name: 'cellHover', title: 'Cell Hover', category: 'Datagrid' },
    { name: 'cellKeyDown', title: 'Cell Key Down', category: 'Datagrid' },
    { name: 'cellKeyPress', title: 'Cell Key Press', category: 'Datagrid' },
    { name: 'cellKeyUp', title: 'Cell Key Up', category: 'Datagrid' },
    { name: 'cellMouseDown', title: 'Cell Mouse Down', category: 'Datagrid' },
    { name: 'cellMouseEnter', title: 'Cell Mouse Enter', category: 'Datagrid' },
    { name: 'cellMouseLeave', title: 'Cell Mouse Leave', category: 'Datagrid' },
    { name: 'cellMouseMove', title: 'Cell Mouse Move', category: 'Datagrid' },
    { name: 'cellMouseOver', title: 'Cell Mouse Over', category: 'Datagrid' },
    { name: 'cellMouseUp', title: 'Cell Mouse Up', category: 'Datagrid' },
    { name: 'cellRendererElementInit', title: 'Cell Renderer Element Init', category: 'Datagrid' },
    { name: 'cellTouchCancel', title: 'Cell Touch Cancel', category: 'Datagrid' },
    { name: 'cellTouchEnd', title: 'Cell Touch End', category: 'Datagrid' },
    { name: 'cellTouchMove', title: 'Cell Touch Move', category: 'Datagrid' },
    { name: 'cellTouchStart', title: 'Cell Touch Start', category: 'Datagrid' },
    { name: 'cellValueChange', title: 'Cell Value Change', category: 'Datagrid' },
    { name: 'columnDefinitionsSet', title: 'Column Definitions Set', category: 'Datagrid' },
    { name: 'columnBlur', title: 'Column Blur', category: 'Datagrid' },
    { name: 'columnClick', title: 'Column Click', category: 'Datagrid' },
    { name: 'columnDataChange', title: 'Column Data Change', category: 'Datagrid' },
    { name: 'columnDoubleClick', title: 'Column Double Click', category: 'Datagrid' },
    { name: 'columnDragEnd', title: 'Column Drag End', category: 'Datagrid' },
    { name: 'columnDragEnter', title: 'Column Drag Enter', category: 'Datagrid' },
    { name: 'columnDragLeave', title: 'Column Drag Leave', category: 'Datagrid' },
    { name: 'columnDragOver', title: 'Column Drag Over', category: 'Datagrid' },
    { name: 'columnDragStart', title: 'Column Drag Start', category: 'Datagrid' },
    { name: 'columnDragDrop', title: 'Column Drag Drop', category: 'Datagrid' },
    { name: 'columnFilterChange', title: 'Column Filter Change', category: 'Datagrid' },
    { name: 'columnFocus', title: 'Column Focus', category: 'Datagrid' },
    { name: 'columnHeaderClick', title: 'Column Header Click', category: 'Datagrid' },
    { name: 'columnHover', title: 'Column Hover', category: 'Datagrid' },
    { name: 'columnKeyDown', title: 'Column Key Down', category: 'Datagrid' },
    { name: 'columnKeyPress', title: 'Column Key Press', category: 'Datagrid' },
    { name: 'columnKeyUp', title: 'Column Key Up', category: 'Datagrid' },
    { name: 'columnMouseDown', title: 'Column Mouse Down', category: 'Datagrid' },
    { name: 'columnMouseEnter', title: 'Column Mouse Enter', category: 'Datagrid' },
    { name: 'columnMouseLeave', title: 'Column Mouse Leave', category: 'Datagrid' },
    { name: 'columnMouseMove', title: 'Column Mouse Move', category: 'Datagrid' },
    { name: 'columnMouseOver', title: 'Column Mouse Over', category: 'Datagrid' },
    { name: 'columnMouseUp', title: 'Column Mouse Up', category: 'Datagrid' },
    { name: 'columnResize', title: 'Column Resize', category: 'Datagrid' },
    { name: 'columnSortChange', title: 'Column Sort Change', category: 'Datagrid' },
    { name: 'columnTouchCancel', title: 'Column Touch Cancel', category: 'Datagrid' },
    { name: 'columnTouchEnd', title: 'Column Touch End', category: 'Datagrid' },
    { name: 'columnTouchMove', title: 'Column Touch Move', category: 'Datagrid' },
    { name: 'columnTouchStart', title: 'Column Touch Start', category: 'Datagrid' },
    { name: 'columnPositionChange', title: 'Column Position Change', category: 'Datagrid' },
    { name: 'columnVisibilityChange', title: 'Column Visibility Change', category: 'Datagrid' },
    { name: 'displayedRowsChange', title: 'Displayed Rows Change', category: 'Datagrid' },
    { name: 'paginationChange', title: 'Pagination Change', category: 'Datagrid' },
    { name: 'rowAdd', title: 'Row Add', category: 'Datagrid' },
    { name: 'rowBlur', title: 'Row Blur', category: 'Datagrid' },
    { name: 'rowClick', title: 'Row Click', category: 'Datagrid' },
    { name: 'rowDataChange', title: 'Row Data Change', category: 'Datagrid' },
    { name: 'rowDelete', title: 'Row Delete', category: 'Datagrid' },
    { name: 'rowDoubleClick', title: 'Row Double Click', category: 'Datagrid' },
    { name: 'rowDrag', title: 'Row Drag', category: 'Datagrid' },
    { name: 'rowDragCancel', title: 'Row Drag Cancel', category: 'Datagrid' },
    { name: 'rowDragDrop', title: 'Row Drag Drop', category: 'Datagrid' },
    { name: 'rowDragEnd', title: 'Row Drag End', category: 'Datagrid' },
    { name: 'rowDragEnter', title: 'Row Drag Enter', category: 'Datagrid' },
    { name: 'rowDragLeave', title: 'Row Drag Leave', category: 'Datagrid' },
    { name: 'rowDragOver', title: 'Row Drag Over', category: 'Datagrid' },
    { name: 'rowDragStart', title: 'Row Drag Start', category: 'Datagrid' },
    { name: 'rowEditingStart', title: 'Row Editing Start', category: 'Datagrid' },
    { name: 'rowEditingStop', title: 'Row Editing Stop', category: 'Datagrid' },
    { name: 'rowFocus', title: 'Row Focus', category: 'Datagrid' },
    { name: 'rowHover', title: 'Row Hover', category: 'Datagrid' },
    { name: 'rowKeyDown', title: 'Row Key Down', category: 'Datagrid' },
    { name: 'rowKeyPress', title: 'Row Key Press', category: 'Datagrid' },
    { name: 'rowKeyUp', title: 'Row Key Up', category: 'Datagrid' },
    { name: 'rowMouseDown', title: 'Row Mouse Down', category: 'Datagrid' },
    { name: 'rowMouseEnter', title: 'Row Mouse Enter', category: 'Datagrid' },
    { name: 'rowMouseLeave', title: 'Row Mouse Leave', category: 'Datagrid' },
    { name: 'rowMouseMove', title: 'Row Mouse Move', category: 'Datagrid' },
    { name: 'rowMouseOver', title: 'Row Mouse Over', category: 'Datagrid' },
    { name: 'rowMouseUp', title: 'Row Mouse Up', category: 'Datagrid' },
    { name: 'rowPositionChange', title: 'Row Position Change', category: 'Datagrid' },
    { name: 'rowSelectionChange', title: 'Row Selection Change', category: 'Datagrid' },
    { name: 'rowTouchCancel', title: 'Row Touch Cancel', category: 'Datagrid' },
    { name: 'rowTouchEnd', title: 'Row Touch End', category: 'Datagrid' },
    { name: 'rowTouchMove', title: 'Row Touch Move', category: 'Datagrid' },
    { name: 'rowTouchStart', title: 'Row Touch Start', category: 'Datagrid' },
    { name: 'rowUpdate', title: 'Row Update', category: 'Datagrid' },
    { name: 'stateChange', title: 'State Change', category: 'Datagrid' },
    { name: 'sortOrderChange', title: 'Sort Order Change', category: 'Datagrid' },
    { name: 'totalRowsChange', title: 'Total Rows Change', category: 'Datagrid' }
  ],
  properties: [
    {
      name: 'sourceType', 'category': 'Data Dictionary', title: 'Source Type', type: 'select', inputProperties: {
        'options': [
          { label: 'Sql', value: 'SQL' },
          { label: 'Table', value: 'TABLE' },
          { label: 'View', value: 'VIEW' }
        ]
      }
    },
    { name: 'sourceValue', 'category': 'Data Dictionary', title: 'Source Value', type: 'ddSelectDatagridSourceValueInput' },
    { name: 'columns', 'category': 'Data Dictionary', title: 'Columns', type: 'ddDatagridColumns' },
    { name: 'data', 'category': 'Data Dictionary', title: 'Data', type: 'selectClassProperty' },
    { name: 'onDemandFunction', 'category': 'Data Dictionary', title: 'On Demand Data Function', type: 'selectClassProperty' },
  ],
  mediaSvg: ACI_SVG_SOLID.table,
  instanceClass: AcDDDatagridBuilderElement
};
