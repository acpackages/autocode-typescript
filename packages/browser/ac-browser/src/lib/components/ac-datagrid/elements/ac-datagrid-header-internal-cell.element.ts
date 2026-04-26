
export class AcDatagridHeaderInternalCellElement {
  // cellContainer: HTMLElement = this.ownerDocument.createElement('div');
  // private datagridApi: AcDatagridApi;
  // datagridColumn!: IAcDatagridColumn;
  // draggablePlaceholder?: HTMLElement;
  // element: HTMLElement = this.ownerDocument.createElement('div');
  // filterElement: HTMLElement = this.ownerDocument.createElement('button');
  // isResizing: boolean = false;
  // leftContainer: HTMLElement = this.ownerDocument.createElement('div');
  // resizeElement: HTMLElement = this.ownerDocument.createElement('span');
  // rightContainer: HTMLElement = this.ownerDocument.createElement('div');
  // sortElement: HTMLElement = this.ownerDocument.createElement('button');
  // startWidth: number = 0;
  // startX = 0;
  // swappingColumpPosition: boolean = false;
  // titleElement: HTMLElement = this.ownerDocument.createElement('div');

  // constructor({ datagridApi, datagridColumn }: { datagridApi: AcDatagridApi, datagridColumn: IAcDatagridColumn }) {
  //   this.datagridColumn = datagridColumn;
  //   this.datagridApi = datagridApi;
  //   this.datagridApi.on({
  //     event: AC_DATAGRID_EVENT.ColumnResize, callback: (event: IAcDatagridColumnResizeEvent) => {
  //       this.setCellWidth();
  //     }
  //   });
  //   this.datagridApi.on({
  //     event: AC_DATAGRID_EVENT.ColumnPositionChange, callback: (event: IAcDatagridColumnPositionChangeEvent) => {
  //       if (event.datagridColumn.columnId == this.datagridColumn.columnId && !this.swappingColumpPosition) {
  //         let element1: HTMLElement | undefined;
  //         let element2: HTMLElement | undefined;
  //         for (const headerCell of this.datagridApi.datagrid.datagridHeader.datagridHeaderCells) {
  //           if (headerCell.datagridColumn.columnId == event.datagridColumn.columnId) {
  //             element1 = headerCell.element;
  //           }
  //           else if (headerCell.datagridColumn.columnId == event.oldDatagridColumn.columnId) {
  //             element2 = headerCell.element;
  //           }
  //         }
  //         if (element1 && element2) {
  //           this.swappingColumpPosition = true;
  //           acSwapElementsWithAnimation({ element1: element1, element2: element2, duration: 300 });
  //           this.delayedCallback.add({callback:() => {
  //             this.swappingColumpPosition = false;
  //           }, duration:500});
  //         }
  //       }
  //     }
  //   });
  //   this.initElement();
  // }

  // initElement() {
  //   this.element.setAttribute(AcDatagridAttributeName.acDatagridColumnId, this.datagridColumn.columnId);
  //   acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellLeftContainer, element: this.leftContainer });
  //   acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellRightContainer, element: this.rightContainer });
  //   acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridHeaderCell, element: this.element });
  //   acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellContainer, element: this.cellContainer });
  //   acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellTitle, element: this.titleElement });
  //   acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellFilter, element: this.filterElement });
  //   acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellSort, element: this.sortElement });
  //   acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellResize, element: this.resizeElement });
  //   this.element.append(this.cellContainer);
  //   this.cellContainer.setAttribute('draggable', 'true');
  //   this.cellContainer.append(this.leftContainer);
  //   this.cellContainer.append(this.rightContainer);
  //   this.leftContainer.append(this.titleElement);
  //   if (this.datagridColumn.allowSort == true) {
  //     this.leftContainer.append(this.sortElement);
  //   }
  //   this.rightContainer.append(this.resizeElement);
  //   if (this.datagridColumn.allowFilter == true) {
  //     this.rightContainer.append(this.filterElement);
  //   }
  //   this.resizeElement.style.height = "100%";
  //   this.resizeElement.innerHTML = AcDatagridHtmlPlaceholder.resize;
  //   this.renderFilter();
  //   this.renderSort();
  //   this.renderTitle();
  //   this.registerListeners();
  //   this.setCellWidth();
  // }

  // registerListeners() {
  //   // Filter button
  //   this.filterElement.addEventListener('click', () => {
  //     const filter = new AcFilter();
  //     this.datagridApi.setColumnFilter({ datagridColumn: this.datagridColumn, filter });
  //   });

  //   // Double-click for auto-resize
  //   this.resizeElement.addEventListener('dblclick', () => {
  //     this.datagridApi.autoResizeColumn({ datagridColumn: this.datagridColumn });
  //   });

  //   // Mouse down to start resizing
  //   this.resizeElement.addEventListener('mousedown', (event: MouseEvent) => {
  //     this.isResizing = true;
  //     this.startX = event.clientX;
  //     this.startWidth = this.datagridColumn.width;
  //   });

  //   // Sorting click
  //   this.sortElement.addEventListener('click', () => {
  //     const current = this.datagridColumn.sortDirection;
  //     const next = current === AcEnumSortOrder.None
  //       ? AcEnumSortOrder.Ascending
  //       : current === AcEnumSortOrder.Ascending
  //         ? AcEnumSortOrder.Descending
  //         : AcEnumSortOrder.None;

  //     this.datagridApi.setColumnSortDirection({ datagridColumn: this.datagridColumn, sortDirection: next });
  //   });

  //   // Resizing mouse events
  //   this.ownerDocument.addEventListener('mousemove', (event: MouseEvent) => {
  //     if (this.isResizing) {
  //       const newWidth = this.startWidth + (event.clientX - this.startX);
  //       this.datagridApi.setColumnWidth({ datagridColumn: this.datagridColumn, width: newWidth });
  //     }
  //   });

  //   this.ownerDocument.addEventListener('mouseup', () => {
  //     if (this.isResizing) this.isResizing = false;
  //   });

  //   // this.registerDragEvents(); // Dragging logic extracted here
  // }


  // // registerDragEvents() {
  // //   this.cellContainer.setAttribute('draggable', 'true');
  // //   this.cellContainer.addEventListener('dragstart', (event: DragEvent) => {
  // //     if (this.draggablePlaceholder == undefined) {
  // //       this.draggablePlaceholder = this.ownerDocument.createElement('div');
  // //       acAddClassToElement({
  // //         class_: AC_DATAGRID_CLASS_NAME.acDatagridColumnDraggingPlaceholder,
  // //         element: this.draggablePlaceholder
  // //       });
  // //       const creatorArgs:IAcDatagridColumnDragPlaceholderCreatorArgs = {
  // //         datagridColumn:this.datagridColumn,
  // //         datagridApi:this.datagridApi
  // //       }
  // //       const placeholderElement:HTMLElement = this.datagridApi.columnDragPlaceholderElementCreator(creatorArgs);
  // //       this.draggablePlaceholder.append(placeholderElement);
  // //       this.draggablePlaceholder.style.position = 'fixed';
  // //       this.draggablePlaceholder.style.top = '-1000px';
  // //       this.draggablePlaceholder.style.top = '-1000px';
  // //       this.draggablePlaceholder.style.pointerEvents = 'none';
  // //       this.draggablePlaceholder.style.zIndex = '9999';
  // //     }
  // //     this.ownerDocument.body.appendChild(this.draggablePlaceholder);
  // //     event.dataTransfer?.setDragImage(this.draggablePlaceholder, 0, 0);
  // //     this.datagridApi.draggingColumn = this.datagridColumn;
  // //     this.datagridApi.datagrid.element.style.userSelect = 'none';
  // //     const stopDragging = () => {
  // //       this.ownerDocument.removeEventListener('dragend', stopDragging);
  // //       if (this.draggablePlaceholder) {
  // //         this.draggablePlaceholder.remove();
  // //         this.draggablePlaceholder = undefined;
  // //       }
  // //       this.datagridApi.draggingColumn = undefined;
  // //       this.datagridApi.datagrid.element.style.userSelect = '';
  // //     };
  // //     this.ownerDocument.addEventListener('dragend', stopDragging);
  // //   });
  // //   this.element.addEventListener('dragover', (event: DragEvent) => {
  // //     event.preventDefault();
  // //     if (this.datagridColumn && this.datagridApi.draggingColumn?.columnId !== this.datagridColumn.columnId && !this.swappingColumpPosition) {
  // //       this.datagridApi.updateColumnPosition({ datagidColumn: this.datagridApi.draggingColumn!, oldDatagridColumn: this.datagridColumn });
  // //     }
  // //   });
  // // }

  // renderTitle() {
  //   this.titleElement.innerHTML = this.datagridColumn.title;
  // }

  // renderFilter() {
  //   if (this.datagridColumn.filterGroup.hasFilters()) {
  //     this.filterElement.innerHTML = AcDatagridHtmlPlaceholder.appliedFilter;
  //   }
  //   else {
  //     this.filterElement.innerHTML = AcDatagridHtmlPlaceholder.filter;
  //   }
  // }

  // renderSort() {
  //   if (this.datagridColumn.sortDirection == AcEnumSortOrder.Ascending) {
  //     this.sortElement.innerHTML = AcDatagridHtmlPlaceholder.sortAscending;
  //   }
  //   else if (this.datagridColumn.sortDirection == AcEnumSortDirection.Descending) {
  //     this.sortElement.innerHTML = AcDatagridHtmlPlaceholder.sortDescending;
  //   }
  //   else {
  //     this.sortElement.innerHTML = AcDatagridHtmlPlaceholder.sort;
  //   }
  // }

  // setCellWidth() {
  //   this.element.style.width = this.datagridColumn.width + "px";
  // }
}
