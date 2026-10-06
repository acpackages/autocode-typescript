/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcElementBase } from "../../../core/ac-element-base";
import { AcDatagridApi } from "../core/ac-datagrid-api";
import { IAcDatagridColumn } from "../interfaces/ac-datagrid-column.interface";
import { acClearElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DATAGRID_TAG } from "../consts/ac-datagrid-tag.const";
import { AC_DATAGRID_CLASS_NAME } from "../consts/ac-datagrid-css-class-name.const";
import { AcEnumSortOrder } from "@autocode-ts/autocode";

export class AcDatagridSidePanelElement extends AcElementBase {
  datagridApi!: AcDatagridApi;
  private searchQuery: string = '';
  private filterInput?: HTMLInputElement;

  override init() {
    super.init();
    this.classList.add(AC_DATAGRID_CLASS_NAME.acDatagridSidePanel);
  }

  bindDatagridApi({ datagridApi }: { datagridApi: AcDatagridApi }) {
    this.datagridApi = datagridApi;
    if (this.datagridApi.sidePanelOpen) {
      this.open();
    }
  }

  open() {
    this.classList.add('open');
    if (this.datagridApi) {
      this.datagridApi.sidePanelOpen = true;
    }
    this.render();
  }

  close() {
    this.classList.remove('open');
    if (this.datagridApi) {
      this.datagridApi.sidePanelOpen = false;
      this.datagridApi.notifyStateChange({ source: 'sidePanel' });
    }
  }

  refresh() {
    this.render();
  }

  render() {
    acClearElement({ element: this });
    if (!this.datagridApi) return;

    // Header
    const header = document.createElement('div');
    header.className = 'ac-datagrid-side-panel-header';

    const title = document.createElement('span');
    title.className = 'ac-datagrid-side-panel-title';
    title.textContent = 'Columns & Sorting';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'ac-datagrid-side-panel-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(title);
    header.appendChild(closeBtn);
    this.appendChild(header);

    // Search bar & actions
    const toolbar = document.createElement('div');
    toolbar.className = 'ac-datagrid-side-panel-toolbar';

    this.filterInput = document.createElement('input');
    this.filterInput.type = 'text';
    this.filterInput.className = 'ac-datagrid-side-panel-filter-input';
    this.filterInput.placeholder = 'Search columns...';
    this.filterInput.value = this.searchQuery;
    this.filterInput.addEventListener('input', (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value.toLowerCase();
      this.renderColumnList();
    });
    toolbar.appendChild(this.filterInput);

    const btnRow = document.createElement('div');
    btnRow.className = 'ac-datagrid-side-panel-btn-row';

    const showAllBtn = document.createElement('button');
    showAllBtn.className = 'ac-datagrid-side-panel-action-btn';
    showAllBtn.textContent = 'Show All';
    showAllBtn.addEventListener('click', () => {
      for (const c of this.datagridApi.datagridColumns) {
        c.visible = true;
        c.columnDefinition.visible = true;
      }
      this.applyColumnChanges();
      this.renderColumnList();
    });

    const hideAllBtn = document.createElement('button');
    hideAllBtn.className = 'ac-datagrid-side-panel-action-btn';
    hideAllBtn.textContent = 'Hide All';
    hideAllBtn.addEventListener('click', () => {
      for (const c of this.datagridApi.datagridColumns) {
        c.visible = false;
        c.columnDefinition.visible = false;
      }
      this.applyColumnChanges();
      this.renderColumnList();
    });

    btnRow.appendChild(showAllBtn);
    btnRow.appendChild(hideAllBtn);
    toolbar.appendChild(btnRow);

    this.appendChild(toolbar);

    // List container
    const listContainer = document.createElement('div');
    listContainer.id = 'ac-side-panel-col-list';
    listContainer.className = 'ac-datagrid-side-panel-list';
    this.appendChild(listContainer);

    this.renderColumnList();
  }

  private renderColumnList() {
    const list = this.querySelector('#ac-side-panel-col-list') as HTMLElement;
    if (!list || !this.datagridApi) return;
    acClearElement({ element: list });

    const filtered = this.datagridApi.datagridColumns.filter(c => {
      if (!this.searchQuery) return true;
      const title = (c.title || c.columnKey || '').toLowerCase();
      return title.includes(this.searchQuery);
    });

    filtered.forEach((col, idx) => {
      const item = document.createElement('div');
      item.className = 'ac-datagrid-side-panel-item';

      // Drag handle
      const dragHandle = document.createElement('span');
      dragHandle.className = 'ac-datagrid-side-panel-drag-handle';
      dragHandle.innerHTML = '⋮⋮';

      // Pointer drag reorder
      dragHandle.addEventListener('pointerdown', (e: PointerEvent) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        e.preventDefault();
        dragHandle.setPointerCapture(e.pointerId);
        item.style.opacity = '0.5';
        document.body.classList.add('ac-datagrid-dragging-active');
        const startY = e.clientY;
        const fromIdx = col.index;
        let targetIdx = fromIdx;
        let hasMoved = false;

        let indicator = list.querySelector(`.${AC_DATAGRID_CLASS_NAME.acDatagridSidePanelDropIndicator}`) as HTMLElement;
        if (!indicator) {
          indicator = document.createElement('div');
          indicator.className = AC_DATAGRID_CLASS_NAME.acDatagridSidePanelDropIndicator;
          list.appendChild(indicator);
        }
        indicator.style.display = 'none';

        const onMove = (moveEvt: PointerEvent) => {
          if (!hasMoved && Math.abs(moveEvt.clientY - startY) > 4) {
            hasMoved = true;
          }
          if (hasMoved) {
            const underEl = document.elementFromPoint(moveEvt.clientX, moveEvt.clientY);
            const underItem = underEl?.closest('[data-col-index]') as HTMLElement;
            if (underItem && underItem.dataset['colIndex']) {
              const uIdx = parseInt(underItem.dataset['colIndex'], 10);
              const rect = underItem.getBoundingClientRect();
              const listRect = list.getBoundingClientRect();
              const midY = rect.top + rect.height / 2;
              const isAboveMid = moveEvt.clientY < midY;
              const topPx = (isAboveMid ? rect.top : rect.bottom) - listRect.top + list.scrollTop;
              indicator.style.top = `${topPx}px`;
              indicator.style.display = 'block';

              if (fromIdx < uIdx) {
                targetIdx = isAboveMid ? uIdx - 1 : uIdx;
              } else if (fromIdx > uIdx) {
                targetIdx = isAboveMid ? uIdx : uIdx + 1;
              } else {
                targetIdx = fromIdx;
              }
            }
          }
        };

        const onUp = (upEvt: PointerEvent) => {
          try {
            dragHandle.releasePointerCapture(upEvt.pointerId);
          } catch (_) {}
          dragHandle.removeEventListener('pointermove', onMove);
          dragHandle.removeEventListener('pointerup', onUp);
          document.body.classList.remove('ac-datagrid-dragging-active');
          item.style.opacity = '';
          indicator.remove();
          if (hasMoved && targetIdx !== fromIdx && targetIdx >= 0) {
            this.datagridApi.moveColumn({ fromIndex: fromIdx, toIndex: targetIdx });
            this.renderColumnList();
          }
        };

        dragHandle.addEventListener('pointermove', onMove);
        dragHandle.addEventListener('pointerup', onUp);
      });
      item.appendChild(dragHandle);

      // Visibility Checkbox
      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.className = 'ac-datagrid-side-panel-checkbox';
      chk.checked = col.visible;
      chk.addEventListener('change', () => {
        col.visible = chk.checked;
        col.columnDefinition.visible = chk.checked;
        this.applyColumnChanges();
      });
      item.appendChild(chk);

      // Label
      const label = document.createElement('span');
      label.className = 'ac-datagrid-side-panel-label';
      label.textContent = col.title || col.columnKey;
      label.title = col.title || col.columnKey;
      item.appendChild(label);

      // Pinning buttons
      const pinBtn = document.createElement('button');
      pinBtn.className = `ac-datagrid-side-panel-pin-btn ${col.pinnedOn ? 'pinned' : ''}`;
      pinBtn.title = col.pinnedOn ? `Pinned ${col.pinnedOn} (Click to cycle)` : 'Pin column';
      pinBtn.textContent = col.pinnedOn === 'LEFT' ? '📌L' : (col.pinnedOn === 'RIGHT' ? '📌R' : '📌-');
      pinBtn.addEventListener('click', () => {
        const nextPin = col.pinnedOn === 'LEFT' ? 'RIGHT' : (col.pinnedOn === 'RIGHT' ? null : 'LEFT');
        this.datagridApi.pinColumn({ columnId: col.columnId, pinnedOn: nextPin });
        this.renderColumnList();
      });
      item.appendChild(pinBtn);

      // Sort button
      const sortBtn = document.createElement('button');
      const isSorted = col.sortOrder && col.sortOrder !== AcEnumSortOrder.None;
      sortBtn.className = `ac-datagrid-side-panel-sort-btn ${isSorted ? 'sorted' : ''}`;
      sortBtn.title = 'Cycle Sort (Asc / Desc / None)';
      sortBtn.textContent = col.sortOrder === AcEnumSortOrder.Ascending ? '↑' : (col.sortOrder === AcEnumSortOrder.Descending ? '↓' : '↕');
      sortBtn.addEventListener('click', () => {
        const nextSort = col.sortOrder === AcEnumSortOrder.Ascending ? AcEnumSortOrder.Descending
          : (col.sortOrder === AcEnumSortOrder.Descending ? AcEnumSortOrder.None : AcEnumSortOrder.Ascending);
        this.datagridApi.setColumnSortOrder({ datagridColumn: col, sortOrder: nextSort });
        this.renderColumnList();
      });
      item.appendChild(sortBtn);

      item.dataset['colIndex'] = col.index.toString();
      list.appendChild(item);
    });
  }

  private applyColumnChanges() {
    this.datagridApi.updatePinnedOffsets();
    if (this.datagridApi.datagrid?.datagridHeader) {
      this.datagridApi.datagrid.datagridHeader.render();
    }
    if (this.datagridApi.datagrid?.datagridBody) {
      this.datagridApi.datagrid.datagridBody.setDisplayedRows();
    }
    this.datagridApi.notifyStateChange({ source: 'sidePanel' });
  }
}

acRegisterCustomElement({ tag: AC_DATAGRID_TAG.datagridSidePanel, type: AcDatagridSidePanelElement });
acRegisterCustomElement({ tag: AC_DATAGRID_TAG.datagridColumnCustomizer, type: AcDatagridSidePanelElement });
