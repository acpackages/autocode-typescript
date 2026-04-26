import { acAddClassToElement } from "../../../../../utils/ac-element-functions";
import { AC_DATAGRID_CLASS_NAME } from "../../../consts/ac-datagrid-css-class-name.const";
import { AcDatagridApi } from "../../../core/ac-datagrid-api";
import { AcDatagridInternalColumn } from "../../../models/ac-datagrid-internal-column.model";
import { AcDatagridRowDraggingCssClassName } from "../consts/ac-datagrid-row-dragging-css-class-name.const";

export class AcDatagridRowDraggingHeaderCell {
  datagridApi: AcDatagridApi;
  datagridInternalColumn:AcDatagridInternalColumn;
  element: HTMLElement = document.createElement('div');

  constructor({ datagridApi,datagridInternalColumn }: { datagridApi: AcDatagridApi,datagridInternalColumn:AcDatagridInternalColumn }) {
    this.datagridApi = datagridApi;
    this.datagridInternalColumn = datagridInternalColumn;
    this.initElement();
  }

  initElement() {
    acAddClassToElement({ class_: AcDatagridRowDraggingCssClassName.acDatagridRowDraggingHeaderCell, element: this.element });
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridHeaderCell, element: this.element });
    this.setCellWidth();
    // this.element.setAttribute(AcDraggableAttributeName.acDraggableHandle,"");
  }

  render(){
    this.element.innerHTML = ``;
  }

  setCellWidth() {
        const width = this.datagridInternalColumn.width;
        this.element.style.width = `${width}px`;
      }
}
