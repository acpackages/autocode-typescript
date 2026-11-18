/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcElementBase } from "../../../core/ac-element-base";
import { acAddClassToElement, acClearElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DATAGRID_HOOK } from "../_ac-datagrid.export";
import { AC_DATAGRID_CLASS_NAME } from "../consts/ac-datagrid-css-class-name.const";
import { AC_DATAGRID_ICON_CLASS } from "../consts/ac-datagrid-icon-class.const";
import { AC_DATAGRID_EXTENSION_NAME } from "../consts/ac-datagrid-extension-name.const";
import { AcDatagridApi } from "../core/ac-datagrid-api";

export class AcDatagridFooterElement extends AcElementBase {
  private _datagridApi?: AcDatagridApi;
  private isBound: boolean = false;

  get datagridApi(): AcDatagridApi | undefined {
    return this._datagridApi;
  }
  set datagridApi(value: AcDatagridApi | undefined) {
    this._datagridApi = value;
    if (this._datagridApi && this.isInitialized) {
      this.bindDatagridApi();
    }
  }

  searchInput!: HTMLInputElement;
  searchContainer!: HTMLElement;
  aggregatesContainer!: HTMLElement;
  buttonsContainer!: HTMLElement;
  settingsBtn!: HTMLElement;
  exportBtn?: HTMLElement;

  override init(): void {
    super.init();
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridFooter, element: this });

    this.searchInput = this.ownerDocument.createElement('input');
    this.searchContainer = this.ownerDocument.createElement('div');
    this.aggregatesContainer = this.ownerDocument.createElement('div');
    this.aggregatesContainer.className = 'ac-datagrid-footer-aggregates';
    this.aggregatesContainer.style.display = 'flex';
    this.aggregatesContainer.style.gap = '12px';
    this.aggregatesContainer.style.fontSize = '12px';
    this.aggregatesContainer.style.color = '#475569';

    this.buttonsContainer = this.ownerDocument.createElement('div');
    this.buttonsContainer.className = 'ac-datagrid-footer-buttons';
    this.buttonsContainer.style.display = 'flex';
    this.buttonsContainer.style.alignItems = 'center';
    this.buttonsContainer.style.gap = '4px';
    this.buttonsContainer.style.marginLeft = 'auto';

    this.searchInput.classList.add('ac-datagrid-search-input');
    this.searchInput.placeholder = "Search...";
    this.searchInput.style.padding = '4px 8px';
    this.searchInput.style.fontSize = '12px';
    this.searchInput.style.border = '1px solid #cbd5e1';
    this.searchInput.style.borderRadius = '4px';
    this.searchInput.addEventListener('input', () => {
      this.delayedCallback.add({
        callback: () => {
          if (this.datagridApi) {
            this.datagridApi.dataManager.searchQuery = this.searchInput.value;
            this.datagridApi.dataManager.refreshRows();
          }
        }, duration: 300, key: 'searchInput'
      });
    });

    this.exportBtn = this.ownerDocument.createElement('button');
    this.exportBtn.innerHTML = `<i class="${AC_DATAGRID_ICON_CLASS.download}"></i>`;
    this.exportBtn.setAttribute('type', 'button');
    this.exportBtn.title = 'Export Data';
    this.exportBtn.classList.add('ac-datagrid-footer-btn');
    this.exportBtn.addEventListener('click', () => {
      const ext: any =
        this.datagridApi?.extensions[AC_DATAGRID_EXTENSION_NAME.DataExport] ||
        this.datagridApi?.extensions[AC_DATAGRID_EXTENSION_NAME.DataExportXlsx] ||
        this.datagridApi?.extensions[AC_DATAGRID_EXTENSION_NAME.DataExportCsv];

      if (ext && ext.allowXlsxExport !== false) {
        this.datagridApi?.exportDataAsExcel({ fileName: ext.fileName });
      } else {
        this.datagridApi?.exportDataAsCsv({ fileName: ext?.fileName });
      }
    });

    this.settingsBtn = this.ownerDocument.createElement('button');
    this.settingsBtn.innerHTML = `<i class="${AC_DATAGRID_ICON_CLASS.settings}"></i>`;
    this.settingsBtn.setAttribute('type', 'button');
    this.settingsBtn.classList.add('ac-datagrid-footer-btn');
    this.settingsBtn.title = 'Customize Columns';
    this.settingsBtn.addEventListener('click', () => {
      this.datagridApi?.toggleSidePanel();
    });

    this.buttonsContainer.append(this.exportBtn);
    this.buttonsContainer.append(this.settingsBtn);

    this.append(this.aggregatesContainer);
    this.append(this.buttonsContainer);

    if (this.datagridApi) {
      this.bindDatagridApi();
    }
  }

  private bindDatagridApi() {
    if (!this.datagridApi || !this.isInitialized) return;
    this.setPagination();
    this.renderAggregates();
    this.renderExportButton();
    if (this.isBound) return;
    this.isBound = true;
    this.datagridApi.hooks.subscribe({
      hook: AC_DATAGRID_HOOK.DisplayedRowsChange,
      callback: () => {
        this.renderAggregates();
      }
    });
    this.datagridApi.hooks.subscribe({
      hook: AC_DATAGRID_HOOK.CellValueChange,
      callback: () => {
        this.renderAggregates();
      }
    });
    this.datagridApi.hooks.subscribe({
      hook: AC_DATAGRID_HOOK.UsePaginationChange,
      callback: () => {
        this.setPagination();
      }
    });
    this.datagridApi.hooks.subscribe({
      hook: AC_DATAGRID_HOOK.ExtensionEnable,
      callback: () => {
        this.renderExportButton();
      }
    });
    this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.FooterInit });
  }

  renderExportButton() {
    if (!this.datagridApi) return;
    const hasExportExt =
      this.datagridApi.extensions[AC_DATAGRID_EXTENSION_NAME.DataExport] ||
      this.datagridApi.extensions[AC_DATAGRID_EXTENSION_NAME.DataExportXlsx] ||
      this.datagridApi.extensions[AC_DATAGRID_EXTENSION_NAME.DataExportCsv];

    if (this.exportBtn) {
      if (!hasExportExt) {
        this.exportBtn.style.display = 'none';
      } else {
        this.exportBtn.style.display = '';
      }
    }
  }

  renderAggregates() {
    if (!this.datagridApi || !this.aggregatesContainer) return;
    acClearElement({ element: this.aggregatesContainer });
    const aggCols = this.datagridApi.datagridColumns.filter(c => c.columnDefinition.aggregate);
    if (aggCols.length === 0) {
      this.aggregatesContainer.style.display = 'none';
      return;
    }
    this.aggregatesContainer.style.display = 'flex';
    const aggValues = this.datagridApi.calculateAggregates(this.datagridApi.datagridRows);
    for (const col of aggCols) {
      const field = col.columnDefinition.field;
      const val = aggValues[field];
      if (val !== undefined) {
        const span = document.createElement('span');
        const formatted = typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(2)) : val;
        span.innerHTML = `<strong>${col.title || field}:</strong> ${formatted}`;
        this.aggregatesContainer.appendChild(span);
      }
    }
  }

  setPagination() {
    if (!this.datagridApi || !this.isInitialized) return;
    const pagination = this.datagridApi.pagination;
    if (this.datagridApi.usePagination && pagination) {
      if (!this.contains(pagination)) {
        this.insertBefore(pagination, this.aggregatesContainer || this.buttonsContainer || null);
      }
      if (!pagination.querySelector('.ac-pagination-left-container')) {
        pagination.init();
      }
      pagination.style.display = '';

      const rightContainer: HTMLElement | null = pagination.querySelector('.ac-pagination-right-container');
      if (rightContainer) {
        if (this.exportBtn && !rightContainer.contains(this.exportBtn)) {
          rightContainer.append(this.exportBtn);
        }
        if (this.settingsBtn && !rightContainer.contains(this.settingsBtn)) {
          rightContainer.append(this.settingsBtn);
        }
      }
      if (this.buttonsContainer) {
        this.buttonsContainer.style.display = 'none';
      }
    } else {
      if (pagination && this.contains(pagination)) {
        pagination.style.display = 'none';
      }
      if (this.buttonsContainer) {
        this.buttonsContainer.style.display = 'flex';
        if (this.exportBtn && !this.buttonsContainer.contains(this.exportBtn)) {
          this.buttonsContainer.append(this.exportBtn);
        }
        if (this.settingsBtn && !this.buttonsContainer.contains(this.settingsBtn)) {
          this.buttonsContainer.append(this.settingsBtn);
        }
      }
    }
  }
}

acRegisterCustomElement({ tag: 'ac-datagrid-footer', type: AcDatagridFooterElement });
