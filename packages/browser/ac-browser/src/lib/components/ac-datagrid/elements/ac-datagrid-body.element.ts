/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcDatagridRowElement } from "./ac-datagrid-row.element";
import { AcDatagridApi } from "../core/ac-datagrid-api";
import { AC_DATAGRID_HOOK } from "../consts/ac-datagrid-hook.const";
import { IAcDatagridBodyHookArgs } from "../interfaces/hook-args/ac-datagrid-body-hook-args.interface";
import { acAddClassToElement, acClearElement, acGetParentElementWithTag, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DATAGRID_CLASS_NAME } from "../consts/ac-datagrid-css-class-name.const";
import { AcElementBase } from "../../../core/ac-element-base";
import { AC_DATAGRID_TAG, AcDatagridElement } from "../../_components.export";
import { AcDatagridCellElement } from "./ac-datagrid-cell.element";
import { AcDatagridAttributeName } from "../consts/ac-datagrid-attribute-name.const";

export class AcDatagridBody extends AcElementBase {
  datagridApi?: AcDatagridApi;
  currentRows: AcDatagridRowElement[] = [];

  private pinnedTopContainer?: HTMLElement;
  private rowsContainer?: HTMLElement;
  private pinnedBottomContainer?: HTMLElement;
  private rowDropIndicator?: HTMLElement;

  showRowDropIndicator(topPx: number) {
    if (!this.rowDropIndicator) {
      this.rowDropIndicator = document.createElement('div');
      this.rowDropIndicator.className = AC_DATAGRID_CLASS_NAME.acDatagridRowDropIndicator;
      this.appendChild(this.rowDropIndicator);
    }
    this.rowDropIndicator.style.top = `${topPx}px`;
    this.rowDropIndicator.classList.add('show');
  }

  hideRowDropIndicator() {
    if (this.rowDropIndicator) {
      this.rowDropIndicator.classList.remove('show');
    }
  }

  private autoBindDatagrid() {
    if (this.isConnected) {
      const datagrid = acGetParentElementWithTag({ element: this, tag: AC_DATAGRID_TAG.datagrid });
      if (datagrid) {
        this.datagridApi = (datagrid as AcDatagridElement).datagridApi;
        this.datagridApi.hooks.subscribe({
          hook: AC_DATAGRID_HOOK.DisplayedRowsChange,
          callback: () => {
            this.setDisplayedRows();
          }
        });
        const hookArgs: IAcDatagridBodyHookArgs = {
          datagridApi: this.datagridApi,
          datagridBody: this
        };
        this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.BodyInit, args: hookArgs });
        this.datagridApi.bodyWidth = this.getBoundingClientRect().width;
      }
    } else {
      this.delayedCallback.add({
        callback: () => {
          this.autoBindDatagrid();
        }, duration: 50, key: 'autoInit'
      });
    }
  }

  private clearBody() {
    for (const row of this.currentRows) {
      row.remove();
      row.destroy();
    }
    if (this.rowsContainer) {
      acClearElement({ element: this.rowsContainer });
    }
    if (this.pinnedTopContainer) {
      acClearElement({ element: this.pinnedTopContainer });
    }
    if (this.pinnedBottomContainer) {
      acClearElement({ element: this.pinnedBottomContainer });
    }
    this.hideRowDropIndicator();
    this.currentRows = [];
  }

  override destroy(): void {
    this.clearBody();
    super.destroy();
  }

  override init() {
    super.init();
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridBody, element: this });
    this.tabIndex = 0;
    this.style.outline = 'none';
    this.style.height = '100%';
    this.style.display = 'flex';
    this.style.flexDirection = 'column';
    this.style.overflow = 'auto';
    this.style.position = 'relative';

    this.setupContainers();
    this.registerDelegatedListeners();
    this.autoBindDatagrid();

    // Synchronize horizontal scrolling with header
    this.addEventListener('scroll', () => {
      const header = this.datagridApi?.datagrid?.datagridHeader;
      if (header && header.scrollLeft !== this.scrollLeft) {
        header.scrollLeft = this.scrollLeft;
      }
    }, { passive: true });
  }

  private setupContainers() {
    // Pinned top container
    this.pinnedTopContainer = document.createElement('div');
    this.pinnedTopContainer.className = AC_DATAGRID_CLASS_NAME.acDatagridRowPinnedTop;
    this.pinnedTopContainer.style.position = 'sticky';
    this.pinnedTopContainer.style.top = '0';
    this.pinnedTopContainer.style.zIndex = '9';
    this.pinnedTopContainer.style.backgroundColor = 'var(--ac-datagrid-cell-bg, #ffffff)';
    this.pinnedTopContainer.style.display = 'none';
    this.pinnedTopContainer.style.flexDirection = 'column';
    this.pinnedTopContainer.style.borderBottom = '2px solid #cbd5e1';
    this.pinnedTopContainer.style.width = 'fit-content';
    this.pinnedTopContainer.style.minWidth = '100%';
    this.appendChild(this.pinnedTopContainer);

    // Normal rows container
    this.rowsContainer = document.createElement('div');
    this.rowsContainer.className = AC_DATAGRID_CLASS_NAME.acDatagridRowsContainer;
    this.rowsContainer.style.display = 'flex';
    this.rowsContainer.style.flexDirection = 'column';
    this.rowsContainer.style.flex = '1';
    this.rowsContainer.style.width = 'fit-content';
    this.rowsContainer.style.minWidth = '100%';
    this.appendChild(this.rowsContainer);

    // Pinned bottom container
    this.pinnedBottomContainer = document.createElement('div');
    this.pinnedBottomContainer.className = AC_DATAGRID_CLASS_NAME.acDatagridRowPinnedBottom;
    this.pinnedBottomContainer.style.position = 'sticky';
    this.pinnedBottomContainer.style.bottom = '0';
    this.pinnedBottomContainer.style.zIndex = '9';
    this.pinnedBottomContainer.style.backgroundColor = 'var(--ac-datagrid-cell-bg, #ffffff)';
    this.pinnedBottomContainer.style.display = 'none';
    this.pinnedBottomContainer.style.flexDirection = 'column';
    this.pinnedBottomContainer.style.borderTop = '2px solid #cbd5e1';
    this.pinnedBottomContainer.style.width = 'fit-content';
    this.pinnedBottomContainer.style.minWidth = '100%';
    this.appendChild(this.pinnedBottomContainer);
  }

  private registerDelegatedListeners() {
    // Delegated click
    this.addEventListener('click', (e: MouseEvent) => {
      if (!this.datagridApi) return;
      const target = e.target as HTMLElement;

      // Cell click
      const cellEl = target?.closest('ac-datagrid-cell') as AcDatagridCellElement;
      if (cellEl && cellEl.datagridCell) {
        this.datagridApi.setActiveCell({ datagridCell: cellEl.datagridCell });
      }

      // Row click for selection if selectOnRowClick enabled
      if (this.datagridApi.selectOnRowClick && this.datagridApi.allowSelection) {
        const rowEl = target?.closest('ac-datagrid-row') as AcDatagridRowElement;
        if (rowEl?.datagridRow && !target?.closest('input') && !target?.closest('.ac-datagrid-row-expand-icon') && !target?.closest('.ac-datagrid-detail-expand-icon') && !target?.closest('.ac-datagrid-row-drag-handle')) {
          this.datagridApi.selectRow({ rowId: rowEl.datagridRow.rowId, event: e });
        }
      }
    });

    // Delegated double click for editing
    this.addEventListener('dblclick', (e: MouseEvent) => {
      if (!this.datagridApi) return;
      const target = e.target as HTMLElement;
      const cellEl = target?.closest('ac-datagrid-cell') as AcDatagridCellElement;
      if (cellEl && cellEl.datagridCell) {
        if (this.datagridApi.editMode === 'row') {
          this.datagridApi.startRowEdit({ rowId: cellEl.datagridCell.datagridRow.rowId });
        } else {
          cellEl.startEdit();
        }
      }
    });

    // Delegated keydown for keyboard navigation
    this.addEventListener('keydown', (e: KeyboardEvent) => {
      if (!this.datagridApi) return;
      this.datagridApi.eventHandler?.handleKeyDown(e);
    });
  }

  renderPinnedRows() {
    if (!this.datagridApi || !this.pinnedTopContainer || !this.pinnedBottomContainer) return;
    const { top, bottom } = this.datagridApi.getPinnedRows();

    // Top
    acClearElement({ element: this.pinnedTopContainer });
    this.pinnedTopContainer.classList.toggle('show', top.length > 0);
    if (top.length > 0) {
      this.pinnedTopContainer.style.display = 'flex';
      const topFragment = document.createDocumentFragment();
      for (const row of top) {
        const rowEl = new AcDatagridRowElement();
        rowEl.setRow({ datagridApi: this.datagridApi, datagridRow: row });
        this.currentRows.push(rowEl);
        topFragment.appendChild(rowEl);
      }
      this.pinnedTopContainer.appendChild(topFragment);
    } else {
      this.pinnedTopContainer.style.display = 'none';
    }

    // Bottom
    acClearElement({ element: this.pinnedBottomContainer });
    this.pinnedBottomContainer.classList.toggle('show', bottom.length > 0);
    if (bottom.length > 0) {
      this.pinnedBottomContainer.style.display = 'flex';
      const bottomFragment = document.createDocumentFragment();
      for (const row of bottom) {
        const rowEl = new AcDatagridRowElement();
        rowEl.setRow({ datagridApi: this.datagridApi, datagridRow: row });
        this.currentRows.push(rowEl);
        bottomFragment.appendChild(rowEl);
      }
      this.pinnedBottomContainer.appendChild(bottomFragment);
    } else {
      this.pinnedBottomContainer.style.display = 'none';
    }
  }

  setDisplayedRows() {
    const prevScrollLeft = this.scrollLeft;
    const prevScrollTop = this.scrollTop;

    // Capture active cell state and focus before clearing DOM
    const activeCell = this.datagridApi?.activeDatagridCell;
    const activeRowId = activeCell?.datagridRow?.rowId ?? this.datagridApi?.activeEditRowId ?? this.datagridApi?.activeDatagridRow?.rowId;
    const activeRowIndex = activeCell?.datagridRow?.index;
    const activeColumnId = activeCell?.datagridColumn?.columnId;
    const activeColumnKey = activeCell?.datagridColumn?.columnKey;

    const activeElement = document.activeElement;
    const cellEl = activeCell?.element;
    const cellContainsFocus = cellEl ? (cellEl.contains(activeElement) || activeElement === cellEl) : false;
    const rowContainsFocus = activeRowId ? !!this.querySelector(`[${AcDatagridAttributeName.acDatagridRowId}="${activeRowId}"]`)?.contains(activeElement) : false;
    const bodyContainsFocus = this.contains(activeElement) || activeElement === this;
    const hadFocus = cellContainsFocus || rowContainsFocus || bodyContainsFocus;

    const wasEditing = !!(
      (cellEl as any)?.isEditing ||
      (activeRowId && this.datagridApi?.activeEditRowId === activeRowId)
    );

    let selectionStart: number | null = null;
    let selectionEnd: number | null = null;
    if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
      try {
        selectionStart = activeElement.selectionStart;
        selectionEnd = activeElement.selectionEnd;
      } catch (e) {
        // Ignored for input types not supporting selection
      }
    }

    this.clearBody();
    if (!this.datagridApi || !this.rowsContainer) return;

    this.renderPinnedRows();

    // Normal displayed rows (excluding pinned rows)
    const normalRows = this.datagridApi.displayedDatagridRows.filter(r => !r.pinned);
    const fragment = document.createDocumentFragment();
    for (const row of normalRows) {
      const datagridRow = new AcDatagridRowElement();
      datagridRow.setRow({
        datagridApi: this.datagridApi,
        datagridRow: row
      });
      this.currentRows.push(datagridRow);
      fragment.appendChild(datagridRow);
    }
    this.rowsContainer.appendChild(fragment);

    // Restore active cell, editing state, and focus on the counterpart row/cell
    if (activeRowId || (activeRowIndex !== undefined && activeRowIndex >= 0)) {
      const newRowEl = this.currentRows.find(r => r.datagridRow?.rowId === activeRowId)
        || (activeRowIndex !== undefined && activeRowIndex >= 0 && activeRowIndex < this.currentRows.length ? this.currentRows[activeRowIndex] : undefined);

      if (newRowEl) {
        const newCellEl = newRowEl.datagridCells?.find(c =>
          (activeColumnId && c.datagridCell?.datagridColumn?.columnId === activeColumnId) ||
          (activeColumnKey && c.datagridCell?.datagridColumn?.columnKey === activeColumnKey)
        );

        if (newCellEl && newCellEl.datagridCell) {
          this.datagridApi!.setActiveCell({ datagridCell: newCellEl.datagridCell });

          if (wasEditing) {
            newCellEl.enterEditMode();
          }

          if (hadFocus) {
            newCellEl.focus();
            if (selectionStart !== null && selectionEnd !== null) {
              const inputEl = newCellEl.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement;
              if (inputEl) {
                try {
                  inputEl.setSelectionRange(selectionStart, selectionEnd);
                } catch (e) {
                  // ignore
                }
              }
            }
          }
        } else if (hadFocus && newRowEl.datagridRow) {
          const firstFocusableCell = newRowEl.datagridCells?.find(c => c.isEditable?.() || c.datagridCell?.datagridColumn?.allowFocus);
          if (firstFocusableCell?.datagridCell) {
            this.datagridApi!.setActiveCell({ datagridCell: firstFocusableCell.datagridCell });
            firstFocusableCell.focus();
          }
        }
      }
    }

    if (prevScrollLeft > 0 || prevScrollTop > 0) {
      this.scrollLeft = prevScrollLeft;
      this.scrollTop = prevScrollTop;
      const header = this.datagridApi?.datagrid?.datagridHeader;
      if (header && header.scrollLeft !== prevScrollLeft) {
        header.scrollLeft = prevScrollLeft;
      }
    }
    this.datagridApi?.datagrid?.datagridHeader?.syncScrollbarSpacer();
    this.datagridApi?.handleAutoWidthColumns();
  }
}

acRegisterCustomElement({ tag: 'ac-datagrid-body', type: AcDatagridBody });
