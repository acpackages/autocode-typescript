/* eslint-disable @typescript-eslint/no-inferrable-types */

import { acAddClassToElement } from "../../../../../utils/ac-element-functions";
import { AC_DATAGRID_CLASS_NAME } from "../../../consts/ac-datagrid-css-class-name.const";
import { AcDatagridApi } from "../../../core/ac-datagrid-api";
import { AcDatagridInternalColumn } from "../../../models/ac-datagrid-internal-column.model";
import { IAcDatagridRow } from "../../../interfaces/ac-datagrid-row.interface";
import { AcDatagridRowNumberCssClassName } from "../consts/ac-datagrid-row-number-css-class-name.const";

export class AcDatagridRowNumberCell {
  datagridApi: AcDatagridApi;
  datagridInternalColumn:AcDatagridInternalColumn;
  datagridRow!: IAcDatagridRow;
  element: HTMLElement = document.createElement('div');

  constructor({ datagridApi, datagridRow,datagridInternalColumn }: { datagridApi: AcDatagridApi, datagridRow: IAcDatagridRow,datagridInternalColumn:AcDatagridInternalColumn }) {
    this.datagridRow = datagridRow;
    this.datagridApi = datagridApi;
    this.datagridInternalColumn = datagridInternalColumn;
    this.initElement();
  }

  initElement() {
    acAddClassToElement({ class_: AcDatagridRowNumberCssClassName.acDatagridRowNumberCell, element: this.element });
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridCell, element: this.element });
    this.render();
    this.setCellWidth();
    // this.element.setAttribute(AcDraggableAttributeName.acDraggableHandle,"");
  }

  render(){
    this.element.innerHTML = `${this.datagridRow.index + 1}`;
  }

  setCellWidth() {
      const width = this.datagridInternalColumn.width;
      // if (this.datagridApi.isTreeData && this.datagridInternalColumn.index == 0) {
      //   // width = width - (AcDatagridDefaultRowConfig.treeChildPadding * this.datagridRow.treeDepth);
      // }
      this.element.style.width = `${width}px`;
    }
}
