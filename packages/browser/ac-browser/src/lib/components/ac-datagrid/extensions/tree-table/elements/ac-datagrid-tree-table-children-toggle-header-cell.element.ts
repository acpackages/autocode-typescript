import { acAddClassToElement } from "../../../../../utils/ac-element-functions";
import { AC_DATAGRID_CLASS_NAME } from "../../../consts/ac-datagrid-css-class-name.const";
import { AcDatagridApi } from "../../../core/ac-datagrid-api";
import { AcDatagridInternalColumn } from "../../../models/ac-datagrid-internal-column.model";
import { AcDatagridTreeTableCssClassName } from "../consts/ac-datagrid-tree-table-css-class-name.const";

export class AcDatagridTreeTableChildrenToggleHeaderCell {
  datagridApi: AcDatagridApi;
  datagridInternalColumn: AcDatagridInternalColumn;
  element: HTMLElement = document.createElement('div');

  constructor({ datagridApi, datagridInternalColumn }: { datagridApi: AcDatagridApi, datagridInternalColumn: AcDatagridInternalColumn }) {
    this.datagridApi = datagridApi;
    this.datagridInternalColumn = datagridInternalColumn;
    this.initElement();
  }

  initElement() {
    acAddClassToElement({ class_: AcDatagridTreeTableCssClassName.acDatagridTreeTableHeaderCell, element: this.element });
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridHeaderCell, element: this.element });
    this.setCellWidth();
    // this.element.setAttribute(AcDraggableAttributeName.acDraggableHandle,"");
  }

  render() {
    this.element.innerHTML = ``;
  }

  setCellWidth() {
    const width = this.datagridInternalColumn.width;
    this.element.style.width = `${width}px`;
  }
}
