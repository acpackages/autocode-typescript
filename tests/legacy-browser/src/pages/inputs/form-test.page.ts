/* eslint-disable @nx/enforce-module-boundaries */
/* eslint-disable @typescript-eslint/no-this-alias */
import { AcForm, AcFormField, acInit } from "@autocode-ts/ac-browser";
import { AcDataDictionary } from "@autocode-ts/ac-data-dictionary";
import { AcDDInputManager } from "@autocode-ts/ac-data-dictionary-components";
import { dataDictionaryJson as actDataDictionary } from './../../../../data/accountea-pro';
import { ProductCategorySelectInput } from "../../components/inputs/product-category-select-input.element";

export class AcFormTest extends HTMLElement {
  private form: AcForm | null = null;

  connectedCallback() {
    acInit();
    AcDataDictionary.registerDataDictionary({ jsonData: actDataDictionary });
        AcDDInputManager.registerForeignKeyInput({
          primaryTableName:'act_product_categories',
          inputDefinition:{
            inputElement:ProductCategorySelectInput
          }
        })
    this.render();
    this.addEventListeners();
  }

  private render() {
    this.innerHTML = `
      <h3>AC Form Test</h3>

      <div class=p-4">
      <form id="manuallyAddedForm">
      <ac-form id="test-form" novalidate>
      <ac-form-field>
      <ac-dd-input-field class="account-target-input" table-name="act_ledger_accounts" column-name="reflecting_statement" name="reflecting_statement" value="ADJUSTMENT"></ac-dd-input-field>
      <ac-form-field-error-message></ac-form-field-error-message>
      </ac-form-field>
      <hr>
      <ac-form-field>
          <ac-dd-input-field class="account-target-input" table-name="act_products" column-name="product_category_id" name="product_category_id"></ac-dd-input-field>
          <ac-form-field-error-message></ac-form-field-error-message>
          </ac-form-field>
        <ac-form-field>
        <hr>
        <div class="form-group mb-2">
          <ac-input type="text" name="username" placeholder="Username" required="true"></ac-input>
          <ac-form-field-error-message></ac-form-field-error-message>
          </div>
        </ac-form-field>

        <ac-form-field>
        <div class="form-group mb-2">
          <ac-input type="email" name="email" placeholder="Email" required="true"></ac-input>
          <ac-form-field-error-message>Valid email required</ac-form-field-error-message>
          </div>
        </ac-form-field>

        <ac-form-field>
        <div class="form-group mb-2">
          <ac-input type="password" name="password" placeholder="Password" minlength="6" required="true"></ac-input>
          <ac-form-field-error-message>Password must be at least 6 characters</ac-form-field-error-message>
          </div>
        </ac-form-field>

        <ac-form-field>
        <div class="form-group mb-2">
          <select name="role">
            <option value="">Select role</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <ac-form-field-error-message>Please select a role</ac-form-field-error-message>
          </div>
        </ac-form-field>

        <button class="btn btn-primary" type="submit">Submit</button>
        <button class="btn btn-secondary" type="reset">Reset</button>
      </ac-form>
  </form>
  </div>
      <pre id="form-output"></pre>
    `;

    this.form = this.querySelector('#test-form');
  }

  private addEventListeners() {
    if (!this.form) return;

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

    // Dynamically add an input after 3 seconds to test runtime binding
    setTimeout(() => {
      const dynamicField = new AcFormField();
      dynamicField.innerHTML = `
      <div class="form-group my-2">
        <ac-input type="number" name="age" placeholder="Age" min="1" required />
        <ac-form-field-error-message>Age must be greater than 0</ac-form-field-error-message>
        </div>
      `;
      this.form?.appendChild(dynamicField);
    }, 3000);
  }
}

