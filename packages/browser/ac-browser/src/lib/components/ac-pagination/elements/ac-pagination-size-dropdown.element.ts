/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcElementBase } from "../../../core/ac-element-base";
import { acAddClassToElement, acClearElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AcPagination, AcEnumPaginationEvent } from "../_ac-pagination.export";
import { AcPaginationCssClassName } from "../consts/ac-pagination-css-class-name.const";

export class AcPaginationSizeDropdown extends AcElementBase {
  private _pagination?: AcPagination;
  get pagination(): AcPagination | undefined {
    return this._pagination;
  }
  set pagination(value: AcPagination) {
    this._pagination = value;
    value.on({
      event: AcEnumPaginationEvent.PageSizeChange, callback: (event: any) => {
        this.selectInput.value = this.pagination!.activePageSize.toString();
      }
    });
  }

  private selectInput: any = this.ownerDocument.createElement('select');

  override init() {
    super.init();
    acAddClassToElement({ class_: AcPaginationCssClassName.acPaginationPageSizeSelect, element: this.selectInput });
    this.setSelectDropdownValues();
    acClearElement({element:this});
    this.append(this.selectInput);
  }

  setSelectDropdownValues() {
    acClearElement({element:this.selectInput});
    let optionsString = '';
    if (this.pagination) {
      for (const pageSize of this.pagination.pageSizes) {
        optionsString += `<option value="${pageSize}"`
        if (pageSize == this.pagination.activePageSize) {
          optionsString += ` selected `;
        }
        optionsString += `>${pageSize}</option>`;
      }
      this.selectInput.innerHTML = optionsString;
      this.selectInput.value = this.pagination.activePageSize.toString();
      this.selectInput.addEventListener('change', (event: any) => {
        this.pagination!.activePageSize = parseInt(this.selectInput.value);
      });
    }
  }
}

acRegisterCustomElement({ 'tag': 'ac-pagination-size-dropdown', type: AcPaginationSizeDropdown });
