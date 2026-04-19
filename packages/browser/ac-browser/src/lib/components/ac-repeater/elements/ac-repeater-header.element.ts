import { AcElementBase } from "../../../core/_core.export";
import "../css/ac-repeater-header.css";
import { acGetParentElementWithTag, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_REPEATER_TAG } from "../consts/ac-repeater-tag.const";
import { AcRepeaterApi } from "../core/ac-repeater-api";
import { AcRepeaterElement } from "./ac-repeater.element";
import { AcEnumConditionOperator, AcEnumSortOrder, AcFilter, AcSort } from "@autocode-ts/autocode";
import { ACI_SVG_SOLID } from "@autocode-ts/ac-icons";
import { createPopper, Instance as PopperInstance } from '@popperjs/core';


export class AcRepeaterHeaderElement extends AcElementBase {

  private repeaterApi: AcRepeaterApi;
  private resizeObserver?: ResizeObserver;
  private filterPopper?: PopperInstance;
  private sortPopper?: PopperInstance;
  private filtersPopup?: HTMLElement;
  private sortPopup?: HTMLElement;
  private outsideClickHandler?: (e: MouseEvent) => void;

  private autoBindRepeater() {
    if (this.isConnected) {
      const repeater: AcRepeaterElement = acGetParentElementWithTag({ element: this, tag: AC_REPEATER_TAG.repeater }) as any;
      if (repeater) {
        this.repeaterApi = repeater.repeaterApi;
        this.render();
        this.setupResizeObserver();
      }
    }
    else {
      this.delayedCallback.add({
        callback: () => {
          this.autoBindRepeater();
        }, duration: 50, key: 'autoInit'
      });
    }
  }

  override init(): void {
    super.init();
    this.style.position = 'relative';
    this.autoBindRepeater();
  }

  private setupResizeObserver() {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const headerEl = this.querySelector('.ac-repeater-header') as HTMLElement;
        if (headerEl) {
          headerEl.classList.toggle('compact', width < 500);
          headerEl.classList.toggle('narrow', width < 350);
        }
      }
    });
    this.resizeObserver.observe(this);
  }

  override destroy(): void {
    this.resizeObserver?.disconnect();
    this.closeFilterPopup();
    this.closeSortPopup();
    if (this.outsideClickHandler) {
      document.removeEventListener('click', this.outsideClickHandler);
    }
    super.destroy();
  }

  private createPopupElement(title: string, content: string): HTMLElement {
    const popup = document.createElement('div');
    popup.className = 'ac-repeater-header-popup';
    popup.innerHTML = `
      <div class="ac-repeater-popup-header">
        <span>${title}</span>
        <button class="ac-repeater-popup-close">&times;</button>
      </div>
      ${content}
    `;
    return popup;
  }

  private render() {
    this.innerHTML = `
      <div class="ac-repeater-header">
        <div class="ac-repeater-search-container">
          <ac-svg-icon size="16px" style="color:#888">${ACI_SVG_SOLID.magnifyingGlass}</ac-svg-icon>
          <input type="text" class="ac-repeater-search-input" placeholder="Search...">
          <button class="ac-repeater-clear-search-btn" style="display:none">&times;</button>
        </div>
        <button class="ac-repeater-header-button ac-repeater-filter-btn">
          <ac-svg-icon size="18px">${ACI_SVG_SOLID.filter}</ac-svg-icon>
          <span class="ac-repeater-badge ac-repeater-filter-count" style="display:none">0</span>
        </button>
        <button class="ac-repeater-header-button ac-repeater-sort-btn">
          <ac-svg-icon size="18px">${ACI_SVG_SOLID.sort}</ac-svg-icon>
          <span class="ac-repeater-badge ac-repeater-sort-count" style="display:none">0</span>
        </button>
      </div>
    `;

    this.registerHeaderListeners();
  }

  private openFilterPopup() {
    if (this.filtersPopup) return; // already open
    this.closeSortPopup();

    const filterBtn = this.querySelector('.ac-repeater-filter-btn') as HTMLElement;
    this.filtersPopup = this.createPopupElement('Advanced Filters', `
      <div class="ac-repeater-filter-rows-container" style="max-height: 300px; overflow-y: auto;"></div>
      <div class="ac-repeater-filter-actions">
        <button class="ac-repeater-header-button ac-repeater-add-filter-btn">Add</button>
        <button class="ac-repeater-header-button ac-repeater-clear-filters-btn">Clear</button>
        <button class="ac-repeater-header-button ac-repeater-apply-filters-btn" style="background:#007bff; color:#fff; border-color:#007bff;">Apply</button>
      </div>
    `);

    document.body.appendChild(this.filtersPopup);
    this.filtersPopup.style.display = 'flex';

    this.filterPopper = createPopper(filterBtn, this.filtersPopup, {
      strategy: 'fixed',
      placement: 'bottom-end',
      modifiers: [
        { name: 'flip', options: { fallbackPlacements: ['top-end', 'bottom-start', 'top-start'] } },
        { name: 'offset', options: { offset: [0, 6] } },
        { name: 'preventOverflow', options: { padding: 8 } },
      ],
    });

    // Wire up filter popup buttons
    this.filtersPopup.querySelector('.ac-repeater-popup-close')?.addEventListener('click', () => this.closeFilterPopup());
    this.filtersPopup.querySelector('.ac-repeater-add-filter-btn')?.addEventListener('click', () => this.addFilterRow());
    this.filtersPopup.querySelector('.ac-repeater-clear-filters-btn')?.addEventListener('click', () => {
      this.repeaterApi.dataManager.filterGroup.clear();
      this.updateBadges();
      this.repeaterApi.dataManager.refreshRows();
      this.refreshFilterRows();
    });
    this.filtersPopup.querySelector('.ac-repeater-apply-filters-btn')?.addEventListener('click', () => {
      this.applyFilters();
      this.closeFilterPopup();
    });

    // Stop clicks inside popup from closing it
    this.filtersPopup.addEventListener('click', (e) => e.stopPropagation());

    this.refreshFilterRows();
  }

  private closeFilterPopup() {
    if (this.filterPopper) {
      this.filterPopper.destroy();
      this.filterPopper = undefined;
    }
    if (this.filtersPopup) {
      this.filtersPopup.remove();
      this.filtersPopup = undefined;
    }
  }

  private openSortPopup() {
    if (this.sortPopup) return; // already open
    this.closeFilterPopup();

    const sortBtn = this.querySelector('.ac-repeater-sort-btn') as HTMLElement;
    this.sortPopup = this.createPopupElement('Sort Order', `
      <div class="ac-repeater-sort-rows-container" style="max-height: 300px; overflow-y: auto;"></div>
      <div class="ac-repeater-filter-actions">
        <button class="ac-repeater-header-button ac-repeater-add-sort-btn">Add</button>
        <button class="ac-repeater-header-button ac-repeater-clear-sorts-btn">Clear</button>
        <button class="ac-repeater-header-button ac-repeater-apply-sort-btn" style="background:#007bff; color:#fff; border-color:#007bff;">Apply</button>
      </div>
    `);

    document.body.appendChild(this.sortPopup);
    this.sortPopup.style.display = 'flex';

    this.sortPopper = createPopper(sortBtn, this.sortPopup, {
      strategy: 'fixed',
      placement: 'bottom-end',
      modifiers: [
        { name: 'flip', options: { fallbackPlacements: ['top-end', 'bottom-start', 'top-start'] } },
        { name: 'offset', options: { offset: [0, 6] } },
        { name: 'preventOverflow', options: { padding: 8 } },
      ],
    });

    // Wire up sort popup buttons
    this.sortPopup.querySelector('.ac-repeater-popup-close')?.addEventListener('click', () => this.closeSortPopup());
    this.sortPopup.querySelector('.ac-repeater-add-sort-btn')?.addEventListener('click', () => this.addSortRow());
    this.sortPopup.querySelector('.ac-repeater-clear-sorts-btn')?.addEventListener('click', () => {
      this.repeaterApi.dataManager.sortOrder.sortOrders = [];
      this.updateBadges();
      this.repeaterApi.dataManager.refreshRows();
      this.refreshSortRows();
    });
    this.sortPopup.querySelector('.ac-repeater-apply-sort-btn')?.addEventListener('click', () => {
      this.applySort();
      this.closeSortPopup();
    });

    // Stop clicks inside popup from closing it
    this.sortPopup.addEventListener('click', (e) => e.stopPropagation());

    this.refreshSortRows();
  }

  private closeSortPopup() {
    if (this.sortPopper) {
      this.sortPopper.destroy();
      this.sortPopper = undefined;
    }
    if (this.sortPopup) {
      this.sortPopup.remove();
      this.sortPopup = undefined;
    }
  }

  private registerHeaderListeners() {
    const searchInput = this.querySelector('.ac-repeater-search-input') as HTMLInputElement;
    const clearSearchBtn = this.querySelector('.ac-repeater-clear-search-btn') as HTMLElement;
    searchInput.addEventListener('input', () => {
      this.delayedCallback.add({
        callback:()=>{
          this.repeaterApi.dataManager.searchQuery = searchInput.value;
          this.repeaterApi.dataManager.refreshRows();
        },
        duration:300,
        key:'queryRepeaterRows'
      });
      clearSearchBtn.style.display = searchInput.value ? 'block' : 'none';
    });

    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      this.repeaterApi.dataManager.searchQuery = '';
      this.repeaterApi.dataManager.refreshRows();
      clearSearchBtn.style.display = 'none';
      searchInput.focus();
    });

    const filterBtn = this.querySelector('.ac-repeater-filter-btn') as HTMLElement;
    const sortBtn = this.querySelector('.ac-repeater-sort-btn') as HTMLElement;

    filterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.filtersPopup) {
        this.closeFilterPopup();
      } else {
        this.openFilterPopup();
      }
    });

    sortBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.sortPopup) {
        this.closeSortPopup();
      } else {
        this.openSortPopup();
      }
    });

    // Close popups on outside click
    this.outsideClickHandler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (this.filtersPopup && !this.filtersPopup.contains(target) && !this.contains(target)) {
        this.closeFilterPopup();
      }
      if (this.sortPopup && !this.sortPopup.contains(target) && !this.contains(target)) {
        this.closeSortPopup();
      }
    };
    document.addEventListener('click', this.outsideClickHandler);
  }

  private refreshFilterRows() {
    const container = (this.filtersPopup ?? this).querySelector('.ac-repeater-filter-rows-container') as HTMLElement;
    if (!container) return;
    container.innerHTML = '';
    const filters = this.repeaterApi.dataManager.filterGroup.filters;
    if (filters.length === 0) {
      this.addFilterRow();
    } else {
      filters.forEach(filter => this.addFilterRow(filter));
    }
  }

  private addFilterRow(filter?: AcFilter) {
    const container = (this.filtersPopup ?? this).querySelector('.ac-repeater-filter-rows-container') as HTMLElement;
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'ac-repeater-filter-row';
    row.style.marginBottom = '8px';

    const filterableFields = this.repeaterApi.fields.filter(f => f.allowFilter !== false);
    const fieldsOptions = `<option value="">Select Field...</option>` + filterableFields.map(f => `<option value="${f.key}" ${filter?.key === f.key ? 'selected' : ''}>${f.label}</option>`).join('');

    const opLabels: Record<string, string> = {
      [AcEnumConditionOperator.EqualTo]: "Equal To",
      [AcEnumConditionOperator.NotEqualTo]: "Not Equal To",
      [AcEnumConditionOperator.GreaterThan]: "Greater Than",
      [AcEnumConditionOperator.GreaterThanEqualTo]: "Greater Than or Equal To",
      [AcEnumConditionOperator.LessThan]: "Less Than",
      [AcEnumConditionOperator.LessThanEqualTo]: "Less Than or Equal To",
      [AcEnumConditionOperator.Contains]: "Contains",
      [AcEnumConditionOperator.NotContains]: "Not Contains",
      [AcEnumConditionOperator.StartsWith]: "Starts With",
      [AcEnumConditionOperator.EndsWith]: "Ends With",
      [AcEnumConditionOperator.IsNull]: "Is Null",
      [AcEnumConditionOperator.IsNotNull]: "Is Not Null",
      [AcEnumConditionOperator.IsEmpty]: "Is Empty",
      [AcEnumConditionOperator.IsNotEmpty]: "Is Not Empty",
    };

    const noValueOps = [
      AcEnumConditionOperator.IsNull,
      AcEnumConditionOperator.IsNotNull,
      AcEnumConditionOperator.IsEmpty,
      AcEnumConditionOperator.IsNotEmpty,
    ];

    const opOptions = Object.keys(opLabels).map(op => `<option value="${op}" ${filter?.operator === op ? 'selected' : ''}>${opLabels[op]}</option>`).join('');

    const showValue = !filter || !noValueOps.includes(filter.operator);

    row.innerHTML = `
      <select class="filter-key" style="flex:1">${fieldsOptions}</select>
      <select class="filter-op">${opOptions}</select>
      <input type="text" class="filter-val" style="flex:1; display: ${showValue ? 'block' : 'none'}" value="${filter?.value ?? ''}">
      <button class="remove-filter-row" style="background:none; border:none; cursor:pointer; color:red;">&times;</button>
    `;

    const opSelect = row.querySelector('.filter-op') as HTMLSelectElement;
    const valInput = row.querySelector('.filter-val') as HTMLInputElement;

    opSelect.addEventListener('change', () => {
      valInput.style.display = noValueOps.includes(opSelect.value as any) ? 'none' : 'block';
    });

    row.querySelector('.remove-filter-row')?.addEventListener('click', () => {
      row.remove();
    });

    container.appendChild(row);
  }

  private applyFilters() {
    const container = (this.filtersPopup ?? this).querySelector('.ac-repeater-filter-rows-container') as HTMLElement;
    if (!container) return;
    const rowEls = container.querySelectorAll('.ac-repeater-filter-row');
    this.repeaterApi.dataManager.filterGroup.clear();

    rowEls.forEach(row => {
      const key = (row.querySelector('.filter-key') as HTMLSelectElement).value;
      const op = (row.querySelector('.filter-op') as HTMLSelectElement).value as AcEnumConditionOperator;
      const val = (row.querySelector('.filter-val') as HTMLInputElement).value;

      if (key) {
        this.repeaterApi.dataManager.filterGroup.addFilter({ key, operator: op, value: val });
      }
    });

    this.updateBadges();
    this.repeaterApi.dataManager.refreshRows();
  }

  private updateBadges() {
    const filterCountEl = this.querySelector('.ac-repeater-filter-count') as HTMLElement;
    const sortCountEl = this.querySelector('.ac-repeater-sort-count') as HTMLElement;

    const filterCount = this.repeaterApi.dataManager.filterGroup.filters.length;
    filterCountEl.innerText = filterCount.toString();
    filterCountEl.style.display = filterCount > 0 ? 'block' : 'none';

    const sortCount = this.repeaterApi.dataManager.sortOrder.sortOrders.length;
    sortCountEl.innerText = sortCount.toString();
    sortCountEl.style.display = sortCount > 0 ? 'block' : 'none';
  }

  private refreshSortRows() {
    const container = (this.sortPopup ?? this).querySelector('.ac-repeater-sort-rows-container') as HTMLElement;
    if (!container) return;
    container.innerHTML = '';
    const sorts = this.repeaterApi.dataManager.sortOrder.sortOrders;
    if (sorts.length === 0) {
      this.addSortRow();
    } else {
      sorts.forEach(sort => this.addSortRow(sort));
    }
  }

  private addSortRow(sort?: AcSort) {
    const container = (this.sortPopup ?? this).querySelector('.ac-repeater-sort-rows-container') as HTMLElement;
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'ac-repeater-filter-row';
    row.style.marginBottom = '8px';

    const sortableFields = this.repeaterApi.fields.filter(f => f.allowSort !== false);
    const fieldsOptions = `<option value="">Select Field...</option>` + sortableFields.map(f => `<option value="${f.key}" ${sort?.key === f.key ? 'selected' : ''}>${f.label}</option>`).join('');

    row.innerHTML = `
      <select class="sort-key" style="flex:1">${fieldsOptions}</select>
      <select class="sort-order">
        <option value="${AcEnumSortOrder.Ascending}" ${sort?.order === AcEnumSortOrder.Ascending ? 'selected' : ''}>Asc</option>
        <option value="${AcEnumSortOrder.Descending}" ${sort?.order === AcEnumSortOrder.Descending ? 'selected' : ''}>Desc</option>
      </select>
      <button class="remove-sort-row" style="background:none; border:none; cursor:pointer; color:red;">&times;</button>
    `;

    row.querySelector('.remove-sort-row')?.addEventListener('click', () => {
      row.remove();
    });

    container.appendChild(row);
  }

  private applySort() {
    const container = (this.sortPopup ?? this).querySelector('.ac-repeater-sort-rows-container') as HTMLElement;
    if (!container) return;
    const rowEls = container.querySelectorAll('.ac-repeater-filter-row');
    this.repeaterApi.dataManager.sortOrder.sortOrders = [];

    rowEls.forEach(row => {
      const key = (row.querySelector('.sort-key') as HTMLSelectElement).value;
      const order = (row.querySelector('.sort-order') as HTMLSelectElement).value as AcEnumSortOrder;

      if (key) {
        this.repeaterApi.dataManager.sortOrder.addSort({ key, order });
      }
    });

    this.updateBadges();
    this.repeaterApi.dataManager.refreshRows();
  }
}
acRegisterCustomElement({ tag: AC_REPEATER_TAG.repeaterHeader, type: AcRepeaterHeaderElement });
