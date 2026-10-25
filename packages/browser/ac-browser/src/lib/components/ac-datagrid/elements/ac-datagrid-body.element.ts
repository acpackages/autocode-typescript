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
import { IAcDatagridRow } from "../interfaces/ac-datagrid-row.interface";

export class AcDatagridBody extends AcElementBase {
  datagridApi?: AcDatagridApi;
  currentRows: AcDatagridRowElement[] = [];
  renderedRowsMap: Map<string, AcDatagridRowElement> = new Map();
  private isScrollScheduled: boolean = false;
  // PERF FIX (1.1): Cached normal-row filter result — rebuilt once per call site, not N times
  private _normalRowsCache: IAcDatagridRow[] = [];
  // PERF FIX (4.1/4.2): Columns fingerprint — changes trigger full row re-render; otherwise refresh() in-place
  private _columnsFingerprint: string = '';

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

  /** Returns the non-pinned rows, caching the result for the duration of the calling method. */
  private getNormalRows(): IAcDatagridRow[] {
    this._normalRowsCache = this.datagridApi?.displayedDatagridRows.filter(r => !r.pinned) ?? [];
    return this._normalRowsCache;
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
    for (const [, row] of this.renderedRowsMap) {
      row.remove();
      row.destroy();
    }
    this.renderedRowsMap.clear();
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

    // Synchronize horizontal scrolling with header and handle virtual scrolling
    this.addEventListener('scroll', () => {
      const header = this.datagridApi?.datagrid?.datagridHeader;
      if (header && header.scrollLeft !== this.scrollLeft) {
        header.scrollLeft = this.scrollLeft;
      }
      if (this.datagridApi?.useVirtualScrolling) {
        this.onScrollVirtual();
      }
    }, { passive: true });
  }

  private onScrollVirtual() {
    if (this.isScrollScheduled) return;
    this.isScrollScheduled = true;
    requestAnimationFrame(() => {
      this.isScrollScheduled = false;
      this.renderVirtualRows();
    });
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
    this.rowsContainer.style.position = 'relative';
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

    if (!this.datagridApi || !this.rowsContainer) return;

    this.renderPinnedRows();

    // Normal displayed rows (excluding pinned rows)
    const normalRows = this.getNormalRows();
    const rowHeight = this.datagridApi.rowHeight || 36;
    const isMasterDetail = !!this.datagridApi.hasMasterDetail;
    if (isMasterDetail) {
      this.rowsContainer.style.height = 'auto';
    } else {
      const totalHeight = normalRows.length * rowHeight;
      this.rowsContainer.style.height = `${totalHeight}px`;
    }

    if (this.datagridApi.useVirtualScrolling) {
      this.renderVirtualRows();
    } else {
      // PERF FIX (4.1): Key-based reconciliation — reuse row elements that are still visible.
      // Full clearBody()+rebuild only happens when column definitions change (fingerprint mismatch).
      const newFingerprint = this.datagridApi.datagridColumns.filter(c => c.visible).map(c => c.columnId).join(',');
      const columnsChanged = newFingerprint !== this._columnsFingerprint;
      if (columnsChanged) {
        this._columnsFingerprint = newFingerprint;
      }

      const newIds = new Set(normalRows.map(r => r.rowId));

      // Remove stale rows
      for (const [rowId, rowEl] of this.renderedRowsMap) {
        if (!newIds.has(rowId)) {
          rowEl.remove();
          rowEl.destroy();
          this.renderedRowsMap.delete(rowId);
        }
      }

      const useAbsolute = this.datagridApi.animateRows && !isMasterDetail && !this.datagridApi.usePagination;
      const newCurrentRows: AcDatagridRowElement[] = [];
      for (const row of normalRows) {
        let rowEl = this.renderedRowsMap.get(row.rowId);
        if (!rowEl) {
          rowEl = new AcDatagridRowElement();
          if (useAbsolute) {
            rowEl.style.position = 'absolute';
            rowEl.style.top = '0';
            rowEl.style.left = '0';
            rowEl.style.width = 'fit-content';
            rowEl.style.minWidth = '100%';
            rowEl.style.transform = `translateY(${row.index * rowHeight}px)`;
          } else {
            rowEl.style.position = '';
            rowEl.style.top = '';
            rowEl.style.left = '';
            rowEl.style.transform = '';
          }
          rowEl.setRow({ datagridApi: this.datagridApi, datagridRow: row });
          this.renderedRowsMap.set(row.rowId, rowEl);
        } else {
          // Update the data reference (sort/filter may change which data row maps to this rowId)
          rowEl.datagridRow = row;
          if (useAbsolute) {
            rowEl.style.transform = `translateY(${row.index * rowHeight}px)`;
          } else {
            rowEl.style.position = '';
            rowEl.style.top = '';
            rowEl.style.left = '';
            rowEl.style.transform = '';
          }
          if (columnsChanged) {
            // Column set changed — need full cell rebuild
            (rowEl as any).render();
          } else {
            rowEl.refresh();
          }
        }
        newCurrentRows.push(rowEl);
      }

      for (let i = 0; i < newCurrentRows.length; i++) {
        const rowEl = newCurrentRows[i];
        const currentChild = this.rowsContainer.children[i];
        if (currentChild !== rowEl) {
          this.rowsContainer.insertBefore(rowEl, currentChild ?? null);
        }
      }
      // PERF FIX (4.2): Maintain currentRows as ordered array; avoid Array.from().sort() every render
      this.currentRows = newCurrentRows;
    }

    // Restore active cell, editing state, and focus on the counterpart row/cell
    if (activeRowId || (activeRowIndex !== undefined && activeRowIndex >= 0)) {
      // PERF FIX (5.1): O(1) Map lookup instead of O(n) .find()
      const newRowEl = (activeRowId ? this.renderedRowsMap.get(activeRowId) : undefined)
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

  renderVirtualRows(customScrollTop?: number) {
    if (!this.datagridApi || !this.rowsContainer) return;
    const normalRows = this.getNormalRows();
    const totalRows = normalRows.length;
    const rowHeight = this.datagridApi.rowHeight || 36;
    const totalHeight = totalRows * rowHeight;
    this.rowsContainer.style.height = `${totalHeight}px`;

    if (totalRows === 0) {
      for (const [, rowEl] of this.renderedRowsMap) {
        rowEl.remove();
        rowEl.destroy();
      }
      this.renderedRowsMap.clear();
      this.currentRows = [];
      return;
    }

    const scrollTop = customScrollTop !== undefined ? customScrollTop : this.scrollTop;
    const viewportHeight = this.clientHeight || this.getBoundingClientRect().height || 400;
    const buffer = 8;
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
    const endIndex = Math.min(totalRows - 1, Math.ceil((scrollTop + viewportHeight) / rowHeight) + buffer);

    const desiredRowIds = new Set<string>();
    for (let i = startIndex; i <= endIndex; i++) {
      if (normalRows[i]) {
        desiredRowIds.add(normalRows[i].rowId);
      }
    }

    // Unmount rows outside visible window
    for (const [rowId, rowEl] of this.renderedRowsMap) {
      if (!desiredRowIds.has(rowId) && !rowEl.classList.contains('ac-datagrid-row-removing')) {
        rowEl.remove();
        rowEl.destroy();
        this.renderedRowsMap.delete(rowId);
      }
    }

    // Mount or update rows inside visible window
    for (let i = startIndex; i <= endIndex; i++) {
      const row = normalRows[i];
      if (!row) continue;
      const rowIndex = row.index !== undefined && row.index >= 0 ? row.index : i;
      const existingEl = this.renderedRowsMap.get(row.rowId);
      if (existingEl) {
        if (existingEl.datagridRow.index !== rowIndex) {
          existingEl.updateIndex(rowIndex);
        }
        existingEl.style.transform = `translateY(${rowIndex * rowHeight}px)`;
      } else {
        const rowEl = new AcDatagridRowElement();
        rowEl.style.position = 'absolute';
        rowEl.style.top = '0';
        rowEl.style.left = '0';
        rowEl.style.width = 'fit-content';
        rowEl.style.minWidth = '100%';
        rowEl.style.transform = `translateY(${rowIndex * rowHeight}px)`;
        rowEl.setRow({ datagridApi: this.datagridApi, datagridRow: row });
        if (row.index === undefined || row.index !== rowIndex) {
          rowEl.updateIndex(rowIndex);
        }
        this.renderedRowsMap.set(row.rowId, rowEl);
        this.rowsContainer.appendChild(rowEl);
      }
    }

    // PERF FIX (4.2): Keep sort here for virtual scroll since renderedRowsMap is the source of truth
    this.currentRows = Array.from(this.renderedRowsMap.values()).sort(
      (a, b) => (a.datagridRow?.index ?? 0) - (b.datagridRow?.index ?? 0)
    );
  }

  deleteRowAnimated({ datagridRow, rowElement }: { datagridRow: IAcDatagridRow, rowElement?: any }): Promise<void> {
    return new Promise((resolve) => {
      const rowId = datagridRow.rowId;
      const deletedIndex = datagridRow.index;
      const rowHeight = this.datagridApi?.rowHeight || 36;
      const rowEl = rowElement || this.renderedRowsMap.get(rowId) || this.currentRows.find(r => r.datagridRow?.rowId === rowId);

      const normalRows = this.getNormalRows();
      const remainingRows = this.currentRows.filter(r => r !== rowEl);
      for (let i = 0; i < remainingRows.length; i++) {
        const mountedEl = remainingRows[i];
        const r = normalRows[i];
        if (mountedEl && r) {
          mountedEl.datagridRow = r;
          mountedEl.updateIndex(r.index !== undefined && r.index >= 0 ? r.index : i);
        } else if (mountedEl) {
          mountedEl.updateIndex(i);
        }
      }

      if (rowEl && this.datagridApi?.animateRows) {
        rowEl.classList.add('ac-datagrid-row-removing');
        rowEl.style.setProperty('--row-top', `${deletedIndex * rowHeight}px`);
        if (this.rowsContainer) {
          const newHeight = Math.max(0, normalRows.length * rowHeight);
          this.rowsContainer.style.height = `${newHeight}px`;
        }

        setTimeout(() => {
          rowEl.remove();
          rowEl.destroy();
          if (rowId) {
            this.renderedRowsMap.delete(rowId);
          }
          this.currentRows = this.currentRows.filter(r => r !== rowEl);
          resolve();
        }, 250);
      } else {
        if (rowEl) {
          rowEl.remove();
          rowEl.destroy();
          if (rowId) {
            this.renderedRowsMap.delete(rowId);
          }
          this.currentRows = this.currentRows.filter(r => r !== rowEl);
        }
        if (this.rowsContainer) {
          const newHeight = Math.max(0, normalRows.length * rowHeight);
          this.rowsContainer.style.height = `${newHeight}px`;
        }
        resolve();
      }
    });
  }

  resequenceRows() {
    const normalRows = this.getNormalRows();
    const rh = this.datagridApi?.rowHeight || 36;
    for (let i = 0; i < this.currentRows.length; i++) {
      const el = this.currentRows[i];
      const r = normalRows[i];
      if (el && r) {
        el.datagridRow = r;
        el.updateIndex(r.index !== undefined && r.index >= 0 ? r.index : i);
      } else if (el) {
        el.updateIndex(i);
      }
    }
    if (this.rowsContainer) {
      this.rowsContainer.style.height = `${normalRows.length * rh}px`;
    }
  }

  animateRowExpansion({ parentRow, childRows }: { parentRow: IAcDatagridRow, childRows: IAcDatagridRow[] }) {
    const rowHeight = this.datagridApi?.rowHeight || 36;
    const parentTop = parentRow.index * rowHeight;
    const normalRows = this.getNormalRows();
    if (this.rowsContainer) {
      this.rowsContainer.style.height = `${normalRows.length * rowHeight}px`;
    }

    // PERF FIX (5.2): renderedRowsMap is source of truth — remove O(n) .find() fallback
    const parentEl = this.renderedRowsMap.get(parentRow.rowId);
    if (parentEl) {
      parentEl.classList.add('ac-datagrid-row-expanded');
      parentEl.refresh();
    }

    const newChildEls: AcDatagridRowElement[] = [];
    for (const child of childRows) {
      let childEl = this.renderedRowsMap.get(child.rowId);
      if (!childEl) {
        childEl = new AcDatagridRowElement();
        childEl.style.position = 'absolute';
        childEl.style.top = '0';
        childEl.style.left = '0';
        childEl.style.width = 'fit-content';
        childEl.style.minWidth = '100%';
        childEl.style.transform = `translateY(${parentTop}px)`;
        childEl.style.opacity = '0';
        childEl.classList.add('ac-datagrid-row-entering');
        childEl.setRow({ datagridApi: this.datagridApi!, datagridRow: child });
        this.renderedRowsMap.set(child.rowId, childEl);
        this.rowsContainer?.appendChild(childEl);
      }
      newChildEls.push(childEl);
    }

    for (const r of normalRows) {
      if (r.index > parentRow.index && !childRows.some(c => c.rowId === r.rowId)) {
        const el = this.renderedRowsMap.get(r.rowId) || this.currentRows.find(e => e.datagridRow?.rowId === r.rowId);
        if (el) {
          el.updateIndex(r.index);
        }
      }
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        for (const childEl of newChildEls) {
          childEl.classList.remove('ac-datagrid-row-entering');
          childEl.style.transform = `translateY(${childEl.datagridRow.index * rowHeight}px)`;
          childEl.style.opacity = '1';
        }
      });
    });
    // PERF FIX (4.2): Push new rows + sort once instead of Array.from(Map.values()).sort() each time
    for (const childEl of newChildEls) {
      if (!this.currentRows.includes(childEl)) {
        this.currentRows.push(childEl);
      }
    }
    this.currentRows.sort((a, b) => (a.datagridRow?.index ?? 0) - (b.datagridRow?.index ?? 0));
  }

  animateRowCollapse({ parentRow, childRowIds }: { parentRow: IAcDatagridRow, childRowIds: Set<string> }) {
    const rowHeight = this.datagridApi?.rowHeight || 36;
    const parentTop = parentRow.index * rowHeight;
    const normalRows = this.getNormalRows();

    // PERF FIX (5.2): renderedRowsMap is source of truth — remove O(n) .find() fallback
    const parentEl = this.renderedRowsMap.get(parentRow.rowId);
    if (parentEl) {
      parentEl.classList.remove('ac-datagrid-row-expanded');
      parentEl.refresh();
    }

    const collapsingEls: AcDatagridRowElement[] = [];
    for (const childId of childRowIds) {
      // PERF FIX (5.2): O(1) Map lookup
      const childEl = this.renderedRowsMap.get(childId);
      if (childEl) {
        childEl.style.transform = `translateY(${parentTop}px)`;
        childEl.style.opacity = '0';
        childEl.style.pointerEvents = 'none';
        collapsingEls.push(childEl);
      }
    }

    for (const r of normalRows) {
      if (r.index > parentRow.index) {
        const el = this.renderedRowsMap.get(r.rowId) || this.currentRows.find(e => e.datagridRow?.rowId === r.rowId);
        if (el && !childRowIds.has(r.rowId)) {
          el.updateIndex(r.index);
        }
      }
    }

    if (this.rowsContainer) {
      this.rowsContainer.style.height = `${normalRows.length * rowHeight}px`;
    }

    setTimeout(() => {
      for (const childEl of collapsingEls) {
        childEl.remove();
        childEl.destroy();
        if (childEl.datagridRow) {
          this.renderedRowsMap.delete(childEl.datagridRow.rowId);
        }
      }
      // PERF FIX (4.2): Splice collapsed rows from currentRows + sort once, avoid full Array.from rebuild
      for (const childEl of collapsingEls) {
        const idx = this.currentRows.indexOf(childEl);
        if (idx >= 0) this.currentRows.splice(idx, 1);
      }
      this.currentRows.sort((a, b) => (a.datagridRow?.index ?? 0) - (b.datagridRow?.index ?? 0));
    }, 250);
  }

  ensureIndexVisible(index: number) {
    if (!this.datagridApi) return;
    const rowHeight = this.datagridApi.rowHeight || 36;
    const rowTop = index * rowHeight;
    const rowBottom = rowTop + rowHeight;
    const viewportTop = this.scrollTop;
    const viewportHeight = this.clientHeight || this.getBoundingClientRect().height || 400;
    const viewportBottom = viewportTop + viewportHeight;

    if (rowTop < viewportTop) {
      this.scrollTop = rowTop;
    } else if (rowBottom > viewportBottom) {
      this.scrollTop = rowBottom - viewportHeight;
    }
    if (this.datagridApi.useVirtualScrolling) {
      this.renderVirtualRows();
    }
  }
}

acRegisterCustomElement({ tag: 'ac-datagrid-body', type: AcDatagridBody });
