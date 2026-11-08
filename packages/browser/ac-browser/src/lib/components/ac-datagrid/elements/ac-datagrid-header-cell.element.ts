/* eslint-disable @typescript-eslint/no-inferrable-types */

import { AcDatagridApi } from "../core/ac-datagrid-api";
import { acAddClassToElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DATAGRID_CLASS_NAME } from "../consts/ac-datagrid-css-class-name.const";
import { AcEnumSortOrder } from "@autocode-ts/autocode";
import { AcDatagridAttributeName } from "../consts/ac-datagrid-attribute-name.const";
import { IAcDatagridColumn } from "../interfaces/ac-datagrid-column.interface";
import { AcElementBase } from "../../../core/ac-element-base";
import { AC_DATAGRID_ICON_CLASS, AC_DATAGRID_TAG } from "../_ac-datagrid.export";
import { Instance as PopperInstance } from '@popperjs/core';
import { AcDataFilterPopup } from "../../ac-data-filter/elements/ac-data-filter-popup";
import { AC_DATAGRID_EVENT } from "../consts/ac-datagrid-event.const";

export class AcDatagridHeaderCellElement extends AcElementBase {
  datagridApi?: AcDatagridApi;
  datagridColumn?: IAcDatagridColumn;
  isResizing: boolean = false;
  startWidth: number = 0;
  startX = 0;

  private filterPopup?: AcDataFilterPopup;

  applyPinning() {
    this.style.flexShrink = '0';
    if (this.datagridColumn && this.datagridColumn.pinnedOn) {
      // this.style.position = 'sticky';
      // this.style.zIndex = '12';
      // this.style.backgroundColor = 'var(--ac-datagrid-header-bg, #f4f5f7)';
      if (this.datagridColumn.pinnedOn === 'LEFT') {
        const offset = this.datagridApi?.getPinnedLeftOffset(this.datagridColumn) ?? 0;
        this.style.left = `${offset}px`;
        this.style.right = '';
        this.classList.add('ac-datagrid-pinned-left');
        this.classList.remove('ac-datagrid-pinned-right');
      } else if (this.datagridColumn.pinnedOn === 'RIGHT') {
        const offset = this.datagridApi?.getPinnedRightOffset(this.datagridColumn) ?? 0;
        this.style.right = `${offset}px`;
        this.style.left = '';
        this.classList.add('ac-datagrid-pinned-right');
        this.classList.remove('ac-datagrid-pinned-left');
      }
    } else {
      this.style.position = 'relative';
      this.style.left = '';
      this.style.right = '';
      this.style.zIndex = '';
      this.classList.remove('ac-datagrid-pinned-left', 'ac-datagrid-pinned-right');
    }
  }

  override init() {
    super.init();
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridHeaderCell, element: this });
    if (this.datagridColumn) {
      this.setAttribute(AcDatagridAttributeName.acDatagridColumnId, this.datagridColumn.columnId);
    }
    this.registerListeners();
  }

  private _reflectedHeaderClasses: Set<string> = new Set();

  applyReflectedHeaderClasses() {
    if (!this.datagridColumn) return;
    const colDef = this.datagridColumn.columnDefinition;
    const headerCellClass = colDef.headerCellClass;
    if (!headerCellClass) {
      for (const cls of this._reflectedHeaderClasses) {
        this.classList.remove(cls);
      }
      this._reflectedHeaderClasses.clear();
      return;
    }

    let newClasses: string[] = [];
    if (typeof headerCellClass === 'string') {
      newClasses = headerCellClass.split(/\s+/).filter(Boolean);
    } else if (Array.isArray(headerCellClass)) {
      newClasses = (headerCellClass as string[]).filter(Boolean);
    } else if (typeof headerCellClass === 'object') {
      newClasses = Object.entries(headerCellClass as Record<string, boolean>)
        .filter(([, v]) => v)
        .map(([k]) => k);
    } else if (typeof headerCellClass === 'function') {
      const result = (headerCellClass as Function)({
        column: this.datagridColumn,
        datagridApi: this.datagridApi
      });
      if (typeof result === 'string') {
        newClasses = result.split(/\s+/).filter(Boolean);
      } else if (Array.isArray(result)) {
        newClasses = result.filter(Boolean);
      } else if (result && typeof result === 'object') {
        newClasses = Object.entries(result as Record<string, boolean>)
          .filter(([, v]) => v)
          .map(([k]) => k);
      }
    }

    const newSet = new Set(newClasses);
    for (const cls of this._reflectedHeaderClasses) {
      if (!newSet.has(cls)) this.classList.remove(cls);
    }
    for (const cls of newSet) {
      if (!this._reflectedHeaderClasses.has(cls)) this.classList.add(cls);
    }
    this._reflectedHeaderClasses = newSet;
  }

  initHeaderCell() {
    this.render();
    this.setCellWidth();
    this.applyPinning();
    this.applyReflectedHeaderClasses();
    this.updateSortIcon();
  }

  refresh() {
    this.applyPinning();
    this.applyReflectedHeaderClasses();
    this.updateSortIcon();
  }

  updateSortIcon(): void {
    const sortEl = this.querySelector(
      '.' + AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellSort
    ) as HTMLElement | null;
    if (!sortEl || !this.datagridColumn) return;

    const sortOrder = this.datagridColumn.sortOrder;
    const isActive =
      sortOrder === AcEnumSortOrder.Ascending ||
      sortOrder === AcEnumSortOrder.Descending;

    // Update icon class (ascending / descending / neutral)
    if (sortOrder === AcEnumSortOrder.Ascending) {
      sortEl.setAttribute('class', AC_DATAGRID_ICON_CLASS.sortAscending);
    } else if (sortOrder === AcEnumSortOrder.Descending) {
      sortEl.setAttribute('class', AC_DATAGRID_ICON_CLASS.sortDescending);
    } else {
      sortEl.setAttribute('class', AC_DATAGRID_ICON_CLASS.sort);
    }

    // Always keep the structural class
    sortEl.classList.add(AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellSort);

    // Active colour class
    if (isActive) {
      sortEl.classList.add('ac-datagrid-header-cell-sort--active');
    } else {
      sortEl.classList.remove('ac-datagrid-header-cell-sort--active');
    }

    // Sort-order number badge — only shown when 2+ columns are sorted
    let badge = sortEl.nextElementSibling as HTMLElement | null;
    if (badge && !badge.classList.contains(AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellSortBadge)) {
      badge = null;
    }

    if (isActive) {
      const field = this.datagridColumn.columnDefinition.field;
      const allSorts = (this.datagridApi?.dataManager?.sortOrder?.sortOrders ?? []) as any[];
      const sortIndex = allSorts.findIndex((s: any) => s.key === field || s.field === field);
      const sortNumber = sortIndex >= 0 ? sortIndex + 1 : null;

      if (sortNumber !== null && allSorts.length > 1) {
        if (!badge) {
          badge = this.ownerDocument.createElement('span');
          badge.className = AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellSortBadge;
          sortEl.insertAdjacentElement('afterend', badge);
        }
        badge.textContent = String(sortNumber);
        badge.style.display = '';
      } else {
        if (badge) badge.style.display = 'none';
      }
    } else {
      if (badge) badge.style.display = 'none';
    }
  }

  updateFilterIcon(): void {
    const filterEl = this.querySelector('.' + AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellFilter) as HTMLElement | null;
    if (!filterEl || !this.datagridColumn) return;
    const colField = this.datagridColumn.columnDefinition.field;
    const dmFilters = this.datagridApi?.dataManager?.filterGroup?.filters ?? [];
    const hasFilters =
      dmFilters.some((f: any) => f.key === colField || f.field === colField) ||
      (this.datagridColumn.filterGroup?.filters?.length ?? 0) > 0 ||
      (this.datagridColumn.filterGroup?.filterGroups?.length ?? 0) > 0;
    filterEl.setAttribute('class',
      hasFilters ? AC_DATAGRID_ICON_CLASS.appliedFilter : AC_DATAGRID_ICON_CLASS.filter
    );
    filterEl.classList.add(AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellFilter);
    if (hasFilters) {
      filterEl.classList.add('ac-datagrid-header-cell-filter--active');
    } else {
      filterEl.classList.remove('ac-datagrid-header-cell-filter--active');
    }
  }

  registerListeners() {
    // Column dragging / reordering
    this.addEventListener('pointerdown', (e: PointerEvent) => {
      if (e.button !== 0 || this.isResizing || !this.datagridApi || !this.datagridColumn) return;
      if (this.datagridApi.allowColumnDragging === false || this.datagridColumn.columnDefinition.allowReorder === false) return;

      const target = e.target as HTMLElement;
      if (target?.closest(`.${AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellResize}`) ||
          target?.closest(`.${AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellFilter}`) ||
          target?.closest(`.${AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellSort}`) ||
          target?.closest('input')) {
        return;
      }

      // Prevent text selection from beginning
      e.preventDefault();

      const startX = e.clientX;
      let isDraggingCol = false;
      const sourceCol = this.datagridColumn;
      const headerEl = this.closest('ac-datagrid-header') as any;

      const onPointerMove = (moveEvt: PointerEvent) => {
        if (!isDraggingCol && Math.abs(moveEvt.clientX - startX) > 6) {
          isDraggingCol = true;
          this.style.opacity = '0.5';
          document.body.classList.add('ac-datagrid-dragging-active');
          window.getSelection()?.removeAllRanges();
        }
        if (isDraggingCol && headerEl) {
          const targetEl = document.elementFromPoint(moveEvt.clientX, moveEvt.clientY);
          const targetCell = targetEl?.closest('ac-datagrid-header-cell') as AcDatagridHeaderCellElement;
          if (targetCell && targetCell.datagridColumn) {
            const rect = targetCell.getBoundingClientRect();
            const headerRect = headerEl.getBoundingClientRect();
            const midX = rect.left + rect.width / 2;
            const lineX = (moveEvt.clientX < midX ? rect.left : rect.right) - headerRect.left;
            headerEl.showDropIndicator?.(lineX);
          }
        }
      };

      const onPointerUp = (upEvt: PointerEvent) => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        document.body.classList.remove('ac-datagrid-dragging-active');
        this.style.opacity = '';
        headerEl?.hideDropIndicator?.();

        if (isDraggingCol) {
          const targetEl = document.elementFromPoint(upEvt.clientX, upEvt.clientY);
          const targetCell = targetEl?.closest('ac-datagrid-header-cell') as AcDatagridHeaderCellElement;
          if (targetCell && targetCell.datagridColumn) {
            const targetCol = targetCell.datagridColumn;
            if (targetCol && targetCol.columnId !== sourceCol.columnId) {
              this.datagridApi?.moveColumn({ fromIndex: sourceCol.index, toIndex: targetCol.index });
            }
          }
        }
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    });
  }

  render() {
    if (!this.datagridColumn) return;

    const titleText = this.datagridColumn.title ?? this.datagridColumn.columnKey ?? '';
    this.innerHTML = `<div class="${AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellContainer}">
      <div class="${AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellLeftContainer}">
        <div class="${AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellTitle}" title="${titleText}">${titleText}</div>
      </div>
      <div class="${AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellRightContainer}"></div>
    </div>`;

    // Sort icon
    if (this.datagridColumn.columnDefinition.allowSort !== false) {
      const sortElement = this.ownerDocument.createElement('i');
      const setIcon = () => {
        if (this.datagridColumn?.sortOrder === AcEnumSortOrder.Ascending) {
          sortElement.setAttribute('class', AC_DATAGRID_ICON_CLASS.sortAscending);
        } else if (this.datagridColumn?.sortOrder === AcEnumSortOrder.Descending) {
          sortElement.setAttribute('class', AC_DATAGRID_ICON_CLASS.sortDescending);
        } else {
          sortElement.setAttribute('class', AC_DATAGRID_ICON_CLASS.sort);
        }
        sortElement.classList.add(AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellSort);
      };
      setIcon();
      this.querySelector(`.${AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellLeftContainer}`)?.append(sortElement);
      sortElement.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!this.datagridColumn || !this.datagridApi) return;
        const current = this.datagridColumn.sortOrder;
        const next = current === AcEnumSortOrder.Ascending ? AcEnumSortOrder.Descending
          : (current === AcEnumSortOrder.Descending ? AcEnumSortOrder.None : AcEnumSortOrder.Ascending);

        this.datagridApi.setColumnSortOrder({ datagridColumn: this.datagridColumn, sortOrder: next });
        this.datagridApi.refreshColumnSortIndicators();
      });
    }

    // Filter icon
    if (this.datagridColumn.columnDefinition.allowFilter !== false) {
      const filterElement = this.ownerDocument.createElement('i');
      const colField = this.datagridColumn.columnDefinition.field;
      const dmFilters = this.datagridApi?.dataManager?.filterGroup?.filters ?? [];
      const hasFilters = dmFilters.some((f: any) => f.key === colField || f.field === colField);
      filterElement.setAttribute('class', hasFilters ? AC_DATAGRID_ICON_CLASS.appliedFilter : AC_DATAGRID_ICON_CLASS.filter);
      filterElement.classList.add(AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellFilter);
      if (hasFilters) filterElement.classList.add('ac-datagrid-header-cell-filter--active');
      this.querySelector(`.${AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellRightContainer}`)?.append(filterElement);
      filterElement.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openFilterPopup(filterElement);
      });
    }

    // Column Resize Handle
    if (this.datagridApi?.allowColumnResizing !== false && this.datagridColumn.columnDefinition.allowResize !== false) {
      const resizeHandle = this.ownerDocument.createElement('div');
      resizeHandle.className = AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellResize;
      resizeHandle.title = 'Drag to resize, double-click to auto-fit';
      this.appendChild(resizeHandle);

      resizeHandle.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (this.datagridColumn && this.datagridApi) {
          this.datagridApi.autoResizeColumn({ datagridColumn: this.datagridColumn });
        }
      });

      resizeHandle.addEventListener('pointerdown', (e: PointerEvent) => {
        if (e.button !== 0 || !this.datagridColumn || !this.datagridApi) return;
        e.stopPropagation();
        e.preventDefault();
        resizeHandle.setPointerCapture(e.pointerId);
        this.isResizing = true;
        resizeHandle.classList.add('resizing');
        document.body.classList.add('ac-datagrid-dragging-active');
        this.startX = e.clientX;
        this.startWidth = this.datagridColumn.width;
        const minWidth = this.datagridColumn.columnDefinition.minWidth ?? 40;
        const maxWidth = this.datagridColumn.columnDefinition.maxWidth ?? 1200;

        const onPointerMove = (moveEvt: PointerEvent) => {
          if (!this.isResizing || !this.datagridColumn || !this.datagridApi) return;
          const diff = moveEvt.clientX - this.startX;
          let newWidth = this.startWidth + diff;
          newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
          this.datagridApi.setColumnWidth({ datagridColumn: this.datagridColumn, width: newWidth });
        };

        const onPointerUp = (upEvt: PointerEvent) => {
          this.isResizing = false;
          resizeHandle.classList.remove('resizing');
          document.body.classList.remove('ac-datagrid-dragging-active');
          try {
            resizeHandle.releasePointerCapture(upEvt.pointerId);
          } catch (_) {}
          resizeHandle.removeEventListener('pointermove', onPointerMove);
          resizeHandle.removeEventListener('pointerup', onPointerUp);

          if (this.datagridColumn && this.datagridApi) {
            this.datagridApi.events.execute({
              event: AC_DATAGRID_EVENT.ColumnResize,
              args: {
                column: this.datagridColumn,
                width: this.datagridColumn.width,
                datagridApi: this.datagridApi
              }
            });
            this.datagridApi.notifyStateChange({ source: 'columnResize' });
          }
        };

        resizeHandle.addEventListener('pointermove', onPointerMove);
        resizeHandle.addEventListener('pointerup', onPointerUp);
      });
    }
  }

  private openFilterPopup(anchor: HTMLElement) {
    if (this.filterPopup?.isOpen) {
      this.filterPopup.hide();
      return;
    }

    if (!this.datagridApi || !this.datagridColumn) return;

    const targetField = {
      key: this.datagridColumn.columnDefinition.field,
      label: this.datagridColumn.title || this.datagridColumn.columnDefinition.field,
      type: this.datagridColumn.columnDefinition.dataType,
      allowFilter: true,
    };

    const fields = (this.datagridApi.columnDefinitions ?? []).map((col) => ({
      key: col.field,
      label: col.title ?? col.field,
      type: col.dataType,
      allowFilter: col.allowFilter !== false,
    }));

    this.filterPopup = new AcDataFilterPopup({
      dataManager: this.datagridApi.dataManager,
      fields: fields,
      targetField: targetField,
      anchorElement: anchor,
      onApply: () => {
        this.render();
        this.updateFilterIcon();
        this.datagridApi?.refreshColumnFilterIndicators();
        this.datagridApi?.dataManager.refreshRows();
      },
      onClear: () => {
        this.render();
        this.updateFilterIcon();
        this.datagridApi?.refreshColumnFilterIndicators();
        this.datagridApi?.dataManager.refreshRows();
      },
    });

    this.filterPopup.show(anchor);
  }

  setCellWidth() {
    if (!this.datagridColumn) return;
    const width = this.datagridColumn.width;
    this.style.width = `${width}px`;
    this.style.maxWidth = `${width}px`;
    this.style.minWidth = `${width}px`;
    this.style.flexShrink = '0';
    this.applyPinning();
  }

  setHeaderCell({ datagridColumn, datagridApi }: { datagridColumn: IAcDatagridColumn, datagridApi?: AcDatagridApi }) {
    this.datagridColumn = datagridColumn;
    this.datagridApi = datagridApi;
    this.initHeaderCell();
  }
}

acRegisterCustomElement({ tag: AC_DATAGRID_TAG.datagridHeaderCell, type: AcDatagridHeaderCellElement });
