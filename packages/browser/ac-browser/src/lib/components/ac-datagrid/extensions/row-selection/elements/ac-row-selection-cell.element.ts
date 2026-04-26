/* eslint-disable @typescript-eslint/no-inferrable-types */

import { acAddClassToElement } from "../../../../../utils/ac-element-functions";
import { AC_DATAGRID_CLASS_NAME } from "../../../consts/ac-datagrid-css-class-name.const";
import { AcDatagridApi } from "../../../core/ac-datagrid-api";
import { AC_DATAGRID_EXTENSION_NAME } from "../../../consts/ac-datagrid-extension-name.const";
import { IAcDatagridRow } from "../../../interfaces/ac-datagrid-row.interface";
import { AcDatagridInternalColumn } from "../../../models/ac-datagrid-internal-column.model";
import { AcDatagridRowSelectionCssClassName } from "../consts/ac-datagrid-row-selection-css-class-name.const";
import { AcEnumDatagridRowSelectionHook } from "../enums/ac-enum-datagrid-row-selection-hook.enum";
import { IAcDatagridRowSelectionChangeEvent } from "../interfaces/ac-datagrid-row-selection-change-event.interface";

export class AcDatagridRowSelectionCell {
  datagridApi: AcDatagridApi;
  datagridInternalColumn: AcDatagridInternalColumn;
  datagridRow!: IAcDatagridRow;
  element: HTMLElement = document.createElement('div');
  input: HTMLInputElement = document.createElement('input');
  selected:boolean = false;

  constructor({ datagridApi, datagridRow, datagridInternalColumn }: { datagridApi: AcDatagridApi, datagridRow: IAcDatagridRow, datagridInternalColumn: AcDatagridInternalColumn }) {
    this.datagridRow = datagridRow;
    this.datagridApi = datagridApi;
    // this.datagridRow.hooks.subscribe({
    //   hook: AcEnumDatagridRowSelectionHook.RowSelectionChange, callback: (event: IAcDatagridRowSelectionChangeEvent) => {
    //     this.setSelectionFromInstance();
    //   }
    // })
    this.datagridInternalColumn = datagridInternalColumn;
    this.initElement();
  }

  initElement() {
    acAddClassToElement({ class_: AcDatagridRowSelectionCssClassName.acDatagridRowSelect, element: this.input });
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridCell, element: this.element });
    this.input.setAttribute('type','checkbox');
    this.element.append(this.input);
    this.registerListeners();
    this.setCellWidth();
  }

  registerListeners(){
    this.input.addEventListener('change',(e:Event)=>{
      this.selected = true;
    });
  }

  setSelectionFromInstance(){
    if(this.input && this.input.checked != this.datagridRow.extensionData![AC_DATAGRID_EXTENSION_NAME.RowSelection]){
      this.input.checked = this.datagridRow.extensionData![AC_DATAGRID_EXTENSION_NAME.RowSelection];
    }
  }

  setCellWidth() {
    const width = this.datagridInternalColumn.width;
    // if (this.datagridApi.isTreeData && this.datagridInternalColumn.index == 0) {
    //   // width = width - (AcDatagridDefaultRowConfig.treeChildPadding * this.datagridRow.treeDepth);
    // }
    this.element.style.width = `${width}px`;
  }
}
