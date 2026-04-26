/* eslint-disable @typescript-eslint/no-inferrable-types */

import { AcDatagridApi } from "../core/ac-datagrid-api";
import { acAddClassToElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DATAGRID_CLASS_NAME } from "../consts/ac-datagrid-css-class-name.const";
import { AcEnumSortOrder } from "@autocode-ts/autocode";
import { AcDatagridAttributeName } from "../consts/ac-datagrid-attribute-name.const";
import { IAcDatagridColumn } from "../interfaces/ac-datagrid-column.interface";
import { AcElementBase } from "../../../core/ac-element-base";
import { AC_DATAGRID_ICON_CLASS } from "../_ac-datagrid.export";


export class AcDatagridHeaderCellElement extends AcElementBase {
  private datagridApi?: AcDatagridApi;
  private datagridColumn?: IAcDatagridColumn;
  isResizing: boolean = false;
  startWidth: number = 0;
  startX = 0;
  swappingColumpPosition: boolean = false;
  originalUserSelect: any;

  applyPinning() {
    if (this.datagridColumn && this.datagridColumn.pinnedOn) {
      this.style.position = 'sticky';
      this.style.zIndex = '11'; // Higher than body cells and base header
      if (this.datagridColumn.pinnedOn === 'LEFT') {
        const offset = this.datagridApi.getPinnedLeftOffset(this.datagridColumn);
        this.style.left = `${offset}px`;
        this.style.right = '';
      } else if (this.datagridColumn.pinnedOn === 'RIGHT') {
        const offset = this.datagridApi.getPinnedRightOffset(this.datagridColumn);
        this.style.right = `${offset}px`;
        this.style.left = '';
      }
    } else {
      this.style.position = '';
      this.style.left = '';
      this.style.right = '';
      this.style.zIndex = '';
    }
  }

  override init() {
    super.init();
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridHeaderCell, element: this });
    this.setAttribute(AcDatagridAttributeName.acDatagridColumnId, this.datagridColumn.columnId);
    this.registerListeners();
  }

  initHeaderCell() {
    this.render();
    this.setCellWidth();
    this.applyPinning();
  }

  refresh() {
    //
  }

  registerListeners() {
    // Filter button
    // this.filterElement.addEventListener('click', () => {
    //   this.datagridApi.setColumnFilter({ datagridColumn: this.datagridColumn });
    // });

    // // Double-click for auto-resize
    // this.resizeElement.addEventListener('dblclick', () => {
    //   this.datagridApi.autoResizeColumn({ datagridColumn: this.datagridColumn });
    // });

    // // Mouse down to start resizing
    // this.resizeElement.addEventListener('mousedown', (event: MouseEvent) => {
    //   this.isResizing = true;
    //   this.startX = event.clientX;
    //   this.startWidth = this.datagridColumn.width;
    //   this.originalUserSelect = this.ownerDocument.body.style.userSelect;
    //   this.ownerDocument.body.style.userSelect = 'none';
    // });

    // // Sorting click
    // this.sortElement.addEventListener('click', () => {
    //   const current = this.datagridColumn.sortOrder;
    //   const next = current === AcEnumSortOrder.None
    //     ? AcEnumSortOrder.Ascending
    //     : current === AcEnumSortOrder.Ascending
    //       ? AcEnumSortOrder.Descending
    //       : AcEnumSortOrder.None;

    //   this.datagridApi.setColumnSortOrder({ datagridColumn: this.datagridColumn, sortOrder: next });
    // });


    // document.addEventListener('mousemove', (event: MouseEvent) => {
    //   if (this.isResizing) {
    //     const newWidth = this.startWidth + (event.clientX - this.startX);
    //     this.datagridApi.setColumnWidth({ datagridColumn: this.datagridColumn, width: newWidth });
    //   }
    // });

    // document.addEventListener('mouseup', () => {
    //   if (this.isResizing) {
    //     this.isResizing = false;
    //     this.ownerDocument.body.style.userSelect = this.originalUserSelect;
    //     this.originalUserSelect = "";
    //   }
    // });

  }

  // registerDragEvents() {
  //   // this.container.setAttribute('draggable', 'true');
  //   // this.container.addEventListener('dragstart', (event: DragEvent) => {
  //   //   if (this.draggablePlaceholder == undefined) {
  //   //     this.draggablePlaceholder = this.ownerDocument.createElement('div');
  //   //     acAddClassToElement({
  //   //       class_: AC_DATAGRID_CLASS_NAME.acDatagridColumnDraggingPlaceholder,
  //   //       element: this.draggablePlaceholder
  //   //     });
  //   //     const creatorArgs: IAcDatagridColumnDragPlaceholderCreatorArgs = {
  //   //       datagridColumn: this.datagridColumn,
  //   //       datagridApi: this.datagridApi
  //   //     }
  //   //     const placeholderElement: HTMLElement = this.datagridApi.columnDragPlaceholderElementCreator(creatorArgs);
  //   //     this.draggablePlaceholder.append(placeholderElement);
  //   //     this.draggablePlaceholder.style.position = 'fixed';
  //   //     this.draggablePlaceholder.style.top = '-1000px';
  //   //     this.draggablePlaceholder.style.top = '-1000px';
  //   //     this.draggablePlaceholder.style.pointerEvents = 'none';
  //   //     this.draggablePlaceholder.style.zIndex = '9999';
  //   //   }
  //   //   document.body.appendChild(this.draggablePlaceholder);
  //   //   event.dataTransfer?.setDragImage(this.draggablePlaceholder, 0, 0);
  //   //   this.datagridApi.draggingColumn = this.datagridColumn;
  //   //   this.datagridApi.datagrid.element.style.userSelect = 'none';
  //   //   const stopDragging = () => {
  //   //     document.removeEventListener('dragend', stopDragging);
  //   //     if (this.draggablePlaceholder) {
  //   //       this.draggablePlaceholder.remove();
  //   //       this.draggablePlaceholder = undefined;
  //   //     }
  //   //     this.datagridApi.draggingColumn = undefined;
  //   //     this.datagridApi.datagrid.element.style.userSelect = '';
  //   //   };
  //   //   document.addEventListener('dragend', stopDragging);
  //   // });
  //   // this.addEventListener('dragover', (event: DragEvent) => {
  //   //   event.preventDefault();
  //   //   if (this.datagridColumn && this.datagridApi.draggingColumn?.columnId !== this.datagridColumn.columnId && !this.swappingColumpPosition) {
  //   //     this.datagridApi.updateColumnPosition({ datagidColumn: this.datagridApi.draggingColumn!, oldDatagridColumn: this.datagridColumn });
  //   //   }
  //   // });
  // }

  render() {
    this.innerHTML = `<div class="${AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellContainer}">
      <div class="${AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellLeftContainer}">
        <div class="${AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellTitle}">${this.datagridColumn.title ?? this.datagridColumn.columnKey}</div>
      </div>
      <div class="${AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellRightContainer}"></div>
    </div>`;
    if (this.datagridColumn.columnDefinition.allowSort != false) {
      const sortElement = this.ownerDocument.createElement('i');
      const setIcon: Function = () => {
        if (this.datagridColumn.sortOrder == AcEnumSortOrder.Ascending) {
          sortElement.setAttribute('class', AC_DATAGRID_ICON_CLASS.sortAscending);
        }
        else if (this.datagridColumn.sortOrder == AcEnumSortOrder.Descending) {
          sortElement.setAttribute('class', AC_DATAGRID_ICON_CLASS.sortDescending);
        }
        else {
          sortElement.setAttribute('class', AC_DATAGRID_ICON_CLASS.sort);
        }
        sortElement.classList.add(AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellSort)
      };
      setIcon();
      this.querySelector(`.${AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellLeftContainer}`).append(sortElement);
      sortElement.addEventListener('click', () => {
        const current = this.datagridColumn.sortOrder;
        const next = current == AcEnumSortOrder.Ascending ? AcEnumSortOrder.Descending
          : (current == AcEnumSortOrder.Descending
            ? AcEnumSortOrder.None
            : AcEnumSortOrder.Ascending);

        this.datagridApi.setColumnSortOrder({ datagridColumn: this.datagridColumn, sortOrder: next });
        setIcon();
      });
    }
    if (this.datagridColumn.columnDefinition.allowFilter != false) {
      const filterElement = this.ownerDocument.createElement('i');
      filterElement.setAttribute('class', AC_DATAGRID_ICON_CLASS.filter);
      this.querySelector(`.${AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellRightContainer}`).append(filterElement);
    }
  }

  // renderFilter() {
  //   this.filterElement.style.margin = 'auto';
  //   this.filterElement.style.cursor = 'pointer';
  //   if (this.datagridColumn.filterGroup && ((this.datagridColumn.filterGroup.filters && this.datagridColumn.filterGroup.filters.length > 0) || (this.datagridColumn.filterGroup.filterGroups && this.datagridColumn.filterGroup.filterGroups.length > 0))) {
  //     this.filterElement.setAttribute('class',AC_DATAGRID_ICON_CLASS.appliedFilter);
  //   }
  //   else {
  //     this.filterElement.setAttribute('class',AC_DATAGRID_ICON_CLASS.filter);
  //   }
  // }

  // renderSort() {
  //   this.sortElement.style.margin = 'auto';
  //   this.sortElement.style.cursor = 'pointer';
  //   if (this.datagridColumn.sortOrder == AcEnumSortOrder.Ascending) {
  //     this.sortElement.setAttribute('class',AC_DATAGRID_ICON_CLASS.sortAscending);
  //   }
  //   else if (this.datagridColumn.sortOrder == AcEnumSortOrder.Descending) {
  //     this.sortElement.setAttribute('class',AC_DATAGRID_ICON_CLASS.sortDescending);
  //   }
  //   else {
  //     this.sortElement.setAttribute('class',AC_DATAGRID_ICON_CLASS.sort);
  //   }
  // }

  setCellWidth() {
    const width = this.datagridColumn.width;
    this.style.width = `${width}px`;
    this.style.maxWidth = `${width}px`;
    this.style.minWidth = `${width}px`;
    this.applyPinning();
  }

  setHeaderCell({ datagridColumn, datagridApi }: { datagridColumn: IAcDatagridColumn, datagridApi?: AcDatagridApi }) {
    this.datagridColumn = datagridColumn;
    this.datagridApi = datagridApi;
    this.initHeaderCell();
  }
}

acRegisterCustomElement({ tag: 'ac-datagrid-header-cell', type: AcDatagridHeaderCellElement });
