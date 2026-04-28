/* eslint-disable @typescript-eslint/no-inferrable-types */

import { AcDatagridApi } from "../core/ac-datagrid-api";
import { acAddClassToElement, acClearElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DATAGRID_CLASS_NAME } from "../consts/ac-datagrid-css-class-name.const";
import { AcElementBase } from "../../../core/ac-element-base";
import { AC_DATAGRID_TAG } from "../_ac-datagrid.export";

export class AcDatagridInternalHeaderCellElement extends AcElementBase {
  private datagridApi?: AcDatagridApi;
  override init() {
    super.init();
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridInternalHeaderCell, element: this });
    // this.registerListeners();
  }

  initHeaderCell() {
    this.render();
    // this.setCellWidth();
  }

  refresh(){
    //
  }

  render() {
    this.innerHTML = `<div class="${AC_DATAGRID_CLASS_NAME.acDatagridInternalHeaderCellContainer}"></div>`;
  }
}

acRegisterCustomElement({ tag: AC_DATAGRID_TAG.datagridInternalHeaderCell, type: AcDatagridInternalHeaderCellElement });
