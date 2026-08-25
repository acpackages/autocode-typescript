import { AcElementBase } from "../../../core/_core.export";
import "../css/ac-repeater-header.css";
import { acGetParentElementWithTag, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_REPEATER_TAG } from "../consts/ac-repeater-tag.const";
import { AcRepeaterApi } from "../core/ac-repeater-api";
import { AcRepeaterElement } from "./ac-repeater.element";
import { ACI_SVG_SOLID } from "@autocode-ts/ac-icons";
import { AC_DATA_FILTER_TAG } from "../../ac-data-filter/_ac-data-filter.export";
import { AC_DATA_SORT_TAG } from "../../ac-data-sort/_ac-data-sort.export";

export class AcRepeaterHeaderElement extends AcElementBase {
  private repeaterApi: AcRepeaterApi;
  private resizeObserver?: ResizeObserver;

  private autoBindRepeater() {
    if (this.isConnected) {
      const repeater: AcRepeaterElement = acGetParentElementWithTag({ element: this, tag: AC_REPEATER_TAG.repeater }) as any;
      if (repeater) {
        this.repeaterApi = repeater.repeaterApi;
        this.render();
        this.syncFilterAndSort();
        this.repeaterApi.events.subscribe({
          event: 'FIELDS_CHANGE',
          callback: () => this.syncFilterAndSort(),
        });
        this.setupResizeObserver();
      }
    } else {
      this.delayedCallback.add({
        callback: () => {
          this.autoBindRepeater();
        },
        duration: 50,
        key: 'autoInit',
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
    super.destroy();
  }

  private render() {
    this.innerHTML = `
      <div class="ac-repeater-header">
        <div class="ac-repeater-search-container">
          <ac-svg-icon size="16px" style="color:#888">${ACI_SVG_SOLID.magnifyingGlass}</ac-svg-icon>
          <input type="text" class="ac-repeater-search-input" placeholder="Search...">
          <button class="ac-repeater-clear-search-btn" type="button" style="display:none">&times;</button>
        </div>
        <${AC_DATA_FILTER_TAG.dataFilter}></${AC_DATA_FILTER_TAG.dataFilter}>
        <${AC_DATA_SORT_TAG.dataSort}></${AC_DATA_SORT_TAG.dataSort}>
      </div>
    `;

    this.registerHeaderListeners();
    this.syncFilterAndSort();
  }

  private syncFilterAndSort() {
    if (!this.repeaterApi) return;
    const filterEl = this.querySelector(AC_DATA_FILTER_TAG.dataFilter) as any;
    if (filterEl) {
      filterEl.dataManager = this.repeaterApi.dataManager;
      filterEl.fields = this.repeaterApi.fields ?? [];
    }
    const sortEl = this.querySelector(AC_DATA_SORT_TAG.dataSort) as any;
    if (sortEl) {
      sortEl.dataManager = this.repeaterApi.dataManager;
      sortEl.fields = this.repeaterApi.fields ?? [];
    }
  }

  private registerHeaderListeners() {
    const searchInput = this.querySelector('.ac-repeater-search-input') as HTMLInputElement;
    const clearSearchBtn = this.querySelector('.ac-repeater-clear-search-btn') as HTMLElement;

    searchInput?.addEventListener('input', () => {
      this.delayedCallback.add({
        callback: () => {
          this.repeaterApi.dataManager.searchQuery = searchInput.value;
          this.repeaterApi.dataManager.refreshRows();
        },
        duration: 300,
        key: 'queryRepeaterRows',
      });
      clearSearchBtn.style.display = searchInput.value ? 'block' : 'none';
    });

    clearSearchBtn?.addEventListener('click', () => {
      searchInput.value = '';
      this.repeaterApi.dataManager.searchQuery = '';
      this.repeaterApi.dataManager.refreshRows();
      clearSearchBtn.style.display = 'none';
      searchInput.focus();
    });
  }
}

acRegisterCustomElement({ tag: AC_REPEATER_TAG.repeaterHeader, type: AcRepeaterHeaderElement });
