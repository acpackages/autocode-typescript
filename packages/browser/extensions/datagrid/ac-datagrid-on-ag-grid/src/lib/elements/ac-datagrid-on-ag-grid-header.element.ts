import { AcDataFilterPopup } from '@autocode-ts/ac-browser';
import { IHeaderComp, IHeaderParams } from 'ag-grid-community';

export class AcDatagridOnAgGridHeaderComponent implements IHeaderComp {
  private params!: IHeaderParams & { agGridExtension?: any; datagridColumn?: any; datagridApi?: any };
  private eGui!: HTMLElement;
  private filterPopup?: AcDataFilterPopup;
  private filterBtn?: HTMLButtonElement;
  private sortIcon?: HTMLElement;
  private onSortChangedListener?: () => void;
  private onFilterChangeListener?: () => void;

  init(params: any): void {
    this.params = params;
    const colDef = params.column?.getColDef() ?? {};
    const columnDefinition = colDef.columnDefinition ?? {};
    const fieldKey = colDef.field ?? '';
    const title = params.displayName || columnDefinition.title || colDef.headerName || fieldKey;
    const allowSort = colDef.sortable !== false && params.enableSorting !== false;
    const allowFilter = columnDefinition.allowFilter !== false && colDef.allowFilter !== false;

    this.eGui = document.createElement('div');
    this.eGui.className = 'ag-cell-label-container ac-aggrid-header-cell';
    this.eGui.style.display = 'flex';
    this.eGui.style.alignItems = 'center';
    this.eGui.style.justifyContent = 'space-between';
    this.eGui.style.width = '100%';
    this.eGui.style.height = '100%';
    this.eGui.style.boxSizing = 'border-box';
    this.eGui.style.overflow = 'hidden';

    // Left container: Title and Sort Icon
    const leftContainer = document.createElement('div');
    leftContainer.className = 'ac-aggrid-header-cell-label';
    leftContainer.style.display = 'flex';
    leftContainer.style.alignItems = 'center';
    leftContainer.style.gap = '4px';
    leftContainer.style.overflow = 'hidden';
    leftContainer.style.flex = '1';
    leftContainer.style.minWidth = '0';
    leftContainer.style.cursor = allowSort ? 'pointer' : 'default';

    const textSpan = document.createElement('span');
    textSpan.className = 'ag-header-cell-text';
    textSpan.style.overflow = 'hidden';
    textSpan.style.textOverflow = 'ellipsis';
    textSpan.style.whiteSpace = 'nowrap';
    textSpan.innerText = title;
    leftContainer.appendChild(textSpan);

    if (allowSort) {
      this.sortIcon = document.createElement('span');
      this.sortIcon.className = 'ag-header-icon ag-header-label-icon ag-sort-icon';
      this.sortIcon.style.display = 'inline-flex';
      this.sortIcon.style.alignItems = 'center';
      this.sortIcon.style.gap = '2px';
      this.sortIcon.style.flexShrink = '0';
      this.updateSortIcon();
      leftContainer.appendChild(this.sortIcon);

      leftContainer.addEventListener('click', (event: MouseEvent) => {
        params.progressSort(event.shiftKey);
      });

      this.onSortChangedListener = () => {
        this.updateSortIcon();
      };
      params.column.addEventListener('sortChanged', this.onSortChangedListener);
      if (params.api?.addEventListener) {
        params.api.addEventListener('sortChanged', this.onSortChangedListener);
      }
      const dataManager = this.getDataManager();
      if (dataManager) {
        dataManager.on({
          event: 'SORT_ORDER_CHANGE',
          callback: this.onSortChangedListener,
        });
      }
    }

    this.eGui.appendChild(leftContainer);

    // Right container: Filter Button at the end
    if (allowFilter) {
      const rightContainer = document.createElement('div');
      rightContainer.className = 'ac-aggrid-header-cell-filter-container';
      rightContainer.style.display = 'flex';
      rightContainer.style.alignItems = 'center';
      rightContainer.style.marginLeft = 'auto';
      rightContainer.style.flexShrink = '0';

      this.filterBtn = document.createElement('button');
      this.filterBtn.type = 'button';
      this.filterBtn.className = 'ac-aggrid-header-filter-btn';
      this.filterBtn.style.background = 'none';
      this.filterBtn.style.border = 'none';
      this.filterBtn.style.cursor = 'pointer';
      this.filterBtn.style.padding = '2px 4px';
      this.filterBtn.style.display = 'flex';
      this.filterBtn.style.alignItems = 'center';
      this.filterBtn.style.justifyContent = 'center';
      this.filterBtn.setAttribute('title', `Filter: ${title}`);

      this.updateFilterBtn();

      this.filterBtn.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation();
        this.toggleFilterPopup();
      });

      const dataManager = this.getDataManager();
      if (dataManager) {
        this.onFilterChangeListener = () => this.updateFilterBtn();
        dataManager.on({
          event: 'FILTER_GROUP_CHANGE',
          callback: this.onFilterChangeListener,
        });
        dataManager.on({
          event: 'DISPLAYED_ROWS_CHANGE',
          callback: this.onFilterChangeListener,
        });
      }

      rightContainer.appendChild(this.filterBtn);
      this.eGui.appendChild(rightContainer);
    }
  }

  private getDataManager(): any {
    return this.params.agGridExtension?.datagridApi?.dataManager ?? this.params.datagridApi?.dataManager;
  }

  private updateSortIcon() {
    if (!this.sortIcon) return;
    const sort = this.params.column.getSort();
    if (!sort) {
      this.sortIcon.innerHTML = '';
      this.sortIcon.style.opacity = '0';
      return;
    }

    // Determine multi-sort index
    let sortIndex: number | undefined = undefined;
    if (typeof (this.params.column as any).getSortIndex === 'function') {
      sortIndex = (this.params.column as any).getSortIndex();
    }

    let multiSorted = false;
    if (this.params.api?.getColumnState) {
      const colStates = this.params.api.getColumnState() || [];
      const sortedCols = colStates.filter((c: any) => c.sort != null);
      if (sortedCols.length > 1) {
        multiSorted = true;
        const colId = this.params.column.getColId();
        const idx = sortedCols.findIndex((c: any) => c.colId === colId);
        if (idx >= 0) {
          sortIndex = idx;
        }
      }
    }

    const indexHtml = (multiSorted && sortIndex !== undefined && sortIndex !== null)
      ? `<span class="ag-sort-indicator-index" style="font-size: 10px; font-weight: 700; line-height: 1; margin-left: 2px; opacity: 0.9;">${sortIndex + 1}</span>`
      : '';

    if (sort === 'asc') {
      this.sortIcon.innerHTML = `<svg width="11" height="11" viewBox="0 0 320 512" fill="currentColor"><path d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8l256 0c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"/></svg>${indexHtml}`;
      this.sortIcon.style.opacity = '1';
    } else if (sort === 'desc') {
      this.sortIcon.innerHTML = `<svg width="11" height="11" viewBox="0 0 320 512" fill="currentColor"><path d="M182.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-9.2-9.2-11.9-22.9-6.9-34.9s16.6-19.8 29.6-19.8l256 0c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9l-128 128z"/></svg>${indexHtml}`;
      this.sortIcon.style.opacity = '1';
    }
  }

  private updateFilterBtn() {
    if (!this.filterBtn) return;
    const dataManager = this.getDataManager();
    const fieldKey = this.params.column?.getColDef()?.field;
    const hasFilter = (dataManager?.filterGroup?.filters ?? []).some((f: any) => f.key === fieldKey);

    if (hasFilter) {
      this.filterBtn.className = 'ac-aggrid-header-filter-btn active';
      this.filterBtn.style.color = '#007bff';
      this.filterBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 512 512" fill="#007bff" style="display:block;"><path d="M3.9 54.9C10.5 40.9 24.5 32 40 32l432 0c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9 320 448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6l0-79.1L9.2 97.3C-.7 85.4-2.8 68.8 3.9 54.9z"/></svg>`;
    } else {
      this.filterBtn.className = 'ac-aggrid-header-filter-btn';
      this.filterBtn.style.color = '#888';
      this.filterBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 512 512" fill="currentColor" style="display:block; opacity:0.7;"><path d="M3.9 54.9C10.5 40.9 24.5 32 40 32l432 0c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9 320 448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6l0-79.1L9.2 97.3C-.7 85.4-2.8 68.8 3.9 54.9z"/></svg>`;
    }
  }

  private toggleFilterPopup() {
    if (this.filterPopup?.isOpen) {
      this.filterPopup.hide();
      return;
    }

    const colDef = this.params.column.getColDef();
    const columnDefinition = colDef.columnDefinition || {};
    const datagridApi = this.params.agGridExtension?.datagridApi ?? this.params.datagridApi;
    const dataManager = this.getDataManager();
    if (!dataManager || !this.filterBtn) return;

    const targetField = {
      key: colDef.field,
      label: this.params.displayName || columnDefinition.title || colDef.headerName || colDef.field,
      type: columnDefinition.dataType ?? colDef.type ?? 'STRING',
      allowFilter: true,
    };

    const fields = (datagridApi?.columnDefinitions ?? []).map((col: any) => ({
      key: col.field,
      label: col.title ?? col.field,
      type: col.dataType,
      allowFilter: col.allowFilter !== false,
    }));

    this.filterPopup = new AcDataFilterPopup({
      dataManager: dataManager,
      fields: fields.length > 0 ? fields : [targetField],
      targetField: targetField,
      anchorElement: this.filterBtn,
      onApply: () => {
        this.updateFilterBtn();
      },
      onClear: () => {
        this.updateFilterBtn();
      }
    });

    this.filterPopup.show(this.filterBtn);
  }

  getGui(): HTMLElement {
    return this.eGui;
  }

  refresh(params: IHeaderParams): boolean {
    this.params = params as any;
    this.updateSortIcon();
    this.updateFilterBtn();
    return true;
  }

  destroy(): void {
    if (this.onSortChangedListener) {
      this.params.column.removeEventListener('sortChanged', this.onSortChangedListener);
      if (this.params.api?.removeEventListener) {
        this.params.api.removeEventListener('sortChanged', this.onSortChangedListener);
      }
    }
    this.filterPopup?.destroy();
  }
}
