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
  private detailContainer?: HTMLElement;

  private clearRow() {
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
    this.detailContainer = undefined;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.datagridRow && this.datagridApi) {
      this.render();
    }
  }

  override destroy(): void {
    this.clearRow();
    if (this.datagridRow) {
      this.datagridRow.element = null;
    }
    super.destroy();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.clearRow();
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
    } else {
      this.style.height = 'auto';
      this.style.minHeight = `${rh}px`;
      this.style.maxHeight = 'none';
    }
  }

  refresh() {
    if (!this.datagridRow || !this.datagridApi) return;
    this.classList.toggle('ac-datagrid-row-selected', this.datagridApi.isRowSelected(this.datagridRow.rowId));
    this.applyRowHeight();
    if (this.internalCell) {
      this.internalCell.refresh();
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
      groupBanner.className = AC_DATAGRID_CLASS_NAME.acDatagridGroupHeaderRow;
      groupBanner.style.display = 'flex';
      groupBanner.style.alignItems = 'center';
      groupBanner.style.flex = '1';
      groupBanner.style.padding = '0 12px';
      groupBanner.style.backgroundColor = '#f1f5f9';
      groupBanner.style.fontWeight = '600';
      groupBanner.style.fontSize = '13px';
      groupBanner.style.gap = '8px';
      groupBanner.innerHTML = `<span>${this.datagridRow.groupField}: <strong>${this.datagridRow.groupValue}</strong></span>
        <span style="font-weight: normal; color: #64748b; font-size: 12px;">(${this.datagridRow.groupCount} items)</span>`;

      if (this.datagridRow.groupAggregates && Object.keys(this.datagridRow.groupAggregates).length > 0) {
        const aggSpan = document.createElement('span');
        aggSpan.style.marginLeft = 'auto';
        aggSpan.style.display = 'flex';
        aggSpan.style.gap = '12px';
        aggSpan.style.fontSize = '12px';
        aggSpan.style.color = '#334155';
        for (const [fld, val] of Object.entries(this.datagridRow.groupAggregates)) {
          aggSpan.innerHTML += `<span><em>${fld}</em>: <strong>${typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(2)) : val}</strong></span>`;
        }
        groupBanner.appendChild(aggSpan);
      }
      rowContainer.appendChild(groupBanner);
    } else {
      for (const column of this.datagridApi.datagridColumns) {
        if (column.visible) {
          const datagridCell = this.ownerDocument.createElement('ac-datagrid-cell') as AcDatagridCellElement;
          const cell: IAcDatagridCell = {
            cellId: Autocode.uuid(),
            datagridRow: this.datagridRow,
            datagridColumn: column,
            element: datagridCell
          };
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

    this.detailContainer = document.createElement('div');
    this.detailContainer.className = AC_DATAGRID_CLASS_NAME.acDatagridDetailRow;
    this.detailContainer.style.width = '100%';
    this.detailContainer.style.boxSizing = 'border-box';
    this.detailContainer.style.backgroundColor = '#f8fafc';
    this.detailContainer.style.borderTop = '1px solid #e2e8f0';
    this.detailContainer.style.borderBottom = '1px solid #cbd5e1';
    this.detailContainer.style.padding = '12px 24px';

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
  }

  enterRowEditMode() {
    for (const cell of this.datagridCells) {
      if (cell.datagridCell?.datagridColumn.columnDefinition.allowEdit !== false) {
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
