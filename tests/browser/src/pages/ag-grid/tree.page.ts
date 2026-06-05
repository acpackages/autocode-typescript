import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import {
  AcDatagridElement,
  AC_DATAGRID_EXTENSION_NAME,
  AcDatagridTreeTableExtension,
  AcDatagridRowNumbersExtension,
  AcDatagridColumnsCustomizerExtension,
  AcDatagridDataExportXlsxExtension,
  AcDatagridRowSelectionExtension,
  AcDatagridRowDraggingExtension
} from "@autocode-ts/ac-browser";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'ag-grid-tree-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AGGrid Tree Data'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="p-2 flex-fill overflow-hidden">
        <ac-datagrid #datagrid class="h-100"></ac-datagrid>
      </div>
    </div>
  `
})
export class AggridTreePage {
  @AcViewChild('#datagrid') datagrid!: AcDatagridElement;

  dropdownItems: IAppMenuItem[] = [
    { label: 'Display Options', isHeader: true },
    { label: 'Toggle Row Numbers', callback: () => this.toggleRowNumbers() },
    { label: 'Toggle Customizer', callback: () => this.toggleCustomizer() },
    { label: 'Export to XLSX', callback: () => this.exportXlsx() },
    { label: 'Data Actions', isHeader: true },
    { label: 'Select All', callback: () => this.selectAll() },
    { label: 'Log Selected', callback: () => this.logSelected() }
  ];

  rowNumbersExt!: AcDatagridRowNumbersExtension;
  customizerExt!: AcDatagridColumnsCustomizerExtension;
  exportExt!: AcDatagridDataExportXlsxExtension;
  selectionExt!: AcDatagridRowSelectionExtension;
  treeExt!: AcDatagridTreeTableExtension;

  async acOnInit() {
    const api = this.datagrid.datagridApi;

    // Enable extensions
    this.rowNumbersExt = api.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowNumbers }) as AcDatagridRowNumbersExtension;
    this.customizerExt = api.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.ColumnsCustomizer }) as AcDatagridColumnsCustomizerExtension;
    this.exportExt = api.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.DataExportXlsx }) as AcDatagridDataExportXlsxExtension;
    this.selectionExt = api.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowSelection }) as AcDatagridRowSelectionExtension;
    this.treeExt = api.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.TreeTable }) as AcDatagridTreeTableExtension;
    api.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowDragging });
    api.enableExtension({ extensionName: 'agGridOnAcDatagrid' });

    // Config
    api.usePagination = false;
    this.selectionExt.allowMultipleSelection = true;
    this.treeExt.treeDataParentKey = 'category_id';
    this.treeExt.treeDataChildKey = 'parent_category_id';
    this.treeExt.treeDataDisplayKey = 'name';

    api.columnDefinitions = [
        { field: 'name', title: "Name", width: 300 },
        { field: 'description', title: "Description", width: 500 },
        { field: 'category_id', title: "ID", width: 100 },
        { field: 'parent_category_id', title: "Parent ID", width: 100 },
        { field: 'level', title: "Level", width: 80 }
    ];

    // Load data
    try {
      const res = await fetch('http://autocode.localhost/tests/ac-web/mvc-test/api/product_categories/get?page_size=1500');
      if (res.ok) {
        const response = await res.json();
        api.data = response.rows;
      } else {
        // Fallback or mock data if API is down
        console.warn('API fetch failed, using mock tree data');
        api.data = this.getMockTreeData();
      }
    } catch (e) {
      console.warn('Fetch error:', e);
      api.data = this.getMockTreeData();
    }
  }

  toggleRowNumbers() {
    this.rowNumbersExt.showRowNumbers = !this.rowNumbersExt.showRowNumbers;
  }

  toggleCustomizer() {
    this.customizerExt.toggleColumnsCustomizer();
  }

  exportXlsx() {
    this.exportExt.exportData({ fileName: 'TreeDataExport.xlsx' });
  }

  selectAll() {
    this.selectionExt.setAllRowsSelection({ isSelected: true });
  }

  logSelected() {
    console.log('Selected Rows:', this.selectionExt.getSelectedRowsData());
  }

  private getMockTreeData() {
    return [
      { category_id: 1, parent_category_id: null, name: 'Root Category', description: 'Level 0', level: 0 },
      { category_id: 2, parent_category_id: 1, name: 'Sub Category A', description: 'Level 1', level: 1 },
      { category_id: 3, parent_category_id: 1, name: 'Sub Category B', description: 'Level 1', level: 1 },
      { category_id: 4, parent_category_id: 2, name: 'Leaf A.1', description: 'Level 2', level: 2 },
      { category_id: 5, parent_category_id: 3, name: 'Leaf B.1', description: 'Level 2', level: 2 },
    ];
  }
}
