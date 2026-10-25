/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDatagridCellElement } from "./ac-datagrid-cell.element";
import { AcDatagridApi } from "../core/ac-datagrid-api";
import { AC_DATAGRID_CLASS_NAME } from "../consts/ac-datagrid-css-class-name.const";
import { AC_DATAGRID_TAG, AcDatagridAttributeName, IAcDatagridRow, IAcDatagridCell, AcDatagridInternalCellElement } from "../_ac-datagrid.export";
import { acAddClassToElement, acClearElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AcElementBase } from "../../../core/ac-element-base";
import { Autocode } from "@autocode-ts/autocode";

export class AcDatagridRowElement extends AcElementBase {
  datagridApi!: AcDatagridApi;
  datagridRow!: IAcDatagridRow;
  datagridCells: AcDatagridCellElement[] = [];
  internalCell?: AcDatagridInternalCellElement;
  isRendered: boolean = false;
  private detailContainer?: HTMLElement;

  private clearRow() {
    this.isRendered = false;
    if (this.internalCell) {
      this.internalCell.remove();
      this.internalCell.destroy();
      this.internalCell = undefined;
    }
    for (const cell of this.datagridCells) {
      cell.remove();
      cell.destroy();
    }
    acClearElement({ element: this });
    this.datagridCells = [];
    if (this.datagridRow?.datagridCells) {
      this.datagridRow.datagridCells = [];
    }
    this.detailContainer = undefined;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.datagridRow && this.datagridApi && !this.isRendered) {
      this.render();
    }
  }

  override destroy(): void {
    this.clearRow();
    if (this.datagridRow) {
      this.datagridRow.element = null;
      this.datagridRow.datagridCells = undefined;
    }
    super.destroy();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  initElement() {
    if (!this.datagridRow) return;
    this.setAttribute(AcDatagridAttributeName.acDatagridRowId, this.datagridRow.rowId);
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridRow, element: this });
    if (this.datagridRow.index % 2 === 0) {
      acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridRowEven, element: this });
    } else {
      acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridRowOdd, element: this });
    }
    this.datagridRow.element = this;
    this.render();
  }

  applyRowHeight() {
    const rh = this.datagridApi?.rowHeight || 36;
    const rowContainer = this.querySelector(`.${AC_DATAGRID_CLASS_NAME.acDatagridRowContainer}`) as HTMLElement;
    if (rowContainer) {
      rowContainer.style.height = `${rh}px`;
      rowContainer.style.minHeight = `${rh}px`;
      rowContainer.style.maxHeight = `${rh}px`;
    }
    if (this.datagridRow && !this.datagridRow.isDetailExpanded) {
      this.style.height = `${rh}px`;
      this.style.minHeight = `${rh}px`;
      this.style.maxHeight = `${rh}px`;
      this.classList.remove('ac-datagrid-row-detail-expanded');
    } else {
      this.style.height = 'auto';
      this.style.minHeight = `${rh}px`;
      this.style.maxHeight = 'none';
      this.classList.add('ac-datagrid-row-detail-expanded');
    }
  }

  updateIndex(newIndex: number) {
    if (!this.datagridRow) return;
    this.datagridRow.index = newIndex;
    this.classList.toggle(AC_DATAGRID_CLASS_NAME.acDatagridRowEven, newIndex % 2 === 0);
    this.classList.toggle(AC_DATAGRID_CLASS_NAME.acDatagridRowOdd, newIndex % 2 !== 0);
    if (this.internalCell) {
      this.internalCell.refresh();
    }
    const rowNumCell = this.querySelector(`.${AC_DATAGRID_CLASS_NAME.acDatagridRowNumber}`) || this.querySelector('.ac-datagrid-row-number-cell');
    if (rowNumCell) {
      rowNumCell.textContent = `${newIndex + 1}`;
    }
    const rh = this.datagridApi?.rowHeight || 36;
    if (!this.datagridApi?.usePagination && (this.datagridApi?.useVirtualScrolling || (this.datagridApi?.animateRows && !this.datagridApi?.hasMasterDetail))) {
      this.style.transform = `translateY(${newIndex * rh}px)`;
    }
  }

  refresh() {
    if (!this.datagridRow || !this.datagridApi) return;
    this.classList.toggle('ac-datagrid-row-selected', this.datagridApi.isRowSelected(this.datagridRow.rowId));
    this.classList.toggle(AC_DATAGRID_CLASS_NAME.acDatagridRowEven, this.datagridRow.index % 2 === 0);
    this.classList.toggle(AC_DATAGRID_CLASS_NAME.acDatagridRowOdd, this.datagridRow.index % 2 !== 0);
    this.classList.toggle('ac-datagrid-row-expanded', !!this.datagridRow.isExpanded);
    this.classList.toggle('ac-datagrid-row-detail-expanded', !!this.datagridRow.isDetailExpanded);
    this.applyRowHeight();
    if (this.internalCell) {
      this.internalCell.refresh();
    }
    const groupToggle = this.querySelector('.ac-datagrid-group-toggle');
    if (groupToggle) {
      if (this.datagridApi.loadingRowIds.has(this.datagridRow.rowId)) {
        groupToggle.textContent = '⏳';
      } else {
        groupToggle.textContent = this.datagridRow.isExpanded ? '▼' : '▶';
      }
    }
    for (const cell of this.datagridCells) {
      cell.refresh();
    }
    if (this.datagridRow.isDetailExpanded) {
      this.renderDetail();
    } else {
      this.removeDetail();
    }
  }

  render() {
    if (!this.datagridRow || !this.datagridApi) return;
    this.clearRow();
    this.isRendered = true;

    const rowHeight = this.datagridApi?.rowHeight || 36;
    this.style.display = 'flex';
    this.style.flexDirection = 'column';
    this.style.width = 'fit-content';
    this.style.minWidth = '100%';
    this.style.boxSizing = 'border-box';

    if (!this.datagridRow.isDetailExpanded) {
      this.style.height = `${rowHeight}px`;
      this.style.minHeight = `${rowHeight}px`;
      this.style.maxHeight = `${rowHeight}px`;
      this.classList.remove('ac-datagrid-row-detail-expanded');
    } else {
      this.style.height = 'auto';
      this.style.minHeight = `${rowHeight}px`;
      this.style.maxHeight = 'none';
      this.classList.add('ac-datagrid-row-detail-expanded');
    }

    if (this.datagridRow.level !== undefined) {
      this.classList.add('ac-datagrid-tree-row', `ac-datagrid-tree-level-${this.datagridRow.level}`);
    }

    this.classList.toggle('ac-datagrid-row-selected', this.datagridApi.isRowSelected(this.datagridRow.rowId));
    this.classList.toggle('ac-datagrid-row-expanded', !!this.datagridRow.isExpanded);

    // Cells container
    const rowContainer = document.createElement('div');
    rowContainer.className = AC_DATAGRID_CLASS_NAME.acDatagridRowContainer;
    rowContainer.style.display = 'flex';
    rowContainer.style.flexDirection = 'row';
    rowContainer.style.width = 'fit-content';
    rowContainer.style.minWidth = '100%';
    rowContainer.style.height = `${rowHeight}px`;
    rowContainer.style.minHeight = `${rowHeight}px`;
    rowContainer.style.maxHeight = `${rowHeight}px`;
    rowContainer.style.alignItems = 'center';
    this.appendChild(rowContainer);

    // 1. Single consolidated internal column
    this.internalCell = new AcDatagridInternalCellElement();
    this.internalCell.setRow({ datagridApi: this.datagridApi, datagridRow: this.datagridRow });
    rowContainer.appendChild(this.internalCell);

    // 2. Group Header or Normal Cells
    if (this.datagridRow.isGroupHeader) {
      const groupBanner = document.createElement('div');
      groupBanner.className = `${AC_DATAGRID_CLASS_NAME.acDatagridGroupHeaderRow} ac-datagrid-group-banner`;

      const toggleIcon = document.createElement('span');
      toggleIcon.className = 'ac-datagrid-group-toggle';
      toggleIcon.style.cursor = 'pointer';
      toggleIcon.style.userSelect = 'none';
      toggleIcon.style.display = 'inline-flex';
      toggleIcon.style.alignItems = 'center';
      toggleIcon.style.justifyContent = 'center';
      toggleIcon.style.width = '18px';
      toggleIcon.style.marginRight = '6px';
      if (this.datagridApi.loadingRowIds.has(this.datagridRow.rowId)) {
        toggleIcon.textContent = '⏳';
      } else {
        toggleIcon.textContent = this.datagridRow.isExpanded ? '▼' : '▶';
      }
      groupBanner.appendChild(toggleIcon);

      const titleSpan = document.createElement('span');
      const groupTitle = this.datagridRow.groupValue ?? (this.datagridRow.data ? this.datagridRow.data[this.datagridRow.groupField || ''] : '');
      const groupFieldPrefix = this.datagridRow.groupField ? `${this.datagridRow.groupField}: ` : '';
      titleSpan.innerHTML = `<span><strong>${groupTitle}</strong></span>`;
      groupBanner.appendChild(titleSpan);

      if (this.datagridRow.groupCount !== undefined && this.datagridRow.groupCount !== null) {
        const countSpan = document.createElement('span');
        countSpan.className = 'ac-datagrid-group-count';
        countSpan.textContent = `(${this.datagridRow.groupCount} items)`;
        groupBanner.appendChild(countSpan);
      }

      if (this.datagridRow.groupAggregates && Object.keys(this.datagridRow.groupAggregates).length > 0) {
        const aggSpan = document.createElement('span');
        aggSpan.className = 'ac-datagrid-group-aggregates';
        for (const [fld, val] of Object.entries(this.datagridRow.groupAggregates)) {
          aggSpan.innerHTML += `<span><em>${fld}</em>: <strong>${typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(2)) : val}</strong></span>`;
        }
        groupBanner.appendChild(aggSpan);
      }

      groupBanner.addEventListener('click', (e) => {
        e.stopPropagation();
        this.datagridApi?.toggleRow({ rowId: this.datagridRow.rowId });
      });

      rowContainer.appendChild(groupBanner);
    } else {
      if (!this.datagridRow.datagridCells) {
        this.datagridRow.datagridCells = [];
      } else {
        this.datagridRow.datagridCells.length = 0;
      }
      for (const column of this.datagridApi.datagridColumns) {
        if (column.visible) {
          const datagridCell = this.ownerDocument.createElement('ac-datagrid-cell') as AcDatagridCellElement;
          const cell: IAcDatagridCell = {
            cellId: Autocode.uuid(),
            datagridRow: this.datagridRow,
            datagridColumn: column,
            element: datagridCell
          };
          this.datagridRow.datagridCells.push(cell);
          datagridCell.setCell({ datagridApi: this.datagridApi, datagridCell: cell });
          this.datagridCells.push(datagridCell);
          rowContainer.appendChild(datagridCell);
        }
      }
    }

    // 3. Master / Detail row drawer
    if (this.datagridRow.isDetailExpanded) {
      this.renderDetail();
    }
  }

  renderDetail() {
    if (this.detailContainer) {
      this.detailContainer.remove();
      this.detailContainer = undefined;
    }
    if (!this.datagridApi?.masterDetailConfig?.detailTemplate || !this.datagridRow) return;

    this.classList.add('ac-datagrid-row-detail-expanded');
    this.applyRowHeight();

    this.detailContainer = document.createElement('div');
    this.detailContainer.className = AC_DATAGRID_CLASS_NAME.acDatagridDetailRow;

    const content = this.datagridApi.masterDetailConfig.detailTemplate(this.datagridRow);
    if (typeof content === 'string') {
      this.detailContainer.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.detailContainer.appendChild(content);
    }
    this.appendChild(this.detailContainer);
  }

  removeDetail() {
    if (this.detailContainer) {
      this.detailContainer.remove();
      this.detailContainer = undefined;
    }
    this.classList.remove('ac-datagrid-row-detail-expanded');
    this.applyRowHeight();
  }

  enterRowEditMode() {
    for (const cell of this.datagridCells) {
      if (cell.isEditable()) {
        cell.startEdit();
      }
    }
  }

  commitRowEdit(): boolean {
    let allValid = true;
    for (const cell of this.datagridCells) {
      if (cell.isEditing) {
        const valid = cell.commitEdit();
        if (!valid) allValid = false;
      }
    }
    return allValid;
  }

  cancelRowEdit() {
    for (const cell of this.datagridCells) {
      if (cell.isEditing) {
        cell.cancelEdit();
      }
    }
  }

  setRow({ datagridApi, datagridRow }: { datagridApi: AcDatagridApi, datagridRow: IAcDatagridRow, index?: number }) {
    this.datagridApi = datagridApi;
    this.datagridRow = datagridRow;
    this.initElement();
  }
}

acRegisterCustomElement({ tag: AC_DATAGRID_TAG.datagridRow, type: AcDatagridRowElement });
