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
    this.style.display = 'none';
    this.style.flexDirection = 'column';
    this.style.width = '300px';
    this.style.minWidth = '300px';
    this.style.maxWidth = '300px';
    this.style.height = '100%';
    this.style.backgroundColor = '#ffffff';
    this.style.borderLeft = '1px solid #e2e8f0';
    this.style.boxSizing = 'border-box';
    this.style.overflow = 'hidden';
    this.style.zIndex = '20';
  }

  bindDatagridApi({ datagridApi }: { datagridApi: AcDatagridApi }) {
    this.datagridApi = datagridApi;
    if (this.datagridApi.sidePanelOpen) {
      this.open();
    }
  }

  open() {
    this.style.display = 'flex';
    if (this.datagridApi) {
      this.datagridApi.sidePanelOpen = true;
    }
    this.render();
  }

  close() {
    this.style.display = 'none';
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
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.padding = '12px 16px';
    header.style.borderBottom = '1px solid #e2e8f0';
    header.style.backgroundColor = '#f8fafc';

    const title = document.createElement('span');
    title.textContent = 'Columns & Sorting';
    title.style.fontWeight = '600';
    title.style.fontSize = '14px';
    title.style.color = '#1e293b';

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.color = '#64748b';
    closeBtn.style.lineHeight = '1';
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(title);
    header.appendChild(closeBtn);
    this.appendChild(header);

    // Search bar & actions
    const toolbar = document.createElement('div');
    toolbar.style.padding = '10px 16px';
    toolbar.style.borderBottom = '1px solid #f1f5f9';
    toolbar.style.display = 'flex';
    toolbar.style.flexDirection = 'column';
    toolbar.style.gap = '8px';

    this.filterInput = document.createElement('input');
    this.filterInput.type = 'text';
    this.filterInput.placeholder = 'Search columns...';
    this.filterInput.value = this.searchQuery;
    this.filterInput.style.padding = '6px 10px';
    this.filterInput.style.borderRadius = '4px';
    this.filterInput.style.border = '1px solid #cbd5e1';
    this.filterInput.style.fontSize = '12px';
    this.filterInput.style.width = '100%';
    this.filterInput.style.boxSizing = 'border-box';
    this.filterInput.addEventListener('input', (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value.toLowerCase();
      this.renderColumnList();
    });
    toolbar.appendChild(this.filterInput);

    const btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.gap = '8px';

    const showAllBtn = document.createElement('button');
    showAllBtn.textContent = 'Show All';
    showAllBtn.style.padding = '4px 8px';
    showAllBtn.style.fontSize = '11px';
    showAllBtn.style.cursor = 'pointer';
    showAllBtn.style.borderRadius = '3px';
    showAllBtn.style.border = '1px solid #cbd5e1';
    showAllBtn.style.backgroundColor = '#ffffff';
    showAllBtn.addEventListener('click', () => {
      for (const c of this.datagridApi.datagridColumns) {
        c.visible = true;
        c.columnDefinition.visible = true;
      }
      this.applyColumnChanges();
      this.renderColumnList();
    });

    const hideAllBtn = document.createElement('button');
    hideAllBtn.textContent = 'Hide All';
    hideAllBtn.style.padding = '4px 8px';
    hideAllBtn.style.fontSize = '11px';
    hideAllBtn.style.cursor = 'pointer';
    hideAllBtn.style.borderRadius = '3px';
    hideAllBtn.style.border = '1px solid #cbd5e1';
    hideAllBtn.style.backgroundColor = '#ffffff';
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
    listContainer.style.flex = '1';
    listContainer.style.overflowY = 'auto';
    listContainer.style.padding = '6px 0';
    listContainer.style.position = 'relative';
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
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.padding = '6px 16px';
      item.style.gap = '8px';
      item.style.borderBottom = '1px solid #f8fafc';
      item.style.fontSize = '13px';

      // Drag handle
      const dragHandle = document.createElement('span');
      dragHandle.innerHTML = '⋮⋮';
      dragHandle.style.cursor = 'grab';
      dragHandle.style.color = '#94a3b8';
      dragHandle.style.touchAction = 'none';
      dragHandle.style.userSelect = 'none';

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
      chk.checked = col.visible;
      chk.style.cursor = 'pointer';
      chk.addEventListener('change', () => {
        col.visible = chk.checked;
        col.columnDefinition.visible = chk.checked;
        this.applyColumnChanges();
      });
      item.appendChild(chk);

      // Label
      const label = document.createElement('span');
      label.textContent = col.title || col.columnKey;
      label.style.flex = '1';
      label.style.overflow = 'hidden';
      label.style.textOverflow = 'ellipsis';
      label.style.whiteSpace = 'nowrap';
      label.title = col.title || col.columnKey;
      item.appendChild(label);

      // Pinning buttons
      const pinBtn = document.createElement('button');
      pinBtn.title = col.pinnedOn ? `Pinned ${col.pinnedOn} (Click to cycle)` : 'Pin column';
      pinBtn.style.background = col.pinnedOn ? '#e0f2fe' : 'none';
      pinBtn.style.border = '1px solid #cbd5e1';
      pinBtn.style.borderRadius = '3px';
      pinBtn.style.fontSize = '10px';
      pinBtn.style.padding = '2px 4px';
      pinBtn.style.cursor = 'pointer';
      pinBtn.textContent = col.pinnedOn === 'LEFT' ? '📌L' : (col.pinnedOn === 'RIGHT' ? '📌R' : '📌-');
      pinBtn.addEventListener('click', () => {
        const nextPin = col.pinnedOn === 'LEFT' ? 'RIGHT' : (col.pinnedOn === 'RIGHT' ? null : 'LEFT');
        this.datagridApi.pinColumn({ columnId: col.columnId, pinnedOn: nextPin });
        this.renderColumnList();
      });
      item.appendChild(pinBtn);

      // Sort button
      const sortBtn = document.createElement('button');
      sortBtn.title = 'Cycle Sort (Asc / Desc / None)';
      sortBtn.style.background = col.sortOrder && col.sortOrder !== AcEnumSortOrder.None ? '#fef3c7' : 'none';
      sortBtn.style.border = '1px solid #cbd5e1';
      sortBtn.style.borderRadius = '3px';
      sortBtn.style.fontSize = '10px';
      sortBtn.style.padding = '2px 5px';
      sortBtn.style.cursor = 'pointer';
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
