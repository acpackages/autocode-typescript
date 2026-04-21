import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDataDictionary } from "@autocode-ts/ac-data-dictionary";
import { AcDDInputManager } from "@autocode-ts/ac-data-dictionary-components";
import {
  AcDatagridExtensionManager,
  AcForm
} from "@autocode-ts/ac-browser";
import { AgGridOnAcDatagrid } from "@autocode-ts/ac-datagrid-on-ag-grid";

import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'data-dictionary-components-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'Data Dictionary Components'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="container py-4 flex-fill overflow-auto">
        <div class="row g-4">
          <!-- Form Section -->
          <div class="col-lg-5">
            <div class="card shadow-sm border-0 h-100">
               <div class="card-header bg-primary text-white py-3">
                  <h6 class="mb-0 fw-bold">Dynamic DD Form</h6>
               </div>
               <div class="card-body p-4">
                  <ac-form #form>
                     <div class="mb-3">
                        <label class="form-label small text-muted">Ledger Reflecting Statement</label>
                        <ac-dd-input-field table-name="act_ledger_accounts" column-name="reflecting_statement" name="reflecting_statement" value="ADJUSTMENT"></ac-dd-input-field>
                     </div>
                     <div class="mb-3">
                        <label class="form-label small text-muted">Invoice Status</label>
                        <ac-dd-input-field table-name="act_sale_invoices" column-name="sale_invoice_status" name="sale_invoice_status" value="SETTLED"></ac-dd-input-field>
                     </div>
                     <div class="mb-4">
                        <label class="form-label small text-muted">Product Category (Foreign Key)</label>
                        <ac-dd-input-field table-name="act_products" column-name="product_category_id" name="product_category_id"></ac-dd-input-field>
                     </div>
                     <button class="btn btn-primary w-100 fw-bold" (click)="submitForm()">Submit Data Dictionary Form</button>
                  </ac-form>

                  <div class="mt-4 p-3 bg-light rounded border" *if="formValues">
                     <h6 class="small fw-bold border-bottom pb-2 mb-2">Form Values (JSON)</h6>
                     <pre class="small mb-0">{{formValues}}</pre>
                  </div>
               </div>
            </div>
          </div>

          <!-- Datagrid Section -->
          <div class="col-lg-7">
             <div class="card shadow-sm border-0 h-100">
                <div class="card-header bg-dark text-white py-3">
                   <h6 class="mb-0 fw-bold">Dynamic DD Datagrid</h6>
                </div>
                <div class="card-body p-0 d-flex flex-column" style="min-height: 500px;">
                   <ac-dd-datagrid source-value="accounts" source-type="table" class="flex-fill"></ac-dd-datagrid>
                </div>
                <div class="card-footer bg-light small text-muted">
                   Automatically derives columns and types from <strong>act_ledger_accounts</strong> metadata.
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DataDictionaryComponentsPage {
  @AcViewChild('#form') form!: AcForm;
  formValues: string | null = null;

  dropdownItems: IAppMenuItem[] = [{ label: 'DD Config', isHeader: true }];

  acOnInit() {
    //
  }

  submitForm() {
    const values = this.form.valuesToJsonObject();
    this.formValues = JSON.stringify(values, null, 2);
    console.log('[DD Form] Submitted Values:', values);
  }
}
