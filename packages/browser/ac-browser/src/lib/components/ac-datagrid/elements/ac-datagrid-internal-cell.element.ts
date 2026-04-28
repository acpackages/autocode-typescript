/* eslint-disable @typescript-eslint/no-inferrable-types */

import { AcElementBase } from "../../../core/ac-element-base";
import { acAddClassToElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DATAGRID_CLASS_NAME, AC_DATAGRID_TAG } from "../consts/_consts.export";
import { AcDatagridApi } from "../core/ac-datagrid-api";
import { IAcDatagridRow } from "../interfaces/ac-datagrid-row.interface";

export class AcDatagridInternalCellElement extends AcElementBase {
  private datagridApi?: AcDatagridApi;
  private datagridRow?: IAcDatagridRow;
  override init() {
    super.init();
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridInternalCell, element: this });
    // this.registerListeners();
  }

  initHeaderCell() {
    this.render();
    // this.setCellWidth();
  }

  refresh() {
    //
  }

  render() {
    this.innerHTML = `<div class="${AC_DATAGRID_CLASS_NAME.acDatagridInternalCellContainer}"></div>`;
    const container:HTMLElement = this.querySelector(`.${AC_DATAGRID_CLASS_NAME.acDatagridInternalCellContainer}`) as HTMLElement;
    if(this.datagridApi.showRowNumbers){
      container.append(`${this.datagridRow.index + 1}`);
    }
  }

  setRow({ datagridApi, datagridRow, index }: { datagridApi: AcDatagridApi, datagridRow: IAcDatagridRow, index?: number }) {
    this.datagridApi = datagridApi;
    this.datagridRow = datagridRow;
    this.render();
  }
}

acRegisterCustomElement({ tag: AC_DATAGRID_TAG.datagridInternalCell, type: AcDatagridInternalCellElement });
