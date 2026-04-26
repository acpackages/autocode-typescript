/* eslint-disable @typescript-eslint/no-inferrable-types */

export class AcDatagridInternalCellElement {
  // cellContainer: HTMLElement = this.ownerDocument.createElement('div');
  // datagridApi: AcDatagridApi;
  // datagridInternalCell!: AcDatagridInternalCell;
  // datagridInternalColumn!: AcDatagridInternalColumn;
  // datagridRow!: IAcDatagridRow;
  // element: HTMLElement = this.ownerDocument.createElement('div');
  // isEditing: boolean = false;
  // swappingColumpPosition: boolean = false;

  // constructor({ datagridApi, datagridRow, datagridInternalColumn }: { datagridApi: AcDatagridApi, datagridRow: IAcDatagridRow, datagridInternalColumn: AcDatagridInternalColumn }) {
  //   this.datagridRow = datagridRow;
  //   this.datagridInternalColumn = datagridInternalColumn;
  //   this.datagridApi = datagridApi;
  //   this.datagridInternalCell = {
  //     cellId: Autocode.uuid(),
  //     rowId: this.datagridRow.rowId,
  //     columnId: this.datagridInternalColumn.columnId,
  //     datagridInternalColumn: datagridInternalColumn,
  //     datagridRow: datagridRow,
  //     instance: this
  //   };
  //   // this.cellRenderer = new AcDatagridCellRendererElement({ datagridApi: this.datagridApi, datagridCell: this.datagridCell });
  //   // this.datagridApi.on({
  //   //   event: AC_DATAGRID_EVENT.ColumnResize, callback: (event: IAcDatagridColumnResizeEvent) => {
  //   //     if (event.datagridColumn.columnId == this.datagridColumn.columnId) {
  //   //       this.setCellWidth();
  //   //     }
  //   //   }
  //   // });
  //   // this.datagridApi.on({
  //   //   event: AC_DATAGRID_EVENT.ColumnPositionChange, callback: (event: IAcDatagridColumnPositionChangeEvent) => {
  //   //     if (event.datagridColumn.columnId == this.datagridColumn.columnId && !this.swappingColumpPosition && this.datagridRow.instance && this.datagridRow.instance.datagridCells) {
  //   //       let element1: HTMLElement | undefined;
  //   //       let element2: HTMLElement | undefined;
  //   //       for (const datagridCell of this.datagridRow.instance.datagridCells) {
  //   //         if (datagridCell.datagridColumn.columnId == event.datagridColumn.columnId) {
  //   //           element1 = datagridCell.element;
  //   //         }
  //   //         else if (datagridCell.datagridColumn.columnId == event.oldDatagridColumn.columnId) {
  //   //           element2 = datagridCell.element;
  //   //         }
  //   //       }
  //   //       if (element1 && element2) {
  //   //         this.swappingColumpPosition = true;
  //   //         acSwapElementsWithAnimation({ element1: element1, element2: element2, duration: 300 });
  //   //         this.delayedCallback.add({callback:() => {
  //   //           this.swappingColumpPosition = false;
  //   //         }, duration:500});
  //   //       }
  //   //     }
  //   //   }
  //   // });
  //   this.initElement();
  // }


  // initElement() {
  //   this.element.setAttribute(AcDatagridAttributeName.acDatagridInternalCellId, this.datagridInternalCell.cellId);
  //   this.element.setAttribute(AcDatagridAttributeName.acDatagridInternalColumnId, this.datagridInternalColumn.columnId);
  //   this.element.setAttribute(AcDatagridAttributeName.acDatagridRowId, this.datagridRow.rowId);
  //   acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridCell, element: this.element });
  //   this.element.setAttribute('tabindex', "0");
  //   this.element.append(this.cellContainer);
  //   this.cellContainer.style.height = "100%";
  //   this.cellContainer.style.width = "max-content";
  //   this.setCellWidth();
  // }



  // setCellWidth() {
  //   let width = this.datagridInternalColumn.width;
  //   if (this.datagridApi.isTreeData && this.datagridInternalColumn.index == 0) {
  //     width = width - (AcDatagridDefaultRowConfig.treeChildPadding * this.datagridRow.treeDepth);
  //   }
  //   this.element.style.width = `${width}px`;
  // }

}
