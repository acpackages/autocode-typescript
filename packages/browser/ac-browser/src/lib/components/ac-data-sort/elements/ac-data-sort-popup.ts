import { AcDataManager, AcEnumSortOrder, AcSort } from "@autocode-ts/autocode";
import { createPopper, Instance as PopperInstance } from "@popperjs/core";
import { acClearElement } from "../../../utils/ac-element-functions";
import { AcDataSortElement, IAcDataSortField } from "./ac-data-sort.element";

export interface IAcDataSortPopupOptions {
  sortElement?: AcDataSortElement;
  dataManager?: AcDataManager;
  fields?: IAcDataSortField[];
  anchorElement?: HTMLElement;
  /** When set, popup operates in single-field mode for this specific field */
  targetField?: IAcDataSortField;
  title?: string;
  onApply?: (sorts: AcSort[]) => void;
  onClear?: () => void;
}

export class AcDataSortPopup {
  private options: IAcDataSortPopupOptions;
  private sortElement?: AcDataSortElement;
  private popperInstance?: PopperInstance;
  private popupElement?: HTMLElement;
  private outsideClickHandler?: (e: MouseEvent) => void;

  get isOpen(): boolean {
    return !!this.popupElement;
  }

  get dataManager(): AcDataManager | undefined {
    return this.options.dataManager ?? this.sortElement?.dataManager;
  }

  get fields(): IAcDataSortField[] {
    return this.options.fields ?? this.sortElement?.fields ?? [];
  }

  get targetField(): IAcDataSortField | undefined {
    return this.options.targetField;
  }

  get isSingleFieldMode(): boolean {
    return !!this.targetField;
  }

  constructor(options: { sortElement: AcDataSortElement } | IAcDataSortPopupOptions) {
    if ('sortElement' in options && options.sortElement && Object.keys(options).length === 1) {
      this.sortElement = options.sortElement;
      this.options = { sortElement: options.sortElement };
    } else {
      this.options = options;
      this.sortElement = options.sortElement;
    }
  }

  show(anchorElement?: HTMLElement) {
    if (this.popupElement) return;

    const title = this.options.title ?? (this.targetField ? `Sort: ${this.targetField.label || this.targetField.key}` : 'Sort Order');

    this.popupElement = document.createElement('div');
    this.popupElement.className = 'ac-data-sort-popup ac-repeater-header-popup';
    this.popupElement.innerHTML = `
      <div class="ac-data-sort-popup-header ac-repeater-popup-header">
        <span>${title}</span>
        <button class="ac-data-sort-popup-close ac-repeater-popup-close" type="button">&times;</button>
      </div>
      <div class="ac-data-sort-rows-container ac-repeater-sort-rows-container" style="max-height: 300px; overflow-y: auto;"></div>
      <div class="ac-data-sort-actions ac-repeater-filter-actions">
        ${this.isSingleFieldMode ? '' : '<button class="ac-data-sort-btn ac-repeater-header-button ac-data-sort-add-btn" type="button">Add</button>'}
        <button class="ac-data-sort-btn ac-repeater-header-button ac-data-sort-clear-btn" type="button">Clear</button>
        <button class="ac-data-sort-btn ac-repeater-header-button ac-data-sort-apply-btn" type="button" style="background:#007bff; color:#fff; border-color:#007bff;">Apply</button>
      </div>
    `;

    document.body.appendChild(this.popupElement);
    this.popupElement.style.display = 'flex';

    const anchor = anchorElement ?? this.options.anchorElement ?? this.sortElement?.buttonElement ?? this.sortElement;
    if (anchor) {
      this.popperInstance = createPopper(anchor, this.popupElement, {
        strategy: 'fixed',
        placement: 'bottom-end',
        modifiers: [
          { name: 'flip', options: { fallbackPlacements: ['top-end', 'bottom-start', 'top-start'] } },
          { name: 'offset', options: { offset: [0, 6] } },
          { name: 'preventOverflow', options: { padding: 8 } },
        ],
      });
    }

    // Wire events
    this.popupElement.querySelector('.ac-data-sort-popup-close')?.addEventListener('click', () => this.hide());
    this.popupElement.querySelector('.ac-data-sort-add-btn')?.addEventListener('click', () => this.addSortRow());
    this.popupElement.querySelector('.ac-data-sort-clear-btn')?.addEventListener('click', () => {
      this.clearSort();
    });
    this.popupElement.querySelector('.ac-data-sort-apply-btn')?.addEventListener('click', () => {
      this.applySort();
      this.hide();
    });

    this.popupElement.addEventListener('click', (e) => e.stopPropagation());

    this.outsideClickHandler = (e: MouseEvent) => {
      const target = e.target as Node;
      const anchorEl = anchorElement ?? this.options.anchorElement ?? this.sortElement;
      if (this.popupElement && !this.popupElement.contains(target) && (!anchorEl || !anchorEl.contains(target))) {
        this.hide();
      }
    };
    document.addEventListener('click', this.outsideClickHandler);

    this.refreshSortRows();
  }

  hide() {
    if (this.popperInstance) {
      this.popperInstance.destroy();
      this.popperInstance = undefined;
    }
    if (this.popupElement) {
      this.popupElement.remove();
      this.popupElement = undefined;
    }
    if (this.outsideClickHandler) {
      document.removeEventListener('click', this.outsideClickHandler);
      this.outsideClickHandler = undefined;
    }
  }

  refreshSortRows() {
    if (!this.popupElement) return;
    const container = this.popupElement.querySelector('.ac-data-sort-rows-container') as HTMLElement;
    if (!container) return;
    acClearElement({ element: container });

    const allSorts = this.dataManager?.sortOrder.sortOrders ?? [];
    const sorts = this.isSingleFieldMode
      ? allSorts.filter((s) => s.key === this.targetField!.key)
      : allSorts;

    if (sorts.length === 0) {
      this.addSortRow();
    } else {
      sorts.forEach((sort) => this.addSortRow(sort));
    }
  }

  addSortRow(sort?: AcSort) {
    if (!this.popupElement) return;
    const container = this.popupElement.querySelector('.ac-data-sort-rows-container') as HTMLElement;
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'ac-data-sort-row ac-repeater-filter-row';
    row.style.marginBottom = '8px';

    const isSingle = this.isSingleFieldMode;

    if (isSingle) {
      row.innerHTML = `
        <select class="sort-order" style="flex:1">
          <option value="${AcEnumSortOrder.Ascending}" ${sort?.order === AcEnumSortOrder.Ascending ? 'selected' : ''}>Ascending</option>
          <option value="${AcEnumSortOrder.Descending}" ${sort?.order === AcEnumSortOrder.Descending ? 'selected' : ''}>Descending</option>
          <option value="${AcEnumSortOrder.None}" ${sort?.order === AcEnumSortOrder.None ? 'selected' : ''}>None</option>
        </select>
      `;
    } else {
      const sortableFields = this.fields.filter(f => f.allowSort !== false);
      const fieldsOptions = `<option value="">Select Field...</option>` + sortableFields.map(f => `<option value="${f.key}" ${sort?.key === f.key ? 'selected' : ''}>${f.label}</option>`).join('');

      row.innerHTML = `
        <select class="sort-key" style="flex:1">${fieldsOptions}</select>
        <select class="sort-order">
          <option value="${AcEnumSortOrder.Ascending}" ${sort?.order === AcEnumSortOrder.Ascending ? 'selected' : ''}>Asc</option>
          <option value="${AcEnumSortOrder.Descending}" ${sort?.order === AcEnumSortOrder.Descending ? 'selected' : ''}>Desc</option>
        </select>
        <button class="remove-sort-row" type="button" style="background:none; border:none; cursor:pointer; color:red;">&times;</button>
      `;

      row.querySelector('.remove-sort-row')?.addEventListener('click', () => {
        row.remove();
      });
    }

    container.appendChild(row);
  }

  applySort() {
    if (!this.popupElement || !this.dataManager) return;
    const container = this.popupElement.querySelector('.ac-data-sort-rows-container') as HTMLElement;
    if (!container) return;

    const rowEls = container.querySelectorAll('.ac-data-sort-row');
    const newSorts: AcSort[] = [];

    if (this.isSingleFieldMode) {
      const targetKey = this.targetField!.key;
      const remainingSorts = (this.dataManager.sortOrder.sortOrders ?? []).filter(s => s.key !== targetKey);
      this.dataManager.sortOrder.sortOrders = remainingSorts;

      rowEls.forEach((row) => {
        const order = (row.querySelector('.sort-order') as HTMLSelectElement).value as AcEnumSortOrder;
        if (order && order !== AcEnumSortOrder.None) {
          this.dataManager?.sortOrder.addSort({ key: targetKey, order });
          newSorts.push(AcSort.instanceWithValues({ key: targetKey, order }));
        }
      });

      this.sortElement?.updateBadge();
      this.dataManager.refreshRows();
      this.options.onApply?.(newSorts);
    } else {
      this.dataManager.sortOrder.sortOrders = [];

      rowEls.forEach((row) => {
        const key = (row.querySelector('.sort-key') as HTMLSelectElement).value;
        const order = (row.querySelector('.sort-order') as HTMLSelectElement).value as AcEnumSortOrder;

        if (key) {
          this.dataManager?.sortOrder.addSort({ key, order });
          newSorts.push(AcSort.instanceWithValues({ key, order }));
        }
      });

      this.sortElement?.updateBadge();
      this.dataManager.refreshRows();
      this.options.onApply?.(newSorts);
    }
  }

  clearSort() {
    if (!this.dataManager) return;

    if (this.isSingleFieldMode) {
      const targetKey = this.targetField!.key;
      this.dataManager.sortOrder.sortOrders = (this.dataManager.sortOrder.sortOrders ?? []).filter(s => s.key !== targetKey);
    } else {
      this.dataManager.sortOrder.sortOrders = [];
    }

    this.sortElement?.updateBadge();
    this.dataManager.refreshRows();
    this.options.onClear?.();
    this.refreshSortRows();
  }

  destroy() {
    this.hide();
  }
}
