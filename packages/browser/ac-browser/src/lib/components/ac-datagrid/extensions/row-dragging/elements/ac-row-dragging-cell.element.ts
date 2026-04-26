/* eslint-disable @typescript-eslint/no-inferrable-types */

import { AcDraggableAttributeName } from "../../../../ac-draggable/consts/ac-draggable-attribute-name.const";
import { AcDraggableSortElement } from "../../../../ac-draggable/elements/ac-draggable-sort-element.element";
import { acAddClassToElement } from "../../../../../utils/ac-element-functions";
import { AC_DATAGRID_CLASS_NAME } from "../../../consts/ac-datagrid-css-class-name.const";
import { AcDatagridApi } from "../../../core/ac-datagrid-api";
import { AcDatagridInternalColumn } from "../../../models/ac-datagrid-internal-column.model";
import { AcDatagridRowDraggingCssClassName } from "../consts/ac-datagrid-row-dragging-css-class-name.const";
import { AcDatagridRowDraggingHtmlPlaceholder } from "../consts/ac-datagrid-row-dragging-html-placeholder.const";
import { AcDatagridRowDraggingExtension } from "../core/ac-datagrid-row-dragging-extension";
import { IAcDatagridRow } from "../../../interfaces/ac-datagrid-row.interface";

export class AcDatagridRowDraggingCell {
  datagridApi: AcDatagridApi;
  datagridInternalColumn: AcDatagridInternalColumn;
  datagridRow!: IAcDatagridRow;
  element: HTMLElement = document.createElement('div');
  extension!:AcDatagridRowDraggingExtension;
  draggableSortInstance?:AcDraggableSortElement;
  dragHandle: HTMLElement = document.createElement('div');
  selected:boolean = false;

  constructor({ datagridApi, datagridRow, datagridInternalColumn,extension }: { datagridApi: AcDatagridApi, datagridRow: IAcDatagridRow, datagridInternalColumn: AcDatagridInternalColumn,extension:AcDatagridRowDraggingExtension }) {
    this.datagridRow = datagridRow;
    this.datagridApi = datagridApi;
    this.datagridInternalColumn = datagridInternalColumn;
    this.extension = extension;
    this.initElement();
  }

  initElement() {
    acAddClassToElement({ class_: AcDatagridRowDraggingCssClassName.AcDatagridRowDrag, element: this.dragHandle });
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridCell, element: this.element });
    this.element.append(this.dragHandle);
    this.dragHandle.innerHTML = AcDatagridRowDraggingHtmlPlaceholder.drag;
    this.element.setAttribute(AcDraggableAttributeName.acDraggableHandle,"");
    this.setCellWidth();

  }

  setCellWidth() {
    const width = this.datagridInternalColumn.width;
    this.element.style.width = `${width}px`;
  }
}
