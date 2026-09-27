/* eslint-disable @typescript-eslint/no-inferrable-types */

import { AcElementBase } from "../../../core/ac-element-base";
import { acAddClassToElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DATAGRID_CLASS_NAME, AC_DATAGRID_TAG } from "../consts/_consts.export";
import { AcDatagridApi } from "../core/ac-datagrid-api";
import { IAcDatagridRow } from "../interfaces/ac-datagrid-row.interface";

export class AcDatagridInternalCellElement extends AcElementBase {
  datagridApi?: AcDatagridApi;
  datagridRow?: IAcDatagridRow;
  private checkboxElement?: HTMLInputElement;

  override init() {
    super.init();
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridInternalCell, element: this });
  }

  setRow({ datagridApi, datagridRow, index }: { datagridApi: AcDatagridApi, datagridRow: IAcDatagridRow, index?: number }) {
    this.datagridApi = datagridApi;
    this.datagridRow = datagridRow;
    this.applyStyles();
    this.render();
  }

  applyStyles() {
    if (!this.datagridApi) return;
    const width = this.datagridApi.getInternalColumnWidth();
    if (width <= 0) {
      this.style.display = 'none';
      this.style.width = '0px';
      this.style.minWidth = '0px';
      this.style.maxWidth = '0px';
      return;
    }
    this.style.display = 'inline-flex';
    this.style.alignItems = 'center';
    this.style.justifyContent = 'flex-start';
    this.style.width = `${width}px`;
    this.style.minWidth = `${width}px`;
    this.style.maxWidth = `${width}px`;
    this.style.boxSizing = 'border-box';
    this.style.flexShrink = '0';
    this.style.position = 'sticky';
    this.style.left = '0px';
    this.style.zIndex = '3';
    this.style.borderRight = '1px solid var(--ac-datagrid-border-color, #e0e0e0)';
  }

  refresh() {
    if (!this.datagridApi || !this.datagridRow) return;
    this.applyStyles();
    if (this.checkboxElement) {
      this.checkboxElement.checked = this.datagridApi.isRowSelected(this.datagridRow.rowId);
    }
    const numEl = this.querySelector(`.${AC_DATAGRID_CLASS_NAME.acDatagridRowNumber}`);
    if (numEl) {
      numEl.textContent = `${this.datagridRow.index + 1}`;
    }
    const chevron = this.querySelector(`.${AC_DATAGRID_CLASS_NAME.acDatagridRowExpandIcon}`);
    if (chevron) {
      if (this.datagridApi.loadingRowIds.has(this.datagridRow.rowId)) {
        chevron.textContent = '⏳';
      } else {
        chevron.textContent = this.datagridRow.isExpanded ? '▼' : '▶';
      }
    }
    const detailIcon = this.querySelector(`.${AC_DATAGRID_CLASS_NAME.acDatagridDetailExpandIcon}`);
    if (detailIcon) {
      detailIcon.textContent = this.datagridRow.isDetailExpanded ? '−' : '+';
    }
  }

  render() {
    if (!this.datagridApi || !this.datagridRow) return;
    const width = this.datagridApi.getInternalColumnWidth();
    if (width <= 0) {
      this.innerHTML = '';
      return;
    }

    this.innerHTML = `<div class="${AC_DATAGRID_CLASS_NAME.acDatagridInternalCellContainer}" style="display: inline-flex; align-items: center; justify-content: flex-start; gap: 4px; width: 100%; height: 100%; padding: 0 4px; box-sizing: border-box;"></div>`;
    const container = this.querySelector(`.${AC_DATAGRID_CLASS_NAME.acDatagridInternalCellContainer}`) as HTMLElement;
    if (!container) return;

    // 1. Drag Handle
    if (this.datagridApi.allowRowDragging && !this.datagridRow.isGroupHeader) {
      const handle = document.createElement('span');
      handle.className = AC_DATAGRID_CLASS_NAME.acDatagridRowDragHandle;
      handle.setAttribute('data-row-id', this.datagridRow.rowId);
      handle.title = 'Drag to reorder';
      handle.style.cursor = 'grab';
      handle.style.touchAction = 'none';
      handle.style.userSelect = 'none';
      handle.style.display = 'inline-flex';
      handle.style.alignItems = 'center';
      handle.style.justifyContent = 'center';
      handle.style.width = '14px';
      handle.style.color = '#999';
      handle.textContent = '⋮⋮';

      handle.addEventListener('pointerdown', (e: PointerEvent) => {
        if (e.button !== 0 || !this.datagridRow) return;
        e.stopPropagation();
        e.preventDefault();
        handle.setPointerCapture(e.pointerId);
        const startY = e.clientY;
        const startIdx = this.datagridRow.index;
        let hasMoved = false;
        let targetDropIdx = startIdx;

        const sourceRowEl = this.closest('ac-datagrid-row') as any;
        const bodyEl = this.closest('ac-datagrid-body') as any;

        const onPointerMove = (moveEvt: PointerEvent) => {
          if (!hasMoved && Math.abs(moveEvt.clientY - startY) > 5) {
            hasMoved = true;
            document.body.classList.add('ac-datagrid-dragging-active');
            window.getSelection()?.removeAllRanges();
            document.body.style.cursor = 'grabbing';
            if (sourceRowEl) {
              sourceRowEl.style.opacity = '0.5';
            }
          }

          if (hasMoved && bodyEl) {
            const targetEl = document.elementFromPoint(moveEvt.clientX, moveEvt.clientY);
            const targetRowEl = targetEl?.closest(`.${AC_DATAGRID_CLASS_NAME.acDatagridRow}`) as any;
            if (targetRowEl && targetRowEl.datagridRow) {
              const rect = targetRowEl.getBoundingClientRect();
              const bodyRect = bodyEl.getBoundingClientRect();
              const midY = rect.top + rect.height / 2;
              const isAboveMid = moveEvt.clientY < midY;
              const indicatorTop = (isAboveMid ? rect.top : rect.bottom) - bodyRect.top + bodyEl.scrollTop;
              bodyEl.showRowDropIndicator?.(indicatorTop);

              const trgIdx = targetRowEl.datagridRow.index;
              if (startIdx < trgIdx) {
                targetDropIdx = isAboveMid ? trgIdx - 1 : trgIdx;
              } else if (startIdx > trgIdx) {
                targetDropIdx = isAboveMid ? trgIdx : trgIdx + 1;
              } else {
                targetDropIdx = startIdx;
              }
            }
          }
        };

        const onPointerUp = (upEvt: PointerEvent) => {
          try {
            handle.releasePointerCapture(upEvt.pointerId);
          } catch (_) {}
          handle.removeEventListener('pointermove', onPointerMove);
          handle.removeEventListener('pointerup', onPointerUp);
          document.body.classList.remove('ac-datagrid-dragging-active');
          document.body.style.cursor = '';
          if (sourceRowEl) {
            sourceRowEl.style.opacity = '';
          }
          bodyEl?.hideRowDropIndicator?.();

          if (hasMoved && targetDropIdx !== undefined && targetDropIdx !== startIdx) {
            this.datagridApi?.moveRow({ fromIndex: startIdx, toIndex: targetDropIdx });
          }
        };

        handle.addEventListener('pointermove', onPointerMove);
        handle.addEventListener('pointerup', onPointerUp);
      });

      container.appendChild(handle);
    }

    // 2. Selection Checkbox / Radio
    if (this.datagridApi.allowSelection) {
      const isSingle = this.datagridApi.selectionMode === 'single' || !this.datagridApi.allowMultipleSelection;
      const chk = document.createElement('input');
      chk.type = isSingle ? 'radio' : 'checkbox';
      if (isSingle) {
        chk.name = `ac-grid-sel-${(this.datagridApi.datagrid as any)?.id || 'default'}`;
      }
      chk.className = AC_DATAGRID_CLASS_NAME.acDatagridRowCheckbox;
      chk.checked = this.datagridApi.isRowSelected(this.datagridRow.rowId);
      chk.style.cursor = 'pointer';
      chk.style.margin = '0 2px';

      chk.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.datagridRow) {
          this.datagridApi?.selectRow({
            rowId: this.datagridRow.rowId,
            isSelected: isSingle ? true : chk.checked,
            event: e as MouseEvent
          });
        }
      });

      container.appendChild(chk);
      this.checkboxElement = chk;
    } else {
      this.checkboxElement = undefined;
    }

    // 3. Tree / Group chevron
    const isGroup = this.datagridRow.isGroupHeader;
    const hasChildren = this.datagridRow.hasChildren || isGroup;
    if (this.datagridApi.hasTreeOrGroup) {
      if (hasChildren) {
        const chevron = document.createElement('span');
        chevron.className = AC_DATAGRID_CLASS_NAME.acDatagridRowExpandIcon;
        chevron.style.cursor = 'pointer';
        chevron.style.userSelect = 'none';
        chevron.style.display = 'inline-flex';
        chevron.style.alignItems = 'center';
        chevron.style.justifyContent = 'center';
        chevron.style.width = '16px';
        chevron.style.fontSize = '10px';
        chevron.style.color = '#555';

        if (this.datagridApi.loadingRowIds.has(this.datagridRow.rowId)) {
          chevron.textContent = '⏳';
        } else {
          chevron.textContent = this.datagridRow.isExpanded ? '▼' : '▶';
        }

        chevron.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.datagridRow) {
            this.datagridApi?.toggleRow({ rowId: this.datagridRow.rowId });
          }
        });
        container.appendChild(chevron);
      } else {
        const spacer = document.createElement('span');
        spacer.style.display = 'inline-block';
        spacer.style.width = '16px';
        container.appendChild(spacer);
      }
    }

    // 4. Master/Detail expand icon
    if (this.datagridApi.hasMasterDetail) {
      if (this.datagridRow.isMasterDetail || this.datagridApi.masterDetailConfig) {
        const detailIcon = document.createElement('span');
        detailIcon.className = AC_DATAGRID_CLASS_NAME.acDatagridDetailExpandIcon;
        detailIcon.style.cursor = 'pointer';
        detailIcon.style.userSelect = 'none';
        detailIcon.style.display = 'inline-flex';
        detailIcon.style.alignItems = 'center';
        detailIcon.style.justifyContent = 'center';
        detailIcon.style.width = '16px';
        detailIcon.style.fontSize = '12px';
        detailIcon.style.fontWeight = 'bold';
        detailIcon.style.color = '#333';
        detailIcon.textContent = this.datagridRow.isDetailExpanded ? '−' : '+';

        detailIcon.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.datagridRow) {
            this.datagridApi?.toggleDetailRow({ rowId: this.datagridRow.rowId });
          }
        });
        container.appendChild(detailIcon);
      } else {
        const spacer = document.createElement('span');
        spacer.style.display = 'inline-block';
        spacer.style.width = '16px';
        container.appendChild(spacer);
      }
    }

    // 5. Row Number
    if (this.datagridApi.showRowNumbers) {
      const numSpan = document.createElement('span');
      numSpan.className = AC_DATAGRID_CLASS_NAME.acDatagridRowNumber;
      numSpan.style.fontSize = '11px';
      numSpan.style.color = '#777';
      numSpan.style.userSelect = 'none';
      numSpan.textContent = `${this.datagridRow.index + 1}`;
      container.appendChild(numSpan);
    }
  }
}

acRegisterCustomElement({ tag: AC_DATAGRID_TAG.datagridInternalCell, type: AcDatagridInternalCellElement });
