/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @nx/enforce-module-boundaries */
import './../../../../../packages/browser/ac-data-dictionary-editor/src/lib/css/ac-data-dictionary-editor.css';
import './../../../../../packages/browser/extensions/datagrid/ac-datagrid-on-ag-grid/src/lib/css/ac-datagrid-on-ag-grid.css';
import { AcDataDictionaryEditor, AcDDEApi } from '@autocode-ts/ac-data-dictionary-editor';
import { PageHeader } from '../../components/page-header/page-header.component';
import { dataDictionaryJson as actDataDictionary } from './../../../../data/accountea-pro';
// import { dataDictionaryJson as unifiDataDictionary } from './../../../../data/unifi-data-dictionary';
import { AcDataDictionary } from '@autocode-ts/ac-data-dictionary';
import { AcDDDatagridElement, AcDDInputElement, AcDDInputFieldElement, AcDDInputManager } from '@autocode-ts/ac-data-dictionary-components';
import { AcDatagrid, AcDatagridApi, AcDatagridColumnDraggingExtension, AcDatagridColumnsCustomizerExtension, AcDatagridDataExportXlsxExtension, AcDatagridExtensionManager, AcDatagridRowDraggingExtension, AcDatagridRowNumbersExtension, AcDatagridRowSelectionExtension, AC_DATAGRID_EXTENSION_NAME, AcForm } from '@autocode-ts/ac-browser';
import { AcDatagridOnAgGridExtension, AC_DATAGRID_ON_AG_GRID_EXTENSION_NAME, AgGridOnAcDatagrid } from '@autocode-ts/ac-datagrid-on-ag-grid';
import { IAcOnDemandRequestArgs, IAcOnDemandResponseArgs } from '@autocode-ts/autocode';
import { ProductCategorySelectInput } from '../../components/inputs/product-category-select-input.element';

export class DataDictionaryComponentsPage extends HTMLElement {
  accountTargetInput!:AcDDInputFieldElement;
  dataDictionaryEditor!: AcDataDictionaryEditor;
  private form: AcForm | null = null;

  datagrid!: AcDatagrid;
  ddDatagrid!: AcDDDatagridElement;
  datagridApi!: AcDatagridApi;
  pageHeader: PageHeader = new PageHeader();
  agGridExtension!: AcDatagridOnAgGridExtension;
  columnDraggingExtension!: AcDatagridColumnDraggingExtension;
  columnsCustomizerExtension!: AcDatagridColumnsCustomizerExtension;
  dataExportXlsxExtension!: AcDatagridDataExportXlsxExtension;
  rowDraggingExtension!: AcDatagridRowDraggingExtension;
  rowNumbersExtension!: AcDatagridRowNumbersExtension;
  rowSelectionExtension!: AcDatagridRowSelectionExtension;

  editorApi!: AcDDEApi;
  // pageHeader: PageHeader = new PageHeader();
  ddInput?: AcDDInputElement;
  async connectedCallback() {
    // AcDDInputManager.registerColumnTypeInput({columnType:AcEnum})
    const html = `
    `;
    this.innerHTML = html;
    this.style.height = '100vh;'
    this.prepend(this.pageHeader.element);
    this.pageHeader.pageTitle = 'Data Dictionary Components';
    AcDataDictionary.registerDataDictionary({ jsonData: actDataDictionary });
    AcDDInputManager.registerForeignKeyInput({
      primaryTableName:'act_product_categories',
      inputDefinition:{
        inputElement:ProductCategorySelectInput
      }
    });
    AcDDInputManager.registerForeignKeyInput({
      primaryTableName:'act_product_categories',
      inputDefinition:{
        inputElement:ProductCategorySelectInput
      }
    });
    const trnsEntiresView = AcDataDictionary.getView({viewName:'act_vw_transaction_entries'});
    for(const col of trnsEntiresView!.viewColumns){
      console.log(`${col.columnName} => ${col.getColumnTitle()}`);
    }
    console.log(trnsEntiresView);

    const ledgerAccountView = AcDataDictionary.getView({viewName:'act_vw_ledger_accounts'});
    for(const col of ledgerAccountView!.viewColumns){
      console.log(`${col.columnName} => ${col.getColumnTitle()}`);
    }
    console.log(ledgerAccountView);
    // console.log(AcDataDictionary.dataDictionaries);
    // console.log(AcDDInputFieldElement);
    // console.log(AcDDDatagridElement);
    this.innerHTML = `
    <ac-form id="test-form">
    <ac-dd-input-field class="account-target-input" table-name="act_ledger_accounts" column-name="reflecting_statement" name="reflecting_statement" value="ADJUSTMENT"></ac-dd-input-field>
    <ac-dd-input-field class="account-target-input" table-name="act_sale_invoices" column-name="sale_invoice_status" name="sale_invoice_status" value="SETTLED"></ac-dd-input-field>
    <ac-dd-input-field class="account-target-input" table-name="act_products" column-name="product_category_id" name="product_category_id"></ac-dd-input-field>
    <button type="submit">Submit</button>
    </ac-form>
    <div style="height:80vh">
    <ac-dd-datagrid source-value="accounts" source-type="table"></ac-dd-datagrid>
    </div>
    <div style="height:80vh">
    <ac-dd-datagrid source-value="accounts" source-type="table"></ac-dd-datagrid>
    </div>
    `;
    this.accountTargetInput = this.querySelector('.account-target-input') as AcDDInputFieldElement;
    setTimeout(() => {
      this.accountTargetInput.setAttribute('value','TRADING ACCOUNT');
      console.log("Updated Account Target");
    }, 5000);

    this.form = this.querySelector('#test-form')!;
    const object = this;
    this.form.addEventListener('submit', (e: any) => {
      e.preventDefault();
      console.log(object.form?.valuesToJsonObject());
      console.dir(object.form);
      const output = object.querySelector('#form-output');
      if (output) {
        // output.textContent = JSON.stringify(e.detail.values, null, 2);
      }
    });

    this.ddDatagrid = this.querySelector('ac-dd-datagrid')!;
    AcDatagridExtensionManager.register(AgGridOnAcDatagrid);
    this.datagrid = this.ddDatagrid.datagrid;
    this.datagridApi = this.datagrid.datagridApi;
    this.agGridExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_ON_AG_GRID_EXTENSION_NAME }) as AcDatagridOnAgGridExtension;
    this.columnDraggingExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.ColumnDragging }) as AcDatagridColumnDraggingExtension;
    this.columnsCustomizerExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.ColumnsCustomizer }) as AcDatagridColumnsCustomizerExtension;
    this.dataExportXlsxExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.DataExportXlsx }) as AcDatagridDataExportXlsxExtension;
    this.rowNumbersExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowNumbers }) as AcDatagridRowNumbersExtension;
    this.rowSelectionExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowSelection }) as AcDatagridRowSelectionExtension;
    this.rowDraggingExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowDragging }) as AcDatagridRowDraggingExtension;


    this.datagridApi.usePagination = true;

    this.columnsCustomizerExtension.showColumnCustomizerPanel = true;

    this.rowNumbersExtension.showRowNumbers = true;

    this.rowSelectionExtension.allowSelection = true;
    this.rowSelectionExtension.allowMultipleSelection = true;

    this.ddDatagrid.onDemandFunction = async (args:IAcOnDemandRequestArgs) =>{
            const pageSize: number = args.rowsCount!;
            const pageNumber: number = args.pageNumber!;
            const res = await fetch(`http://localhost:8081/api/accounts/get?page_size=${pageSize}&page_number=${pageNumber}`);
            if (res.ok) {
              const response = await res.json();
              const callbackResponse:IAcOnDemandResponseArgs  = {
                data:response.rows,
                totalCount:response.total_rows
              };
              args.successCallback(callbackResponse);
              this.datagridApi.data = response.rows;
            }
            return
          }
    // new Ac
  }


}
